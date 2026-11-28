import { useEffect, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Button, Dialog, StatusBadge } from "@mayf3/ui-react";
import { Icon } from "../visual-directions/Icon";
import { AgentApprovalCard, AgentToolCall } from "../premium-agent/AgentOperations";
import { AgentPromptBar } from "../premium-agent/AgentPromptBar";
import { AgentDiffTable, AgentDeliverySummary } from "../premium-agent/AgentRecords";
import {
  activityKind,
  agentEventAnchor,
  agentTaskAnchor,
  agentToolAnchor,
  availableTaskAction,
  taskStatus,
  type AgentTask,
} from "../premium-agent/agent-model";
import { operationsTotals, type WorkspaceProps } from "./workspace";
import "./vercel.css";

const actions = { start: "开始", pause: "暂停", resume: "继续" } as const;

function CommandPicker({ isOpen, onOpenChange, tasks, selectedTaskId, onSelectTask }: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: WorkspaceProps["workspace"]["tasks"];
  selectedTaskId: string;
  onSelectTask: WorkspaceProps["onSelectTask"];
}) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"workspace" | "regression">("workspace");
  const search = query.trim().toLocaleLowerCase();
  const results = tasks.filter(task =>
    (scope === "workspace" || task.review || task.prompt?.context === "regression")
      && `${task.name} Agent ${task.agent ?? ""}`.toLocaleLowerCase().includes(search),
  );

  function close() {
    setQuery("");
    onOpenChange(false);
  }

  return (
    <Dialog title="查找任务" description="可以切换工作区范围，按任务名或负责人搜索。"
      isOpen={isOpen} onOpenChange={open => { if (!open) close(); }}>
      <div className="v2-vc-picker">
        <label htmlFor="vc-task-search">搜索任务</label>
        <input autoFocus className="mf-input" id="vc-task-search" type="search"
          placeholder="搜索任务或 Agent" value={query} onChange={event => setQuery(event.target.value)} />
        <div className="v2-vc-picker-scope" role="group" aria-label="项目范围">
          <button type="button" aria-pressed={scope === "workspace"} onClick={() => setScope("workspace")}>全部工作区任务</button>
          <button type="button" aria-pressed={scope === "regression"} onClick={() => setScope("regression")}>回归验收</button>
        </div>
        {results.length ? (
          <ul aria-label="匹配任务">
            {results.map(task => (
              <li key={task.id}>
                <Button intent="quiet" aria-pressed={selectedTaskId === task.id} onPress={() => {
                  onSelectTask(task.id);
                  close();
                }}>
                  <span>{task.name}</span>
                  <bdi>{task.agent ? `Agent ${task.agent}` : "待分配"}</bdi>
                </Button>
              </li>
            ))}
          </ul>
        ) : <p role="status">没有匹配的任务。</p>}
      </div>
    </Dialog>
  );
}

function ExecutionProgress({ task, label = "执行进度" }: { task: AgentTask; label?: string }) {
  return (
    <div className="v2-vc-progress">
      <bdi aria-hidden="true">{task.progress}%</bdi>
      <progress value={task.progress} max={100} aria-label={`${task.name}${label}`} />
    </div>
  );
}

function openTool(id: string) {
  const summary = document.getElementById(agentToolAnchor(id));
  const details = summary?.closest("details");
  if (details) details.open = true;
}

