import React, { useEffect, useState } from "react"
import MainLayout from "@/components/layouts/Main/MainLayout"
import { useApi } from "@/hooks/useApi"
import { ScanLogSummary } from "@/libs/api"
import ScanLogs from "@/components/features/AWS/ScanLogs/ScanLogs"

export default function AccountPage() {
  const [logsData, setLogsData] = useState<ScanLogSummary[] | null>(null)
  const { getScanLogs: fetchLogs, loading } = useApi()

  useEffect(() => {
    fetchLogs().then((data) => {
      if (data) setLogsData(data)
    })
  }, [])

  return (
    <>
      <div className="space-y-6 p-6 mt-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scan History
          </h2>
          {logsData && <ScanLogs logData={logsData} />}
        </div>
      </div>
    </>
  )
}

AccountPage.Layout = MainLayout
