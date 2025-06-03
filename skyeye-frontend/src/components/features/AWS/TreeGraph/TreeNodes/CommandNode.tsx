import React from "react"
import { LuFileTerminal } from "react-icons/lu"
import { Handle, Position } from "reactflow"
import { BaseNodeProps } from "./BaseNode"

const CommandNode: React.FC<BaseNodeProps> = ({ data }) => {
  return (
    <div className="bg-amber-50 border-2 border-amber-500 rounded-lg shadow-lg p-5 min-w-[320px] relative transition-transform duration-200 hover:scale-105">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <LuFileTerminal className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <span className="font-semibold text-lg text-gray-900">
            {data.label}
          </span>
          <div className="w-16 h-0.5 bg-amber-500 rounded-full"></div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        {Array.isArray(data.commands) ? (
          data.commands.map((cmd, idx) => (
            <code
              key={idx}
              className="nopan text-sm text-green-300 font-mono block cursor-text select-text"
            >
              {cmd}
            </code>
          ))
        ) : (
          <code className="nopan text-sm text-green-300 font-mono block select-text">
            {data.command}
          </code>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-500 border-2 border-white shadow-md"
      />
    </div>
  )
}

export default CommandNode
