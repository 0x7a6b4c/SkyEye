import CustomEdge from "@/components/features/AWS/TreeGraph/TreeEdge/CustomEdge"
import AccountUserNode from "@/components/features/AWS/TreeGraph/TreeNodes/AccountUserNode"
import ActionNode from "@/components/features/AWS/TreeGraph/TreeNodes/ActionNode"
import AwsAccountNode from "@/components/features/AWS/TreeGraph/TreeNodes/AwsAccountNode"
import CommandNode from "@/components/features/AWS/TreeGraph/TreeNodes/CommandNode"
import FuzzGraphNode from "@/components/features/AWS/TreeGraph/TreeNodes/FuzzGraph"
import GroupNode from "@/components/features/AWS/TreeGraph/TreeNodes/GroupNode"
import LogoNode from "@/components/features/AWS/TreeGraph/TreeNodes/LogoNode"
import MethodologyNode from "@/components/features/AWS/TreeGraph/TreeNodes/MethodologyNode"
import PolicyNode from "@/components/features/AWS/TreeGraph/TreeNodes/PolicyNode"
import PolicyVersionNode from "@/components/features/AWS/TreeGraph/TreeNodes/PolicyVersionNode"
import ResourceNode from "@/components/features/AWS/TreeGraph/TreeNodes/ResourceNode"
import RoleNode from "@/components/features/AWS/TreeGraph/TreeNodes/RoleNode"
import SeparateGraphNode from "@/components/features/AWS/TreeGraph/TreeNodes/SeparateGraphNode"
import ServiceNode from "@/components/features/AWS/TreeGraph/TreeNodes/ServiceNode"
import StatementNode from "@/components/features/AWS/TreeGraph/TreeNodes/StatementNode"
import TTPNode from "@/components/features/AWS/TreeGraph/TreeNodes/TTPNode"
import UserNode from "@/components/features/AWS/TreeGraph/TreeNodes/UserNode"
import WrapperActionNode from "@/components/features/AWS/TreeGraph/TreeNodes/WrapperActionNode"
import WrapperAttachedNode from "@/components/features/AWS/TreeGraph/TreeNodes/WrapperAttached"
import WrapperInlineNode from "@/components/features/AWS/TreeGraph/TreeNodes/WrapperInline"
import WrapperNoSidStatementNode from "@/components/features/AWS/TreeGraph/TreeNodes/WrapperNoSidStatement"
import WrapperPolicyVersionNode from "@/components/features/AWS/TreeGraph/TreeNodes/WrapperPolicyVersionNode"
import { EdgeTypes, Node, NodeTypes } from "reactflow"

// immutable enums & IAM DTOs
export const NodeCategory = Object.freeze({
  USER: "USER",
  GROUP: "GROUP",
  ROLE: "ROLE",
  WRAPPER_INLINE: "WRAPPER_INLINE",
  WRAPPER_ATTACHED: "WRAPPER_ATTACHED",
  WRAPPER_GROUP: "WRAPPER_GROUP",
  WRAPPER_ROLE: "WRAPPER_ROLE",
  POLICY: "POLICY",
  STATEMENT: "STATEMENT",
  ACTION: "ACTION",
  RESOURCE: "RESOURCE",
  WRAPPER_RESOURCE: "WRAPPER_RESOURCE",
  WRAPPER_VERSION: "WRAPPER_VERSION",
  POLICY_VERSION: "POLICY_VERSION",
  WRAPPER_NO_SID_STATEMENT: "WRAPPER_NO_SID_STATEMENT",
  WRAPPER_SERVICES: "WRAPPER_SERVICES",
  WRAPPER_ACTION: "WRAPPER_ACTION",
  LOGO: "LOGO",
  ABUSE_METHODOLOGY: "ABUSE_METHODOLOGY",
  COMMAND: "COMMAND",
  TTP: "TTP",
  ACCOUNT: "ACCOUNT",
  ACCOUNT_USER: "ACCOUNT_USER",
  FUZZ_GRAPH: "FUZZ_GRAPH",
  SEPARATE_GRAPH: "SEPARATE_GRAPH",
} as const)
export type NodeCategory = (typeof NodeCategory)[keyof typeof NodeCategory]

export const PolicyStatus = Object.freeze({
  NO_ACCESS: "NO_ACCESS",
  NO_POLICY: "NO_POLICY",
  REGULAR: "REGULAR",
} as const)
export type PolicyStatus = (typeof PolicyStatus)[keyof typeof PolicyStatus]

export const GroupStatus = Object.freeze({
  NO_ACCESS: "NO_ACCESS",
  NO_GROUP: "NO_GROUP",
} as const)
export type GroupStatus = (typeof GroupStatus)[keyof typeof GroupStatus]

export const RoleStatus = Object.freeze({
  NO_ACCESS: "NO_ACCESS",
  NO_ROLE: "NO_ROLE",
} as const)
export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus]

