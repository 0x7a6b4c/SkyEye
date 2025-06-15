import React, { useEffect, useMemo } from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Node,
} from "reactflow"
import { buildAccountGraph } from "@/libs/helpers/graph-helpers"
import { SessionData } from "@/libs/api"
import {
  edgeTypes,
  NodeCategory,
  nodeMinimapColor,
  nodeTypeComponents,
} from "@/types/IAM/enums"

import "reactflow/dist/style.css"
import { useRouter } from "next/router"
import SessionBanner from "../SessionBanner/banner"
import ScanStatusBanner from "../ScanStatusBanner/banner"
const AccountGraph: React.FC<{
  data: SessionData | null
  sessionId?: string
}> = ({ data, sessionId }) => {
  const router = useRouter()
  const graph = useMemo(() => {
    return buildAccountGraph(data!, data?.mode)
  }, [data])

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges)

  const handleNodeClick = (
    _: React.MouseEvent,
    node: Node<{ accessKey?: string; type: NodeCategory }>,
  ) => {
    if (
      node.data.type !== NodeCategory.ACCOUNT_USER &&
      node.data.type !== NodeCategory.SEPARATE_GRAPH &&
      node.data.type !== NodeCategory.FUZZ_GRAPH
    )
      return

    const base = router.asPath.endsWith("/")
      ? router.asPath.slice(0, -1)
      : router.asPath
    if (data?.mode === "singleFuzz") {
      if (node.data.type === NodeCategory.ACCOUNT_USER) return
      const parentEdge = edges.find((e) => e.target === node.id)
      if (!parentEdge) return

      const userNode = nodes.find((n) => n.id === parentEdge.source)
      if (!userNode) return

      const accessKey = userNode.data.accessKey?.trim() as string
      const accountId = data?.accounts[0]?.accountId
      router.push(
        `${base}/${encodeURIComponent(accountId)}/${encodeURIComponent(
          accessKey,
        )}${node.type === NodeCategory.FUZZ_GRAPH ? "?mode=fuzz" : ""}`,
      )
      return
    }
    const accessKey = node.data.accessKey
    if (!accessKey) return
    const parentEdge = edges.find((e) => e.target === node.id)
    if (!parentEdge) return

    const accountNode = nodes.find((n) => n.id === parentEdge.source)
    if (!accountNode) return

    const accountId = (accountNode.data.label as string).split(":")[1].trim()

    router.push(
      `${base}/${encodeURIComponent(accountId)}/${encodeURIComponent(
        accessKey,
      )}`,
    )
  }

  useEffect(() => {
    if (!data) return
    setNodes(graph.nodes)
    setEdges(graph.edges)
  }, [graph])

  return (
    <div className="h-[90vh] w-full relative mt-4">
      <img
        src="/images/logo/skyeye_standalone_logo.svg"
        className="absolute left-[15px] bottom-[-55px] z-10 h-[240px] min-w-[45px] rounded-md opacity-40"
        alt="Skyeye logo"
      />
      {data?.mode && <SessionBanner mode={data.mode} sessionId={sessionId} />}
      <ScanStatusBanner
        isFail={!!data?.accounts && data?.accounts.length <= 0}
        sessionId={sessionId}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
export default AccountGraph
