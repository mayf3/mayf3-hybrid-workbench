import { useRef } from "react";
import { Button, StatusBadge } from "@mayf3/ui-react";
import { AgentApprovalCard, AgentToolCall } from "../premium-agent/AgentComponents";
import { availableTaskAction, taskStatus } from "../premium-agent/agent-model";
import { Icon } from "../visual-directions/Icon";
import { operationsTotals, type WorkspaceProps } from "./workspace";
import "./hybrid.css";

const actions = { pause: "暂停任务", resume: "继续任务", start: "开始任务" } as const;

function TaskList({ tasks, selectedTaskId, onSelectTask }: Pick<WorkspaceProps, "selectedTaskId" | "onSelectTask"> & {
  tasks: WorkspaceProps["workspace"]["tasks"];
}) {
  return (
    <ul className="v2h-task-list">
      {tasks.map(item => <li key={item.id}>
        <button type="button" aria-pressed={item.id === selectedTaskId} aria-controls="v2h-brief" onClick={() => onSelectTask(item.id)}>
          <strong>{item.name}</strong>
          <bdi className="v2h-task-value">{item.progress}%</bdi>
          <bdi className="v2h-task-assignee">{item.agent ? `Agent ${item.agent}` : "未分配"}</bdi>
          <span>{item.status === "waiting" ? "待人工确认" : taskStatus[item.status].label}</span>
        </button>
      </li>)}
    </ul>
  );
}

