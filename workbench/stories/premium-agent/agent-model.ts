import type { StatusIntent } from "@mayf3/ui-react";
import type { IconName } from "../visual-directions/Icon";

export type TaskStatus = "queued" | "running" | "paused" | "waiting" | "blocked" | "completed" | "failed";
export type TaskAction = "start" | "pause" | "resume";
export type ApprovalDecision = "approved" | "rejected";
export type Risk = "low" | "high";
export type RunMode = "plan" | "sandbox";
export type Context = "workspace" | "regression";

export interface TaskPrompt {
  intent: string;
  context: Context;
  mode: RunMode;
  attachment?: string;
}

export interface AgentTask {
  id: string;
  name: string;
  agent: string | null;
  status: TaskStatus;
  progress: number;
  updatedAt: string;
  intervention: boolean;
  stage: string;
  publicUpdate: string;
  prompt?: TaskPrompt;
  review?: {
    failureEventId: string;
    toolStatus: ToolCall["status"];
    approvalStatus: AgentApproval["status"];
  };
}

export interface AgentApproval {
  id: string;
  title: string;
  requester: string;
  owner: string;
  risk: Risk;
  scope: string;
  consequence: string;
  status: "pending" | ApprovalDecision;
  taskId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  command: string;
  actor: string;
  taskId?: string;
  status: "succeeded" | "failed";
  input: string;
  result: string;
  error?: string;
  attempts: number;
}

export type EventKind = "running" | "waiting" | "failed" | "recovered" | "delivered" | "queued" | "stopped";
export interface AgentEvent {
  id: string;
  kind: EventKind;
  actor: string;
  time: string;
  title: string;
  taskId?: string;
  toolCallId?: string;
  approvalDecision?: ApprovalDecision;
}

export interface AgentChange {
  id: string;
  name: string;
  before: string;
  after: string;
  scope: string;
  approval: AgentApproval["status"];
}

export interface DeliverySummary {
  completed: string;
  verification: string;
  evidence: ReadonlyArray<{ label: string; href: string }>;
  risk: string;
  owner: string;
}

export const weeklyDelivery = { completed: 18, planned: 21 } as const;

export const workspaceMetrics = {
  active: 24,
  recovery: "94.2%",
  delivered: `${weeklyDelivery.completed}/${weeklyDelivery.planned}`,
} as const;

export const agentTaskAnchor = (id: string) => `agent-task-${id}`;
export const agentEventAnchor = (id: string) => `agent-event-${id}`;
export const agentToolAnchor = (id: string) => `agent-tool-${id}`;

export const taskStatus = {
  queued: { label: "已排队", intent: "neutral", icon: "clock" },
  running: { label: "执行中", intent: "info", icon: "pulse" },
  paused: { label: "已暂停", intent: "warning", icon: "clock" },
  waiting: { label: "待确认", intent: "warning", icon: "clock" },
  blocked: { label: "待重试", intent: "warning", icon: "clock" },
  completed: { label: "已完成", intent: "success", icon: "check" },
  failed: { label: "失败", intent: "danger", icon: "shield" },
} as const satisfies Record<TaskStatus, { label: string; intent: StatusIntent; icon: IconName }>;

export const approvalStatus = {
  pending: { label: "待审批", intent: "warning" },
  approved: { label: "已批准", intent: "success" },
  rejected: { label: "已拒绝", intent: "danger" },
} as const satisfies Record<AgentApproval["status"], { label: string; intent: StatusIntent }>;

export const activityKind = {
  running: { label: "执行", intent: "info", icon: "pulse" },
  waiting: { label: "等待", intent: "warning", icon: "clock" },
  failed: { label: "失败", intent: "danger", icon: "shield" },
  recovered: { label: "恢复", intent: "success", icon: "check" },
  delivered: { label: "交付", intent: "success", icon: "delivery" },
  queued: { label: "排队", intent: "neutral", icon: "layers" },
  stopped: { label: "暂停", intent: "warning", icon: "clock" },
} as const satisfies Record<EventKind, { label: string; intent: StatusIntent; icon: IconName }>;

export const promptContexts = [
  { id: "workspace", label: "当前工作区" },
  { id: "regression", label: "回归验收" },
] satisfies { id: Context; label: string }[];

export const promptModes = [
  { id: "plan", label: "仅拟计划" },
  { id: "sandbox", label: "沙箱演示" },
] satisfies { id: RunMode; label: string }[];

export const initialTasks: readonly AgentTask[] = [
  { id: "a", name: "语义 Token 整理", agent: "A", status: "completed", progress: 100, updatedAt: "10:42", intervention: false,
    stage: "已完成交付", publicUpdate: "语义角色清单与差异记录已就绪。" },
  { id: "b", name: "交互组件适配", agent: "B", status: "running", progress: 68, updatedAt: "10:18", intervention: false,
    stage: "验证控件状态", publicUpdate: "正在核对焦点、键盘与弹层主题。" },
  { id: "c", name: "Playwright 回归测试", agent: "C", status: "waiting", progress: 82, updatedAt: "09:56", intervention: true,
    stage: "等待基线审批", publicUpdate: "已生成对照图，等待人工确认差异。" },
];

export const initialApprovals: readonly AgentApproval[] = [
  { id: "baseline", title: "更新视觉回归基线", requester: "Agent C", owner: "前端验收负责人", risk: "high",
    scope: "替换预览分支中的移动端和深色截图基线",
    consequence: "批准后，后续回归会用新图作为预期结果。未经复核的变化可能被视为正常。",
    status: "pending", taskId: "c" },
  { id: "coverage", title: "生成覆盖率摘要", requester: "Agent A", owner: "组件维护人", risk: "low",
    scope: "读取当前回归记录，生成工作区摘要",
    consequence: "增加一份只读覆盖记录，测试基线与发布资产保持原样。",
    status: "pending" },
];

export const initialTools: readonly ToolCall[] = [
  { id: "tokens", name: "语义映射检查", command: "tokens.check", actor: "Agent A", status: "succeeded",
    input: "根 Token 清单与 React 组件角色引用", result: "语义角色引用完整，未发现缺失映射。", attempts: 1 },
  { id: "snapshots", name: "快照索引校验", command: "snapshots.index", actor: "Agent C", taskId: "c", status: "failed",
    input: "390px 移动端 · 深色截图清单", result: "已保留生成的对照图。索引校验需要重试。",
    error: "索引与截图清单不一致。尚未应用截图基线。", attempts: 1 },
];

export const initialEvents: readonly AgentEvent[] = [
  { id: "delivery", time: "10:42", actor: "Agent A", kind: "delivered", title: "提交语义 Token 清单" },
  { id: "recovered", time: "10:31", actor: "Agent B", kind: "recovered", title: "验证任务恢复运行" },
  { id: "failure", time: "10:24", actor: "Agent C", kind: "failed", title: "移动端快照索引校验失败", taskId: "c", toolCallId: "snapshots" },
  { id: "running", time: "10:18", actor: "Agent B", kind: "running", title: "开始适配交互组件" },
  { id: "waiting", time: "09:56", actor: "Agent C", kind: "waiting", title: "提出截图基线审批", taskId: "c" },
];

export function availableTaskAction(task: AgentTask): TaskAction | undefined {
  if (task.intervention) return;
  if (task.status === "running") return "pause";
  if (task.status === "paused") return "resume";
  if (task.status === "queued") return "start";
}
