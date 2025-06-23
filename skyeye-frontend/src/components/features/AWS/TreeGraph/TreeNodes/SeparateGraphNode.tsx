import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { TbBinaryTree } from "react-icons/tb"
import { Handle, Position } from "reactflow"

const SeparateGraphNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className="bg-indigo-50 border-indigo-200 hover:cursor-pointer"
      data={{
        ...data,
        icon: data.icon || (
          <TbBinaryTree className="text-indigo-500" size={18} />
        ),
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={true} />
    </BaseNode>
  )
}

export default SeparateGraphNode
