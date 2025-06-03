import React from "react"
import { useSkeletonDelay } from "@/hooks/useSkeleton"
import { MIN_SKELETON_MS } from "@/constants/skeleton"

interface Props {
  /** your ‘loading’ flag */
  loading: boolean
  /** skeleton element to render while loading */
  fallback: React.ReactElement
  /** minimum skeleton time (ms) – default 150 */
  minMs?: number
  /** the real page content */
  children: React.ReactNode
}

export const SkeletonGate: React.FC<Props> = ({
  loading,
  fallback,
  minMs = MIN_SKELETON_MS,
  children,
}) => {
  const showSkeleton = useSkeletonDelay(loading, minMs)
  return showSkeleton ? fallback : <>{children}</>
}
