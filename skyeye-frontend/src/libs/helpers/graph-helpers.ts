import dagre from "dagre"
import { Node, Edge, Position } from "reactflow"
import {
  ActionSeverity,
  AttackDetails,
  GroupStatus,
  IAMData,
  IAMPolicy,
  NodeCategory,
  PolicyStatus,
  RoleStatus,
  Statement,
} from "@/types/IAM/enums"
import rawOps from "@/mock_data/iam_sensitive_operations.json"
import attackJson from "@/data/mitre_attack_aws_actions.json" assert { type: "json" }
import { SessionData } from "../api"
const AWS_ATTACK_MAP: Record<
  string,
  {
    TTPs: string
    AbuseMethodology: string
    Commands: string[]
  }
> = (
  attackJson as {
    AWS_Actions: Record<
      string,
      { TTPs: string; AbuseMethodology: string; Commands: string[] }
    >
  }
).AWS_Actions
const sensitiveOps: Record<string, string> = rawOps as Record<string, string>
export interface GraphNodeMeta {
  label: string
  type: string
  effect?: "Allow" | "Deny"
  status?: PolicyStatus | GroupStatus | RoleStatus
  policySource?: "AWS" | "Customer"
  description?: string
  icon?: React.ReactNode
  [key: string]: string | number | boolean | undefined | React.ReactNode
  severity?: ActionSeverity
}
export interface GraphEdgeMeta {
  source: string
  target: string
  effect?: "Allow" | "Deny"
  dashed?: boolean
  sourceHandle?: string
  targetHandle?: string
}

const NODE_WIDTH = 250
const NODE_HEIGHT = 64

const pickPrimitives = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj ?? {}).filter(
      ([, v]) =>
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean",
    ),
  ) as Record<string, string | number | boolean>

