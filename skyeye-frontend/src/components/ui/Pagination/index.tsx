import classNames from "classnames"
import React from "react"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

import styles from "./Pagination.module.css"
import { usePagination } from "./usePagination"

export interface PaginationProps {
  onPageChange: (page: number) => void
  totalCount: number
  siblingCount?: number
  currentPage: number
  pageSize: number
  className?: string
}

function Pagination({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
}: PaginationProps) {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  })

  if (currentPage === 0 || paginationRange.length < 1) {
    return null
  }

  const onNext = () => {
    onPageChange(currentPage + 1)
  }

  const onPrevious = () => {
    onPageChange(currentPage - 1)
  }

  const lastPage = paginationRange[paginationRange.length - 1]
  const currentOffset = currentPage * pageSize

  return (
    <nav
      className={classNames(
        "pagination-container flex items-center flex-wrap justify-end",
        className,
      )}
    >
      <span
        className="px-2 text-sm text-gray-500"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `Showing ${(currentPage - 1) * pageSize + 1}~${currentOffset <= totalCount ? currentOffset : totalCount} out of ${totalCount}`,
        }}
      />
      <ul className={styles.list}>
        <li>
          <button
            className={styles.previous}
            type="button"
            onClick={onPrevious}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
        </li>
        <li>
          <button
            className={styles.next}
            type="button"
            onClick={onNext}
            disabled={currentPage === lastPage}
          >
            <FaChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
