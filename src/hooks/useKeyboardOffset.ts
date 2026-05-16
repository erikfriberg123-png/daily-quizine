import { useEffect, useState } from 'react'

/**
 * Returns the height (in px) of the on-screen keyboard on mobile browsers.
 * Uses the visualViewport API — when the keyboard appears, the visual viewport
 * shrinks, and the difference is the keyboard height.
 */
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setOffset(kb)
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return offset
}
