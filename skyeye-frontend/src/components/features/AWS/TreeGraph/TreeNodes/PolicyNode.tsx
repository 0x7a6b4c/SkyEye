import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdPolicy } from "react-icons/md"

const PolicyNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-green-50 border-green-200 hover:cursor-pointer"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <MdPolicy className="text-green-500" size={18} />
        ),
      }}
    />
  )
}

export default PolicyNode
