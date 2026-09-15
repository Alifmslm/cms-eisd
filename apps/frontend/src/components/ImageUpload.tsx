import { useEffect, useId, useRef, useState } from 'react'
import { ImageIcon, Loader2, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  /** Local object URL (file pick) or remote URL (paste). doubles as the form value. */
  previewUrl: string
  fileName: string
  /** True once the (mocked) upload finished. */
  uploaded: boolean
  /** Natural dimensions, recorded when aspect validation ran. */
  width?: number
  height?: number
}

export interface AspectRequirement {
  w: number
  h: number
  /** Relative tolerance, e.g. 0.02 accepts ±2%. Defaults to 0.02. */
  tolerance?: number
}

interface ImageUploadProps {
  id?: string
  value: UploadedImage | null
  onChange: (img: UploadedImage | null) => void
  /** Max file size in MB. Defaults to 5. */
  maxSizeMB?: number
  /** Required aspect ratio — rejects non-matching images with a clear error. */
  aspectRatio?: AspectRequirement
  /** Short hint shown under the picker, e.g. "16:9 required". */
  hint?: string
  invalid?: boolean
}

const MOCK_TICKS = 12
const MOCK_INTERVAL_MS = 100

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/** "1920×1080" → "16:9". Falls back to a 2-decimal ratio for odd sizes. */
function describeRatio(w: number, h: number): string {
  const d = gcd(w, h)
  const rw = w / d
  const rh = h / d
  return rw <= 32 && rh <= 32 ? `${rw}:${rh}` : `${(w / h).toFixed(2)}:1`
}

/** Resolves natural dimensions without CORS requirements (plain <img> load). */
function loadDimensions(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => reject(new Error('load-failed'))
    img.src = src
  })
}

/**
 * Task 11.3 + 11.4 prototype — backend-free.
 * File pick → type/size checks → aspect check (if required) → local preview
 * → mocked progress bar → "uploaded" state.
 * Swap the timer in `startMockUpload` for a real XHR/fetch with
 * `onUploadProgress` when the R2 endpoint lands (task 13.4). The backend
 * MUST re-validate aspect server-side (Sharp) — client checks are UX only.
 */
