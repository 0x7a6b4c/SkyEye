import MainNavbar from "@/components/layouts/Main/MainNavbar"
import MainSidebar from "@/components/layouts/Main/MainSidebar"
import ScrollTop from "@/components/ui/ScrollTop"
import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/Sidebar/SidebarProvider"
import { cn } from "@/libs/utils"

interface MainLayoutProps {
  children: React.ReactNode
}
const MainBody = ({ children }: MainLayoutProps) => {
  const { isOpen, isMobile } = useSidebar()
  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50 pt-14",
        !isMobile && isOpen ? "ml-64" : "ml-0",
      )}
    >
      <div className="h-full scroll-smooth" id="main-layout-body">
        <ScrollTop scrollTopId="main-layout-body" />
        {children}
      </div>
    </div>
  )
}
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <SidebarProvider>
        <MainNavbar />
        <MainSidebar />
        <MainBody>{children}</MainBody>
      </SidebarProvider>
    </>
  )
}
