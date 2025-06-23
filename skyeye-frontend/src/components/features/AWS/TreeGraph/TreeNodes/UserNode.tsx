import React from "react"
import BaseNode, { BaseNodeProps } from "./BaseNode"
import { FaUser } from "react-icons/fa"

const UserNode: React.FC<BaseNodeProps> = ({ data, ...props }) => {
  return (
    <BaseNode
      {...props}
      className="bg-blue-50 border-blue-200 hover:cursor-pointer"
      data={{
        ...data,
        icon: data.icon || <FaUser className="text-blue-500" size={18} />,
      }}
    >
      <span className="mt-1 inline-block text-center whitespace-nowrap rounded bg-blue-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
        {data?.AccessKey}
      </span>
    </BaseNode>
  )
}

export default UserNode
