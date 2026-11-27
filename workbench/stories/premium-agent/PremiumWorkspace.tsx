import { useEffect, useState, type ReactNode } from "react";
import { Button, SelectField, StatusBadge, Switch, TextField } from "@mayf3/ui-react";
import { Icon } from "../visual-directions/Icon";
import {
  AgentTasks, AgentApprovals, AgentToolCalls, AgentThinkingState, AgentActivityTimeline,
  AgentDiffTable, AgentDeliverySummary, AgentPromptBar,
} from "./AgentComponents";
import { useAgentWorkspace } from "./AgentWorkspaceModel";
import { weeklyDelivery, workspaceMetrics } from "./agent-model";

const navigation = [
  { href: "overview", title: "运行总览", icon: "dashboard" },
  { href: "tasks", title: "任务", icon: "tasks" },
  { href: "approvals", title: "人工审批", icon: "shield" },
  { href: "activity", title: "活动记录", icon: "clock" },
  { href: "delivery", title: "交付", icon: "delivery" },
] as const;

const metrics = [
  { title: "活跃任务", key: "active", context: "当前工作区", icon: "pulse" },
  { title: "自动恢复率", key: "recovery", context: "最近 7 天", icon: "shield" },
  { title: "本周交付", key: "delivered", context: "已交付 / 计划", icon: "delivery" },
] as const;

const controlStates = [
  { id: "rest", label: "正常" },
  { id: "hover", label: "悬停" },
  { id: "focus", label: "聚焦" },
  { id: "pressed", label: "按下" },
  { id: "disabled", label: "禁用" },
] as const;
type PreviewState = (typeof controlStates)[number]["id"];

