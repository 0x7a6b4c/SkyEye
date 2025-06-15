import {
  ActionSeverity,
  NodeCategory,
  PolicyStatus,
  SimInlinePolicy,
  SimManagedPolicy,
  Statement,
} from "@/types/IAM/enums"
import { GraphNodeMeta, GraphEdgeMeta } from "@/libs/helpers/graph-helpers"
import { SimulatePrincipalPolicyTechnique as SimTech } from "@/types/IAM/enums" // path as you like
import AWS_ATTACK_MAP from "@/data/mitre_attack_aws_actions.json"
import sensitiveOps from "@/data/iam_sensitive_operations.json"

export function buildPrincipalSimulationGraph(sim: SimTech): {
  nodes: Map<string, GraphNodeMeta>
  edges: GraphEdgeMeta[]
} {
  /* ──────────────────── init ──────────────────── */
  const nodeMap = new Map<string, GraphNodeMeta>()
  const edges: GraphEdgeMeta[] = []
  let id = 0
  const next = () => `node_${++id}`

  const pickPrimitives = (obj: any) =>
    Object.fromEntries(
      Object.entries(obj ?? {}).filter(
        ([, v]) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean",
      ),
    )

  const addNode = (
    label: string,
    type: NodeCategory,
    extra: Partial<GraphNodeMeta> = {},
    raw?: any,
  ) => {
    const nid = next()
    nodeMap.set(nid, {
      label,
      type,
      hasIncoming: false,
      hasOutgoing: false,
      ...extra,
      ...pickPrimitives(raw),
    })
    return nid
  }

  const addEdge = (
    s: string,
    t: string,
    effect?: "Allow" | "Deny",
    dashed = false,
    srcHandle?: string,
    tgtHandle?: string,
  ) => {
    edges.push({
      source: s,
      target: t,
      effect,
      dashed,
      sourceHandle: srcHandle,
      targetHandle: tgtHandle,
    })
    nodeMap.get(s)!.hasOutgoing = true
    nodeMap.get(t)!.hasIncoming = true
  }

  /* ──────────────────── TTP helpers ──────────────────── */
  const addAttackInfo = (actionId: string, act: string) => {
    const info = (AWS_ATTACK_MAP as any).AWS_Actions?.[act]
    if (!info) return

    const [tactic = "", technique = "", sub = ""] = info.TTPs.split(":")
    const ttpLabel = sub
      ? `${tactic}:${technique}:${sub}`
      : `${tactic}:${technique}`

    const ttpId = addNode(ttpLabel, NodeCategory.TTP, {
      tactic,
      technique,
      subTechnique: sub,
      width: 380,
    })
    addEdge(actionId, ttpId, undefined, false, "bottom", "top")

    addEdge(
      actionId,
      addNode("Abuse Methodology", NodeCategory.ABUSE_METHODOLOGY, {
        description: info.AbuseMethodology,
        width: 380,
      }),
      undefined,
      false,
      "bottom",
      "top",
    )
    addEdge(
      actionId,
      addNode("Commands", NodeCategory.COMMAND, {
        commands: info.Commands,
        width: 380,
      }),
      undefined,
      false,
      "bottom",
      "top",
    )
  }

  /* ──────────────────── leaf builders ──────────────────── */
  const addSimplePolicy = (
    parent: string,
    polName: string,
    actions: string[],
    resources: string[],
  ) => {
    const pid = addNode(`Policy: ${polName}`, NodeCategory.POLICY)

    addEdge(parent, pid)

    /** bucket actions by service e.g. s3:GetObject → s3 */
    const svcBuckets: Record<string, string[]> = {}
    actions.forEach((a) => {
      const svc = a.split(":")[0]
      ;(svcBuckets[svc] ??= []).push(a)
    })

    const resWrap = addNode(
      resources.length ? "Resources" : "Resource",
      NodeCategory.WRAPPER_RESOURCE,
    )

    Object.entries(svcBuckets).forEach(([svc, acts]) => {
      const svcWrap = addNode(svc, NodeCategory.WRAPPER_SERVICES, {
        service: svc,
      })
      addEdge(pid, svcWrap)

      acts.forEach((act) => {
        const aid = addNode(act, NodeCategory.ACTION, {
          service: svc,
          severity: (sensitiveOps as any)[act]?.toLowerCase() as ActionSeverity,
        })
        addEdge(svcWrap, aid)
        addEdge(aid, resWrap)
        addAttackInfo(aid, act)
      })
    })

    resources.forEach((r) =>
      addEdge(resWrap, addNode(r, NodeCategory.RESOURCE)),
    )
  }

  const addStatementPolicy = (
    parent: string,
    pol: { PolicyName: string; Statement: Statement[] },
  ) => {
    const pid = addNode(`Policy: ${pol.PolicyName}`, NodeCategory.POLICY)
    addEdge(parent, pid)
    addStatements(pid, pol.Statement)
  }

  const addStatements = (parent: string, stmts: Statement[] = []) => {
    stmts.forEach((stmt, idx) => {
      const sidLabel = (stmt as any).Sid
        ? `Statement: ${(stmt as any).Sid}`
        : `Statement ${idx}`

      const stmtId = addNode(sidLabel, NodeCategory.STATEMENT, {
        effect: stmt.Effect as any,
      })
      addEdge(parent, stmtId, stmt.Effect as "Allow" | "Deny")

      /* ---------- unfold Actions + Resources exactly like the old builder ---------- */

      // 1. normalise arrays
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

      // 2. bucket actions by AWS service (s3:GetObject → s3)
      const svcBuckets: Record<string, string[]> = {}
      actions.forEach((act: string) => {
        const svc = act.split(":")[0]
        ;(svcBuckets[svc] ??= []).push(act)
      })

      // 3. create the *Resource wrapper* once per statement
      const resWrapId = addNode(
        resources.length ? "Resources" : "Resource",
        NodeCategory.WRAPPER_RESOURCE,
      )

      // 4. service → action chain
      Object.entries(svcBuckets).forEach(([svc, acts]) => {
        const svcWrapId = addNode(svc, NodeCategory.WRAPPER_SERVICES, {
          service: svc,
        })
        addEdge(stmtId, svcWrapId)

        acts.forEach((act) => {
          const aid = addNode(act, NodeCategory.ACTION, {
            service: svc,
            severity: (sensitiveOps as any)[
              act
            ]?.toLowerCase() as ActionSeverity,
          })
          addEdge(svcWrapId, aid)
          addEdge(aid, resWrapId)
          addAttackInfo(aid, act)
        })
      })

      // 5. resources
      resources.forEach((r: string) =>
        addEdge(resWrapId, addNode(r, NodeCategory.RESOURCE)),
      )
    })
  }

  /* ──────────────────── BEGIN graph ──────────────────── */

  /* 1️⃣  User */
  const userId = addNode(
    `User: ${sim.UserName}`,
    NodeCategory.USER,
    {
      accessKey: sim.AccessKey,
      account: sim.Account,
    },
    sim,
  )

  /* helper: attach a list of *inline* policies */
  const attachInline = (
    parent: string,
    list: SimInlinePolicy[] | undefined,
    wrapperLabel: string,
    wrapperCat: NodeCategory,
  ) => {
    /* ①  decide status */
    if (!list) {
      const w = addNode(wrapperLabel, wrapperCat, {
        status: PolicyStatus.NO_ACCESS,
      })
      addEdge(parent, w)
      return
    }
    if (list.length === 0) {
      const w = addNode(wrapperLabel, wrapperCat, {
        status: PolicyStatus.NO_POLICY,
      })
      addEdge(parent, w)
      return
    }

    /* ②  normal, populated wrapper */
    const wrap = addNode(wrapperLabel, wrapperCat)
    addEdge(parent, wrap)

    list.forEach((pol) =>
      addSimplePolicy(wrap, pol.PolicyObjectId, pol.Action, pol.Resource),
    )
  }

  /* helper: attach a list of *managed* policies */
  const attachManaged = (
    parent: string,
    list: SimManagedPolicy[] | undefined,
  ) => {
    /* ①  status logic */
    if (!list) {
      const w = addNode("AttachedPolicies", NodeCategory.WRAPPER_ATTACHED, {
        status: PolicyStatus.NO_ACCESS,
      })
      addEdge(parent, w)
      return
    }
    if (list.length === 0) {
      const w = addNode("AttachedPolicies", NodeCategory.WRAPPER_ATTACHED, {
        status: PolicyStatus.NO_POLICY,
      })
      addEdge(parent, w)
      return
    }

    /* ②  populated wrapper */
    const wrap = addNode("AttachedPolicies", NodeCategory.WRAPPER_ATTACHED)
    addEdge(parent, wrap)

    list.forEach((pol) => {
      if (pol.Statement) {
        addStatementPolicy(wrap, pol as any) // AWS-managed style
      } else {
        addSimplePolicy(
          wrap,
          pol.PolicyName,
          pol.Action ?? [],
          pol.Resource ?? ["*"],
        ) // customer-managed style
      }
    })
  }

  /* 2️⃣  Root-level policy wrappers */
  attachInline(
    userId,
    sim.UserInlinePolicies,
    "UserInlinePolicies",
    NodeCategory.WRAPPER_INLINE,
  )
  attachInline(
    userId,
    sim.GroupInlinePolicies,
    "GroupInlinePolicies",
    NodeCategory.WRAPPER_GROUP,
  )
  attachManaged(userId, sim.AttachedManagedPolicies)

  /* 3️⃣  Roles  */
  const roleWrap = addNode("RoleList", NodeCategory.WRAPPER_ROLE)
  addEdge(userId, roleWrap)

  const roleByArn = new Map<string, string>()

  ;(sim.RoleList ?? []).forEach((role) => {
    const rid = addNode(`Role: ${role.RoleName}`, NodeCategory.ROLE, {}, role)
    addEdge(roleWrap, rid)
    roleByArn.set(role.Arn, rid)

    attachInline(
      rid,
      role.RoleInlinePolicies,
      "InlinePolicies",
      NodeCategory.WRAPPER_INLINE,
    )
    attachManaged(rid, role.AttachedManagedPolicies)
  })

  /* 4️⃣  AssumeRole edges */
  ;(sim.RoleList ?? []).forEach((role) => {
    const tgt = roleByArn.get(role.Arn)
    ;(role.AssumeRolePolicyDocument ?? []).forEach((stmt) => {
      const principal = (stmt as any).Principal?.AWS
      const arns = Array.isArray(principal) ? principal : [principal]
      arns.forEach((arn) => {
        const src = roleByArn.get(arn)
        if (src && tgt) addEdge(src, tgt, "Allow", true)
      })
    })
  })

  return { nodes: nodeMap, edges }
}

