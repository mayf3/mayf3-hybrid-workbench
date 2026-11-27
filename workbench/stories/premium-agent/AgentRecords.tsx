import { StatusBadge } from "@mayf3/ui-react";
import { Icon } from "../visual-directions/Icon";
import {
  activityKind, agentEventAnchor, agentTaskAnchor, agentToolAnchor, approvalStatus, weeklyDelivery,
  type AgentChange, type AgentEvent, type DeliverySummary,
} from "./agent-model";

export function AgentActivityTimeline({ events, refined }: { events: readonly AgentEvent[]; refined?: boolean }) {
  return (
    <section className="agent-section agent-timeline" id="activity" aria-labelledby="agent-activity-title">
      <div className="agent-section-heading"><h2 id="agent-activity-title">活动时间线</h2></div>
      <ol className="agent-event-list" aria-label="按更新时间倒序">
        {events.map(event => {
          const approval = refined && event.approvalDecision;
          const kind = approval ? { label: "审批", intent: "neutral", icon: "shield" } as const : activityKind[event.kind];
          return (
            <li key={event.id} id={refined ? agentEventAnchor(event.id) : undefined} tabIndex={refined ? -1 : undefined}
              data-kind={approval ? "approval" : event.kind}>
              <div className="agent-event-symbol" data-intent={kind.intent}><Icon name={kind.icon} className="agent-icon" /></div>
              <div className="agent-event-body">
                <div className="agent-event-title"><strong>{event.title}</strong><time dateTime={event.time}>{event.time}</time></div>
                <p><bdi>{event.actor}</bdi><span aria-hidden="true">·</span>{kind.label}</p>
                {refined && (event.taskId || event.toolCallId) && (
                  <div className="agent-event-links">
                    {event.taskId && <a className="agent-record-link" data-agent-task-link href={`#${agentTaskAnchor(event.taskId)}`}>查看任务</a>}
                    {event.toolCallId && <a className="agent-record-link" href={`#${agentToolAnchor(event.toolCallId)}`} onClick={click => {
                      if (click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return;
                      const details = document.getElementById(click.currentTarget.hash.slice(1))?.parentElement;
                      if (details instanceof HTMLDetailsElement) details.open = true;
                    }}>查看工具调用</a>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function AgentDiffTable({ changes }: { changes: readonly AgentChange[] }) {
  return (
    <section className="agent-section agent-diff" id="diff" aria-labelledby="agent-diff-title">
      <div className="agent-section-heading"><h2 id="agent-diff-title">变更记录</h2></div>
      <table className="agent-table" aria-label="工作区变更">
        <thead><tr><th scope="col">变更 / 影响范围</th><th scope="col">变更前后</th><th scope="col">决策</th></tr></thead>
        <tbody>
          {changes.map(change => {
            const status = approvalStatus[change.approval];
            return (
              <tr key={change.id}>
                <th scope="row"><strong className="agent-row-title">{change.name}</strong><span className="agent-diff-scope">{change.scope}</span></th>
                <td>
                  <span className="agent-diff-before"><span>原</span>{change.before}</span>
                  <span className="agent-diff-after"><span>新</span>{change.after}</span>
                </td>
                <td><StatusBadge intent={status.intent}>{status.label}</StatusBadge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function AgentDeliverySummary({ delivery, refined }: { delivery: DeliverySummary; refined?: boolean }) {
  return (
    <section className="agent-section agent-delivery" id="delivery" aria-labelledby="agent-delivery-title">
      <div className="agent-section-heading"><h2 id="agent-delivery-title">交付总结</h2></div>
      <dl className="agent-delivery-details">
        {refined && <div>
          <dt>本周交付完成率</dt>
          <dd><bdi>{weeklyDelivery.completed} / {weeklyDelivery.planned}（{(weeklyDelivery.completed / weeklyDelivery.planned * 100).toFixed(1)}%）</bdi></dd>
        </div>}
        <div><dt>已完成</dt><dd>{delivery.completed}</dd></div>
        {refined && <div><dt>验收通过率</dt><dd>未统计</dd></div>}
        <div><dt>验收结果</dt><dd>{delivery.verification}</dd></div>
        <div>
          <dt>证据</dt>
          <dd className="agent-evidence">{delivery.evidence.map(item => <a key={item.href} href={item.href}>{item.label}<Icon name="arrow" className="agent-icon" /></a>)}</dd>
        </div>
        <div className="agent-delivery-risk"><dt>未解决风险</dt><dd>{delivery.risk}</dd></div>
        <div><dt>下一步责任人</dt><dd>{delivery.owner}</dd></div>
      </dl>
    </section>
  );
}
