import { useState, useEffect } from "react"

export function useOnlineStatus(): boolean {
  // Default to `true` so you don’t block everything during SSR.
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // On mount, set the actual initial status:
    setIsOnline(navigator.onLine)

    // Handlers to update state whenever the browser goes offline/online
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}
