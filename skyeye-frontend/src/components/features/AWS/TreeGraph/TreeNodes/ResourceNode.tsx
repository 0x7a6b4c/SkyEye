import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { GrResources } from "react-icons/gr"
import { ActionStatus } from "@/types/IAM/enums"
import { cn } from "@/libs/utils"

const ResourceNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-yellow-50 border-yellow-200",
        (data?.stmtRemoved || data?.resourceStatus == ActionStatus.REMOVED) &&
          "grayscale",
      )}
      data={{
        ...data,
        icon: data.icon || (
          <GrResources className="text-yellow-500" size={18} />
        ),
      }}
    >
      {data?.stmtRemoved && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
      {data?.resourceStatus === "NotChange" && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          Not Change
        </span>
      )}
      {data?.label === "Resource" && data?.resourceStatus === "Change" && (
        <span className="mt-1 w-full max-w-[130px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          {"NotResource -> Resource"}
        </span>
      )}
      {data?.label === "NotResource" && data?.resourceStatus === "Change" && (
        <span className="mt-1 w-full max-w-[130px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          {"Resource -> NotResource"}
        </span>
      )}
      {data?.resourceStatus == ActionStatus.REMOVED && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
      {data?.resourceStatus == ActionStatus.NEW && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md bg-green-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          New
        </span>
      )}
      {data?.resourceStatus == ActionStatus.KEPT && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md  bg-orange-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Kept
        </span>
      )}
    </BaseNode>
  )
}

export default ResourceNode
