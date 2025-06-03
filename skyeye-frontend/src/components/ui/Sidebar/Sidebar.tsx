import React from "react"
import { cn } from "@/libs/utils"
import { useSidebar } from "./SidebarProvider"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isOpen, isMobile, setIsOpen } = useSidebar()

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out",
            "dark:bg-gray-900 dark:border-gray-700",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </aside>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out",
        "dark:bg-gray-900 dark:border-gray-700",
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full",
        className,
      )}
    >
      <div className="h-full overflow-y-auto overflow-x-hidden">{children}</div>
    </aside>
  )
}

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "p-4 border-b border-gray-200 dark:border-gray-700 mb-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex-1 p-2 space-y-2", className)}>{children}</div>
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}
