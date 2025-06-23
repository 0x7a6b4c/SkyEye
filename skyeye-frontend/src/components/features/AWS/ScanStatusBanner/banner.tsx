import React from "react"
import { useRouter } from "next/router"
import { cn } from "@/libs/utils" // Optional: your utility for conditional classNames

interface ScanStatusBannerProps {
  isFail: boolean
  sessionId?: string
}

const ScanStatusBanner: React.FC<ScanStatusBannerProps> = ({
  isFail,
  sessionId,
}) => {
  const router = useRouter()

  return (
    <div className="absolute left-[-20px] top-3 z-20 w-full flex justify-end">
      <div
        className={cn(
          "w-full max-w-[500px] px-5 py-3 rounded-xl shadow-sm flex items-center justify-between border",
          isFail
            ? "bg-red-50 border-red-300 text-red-800"
            : "bg-green-50 border-green-300 text-green-800",
        )}
      >
        <div className="flex items-center gap-2 text-sm sm:text-base">
          {isFail ? (
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span>
            {isFail
              ? "Scan failed. Check logs for more information."
              : "Scan completed successfully."}
          </span>
        </div>
        {sessionId && (
          <button
            onClick={() =>
              router.push(
                `/aws/scan-logs/${sessionId.split("_").slice(0, 2).join("_")}`,
              )
            }
            className={cn(
              "text-sm px-4 py-1.5 rounded-md text-white transition-colors",
              isFail
                ? "bg-red-300 hover:bg-red-500"
                : "bg-green-300 hover:bg-green-500",
            )}
          >
            View Logs
          </button>
        )}
      </div>
    </div>
  )
}

export default ScanStatusBanner
