import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { FaListCheck } from "react-icons/fa6"
import { ActionStatus } from "@/types/IAM/enums"
import { cn } from "@/libs/utils"

const StatementNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-teal-50 border-teal-200",
        data?.sidDiff == ActionStatus.REMOVED && "grayscale",
      )}
      data={{
        ...data,
        icon: data.icon || <FaListCheck className="text-teal-500" size={18} />,
      }}
    >
      {data?.effect === "Allow" &&
        data?.effectStatus === "Change" &&
        data?.sidDiff === ActionStatus.KEPT && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-green-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            {"Deny -> Allow"}
          </span>
        )}
      {data?.effect === "Deny" &&
        data?.effectStatus === "Change" &&
        data?.sidDiff === ActionStatus.KEPT && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            {"Allow -> Deny"}
          </span>
        )}
      {data?.effect === "Deny" &&
        (data?.sidDiff === ActionStatus.NEW ||
          data?.sidDiff === ActionStatus.REMOVED) && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            Deny
          </span>
        )}
      {data?.effect === "Deny" &&
        data?.effectStatus === "NotChange" &&
        data?.sidDiff === "NotChange" && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            Deny
          </span>
        )}
      {data?.effect === "Allow" &&
        (data?.sidDiff === ActionStatus.NEW ||
          data?.sidDiff === "NotChange") && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-green-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            Allow
          </span>
        )}
      {data?.effect === "Allow" &&
        data?.effectStatus === "NotChange" &&
        data?.sidDiff === "NotChange" && (
          <span className="mt-1 w-full max-w-[80px] text-center rounded bg-green-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
            Allow
          </span>
        )}
      {data?.sidDiff == ActionStatus.REMOVED && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
      {data?.sidDiff == ActionStatus.NEW && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md bg-green-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          New
        </span>
      )}
      {data?.sidDiff === "NotChange" && (
        <span className="mt-1 w-full max-w-[30px] text-center rounded-r-md rounded-tl-md  bg-orange-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Kept
        </span>
      )}
    </BaseNode>
  )
}

export default StatementNode