export const nodeTypeComponents: NodeTypes = {
  [NodeCategory.USER]: UserNode as React.ComponentType<any>,
  [NodeCategory.GROUP]: GroupNode as React.ComponentType<any>,
  [NodeCategory.ROLE]: RoleNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_INLINE]: WrapperInlineNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_ATTACHED]:
    WrapperAttachedNode as React.ComponentType<any>,
  [NodeCategory.POLICY]: PolicyNode as React.ComponentType<any>,
  [NodeCategory.STATEMENT]: StatementNode as React.ComponentType<any>,
  [NodeCategory.ACTION]: ActionNode as React.ComponentType<any>,
  [NodeCategory.RESOURCE]: ResourceNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_GROUP]: GroupNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_ROLE]: RoleNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_RESOURCE]: ResourceNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_VERSION]:
    WrapperPolicyVersionNode as React.ComponentType<any>,
  [NodeCategory.POLICY_VERSION]: PolicyVersionNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_NO_SID_STATEMENT]:
    WrapperNoSidStatementNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_SERVICES]: ServiceNode as React.ComponentType<any>,
  [NodeCategory.WRAPPER_ACTION]: WrapperActionNode as React.ComponentType<any>,
  [NodeCategory.LOGO]: LogoNode as React.ComponentType<any>,
  [NodeCategory.ABUSE_METHODOLOGY]: MethodologyNode as React.ComponentType<any>,
  [NodeCategory.COMMAND]: CommandNode as React.ComponentType<any>,
  [NodeCategory.TTP]: TTPNode as React.ComponentType<any>,
  [NodeCategory.ACCOUNT]: AwsAccountNode as React.ComponentType<any>,
  [NodeCategory.ACCOUNT_USER]: AccountUserNode as React.ComponentType<any>,
  [NodeCategory.FUZZ_GRAPH]: FuzzGraphNode as React.ComponentType<any>,
  [NodeCategory.SEPARATE_GRAPH]: SeparateGraphNode as React.ComponentType<any>,
}

export const nodeMinimapColor = (node: Node) => {
  switch (node.type) {
    case NodeCategory.USER:
      return "#60a5fa"
    case NodeCategory.GROUP:
      return "#c084fc"
    case NodeCategory.WRAPPER_GROUP:
      return "#c084fc"
    case NodeCategory.ROLE:
      return "#fb923c"
    case NodeCategory.WRAPPER_ROLE:
      return "#fb923c"
    case NodeCategory.POLICY:
      return "#4ade80"
    case NodeCategory.STATEMENT:
      return "#2dd4bf"
    case NodeCategory.ACTION:
      return "#f87171"
    case NodeCategory.RESOURCE:
      return "#facc15"
    case NodeCategory.WRAPPER_RESOURCE:
      return "#facc15"
    case NodeCategory.LOGO:
      return "#00000000"
    case NodeCategory.ABUSE_METHODOLOGY:
      return "oklch(79.2% 0.209 151.711)"
    case NodeCategory.COMMAND:
      return "oklch(92.4% 0.12 95.746)"
    case NodeCategory.TTP:
      return "oklch(62.3% 0.214 259.815)"
    case NodeCategory.ACCOUNT:
      return "oklch(92.4% 0.12 95.746)"
    case NodeCategory.ACCOUNT_USER:
      return "oklch(70.7% 0.165 254.624)"
    case NodeCategory.FUZZ_GRAPH:
      return "oklch(85.5% 0.138 181.071)"
    case NodeCategory.SEPARATE_GRAPH:
      return "oklch(87% 0.065 274.039)"
    case NodeCategory.WRAPPER_SERVICES:
      return "oklch(90.1% 0.058 230.902)"
    case NodeCategory.WRAPPER_ACTION:
      return "#facc15"
    case NodeCategory.WRAPPER_VERSION:
      return "oklch(58.5% 0.233 277.117)"
    default:
      return "#d1d5db"
  }
}
export const edgeTypes: EdgeTypes = {
  gradient: CustomEdge,
}
export interface IAMPolicy {
  PolicyName: string
  PolicyArn?: string
  Statement: any[]
  HistoricPolicyVersionEnumeration?: any[]
}
export interface IAMGroup {
  GroupName: string
  InlinePolicies?: IAMPolicy[]
  AttachedManagedPolicies?: IAMPolicy[]
}
export interface IAMRole {
  RoleName: string
  Arn: string
  InlinePolicies?: IAMPolicy[]
  AttachedManagedPolicies?: IAMPolicy[]
  AssumeRolePolicyStatement?: any[]
}
export interface IAMData {
  UserName: string
  InlinePolicies?: IAMPolicy[]
  UserInlinePolicies?: IAMPolicy[]
  AttachedManagedPolicies?: IAMPolicy[]
  GroupList?: IAMGroup[]
  RoleList?: IAMRole[]
}

export const ActionSeverity = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  PRIVESC: "privesc-vector",
} as const)
export type ActionSeverity =
  (typeof ActionSeverity)[keyof typeof ActionSeverity]

export const ActionStatus = Object.freeze({
  REMOVED: "Removed",
  NEW: "New",
  KEPT: "Kept",
} as const)
export type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus]

export type Statement = Record<string, unknown>

export interface AttackDetails {
  TTPs?: string
  AbuseMethodology?: string
  Commands?: string[]
}
export interface SimulatePrincipalPolicyTechnique {
  UserName: string
  Arn: string
  AccessKey: string
  Account: string
  UserInlinePolicies?: SimInlinePolicy[]
  GroupInlinePolicies?: SimInlinePolicy[]
  AttachedManagedPolicies?: SimManagedPolicy[]
  RoleList?: SimRole[]
}

export interface SimInlinePolicy {
  PolicyObjectId: string
  Action: string[] // always array
  Resource: string[] // always array
}

export interface SimManagedPolicy {
  PolicyName: string
  PolicyArn?: string // only on AWS managed ones
  Statement?: Statement[] // present ↔ old format
  Action?: string[] // present ↔ simple custom policy
  Resource?: string[] // present ↔ simple custom policy
  /* + all the other optional keys you don’t need here */
}

export interface SimRole {
  RoleName: string
  Arn: string
  AssumeRolePolicyDocument?: Statement[]
  RoleInlinePolicies?: SimInlinePolicy[]
  AttachedManagedPolicies?: SimManagedPolicy[]
}

export type IAMScanMode = "separate" | "cross" | "single" | "singleFuzz"
