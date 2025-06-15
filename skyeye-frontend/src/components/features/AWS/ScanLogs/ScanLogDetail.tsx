import Link from "next/link"
import {
  LuArrowLeft,
  LuInfo,
  LuCalendar,
  LuTimer,
  LuSettings,
} from "react-icons/lu"
import { IoMdCheckmarkCircle } from "react-icons/io"
import { IoAlertCircleOutline } from "react-icons/io5"
import { FaRegCircleXmark } from "react-icons/fa6"
import { ScanLogSummary } from "@/libs/api"

const ScanLogDetail = ({ logData }: { logData: ScanLogSummary }) => {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "INFO":
        return <LuInfo className="w-4 h-4 text-blue-600" />
      case "WARNING":
        return <IoAlertCircleOutline className="w-4 h-4 text-yellow-600" />
      case "ERROR":
        return <FaRegCircleXmark className="w-4 h-4 text-red-600" />
      case "DEBUG":
        return <IoMdCheckmarkCircle className="w-4 h-4 text-green-600" />
      default:
        return <div className="w-4 h-4 bg-gray-600 rounded-full" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "border-blue-200 bg-blue-50"
      case "WARNING":
        return "border-yellow-200 bg-yellow-50"
      case "ERROR":
        return "border-red-200 bg-red-50"
      case "DEBUG":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/aws/scan-logs"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Back to Scan Logs</span>
        </Link>

        {logData && (
          <div className="text-sm text-gray-500">
            Scan ID:{" "}
            <span className="font-mono font-medium text-gray-900">
              {logData.id}
            </span>
          </div>
        )}
      </div>

      {/* No Data */}
      {!logData ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8 text-gray-500">
            Scan log not found.
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Scan Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryItem
                icon={<LuCalendar className="w-5 h-5 text-gray-500" />}
                label="Date & Time"
                value={`${logData.date} ${logData.time}`}
              />
              <SummaryItem
                icon={<IoMdCheckmarkCircle className="w-5 h-5 text-gray-500" />}
                label="Status"
                value={
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(logData.status)}`}
                  >
                    {logData.status}
                  </span>
                }
              />
              <SummaryItem
                icon={<LuTimer className="w-5 h-5 text-gray-500" />}
                label="Duration"
                value={logData.duration}
              />
              <SummaryItem
                icon={<LuSettings className="w-5 h-5 text-gray-500" />}
                label="Type"
                value={`${logData.type} entities`}
              />
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Scan Log
            </h2>
            <div className="space-y-2">
              {logData.logs.map((log, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">
                              {log.timestamp}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                log.level === "INFO"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.level === "WARNING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : log.level === "ERROR"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              [{log.level}]
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-mono">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SummaryItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) => (
  <div className="flex items-center space-x-3">
    {icon}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

export default ScanLogDetail
