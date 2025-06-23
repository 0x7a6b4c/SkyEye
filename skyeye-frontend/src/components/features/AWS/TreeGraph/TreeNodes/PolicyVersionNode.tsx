import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { MdManageHistory } from "react-icons/md"

const PolicyVersionNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-slate-50 border-slate-200"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <MdManageHistory className="text-slate-500" size={18} />
        ),
      }}
    />
  )
}

export default PolicyVersionNode