// In graph-helper.ts - Modified dagreLayout function
// graph‑helpers.ts
export function dagreLayout<T>(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR",
): { nodes: Node[]; edges: Edge[]; direction?: "LR" | "TB" } {
  /** We mark policy‑view nodes with `data.inPolicyView` in the React component. */
  const inPolicyView = nodes[0]?.data?.inPolicyView === true

  // ──────────────────────────────────────────────────────────────────────────
  // 1️⃣  Separate version wrappers when in policy view
  // ──────────────────────────────────────────────────────────────────────────
  let layoutNodes: Node[] = nodes
  let layoutEdges: Edge[] = edges
  let versionWrappers: Node[] = []

  if (inPolicyView) {
    versionWrappers = nodes.filter(
      (n) => (n.data as any).type === NodeCategory.WRAPPER_VERSION,
    )
    layoutNodes = nodes.filter(
      (n) => (n.data as any).type !== NodeCategory.WRAPPER_VERSION,
    )
    layoutEdges = edges.filter(
      (e) =>
        !versionWrappers.some((w) => w.id === e.target) &&
        !versionWrappers.some((w) => w.id === e.source),
    )
  }

  //  Dagre layout on the main nodes

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 })

  layoutNodes.forEach((n) => {
    const w = (n.data as any)?.width ?? NODE_WIDTH
    g.setNode(n.id, { width: w, height: NODE_HEIGHT })
  })

  layoutEdges.forEach((e) => g.setEdge(e.source, e.target))
  dagre.layout(g)

  const laidMainNodes = layoutNodes.map((n) => {
    const { x, y } = g.node(n.id)
    const w = (n.data as any)?.width ?? NODE_WIDTH
    return {
      ...n,
      position: { x: x - w / 2, y: y - NODE_HEIGHT / 2 },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    }
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 3️⃣  Place each Versions wrapper under its Policy (only in policy view)
  // ──────────────────────────────────────────────────────────────────────────
  const byId = Object.fromEntries(laidMainNodes.map((n) => [n.id, n]))
  const positionedWrappers = versionWrappers.map((wrapper) => {
    const policyEdge = edges.find(
      (e) =>
        e.target === wrapper.id &&
        (byId[e.source]?.data as any)?.type === NodeCategory.POLICY,
    )
    if (!policyEdge) return wrapper // safety

    const policy = byId[policyEdge.source]
    const policyWidth = (policy.data as any)?.width ?? NODE_WIDTH

    return {
      ...wrapper,
      position: {
        x: policy.position.x + policyWidth / 2 - 100, // centre-ish
        y: policy.position.y + NODE_HEIGHT * 2.5, // push down
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Left, // or keep Right if you prefer
    }
  })

  // ──────────────────────────────────────────────────────────────────────────
  // 4️⃣  Combine and return
  // ──────────────────────────────────────────────────────────────────────────
  const combinedNodes = [...laidMainNodes, ...positionedWrappers]
  return {
    nodes: combinedNodes,
    edges,
  }
}

export function buildLogicalGraph(iamData: IAMData): {
  nodes: Map<string, GraphNodeMeta>
  edges: GraphEdgeMeta[]
} {
  if (!iamData)
    return {
      nodes: new Map<string, GraphNodeMeta>(),
      edges: [] as GraphEdgeMeta[],
    }

  let idCounter = 1
  const nextId = () => `node_${idCounter++}`

  const nodeMap = new Map<string, GraphNodeMeta>()
  const edges: GraphEdgeMeta[] = []

  const createNode = (
    label: string,
    type: NodeCategory,
    extra: Partial<GraphNodeMeta> = {},
    raw?: any,
  ) => {
    const id = nextId()
    nodeMap.set(id, {
      label,
      type,
      hasIncoming: false,
      hasOutgoing: false,
      ...extra,
      ...pickPrimitives(raw),
    })
    return id
  }
  const createEdge = (
    src: string,
    tgt: string,
    effect?: "Allow" | "Deny",
    dashed = false,
    srcHandle?: string,
    tgtHandle?: string,
  ) => {
    edges.push({
      source: src,
      target: tgt,
      effect,
      dashed,
      sourceHandle: srcHandle,
      targetHandle: tgtHandle,
    })
    nodeMap.get(src)!.hasOutgoing = true
    nodeMap.get(tgt)!.hasIncoming = true
  }

  const addAttackInfo = (actionId: string, actionName: string) => {
    const info = AWS_ATTACK_MAP[actionName]
    if (!info) return

    // Parse the TTP string e.g., "TA0003:T1098:T1098.003"
    const ttpParts = info.TTPs.split(":")
    const tactic = ttpParts[0] || ""
    const technique = ttpParts[1] || ""
    const subTechnique = ttpParts.length > 2 ? ttpParts[2] : ""
    const ttpLabel = subTechnique
      ? `${tactic}:${technique}:${subTechnique}`
      : `${tactic}:${technique}`

    // Create TTP node with separated values
    const ttpId = createNode(ttpLabel, NodeCategory.TTP, {
      tactic,
      technique,
      subTechnique,
      width: 380,
    })
    createEdge(actionId, ttpId, undefined, false, "bottom", "top")

    const abId = createNode(
      "Abuse Methodology",
      NodeCategory.ABUSE_METHODOLOGY,
      { description: info.AbuseMethodology, width: 380 },
    )
    createEdge(actionId, abId, undefined, false, "bottom", "top")
    const cmdWrap = createNode("Commands", NodeCategory.COMMAND, {
      commands: info.Commands,
      width: 380,
    })
    createEdge(actionId, cmdWrap, undefined, false, "bottom", "top")
  }

  const policyByArn = new Map<string, string>()
  const roleByArn = new Map<string, string>()
  const seenPolicyArns = new Set<string>()

  const addHistoricEnumeration = (versionWrapId: string, enumeration: any) => {
    const versionId = createNode(
      `PolicyVersionId: ${enumeration.PolicyVersionId}`,
      NodeCategory.POLICY_VERSION,
    )
    createEdge(versionWrapId, versionId)

    const sidStatus: Record<string, string> = enumeration.SidStatus || {}

    // 1️⃣ Named SID statements
    Object.entries(sidStatus).forEach(([sid, sidDiff]) => {
      const diff = enumeration.Differences?.[sid]
      if (!diff) return

      const stmtRemoved = sidDiff === "Removed"
      const stmtNodeId = createNode(
        `Statement: ${sid}`,
        NodeCategory.STATEMENT,
        {
          effect: diff.Effect,
          effectStatus: diff.EffectStatus,
          sidDiff: enumeration?.SidStatus?.[sid],
        },
      )
      createEdge(versionId, stmtNodeId)

      // Action / NotAction wrapper
      const actionWrapperId = createNode(
        diff.Action ? "Action" : "NotAction",
        NodeCategory.WRAPPER_ACTION,
        { actionStatus: diff.ActionStatus, stmtRemoved },
      )
      createEdge(stmtNodeId, actionWrapperId)

      const svcBuckets: Record<string, { status: string; acts: string[] }> = {}
      Object.entries(
        (diff.Action || diff.NotAction) as Record<string, string[]>,
      ).forEach(([statusKey, acts]) => {
        const mappedStatus = stmtRemoved ? "Removed" : statusKey
        acts.forEach((a) => {
          const svc = a.split(":")[0]
          if (!svcBuckets[svc])
            svcBuckets[svc] = { status: mappedStatus, acts: [] }
          svcBuckets[svc].acts.push(a)
        })
      })
      // Resource / NotResource wrapper
      const resourceWrapperId = createNode(
        diff.Resource ? "Resource" : "NotResource",
        NodeCategory.WRAPPER_RESOURCE,
        { resourceStatus: diff.ResourceStatus, stmtRemoved },
      )
      Object.entries(svcBuckets).forEach(([svc, { status, acts }]) => {
        const svcId = createNode(svc, NodeCategory.WRAPPER_SERVICES, {
          service: svc,
          stmtRemoved,
        })
        createEdge(actionWrapperId, svcId)

        acts.forEach((a) => {
          const aid = createNode(a, NodeCategory.ACTION, {
            actionStatus: status,
            service: svc,
            severity: (
              sensitiveOps[a] as string | undefined
            )?.toLowerCase() as ActionSeverity,
          })
          createEdge(svcId, aid)
          createEdge(aid, resourceWrapperId)
          addAttackInfo(aid, a)
        })
      })

      Object.entries(
        (diff.Resource || diff.NotResource) as Record<string, string[]>,
      ).forEach(([statusKey, resArr]) => {
        const mappedStatus = statusKey === "Removed" ? "Removed" : statusKey
        resArr.forEach((res) => {
          const resId = createNode(res, NodeCategory.RESOURCE, {
            resourceStatus: mappedStatus,
          })
          createEdge(resourceWrapperId, resId)
        })
      })
    })

    // 2️⃣ NoSidStatement array
    if (Array.isArray(enumeration.NoSidStatement)) {
      const noSidWrapperId = createNode(
        "NoSidStatement",
        NodeCategory.WRAPPER_NO_SID_STATEMENT,
      )
      createEdge(versionId, noSidWrapperId)

      enumeration.NoSidStatement.forEach((stmt: any, idx: number) => {
        const stmtId = createNode(`Statement ${idx}`, NodeCategory.STATEMENT, {
          effect: stmt.Effect,
          effectStatus: "N/A",
        })
        createEdge(noSidWrapperId, stmtId)

        const isAction = !!stmt.Action
        const actWrapId = createNode(
          isAction ? "Action" : "NotAction",
          NodeCategory.WRAPPER_ACTION,
        )
        createEdge(stmtId, actWrapId)
        const actArr: string[] = stmt.Action ?? stmt.NotAction ?? []

        // --- Begin Service Node Logic for NoSidStatement ---
        const svcBuckets: Record<string, { acts: string[] }> = {}
        actArr.forEach((a) => {
          const svc = a.split(":")[0]
          if (!svcBuckets[svc]) svcBuckets[svc] = { acts: [] }
          svcBuckets[svc].acts.push(a)
        })

        const isResource = !!stmt.Action
        const resWrapId = createNode(
          isResource ? "Resource" : "NotResource",
          NodeCategory.WRAPPER_RESOURCE,
        )

        Object.entries(svcBuckets).forEach(([svc, { acts }]) => {
          const svcId = createNode(svc, NodeCategory.WRAPPER_SERVICES, {
            service: svc,
          })
          createEdge(actWrapId, svcId)
          acts.forEach((a) => {
            const aid = createNode(a, NodeCategory.ACTION, {
              severity: (
                sensitiveOps[a] as string | undefined
              )?.toLowerCase() as ActionSeverity,
              service: svc,
            })
            createEdge(svcId, aid)
            createEdge(aid, resWrapId)
            addAttackInfo(aid, a)
          })
        })
        // --- End Service Node Logic for NoSidStatement ---
      })
    }
  }

  const addStatements = (parentId: string, statements: Statement[] = []) => {
    statements.forEach((stmt, idx) => {
      const { Effect: eff, Sid } = stmt as any
      const effect = eff as "Allow" | "Deny" | undefined
      const stmtId = createNode(
        Sid ? `Statement: ${Sid}` : `Statement ${idx}`,
        NodeCategory.STATEMENT,
        { effect },
      )
      createEdge(parentId, stmtId, effect)
      const actions = Array.isArray((stmt as any).Action)
        ? (stmt as any).Action
        : typeof (stmt as any).Action === "string"
          ? [(stmt as any).Action]
          : []
      const resources = Array.isArray((stmt as any).Resource)
        ? (stmt as any).Resource
        : typeof (stmt as any).Resource === "string"
          ? [(stmt as any).Resource]
          : []

      const serviceBuckets: Record<string, string[]> = {}
      actions.forEach((action: string) => {
        const svc = action.split(":")[0]
        if (!serviceBuckets[svc]) serviceBuckets[svc] = []
        serviceBuckets[svc].push(action)
      })

      const resWrapId = createNode(
        resources.length ? "Resources" : "Resource",
        NodeCategory.WRAPPER_RESOURCE,
      )

      Object.entries(serviceBuckets).forEach(([svc, acts]) => {
        const svcWrapId = createNode(svc, NodeCategory.WRAPPER_SERVICES)
        createEdge(stmtId, svcWrapId, effect)

        acts.forEach((act) => {
          const aid = createNode(act, NodeCategory.ACTION, {
            severity: (
              sensitiveOps[act] as string | undefined
            )?.toLowerCase() as ActionSeverity,
            service: svc,
          })
          createEdge(svcWrapId, aid, effect)
          createEdge(aid, resWrapId, effect)
          addAttackInfo(aid, act)
        })
      })

      resources.forEach((res: string) => {
        const resId = createNode(`${res}`, NodeCategory.RESOURCE)
        createEdge(resWrapId, resId, effect)
      })
    })
  }

  const attachPolicyList = (
    parentId: string,
    policies: IAMPolicy[] | undefined,
    dedupe: boolean,
    wrapperCategory: NodeCategory,
    wrapperLabel: string,
  ) => {
    if (!policies) {
      const wrapperId = createNode(wrapperLabel, wrapperCategory, {
        status: PolicyStatus.NO_ACCESS,
      })
      createEdge(parentId, wrapperId)
      return
    }

    if (policies.length === 0) {
      const wrapperId = createNode(wrapperLabel, wrapperCategory, {
        status: PolicyStatus.NO_POLICY,
      })
      createEdge(parentId, wrapperId)
      return
    }

    const wrapperId = createNode(wrapperLabel, wrapperCategory)
    createEdge(parentId, wrapperId)
    policies.forEach((policy) => {
      const isDuplicate =
        dedupe && policy.PolicyArn && seenPolicyArns.has(policy.PolicyArn)
      if (!isDuplicate && policy.PolicyArn) seenPolicyArns.add(policy.PolicyArn)

      let policyId: string

      if (
        isDuplicate &&
        policy.PolicyArn &&
        policyByArn.has(policy.PolicyArn)
      ) {
        policyId = policyByArn.get(policy.PolicyArn)!
      } else {
        let policySource: "AWS" | "Customer" | undefined
        if (policy.PolicyArn) {
          policySource = policy.PolicyArn.includes(":aws:policy/")
            ? "AWS"
            : "Customer"
        }
        policyId = createNode(
          `Policy: ${policy.PolicyName}`,
          NodeCategory.POLICY,
          {
            policySource,
          },
          policy,
        )

        // ---- HistoricVersion Handling ----
        if (policy.HistoricPolicyVersionEnumeration?.length) {
          const wrapId = createNode(
            "Historic Policy Versions",
            NodeCategory.WRAPPER_VERSION,
          )
          createEdge(policyId, wrapId, undefined, false, "bottom", "top")
          ;(nodeMap.get(policyId) as any).hasVersionWrapper = true
          policy.HistoricPolicyVersionEnumeration.forEach((enumeration) =>
            addHistoricEnumeration(wrapId, enumeration),
          )
        }

        if (policy.PolicyArn) policyByArn.set(policy.PolicyArn, policyId)
        addStatements(policyId, policy.Statement)
      }
      createEdge(wrapperId, policyId)
    })
  }

  // ---------------- Build tree ----------------

  const userId = createNode(
    `User: ${iamData.UserName}`,
    NodeCategory.USER,
    {},
    iamData,
  )

  const groupList = iamData.GroupList
  const roleList = iamData.RoleList
  let groupsRootId: string
  let rolesRootId: string

  if (!groupList) {
    groupsRootId = createNode("GroupList", NodeCategory.WRAPPER_GROUP, {
      status: GroupStatus.NO_ACCESS,
    })
    createEdge(userId, groupsRootId)
  }

  if (groupList?.length === 0) {
    groupsRootId = createNode("GroupList", NodeCategory.WRAPPER_GROUP, {
      status: GroupStatus.NO_GROUP,
    })
    createEdge(userId, groupsRootId)
  }
  if (!roleList) {
    rolesRootId = createNode("RoleList", NodeCategory.WRAPPER_ROLE, {
      status: RoleStatus.NO_ACCESS,
    })
    createEdge(userId, rolesRootId)
  }
  if (roleList?.length === 0) {
    rolesRootId = createNode("RoleList", NodeCategory.WRAPPER_ROLE, {
      status: RoleStatus.NO_ROLE,
    })
    createEdge(userId, rolesRootId)
  }
  if (groupList && groupList.length > 0) {
    groupsRootId = createNode("GroupList", NodeCategory.WRAPPER_GROUP)
    createEdge(userId, groupsRootId)
  }

  if (roleList && roleList.length > 0) {
    rolesRootId = createNode("RoleList", NodeCategory.WRAPPER_ROLE)
    createEdge(userId, rolesRootId)
  }

  attachPolicyList(
    userId,
    iamData.InlinePolicies || iamData.UserInlinePolicies,
    false,
    NodeCategory.WRAPPER_INLINE,
    "InlinePolicies",
  )
  attachPolicyList(
    userId,
    iamData.AttachedManagedPolicies,
    true,
    NodeCategory.WRAPPER_ATTACHED,
    "AttachedPolicies",
  )

  iamData.GroupList?.forEach((g) => {
    const gId = createNode(`Group: ${g.GroupName}`, NodeCategory.GROUP, {}, g)
    createEdge(groupsRootId, gId)
    attachPolicyList(
      gId,
      g.InlinePolicies,
      false,
      NodeCategory.WRAPPER_INLINE,
      "InlinePolicies",
    )
    attachPolicyList(
      gId,
      g.AttachedManagedPolicies,
      true,
      NodeCategory.WRAPPER_ATTACHED,
      "AttachedPolicies",
    )
  })

  iamData.RoleList?.forEach((r) => {
    const rId = createNode(`Role: ${r.RoleName}`, NodeCategory.ROLE, {}, r)
    createEdge(rolesRootId, rId)
    roleByArn.set(r.Arn, rId)
    attachPolicyList(
      rId,
      r.InlinePolicies,
      false,
      NodeCategory.WRAPPER_INLINE,
      "InlinePolicies",
    )
    attachPolicyList(
      rId,
      r.AttachedManagedPolicies,
      true,
      NodeCategory.WRAPPER_ATTACHED,
      "AttachedPolicies",
    )
  })

  iamData.RoleList?.forEach((r) => {
    const targetId = roleByArn.get(r.Arn)
    r.AssumeRolePolicyStatement?.forEach((stmt) => {
      const principal = (stmt as any).Principal?.AWS
      const principals = Array.isArray(principal) ? principal : [principal]
      principals.forEach((arn: string) => {
        const srcId = roleByArn.get(arn)
        if (srcId) createEdge(srcId, targetId!, "Allow", true)
      })
    })
  })

  return { nodes: nodeMap, edges }
}

export interface AccountJSON {
  accounts: {
    accountId: string
    userIds: { userAccessKey: string; userName: string }[]
  }[]
}

interface AccountGraphNodeMeta {
  label: string
  type: NodeCategory
  accessKey?: string // only for ACCOUNT_USER
  width?: number
  mode?: string
}

interface AccountGraphEdgeMeta {
  source: string
  target: string
}

function accountDagreLayout(
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 80 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => {
    const w = (n.data as any).width ?? NODE_WIDTH
    g.setNode(n.id, { width: w, height: NODE_HEIGHT })
  })
  edges.forEach((e) => g.setEdge(e.source, e.target))
  dagre.layout(g)

  return {
    nodes: nodes.map((n) => {
      const { x, y } = g.node(n.id)
      const w = (n.data as any).width ?? NODE_WIDTH
      return {
        ...n,
        position: { x: x - w / 2, y: y - NODE_HEIGHT / 2 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      }
    }),
    edges,
  }
}

export function buildAccountGraph(
  json: SessionData,
  mode?: string,
): {
  nodes: Node<AccountGraphNodeMeta>[]
  edges: Edge[]
} {
  if (!json || !json.accounts || json.accounts.length === 0) {
    return { nodes: [], edges: [] }
  }
  let id = 0
  const next = () => `acc_node_${++id}`
  const calcW = (label: string) =>
    Math.min(400, Math.max(160, label.length * 7 + 40)) // 160-400 px
  const nodes: Node<AccountGraphNodeMeta>[] = []
  const edges: Edge[] = []

  const addNode = (
    label: string,
    type: NodeCategory,
    extra: Partial<AccountGraphNodeMeta> = {},
  ) => {
    const nodeId = next()
    const width = calcW(label)
    nodes.push({
      id: nodeId,
      type,
      data: { label, type, ...extra, width },
      position: { x: 0, y: 0 },
    })
    return nodeId
  }

  const addEdge = (s: string, t: string) =>
    edges.push({ id: `${s}-${t}`, source: s, target: t })

  json.accounts.forEach((acct) => {
    const accountId = addNode(
      `Account: ${acct.accountId}`,
      NodeCategory.ACCOUNT,
    )

    acct.userIds.forEach((u) => {
      const label = `User: ${u.userName}`
      const userId = addNode(label, NodeCategory.ACCOUNT_USER, {
        accessKey: u.userAccessKey,
        mode,
      })
      addEdge(accountId, userId)
      if (mode === "singleFuzz") {
        const sepGraphLabel = `Separate Graph`
        const sepGraphId = addNode(sepGraphLabel, NodeCategory.SEPARATE_GRAPH)
        addEdge(userId, sepGraphId)

        const fuzzGraphLabel = `Fuzz Graph`
        const fuzzGraphId = addNode(fuzzGraphLabel, NodeCategory.FUZZ_GRAPH)
        addEdge(userId, fuzzGraphId)
      }
    })
  })

  return accountDagreLayout(nodes, edges)
}
