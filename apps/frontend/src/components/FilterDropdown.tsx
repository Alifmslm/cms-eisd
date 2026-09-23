import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface FilterDropdownProps<T extends string> {
  label: string
  value: T
  options: readonly T[]
  onPick: (value: T) => void
  /** Menu placement. `up` floats above the button (avoids covering content below). */
  direction?: 'down' | 'up'
  align?: 'left' | 'right'
}

/** Compact dropdown used for list-page filters (status, publish state, …). */
export function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onPick,
  direction = 'down',
  align = 'left',
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open ])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className="flex h-7 items-center gap-1.5 rounded-md bg-transparent pr-1 pl-1 text-xs focus:outline-none"
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
        <ChevronDown
          className={`size-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute z-30 mt-1 min-w-36 rounded-lg border border-border bg-white p-1 shadow-lg ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {options.map((o) => {
            const selected = o === value
            return (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onPick(o)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  selected
                    ? 'bg-secondary/10 font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {o}
                {selected && <Check className="size-3.5 text-secondary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
