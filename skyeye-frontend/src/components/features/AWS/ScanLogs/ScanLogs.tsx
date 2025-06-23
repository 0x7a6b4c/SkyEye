import { useState } from "react"
import Link from "next/link"
import { LuCalendar, LuSearch, LuEye, LuDownload, LuX } from "react-icons/lu"
import { ScanLogSummary } from "@/libs/api"
import { Input } from "@/components/ui/input"
import { Select } from "flowbite-react"
import { useApi } from "@/hooks/useApi"

const ScanLogs = ({ logData }: { logData: ScanLogSummary[] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { downloadScanLogFile } = useApi()

  const filteredData = logData.filter((record) => {
    const matchesSearch =
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm)
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

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

  const triggerDownload = async (timestamp: string) => {
    const blob = await downloadScanLogFile(timestamp)
    if (!blob) return

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scanningSession_${timestamp}.log` // Adjust file type if needed
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 p-2">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

          <Input
            placeholder="Search by scan ID or date..."
            value={searchTerm} // or filterText, depending on your state
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10" /* ⇠ add right-padding so the X isn’t on text */
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <LuX className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select
          className="focus:ring-2 focus:ring-blue-400"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Scan ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Date & Time
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Type
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Duration
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr
                key={record.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-sm text-gray-900">
                  {record.id}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <LuCalendar className="w-4 h-4" />
                    <span>
                      {record.date} {record.time}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                  {record.type} entities
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {record.duration}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Link
                      href={`/aws/scan-logs/${record.date}_${record.time.replace(
                        /:/g,
                        "-",
                      )}`}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View detailed log"
                    >
                      <LuEye className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Download scan"
                      onClick={() =>
                        triggerDownload(
                          `${record.date}_${record.time.replace(/:/g, "-")}`,
                        )
                      }
                    >
                      <LuDownload className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No scan records found matching your criteria.
        </div>
      )}
    </div>
  )
}

export default ScanLogs
