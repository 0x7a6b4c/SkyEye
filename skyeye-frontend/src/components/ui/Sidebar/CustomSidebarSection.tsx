import { SidebarMenuItem } from "./SidebarMenu"
import { CustomSidebarItem } from "./CustomSidebarItem"
import React from "react"

export type SidebarItemType = {
  id: string
  title: string
  type: "link" | "accordion" | "button"
  url?: string
  icon?: React.ReactNode
  children?: SidebarItemType[]
  onClick?: () => void
}

interface SidebarSectionProps {
  items: SidebarItemType[]
}

export function CustomSidebarSection({ items }: SidebarSectionProps) {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.id}>
          <CustomSidebarItem item={item} />
        </SidebarMenuItem>
      ))}
    </>
  )
}