export interface IAMFuzzingTechnique {
  UserName: string
  Arn: string
  AccessKey: string
  Account: string
  Action: Record<string, string[]> // { service: [ "service:Action", ... ] }
}

export function buildFuzzingGraph(fuzz: IAMFuzzingTechnique): {
  nodes: Map<string, GraphNodeMeta>
  edges: GraphEdgeMeta[]
} {
  /* ─── boilerplate helpers ─────────────────────────────────────────── */
  const nodes = new Map<string, GraphNodeMeta>()
  const edges: GraphEdgeMeta[] = []
  let id = 0
  const next = () => `node_${++id}`

  const addNode = (
    label: string,
    type: NodeCategory,
    extra: Partial<GraphNodeMeta> = {},
  ) => {
    const nid = next()
    nodes.set(nid, {
      label,
      type,
      hasIncoming: false,
      hasOutgoing: false,
      ...extra,
    })
    return nid
  }

  const addEdge = (
    s: string,
    t: string,
    srcHandle?: string,
    tgtHandle?: string,
  ) => {
    edges.push({
      source: s,
      target: t,
      sourceHandle: srcHandle,
      targetHandle: tgtHandle,
    })
    nodes.get(s)!.hasOutgoing = true
    nodes.get(t)!.hasIncoming = true
  }

  /* ─── TTP / Command / Abuse enrichment for Action view ───────────── */
  const addAttackInfo = (actionId: string, action: string) => {
    const info = (AWS_ATTACK_MAP as any).AWS_Actions?.[action]
    if (!info) return

    const [tac = "", tech = "", sub = ""] = info.TTPs.split(":")
    const ttpLabel = sub ? `${tac}:${tech}:${sub}` : `${tac}:${tech}`

    addEdge(
      actionId,
      addNode(ttpLabel, NodeCategory.TTP, {
        tactic: tac,
        technique: tech,
        subTechnique: sub,
        width: 380,
      }),
      "bottom",
      "top",
    )
    addEdge(
      actionId,
      addNode("Abuse Methodology", NodeCategory.ABUSE_METHODOLOGY, {
        description: info.AbuseMethodology,
        width: 380,
      }),
      "bottom",
      "top",
    )
    addEdge(
      actionId,
      addNode("Commands", NodeCategory.COMMAND, {
        commands: info.Commands,
        width: 380,
      }),
      "bottom",
      "top",
    )
  }

  /* ─── 1️⃣  User node ──────────────────────────────────────────────── */
  const userId = addNode(`User: ${fuzz.UserName}`, NodeCategory.USER, {
    arn: fuzz.Arn,
    accessKey: fuzz.AccessKey,
    account: fuzz.Account,
  })

  /* ─── 2️⃣  Service → Action fan-out ──────────────────────────────── */
  Object.entries(fuzz.Action).forEach(([service, acts]) => {
    const svcId = addNode(service, NodeCategory.WRAPPER_SERVICES, { service })
    addEdge(userId, svcId)

    acts.forEach((act) => {
      const aid = addNode(act, NodeCategory.ACTION, {
        service,
        severity: (sensitiveOps as any)[act]?.toLowerCase() as ActionSeverity,
      })
      addEdge(svcId, aid)
      addAttackInfo(aid, act)
    })
  })

  return { nodes, edges }
}
