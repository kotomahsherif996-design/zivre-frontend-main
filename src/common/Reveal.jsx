import React, { useEffect, useRef, useState } from 'react'

/**
 * Wraps any content and fades/rises it into view the first time it scrolls
 * into the viewport. Pure CSS transition (see .zv-reveal in zivre-redesign.css)
 * driven by a single IntersectionObserver per instance.
 *
 * Usage:
 *   <Reveal><div className="zv-why">...</div></Reveal>
 *   <Reveal delay={2} scale as="li">...</Reveal>
 */
const Reveal = ({ children, as: Tag = 'div', delay = 0, scale = false, className = '', ...rest }) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const classes = [
    'zv-reveal',
    delay ? `zv-reveal--${delay}` : '',
    scale ? 'zv-reveal--scale' : '',
    isVisible ? 'is-visible' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  )
}

export default Reveal
