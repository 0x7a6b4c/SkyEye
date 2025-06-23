import React from "react"
import { BaseEdge, EdgeProps, getBezierPath } from "reactflow"

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {/* <defs>
        <linearGradient id={`gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9b87f5" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs> */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: "5,5",
          strokeWidth: 2,
          animation: "dash 1s linear infinite",
        }}
      />
    </>
  )
}

export default CustomEdge
