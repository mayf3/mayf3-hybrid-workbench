import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TextField, type FieldSize } from "@mayf3/ui-react";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "单行文本输入。label 真实关联（click label 聚焦），description 走 aria-describedby，errorMessage 自动置 aria-invalid 并关联错误文本。\n\n" +
          "**API**：`label`（必填）、`description`、`errorMessage`、`size`（sm|md|lg）、`inputRef`；`value/onChange`、`defaultValue`、" +
          "`isRequired`、`isDisabled`、`isReadOnly`、`placeholder` 等由 React Aria TextField 支持。\n\n" +
          "**适用**：课程名、邮箱、标题等单行输入。\n" +
          "**反例**：不要用 placeholder 代替 label；错误信息不要只靠颜色（本组件错误文案独立成行）；" +
          "不要把长说明塞进 description 两行以上（改用页面级帮助）。\n\n" +
          "**A11y**：invalid 时读屏播报错误（describedby 关联）；required 通过 data-required 渲染可见星号。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: { label: "课程名称", placeholder: "例如：海边的统计学" },
};

export const WithDescription: Story = {
  args: {
    label: "邮箱",
    description: "用于接收每周学习报告",
    placeholder: "you@example.com",
  },
};

export const Invalid: Story = {
  args: {
    label: "邮箱",
    defaultValue: "not-an-email",
    errorMessage: "邮箱格式不正确",
  },
};

export const Required: Story = {
  args: { label: "课程主题", isRequired: true },
};

export const Disabled: Story = {
  args: { label: "已锁定字段", defaultValue: "不可编辑", isDisabled: true },
};

export const ReadOnly: Story = {
  args: { label: "生成结果", defaultValue: "https://learn.mayf3.example/lesson/42", isReadOnly: true },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="mf-demo-section">
        <TextField label="搜索关键词" value={value} onChange={setValue} description={`当前值：${value || "（空）"}`} />
      </div>
    );
  },
  parameters: { docs: { description: { story: "受控用法：value/onChange。" } } },
};

export const LongContent: Story = {
  render: () => (
    <div className="mf-demo-grid" style={{ maxWidth: 320 }}>
      <TextField label="这是一个特别特别长的中文标签用于测试换行表现" description="说明文字也应当跟随换行而不是撑破容器或溢出" />
      <TextField
        label="Internationalization"
        defaultValue="Supercalifragilisticexpialidociousantidisestablishmentarianism"
      />
    </div>
  ),
  parameters: { docs: { description: { story: "长中文标签与无空格长英文单词：容器内换行/省略，不溢出。" } } },
};

export const Matrix: Story = {
  render: () => {
    const sizes: FieldSize[] = ["sm", "md", "lg"];
    return (
      <div data-testid="capture" className="mf-demo-grid">
        {sizes.map(size => (
          <div key={size} style={{ maxWidth: 360 }}>
            <TextField size={size} label={`尺寸 ${size}`} placeholder="输入内容…" description="描述文字" />
          </div>
        ))}
        <div style={{ maxWidth: 360 }}>
          <TextField label="无效" defaultValue="格式错误" errorMessage="格式不正确" />
        </div>
        <div style={{ maxWidth: 360 }}>
          <TextField label="禁用" defaultValue="禁用值" isDisabled />
        </div>
        <div style={{ maxWidth: 360 }}>
          <TextField label="必填" isRequired />
        </div>
      </div>
    );
  },
};
