import { useEffect, useRef, useState } from "react"

/**
 * Returns `true` while you should still show a skeleton.
 *
 * @param loading   the same flag your data-fetch hook gives you
 * @param minMs     minimum time (ms) the skeleton must stay on screen
 */
export function useSkeletonDelay(loading: boolean, minMs = 150): boolean {
  const [show, setShow] = useState<boolean>(loading)
  const startRef = useRef<number | null>(loading ? performance.now() : null)

  useEffect(() => {
    if (loading) {
      // request (re)started
      if (startRef.current === null) startRef.current = performance.now()
      setShow(true)
    } else {
      // request finished – honour minimum display window
      const begun = startRef.current ?? performance.now()
      const elapsed = performance.now() - begun
      const remaining = Math.max(minMs - elapsed, 0)

      const t = window.setTimeout(() => {
        setShow(false)
        startRef.current = null
      }, remaining)

      return () => clearTimeout(t)
    }
  }, [loading, minMs])

  return show
}
