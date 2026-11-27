import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs, type TabItem } from "@mayf3/ui-react";

const basicItems: TabItem[] = [
  { id: "overview", label: "概览", content: <p>课程进度、最近学习与下周计划。</p> },
  { id: "lessons", label: "课程", content: <p>全部课程列表与筛选。</p> },
  { id: "settings", label: "设置", content: <p>主题、密度与通知偏好。</p> },
];

const manyItems: TabItem[] = [
  { id: "a", label: "概览", content: <p>面板 A</p> },
  { id: "b", label: "学习记录", content: <p>面板 B</p> },
  { id: "c", label: "笔记与摘录", content: <p>面板 C</p> },
  { id: "d", label: "数据统计 Internationalization", content: <p>面板 D</p> },
  { id: "e", label: "导入导出", content: <p>面板 E</p> },
  { id: "f", label: "设置", content: <p>面板 F</p> },
];

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "选项卡。tablist/tab/tabpanel 语义与键盘导航（←→、Home/End、自动激活）由 React Aria 管理；面板保持挂载以保留内部状态。\n\n" +
          "**API**：`items: {id,label,content}[]`、`selectedKey/defaultSelectedKey/onSelectionChange`（受控/非受控）、`aria-label`、`aria-labelledby`。\n\n" +
          "**适用**：同一上下文内的视图切换（2–7 个）。\n" +
          "**反例**：不要用 Tabs 做分页步骤（改用明确的上一步/下一步流）；不要在 tab 里再嵌套一层 Tabs；" +
          "tab 数量过多时先考虑信息架构而不是横向滚动兜底。\n\n" +
          "**A11y**：选中 tab 有 aria-selected 与可见底板指示；方向键导航由 primitive 处理；panel 通过 id/aria-controls 关联。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => <Tabs items={basicItems} defaultSelectedKey="overview" aria-label="课程工作区" />,
};

export const Controlled: Story = {
  render: () => {
    const [key, setKey] = useState("lessons");
    return (
      <div className="mf-demo-section">
        <Tabs items={basicItems} selectedKey={key} onSelectionChange={setKey} aria-label="课程工作区" />
        <p className="mf-demo-label">当前选中：{key}</p>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  render: () => <Tabs items={manyItems} defaultSelectedKey="a" aria-label="多选项卡" />,
  parameters: { docs: { description: { story: "超宽 tab 列表：列表横向滚动而非折行挤压（overflow-x auto）。" } } },
};

export const Matrix: Story = {
  render: () => (
    <div data-testid="capture" className="mf-demo-grid">
      <Tabs items={basicItems} defaultSelectedKey="overview" aria-label="示例一" />
      <Tabs items={manyItems.slice(0, 4)} defaultSelectedKey="b" aria-label="示例二" />
    </div>
  ),
};
