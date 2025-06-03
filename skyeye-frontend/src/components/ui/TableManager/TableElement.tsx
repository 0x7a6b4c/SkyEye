import classNames from "classnames"
import { Table } from "flowbite-react"
import React, { ReactNode } from "react"

import NoDataRow from "./NoDataRow"
import { defaultPage } from "@/configs/pagination"
import { useDataProvider } from "@/libs/context/DataProvider"
import { OrderType } from "@/types/request"

import styles from "./TableManager.module.css"

export interface ColumnConfig<T> {
  field: string
  label: string
  labelClassName?: string
  defaultValue?: string | number
  sortable?: boolean
  className?: string
  render?: (item: T) => ReactNode
}

export interface TableElementProps<T> {
  columns: ColumnConfig<T>[]
}

export default function TableElement<T extends { id: string }>({
  columns,
}: TableElementProps<T>) {
  const { data, filter, setFilter } = useDataProvider<T>()

  const renderValue = (
    item: T,
    { field, defaultValue, render }: ColumnConfig<T>,
  ) => {
    if (render) {
      return render(item)
    }
    const value = item[field as keyof typeof item]
    if (value !== undefined && value !== null) {
      return value as unknown as string
    }

    if (defaultValue !== undefined) {
      return defaultValue
    }

    return ""
  }

  const handleSort = (sortField: string) => {
    let orderValue: OrderType = "asc"
    if (filter?.sort === sortField) {
      orderValue = filter?.order === "asc" ? "desc" : "asc"
    }

    setFilter({
      ...filter,
      page: defaultPage,
      sort: sortField,
      order: orderValue,
    })
  }

  return (
    <Table hoverable>
      <Table.Head>
        {columns.map(({ field, label, labelClassName, sortable = true }) => (
          <Table.HeadCell
            className={classNames(
              "whitespace-nowrap",
              { [styles.sortColumn]: sortable },
              {
                [styles.sortDown]:
                  filter?.sort === field && filter?.order === "desc",
              },
              {
                [styles.sortUp]:
                  filter?.sort === field && filter?.order === "asc",
              },
              labelClassName,
            )}
            key={field}
            onClick={() => sortable && handleSort(field)}
          >
            <span className={styles.sortColumnIcon}>{label}</span>
          </Table.HeadCell>
        ))}
      </Table.Head>
      <Table.Body className="divide-y">
        {data?.records?.map((item) => (
          <Table.Row
            key={item.id}
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {columns.map((columnConfig) => (
              <Table.Cell
                key={columnConfig.field}
                className={columnConfig.className}
              >
                {renderValue(item as T, columnConfig)}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
        {data?.records?.length === 0 && <NoDataRow />}
      </Table.Body>
    </Table>
  )
}