export function VercelWorkspace({ workspace, selectedTaskId, onSelectTask }: WorkspaceProps) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "attention">("all");
  const selected = workspace.tasks.find(task => task.id === selectedTaskId) ?? workspace.activeTask;
  const running = workspace.activeTask;
  const pendingApprovals = workspace.approvals.filter(approval => approval.status === "pending");
  const attention = workspace.tasks.filter(task => task.intervention || task.status === "blocked");
  const tasks = filter === "all" ? workspace.tasks : attention;
  const selectedAction = availableTaskAction(selected);
  const selectedTool = workspace.calls.find(call => call.taskId === selected.id);
  const failedTool = workspace.calls.find(call => call.status === "failed");
  const relatedApproval = pendingApprovals.find(approval => approval.taskId === selected.id);
  const relatedTool = selectedTool ?? failedTool;

  useEffect(() => {
    function handlePickerShortcut(event: KeyboardEvent) {
      if (event.isComposing || event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setPickerOpen(true);
    }

    document.addEventListener("keydown", handlePickerShortcut);
    return () => document.removeEventListener("keydown", handlePickerShortcut);
  }, []);

  function revealLinkedTask(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-agent-task-link]") : null;
    if (!link) return;
    const task = workspace.tasks.find(item => link.hash === `#${agentTaskAnchor(item.id)}`);
    if (!task) return;
    flushSync(() => {
      if (filter !== "all" && !tasks.includes(task)) setFilter("all");
      onSelectTask(task.id);
    });
    document.getElementById(agentTaskAnchor(task.id))?.focus({ preventScroll: true });
  }

  return (
    <div className="v2-vercel" data-v2-workspace="vercel">
      <header className="v2-vc-header" data-v2-skeleton="导航">
        <a className="v2-vc-brand" href="#vc-overview">
          <span><Icon name="logo" /></span>
          <bdi>Mayf3 Agent</bdi>
        </a>
        <nav aria-label="命令中心导航">
          <a href="#tasks">任务</a>
          <a href="#activity">运行记录</a>
          <a href="#tools">工具证据</a>
          <a href="#approvals">人工审批</a>
        </nav>
        <Button intent="secondary" size="sm" className="v2-vc-search" aria-describedby="vc-picker-shortcut"
          onPress={() => setPickerOpen(true)}>
          <Icon name="search" /><span>查找任务</span><kbd aria-hidden="true">⌘ / Ctrl K</kbd>
        </Button>
        <span id="vc-picker-shortcut" className="v2-sr">快捷键：Control 或 Command 加 K</span>
      </header>

      <main id="vc-overview" className="v2-vc-main" aria-labelledby="vc-title">
        <div className="v2-vc-heading">
          <div>
            <p className="v2-vc-context"><bdi lang="en">Mayf3 Agent</bdi><span>工作区</span></p>
            <h1 id="vc-title">命令中心</h1>
          </div>
          <div className="v2-vc-heading-actions">
            <StatusBadge intent="neutral">本地模拟</StatusBadge>
            <Button size="sm" onPress={() => document.querySelector<HTMLTextAreaElement>("#prompt textarea")?.focus()}>
              新建任务
            </Button>
          </div>
        </div>

        <section className="v2-vc-run" aria-labelledby="vc-run-title" data-v2-skeleton="运行状态">
          <div className="v2-vc-run-identity">
            <span className="v2-vc-run-symbol"><Icon name="pulse" /></span>
            <div>
              <h2 id="vc-run-title">当前运行</h2>
              <button className="v2-vc-link" type="button" onClick={() => onSelectTask(running.id)}>{running.name}</button>
            </div>
          </div>
          <div className="v2-vc-stage" role="status">
            <StatusBadge intent={taskStatus[running.status].intent}>{taskStatus[running.status].label}</StatusBadge>
            <p>{running.stage}<span>{running.publicUpdate}</span></p>
          </div>
          <ExecutionProgress task={running} />
        </section>

        <div className="v2-vc-console">
          <section id="tasks" className="v2-vc-ledger" aria-labelledby="vc-ledger-title" data-v2-skeleton="任务表">
            <header className="v2-vc-ledger-head">
              <div>
                <h2 id="vc-ledger-title">任务列表</h2>
                <p><bdi>{workspace.tasks.length}</bdi> 条任务记录</p>
              </div>
              <div className="v2-vc-filter" role="group" aria-label="筛选任务状态">
                <Button intent="quiet" size="sm" aria-pressed={filter === "all"} onPress={() => setFilter("all")}>全部</Button>
                <Button intent="quiet" size="sm" aria-pressed={filter === "attention"} onPress={() => setFilter("attention")}>
                  待处理 <bdi>{attention.length}</bdi>
                </Button>
              </div>
            </header>
            <table aria-labelledby="vc-ledger-title">
              <colgroup>
                <col className="v2-vc-col-task" /><col className="v2-vc-col-status" />
                <col className="v2-vc-col-progress" /><col className="v2-vc-col-action" />
              </colgroup>
              <thead>
                <tr><th scope="col">任务 / 负责人</th><th scope="col">状态</th><th scope="col">执行进度</th><th scope="col">操作</th></tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const action = availableTaskAction(task);
                  const status = taskStatus[task.status];
                  const approval = pendingApprovals.find(item => item.taskId === task.id);
                  const tool = task.status === "blocked" ? workspace.calls.find(call => call.taskId === task.id) : undefined;

                  return (
                    <tr key={task.id} id={agentTaskAnchor(task.id)} tabIndex={-1} data-v2-task={task.id}
                      data-selected={selected.id === task.id || undefined}>
                      <th scope="row">
                        <button type="button" className="v2-vc-link" aria-pressed={selected.id === task.id}
                          onClick={() => onSelectTask(task.id)}>{task.name}</button>
                        <span className="v2-vc-row-meta">
                          <bdi>{task.agent ? `Agent ${task.agent}` : "待分配"}</bdi>
                          <time dateTime={task.updatedAt}>{task.updatedAt}</time>
                        </span>
                      </th>
                      <td><StatusBadge intent={status.intent}>{task.status === "waiting" ? "待确认" : status.label}</StatusBadge></td>
                      <td><ExecutionProgress task={task} /></td>
                      <td>
                        {action ? <Button intent="secondary" size="sm" aria-label={actions[action] + task.name}
                          onPress={() => workspace.updateTask(task.id, action)}>{actions[action]}</Button>
                          : approval ? <a className="v2-vc-row-action" href={`#vc-approval-${approval.id}`}>审阅</a>
                            : tool ? (
                              <a className="v2-vc-row-action" href={`#${agentToolAnchor(tool.id)}`} onClick={() => openTool(tool.id)}>
                                查工具
                              </a>
                            ) : <span className="v2-vc-empty-action">—<span className="v2-sr">无可用操作</span></span>}
                      </td>
                    </tr>
                  );
                })}
                {!tasks.length && <tr><td colSpan={4}>当前没有待处理的任务。</td></tr>}
              </tbody>
            </table>
            <footer className="v2-vc-ledger-foot">
              <dl aria-label="工作区指标">
                <div><dt>活跃任务</dt><dd><bdi>{workspace.activeCount}</bdi></dd></div>
                <div><dt>自动恢复率</dt><dd><bdi>{operationsTotals.recoveryRate.toFixed(1)}%</bdi></dd></div>
                <div><dt>本周交付</dt><dd><bdi>{operationsTotals.delivered}/{operationsTotals.planned}</bdi></dd></div>
              </dl>
            </footer>
          </section>

          <aside className="v2-vc-inspector" aria-labelledby="vc-inspector-title" data-v2-skeleton="活动检查器" onClick={revealLinkedTask}>
            <header>
              <Icon name="controls" /><h2 id="vc-inspector-title">运行检查器</h2>
            </header>
            <div className="v2-vc-inspected" role="status">
              <strong>{selected.name}</strong>
              <p>{selected.stage} · <bdi>{selected.agent ? `Agent ${selected.agent}` : "待分配"}</bdi></p>
              {selected.review && <a className="v2-vc-event-link" href={`#${agentEventAnchor(selected.review.failureEventId)}`}>查看失败记录</a>}
            </div>
            <section className="v2-vc-inspector-section" aria-labelledby="vc-actions-title">
              <h3 id="vc-actions-title">快捷操作</h3>
              <div className="v2-vc-quick">
                {selectedAction && <Button size="sm" intent="secondary" aria-label={`${actions[selectedAction]}所选任务 ${selected.name}`}
                  onPress={() => workspace.updateTask(selected.id, selectedAction)}>{actions[selectedAction]}所选任务</Button>}
                <a href={relatedApproval ? `#vc-approval-${relatedApproval.id}` : "#approvals"}><Icon name="shield" />
                  {relatedApproval ? "审阅所选任务" : `待审批 (${pendingApprovals.length})`}
                </a>
                {relatedTool && <a href={`#${agentToolAnchor(relatedTool.id)}`} onClick={() => openTool(relatedTool.id)}>
                  <Icon name="controls" />{relatedTool.status === "failed" ? "检查失败工具" : "查看关联工具"}
                </a>}
              </div>
            </section>
            <section id="activity" className="v2-vc-inspector-section" aria-labelledby="vc-events-title">
              <h3 id="vc-events-title">近期活动</h3>
              <ol aria-live="polite" aria-relevant="additions text">
                {workspace.events.map(event => {
                  const kind = activityKind[event.kind];
                  return (
                    <li id={agentEventAnchor(event.id)} key={event.id} data-intent={kind.intent}>
                      <time dateTime={event.time}>{event.time}</time>
                      <div>
                        <p>{event.title}</p>
                        <bdi>{event.actor} · {kind.label}</bdi>
                        {event.toolCallId && <a className="v2-vc-event-link" href={`#${agentToolAnchor(event.toolCallId)}`}
                          onClick={() => { if (event.toolCallId) openTool(event.toolCallId); }}>查看工具</a>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
            <section id="tools" className="v2-vc-inspector-section" aria-labelledby="vc-tools-title">
              <h3 id="vc-tools-title">工具证据</h3>
              {workspace.calls.map(call => <AgentToolCall key={call.id} call={call} onRetry={workspace.retryTool} refined />)}
            </section>
          </aside>

          <section className="v2-vc-records" id="approvals" aria-labelledby="vc-approvals-title">
            <header><h2 id="vc-approvals-title">人工审批</h2><p><bdi>{pendingApprovals.length}</bdi> 条待决定</p></header>
            <div className="v2-vc-approvals">
              {workspace.approvals.map(approval => (
                <div key={approval.id} id={`vc-approval-${approval.id}`} tabIndex={-1}>
                  <AgentApprovalCard approval={approval} onDecision={workspace.decideApproval} />
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="v2-vc-evidence">
          <AgentDiffTable changes={workspace.changes} />
          <AgentDeliverySummary delivery={workspace.delivery} refined />
        </div>
        <AgentPromptBar onSubmit={workspace.submitPrompt} />
      </main>
      <CommandPicker isOpen={isPickerOpen} onOpenChange={setPickerOpen} tasks={workspace.tasks}
        selectedTaskId={selected.id} onSelectTask={onSelectTask} />
    </div>
  );
}
