import * as React from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";

export interface SwitchProps extends Omit<AriaSwitchProps, "className" | "children" | "style"> {
  /** Visible label — the accessible name. Do not rely on color alone. */
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Binary toggle. `role="switch"` with `aria-checked` is provided by React Aria;
 * Space toggles, and the label participates in the press target.
 * State is carried by thumb position plus track color, never color alone.
 */
export function Switch({ children, className, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props} className={["mf-switch", className].filter(Boolean).join(" ")}>
      <span className="mf-switch__track" aria-hidden="true">
        <span className="mf-switch__thumb" />
      </span>
      <span className="mf-switch__label">{children}</span>
    </AriaSwitch>
  );
}
