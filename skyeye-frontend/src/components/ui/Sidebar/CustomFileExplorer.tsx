import { useEffect, useState } from "react"
import { LuChevronDown, LuChevronRight } from "react-icons/lu"
import { cn } from "@/libs/utils"
import { FaFolderOpen } from "react-icons/fa6"
import { FaFolderClosed } from "react-icons/fa6"
import { FcWorkflow } from "react-icons/fc"
import { useRouter } from "next/router"

export type FileItem = {
  id: string
  name: string
  link: string
  isOpen?: boolean
  type: "file" | "folder"
  children?: FileItem[]
  isActive?: boolean
}

interface FileExplorerProps {
  items: FileItem[]
  level?: number
}

export function CustomFileExplorer({ items, level = 0 }: FileExplorerProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <FileExplorerItem key={item.id} item={item} level={level} />
      ))}
    </div>
  )
}

interface FileExplorerItemProps {
  item: FileItem
  level: number
}

function FileExplorerItem({ item, level }: FileExplorerItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { asPath } = useRouter()
  useEffect(() => {
    if (item.isOpen) {
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
  }, [item.isOpen])
  const isActive = asPath === item.link
  const router = useRouter()
  const handleClick = () => {
    if (item.type === "folder") {
      setIsExpanded(!isExpanded)
    } else {
      router.push(item.link)
    }
  }

  const paddingLeft = level * 16 + 8

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-2 py-1 px-2 text-sm hover:bg-gray-100 hover:text-gray-900 rounded-sm transition-colors",
          "dark:hover:bg-gray-800 dark:hover:text-white",
          item.type === "file" && "text-gray-600 dark:text-gray-400",
          (item.isActive || isActive) && "bg-gray-100 text-gray-900",
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {item.type === "folder" && (
          <>
            {isExpanded ? (
              <>
                <LuChevronDown className="w-3 h-3 flex-shrink-0" />
                <span className="w-4 h-4 flex-shrink-0">
                  <FaFolderOpen color="#B0B7C0" />
                </span>
              </>
            ) : (
              <>
                <LuChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="w-4 h-4 flex-shrink-0">
                  <FaFolderClosed color="#B0B7C0" />
                </span>
              </>
            )}
          </>
        )}
        {item.type === "file" && (
          <>
            <span className="w-3 h-3 flex-shrink-0"></span>
            <FcWorkflow className="w-4 h-4 flex-shrink-0" color="#B0B7C0" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </button>

      {item.type === "folder" && isExpanded && item.children && (
        <CustomFileExplorer items={item.children} level={level + 1} />
      )}
    </div>
  )
}
