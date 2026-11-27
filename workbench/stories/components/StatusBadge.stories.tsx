import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge, type StatusIntent } from "@mayf3/ui-react";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "状态徽标。语义色来自共享状态 token（success/info/warning/danger/neutral），浅色与深色主题自动适配。\n\n" +
          "**API**：`intent`（五种状态）、`children`（状态文字，必填）。\n\n" +
          "**适用**：课程发布状态、同步状态、健康度提示等简短状态。\n" +
          "**反例**：不要只放一个圆点不放文字——圆点是冗余提示，读屏用户只能听到文字；" +
          "不要用徽标承载可点击的入口（那是 Button/Link）；warning 不是 danger，别用吓红用户的方式表达「可重试」。\n\n" +
          "**A11y**：文字即内容；圆点 aria-hidden；颜色对比按状态 token 在两套主题下校验。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

const intents: StatusIntent[] = ["success", "info", "warning", "danger", "neutral"];
const labels: Record<StatusIntent, string> = {
  success: "已发布",
  info: "同步中",
  warning: "待审核",
  danger: "同步失败",
  neutral: "草稿",
};

export const AllIntents: Story = {
  render: () => (
    <div className="mf-demo-row">
      {intents.map(intent => (
        <StatusBadge key={intent} intent={intent}>
          {labels[intent]}
        </StatusBadge>
      ))}
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="mf-demo-grid" style={{ maxWidth: 300 }}>
      <StatusBadge intent="warning">
        这是一个相当长的中文状态描述用于验证换行
      </StatusBadge>
      <StatusBadge intent="danger">Pneumonoultramicroscopicsilicovolcanoconiosis</StatusBadge>
    </div>
  ),
  parameters: { docs: { description: { story: "长文本在窄容器内换行，不溢出。" } } },
};

export const Matrix: Story = {
  render: () => (
    <div data-testid="capture" className="mf-demo-row">
      {intents.map(intent => (
        <StatusBadge key={intent} intent={intent}>
          {labels[intent]}
        </StatusBadge>
      ))}
    </div>
  ),
};