function ControlSamples() {
  const [state, setState] = useState<PreviewState>("rest");
  const [feedback, setFeedback] = useState("");
  const [autoRecover, setAutoRecover] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const disabled = state === "disabled";
  useEffect(() => {
    if (!syncing) return;
    const timer = window.setTimeout(() => {
      setSyncing(false);
      setFeedback("本地设置已同步");
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [syncing]);
  return (
    <section id="controls" className="premium-controls" aria-labelledby="premium-controls-title">
      <header>
        <div><h2 id="premium-controls-title">基础控件</h2><p>选择一个状态，比较同一组按钮与字段。</p></div>
        <fieldset className="premium-control-state">
          <legend className="premium-sr">预览控件状态</legend>
          {controlStates.map(({ id, label }) => (
            <label key={id}><input type="radio" name="premium-control-state" checked={id === state} onChange={() => setState(id)} /><span>{label}</span></label>
          ))}
        </fieldset>
      </header>
      <div className="premium-controls__sample" data-mf-demo-state={state === "focus" ? "focused" : state}>
        <div className="premium-controls__buttons">
          <Button isDisabled={disabled} onPress={() => setFeedback("已保存本地示例")}>保存设置</Button>
          <Button intent="secondary" isDisabled={disabled} onPress={() => setFeedback("已打开本地复核状态")}>复核</Button>
          <Button intent="quiet" isDisabled={disabled} onPress={() => setFeedback("")}>清除提示</Button>
          <Button intent="secondary" loading={syncing} isDisabled={disabled} onPress={() => setSyncing(true)}>同步设置</Button>
        </div>
        <div className="premium-controls__fields">
          <TextField label="工作区名称" defaultValue="Mayf3 Agent" isDisabled={disabled} description="显示在任务记录中。" />
          <TextField label="工作区标识" defaultValue="mayf3-agent" isReadOnly isDisabled={disabled} />
          <TextField label="任务键名" defaultValue="Mayf3 Agent" errorMessage="请使用小写字母或连字符。" isDisabled={disabled} />
          <SelectField label="负责人" defaultValue="a" items={[{ id: "a", label: "Agent A" }, { id: "b", label: "Agent B" }, { id: "c", label: "Agent C" }]} isDisabled={disabled} />
        </div>
        <div className="premium-controls__buttons">
          <Switch isSelected={autoRecover} onChange={setAutoRecover} isDisabled={disabled}>自动恢复</Switch>
          <span role="status">{feedback}</span>
        </div>
      </div>
    </section>
  );
}

function focusPrompt() {
  const prompt = document.getElementById("prompt");
  const input = prompt?.querySelector("textarea");
  input?.focus({ preventScroll: true });
  prompt?.scrollIntoView({ block: "start" });
}

function metricRatio(key: "active" | "recovery" | "delivered") {
  if (key === "recovery") return Number.parseFloat(workspaceMetrics.recovery) / 100;
  if (key === "delivered") return weeklyDelivery.completed / weeklyDelivery.planned;
  return undefined;
}

export type WorkspaceComposition = "vercel" | "stripe" | "apple" | "hybrid";

type Region = "intro" | "metrics" | "execution" | "tools" | "tasks" | "approvals" | "activity"
  | "changes" | "delivery" | "prompt" | "controls";

const regionsByComposition: Record<WorkspaceComposition, readonly Region[]> = {
  vercel: ["intro", "execution", "tasks", "activity", "tools", "approvals", "metrics", "delivery", "changes", "prompt", "controls"],
  stripe: ["intro", "metrics", "tasks", "delivery", "execution", "approvals", "tools", "activity", "changes", "prompt", "controls"],
  apple: ["intro", "execution", "approvals", "metrics", "tools", "activity", "tasks", "delivery", "changes", "prompt", "controls"],
  hybrid: ["intro", "execution", "approvals", "metrics", "tasks", "activity", "tools", "delivery", "changes", "prompt", "controls"],
};

export function PremiumWorkspace({ refined = false, composition }: {
  refined?: boolean;
  composition?: WorkspaceComposition;
}) {
  const workspace = useAgentWorkspace(refined);
  const [current, setCurrent] = useState("overview");
  const regions: Record<Region, ReactNode> = {
    intro: (
      <div className="premium-page-header">
        <div>
          <h1 id="premium-page-title">Agent 工作台</h1>
          <p>查看当前执行、人工审批与可核验的交付。</p>
        </div>
        <Button onPress={focusPrompt} className="premium-new-task">新建任务 <Icon name="arrow" /></Button>
      </div>
    ),
    metrics: (
      <section className="premium-metrics" aria-label="工作区指标">
        {metrics.map(({ title, key, context, icon }) => {
          const value = key === "active" ? workspace.activeCount : workspaceMetrics[key];
          const updated = key === "active" && value !== workspaceMetrics.active;
          const ratio = refined ? metricRatio(key) : undefined;
          return (
            <div className="premium-metric" data-metric={composition ? key : undefined} key={title}>
              <div className="premium-metric__name">{!refined && <Icon name={icon} />}<h2>{title}</h2></div>
              <bdi key={value} className="premium-metric__value" data-updated={updated || undefined}>{value}</bdi>
              <span className="premium-metric__context">{context}</span>
              {ratio !== undefined && (
                <>
                  <meter className="premium-metric__meter" min={0} max={1} value={ratio} aria-hidden="true" />
                  {composition && (
                    <div className="reference-metric-scale" aria-hidden="true">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </section>
    ),
    execution: (
      <div className="premium-focal" data-visual-level="l2">
        <AgentThinkingState task={workspace.activeTask} refined={refined} />
      </div>
    ),
    tools: <AgentToolCalls calls={workspace.calls} onRetry={workspace.retryTool} refined={refined} />,
    tasks: <AgentTasks tasks={workspace.tasks} onTaskAction={workspace.updateTask} refined={refined} />,
    approvals: <AgentApprovals approvals={workspace.approvals} onDecision={workspace.decideApproval} />,
    activity: <AgentActivityTimeline events={workspace.events} refined={refined} />,
    changes: <AgentDiffTable changes={workspace.changes} />,
    delivery: <AgentDeliverySummary delivery={workspace.delivery} refined={refined} />,
    prompt: <AgentPromptBar onSubmit={workspace.submitPrompt} />,
    controls: <ControlSamples />,
  };
  return (
    <div className="premium-workspace" data-reference-composition={composition}>
      <header className="premium-header">
        <a className="premium-brand" href="#overview" onClick={() => setCurrent("overview")}>
          <span className="premium-brand__symbol"><Icon name="logo" /></span>
          <span>Mayf3 <strong>Agent</strong></span>
        </a>
        <nav className="premium-crumb" aria-label="所在工作区">
          <span>工作区</span><Icon name="chevron" /><span aria-current="page">运行中心</span>
        </nav>
        <StatusBadge intent="neutral">本地模拟</StatusBadge>
      </header>
      <div className="premium-shell">
        <aside className="premium-sidebar">
          <nav aria-label="工作区导航">
            {navigation.map(({ href, title, icon }) => (
              <a key={href} href={`#${href}`} aria-current={current === href ? "location" : undefined} onClick={() => setCurrent(href)}>
                <Icon name={icon} /><span>{title}</span>
              </a>
            ))}
            <a className="premium-sidebar__controls" href="#controls" aria-current={current === "controls" ? "location" : undefined} onClick={() => setCurrent("controls")}><Icon name="controls" />基础控件</a>
          </nav>
        </aside>

        <main id="overview" className={composition ? "premium-content reference-composition" : "premium-content"} aria-labelledby="premium-page-title">
          {composition ? (
            regionsByComposition[composition].map(region => (
              <div key={region} className="reference-slot" data-region={region}>
                {regions[region]}
              </div>
            ))
          ) : (
            <>
              {regions.intro}
              {regions.metrics}
              <div className="premium-run-grid">
                <div className="premium-execution-stack">
                  {regions.execution}
                  {regions.tools}
                  {regions.tasks}
                </div>
                <div className="premium-review-stack">
                  {regions.approvals}
                  {regions.activity}
                </div>
              </div>
              <div className="premium-reviews">
                {regions.changes}
                {regions.delivery}
              </div>
              {regions.prompt}
              {regions.controls}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
