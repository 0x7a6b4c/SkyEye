import React from "react"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/libs/utils"
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { FaBurger } from "react-icons/fa6"

interface SidebarTriggerProps {
  className?: string
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { toggleSidebar, isOpen, isMobile } = useSidebar()

  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-slate-300 p-1 text-gray-400 hover:bg-slate-200 focus:outline-none",
        "dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
        className,
      )}
      aria-label="Toggle Sidebar"
    >
      {isOpen && !isMobile ? (
        <LuChevronLeft className="h-5 w-5" />
      ) : (
        <LuChevronRight className="h-5 w-5" />
      )}
    </button>
  )
}
