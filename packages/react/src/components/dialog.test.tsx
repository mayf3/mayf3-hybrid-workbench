import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { Dialog } from "./dialog";

function Harness({ onConfirm }: { onConfirm?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>打开对话框</Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        title="删除草稿"
        description="此操作不可撤销。"
        footer={
          <Button
            intent="danger"
            onPress={() => {
              onConfirm?.();
              setOpen(false);
            }}
          >
            确认删除
          </Button>
        }
      >
        <p>对话框正文内容。</p>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("opens with initial focus on the dialog and the title associated", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "打开对话框" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "删除草稿" })).toBeInTheDocument();
    // React Aria focuses the dialog element itself for a clean SR announcement.
    expect(dialog).toHaveFocus();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "打开对话框" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("traps Tab focus inside the dialog", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "打开对话框" }));
    await screen.findByRole("dialog");
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("fires footer actions and closes through onOpenChange", async () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "打开对话框" }));
    await user.click(await screen.findByRole("button", { name: "确认删除" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("applies size classes", () => {
    render(
      <Dialog isOpen onOpenChange={() => undefined} title="大型对话框" size="lg">
        正文
      </Dialog>,
    );
    // Modal portals into document.body.
    expect(document.body.querySelector(".mf-dialog--lg")).toBeInTheDocument();
  });
});
