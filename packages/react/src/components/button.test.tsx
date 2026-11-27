import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders a native button with intent and size classes", () => {
    render(<Button intent="secondary" size="lg">保存</Button>);
    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toHaveClass("mf-btn", "mf-btn--secondary", "mf-btn--lg");
  });

  it("keeps the accessible name while loading and sets aria-busy", () => {
    render(<Button loading>提交</Button>);
    const button = screen.getByRole("button", { name: "提交" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-loading");
    expect(button).toBeDisabled();
  });

  it("blocks click and keyboard activation when loading", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>提交</Button>);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires on click and keyboard activation when enabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>删除</Button>);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("is disabled when isDisabled is set", () => {
    render(<Button isDisabled>下一步</Button>);
    expect(screen.getByRole("button", { name: "下一步" })).toBeDisabled();
  });

  it("applies a custom className after the built-in classes", () => {
    render(<Button className="extra">确定</Button>);
    expect(screen.getByRole("button")).toHaveClass("mf-btn", "extra");
  });
});
