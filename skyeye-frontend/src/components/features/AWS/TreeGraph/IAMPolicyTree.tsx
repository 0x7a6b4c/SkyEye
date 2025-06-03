// IAMPolicyTree.tsx – clean rewrite with working service filter (active in policy & history views)
import React, { useEffect, useMemo, useState } from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Edge,
  Node,
} from "reactflow"
import "reactflow/dist/style.css"

import {
  NodeCategory,
  IAMData,
  nodeTypeComponents,
  edgeTypes,
  nodeMinimapColor,
  SimulatePrincipalPolicyTechnique,
} from "@/types/IAM/enums"
import {
  dagreLayout,
  GraphNodeMeta,
  buildLogicalGraph,
} from "@/libs/helpers/graph-helpers"
import Select from "react-select"
import serviceOptions from "@/mock_data/iam_all_service_list.json" assert { type: "json" }
import {
  buildFuzzingGraph,
  buildPrincipalSimulationGraph,
  IAMFuzzingTechnique,
} from "@/libs/helpers/graph-fuzzing-helpers"
import { useRouter } from "next/router"

type ServiceOption = { value: string; label: string }
interface PolicyTreeProps {
  iamData: IAMData
}

const IAMPolicyTree: React.FC<PolicyTreeProps> = ({ iamData }) => {
  /* ---------------- state ---------------- */
  const [viewNodes, setViewNodes, onNodesChange] = useNodesState<
    Node<GraphNodeMeta>
  >([])
  const [viewEdges, setViewEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { fitBounds } = useReactFlow()
  const [focusStack, setFocusStack] = useState<string[]>([]) // 0=overview;1=policy;2=history
  const depth = focusStack.length
  const [serviceFilter, setServiceFilter] = useState<string[]>([])
  const router = useRouter()

  const backToSessionOverview = () => {
    const segments = router.asPath.split("/")
    const sessionPath = `/${segments[1]}/${segments[2]}/${segments[3]}`
    router.push(sessionPath)
  }
  /* ---------------- data graph ---------------- */
  // after (choose based on payload shape):
  const dataGraph = useMemo(() => {
    if ("IAMFuzzing_Technique" in iamData)
      return buildFuzzingGraph(
        iamData.IAMFuzzing_Technique as IAMFuzzingTechnique,
      )
    if ("SimulatePrincipalPolicy_Technique" in iamData)
      return buildPrincipalSimulationGraph(
        iamData.SimulatePrincipalPolicy_Technique as SimulatePrincipalPolicyTechnique,
      )
    return buildLogicalGraph(iamData) // legacy
  }, [iamData])

  const isAll = serviceFilter.length === 0

  /* ---------------- helpers ---------------- */
  const buildRFNode = (
    id: string,
    meta: GraphNodeMeta,
    animate = false,
  ): Node<GraphNodeMeta> => {
    const w = Math.max(
      (meta.width as number) || 180,
      meta.label.length * 8 + 32,
    )
    return {
      id,
      data: { ...meta, animateBorder: animate, width: w },
      type: meta.type as NodeCategory,
      position: { x: 0, y: 0 },
    }
  }
  const matchesService = (meta: GraphNodeMeta) => {
    if (isAll) return true
    if (
      meta.type === NodeCategory.WRAPPER_SERVICES &&
      serviceFilter.includes(meta.label)
    )
      return true
    if (serviceFilter.includes((meta as any).service as string)) return true
    return false
  }

  const hasPolicies = useMemo(
    () =>
      Array.from(dataGraph.nodes.values()).some(
        (m) => m.type === NodeCategory.POLICY,
      ),
    [dataGraph],
  )

  /* already defined earlier */
  const isActionView =
    dataGraph.nodes.get(focusStack[depth - 1])?.type === NodeCategory.ACTION

  /* ─── 2.  decide whether to render the filter ─────────────────── */
  const showServiceFilter = !isActionView && (depth > 0 || !hasPolicies)

  /* ---------------- compute view graph ---------------- */
  useEffect(() => {
    if (!iamData) return

    const isPolicyView = depth === 1

    const hideCats: NodeCategory[] =
      depth === 0
        ? hasPolicies
          ? [
              /* legacy overview – hide below-Policy detail */
              NodeCategory.STATEMENT,
              NodeCategory.ACTION,
              NodeCategory.RESOURCE,
              NodeCategory.WRAPPER_RESOURCE,
              NodeCategory.WRAPPER_VERSION,
              NodeCategory.POLICY_VERSION,
              NodeCategory.WRAPPER_SERVICES,
              NodeCategory.WRAPPER_NO_SID_STATEMENT,
              NodeCategory.WRAPPER_ACTION,
              NodeCategory.TTP,
              NodeCategory.COMMAND,
              NodeCategory.ABUSE_METHODOLOGY,
            ]
          : [
              /* fuzzing overview – show Service & Action; hide only enrichment */
              NodeCategory.TTP,
              NodeCategory.COMMAND,
              NodeCategory.ABUSE_METHODOLOGY,
            ]
        : [
            /* existing non-overview hide list (unchanged) */
            NodeCategory.STATEMENT,
            NodeCategory.ACTION,
            NodeCategory.RESOURCE,
            NodeCategory.WRAPPER_RESOURCE,
            NodeCategory.POLICY_VERSION,
            NodeCategory.TTP,
            NodeCategory.COMMAND,
            NodeCategory.ABUSE_METHODOLOGY,
          ]
    const parentMap = new Map<string, string>()
    dataGraph.edges.forEach((e) => {
      if (!e.dashed) parentMap.set(e.target, e.source)
    })

    let nodesToKeep = new Set<string>()

    if (depth === 0) {
      if (hasPolicies) {
        // legacy & simulation: old behaviour
        dataGraph.nodes.forEach((m, id) => {
          if (!hideCats.includes(m.type as NodeCategory)) nodesToKeep.add(id)
        })
      } else {
        // fuzzing: honour the service filter
        dataGraph.nodes.forEach((m, id) => {
          if (
            m.type === NodeCategory.USER ||
            (!hideCats.includes(m.type as NodeCategory) && matchesService(m))
          ) {
            nodesToKeep.add(id)
          }
        })
      }
    } else if (isActionView) {
      // only include selected action node and allowed descendant types (TTP, COMMAND, ABUSE_METHODOLOGY)
      const root = focusStack[depth - 1]
      nodesToKeep.add(root)
      const q = [root]
      const allowedTypes = new Set<NodeCategory>([
        NodeCategory.TTP,
        NodeCategory.COMMAND,
        NodeCategory.ABUSE_METHODOLOGY,
      ])
      while (q.length) {
        const n = q.shift()!
        dataGraph.edges.forEach((e) => {
          if (e.source !== n) return
          const meta = dataGraph.nodes.get(e.target)!
          if (allowedTypes.has(meta.type as NodeCategory)) {
            nodesToKeep.add(e.target)
            q.push(e.target)
          }
        })
      }
    } else {
      // start with focus node + ancestors
      for (
        let cur = focusStack[depth - 1];
        cur;
        cur = parentMap.get(cur) as string
      )
        nodesToKeep.add(cur)
      // bfs descend respecting policy stop
      const q = [focusStack[depth - 1]]
      while (q.length) {
        const n = q.shift()!
        dataGraph.edges.forEach((e) => {
          if (e.source !== n) return
          const meta = dataGraph.nodes.get(e.target)!
          const stop =
            isPolicyView && meta.type === NodeCategory.WRAPPER_VERSION
          nodesToKeep.add(e.target)
          if (!stop) q.push(e.target)
        })
      }
      // apply service filter
      if (!isAll) {
        const svcSet = new Set<string>()
        nodesToKeep.forEach((id) => {
          if (matchesService(dataGraph.nodes.get(id)!)) svcSet.add(id)
        })
        // ancestors
        svcSet.forEach((id) => {
          for (let p = id; p; p = parentMap.get(p) as string) svcSet.add(p)
        })
        // descendants that still match service or are resource chain
        const dq = Array.from(svcSet)
        if (dq.length === 0) {
          nodesToKeep.forEach((id) => {
            const meta = dataGraph.nodes.get(id)!
            if (
              !(
                meta.type === NodeCategory.RESOURCE ||
                meta.type === NodeCategory.WRAPPER_RESOURCE ||
                meta.type === NodeCategory.ACTION ||
                meta.type === NodeCategory.WRAPPER_SERVICES
              )
            )
              svcSet.add(id)
          })
        } else {
          while (dq.length) {
            const n = dq.shift()!
            dataGraph.edges.forEach((e) => {
              if (e.source !== n || svcSet.has(e.target)) return
              const m = dataGraph.nodes.get(e.target)!
              if (
                matchesService(m) ||
                [
                  NodeCategory.WRAPPER_RESOURCE,
                  NodeCategory.RESOURCE,
                  NodeCategory.WRAPPER_VERSION,
                ].includes(m.type as any)
              ) {
                svcSet.add(e.target)
                dq.push(e.target)
              }
            })
          }
        }
        nodesToKeep = svcSet
      }
      // NEW: Remove unwanted nodes in policy and history view
      const removeCats = new Set<NodeCategory>([
        NodeCategory.TTP,
        NodeCategory.COMMAND,
        NodeCategory.ABUSE_METHODOLOGY,
      ])
      if (!isActionView) {
        // only filter if not in action view
        nodesToKeep = new Set(
          Array.from(nodesToKeep).filter((id) => {
            const meta = dataGraph.nodes.get(id)!
            return !removeCats.has(meta.type as NodeCategory)
          }),
        )
      }
    }

    // build ReactFlow data
    const rfNodes = Array.from(nodesToKeep).map((id) =>
      buildRFNode(
        id,
        {
          ...dataGraph.nodes.get(id)!,
          inPolicyView: isPolicyView,
          inActionView: isActionView,
        },
        depth > 0,
      ),
    )
    const rfEdges = dataGraph.edges
      .filter((e) => nodesToKeep.has(e.source) && nodesToKeep.has(e.target))
      .map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: depth === 0 && !e.dashed ? undefined : "gradient",
      }))

    const laid = dagreLayout(rfNodes, rfEdges, isActionView ? "TB" : "LR")
    setViewNodes(laid.nodes)
    setViewEdges(laid.edges)
  }, [iamData, dataGraph, focusStack, serviceFilter])

  /* ---------------- fitBounds ---------------- */
  useEffect(() => {
    if (!viewNodes.length) return

    const bounds = viewNodes.reduce(
      (acc, n) => ({
        minX: Math.min(acc.minX, n.position.x),
        minY: Math.min(acc.minY, n.position.y),
        maxX: Math.max(acc.maxX, n.position.x + 240),
        maxY: Math.max(acc.maxY, n.position.y + 64),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    )

    fitBounds(
      {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      },
      { padding: 0.2, duration: 800 },
    )
  }, [viewNodes, fitBounds])

  const handleNodeClick = (_: React.MouseEvent, node: Node<GraphNodeMeta>) => {
    const meta = node.data as GraphNodeMeta
    if (meta.type === NodeCategory.POLICY) {
      setFocusStack([node.id])
      setServiceFilter([])
    } else if (meta.type === NodeCategory.WRAPPER_VERSION && depth === 1) {
      setFocusStack([focusStack[0], node.id])
      setServiceFilter([])
    } else if (
      meta.type === NodeCategory.ACTION &&
      !(
        focusStack.length &&
        dataGraph.nodes.get(focusStack[focusStack.length - 1])?.type ===
          NodeCategory.ACTION
      )
    ) {
      // Always allow drilling into an Action node unless we're already there
      setFocusStack([...focusStack, node.id])
    } else if (meta.type === NodeCategory.USER) {
      setFocusStack([])
      setServiceFilter([])
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-4 w-full h-[90vh] relative">
      {depth > 0 && (
        <button
          onClick={() => setFocusStack((s) => s.slice(0, -1))}
          className="absolute left-3 top-2 z-10 btn btn-primary text-white px-3 py-1 rounded shadow"
        >
          {depth === 1 ? "Back to overview" : "Back"}
        </button>
      )}
      {depth == 0 && (
        <button
          onClick={backToSessionOverview}
          className="absolute left-3 top-2 z-10 btn btn-primary text-white px-3 py-1 rounded shadow"
        >
          {"Back to session overview"}
        </button>
      )}
      {showServiceFilter && (
        <div className="absolute right-3 top-2 z-10 min-w-[300px] max-w-[900px]">
          <Select
            closeMenuOnSelect={false}
            isMulti
            isSearchable
            placeholder="Filter services…"
            options={serviceOptions?.services as ServiceOption[]}
            value={
              serviceOptions?.services.filter((o) =>
                serviceFilter.includes(o.value),
              ) as unknown as ServiceOption[]
            }
            onChange={(vals) =>
              setServiceFilter((vals as ServiceOption[]).map((v) => v.value))
            }
          />
        </div>
      )}
      <img
        src="/images/logo/skyeye_standalone_logo.svg"
        className="absolute left-[40px] bottom-[-30px] z-10 h-[150px] min-w-[45px] rounded-md opacity-40"
        alt="Skyeye logo"
      />

      <ReactFlow
        nodes={viewNodes}
        edges={viewEdges}
        nodeTypes={nodeTypeComponents}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        elementsSelectable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        onNodeClick={handleNodeClick}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <MiniMap pannable zoomable nodeColor={nodeMinimapColor} />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default IAMPolicyTree
