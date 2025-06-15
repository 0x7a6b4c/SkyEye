import { LuCopy } from "react-icons/lu"
import { useState } from "react"

interface Props {
  sessionId?: string
  mode?: string
}

export default function SessionBanner({ sessionId, mode }: Props) {
  const [copied, setCopied] = useState(false)

  // derive a formatted timestamp without mode suffix
  const formattedTimestamp = sessionId
    ? (() => {
        const match = sessionId.match(
          /^(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})/,
        )
        if (match) {
          const [, date, time] = match
          return `${date} ${time.replace(/-/g, ":")}`
        }
        return sessionId
      })()
    : ""

  const copyToClipboard = () => {
    if (!sessionId) return
    navigator.clipboard.writeText(formattedTimestamp || sessionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div
      className="absolute left-4 top-3 z-20
                    flex flex-col gap-1
                    rounded-2xl px-4 py-3
                    backdrop-blur-md/60
                    width-
                    bg-white/40 dark:bg-slate-800/40
                    border border-white/50 dark:border-slate-700/50
                    shadow-lg shadow-slate-900/10 select-none"
    >
      {/* label + copy button */}
      <div
        className="flex items-center gap-2 text-xs font-medium
                      text-slate-800 dark:text-slate-200"
      >
        <span className="uppercase tracking-wide">Session</span>
        <button
          onClick={copyToClipboard}
          title="Copy full session ID"
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <LuCopy size={14} />
        </button>
      </div>

      {/* shortened ID */}
      {sessionId && (
        <span
          className="text-sm font-semibold
                       text-slate-900 dark:text-slate-100"
        >
          {formattedTimestamp}
        </span>
      )}

      {/* mode pill */}
      {mode == "singleFuzz" && (
        <span
          className="mt-1 flex justify-center items-center text-[11px] px-2 py-[1px]
                         rounded-full bg-primary text-white
                   "
        >
          Mode: Single Scanning / Separate Entity / Fuzz
        </span>
      )}
      {mode == "cross" && (
        <span
          className="mt-1 flex justify-center items-center text-[11px] px-2 py-[1px]
                         rounded-full bg-primary text-white
                   "
        >
          Mode: Multi Scanning / Cross Entity
        </span>
      )}
      {mode == "separate" && (
        <span
          className="mt-1 flex justify-center items-center text-[11px] px-2 py-[1px]
                         rounded-full bg-primary text-white
                   "
        >
          Mode: Multi Scanning / Separate Entity
        </span>
      )}
      {mode == "single" && (
        <span
          className="mt-1 flex justify-center items-center text-[11px] px-2 py-[1px]
                         rounded-full bg-primary text-white
                   "
        >
          Mode: Single Scanning / Separate Entity
        </span>
      )}

      {/* copied toast */}
      {copied && (
        <span
          className="absolute top-[10px] left-1/2 -translate-x-1/2
                     bg-slate-900 text-white text-[11px] px-2 py-[2px]
                     rounded-md animate-fade-in-out
                     duration-200
                     opacity-1 pointer-events-none"
        >
          Copied!
        </span>
      )}
    </div>
  )
}