export function ImageUpload({
  id,
  value,
  onChange,
  maxSizeMB = 5,
  aspectRatio,
  hint,
  invalid,
}: ImageUploadProps) {
  const autoId = useId()
  const inputId = id ?? `img-upload-${autoId}`
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)
  const checkGen = useRef(0)
  const [progress, setProgress] = useState<number | null>(null)
  const [checking, setChecking] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const aspectLabel = aspectRatio ? `${aspectRatio.w}:${aspectRatio.h}` : null

  // Revoke object URLs + clear timer on unmount.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startMockUpload = (img: UploadedImage) => {
    stopTimer()
    setProgress(0)
    let tick = 0
    timerRef.current = window.setInterval(() => {
      tick += 1
      const pct = Math.min(100, Math.round((tick / MOCK_TICKS) * 100))
      setProgress(pct)
      if (pct >= 100) {
        stopTimer()
        onChange({ ...img, uploaded: true })
      }
    }, MOCK_INTERVAL_MS)
  }

  /** Runs the aspect gate; returns dimensions when accepted, null when rejected. */
  const checkAspect = async (
    src: string,
    gen: number,
  ): Promise<{ w: number; h: number } | null> => {
    if (!aspectRatio || !aspectLabel) return { w: 0, h: 0 }
    let dims: { w: number; h: number }
    try {
      dims = await loadDimensions(src)
    } catch {
      if (checkGen.current !== gen) return null
      setChecking(false)
      setLocalError('Couldn’t load that image to check its dimensions — try another file or URL.')
      return null
    }
    if (checkGen.current !== gen) return null
    const target = aspectRatio.w / aspectRatio.h
    const actual = dims.w / dims.h
    const tolerance = aspectRatio.tolerance ?? 0.02
    if (Math.abs(actual - target) / target > tolerance) {
      setChecking(false)
      setLocalError(
        `Wrong shape: that image is ${describeRatio(dims.w, dims.h)} (${dims.w}×${dims.h}px) — cover needs ${aspectLabel}. Pick a ${aspectLabel} image instead.`,
      )
      return null
    }
    return dims
  }

  const pickFile = (file: File | undefined) => {
    setLocalError(null)
    if (!file || checking) return
    if (!file.type.startsWith('image/')) {
      setLocalError(`“${file.name}” is not an image — pick a PNG, JPG, or WebP file.`)
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(
        `“${file.name}” is ${formatMB(file.size)} — over the ${maxSizeMB} MB limit. Pick a smaller file.`,
      )
      return
    }
    if (fileRef.current) fileRef.current.value = ''
    const previewUrl = URL.createObjectURL(file)
    const gen = ++checkGen.current
    if (!aspectRatio) {
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
      const img = { previewUrl, fileName: file.name, uploaded: false }
      onChange(img)
      setUrlDraft('')
      startMockUpload(img)
      return
    }
    // Aspect-gated: verify dimensions BEFORE showing preview / starting upload.
    setChecking(true)
    void (async () => {
      const dims = await checkAspect(previewUrl, gen)
      if (!dims) {
        URL.revokeObjectURL(previewUrl)
        return
      }
      if (checkGen.current !== gen) {
        URL.revokeObjectURL(previewUrl)
        return
      }
      setChecking(false)
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
      const img = { previewUrl, fileName: file.name, uploaded: false, width: dims.w, height: dims.h }
      onChange(img)
      setUrlDraft('')
      startMockUpload(img)
    })()
  }

  const applyUrl = () => {
    const url = urlDraft.trim()
    setLocalError(null)
    if (!url || checking) return
    if (!/^https?:\/\/.+\..+/.test(url)) {
      setLocalError('That URL doesn’t look valid — it should start with http(s)://.')
      return
    }
    const gen = ++checkGen.current
    if (!aspectRatio) {
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
      stopTimer()
      setProgress(null)
      onChange({ previewUrl: url, fileName: url, uploaded: true })
      return
    }
    setChecking(true)
    void (async () => {
      const dims = await checkAspect(url, gen)
      if (!dims || checkGen.current !== gen) return
      setChecking(false)
      if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
      stopTimer()
      setProgress(null)
      onChange({ previewUrl: url, fileName: url, uploaded: true, width: dims.w, height: dims.h })
    })()
  }

  const remove = () => {
    checkGen.current += 1
    stopTimer()
    setChecking(false)
    setProgress(null)
    setLocalError(null)
    setUrlDraft('')
    if (value?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(value.previewUrl)
    onChange(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const uploading = progress !== null && progress < 100

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => pickFile(e.target.files?.[0])}
        aria-invalid={invalid}
      />
      {!value ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={checking}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            pickFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center transition-colors hover:border-secondary hover:bg-muted/70 disabled:opacity-60',
            dragOver ? 'border-secondary bg-secondary/10' : 'border-border',
            invalid && 'border-destructive/60',
          )}
        >
          {checking ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="size-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {checking ? 'Checking image dimensions…' : 'Click to browse or drop an image here'}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, or WebP · max {maxSizeMB} MB
            {aspectLabel ? ` · ${aspectLabel} required` : ''}
            {hint ? ` · ${hint}` : ''}
          </span>
        </button>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="relative bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.previewUrl} alt={value.fileName} className="max-h-48 w-full object-contain" />
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={remove}
              title="Remove image"
              aria-label={`Remove ${value.fileName}`}
              className="absolute top-2 right-2 bg-background/90"
            >
              <X className="size-3" />
            </Button>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-border bg-background px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{value.fileName}</span>
              {uploading ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground tabular-nums">
                  <Loader2 className="size-3 animate-spin" /> {progress}%
                </span>
              ) : value.width && value.height ? (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {value.width}×{value.height} · {describeRatio(value.width, value.height)} ✓
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">Mock uploaded ✓</span>
              )}
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploading ? (progress ?? 0) : 100}
              aria-label="Upload progress"
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width]',
                  uploading ? 'bg-secondary' : 'bg-success',
                )}
                style={{ width: `${uploading ? (progress ?? 0) : 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!value && (
        <div className="flex gap-1.5">
          <Input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyUrl()
              }
            }}
            placeholder="…or paste an image URL"
            aria-label="Paste image URL"
            className="h-7 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={applyUrl} className="h-7 shrink-0">
            Use URL
          </Button>
        </div>
      )}

      {localError && (
        <p className="text-xs text-destructive" role="alert">
          {localError}
        </p>
      )}
    </div>
  )
}
