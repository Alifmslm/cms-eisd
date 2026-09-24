import { useEffect, useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UploadedImage } from './ImageUpload'

export interface GalleryImage extends UploadedImage {
  key: string
}

interface GalleryUploadProps {
  value: GalleryImage[]
  onChange: (imgs: GalleryImage[]) => void
  /** Max images. V1 caps at 4 — the array shape lets V2 raise it without migration. */
  maxItems?: number
  /** Max file size in MB per image. Defaults to 5. */
  maxSizeMB?: number
}

const MOCK_TICKS = 12
const MOCK_INTERVAL_MS = 100

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Task 11.5 prototype — backend-free.
 * Multi pick → per-file type/size checks → local previews → per-item mocked
 * progress → reorder / remove. Hard-caps at `maxItems` with a clear notice
 * when the admin tries to exceed it. Real R2 persistence lands with the
 * backend (task 13.4); the `UploadedImage[]` value maps 1:1 to
 * `galleryImages[]` in the Event entity.
 */
export function GalleryUpload({ value, onChange, maxItems = 4, maxSizeMB = 5 }: GalleryUploadProps) {
  const autoId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const timers = useRef(new Map<string, number>())
  const onChangeRef = useRef(onChange)
  // Fresh-parent mirror so interval callbacks never close over stale arrays.
  const valueRef = useRef(value)
  useEffect(() => {
    onChangeRef.current = onChange
    valueRef.current = value
  })
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  // Thumbnail drag-reorder state (distinct from file-drop above).
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dropKey, setDropKey] = useState<string | null>(null)

  // Source of truth lives in the parent (`value`); timers/URLs cleaned on unmount.
  useEffect(
    () => () => {
      for (const id of timers.current.values()) window.clearInterval(id)
      timers.current.clear()
    },
    [],
  )

  const emit = (next: GalleryImage[]) => onChangeRef.current(next)
  const full = value.length >= maxItems

  const startMockUpload = (key: string) => {
    let tick = 0
    const id = window.setInterval(() => {
      tick += 1
      const pct = Math.min(100, Math.round((tick / MOCK_TICKS) * 100))
      if (pct >= 100) {
        const timer = timers.current.get(key)
        if (timer !== undefined) window.clearInterval(timer)
        timers.current.delete(key)
        setProgress((p) => {
          const next = { ...p }
          delete next[key]
          return next
        })
        const current = valueRef.current
        if (current.some((img) => img.key === key && !img.uploaded)) {
          emit(current.map((img) => (img.key === key ? { ...img, uploaded: true } : img)))
        }
      } else {
        setProgress((p) => ({ ...p, [key]: pct }))
      }
    }, MOCK_INTERVAL_MS)
    timers.current.set(key, id)
  }

  const addFiles = (files: FileList | File[] | undefined) => {
    if (!files) return
    const list = Array.from(files)
    if (list.length === 0) return
    const remaining = maxItems - value.length
    if (remaining <= 0) {
      setNotice({ kind: 'error', text: `Gallery is full — max ${maxItems} images. Remove one to add another.` })
      return
    }
    const problems: string[] = []
    const accepted: File[] = []
    for (const file of list) {
      if (!file.type.startsWith('image/')) {
        problems.push(`“${file.name}” is not an image — skipped.`)
        continue
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        problems.push(`“${file.name}” is ${formatMB(file.size)} (over ${maxSizeMB} MB) — skipped.`)
        continue
      }
      accepted.push(file)
    }
    const taken = accepted.slice(0, remaining)
    const skippedCount = list.length - taken.length - problems.length
    if (skippedCount > 0) {
      problems.push(
        `Only ${remaining} slot${remaining === 1 ? '' : 's'} left — ${skippedCount} extra file${skippedCount === 1 ? '' : 's'} skipped (max ${maxItems}).`,
      )
    }
    setNotice(
      problems.length > 0
        ? { kind: 'error', text: problems.join(' ') }
        : taken.length > 0
          ? null
          : { kind: 'info', text: 'No new images added.' },
    )
    if (taken.length === 0) return
    const fresh: GalleryImage[] = taken.map((file) => ({
      key: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      uploaded: false,
    }))
    emit([...value, ...fresh])
    for (const img of fresh) startMockUpload(img.key)
    if (fileRef.current) fileRef.current.value = ''
  }

  const remove = (key: string) => {
    const timer = timers.current.get(key)
    if (timer !== undefined) window.clearInterval(timer)
    timers.current.delete(key)
    setProgress((p) => {
      const next = { ...p }
      delete next[key]
      return next
    })
    const target = value.find((img) => img.key === key)
    if (target?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl)
    setNotice(null)
    emit(value.filter((img) => img.key !== key))
  }

  const move = (key: string, dir: -1 | 1) => {
    const idx = value.findIndex((img) => img.key === key)
    const swapWith = idx + dir
    if (idx < 0 || swapWith < 0 || swapWith >= value.length) return
    const next = [...value]
    ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
    emit(next)
  }

  // Drag-to-reorder: drop the dragged thumb onto another to take its slot.
  const reorder = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return
    const from = value.findIndex((img) => img.key === fromKey)
    const to = value.findIndex((img) => img.key === toKey)
    if (from < 0 || to < 0) return
    const next = [...value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    emit(next)
  }

  const isFileDrag = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxItems} images
          {full ? ' — gallery full' : ` — ${maxItems - value.length} slot${maxItems - value.length === 1 ? '' : 's'} left`}
        </p>
      </div>
      <input
        ref={fileRef}
        id={`gallery-upload-${autoId}`}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files ?? undefined)}
      />
      <div
        onDragOver={(e) => {
          if (!isFileDrag(e)) return
          e.preventDefault()
          if (!full) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!isFileDrag(e)) return
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'grid grid-cols-2 gap-2 rounded-lg border border-dashed p-2 transition-colors sm:grid-cols-4',
          dragOver ? 'border-secondary bg-secondary/10' : 'border-border bg-muted/20',
        )}
      >
        {value.map((img, idx) => {
          const pct = progress[img.key]
          const uploading = pct !== undefined
          return (
            <div
              key={img.key}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', img.key)
                e.dataTransfer.effectAllowed = 'move'
                setDragKey(img.key)
              }}
              onDragEnd={() => {
                setDragKey(null)
                setDropKey(null)
              }}
              onDragOver={(e) => {
                if (isFileDrag(e) || dragKey === null || dragKey === img.key) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                setDropKey(img.key)
              }}
              onDragLeave={() => {
                setDropKey((k) => (k === img.key ? null : k))
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (dragKey) reorder(dragKey, img.key)
                setDragKey(null)
                setDropKey(null)
              }}
              title="Drag to reorder"
              className={cn(
                'group relative cursor-grab overflow-hidden rounded-md border border-border bg-background active:cursor-grabbing',
                dragKey === img.key && 'opacity-40',
                dropKey === img.key && 'ring-2 ring-secondary ring-offset-1',
              )}
            >
              <div className="aspect-square w-full bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.fileName}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1 border-t border-border px-1.5 py-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => move(img.key, -1)}
                  disabled={idx === 0}
                  title="Move left"
                  aria-label={`Move ${img.fileName} earlier`}
                  className="size-5"
                >
                  <ChevronLeft className="size-3" />
                </Button>
                <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground" title={img.fileName}>
                  {uploading ? `${pct}%` : img.uploaded ? '✓' : '…'} {img.fileName}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => move(img.key, 1)}
                  disabled={idx === value.length - 1}
                  title="Move right"
                  aria-label={`Move ${img.fileName} later`}
                  className="size-5"
                >
                  <ChevronRight className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => remove(img.key)}
                  title="Remove image"
                  aria-label={`Remove ${img.fileName}`}
                  className="size-5 hover:text-destructive"
                >
                  <X className="size-3" />
                </Button>
              </div>
              {uploading && (
                <div
                  className="absolute inset-x-0 bottom-0 h-1 bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`Uploading ${img.fileName}`}
                >
                  <div className="h-full bg-secondary transition-[width]" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })}
        {!full ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-secondary hover:text-foreground"
          >
            <Plus className="size-5" />
            <span className="px-2 text-center text-[11px] font-medium">Add images</span>
            <span className="text-[10px]">or drop files here</span>
          </button>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-border bg-muted/40 px-2 text-center">
            <span className="text-[11px] font-medium text-muted-foreground">Gallery full</span>
            <span className="text-[10px] text-muted-foreground">Remove one to add another (max {maxItems})</span>
          </div>
        )}
      </div>
      {notice && (
        <p
          className={notice.kind === 'error' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.text}
        </p>
      )}
    </div>
  )
}
