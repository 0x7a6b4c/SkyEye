import { Button, Card, Checkbox, Tooltip } from "flowbite-react"
import React, { useState } from "react"
import { BsInfoLg } from "react-icons/bs"
import { HiOutlinePencil } from "react-icons/hi"

import ButtonLink from "@/components/ui/ButtonLink"
import LinkElement from "@/components/ui/LinkElement"
import LoadHandler from "@/components/ui/LoadHandler"
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete"
import { useDataProvider } from "@/libs/context/DataProvider"
import { FilterParams } from "@/types/request"

import DeleteContent from "./DeleteContent"
import PaginationRow from "./PaginationRow"
import TableElement, { TableElementProps } from "./TableElement"

type ActionMenuConfig = {
  value: number | string
  label: string
  onClick?: (filter?: FilterParams) => void
  isDelete?: boolean
  permission?: string
}

type TableManagerProps<T> = Pick<TableElementProps<T>, "columns"> & {
  userPermissions?: string[]
  registerLink?: string
  editLink?: string
  onCSVExport?: (filter?: FilterParams) => void
  onBatchRegister?: () => void
  onBatchEdit?: () => void
  onBatchEditRegister?: () => void
  hasDeleteButton?: boolean
  deleteFieldName?: string
  deleteMessageKey?: string
  hasCheckbox?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete?: (data: any, handleShowModalConfirmDelete: () => void) => void
  detailLink?: string
  hasBackButton?: boolean
  onBack?: () => void
  selectOptions?: ActionMenuConfig[]
  isDeleteRecords?: boolean
  isExportCsv?: boolean
}

export default function TableManager<T extends { id: string }>({
  registerLink,
  editLink,
  hasDeleteButton = true,
  columns,
  deleteFieldName = "name",
  deleteMessageKey = "manager.total_delete",
  hasCheckbox = true,
  onDelete,
  detailLink,
  hasBackButton,
  onBack,
  isDeleteRecords,
}: TableManagerProps<T>) {
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false)

  const {
    loadingStatus,
    filter,
    setFilter,
    data,
    errors,
    selectedRecords,
    setSelectedRecords,
    deleteMany,
  } = useDataProvider<{
    [x: string]: string
    id: string
  }>()

  const handleChangeCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>,
    record: T,
  ) => {
    if (e.target.checked) {
      setSelectedRecords([...selectedRecords, record])
    } else {
      setSelectedRecords(
        selectedRecords.filter(
          (selectedRecord) => selectedRecord.id !== record.id,
        ),
      )
    }
  }

  const handleCloseModalConfirmDelete = () => {
    setIsShowConfirmDelete(false)
  }

  const handleShowModalConfirmDelete = () => {
    setIsShowConfirmDelete(true)
  }

  const handleDeleteMany = async () => {
    const selectedRecordIds = selectedRecords.map(
      (selectedRecord) => selectedRecord.id,
    )
    const [, deleteManyErrors] = await deleteMany(selectedRecordIds)
    if (!deleteManyErrors) {
      handleCloseModalConfirmDelete()
      setSelectedRecords([])
      setFilter({ ...filter } as FilterParams)
    }
  }

  const handleDelete = onDelete
    ? () => onDelete(selectedRecords, handleShowModalConfirmDelete)
    : undefined

  const tableColumns = [
    ...(hasCheckbox
      ? [
          {
            field: "checkbox",
            label: "",
            className: "w-12 !p-4 text-center",
            sortable: false,
            render: (item: T) => (
              <Checkbox
                onChange={(e) => handleChangeCheckbox(e, item)}
                checked={selectedRecords.some(
                  (record) => record.id === item.id,
                )}
              />
            ),
          },
        ]
      : []),
    ...columns,
    ...(editLink
      ? [
          {
            field: "edit",
            label: "Edit",
            labelClassName: "text-center",
            sortable: false,
            render: (item: T) => (
              <div className="flex items-center justify-center text-center">
                <Tooltip content={"Edit"}>
                  <LinkElement
                    className="group mx-auto flex w-fit items-center justify-center rounded-full bg-[#4aa4f2] p-2 text-center font-medium text-white shadow-md hover:opacity-90"
                    href={`${editLink}/${item.id}`}
                  >
                    <HiOutlinePencil size={18} />
                  </LinkElement>
                </Tooltip>
              </div>
            ),
          },
        ]
      : []),
    ...(detailLink
      ? [
          {
            field: "detail",
            label: "Detail",
            labelClassName: "text-center",
            sortable: false,
            render: (item: T) => (
              <div className="flex items-center justify-center text-center">
                <Tooltip content={"Detail"}>
                  <LinkElement
                    className="group mx-2 flex w-fit items-center justify-center rounded-full bg-[#808080] p-2 text-center font-medium text-white shadow-md hover:opacity-90"
                    href={`${detailLink}/${item.id}`}
                  >
                    <BsInfoLg size={18} />
                  </LinkElement>
                </Tooltip>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap justify-end gap-2">
        {registerLink && (
          <ButtonLink href={registerLink} className="hover:bg-blue-800">
            {"Create"}
          </ButtonLink>
        )}
        {hasDeleteButton && (
          <Button
            color="failure"
            onClick={handleDelete ?? handleShowModalConfirmDelete}
            disabled={!selectedRecords || !selectedRecords.length}
          >
            {"Delete"}
          </Button>
        )}
      </div>

      <LoadHandler status={loadingStatus} errors={errors}>
        <PaginationRow className="mb-5 flex-wrap" />
        <TableElement<T> columns={tableColumns} />
        <PaginationRow
          className="mt-5 flex-wrap-reverse"
          defaultPosition="top"
        />
      </LoadHandler>

      <ModalConfirmDelete
        onClose={handleCloseModalConfirmDelete}
        onDelete={isDeleteRecords ? handleDeleteMany : () => {}}
        isShow={isShowConfirmDelete}
        content={
          data &&
          isShowConfirmDelete && (
            <DeleteContent
              deleteMessageKey={deleteMessageKey}
              selectedRecords={selectedRecords}
              deleteFieldName={deleteFieldName}
            />
          )
        }
      />
      {hasBackButton && (
        <div className="mt-5 flex justify-end">
          <Button color="light" onClick={onBack}>
            {"Back"}
          </Button>
        </div>
      )}
    </Card>
  )
}
