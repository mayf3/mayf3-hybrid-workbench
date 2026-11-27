import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button, StatusBadge, Tabs } from "@mayf3/ui-react";
import { Input, Label, TextField } from "react-aria-components";
import { Icon } from "../visual-directions/Icon";
import { agentEventAnchor, agentTaskAnchor, availableTaskAction, taskStatus, type AgentTask, type TaskAction } from "./agent-model";

const actionLabel = { start: "开始", pause: "暂停", resume: "继续" };

function Assignee({ agent }: { agent: string | null }) {
  return <bdi className="agent-assignee">
    <span className="agent-avatar" aria-hidden="true">{agent ?? "—"}</span>
    {agent ? `Agent ${agent}` : "待分配"}
  </bdi>;
}

function TaskStatus({ task, refined }: { task: AgentTask; refined?: boolean }) {
  const status = taskStatus[task.status];
  return <StatusBadge intent={status.intent} className="agent-task-status">
    <Icon name={status.icon} className="agent-icon" /> {refined && task.status === "waiting" ? "待人工确认" : status.label}
  </StatusBadge>;
}

function TaskProgress({ task, label, showLabel }: { task: AgentTask; label: string; showLabel?: boolean }) {
  return <div className="agent-progress">
    {showLabel && <span className="agent-progress-label" aria-hidden="true">执行进度</span>}
    <bdi aria-hidden="true">{task.progress}%</bdi>
    <progress max={100} value={task.progress} aria-label={label} />
  </div>;
}

export function AgentTaskRow({ task, onAction, refined }: {
  task: AgentTask;
  onAction: (id: string, action: TaskAction) => void;
  refined?: boolean;
}) {
  const action = availableTaskAction(task);
  return (
    <tr id={refined ? agentTaskAnchor(task.id) : undefined} tabIndex={refined ? -1 : undefined} data-agent-task={task.id} data-state={task.status}>
      <th scope="row">
        <strong className="agent-row-title">{task.name}</strong>
        <span className="agent-row-meta">
          <Assignee agent={task.agent} />
          <time dateTime={task.updatedAt} title={refined ? "任务更新时间" : undefined}>{task.updatedAt}</time>
        </span>
      </th>
      <td>
        <TaskStatus task={task} refined={refined} />
        {refined && task.review ? (
          <div className="agent-task-review">
            {task.review.approvalStatus === "rejected" && <span className="agent-intervention">审批已拒绝</span>}
            {task.review.toolStatus === "succeeded" && <span className="agent-review-note">索引重试通过</span>}
            <a className="agent-record-link" href={`#${agentEventAnchor(task.review.failureEventId)}`}>查看失败记录</a>
          </div>
        ) : task.intervention && <span className="agent-intervention">需人工介入</span>}
      </td>
      <td>
        <TaskProgress task={task} label={`${task.name}${refined ? "执行进度" : "进度"}`} />
        {action && <Button intent="quiet" size="sm" className="agent-task-action"
          aria-label={actionLabel[action] + task.name} onPress={() => onAction(task.id, action)}>
          {actionLabel[action]}
        </Button>}
      </td>
    </tr>
  );
}

export function AgentTasks({ tasks, onTaskAction, refined }: {
  tasks: readonly AgentTask[];
  onTaskAction: (id: string, action: TaskAction) => void;
  refined?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const section = useRef<HTMLElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!refined) return;
    function revealLinkedTask(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[data-agent-task-link]") : null;
      if (!link) return;
      const targetId = link.hash.slice(1);
      // Mount the destination before the browser handles the fragment link.
      // This also works when the same hash is activated twice.
      if (filter !== "all" || query) {
        flushSync(() => {
          setFilter("all");
          setQuery("");
        });
      }
      const row = document.getElementById(targetId);
      if (row && section.current?.contains(row)) row.focus({ preventScroll: true });
    }
    document.addEventListener("click", revealLinkedTask);
    return () => document.removeEventListener("click", revealLinkedTask);
  }, [filter, query, refined]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matched = tasks.filter(task => `${task.name} Agent ${task.agent ?? ""}`.toLocaleLowerCase().includes(normalizedQuery));
  const views = [
    { id: "all", label: "全部", rows: matched },
    { id: "running", label: "进行中", rows: matched.filter(task => task.status === "running") },
    { id: "waiting", label: refined ? "待人工确认" : "待确认", rows: matched.filter(task => refined ? task.status === "waiting" : task.intervention) },
  ];

  function changeTask(id: string, action: TaskAction) {
    if (filter === "running" && action === "pause") {
      section.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
    }
    onTaskAction(id, action);
  }

  return (
    <section className="agent-section agent-tasks" id="tasks" aria-labelledby="agent-tasks-title" ref={section}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
        event.preventDefault();
        search.current?.focus();
      }}>
      <div className="agent-section-heading">
        <h2 id="agent-tasks-title">任务列表</h2>
        <TextField className="agent-task-search" value={query} onChange={setQuery}>
          <Label className="agent-visually-hidden">搜索任务</Label>
          <Icon name="search" className="agent-icon agent-search-icon" />
          <Input type="search" ref={search} className="mf-input" placeholder="搜索任务" aria-keyshortcuts="Control+K Meta+K" />
          {!query && <kbd aria-hidden="true">⌘/Ctrl K</kbd>}
        </TextField>
      </div>
      <Tabs aria-label="任务状态" selectedKey={filter} onSelectionChange={setFilter}
        items={views.map(({ id, label, rows }) => ({
          id,
          label,
          content: rows.length ? (
            <table className="agent-table" aria-label="工作区任务">
              <thead><tr><th scope="col">任务 / 负责人</th><th scope="col">状态</th><th scope="col">{refined ? "执行进度" : "进度"}</th></tr></thead>
              <tbody>{rows.map(task => <AgentTaskRow key={task.id} task={task} onAction={changeTask} refined={refined} />)}</tbody>
            </table>
          ) : (
            <div className="agent-task-empty">
              <p role="status">没有匹配的任务</p>
              <Button intent="secondary" size="sm" onPress={() => {
                setQuery("");
                setFilter("all");
                search.current?.focus();
              }}>清除筛选</Button>
            </div>
          ),
        }))} />
    </section>
  );
}

export function AgentThinkingState({ task, refined }: { task: AgentTask; refined?: boolean }) {
  return (
    <section className="agent-thinking" id="execution" aria-labelledby="agent-execution-title">
      <div className="agent-thinking-heading">
        <div className="agent-thinking-label"><Icon name="pulse" className="agent-icon" /><h2 id="agent-execution-title">当前执行</h2></div>
        <TaskStatus task={task} refined={refined} />
      </div>
      <div className="agent-thinking-task">
        <div className="agent-thinking-info">
          <h3>{task.name}</h3>
          <Assignee agent={task.agent} />
        </div>
        <TaskProgress task={task} label="当前任务执行进度" showLabel={refined} />
      </div>
      <div className="agent-thinking-update">
        <div className="agent-stage-symbol"><Icon name={taskStatus[task.status].icon} className="agent-icon" /></div>
        <div role="status"><strong>{task.stage}</strong><p>{task.publicUpdate}</p></div>
      </div>
    </section>
  );
}
