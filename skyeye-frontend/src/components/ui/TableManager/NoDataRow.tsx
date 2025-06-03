import { Table } from "flowbite-react"

export default function NoDataRow() {
  return (
    <Table.Row className="font-normal">
      <Table.Cell colSpan={100} align="center">
        {"There is no data matching the specified conditions."}
      </Table.Cell>
    </Table.Row>
  )
}
