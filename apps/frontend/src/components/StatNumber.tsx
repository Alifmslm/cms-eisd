import { useEffect, useState } from 'react'

// Count-up for stat-card totals: eases from 0 to the loaded value on page
// entry so the landing reads softly instead of flashing numbers in.
// rAF-driven (text only, tabular-nums so width never shifts); instant when
// prefers-reduced-motion is set. Shared by Dashboard and Events so both
// pages speak the same motion language.
export function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return display
}

export function StatNumber({ value }: { value: number }) {
  const display = useCountUp(value)
  return (
    <p className="stat-number-in text-2xl font-semibold tabular-nums">{display}</p>
  )
}
