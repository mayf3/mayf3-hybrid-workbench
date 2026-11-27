import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

// RAC renders Switch as a native checkbox input with role="switch";
// state is carried by the `checked` property (not aria-checked).
function checkedOf(el: HTMLElement): boolean {
  return (el as HTMLInputElement).checked;
}

describe("Switch", () => {
  it("renders role=switch with a label and toggles on click", async () => {
    const onChange = vi.fn();
    render(<Switch defaultSelected onChange={onChange}>自动同步</Switch>);
    const user = userEvent.setup();
    const switchEl = screen.getByRole("switch", { name: "自动同步" });
    expect(checkedOf(switchEl)).toBe(true);
    await user.click(switchEl);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(checkedOf(switchEl)).toBe(false);
  });

  it("toggles with Space key", async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>飞行模式</Switch>);
    const user = userEvent.setup();
    const switchEl = screen.getByRole("switch", { name: "飞行模式" });
    expect(checkedOf(switchEl)).toBe(false);
    switchEl.focus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkedOf(switchEl)).toBe(true);
  });

  it("supports controlled usage", async () => {
    function Harness() {
      const [on, setOn] = useState(true);
      return <Switch isSelected={on} onChange={setOn}>受控开关</Switch>;
    }
    render(<Harness />);
    const user = userEvent.setup();
    const switchEl = screen.getByRole("switch", { name: "受控开关" });
    expect(checkedOf(switchEl)).toBe(true);
    await user.click(switchEl);
    expect(checkedOf(switchEl)).toBe(false);
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch isDisabled onChange={onChange}>已停用</Switch>);
    const user = userEvent.setup();
    const switchEl = screen.getByRole("switch", { name: "已停用" });
    await user.click(switchEl);
    expect(onChange).not.toHaveBeenCalled();
    // RAC renders the data-disabled marker on the visible label wrapper.
    expect(switchEl.closest(".mf-switch")).toHaveAttribute("data-disabled");
  });
});
