import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./text-field";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="课程名称" />);
    const input = screen.getByLabelText("课程名称");
    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  it("associates description via aria-describedby", () => {
    render(<TextField label="邮箱" description="用于接收学习报告" />);
    const input = screen.getByLabelText("邮箱");
    const description = screen.getByText("用于接收学习报告");
    expect(description.id).toBeTruthy();
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining(description.id));
  });

  it("marks invalid state and associates the error message", () => {
    render(<TextField label="邮箱" errorMessage="邮箱格式不正确" />);
    const input = screen.getByLabelText("邮箱");
    const error = screen.getByText("邮箱格式不正确");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining(error.id));
  });

  it("supports controlled value updates", async () => {
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <TextField
          label="标题"
          value={value}
          onChange={v => {
            onChange(v);
            setValue(v);
          }}
        />
      );
    }
    render(<Harness />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("标题"), "海");
    expect(onChange).toHaveBeenCalledWith("海");
    expect(screen.getByLabelText("标题")).toHaveValue("海");
  });

  it("supports uncontrolled defaultValue", () => {
    render(<TextField label="标题" defaultValue="既有标题" />);
    expect(screen.getByLabelText("标题")).toHaveValue("既有标题");
  });

  it("renders required label and disables the input", () => {
    render(<TextField label="必填项" isRequired isDisabled />);
    const input = screen.getByLabelText(/必填项/);
    expect(input).toBeDisabled();
    // Required is marked natively and rendered as a visible star for sighted users.
    expect(input).toHaveAttribute("required");
    expect(screen.getByText("*", { selector: ".mf-field__required" })).toBeInTheDocument();
  });

  it("renders readOnly input", () => {
    render(<TextField label="只读" defaultValue="固定值" isReadOnly />);
    expect(screen.getByLabelText("只读")).toHaveAttribute("readonly");
  });

  it("applies size classes", () => {
    render(<TextField label="小尺寸" size="sm" />);
    const field = screen.getByLabelText("小尺寸").closest(".mf-field");
    expect(field).toHaveClass("mf-field--sm");
  });
});
