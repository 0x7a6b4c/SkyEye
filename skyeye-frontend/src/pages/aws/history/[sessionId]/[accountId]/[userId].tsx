import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MainLayout from "@/components/layouts/Main/MainLayout"
import { useApi } from "@/hooks/useApi"
import { IAMData } from "@/types/IAM/enums"
import IAMPolicyTree from "@/components/features/AWS/TreeGraph/IAMPolicyTree"
import { SkeletonGate } from "@/components/ui/Skeleton/SkeletonGate"
import { GraphSkeleton } from ".."

export default function AccountPage() {
  const router = useRouter()
  const { sessionId, accountId, userId, mode } = router.query as {
    sessionId?: string
    accountId?: string
    userId?: string
    mode?: string
  }

  const [userData, setUserData] = useState<IAMData | null>(null)
  const { getUser: fetchUser, loading } = useApi()

  useEffect(() => {
    // only run if we have all three IDs
    if (!sessionId || !accountId || !userId) return

    // if mode === "fuzz", pass it as a fourth arg; otherwise omit
    if (mode === "fuzz") {
      fetchUser(sessionId, accountId, userId, mode).then((data) => {
        if (data) setUserData(data)
      })
    } else {
      fetchUser(sessionId, accountId, userId, "scan").then((data) => {
        if (data) setUserData(data)
      })
    }
  }, [sessionId, accountId, userId, mode])

  return (
    <SkeletonGate loading={loading || !userData} fallback={<GraphSkeleton />}>
      <IAMPolicyTree iamData={userData as IAMData} />
    </SkeletonGate>
  )
}

AccountPage.Layout = MainLayout
