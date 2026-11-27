import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SelectField, type SelectOption } from "@mayf3/ui-react";

const diveSites: SelectOption[] = [
  { id: "shallow", label: "浅滩珊瑚带" },
  { id: "reef", label: "礁石群（中深度环游路线）" },
  { id: "deep", label: "深海区（需 AOW 证书，注意气瓶余量与回流）" },
  { id: "wreck", label: "沉船遗址" },
];

const meta: Meta<typeof SelectField> = {
  title: "Components/SelectField",
  component: SelectField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "下拉选择。React Aria Select/ListBox/Popover 负责弹出层定位、键盘选择（上下键、Enter、Escape、首字母跳转）、焦点返回；Mayf3 负责视觉。\n\n" +
          "**API**：`label`（必填）、`items: {id,label}[]`、`value/defaultValue/onChange(null|string)`（受控值可为 null 表示清除）、" +
          "`placeholder`、`isRequired`、`isDisabled`、`isInvalid + errorMessage`、`description`、`size`、`emptyMessage`。\n\n" +
          "**适用**：互斥的单选项 ≤ 20 项；更多项考虑搜索式选择。\n" +
          "**反例**：不要用它做多选；不要把操作按钮塞进选项里；空集合必须给可操作的 emptyMessage，不要静默。\n\n" +
          "**A11y**：trigger 带 aria-expanded/haspopup；选项 hover 高亮 data-focused、选中项有 data-selected（视觉加粗，不只靠颜色）；" +
          "关闭后焦点返回 trigger。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

export const Default: Story = {
  args: { label: "潜点", items: diveSites },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("reef");
    return (
      <div className="mf-demo-section">
        <SelectField
          label="潜点"
          items={diveSites}
          value={value}
          onChange={setValue}
          description={`当前值：${value ?? "（未选择）"}`}
        />
      </div>
    );
  },
};

export const Invalid: Story = {
  args: { label: "潜点", items: diveSites, isRequired: true, errorMessage: "请选择潜点后再保存" },
};

export const Disabled: Story = {
  args: { label: "潜点", items: diveSites, defaultValue: "deep", isDisabled: true },
};

export const Empty: Story = {
  args: { label: "潜点", items: [], emptyMessage: "还没有可报名的潜点" },
  parameters: { docs: { description: { story: "空集合：通过 renderEmptyState 给出可操作的空态文案。" } } },
};

export const LongContent: Story = {
  args: { label: "潜点", items: diveSites, defaultValue: "deep" },
  parameters: { docs: { description: { story: "长选项文本：触发器内省略，选项内换行（overflow-wrap），不撑破容器。" } } },
};

export const Sizes: Story = {
  render: () => (
    <div className="mf-demo-grid" style={{ maxWidth: 360 }}>
      <SelectField size="sm" label="小尺寸" items={diveSites} />
      <SelectField size="md" label="中尺寸" items={diveSites} />
      <SelectField size="lg" label="大尺寸" items={diveSites} />
    </div>
  ),
};

export const Matrix: Story = {
  render: () => (
    <div data-testid="capture" className="mf-demo-grid">
      <div style={{ maxWidth: 360 }}>
        <SelectField label="默认" items={diveSites} />
      </div>
      <div style={{ maxWidth: 360 }}>
        <SelectField label="已选" items={diveSites} defaultValue="reef" />
      </div>
      <div style={{ maxWidth: 360 }}>
        <SelectField label="必填" items={diveSites} isRequired />
      </div>
      <div style={{ maxWidth: 360 }}>
        <SelectField label="禁用" items={diveSites} defaultValue="deep" isDisabled />
      </div>
    </div>
  ),
};

/** Open popover captured by Playwright for visual + edge placement checks. */
export const Open: Story = {
  render: () => (
    <div style={{ paddingTop: 8 }}>
      <SelectField label="潜点" items={diveSites} defaultValue="reef" />
    </div>
  ),
};
