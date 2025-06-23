import path from "path"
import { useEffect, useRef, useState } from "react"

export default function useScanLogs(
  sessionId: string | null,
  isUpdate?: boolean, // new override argument
) {
  const [logs, setLogs] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  // autoscroll whenever a new line lands
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // connect / disconnect SSE
  useEffect(() => {
    if (!sessionId) return
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
    const url = isUpdate
      ? `${API_BASE}/update/${sessionId}/logs`
      : `${API_BASE}/sessions/${sessionId}/logs`
    const es = new EventSource(url)

    es.onmessage = (ev) => setLogs((prev) => [...prev, ev.data])
    es.onerror = () => es.close()

    return () => es.close()
  }, [sessionId, isUpdate])

  return { logs, logEndRef, setLogs }
}
