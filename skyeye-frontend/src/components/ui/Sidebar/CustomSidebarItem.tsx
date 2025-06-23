import { useState } from "react"
import { LuChevronDown, LuChevronRight } from "react-icons/lu"
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "./SidebarMenu"
import { SidebarItemType } from "./CustomSidebarSection"

interface SidebarItemProps {
  item: SidebarItemType
}

export function CustomSidebarItem({ item }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    if (item.type === "accordion") {
      setIsExpanded(!isExpanded)
    } else if (item.onClick) {
      item.onClick()
    }
  }

  if (item.type === "link") {
    return (
      <a
        href={item.url}
        className="flex items-center gap-[9px] px-2 py-2 text-md rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {item.icon || <span className="w-4 h-4">📄</span>}
        <span>{item.title}</span>
      </a>
    )
  }

  if (item.type === "button") {
    return (
      <SidebarMenuButton
        onClick={handleToggle}
        className="flex items-center gap-2"
      >
        {item.icon && <span className="w-4 h-4">📄</span>}
        <span>{item.title}</span>
      </SidebarMenuButton>
    )
  }

  if (item.type === "accordion") {
    return (
      <>
        <SidebarMenuButton
          onClick={handleToggle}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <LuChevronDown className="w-4 h-4" />
          ) : (
            <LuChevronRight className="w-4 h-4" />
          )}
          <span>{item.title}</span>
        </SidebarMenuButton>
        {isExpanded && item.children && (
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.id}>
                <CustomSidebarItem item={child} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </>
    )
  }

  return null
}
