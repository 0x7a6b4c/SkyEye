import React, { LegacyRef } from "react"

const ScanLog = ({
  logs,
  logEndRef,
}: {
  logs: string[]
  logEndRef: LegacyRef<HTMLDivElement>
}) => {
  return (
    <div className="bg-black text-green-400 rounded-lg p-3 h-64 overflow-auto text-sm font-mono">
      {logs.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <div ref={logEndRef} />
    </div>
  )
}

export default ScanLog
