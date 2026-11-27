import { useId, useState } from "react";
import { Button, StatusBadge, Tabs } from "@mayf3/ui-react";
import { Controls } from "./Controls";
import { Overlays } from "./Overlays";
import { Icon, type IconName } from "./Icon";

const navigation = [
  { id: "overview", label: "概览", icon: "dashboard" },
  { id: "tasks", label: "任务列表", icon: "tasks" },
  { id: "controls", label: "组件控件", icon: "controls" },
  { id: "interactions", label: "交互演示", icon: "layers" },
] as const;

const deliveryMetric = { name: "本周交付", value: "18/21", note: "已交付 / 计划", icon: "delivery", tone: "lavender" } as const;

const metrics = [
  { name: "活跃任务", value: "24", note: "工作区当前任务", icon: "pulse", tone: "blue" },
  { name: "自动恢复率", value: "94.2%", note: "最近七天", icon: "shield", tone: "cyan" },
  deliveryMetric,
] as const;

const runningTask = { name: "交互组件适配", agent: "B", status: "执行中", intent: "info", progress: 68, time: "10:18", event: "开始适配交互组件", icon: "pulse" } as const;
const reviewTask = { name: "Playwright 回归测试", agent: "C", status: "待确认", intent: "warning", progress: 82, time: "09:56", event: "回归测试等待确认", icon: "clock" } as const;

const tasks = [
  { name: "语义 Token 整理", agent: "A", status: "已完成", intent: "success", progress: 100, time: "10:42", event: "已提交语义 Token 清单", icon: "check" },
  runningTask,
  reviewTask,
] as const;
type Task = (typeof tasks)[number];
type Destination = (typeof navigation)[number]["id"];

function Mark({ icon, className }: { icon: IconName; className: string }) {
  return <span className={className}><Icon name={icon} /></span>;
}

