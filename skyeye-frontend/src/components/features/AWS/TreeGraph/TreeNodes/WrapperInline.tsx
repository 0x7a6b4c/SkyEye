import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdPolicy } from "react-icons/md"

const WrapperInlineNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-gray-50 border-gray-200"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <MdPolicy className="text-gray-500" size={18} />
        ),
      }}
    />
  )
}

export default WrapperInlineNode
