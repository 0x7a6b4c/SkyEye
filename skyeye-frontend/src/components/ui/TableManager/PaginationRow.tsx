import classNames from "classnames"
import React from "react"

import Pagination from "@/components/ui/Pagination"
import SelectCustom from "@/components/ui/SelectCustom"
import {
  defaultLimit,
  defaultPage,
  defaultTotal,
  pageSizes,
} from "@/configs/pagination"
import { useDataProvider } from "@/libs/context/DataProvider"

interface PaginationRowProps {
  className?: string
  defaultPosition?: string
}

export default function PaginationRow({
  className,
  defaultPosition,
}: PaginationRowProps) {
  const { filter, setFilter, data } = useDataProvider<{
    id: string
  }>()

  const handleChangePage = (page: number) => {
    setFilter({ ...filter, page })
  }

  const handleChangePageSize = (pageSize: string | number) => {
    setFilter({
      ...filter,
      page: defaultPage,
      limit: parseInt(pageSize.toString(), 10),
    })
  }

  return (
    <div
      className={classNames("flex items-center justify-end gap-y-3", className)}
    >
      <Pagination
        className="ml-auto"
        currentPage={data?.page || defaultPage}
        pageSize={data?.limit || defaultLimit}
        totalCount={data?.total || defaultTotal}
        onPageChange={handleChangePage}
      />
      <div className="ml-auto flex items-center sm:ml-0">
        <p className="mx-2 text-xs text-gray-500">
          {"Number of results to display:"}
        </p>
        <SelectCustom
          selected={filter?.limit}
          wrapperClassName="ml-auto sm:ml-0"
          onChange={handleChangePageSize}
          name="page_size"
          options={pageSizes.map((pageSize) => ({
            label: `${pageSize}Results`,
            value: pageSize,
          }))}
          defaultPosition={defaultPosition}
        />
      </div>
    </div>
  )
}
