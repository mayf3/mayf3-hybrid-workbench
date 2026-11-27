import { useReducer } from "react";
import {
  availableTaskAction, initialApprovals, initialEvents, initialTasks, initialTools, workspaceMetrics,
  type AgentApproval, type AgentChange, type AgentEvent, type AgentTask, type ApprovalDecision,
  type DeliverySummary, type EventKind, type TaskAction, type TaskPrompt, type ToolCall,
} from "./agent-model";

interface WorkspaceState {
  tasks: readonly AgentTask[];
  approvals: readonly AgentApproval[];
  calls: readonly ToolCall[];
  events: readonly AgentEvent[];
  sequence: number;
}

type WorkspaceAction =
  | { type: "task"; id: string; action: TaskAction }
  | { type: "approval"; id: string; decision: ApprovalDecision }
  | { type: "retry"; id: string }
  | { type: "prompt"; prompt: TaskPrompt };

const initialState: WorkspaceState = {
  tasks: initialTasks,
  approvals: initialApprovals,
  calls: initialTools,
  events: initialEvents,
  sequence: 0,
};

const taskActions = {
  pause: { status: "paused", stage: "执行已暂停", publicUpdate: "暂停在当前进度，等待继续。", event: "暂停任务", kind: "stopped" },
  resume: { status: "running", stage: "验证控件状态", publicUpdate: "从已保存的进度继续。", event: "继续任务", kind: "recovered" },
  start: { status: "running", stage: "准备执行", publicUpdate: "本地任务已进入模拟执行阶段。", event: "开始任务", kind: "running" },
} as const;

function eventTime(sequence: number) {
  const minuteOfDay = 10 * 60 + 42 + sequence;
  const hours = String(Math.floor(minuteOfDay / 60) % 24).padStart(2, "0");
  const minutes = String(minuteOfDay % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function record(
  state: WorkspaceState,
  kind: EventKind,
  actor: string,
  title: string,
  linkage?: Pick<AgentEvent, "taskId" | "toolCallId" | "approvalDecision">,
): WorkspaceState {
  const sequence = state.sequence + 1;
  return {
    ...state,
    sequence,
    events: [{ id: `activity-${sequence}`, time: eventTime(sequence), kind, actor, title, ...linkage }, ...state.events],
  };
}

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "task": {
      const task = state.tasks.find(item => item.id === action.id);
      if (!task || availableTaskAction(task) !== action.action) return state;
      const { status, stage, publicUpdate, event, kind } = taskActions[action.action];
      const assignee = task.agent ?? "D";
      const updated = record(state, kind, `Agent ${assignee}`, `${event} · ${task.name}`, { taskId: task.id });
      return {
        ...updated,
        tasks: state.tasks.map(item => item.id === task.id
          ? { ...item, agent: assignee, status, stage, publicUpdate, updatedAt: eventTime(updated.sequence) }
          : item),
      };
    }
    case "approval": {
      const approval = state.approvals.find(item => item.id === action.id);
      if (!approval || approval.status !== "pending") return state;
      const granted = action.decision === "approved";
      const updated = record(state, granted ? "running" : "stopped", approval.owner,
        `${granted ? "批准" : "拒绝"} · ${approval.title}`, { taskId: approval.taskId, approvalDecision: action.decision });
      return {
        ...updated,
        approvals: state.approvals.map(item => item.id === approval.id ? { ...item, status: action.decision } : item),
        tasks: state.tasks.map(item => item.id === approval.taskId && item.status === "waiting"
          ? { ...item, status: granted ? "running" : "paused", intervention: !granted, updatedAt: eventTime(updated.sequence),
              stage: granted ? "继续回归验收" : "等待负责人处理",
              publicUpdate: granted ? "模拟审批已批准，可继续比较截图差异。" : "审批已拒绝，保留原基线并等待负责人复核。" }
          : item),
      };
    }
    case "retry": {
      const call = state.calls.find(item => item.id === action.id);
      if (!call || call.status !== "failed") return state;
      const updated = record(state, "recovered", call.actor, `重试通过 · ${call.name}`, { taskId: call.taskId, toolCallId: call.id });
      return { ...updated, calls: state.calls.map(item => item.id === call.id
        ? { ...item, status: "succeeded", result: "快照清单与索引已重新匹配。未应用截图基线。", error: undefined, attempts: item.attempts + 1 }
        : item) };
    }
    case "prompt": {
      const name = action.prompt.intent.trim();
      if (!name || name.length > 500) return state;
      const updated = record(state, "queued", "当前工作区", `加入任务队列 · ${name}`);
      return {
        ...updated,
        tasks: [...state.tasks, {
          id: `prompt-${updated.sequence}`, name, agent: null, status: "queued", progress: 0,
          updatedAt: eventTime(updated.sequence), intervention: false, stage: "等待调度",
          publicUpdate: "任务意图与上下文已加入本地工作区。", prompt: action.prompt,
        }],
      };
    }
  }
}

