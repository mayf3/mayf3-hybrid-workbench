import { useId, useState, type KeyboardEvent } from "react";
import { Button, Dialog, StatusBadge } from "@mayf3/ui-react";
import { approvalStatus, availableTaskAction, taskStatus } from "../premium-agent/agent-model";
import { Icon } from "../visual-directions/Icon";
import { operationsTotals, weeklyOperations, type WorkspaceProps } from "./workspace";
import "./stripe.css";

const actionLabels = { pause: "暂停", resume: "继续", start: "开始" } as const;
const ticks = ["100%", "75%", "50%", "25%", "0%"];

function rate(numerator: number, denominator: number) {
  return 100 * numerator / denominator;
}

function RecoveryChart() {
  const [index, setIndex] = useState(weeklyOperations.length - 1);
  const selected = weeklyOperations[index];
  const detail = useId();
  const keys = useId();

  function navigate(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    const { key, currentTarget } = event;
    if (key !== "Home" && key !== "End" && key !== "ArrowLeft" && key !== "ArrowRight") return;
    event.preventDefault();
    const last = weeklyOperations.length - 1;
    const step = getComputedStyle(currentTarget).direction === "rtl" ? -1 : 1;
    const next = key === "Home" ? 0 : key === "End" ? last
      : key === "ArrowLeft" ? current - step : current + step;
    if (next === current) return;
    const wrapped = (next + weeklyOperations.length) % weeklyOperations.length;
    setIndex(wrapped);
    currentTarget.parentElement?.querySelectorAll("button")[wrapped]?.focus();
  }

  return (
    <figure className="v2s-chart" data-v2-skeleton="趋势图" aria-labelledby="v2s-trend-title">
      <figcaption className="v2s-chart-caption">
        <h2 id="v2s-trend-title">每日恢复与交付</h2>
        <ul aria-label="图例" className="v2s-legend">
          <li><i data-series="recovery" aria-hidden="true" />自动恢复率</li>
          <li><i data-series="delivery" aria-hidden="true" />交付完成率</li>
        </ul>
      </figcaption>
      <div className="v2s-chart-grid">
        <div className="v2s-chart-axis" aria-hidden="true">
          {ticks.map(tick => <span key={tick}>{tick}</span>)}
        </div>
        <div className="v2s-chart-series" role="group" aria-label="选择日期查看指标" aria-describedby={keys}>
          {weeklyOperations.map(({ day, attempts, recovered, delivered, planned }, dayIndex) => (
            <button
              key={day}
              type="button"
              aria-controls={detail}
              aria-pressed={dayIndex === index}
              tabIndex={dayIndex === index ? 0 : -1}
              onClick={() => setIndex(dayIndex)}
              onKeyDown={event => navigate(event, dayIndex)}
            >
              <span className="v2s-chart-bars" aria-hidden="true">
                <i data-series="recovery" style={{ blockSize: `${rate(recovered, attempts)}%` }} />
                <i data-series="delivery" style={{ blockSize: `${rate(delivered, planned)}%` }} />
              </span>
              <span className="v2s-chart-day">{day}</span>
            </button>
          ))}
        </div>
      </div>
      <span id={keys} className="v2-sr">用左右方向键选择日期，按 Home 或 End 跳到首尾。</span>
      <div className="v2s-chart-footnote">
        <div className="v2s-chart-detail" id={detail} aria-live="polite" aria-atomic="true">
          <strong>{selected.day}</strong>
          <span>恢复 <bdi>{selected.recovered}/{selected.attempts}</bdi> 次</span>
          <span>交付 <bdi>{selected.delivered}/{selected.planned}</bdi> 项</span>
        </div>
        <p className="v2s-chart-source">模拟运行日志 · 最近七天</p>
      </div>
    </figure>
  );
}

function StripeReview({ workspace }: Pick<WorkspaceProps, "workspace">) {
  const [reviewing, setReviewing] = useState(false);
  const high = workspace.approvals.find(item => item.risk === "high");
  const snapshots = workspace.calls.find(item => item.id === "snapshots");
  const status = high ? approvalStatus[high.status] : undefined;
  return (
    <section id="v2s-review" className="v2s-review" data-v2-skeleton="风险摘要" aria-label="验收与风险">
      <div>
        <div className="v2s-review-head">
          <Icon name="shield" /><h2>验收与风险</h2>
          {status && <StatusBadge intent={status.intent}>{status.label}</StatusBadge>}
        </div>
        <p>{workspace.delivery.risk}</p>
      </div>
      <div className="v2s-review-evidence">
        <strong>{workspace.delivery.verification}</strong>
        <span>验收通过率 · 未统计</span>
      </div>
      <div className="v2s-review-actions">
        {snapshots?.status === "failed" && (
          <Button intent="quiet" size="sm" onPress={() => workspace.retryTool(snapshots.id)}>重试索引</Button>
        )}
        {high && <Button intent="secondary" size="sm" onPress={() => setReviewing(true)}>复核审批</Button>}
      </div>
      {high && (
        <Dialog
          isOpen={reviewing}
          onOpenChange={setReviewing}
          title={high.title}
          description={high.consequence}
          footer={high.status === "pending" ? <>
            <Button intent="quiet" autoFocus onPress={() => setReviewing(false)}>取消</Button>
            <Button intent="secondary" onPress={() => { workspace.decideApproval(high.id, "rejected"); setReviewing(false); }}>拒绝</Button>
            <Button onPress={() => { workspace.decideApproval(high.id, "approved"); setReviewing(false); }}>确认批准</Button>
          </> : <Button autoFocus onPress={() => setReviewing(false)}>关闭</Button>}
        >
          <p>高风险 · 申请人 <bdi>{high.requester}</bdi> · 责任人 {high.owner}</p>
          <p>审批范围 · {high.scope}</p>
        </Dialog>
      )}
    </section>
  );
}

