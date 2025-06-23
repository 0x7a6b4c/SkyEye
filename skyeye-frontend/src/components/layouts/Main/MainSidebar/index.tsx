import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/Sidebar/Sidebar"
import { SidebarMenu } from "@/components/ui/Sidebar/SidebarMenu"
import { CustomFileExplorer } from "@/components/ui/Sidebar/CustomFileExplorer"
import { CustomSidebarSection } from "@/components/ui/Sidebar/CustomSidebarSection"
import { useScanHistory } from "@/libs/context/ScanHistoryContext"
import { useMemo, useState } from "react"
import { FaBook, FaHome } from "react-icons/fa"
import { RiScan2Line } from "react-icons/ri"
import { SidebarTrigger } from "@/components/ui/Sidebar/SidebarTrigger"
import { cn } from "@/libs/utils"
import { VscTerminalCmd } from "react-icons/vsc"
import { useSidebar } from "@/components/ui/Sidebar/SidebarProvider"

// Static navigation items
const navigationItems = [
  {
    id: "nav-1",
    title: "Home page",
    type: "link" as const,
    url: "/",
    icon: <FaHome color="gray" className="w-5 h-5" />,
  },
  {
    id: "nav-2",
    title: "Scan Forms",
    type: "link" as const,
    url: "/aws/scan",
    icon: <RiScan2Line color="gray" className="w-5 h-5" />,
  },
  {
    id: "nav-3",
    title: "Scan Logs",
    type: "link" as const,
    url: "/aws/scan-logs",
    icon: <VscTerminalCmd color="gray" className="w-5 h-5" />,
  },
  {
    id: "nav-4",
    title: "Action Dictionary",
    type: "link" as const,
    url: "/aws/action-dictionary",
    icon: <FaBook color="gray" className="w-5 h-5" />,
  },
]

export default function MainSideBar() {
  const { sessions } = useScanHistory()
  const { isOpen } = useSidebar()
  // Search term for filtering folders
  const [searchTerm, setSearchTerm] = useState("")

  // How many top-level folders to show initially (always 5)
  const [visibleCount, setVisibleCount] = useState(5)

  // Build filtered + auto-expanded sessions as before
  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) {
      return sessions
    }
    const lower = searchTerm.trim().toLowerCase()
    return sessions
      .map((folder: any) => {
        const folderMatches = folder.name.toLowerCase().includes(lower)
        const matchingChildren =
          folder.children?.filter((child: any) => {
            return (
              child.id.toLowerCase().includes(lower) ||
              child.name.toLowerCase().includes(lower)
            )
          }) || []

        if (folderMatches) {
          return {
            ...folder,
            isOpen: true,
            children: folder.children,
          }
        } else if (matchingChildren.length > 0) {
          return {
            ...folder,
            isOpen: true,
            children: matchingChildren,
          }
        } else {
          return null
        }
      })
      .filter((f) => f !== null) as typeof sessions
  }, [sessions, searchTerm])

  const visibleSessions = filteredSessions.slice(0, visibleCount)

  const hasMore = filteredSessions.length > visibleCount

  const showAll = () => {
    setVisibleCount(filteredSessions.length)
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          IAM Scanner
        </h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CustomSidebarSection items={navigationItems} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Scan History</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* ── Search bar ──────────────────────────────────────────────────── */}
            <div className="px-4 pb-2">
              <input
                type="text"
                placeholder="Search session ID…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setVisibleCount(5) // reset to first 5 on new search
                }}
                className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <CustomFileExplorer items={visibleSessions as any} />

            {hasMore && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={showAll}
                  className="text-sm bg-primary hover:underline focus:outline-none"
                >
                  Show all
                </button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarTrigger
        className={cn(
          "absolute top-1/2 z-10",
          isOpen ? "right-[-12px]" : "right-[-16px]",
        )}
      />
    </Sidebar>
  )
}
