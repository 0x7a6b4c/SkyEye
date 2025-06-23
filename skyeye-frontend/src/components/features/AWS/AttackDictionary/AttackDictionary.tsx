import React, { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuSearch,
} from "react-icons/lu"
import Select from "react-select"
import serviceOptions from "@/data/iam_all_service_list.json" assert { type: "json" }
import { ServiceOption } from "../TreeGraph/IAMPolicyTree"
import attackJsonRaw from "@/data/mitre_attack_aws_actions.json" assert { type: "json" }
const attackJson = attackJsonRaw as AttackJsonType

type AttackJsonType = {
  AWS_Actions: {
    [key: string]: {
      TTPs: string
      AbuseMethodology: string
      Commands: string[]
    }
  }
}

interface AwsAction {
  fullName: string
  service: string
  action: string
  TTPs: string
  AbuseMethodology: string
  Commands: string[]
}

const AttackDictionary = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Transform the data
  const transformedData: AwsAction[] = useMemo(() => {
    return Object.entries(attackJson?.AWS_Actions).map(([key, value]) => {
      const [service, action] = key.split(":")
      return {
        fullName: key,
        service,
        action,
        TTPs: value.TTPs,
        AbuseMethodology: value.AbuseMethodology,
        Commands: value.Commands,
      }
    })
  }, [])

  // Filter data based on search term and selected service
  const filteredData = useMemo(() => {
    return transformedData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.AbuseMethodology.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesService =
        selectedService === "all" || item.service === selectedService

      return matchesSearch && matchesService
    })
  }, [transformedData, searchTerm, selectedService])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedService])

  const handleSetQuery = (TTP: string) => {
    const parts = TTP.split(":")
    const deepestID = parts.at(-1)!

    const url =
      parts.length === 2
        ? `/mitre-attack-matrix?q=${deepestID}`
        : `/mitre-attack-matrix?q=${deepestID}&verbose=true`

    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Filters */}
        <div className="mb-6">
          <div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by action name or methodology..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select<ServiceOption, false>
                  placeholder="Filter by service..."
                  options={serviceOptions?.services as ServiceOption[]}
                  value={
                    (serviceOptions?.services as ServiceOption[]).find(
                      (opt) => opt.value === selectedService,
                    ) || null
                  }
                  onChange={(option) =>
                    setSelectedService(option ? option.value : "all")
                  }
                  isClearable
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-slate-600">
            Showing {paginatedData.length} of {filteredData.length} results
          </p>
        </div>

        {/* Table */}
        <div className="mb-6">
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      TTPs
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Abuse Methodology
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Commands
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.fullName}
                      className="hover:bg-slate-50 transition-colors bg-white"
                    >
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {item.service}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          onClick={() => handleSetQuery(item.TTPs)}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs text-foreground cursor-pointer"
                        >
                          {item.TTPs}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 max-w-md">
                          {item.AbuseMethodology}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {item.Commands.map((command, cmdIndex) => (
                            <code
                              key={cmdIndex}
                              className="block text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-800"
                            >
                              {command}
                            </code>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div>
            <div className="flex items-center justify-between p-6">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  <LuChevronsLeft className="h-4 w-4" />
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <LuChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <LuChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                  <LuChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* No results message */}
        {filteredData.length === 0 && (
          <div>
            <div className="text-center py-12">
              <p className="text-slate-500">
                No AWS actions found matching your criteria.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttackDictionary
