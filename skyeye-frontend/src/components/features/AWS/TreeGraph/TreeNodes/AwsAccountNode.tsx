import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { GrResources } from "react-icons/gr"
import { ActionStatus } from "@/types/IAM/enums"
import { cn } from "@/libs/utils"
import { FaAws } from "react-icons/fa"
import { Handle, Position } from "reactflow"

const AwsAccountNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-yellow-50 border-yellow-200",
  )}
      data={{
        ...data,
        icon: data.icon || (
          <FaAws className="text-yellow-500" size={18} />
        ),
      }}
    >

        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-yellow-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          {"AWS Account"}
        </span>


    </BaseNode>
  )
}

export default AwsAccountNode
