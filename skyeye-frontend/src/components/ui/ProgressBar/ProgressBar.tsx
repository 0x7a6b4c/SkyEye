import React from "react"

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <>
      <h3 className="text-lg font-medium">Scanning in progress…</h3>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>{progress}%</p>
    </>
  )
}

export default ProgressBar
