import { useId, useRef, useState } from "react";
import { Button, Dialog, StatusBadge } from "@mayf3/ui-react";
import { Icon } from "../visual-directions/Icon";
import { agentTaskAnchor, agentToolAnchor, approvalStatus, type AgentApproval, type ApprovalDecision, type ToolCall } from "./agent-model";

function ApprovalConsequence({ approval }: { approval: AgentApproval }) {
  return <div className="agent-approval-impact"><dt>可能后果</dt><dd>{approval.consequence}</dd></div>;
}

function ApprovalFacts({ approval, includeConsequence = true }: { approval: AgentApproval; includeConsequence?: boolean }) {
  return (
    <dl className="agent-approval-facts">
      <div><dt>申请人</dt><dd><bdi>{approval.requester}</bdi></dd></div>
      <div><dt>责任人</dt><dd>{approval.owner}</dd></div>
      <div className="agent-approval-scope"><dt>审批范围</dt><dd>{approval.scope}</dd></div>
      {includeConsequence && <ApprovalConsequence approval={approval} />}
    </dl>
  );
}

export function AgentApprovalCard({ approval, onDecision, presentation }: {
  approval: AgentApproval;
  onDecision: (id: string, decision: ApprovalDecision) => void;
  presentation?: "decision";
}) {
  const title = useId();
  const [dialog, setDialog] = useState<"details" | "confirm">();
  const detailsButton = useRef<HTMLButtonElement>(null);
  const pending = approval.status === "pending";
  const high = approval.risk === "high";
  const status = approvalStatus[approval.status];

  function approve() {
    setDialog(undefined);
    onDecision(approval.id, "approved");
  }

  return (
    <article className="agent-approval" data-risk={approval.risk} aria-labelledby={title}>
      <header className="agent-operation-head">
        <span className="agent-operation-symbol"><Icon name="shield" className="agent-icon" /></span>
        <h3 id={title}>{approval.title}</h3>
        <StatusBadge intent={high ? "danger" : "neutral"}>{high ? "高风险" : "低风险"}</StatusBadge>
      </header>
      {presentation === "decision"
        ? <dl className="agent-approval-consequence"><ApprovalConsequence approval={approval} /></dl>
        : <ApprovalFacts approval={approval} />}
      <footer className="agent-approval-footer">
        <span role="status"><StatusBadge intent={status.intent}>{status.label}</StatusBadge></span>
        <div className="agent-action-group">
          <Button ref={detailsButton} size="sm" intent="quiet" onPress={() => setDialog("details")}>查看详情</Button>
          {pending && <Button size="sm" intent="secondary" onPress={() => {
            detailsButton.current?.focus();
            onDecision(approval.id, "rejected");
          }}>拒绝</Button>}
          <Button size="sm" intent={pending && high ? "primary" : "secondary"}
            onPress={() => {
              if (!pending) setDialog("details");
              else if (high) setDialog("confirm");
              else approve();
            }}>
            {pending ? "批准" : "查看决定"}
          </Button>
        </div>
      </footer>
      {presentation === "decision" && <ApprovalFacts approval={approval} includeConsequence={false} />}
      <Dialog
        isOpen={Boolean(dialog)}
        onOpenChange={isOpen => { if (!isOpen) setDialog(undefined); }}
        title={dialog === "confirm" ? `批准${approval.title}？` : approval.title}
        description="此预览只记录模拟审批。"
        footer={dialog === "confirm" ? <>
          <Button intent="secondary" autoFocus onPress={() => setDialog(undefined)}>取消</Button>
          <Button onPress={approve}>确认批准</Button>
        </> : <Button intent="secondary" onPress={() => setDialog(undefined)}>关闭</Button>}
      >
        <ApprovalFacts approval={approval} />
        {dialog === "details" && <StatusBadge intent={status.intent}>{status.label}</StatusBadge>}
      </Dialog>
    </article>
  );
}

export function AgentApprovals({ approvals, onDecision }: {
  approvals: readonly AgentApproval[];
  onDecision: (id: string, decision: ApprovalDecision) => void;
}) {
  return (
    <section className="agent-section agent-approvals" id="approvals" aria-labelledby="agent-approvals-title">
      <div className="agent-section-heading"><h2 id="agent-approvals-title">审批队列</h2></div>
      <div className="agent-approvals-list">
        {approvals.map(approval => <AgentApprovalCard key={approval.id} approval={approval} onDecision={onDecision} />)}
      </div>
    </section>
  );
}

export function AgentToolCall({ call, onRetry, refined }: { call: ToolCall; onRetry: (id: string) => void; refined?: boolean }) {
  const summary = useRef<HTMLElement>(null);
  const failed = call.status === "failed";
  return (
    <details className="agent-tool" data-state={call.status}>
      <summary ref={summary} id={refined ? agentToolAnchor(call.id) : undefined}>
        <span className="agent-operation-symbol"><Icon name="controls" className="agent-icon" /></span>
        <span className="agent-tool-name"><strong>{call.name}</strong><code>{call.command}</code></span>
        <StatusBadge intent={failed ? "danger" : "success"}>{failed ? "失败" : "通过"}</StatusBadge>
        <Icon className="agent-icon agent-tool-chevron" name="expand" />
      </summary>
      <div className="agent-tool-details">
        <dl>
          <div><dt>调用方</dt><dd><bdi>{call.actor}</bdi></dd></div>
          {refined && call.taskId && <div><dt>关联任务</dt><dd>
            <a className="agent-record-link" data-agent-task-link href={`#${agentTaskAnchor(call.taskId)}`}>查看任务</a>
          </dd></div>}
          <div><dt>输入摘要</dt><dd>{call.input}</dd></div>
          <div><dt>执行结果</dt><dd>{call.result}</dd></div>
          {call.error && <div className="agent-error"><dt>错误</dt><dd>{call.error}</dd></div>}
          <div><dt>尝试次数</dt><dd><bdi>{call.attempts}</bdi></dd></div>
        </dl>
        {failed && <Button size="sm" intent="secondary" onPress={() => {
          summary.current?.focus();
          onRetry(call.id);
        }}>重试校验</Button>}
      </div>
    </details>
  );
}

export function AgentToolCalls({ calls, onRetry, refined }: {
  calls: readonly ToolCall[];
  onRetry: (id: string) => void;
  refined?: boolean;
}) {
  return (
    <section className="agent-section agent-tools" id="tools" aria-labelledby="agent-tools-title">
      <div className="agent-section-heading"><h2 id="agent-tools-title">工具调用</h2></div>
      <div className="agent-tools-list">{calls.map(call => <AgentToolCall key={call.id} call={call} onRetry={onRetry} refined={refined} />)}</div>
    </section>
  );
}
