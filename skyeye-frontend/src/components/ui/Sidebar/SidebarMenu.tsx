import React from "react"
import { cn } from "@/libs/utils"

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <ul className={cn("space-y-1", className)}>{children}</ul>
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <li className={cn("", className)}>{children}</li>
}

interface SidebarMenuButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function SidebarMenuButton({
  children,
  onClick,
  className,
}: SidebarMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 text-sm text-left rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors",
        "dark:hover:bg-gray-800 dark:hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function SidebarMenuSub({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ul
      className={cn(
        "ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3",
        className,
      )}
    >
      {children}
    </ul>
  )
}

export function SidebarMenuSubItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <li className={cn("", className)}>{children}</li>
}
