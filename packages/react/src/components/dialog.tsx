import * as React from "react";
import { Modal, ModalOverlay, Dialog as AriaDialog, Heading } from "react-aria-components";

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps {
  isOpen: boolean;
  /** Fired on Escape, overlay press, or any dismiss trigger inside. */
  onOpenChange: (isOpen: boolean) => void;
  /** Rendered as the accessible dialog title (aria-labelledby target). */
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Actions row; provide Buttons from this package. */
  footer?: React.ReactNode;
  /** Allow Escape and outside-press dismissal. Default true. */
  isDismissable?: boolean;
  size?: DialogSize;
}

/**
 * Modal dialog. Focus is trapped inside, restored to the trigger on close,
 * page scroll is locked, and Escape closes when `isDismissable` — all handled
 * by React Aria. Keep footers to one primary action.
 */
export function Dialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  isDismissable = true,
  size = "md",
}: DialogProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      className="mf-dialog__overlay"
    >
      <Modal className={["mf-dialog", size !== "md" && `mf-dialog--${size}`].filter(Boolean).join(" ")}>
        <AriaDialog className="mf-dialog__surface">
          <header className="mf-dialog__header">
            <Heading slot="title" className="mf-dialog__title">
              {title}
            </Heading>
            {description && <p className="mf-dialog__description">{description}</p>}
          </header>
          <div className="mf-dialog__body">{children}</div>
          {footer && <footer className="mf-dialog__footer">{footer}</footer>}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
