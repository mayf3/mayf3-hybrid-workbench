import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectField, type SelectOption } from "./select-field";

const items: SelectOption[] = [
  { id: "shallow", label: "浅滩" },
  { id: "reef", label: "礁石群" },
  { id: "deep", label: "深海区" },
];

describe("SelectField", () => {
  it("shows the placeholder and opens the listbox from the trigger", async () => {
    render(<SelectField label="潜点" items={items} />);
    const user = userEvent.setup();
    expect(screen.getByText("请选择…")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /潜点/ }));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "礁石群" })).toBeInTheDocument();
  });

  it("selects with keyboard: open, arrow, Enter", async () => {
    const onChange = vi.fn();
    render(<SelectField label="潜点" items={items} onChange={onChange} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: /潜点/ });
    trigger.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
    await user.keyboard("{ArrowDown>2/}");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onChange).toHaveBeenCalledWith("deep");
    // Query the trigger: the hidden native <select> repeats option text.
    expect(trigger).toHaveTextContent("深海区");
  });

  it("closes with Escape without selecting", async () => {
    const onChange = vi.fn();
    render(<SelectField label="潜点" items={items} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /潜点/ }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("请选择…")).toBeInTheDocument();
  });

  it("supports controlled value", () => {
    render(<SelectField label="潜点" items={items} value="reef" />);
    // Query within the trigger: RAC renders a hidden native <select> for forms
    // that repeats the option text.
    const trigger = screen.getByRole("button", { name: /潜点/ });
    expect(trigger).toHaveTextContent("礁石群");
    expect(trigger).not.toHaveTextContent("请选择");
  });

  it("supports defaultValue", () => {
    render(<SelectField label="潜点" items={items} defaultValue="shallow" />);
    expect(screen.getByRole("button", { name: /潜点/ })).toHaveTextContent("浅滩");
  });

  it("is disabled when isDisabled", async () => {
    render(<SelectField label="潜点" items={items} isDisabled />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: /潜点/ });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("stays usable with an empty collection", async () => {
    render(<SelectField label="潜点" items={[]} emptyMessage="没有可选项" />);
    const trigger = screen.getByRole("button", { name: /潜点/ });
    trigger.focus();
    expect(trigger).toHaveFocus();
    expect(trigger).toBeEnabled();
    // Popover rendering of the empty state is verified in the browser-level
    // Playwright suite; jsdom cannot host the open/close focus sequence.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks required and invalid states", () => {
    render(<SelectField label="潜点" items={items} isRequired errorMessage="请选择潜点" />);
    expect(screen.getByText("*", { selector: ".mf-field__required" })).toBeInTheDocument();
    expect(screen.getByText("请选择潜点")).toBeInTheDocument();
  });
});