export function HybridWorkspace({ workspace, selectedTaskId, onSelectTask }: WorkspaceProps) {
  const mobilePicker = useRef<HTMLDetailsElement>(null);
  const mobileTrigger = useRef<HTMLElement>(null);
  const task = workspace.tasks.find(candidate => candidate.id === selectedTaskId) ?? workspace.activeTask;
  const status = taskStatus[task.status];
  const action = availableTaskAction(task);
  const recent = workspace.events.find(event =>
    event.taskId === task.id || (!event.taskId && event.actor === `Agent ${task.agent}`),
  );
  const linkedCall = workspace.calls.find(call => call.taskId === task.id);
  const snapshot = workspace.calls.find(call => call.id === "snapshots");
  const pending = workspace.approvals.filter(approval => approval.status === "pending");
  const priority = workspace.approvals.find(approval => approval.taskId === task.id)
    ?? pending.find(approval => approval.risk === "high")
    ?? pending[0]
    ?? workspace.approvals[0];

  function selectMobileTask(id: string) {
    onSelectTask(id);
    if (mobilePicker.current) mobilePicker.current.open = false;
    mobileTrigger.current?.focus();
  }

  return (
    <div className="v2-handoff" data-v2-workspace="hybrid">
      <header className="v2h-header" data-v2-skeleton="交接导航">
        <a className="v2h-brand" href="#v2h-overview"><Icon name="logo" /><span>Mayf3 Agent</span></a>
        <nav aria-label="运行交接导航">
          <a href="#v2h-desk">任务接力</a>
          <a href="#v2h-review">人工决定</a>
          <a href="#v2h-evidence">交付与验收</a>
        </nav>
        <StatusBadge intent="neutral">本地模拟</StatusBadge>
      </header>
      <main id="v2h-overview" className="v2h-main" aria-labelledby="v2h-task-title">
        <div id="v2h-desk" className="v2h-desk">
          <nav className="v2h-task-index" aria-labelledby="v2h-index-title" data-v2-skeleton="任务索引">
            <h2 id="v2h-index-title">任务索引</h2>
            <TaskList tasks={workspace.tasks} selectedTaskId={task.id} onSelectTask={onSelectTask} />
          </nav>
          <details className="v2h-mobile-picker" ref={mobilePicker}>
            <summary ref={mobileTrigger}>
              <Icon name="tasks" /><span>切换任务</span><Icon name="expand" />
            </summary>
            <TaskList tasks={workspace.tasks} selectedTaskId={task.id} onSelectTask={selectMobileTask} />
          </details>
          <article id="v2h-brief" className="v2h-brief" aria-labelledby="v2h-task-title" data-v2-skeleton="任务简报">
            <header>
              <div className="v2h-brief-label">
                <Icon name="pulse" /><span>运行交接</span>
                <bdi>{task.agent ? `Agent ${task.agent}` : "未分配"}</bdi>
              </div>
              <StatusBadge intent={status.intent}>{task.status === "waiting" ? "待人工确认" : status.label}</StatusBadge>
            </header>
            <h1 id="v2h-task-title">{task.name}</h1>
            <div className="v2h-progress">
              <div className="v2h-progress-label">
                <span>执行进度</span><strong><bdi>{task.progress}%</bdi></strong>
              </div>
              <progress max={100} value={task.progress} aria-label={`${task.name}执行进度`} />
            </div>
            <section className="v2h-stage" aria-label="当前阶段">
              <div><h2>{task.stage}</h2><p>{task.publicUpdate}</p></div>
              {action && <Button size="sm" intent="secondary" onPress={() => workspace.updateTask(task.id, action)}>{actions[action]}</Button>}
            </section>
            <dl className="v2h-brief-evidence">
              <div><dt>最近记录</dt><dd>{recent ? <><time dateTime={recent.time}><bdi>{recent.time}</bdi></time> {recent.title}</> : "暂无关联活动"}</dd></div>
              <div><dt>工具证据</dt><dd>{linkedCall ? <a href="#v2h-tools">{linkedCall.name} · {linkedCall.status === "failed" ? "待重试" : "通过"}</a> : "当前任务暂无关联工具调用"}</dd></div>
            </dl>
          </article>
          <aside id="v2h-review" className="v2h-review" aria-labelledby="v2h-review-title" data-v2-skeleton="人工决策">
            <div className="v2h-review-heading">
              <h2 id="v2h-review-title">人工决定</h2>
              <span><bdi>{pending.length}</bdi> 项待审</span>
            </div>
            <AgentApprovalCard approval={priority} onDecision={workspace.decideApproval} presentation="decision" />
            {workspace.approvals.filter(approval => approval.id !== priority.id).map(approval => (
              <details className="v2h-more-decisions" key={approval.id}>
                <summary>{approval.title}</summary>
                <AgentApprovalCard approval={approval} onDecision={workspace.decideApproval} presentation="decision" />
              </details>
            ))}
          </aside>
        </div>
        <dl className="v2h-totals" aria-label="工作区指标">
          <div><dt>活跃任务</dt><dd><bdi>{workspace.activeCount}</bdi></dd></div>
          <div><dt>自动恢复率</dt><dd><bdi>{operationsTotals.recoveryRate.toFixed(1)}%</bdi></dd></div>
          <div><dt>本周交付</dt><dd><bdi>{operationsTotals.delivered}/{operationsTotals.planned}</bdi></dd></div>
        </dl>
        <section className="v2h-evidence" id="v2h-evidence" aria-labelledby="v2h-evidence-title" data-v2-skeleton="交付与验收">
          <h2 id="v2h-evidence-title">交付与验收</h2>
          <dl>
            <div>
              <dt>本周交付完成率</dt>
              <dd>
                <bdi>{operationsTotals.delivered}/{operationsTotals.planned}（{(operationsTotals.delivered / operationsTotals.planned * 100).toFixed(1)}%）</bdi>
                <meter value={operationsTotals.delivered} max={operationsTotals.planned} aria-label="本周交付完成比例" />
              </dd>
            </div>
            <div>
              <dt>验收通过率</dt>
              <dd>未统计<p>{workspace.delivery.verification}</p></dd>
            </div>
            <div>
              <dt>当前风险</dt>
              <dd>
                <StatusBadge intent={snapshot?.status === "failed" ? "warning" : "neutral"}>{snapshot?.status === "failed" ? "证据待复核" : "索引已匹配"}</StatusBadge>
                <p>{workspace.delivery.risk}</p>
              </dd>
            </div>
          </dl>
        </section>
        <section id="v2h-tools" className="v2h-tools" aria-labelledby="v2h-tools-title">
          <h2 id="v2h-tools-title">核对工具证据</h2>
          {workspace.calls.map(call => <AgentToolCall key={call.id} call={call} onRetry={workspace.retryTool} />)}
        </section>
      </main>
    </div>
  );
}
