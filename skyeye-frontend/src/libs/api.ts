import { IAMData, IAMScanMode } from "@/types/IAM/enums"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
export { API_URL }

const api = axios.create({
  baseURL: API_URL,
})

// Fetch list of session IDs
export const getSessions = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/sessions")
  return data
}

// Start a new scan
export const postScan = async (
  payload: any,
): Promise<{ session_id: string }> => {
  const { data } = await api.post<{ session_id: string }>("/scan", payload)
  return data
}

export const postUpdate = async (
  payload: any,
): Promise<{ update_id: string }> => {
  const { data } = await api.post<{ update_id: string }>("/update", payload)
  return data
}
// Fetch session summary
export interface CredentialSummary {
  userAccessKey: string
  userName?: string
}
export interface AccountSummary {
  accountId: string
  userIds: CredentialSummary[]
}
export interface SessionData {
  mode: IAMScanMode
  accounts: AccountSummary[]
}
export const getSessionData = async (
  sessionId: string,
): Promise<SessionData> => {
  const { data } = await api.get<SessionData>(`/sessions/${sessionId}`)
  return data
}

export const getUserData = async (
  sessionId: string,
  accountId: string,
  userId: string,
  mode?: string,
): Promise<IAMData> => {
  const { data } = await api.get<IAMData>(
    `/sessions/${sessionId}/${accountId}/${userId}` +
      `${mode ? `?mode=${mode}` : ""}`,
  )
  return data
}

// Fetch scan status (may be 'running', 'completed', or 'failed')
export const getScanStatus = async (
  sessionId: string,
): Promise<{ status: "running" | "completed" | "failed" }> => {
  const { data } = await api.get<{
    status: "running" | "completed" | "failed"
  }>(`/sessions/${sessionId}/status`)
  return data
}

export const getUpdateStatus = async (
  updateId: string,
): Promise<{ status: "running" | "completed" | "failed" }> => {
  const { data } = await api.get<{
    status: "running" | "completed" | "failed"
  }>(`/update/${updateId}/status`)
  return data
}

// Scan logs summary
export interface logDetail {
  timestamp: string
  level: string
  message: string
}
export interface ScanLogSummary {
  id: string
  date: string
  time: string
  status: string
  duration: string
  type: string
  logs: logDetail[]
}
export const getScanLogs = async (): Promise<ScanLogSummary[]> => {
  const { data } = await api.get<ScanLogSummary[]>("/scan/logs")
  return data
}

// Scan log detail
export interface ScanLogDetail extends ScanLogSummary {
  entities: number
  logs: Array<{ timestamp: string; level: string; message: string }>
}
export const getScanLogDetail = async (
  timestamp: string,
): Promise<ScanLogDetail> => {
  const { data } = await api.get<ScanLogDetail>(
    `/scan/logs/${timestamp}/detail`,
  )
  return data
}

// Download raw scan log file as blob
export const fetchScanLogFile = async (timestamp: string): Promise<Blob> => {
  const response = await api.get<Blob>(`/scan/logs/${timestamp}`, {
    responseType: "blob",
  })
  return response.data
}
