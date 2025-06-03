import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MainLayout from "@/components/layouts/Main/MainLayout"
import { SessionData } from "@/libs/api"
import { useApi } from "@/hooks/useApi"
import ContentLoader from "react-content-loader"
import AccountGraph from "@/components/features/AWS/TreeGraph/AccountTree"
import { SkeletonGate } from "@/components/ui/Skeleton/SkeletonGate"

export interface CredentialSummary {
  userAccessKey: string
  userName?: string
}

export interface AccountSummary {
  accountId: string
  userIds: CredentialSummary[]
}

export const GraphSkeleton: React.FC = () => (
  <div className="w-full h-[90vh] flex items-center bg-[#f3f4f6] justify-center animate-pulse">
    <ContentLoader
      animate={true}
      speed={2}
      width="100%"
      height="90vh"
      backgroundColor="#e5e7eb"
      foregroundColor="#f3f4f6"
    >
      {/* random node rectangles */}
      <rect x="170" y="200" rx="6" ry="6" width="90" height="24" />
      <rect x="600" y="200" rx="6" ry="6" width="90" height="24" />
      <rect x="1000" y="200" rx="6" ry="6" width="90" height="24" />
      <rect x="900" y="280" rx="6" ry="6" width="130" height="24" />
      <rect x="1100" y="280" rx="6" ry="6" width="150" height="24" />
      <rect x="500" y="280" rx="6" ry="6" width="130" height="24" />
      <rect x="670" y="280" rx="6" ry="6" width="150" height="24" />
      <rect x="60" y="280" rx="6" ry="6" width="130" height="24" />
      <rect x="250" y="280" rx="6" ry="6" width="150" height="24" />
      <rect x="170" y="500" rx="6" ry="6" width="90" height="24" />
      <rect x="600" y="500" rx="6" ry="6" width="90" height="24" />
      <rect x="1000" y="500" rx="6" ry="6" width="90" height="24" />
      <rect x="900" y="580" rx="6" ry="6" width="130" height="24" />
      <rect x="1100" y="580" rx="6" ry="6" width="150" height="24" />
      <rect x="500" y="580" rx="6" ry="6" width="130" height="24" />
      <rect x="670" y="580" rx="6" ry="6" width="150" height="24" />
      <rect x="60" y="580" rx="6" ry="6" width="130" height="24" />
      <rect x="250" y="580" rx="6" ry="6" width="150" height="24" />
    </ContentLoader>
  </div>
)

export default function SessionPage() {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId?: string }
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const { getSession: fetchSession, loading } = useApi()

  useEffect(() => {
    if (!sessionId) return
    fetchSession(sessionId!).then((data) => {
      if (data) setSessionData(data)
    })
  }, [sessionId])

  return (
    <>
      <SkeletonGate loading={loading} fallback={<GraphSkeleton />}>
        <AccountGraph data={sessionData} sessionId={sessionId} />
      </SkeletonGate>
    </>
  )
}

SessionPage.Layout = MainLayout
