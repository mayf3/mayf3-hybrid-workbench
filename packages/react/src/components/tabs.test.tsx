import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./tabs";

const items = [
  { id: "one", label: "概览", content: <p>概览面板</p> },
  { id: "two", label: "课程", content: <p>课程面板</p> },
  { id: "three", label: "设置", content: <p>设置面板</p> },
];

describe("Tabs", () => {
  it("renders tabs and associates panels", () => {
    render(<Tabs items={items} defaultSelectedKey="one" aria-label="示例" />);
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "概览" })).toBeInTheDocument();
    const selected = screen.getByRole("tab", { name: "概览" });
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(selected.getAttribute("aria-controls")).toBe(
      screen.getByRole("tabpanel").id,
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("概览面板");
  });

  it("selects on click", async () => {
    render(<Tabs items={items} defaultSelectedKey="one" aria-label="示例" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "设置" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("设置面板");
    expect(screen.getByRole("tab", { name: "设置" })).toHaveAttribute("data-selected");
  });

  it("navigates with arrow keys", async () => {
    render(<Tabs items={items} defaultSelectedKey="one" aria-label="示例" />);
    const user = userEvent.setup();
    screen.getByRole("tab", { name: "概览" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("课程面板");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("概览面板");
    await user.keyboard("{End}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("设置面板");
  });

  it("supports controlled selection", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Tabs items={items} selectedKey="one" onSelectionChange={onSelectionChange} aria-label="示例" />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "课程" }));
    expect(onSelectionChange).toHaveBeenCalledWith("two");
    // Controlled value stays on "one".
    expect(screen.getByRole("tabpanel")).toHaveTextContent("概览面板");
  });

  it("marks selected tab with data attribute and class", () => {
    render(<Tabs items={items} defaultSelectedKey="two" aria-label="示例" />);
    expect(screen.getByRole("tab", { name: "课程" })).toHaveAttribute("data-selected");
  });
});
