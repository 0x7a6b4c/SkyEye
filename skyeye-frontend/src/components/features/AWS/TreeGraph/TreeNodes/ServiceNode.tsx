import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdMiscellaneousServices } from "react-icons/md"
import { cn } from "@/libs/utils"

const ServiceNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-sky-50 border-sky-200",
        data?.stmtRemoved && "grayscale",
      )}
      data={{
        ...data,
        icon: data.icon || (
          <MdMiscellaneousServices className="text-sky-500" size={18} />
        ),
      }}
    >
      {data?.stmtRemoved && (
        <span className="mt-1 w-full max-w-[45px] text-center rounded-r-md rounded-tl-md bg-red-500 px-1 text-[8px] text-white absolute left-[-2.4px] top-[-6.5px]">
          Removed
        </span>
      )}
      <span className="mt-1 w-full max-w-[80px] text-center rounded bg-sky-500 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
        Service
      </span>
    </BaseNode>
  )
}

export default ServiceNode
