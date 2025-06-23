import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { LuListX } from "react-icons/lu"

const WrapperNoSidStatementNode: React.FC<BaseNodeProps> = (props) => {
  return (
    <BaseNode
      {...props}
      className="bg-slate-50 border-slate-200"
      data={{
        ...props.data,
        icon: props.data.icon || (
          <LuListX className="text-slate-500" size={18} />
        ),
      }}
    />
  )
}

export default WrapperNoSidStatementNode
