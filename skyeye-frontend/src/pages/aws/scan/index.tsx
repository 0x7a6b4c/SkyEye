import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import ScanForm from "@/components/features/AWS/ScanForm/ScanForm"
import MainLayout from "@/components/layouts/Main/MainLayout"
import { FaUserGroup } from "react-icons/fa6"
import { FaUser } from "react-icons/fa"
import { MdBrowserUpdated } from "react-icons/md"
import { cn } from "@/libs/utils"
import SingleForm from "@/components/features/AWS/ScanForm/SingleForm"
import UpdateForm from "@/components/features/AWS/ScanForm/UpdateForm"

const AwsFormPage = () => {
  const [activeTab, setActiveTab] = useState("multi")
  const [isDisabled, setIsDisabled] = useState(false)

  const tabs = [
    {
      id: "multi",
      label: "Multiple Credential Scan",
      icon: FaUserGroup,
      component: ScanForm,
    },
    {
      id: "single",
      label: "Single Credential Scan",
      icon: FaUser,
      component: SingleForm,
    },
    {
      id: "update",
      label: "Update AWS policies",
      icon: MdBrowserUpdated,
      component: UpdateForm,
    },
  ]

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || ScanForm

  return (
    <div className="w-full mx-auto">
      <div className="flex space-x-4 p-3 rounded-t-lg mt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={"default"}
              className={cn(
                "flex-1 flex items-center gap-2 py-6 px-4 rounded-lg border shadow-lg  hover:text-white transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary shadow-sm text-white border border-slate-200"
                  : "bg-white text-slate-600",
              )}
              disabled={isDisabled}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </Button>
          )
        })}
      </div>
      <CardContent className="p-3">
        <div className="animate-in fade-in-50 duration-200">
          <ActiveComponent
            setIsDisabled={setIsDisabled}
            setActiveTab={setActiveTab}
          />
        </div>
      </CardContent>
    </div>
  )
}

AwsFormPage.Layout = MainLayout
export default AwsFormPage
