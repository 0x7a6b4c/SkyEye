import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdOutlinePending } from "react-icons/md"
import { ActionSeverity, ActionStatus } from "@/types/IAM/enums"
import { cn } from "@/libs/utils"

const ActionNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-red-50 border-red-200 hover:cursor-pointer",
        data?.actionStatus == ActionStatus.REMOVED && "grayscale",
      )}
      data={{
        ...data,
        icon: data.icon || (
          <MdOutlinePending className="text-red-500" size={18} />
        ),
      }}
    >
      {data?.actionStatus == ActionStatus.REMOVED && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
      {data?.actionStatus == ActionStatus.NEW && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md bg-green-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          New
        </span>
      )}
      {data?.actionStatus == ActionStatus.KEPT && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md  bg-orange-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Kept
        </span>
      )}
      {data?.severity == ActionSeverity.PRIVESC && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-gray-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          PrivEsc
        </span>
      )}
      {data?.severity == ActionSeverity.HIGH && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          High
        </span>
      )}
      {data?.severity == ActionSeverity.MEDIUM && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-orange-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          Medium
        </span>
      )}
      {data?.severity == ActionSeverity.LOW && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-green-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          Low
        </span>
      )}
    </BaseNode>
  )
}

export default ActionNode