function TaskTable({ rows, onReset }: { rows: readonly Task[]; onReset: () => void }) {
  if (!rows.length) {
    return (
      <div className="sky-empty">
        <Mark className="sky-metric-icon" icon="search" />
        <strong>没有匹配的任务</strong>
        <p>清除筛选后可以查看全部任务。</p>
        <Button intent="secondary" size="sm" onPress={onReset}>清除筛选</Button>
      </div>
    );
  }
  return (
    <table className="sky-table" aria-label="工作区任务">
      <thead><tr><th scope="col">任务 / 负责人</th><th scope="col">状态</th><th scope="col">进度</th></tr></thead>
      <tbody>
        {rows.map(task => (
          <tr key={task.agent} data-status={task.intent}>
            <td>
              <strong>{task.name}</strong>
              <span className="sky-agent"><span className="sky-avatar" data-agent={task.agent} aria-hidden="true">{task.agent}</span><bdi>Agent {task.agent}</bdi></span>
            </td>
            <td><StatusBadge intent={task.intent}>{task.status}</StatusBadge></td>
            <td><span className="sky-progress"><span dir="ltr">{task.progress}%</span><progress aria-label={task.name + "进度"} value={task.progress} max={100} /></span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RunStatus() {
  return (
    <div className="sky-run-status" role="group" aria-label="执行和交付状态">
      <div className="sky-run-active">
        <Mark className="sky-run-icon" icon={runningTask.icon} />
        <div className="sky-run-copy">
          <h3>{runningTask.status}</h3>
          <p><strong>{runningTask.name}</strong><bdi>Agent {runningTask.agent}</bdi></p>
        </div>
        <bdi className="sky-run-number">{runningTask.progress}%</bdi>
        <div className="sky-progress sky-run-meter">
          <progress aria-label="当前任务执行进度" value={runningTask.progress} max={100} />
        </div>
      </div>
      <div className="sky-run-delivery">
        <Mark className="sky-run-icon" icon={deliveryMetric.icon} />
        <div className="sky-run-copy">
          <h3>{deliveryMetric.name}</h3>
          <p>{deliveryMetric.note}</p>
        </div>
        <bdi className="sky-run-number">{deliveryMetric.value}</bdi>
      </div>
      <div className="sky-run-review">
        <Mark className="sky-run-icon" icon={reviewTask.icon} />
        <div className="sky-run-copy">
          <h3>待人工确认</h3>
          <p><strong>{reviewTask.name}</strong><bdi>Agent {reviewTask.agent}</bdi></p>
        </div>
      </div>
    </div>
  );
}

export function Workspace({ precision }: { precision?: "before" | "after" }) {
  const [current, setCurrent] = useState<Destination>("overview");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const searchId = useId();
  const titleId = useId();
  const heroTitleId = useId();
  const visibleTasks = tasks.filter(task => `${task.name} Agent ${task.agent}`.toLowerCase().includes(query.trim().toLowerCase()));
  function resetTasks() {
    setQuery("");
    setTab("all");
  }
  const items = [
    { id: "all", label: "全部", rows: visibleTasks },
    { id: "running", label: "执行中", rows: visibleTasks.filter(task => task.intent === "info") },
    { id: "completed", label: "已完成", rows: visibleTasks.filter(task => task.intent === "success") },
  ];
  return (
    <div className="sky-workspace" data-precision-layout={precision}>
      <header className="sky-top-nav">
        <a className="sky-brand" href="#overview" onClick={() => setCurrent("overview")}>
          <Mark className="sky-brand-mark" icon="logo" /><span>Mayf3 <strong>Agent</strong></span>
        </a>
        <nav aria-label="顶部导航">
          <a href="#tasks" onClick={() => setCurrent("tasks")}><Icon name="tasks" />任务</a>
          <a href="#interactions" onClick={() => setCurrent("interactions")}><Icon name="layers" />交互</a>
        </nav>
        <StatusBadge intent="success">系统正常</StatusBadge>
      </header>

      <div className="sky-shell">
        <aside className="sky-sidebar">
          <div className="sky-workspace-id">
            <span className="sky-workspace-letter" aria-hidden="true">M</span>
            <div><strong>Mayf3 工作区</strong><small>Agent 协作</small></div>
          </div>
          <nav aria-label="工作区导航">
            {navigation.map(item => (
              <a key={item.id} href={`#${item.id}`} aria-current={current === item.id ? "location" : undefined} onClick={() => setCurrent(item.id)}>
                <Icon name={item.icon} /><span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <main className="sky-main" id="overview" aria-labelledby={titleId}>
          <nav className="sky-breadcrumb" aria-label="面包屑">
            <a href="#overview" onClick={() => setCurrent("overview")}>工作区</a><Icon name="chevron" /><span aria-current="page">概览</span>
          </nav>
          <div className="sky-page-head">
            <div><h1 className="sky-display" id={titleId}>Agent 工作台</h1><p>查看协作任务、自动恢复与本周交付进度。</p></div>
            <a className="sky-page-link" href="#tasks" onClick={() => setCurrent("tasks")}>任务列表 <Icon name="arrow" /></a>
          </div>

          <section className="sky-feature"
            aria-label={precision ? undefined : "特色工作区介绍"}
            aria-labelledby={precision ? heroTitleId : undefined}
            data-testid={precision ? "precision-hero" : undefined}
            data-visual-level={precision === "after" ? "l2" : undefined}
          >
            <div className="sky-feature-copy">
              {precision ? (
                <>
                  <span className="sky-feature-label"><Icon name="layers" />任务协作</span>
                  <h2 className="sky-display" id={heroTitleId}>Agent 执行概览</h2>
                  <p>查看当前执行、交付和待人工确认的任务。</p>
                </>
              ) : (
                <>
                  <span className="sky-feature-label"><Icon name="layers" />工作区概览</span>
                  <h2 className="sky-display">把协作进度<br />汇在一处</h2>
                  <p>在同一个工作区追踪 Agent 任务、异常恢复和交付。</p>
                </>
              )}
              <Button onPress={() => {
                setTab("running");
                setQuery("");
                setCurrent("tasks");
                const section = document.getElementById("tasks");
                section?.focus({ preventScroll: true });
                section?.scrollIntoView({ block: "start" });
              }}>查看执行中 <Icon name="arrow" /></Button>
            </div>
            {precision !== "after" && <div className="sky-feature-visual" aria-hidden="true">
              <div className="sky-orbit sky-orbit--outer" />
              <div className="sky-orbit sky-orbit--middle" />
              <div className="sky-orbit sky-orbit--inner" />
              <Mark className="sky-feature-hub" icon="logo" />
              <Mark className="sky-feature-node sky-feature-node--one" icon="check" />
              <Mark className="sky-feature-node sky-feature-node--two" icon="pulse" />
              <Mark className="sky-feature-node sky-feature-node--three" icon="layers" />
            </div>}
            {precision && <RunStatus />}
          </section>

          <section className="sky-metrics" aria-label="工作区指标">
            {metrics.map(metric => (
              <article className="sky-metric" data-tone={metric.tone} key={metric.name}>
                <div className="sky-metric-head"><Mark className="sky-metric-icon" icon={metric.icon} /><h2>{metric.name}</h2></div>
                <strong className="sky-metric-value"><bdi>{metric.value}</bdi></strong>
                <p>{metric.note}</p>
              </article>
            ))}
          </section>

          <div className="sky-data-grid">
            <section className="sky-panel sky-task-panel" id="tasks" tabIndex={-1} aria-label="任务列表">
              <div className="sky-panel-head sky-task-head">
                <div><h2>任务列表</h2><p>按负责人或任务名称查找。</p></div>
                <div className="sky-task-search">
                  <Icon name="search" />
                  <label className="sky-visually-hidden" htmlFor={searchId}>搜索任务</label>
                  <input className="mf-input" id={searchId} type="search" placeholder="搜索任务" value={query} onChange={event => setQuery(event.currentTarget.value)} />
                </div>
              </div>
              <Tabs aria-label="任务状态" selectedKey={tab} onSelectionChange={setTab} items={items.map(item => ({
                id: item.id, label: item.label, content: <TaskTable rows={item.rows} onReset={resetTasks} />,
              }))} />
            </section>

            <section className="sky-panel sky-timeline" aria-label="活动时间线">
              <div className="sky-panel-head"><h2>活动时间线</h2><p>Agent 最近更新</p></div>
              <ol>
                {tasks.map(task => (
                  <li key={task.agent} data-status={task.intent}>
                    <Mark className="sky-timeline-icon" icon={task.icon} />
                    <div><strong>{task.event}</strong><p><bdi>Agent {task.agent}</bdi><time dateTime={task.time}><bdi>{task.time}</bdi></time></p></div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <Controls />
          <Overlays />
        </main>
      </div>
    </div>
  );
}