const changeRecords = [
  { id: "tokens", name: "表面与状态角色", before: "组件局部值", after: "共享语义角色", scope: "按钮、输入与状态标记" },
  { id: "baseline", name: "移动端截图基线", before: "PR #4 参考图", after: "待审核的候选图", scope: "390px · Light / Dark" },
  { id: "coverage", name: "覆盖率记录", before: "原始测试记录", after: "只读覆盖率摘要", scope: "当前工作区" },
] as const;

function withReviewStatus(task: AgentTask, approval: AgentApproval, tool: ToolCall, failureEvent: AgentEvent): AgentTask {
  const review = { failureEventId: failureEvent.id, toolStatus: tool.status, approvalStatus: approval.status };
  // The approval decision and the tool outcome are independent. Neither one
  // changes the measured execution progress or supplies an acceptance rate.
  if (approval.status === "rejected") {
    return { ...task, review, status: "paused", intervention: true, stage: "等待负责人处理",
      publicUpdate: "审批已拒绝，原基线继续有效。" };
  }
  if (approval.status === "pending") {
    return { ...task, review, status: "waiting", intervention: true, stage: "等待基线审批",
      publicUpdate: tool.status === "failed" ? "待人工确认；快照索引校验失败，等待重试。" : "索引重试已通过，仍待人工确认基线。" };
  }
  if (tool.status === "failed") {
    return { ...task, review, status: "blocked", intervention: false, stage: "等待索引重试",
      publicUpdate: "审批已批准，快照索引校验仍需重试。" };
  }
  return { ...task, review };
}

export function useAgentWorkspace(refined = false) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const activeTask = state.tasks[1];
  const activeCount = workspaceMetrics.active + state.tasks.length - initialTasks.length;
  const changes: AgentChange[] = changeRecords.map(item => ({
    ...item,
    approval: state.approvals.find(approval => approval.id === item.id)?.status ?? "approved",
  }));
  const snapshot = state.calls.find(item => item.id === "snapshots");
  const baseline = state.approvals.find(item => item.id === "baseline");
  const failureEvent = state.events.find(event => event.kind === "failed" && event.toolCallId === snapshot?.id && event.taskId === snapshot?.taskId);
  const latestTaskUpdate = state.events.find(event => event !== failureEvent && event.taskId === snapshot?.taskId);
  const tasks = refined && snapshot && baseline && failureEvent
    ? state.tasks.map(task => task.id === snapshot.taskId && task.id === baseline.taskId
      ? withReviewStatus({ ...task, updatedAt: latestTaskUpdate?.time ?? task.updatedAt }, baseline, snapshot, failureEvent)
      : task)
    : state.tasks;
  const delivery: DeliverySummary = {
    completed: "语义 Token 对照清单与组件状态映射",
    verification: snapshot?.status === "succeeded" ? "语义检查与快照索引检查通过" : "语义检查通过 · 快照索引待重试",
    evidence: [{ label: "查看工具证据", href: "#tools" }, { label: "查看变更记录", href: "#diff" }],
    risk: refined && baseline?.status === "approved" && snapshot?.status === "failed"
      ? "移动端快照索引仍需重试，基线审批已批准。"
      : baseline?.status === "approved" ? "真实设备与 Safari 的验收证据待补。"
        : "移动端深色截图仍有待核对差异，当前基线保持有效。",
    owner: "前端验收负责人",
  };
  return {
    tasks, approvals: state.approvals, calls: state.calls, events: state.events, activeTask, activeCount, changes, delivery,
    updateTask: (id: string, action: TaskAction) => dispatch({ type: "task", id, action }),
    decideApproval: (id: string, decision: ApprovalDecision) => dispatch({ type: "approval", id, decision }),
    retryTool: (id: string) => dispatch({ type: "retry", id }),
    submitPrompt: (prompt: TaskPrompt) => dispatch({ type: "prompt", prompt }),
  };
}
