import React, { useEffect, useRef, useState } from 'react'

/**
 * Counts up from 0 to `value` once it scrolls into view. Accepts an
 * optional prefix/suffix (e.g. prefix="GH₵" suffix="+") and preserves
 * decimal places automatically based on `value`.
 *
 * Usage: <AnimatedCounter value={10000} suffix="+" />
 *        <AnimatedCounter value={5.0} suffix="★" />
 */
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1400 }) => {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const hasRun = useRef(false)
  const decimals = (String(value).split('.')[1] || '').length

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          const start = performance.now()
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
            setDisplay(value * eased)
            if (progress < 1) requestAnimationFrame(tick)
            else setDisplay(value)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref} className="zv-counter">
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}

export default AnimatedCounter
