import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdManageHistory } from "react-icons/md"

const WrapperPolicyVersionNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-indigo-50 border-indigo-200 hover:cursor-pointer"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <MdManageHistory className="text-indigo-500" size={18} />
        ),
      }}
    />
  )
}

export default WrapperPolicyVersionNode
