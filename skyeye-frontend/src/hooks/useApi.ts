import { useState } from "react"
import { toast } from "react-toastify"
import {
  getSessions as apiGetSessions,
  postScan as apiPostScan,
  getSessionData as apiGetSessionData,
  getScanStatus as apiGetScanStatus,
  getUserData as apiGetUserData,
  postUpdate as apiPostUpdate,
  getUpdateStatus as apiGetUpdateStatus,
  // new scan log methods
  getScanLogs as apiGetScanLogs,
  getScanLogDetail as apiGetScanLogDetail,
  fetchScanLogFile as apiFetchScanLogFile,
  SessionData,
} from "@/libs/api"
import { IAMData } from "@/types/IAM/enums"

export function useApi() {
  const [loading, setLoading] = useState(false)

  const getSessions = async (): Promise<string[] | null> => {
    setLoading(true)
    try {
      return await apiGetSessions()
    } catch (err: any) {
      toast.error(err.message || "Failed to load sessions")
      return null
    } finally {
      setLoading(false)
    }
  }

  const startScan = async (payload: any): Promise<string | null> => {
    setLoading(true)
    try {
      const { session_id } = await apiPostScan(payload)
      toast.success("Scan started: " + session_id)
      return session_id
    } catch (err: any) {
      toast.error(err.message || "Failed to start scan")
      return null
    } finally {
      setLoading(false)
    }
  }

  const triggerUpdate = async (payload: any): Promise<string | null> => {
    setLoading(true)
    try {
      const { update_id } = await apiPostUpdate(payload)
      toast.success("Update started: " + update_id)
      return update_id
    } catch (err: any) {
      toast.error(err.message || "Failed to start update")
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUpdateStatus = async (
    updateId: string,
  ): Promise<"running" | "completed" | "failed" | null> => {
    setLoading(true)
    try {
      const { status } = await apiGetUpdateStatus(updateId)
      return status as "running" | "completed" | "failed"
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch update status")
      return null
    } finally {
      setLoading(false)
    }
  }

  const getSession = async (sessionId: string): Promise<SessionData | null> => {
    setLoading(true)
    try {
      return await apiGetSessionData(sessionId)
    } catch (err: any) {
      toast.error(err.message || `Failed to load session ${sessionId}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUser = async (
    sessionId: string,
    accountId: string,
    userId: string,
    mode?: string,
  ): Promise<IAMData | null> => {
    setLoading(true)
    try {
      return await apiGetUserData(sessionId, accountId, userId, mode)
    } catch (err: any) {
      toast.error(
        err.message || `Failed to load user ${userId} in session ${sessionId}`,
      )
      return null
    } finally {
      setLoading(false)
    }
  }

  const getStatus = async (
    sessionId: string,
  ): Promise<"running" | "completed" | "failed" | null> => {
    setLoading(true)
    try {
      const { status } = await apiGetScanStatus(sessionId)
      return status as "running" | "completed" | "failed"
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch scan status")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary of all scan logs
  const getScanLogs = async (): Promise<any[] | null> => {
    setLoading(true)
    try {
      return await apiGetScanLogs()
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch scan logs summary")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch detailed scan log by timestamp
  const getScanLogDetail = async (timestamp: string): Promise<any | null> => {
    setLoading(true)
    try {
      return await apiGetScanLogDetail(timestamp)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch scan log detail")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Download raw scan log file
  const downloadScanLogFile = async (
    timestamp: string,
  ): Promise<Blob | null> => {
    setLoading(true)
    try {
      return await apiFetchScanLogFile(timestamp)
    } catch (err: any) {
      toast.error(err.message || "Failed to download scan log file")
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    getSessions,
    startScan,
    getSession,
    getStatus,
    getUser,
    triggerUpdate,
    getUpdateStatus,
    // new scan log hooks
    getScanLogs,
    getScanLogDetail,
    downloadScanLogFile,
  }
}
