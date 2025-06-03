import React, { createContext, useContext, useState, useEffect } from "react"
import { useApi } from "@/hooks/useApi"

interface ScanHistoryContextProps {
  sessions: string[]
  refresh: () => void
  addSession: (sessionId: string) => void
}

const ScanHistoryContext = createContext<ScanHistoryContextProps | undefined>(
  undefined,
)

export const ScanHistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<string[]>([])
  const { getSessions, loading } = useApi()

  const fetchSessions = async () => {
    const data = await getSessions()
    if (data) setSessions(data)
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const refresh = () => fetchSessions()
  const addSession = (sessionId: string) =>
    setSessions((prev) => [sessionId, ...prev])

  return (
    <ScanHistoryContext.Provider value={{ sessions, refresh, addSession }}>
      {children}
    </ScanHistoryContext.Provider>
  )
}

export const useScanHistory = () => {
  const ctx = useContext(ScanHistoryContext)
  if (!ctx) {
    throw new Error("useScanHistory must be used within ScanHistoryProvider")
  }
  return ctx
}
