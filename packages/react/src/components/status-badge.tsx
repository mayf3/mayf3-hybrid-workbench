import * as React from "react";

export type StatusIntent = "success" | "info" | "warning" | "danger" | "neutral";

export interface StatusBadgeProps {
  /** Semantic status; maps to shared status tokens in both light and dark. */
  intent?: StatusIntent;
  /** Status text is required — the dot is a redundant visual cue only. */
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ intent = "neutral", children, className }: StatusBadgeProps) {
  return (
    <span className={["mf-status-badge", `mf-status-badge--${intent}`, className].filter(Boolean).join(" ")}>
      <span className="mf-status-badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}
