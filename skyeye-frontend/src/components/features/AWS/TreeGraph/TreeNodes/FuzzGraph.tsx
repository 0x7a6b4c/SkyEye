import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { Handle, Position } from "reactflow"
import { TbBinaryTree } from "react-icons/tb"

const FuzzGraphNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className="bg-teal-50 border-teal-200 hover:cursor-pointer"
      data={{
        ...data,
        icon: data.icon || <TbBinaryTree className="text-teal-500" size={18} />,
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={true} />
    </BaseNode>
  )
}

export default FuzzGraphNode
