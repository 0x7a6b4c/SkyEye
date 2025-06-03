import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { FaUserGroup } from "react-icons/fa6"
import { GroupStatus } from "@/types/IAM/enums"

const GroupNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className="bg-purple-50 border-purple-200"
      data={{
        ...data,
        icon: data.icon || (
          <FaUserGroup className="text-purple-500" size={18} />
        ),
      }}
    >
      {data?.status == GroupStatus.NO_GROUP && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-purple-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Group
        </span>
      )}
      {data?.status == GroupStatus.NO_ACCESS && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Access
        </span>
      )}
    </BaseNode>
  )
}

export default GroupNode