export function StripeWorkspace({ workspace, selectedTaskId, onSelectTask }: WorkspaceProps) {
  const overview = operationsTotals;
  const selectedTask = workspace.tasks.find(task => task.id === selectedTaskId) ?? workspace.tasks[0];
  const taskDetail = useId();

  return (
    <div className="v2-stripe" data-v2-workspace="stripe">
      <header className="v2s-top" data-v2-skeleton="分析导航">
        <a className="v2s-brand" href="#v2s-overview">
          <span className="v2s-brand-mark"><Icon name="pulse" /></span>
          <span>Mayf3 <strong>Analytics</strong></span>
        </a>
        <nav aria-label="运行分析导航">
          <a href="#v2s-overview">成效</a>
          <a href="#v2s-review">验收</a>
          <a href="#v2s-ledger">台账</a>
        </nav>
        <span className="v2s-period"><Icon name="clock" />本周 · 7 天</span>
      </header>

      <main id="v2s-overview" className="v2s-content">
        <div className="v2s-intro">
          <h1>运行成效</h1>
          <p>在同一周期观察自动恢复与交付完成情况。</p>
        </div>

        <div className="v2s-analysis">
          <section className="v2s-measures" data-v2-skeleton="恢复指标" aria-labelledby="v2s-recovery-title">
            <h2 id="v2s-recovery-title">自动恢复率</h2>
            <bdi className="v2s-hero-number">{overview.recoveryRate.toFixed(1)}<span>%</span></bdi>
            <p><bdi>{overview.recovered} / {overview.attempts}</bdi> 次恢复成功</p>
            <meter min={0} max={overview.attempts} value={overview.recovered} aria-label="自动恢复比例" data-series="recovery" />
            <div className="v2s-completion">
              <div>
                <h3>本周交付</h3>
                <p><bdi>{overview.delivered}/{overview.planned}</bdi> 项</p>
              </div>
              <bdi>{rate(overview.delivered, overview.planned).toFixed(1)}%</bdi>
            </div>
            <meter min={0} max={overview.planned} value={overview.delivered} aria-label="交付完成比例" data-series="delivery" />
            <p className="v2s-denominator">恢复以尝试次数为分母。交付以计划项数为分母。</p>
          </section>
          <RecoveryChart />
        </div>

        <StripeReview workspace={workspace} />

        <section id="v2s-ledger" className="v2s-ledger" data-v2-skeleton="任务台账" aria-labelledby="v2s-ledger-title">
          <header>
            <h2 id="v2s-ledger-title">任务台账</h2>
            <p>活跃任务 <bdi>{workspace.activeCount}</bdi></p>
          </header>
          <table aria-labelledby="v2s-ledger-title">
            <thead>
              <tr><th scope="col">任务与负责人</th><th scope="col">状态</th><th scope="col">执行进度</th></tr>
            </thead>
            <tbody>
              {workspace.tasks.map(task => {
                const status = taskStatus[task.status];
                return (
                  <tr key={task.id} data-selected={task.id === selectedTask?.id || undefined}>
                    <th scope="row">
                      <button type="button" aria-pressed={task.id === selectedTask?.id} aria-controls={taskDetail} onClick={() => onSelectTask(task.id)}>
                        {task.name}
                      </button>
                      <span>{task.agent ? <bdi>Agent {task.agent}</bdi> : "待分配"} · <time>{task.updatedAt}</time></span>
                    </th>
                    <td><StatusBadge intent={status.intent}>{task.status === "waiting" ? "待人工确认" : status.label}</StatusBadge></td>
                    <td>
                      <div className="v2s-ledger-progress">
                        <bdi>{task.progress}%</bdi>
                        <progress max={100} value={task.progress} aria-label={`${task.name}执行进度`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedTask && (
            <div className="v2s-task-detail" id={taskDetail}>
              <div><h3>{selectedTask.name}</h3><p>{selectedTask.stage} · {selectedTask.publicUpdate}</p></div>
              <TaskAction task={selectedTask} onAction={workspace.updateTask} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function TaskAction({ task, onAction }: {
  task: WorkspaceProps["workspace"]["tasks"][number];
  onAction: WorkspaceProps["workspace"]["updateTask"];
}) {
  const action = availableTaskAction(task);
  if (!action) return null;
  return <Button intent="secondary" size="sm" onPress={() => onAction(task.id, action)}>{actionLabels[action]}任务</Button>;
}
