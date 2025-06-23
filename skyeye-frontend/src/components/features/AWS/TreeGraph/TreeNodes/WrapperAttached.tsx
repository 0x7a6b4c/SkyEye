import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdPolicy } from "react-icons/md"

const WrapperAttachedNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-gray-100 border-gray-300"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <MdPolicy className="text-gray-600" size={18} />
        ),
      }}
    />
  )
}

export default WrapperAttachedNode
