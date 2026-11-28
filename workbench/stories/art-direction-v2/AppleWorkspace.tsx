import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { Button, StatusBadge } from "@mayf3/ui-react";
import { AgentApprovalCard, AgentToolCall } from "../premium-agent/AgentComponents";
import { availableTaskAction, taskStatus } from "../premium-agent/agent-model";
import { Icon } from "../visual-directions/Icon";
import { operationsTotals, type WorkspaceProps } from "./workspace";
import "./apple.css";

const windows = [
  { id: "v2-apple-run", label: "执行窗口", icon: "pulse" },
  { id: "v2-apple-approval", label: "审批窗口", icon: "shield" },
  { id: "v2-apple-tools", label: "工具托盘", icon: "controls" },
] as const;

const taskAction = { start: "开始执行", pause: "暂停执行", resume: "继续执行" } as const;

function WindowMenu() {
  return (
    <MenuTrigger>
      <Button intent="secondary" size="sm" className="v2-apple-menu-trigger" aria-label="窗口菜单">
        <Icon name="layers" /> 窗口 <Icon name="expand" />
      </Button>
      <Popover className="v2-apple-menu-popover" placement="bottom end">
        <Menu aria-label="切换窗口" className="v2-apple-menu" items={windows} onAction={key => {
          requestAnimationFrame(() => {
            const heading = document.getElementById(String(key));
            heading?.focus({ preventScroll: true });
            heading?.scrollIntoView({ block: "nearest" });
          });
        }}>
          {item => (
            <MenuItem id={item.id} className="v2-apple-menu-item" textValue={item.label}>
              <Icon name={item.icon} /> {item.label}
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export function AppleWorkspace({ workspace, selectedTaskId, onSelectTask }: WorkspaceProps) {
  const selected = workspace.tasks.find(task => task.id === selectedTaskId) ?? workspace.activeTask;
  const status = taskStatus[selected.status];
  const action = availableTaskAction(selected);
  const approvals = workspace.approvals.filter(approval => approval.status === "pending").length;

  return (
    <main className="v2-apple" data-v2-workspace="apple" aria-labelledby="v2-apple-title">
      <header className="v2-apple-bar" data-v2-skeleton="窗口工具栏">
        <div className="v2-apple-brand">
          <span className="v2-apple-brand-mark"><Icon name="logo" /></span>
          <h1 id="v2-apple-title">Agent 工作站</h1>
        </div>
        <div className="v2-apple-bar-actions">
          <span className="v2-apple-local">本地模拟</span>
          <WindowMenu />
        </div>
      </header>

      <div className="v2-apple-stage">
        <section className="v2-apple-window v2-apple-main" aria-labelledby="v2-apple-run" data-v2-skeleton="执行面" data-visual-level="l2">
          <header className="v2-apple-window-bar">
            <span className="v2-apple-window-icon"><Icon name="pulse" /></span>
            <h2 id="v2-apple-run" tabIndex={-1}>执行窗口</h2>
            <time className="v2-apple-time" dateTime={selected.updatedAt} title="任务更新时间"><bdi>{selected.updatedAt}</bdi></time>
          </header>

          <div className="v2-apple-run-body">
            <div className="v2-apple-run-heading">
              <div>
                <p className="v2-apple-owner">{selected.agent ? <bdi>Agent {selected.agent}</bdi> : "待分配"}</p>
                <h3>{selected.name}</h3>
              </div>
              <StatusBadge intent={status.intent}>
                {selected.status === "waiting" ? "待人工确认" : status.label}
              </StatusBadge>
            </div>

            <div className="v2-apple-progress">
              <div><span>执行进度</span><strong><bdi>{selected.progress}%</bdi></strong></div>
              <progress value={selected.progress} max={100} aria-label={`${selected.name}执行进度`} />
            </div>

            <div className="v2-apple-stage-update">
              <div>
                <strong>{selected.stage}</strong>
                <p>{selected.publicUpdate}</p>
              </div>
              {action && <Button intent="secondary" size="sm" onPress={() => workspace.updateTask(selected.id, action)}>{taskAction[action]}</Button>}
            </div>
          </div>

          <div className="v2-apple-switcher">
            <h3>任务切换</h3>
            <ul className="v2-apple-task-list" aria-label="任务切换">
              {workspace.tasks.map(task => (
                <li key={task.id}>
                  <button type="button" className="v2-apple-task" aria-pressed={task.id === selected.id} onClick={() => onSelectTask(task.id)}>
                    <span className="v2-apple-task-avatar" aria-hidden="true">{task.agent ?? "—"}</span>
                    <span className="v2-apple-task-label">
                      <strong>{task.name}</strong>
                      <small>{task.status === "waiting" ? "待人工确认" : taskStatus[task.status].label}</small>
                    </span>
                    <bdi className="v2-apple-task-progress">{task.progress}%</bdi>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <dl className="v2-apple-metrics" aria-label="工作区指标">
            <div><dt>活跃任务</dt><dd><bdi>{workspace.activeCount}</bdi></dd></div>
            <div><dt>自动恢复率</dt><dd><bdi>{operationsTotals.recoveryRate.toFixed(1)}%</bdi></dd></div>
            <div><dt>本周交付</dt><dd><bdi>{operationsTotals.delivered}/{operationsTotals.planned}</bdi></dd></div>
          </dl>
        </section>

        <section className="v2-apple-window v2-apple-approval" aria-labelledby="v2-apple-approval" data-v2-skeleton="审批窗">
          <header className="v2-apple-window-bar">
            <span className="v2-apple-window-icon"><Icon name="shield" /></span>
            <h2 id="v2-apple-approval" tabIndex={-1}>审批窗口</h2>
            <StatusBadge intent={approvals ? "warning" : "neutral"}>{approvals} 项待审</StatusBadge>
          </header>
          <div className="v2-apple-approval-list">
            {workspace.approvals.map(approval => (
              <AgentApprovalCard key={approval.id} approval={approval} onDecision={workspace.decideApproval} />
            ))}
          </div>
        </section>
      </div>

      <section className="v2-apple-window v2-apple-tools" aria-labelledby="v2-apple-tools" data-v2-skeleton="工具托盘">
        <header className="v2-apple-window-bar">
          <span className="v2-apple-window-icon"><Icon name="controls" /></span>
          <h2 id="v2-apple-tools" tabIndex={-1}>工具托盘</h2>
        </header>
        <div className="v2-apple-tool-list">
          {workspace.calls.map(call => <AgentToolCall key={call.id} call={call} onRetry={workspace.retryTool} />)}
        </div>
      </section>
    </main>
  );
}
