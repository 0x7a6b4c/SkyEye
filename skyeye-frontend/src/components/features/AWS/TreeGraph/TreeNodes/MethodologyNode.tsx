import React from "react"
import { LuInfo } from "react-icons/lu"
import { Handle, Position } from "reactflow"

interface MitreNodeProps {
  data: {
    label: string
    description: string
    type: string
  }
}

const MitreNode: React.FC<MitreNodeProps> = ({ data }) => {
  return (
    <div
      className={`border-2 border-emerald-500 bg-emerald-50 rounded-lg shadow-lg p-4 max-w-[300px] relative transition-transform duration-200 hover:scale-105`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <LuInfo className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <span className="font-semibold text-lg text-gray-900">
            {data.label}
          </span>
          <div className="w-16 h-0.5 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      <div className="bg-white rounded-md p-3 border border-gray-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          {data.description}
        </p>
      </div>
      <Handle type="target" position={Position.Top} />
    </div>
  )
}

export default MitreNode
