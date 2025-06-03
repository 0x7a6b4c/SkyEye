import React from "react"
import { Handle, Position } from "reactflow"
import { cn } from "@/libs/utils"
import { NodeCategory, PolicyStatus } from "@/types/IAM/enums"
import { GraphNodeMeta } from "@/libs/helpers/graph-helpers"
import { Tooltip } from "flowbite-react"

export interface BaseNodeProps {
  data: GraphNodeMeta
  isConnectable?: boolean
  className?: string
  type?: string
  selected?: boolean
  children?: React.ReactNode
}

const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  isConnectable = true,
  className,
  selected,
  children,
}) => {
  const tooltipItems = Object.entries(data).filter(
    ([k, v]) =>
      ![
        "label",
        "icon",
        "description",
        "category",
        "status",
        "policySource",
        "type",
        "hasOutgoing",
        "hasIncoming",
        "animateBorder",
        "inPolicyView",
        "width",
        "hasVersionWrapper",
        "stmtRemoved",
        "inActionView",
        "mode",
      ].includes(k) &&
      (typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"),
  )

  const tooltipContent = (
    <div className="flex flex-col gap-1 text-xs">
      {tooltipItems.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span className="font-medium text-slate-600">{k}</span>
          <span className="whitespace-normal break-words max-w-[240px] text-left">
            {String(v)
              .split("/")
              .map((seg, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <>
                      /<br />
                    </>
                  )}
                  {seg}
                </React.Fragment>
              ))}
          </span>
        </div>
      ))}
    </div>
  )

  const wrapperCats = [
    NodeCategory.WRAPPER_INLINE,
    NodeCategory.WRAPPER_ATTACHED,
    NodeCategory.WRAPPER_GROUP,
    NodeCategory.WRAPPER_ROLE,
  ]
  const showTooltip =
    tooltipItems.length > 0 && !wrapperCats.includes(data.type as any)

  const dashAnim = (data as any).animateBorder ? "animated-border" : ""
  const nodeBody = (
    <div
      className={cn(
        "border rounded-md px-4 py-3 shadow-sm min-w-[180px] bg-white",
        "flex flex-col gap-1",
        selected && "ring-1 ring-primary",
        dashAnim,
        "transition-transform duration-200 hover:scale-105",
        "cursor-grab",
        className,
      )}
    >
      {data.hasIncoming && (
        <>
          {/* normal left‑side target */}
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
            className="h-1.5 w-3 border-0 bg-gray-400"
          />

          {/* extra top target for Versions wrapper */}
          {data.type === NodeCategory.WRAPPER_VERSION &&
            (data as any).inPolicyView && (
              <Handle
                id="top"
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="h-1.5 w-3 border-0 bg-gray-400"
              />
            )}
        </>
      )}

      <div className="flex items-center gap-2">
        {data.icon && <div className="text-lg flex-shrink-0">{data.icon}</div>}
        <div className="text-sm font-medium truncate">{data.label}</div>
      </div>

      {data.description && (
        <div className="text-xs text-muted-foreground truncate max-w-full">
          {data.description}
        </div>
      )}

      {children}

      {data?.status == PolicyStatus.NO_POLICY && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-gray-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Policy
        </span>
      )}
      {data?.status == PolicyStatus.NO_ACCESS && (
        <span className="mt-1 w-full max-w-[80px] text-center rounded bg-red-600 px-1 text-[10px] text-white absolute left-[0px] top-[40px]">
          No&nbsp;Access
        </span>
      )}
      {data?.policySource && (
        <span
          className={cn(
            "mt-1 w-full max-w-[80px] text-center rounded px-1 text-[10px] absolute left-[0px] top-[40px]",
            data.policySource === "AWS"
              ? "bg-yellow-300 text-white"
              : "bg-blue-300 text-white",
          )}
        >
          {data.policySource === "AWS" ? "AWS" : "Customer"}
        </span>
      )}

      {data.hasOutgoing && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="h-1.5 w-3 border-0 bg-gray-400"
        />
      )}
      {data.type === NodeCategory.POLICY &&
        (data as any).hasVersionWrapper &&
        (data as any).inPolicyView && (
          <Handle
            id="bottom"
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            className="h-3 w-1.5 border-0 bg-gray-400"
          />
        )}
      {data.type === NodeCategory.ACTION && (data as any).inActionView && (
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="h-3 w-1.5 border-0 bg-gray-400"
        />
      )}
      {data.type === NodeCategory.ACCOUNT && (
        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="h-3 w-1.5 border-0 bg-gray-400"
        />
      )}
    </div>
  )

  return showTooltip ? (
    <Tooltip
      content={tooltipContent}
      placement="top"
      style="light"
      className="z-50"
    >
      {nodeBody}
    </Tooltip>
  ) : (
    nodeBody
  )
}

export default BaseNode
