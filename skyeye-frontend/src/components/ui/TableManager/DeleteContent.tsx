interface DeleteContentProps {
  selectedRecords: any[]
  deleteFieldName?: string
  deleteMessageKey?: string
}

export default function DeleteContent({
  selectedRecords,
  deleteFieldName = "name",
}: DeleteContentProps) {
  return (
    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
      <span className="whitespace-pre-line">
        {`Are you sure you want to delete the following ${selectedRecords.length || 0} selected records?`}
      </span>
      <div className="flex flex-col items-center">
        <ul className="list-inside list-disc break-all text-left">
          {selectedRecords.slice(0, 5).map((item) => (
            <li key={item.id}>{item[deleteFieldName]}</li>
          ))}
        </ul>
        {selectedRecords.length > 5 && <div className="text-center">...</div>}
      </div>
    </h3>
  )
}
