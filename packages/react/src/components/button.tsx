import * as React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

export type ButtonIntent = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "style" | "children"> {
  /** Visual weight. One primary action per view; quiet for low-emphasis actions. */
  intent?: ButtonIntent;
  /** sm/md track the control-height scale; md follows the density axis. */
  size?: ButtonSize;
  /**
   * Shows a spinner, blocks re-triggering and sets aria-busy.
   * The accessible name (children) is preserved; prefer changing the label
   * text ("Saving…") when the action has a progress semantics.
   */
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// React Aria filters unknown DOM attributes, so aria-busy is applied
// imperatively to the native button element.
function setAriaBusy(node: HTMLButtonElement | null, busy: boolean) {
  if (!node) return;
  if (busy) node.setAttribute("aria-busy", "true");
  else node.removeAttribute("aria-busy");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ intent = "primary", size = "md", loading = false, isDisabled, className, children, ...props }, forwardedRef) {
    const ariaBusyRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        setAriaBusy(node, loading);
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [loading, forwardedRef],
    );
    return (
      <AriaButton
        {...props}
        ref={ariaBusyRef}
        isDisabled={isDisabled || loading}
        // `mf-btn` (not the legacy hand-written `mf-button` theme class):
        // the React control must not inherit the theme's generic button rules.
        className={["mf-btn", `mf-btn--${intent}`, `mf-btn--${size}`, loading && "is-loading", className].filter(Boolean).join(" ")}
        data-loading={loading || undefined}
      >
        <span className="mf-btn__content">{children}</span>
        {loading && <span className="mf-spinner" aria-hidden="true" />}
      </AriaButton>
    );
  },
);
Button.displayName = "Button";
