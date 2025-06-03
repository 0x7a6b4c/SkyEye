import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { FaUserShield } from "react-icons/fa"
import { RoleStatus } from "@/types/IAM/enums"

const RoleNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className="bg-orange-50 border-orange-200"
      data={{
        ...data,
        icon: data.icon || (
          <FaUserShield className="text-orange-500" size={18} />
        ),
      }}
    >
      {data?.status == RoleStatus.NO_ROLE && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-orange-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Role
        </span>
      )}
      {data?.status == RoleStatus.NO_ACCESS && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Access
        </span>
      )}
    </BaseNode>
  )
}

export default RoleNode
