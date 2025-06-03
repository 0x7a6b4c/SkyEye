import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { ActionStatus } from "@/types/IAM/enums"
import { cn } from "@/libs/utils"
import { MdOutlinePending } from "react-icons/md"

const WrapperActionNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-yellow-50 border-yellow-200",
        data?.stmtRemoved && "grayscale",
      )}
      data={{
        ...data,
        icon: data.icon || (
          <MdOutlinePending className="text-yellow-500" size={18} />
        ),
      }}
    >
      {data?.actionStatus === "NotChange" && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          Not Change
        </span>
      )}
      {data?.label === "Action" && data?.actionStatus === "Change" && (
        <span className="mt-1 w-full max-w-[110px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          {"NotAction -> Action"}
        </span>
      )}
      {data?.label === "NotAction" && data?.actionStatus === "Change" && (
        <span className="mt-1 w-full max-w-[110px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          {"Action -> NotAction"}
        </span>
      )}
      {data?.stmtRemoved && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
    </BaseNode>
  )
}

export default WrapperActionNode
