import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { FaUser } from "react-icons/fa"
import { Handle, Position } from "reactflow"
import { cn } from "@/libs/utils"

const AccountUserNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className={cn(
        "bg-blue-50 border-blue-200",
        data.mode === "singleFuzz"
          ? "hover:cursor-grab"
          : "hover:cursor-pointer",
      )}
      data={{
        ...data,
        icon: data.icon || <FaUser className="text-blue-500" size={18} />,
      }}
    >
      <span className="mt-1 inline-block text-center whitespace-nowrap rounded bg-blue-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
        {data?.accessKey}
      </span>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      {data.mode === "singleFuzz" && (
        <Handle type="source" position={Position.Bottom} isConnectable={true} />
      )}
    </BaseNode>
  )
}

export default AccountUserNode
