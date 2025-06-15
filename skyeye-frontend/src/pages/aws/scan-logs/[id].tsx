import React, { useEffect, useState } from "react"
import MainLayout from "@/components/layouts/Main/MainLayout"
import { useApi } from "@/hooks/useApi"
import { ScanLogSummary } from "@/libs/api"
import { useRouter } from "next/router"
import ScanLogDetail from "@/components/features/AWS/ScanLogs/ScanLogDetail"

export default function AccountPage() {
  const router = useRouter()
  const { id } = router.query
  const scanId = Array.isArray(id) ? id[0] : id
  const [logDetail, setLogDetail] = useState<ScanLogSummary | null>(null)
  const { getScanLogDetail: fetchLogDetail, loading } = useApi()
  useEffect(() => {
    if (scanId) {
      fetchLogDetail(scanId).then((data) => {
        if (data) setLogDetail(data)
      })
    }
  }, [scanId])

  return <>{logDetail && <ScanLogDetail logData={logDetail} />}</>
}

AccountPage.Layout = MainLayout
