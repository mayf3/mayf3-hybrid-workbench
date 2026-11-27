import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, type ButtonIntent, type ButtonSize } from "@mayf3/ui-react";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "操作按钮。React Aria 提供键盘激活（Enter/Space）、焦点与按压语义；Mayf3 只负责视觉。\n\n" +
          "**API**：`intent`（primary 主操作 / secondary 次级 / quiet 低强调 / danger 破坏性）、`size`（sm|md|lg，md 跟随密度轴）、" +
          "`loading`（禁止重复触发 + aria-busy + 保留 accessible name）、`isDisabled`，其余原生 button / React Aria 属性透传。\n\n" +
          "**适用**：一个视图只放一个 primary；表单提交、确认、入口跳转。\n" +
          "**反例**：不要用 danger 做普通跳转；不要同时出现多个 primary；不要用按钮表达开关状态（用 Switch）；" +
          "不要给 loading 再叠加“请稍候”按钮文字变化以外的行为。\n\n" +
          "**A11y**：focus-visible 高亮描边；disabled 后不可聚焦但仍保留文案语义；loading 设 aria-busy，spinner 对读屏隐藏。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "开始学习", intent: "primary" },
};

export const Secondary: Story = {
  args: { children: "查看大纲", intent: "secondary" },
};

export const Quiet: Story = {
  args: { children: "稍后再说", intent: "quiet" },
};

export const Danger: Story = {
  args: { children: "删除草稿", intent: "danger" },
};

export const Sizes: Story = {
  render: () => (
    <div className="mf-demo-row">
      <Button size="sm">小</Button>
      <Button size="md">中</Button>
      <Button size="lg">大</Button>
    </div>
  ),
  parameters: { docs: { description: { story: "尺寸阶梯：sm=32px，md 跟随密度（comfortable 下 40px），lg=44px。" } } },
};

export const Loading: Story = {
  render: () => (
    <div className="mf-demo-row">
      <Button loading>提交中</Button>
      <Button loading intent="secondary">
        保存中
      </Button>
    </div>
  ),
  parameters: { docs: { description: { story: "loading 期间按钮被禁用但保留 accessible name，spinner 不读屏。" } } },
};

export const Disabled: Story = {
  render: () => (
    <div className="mf-demo-row">
      <Button isDisabled>不可用</Button>
      <Button isDisabled intent="secondary">
        不可用
      </Button>
    </div>
  ),
};

/** Full variant × size × state grid, used for visual regression capture. */
export const Matrix: Story = {
  render: () => {
    const intents: ButtonIntent[] = ["primary", "secondary", "quiet", "danger"];
    const sizes: ButtonSize[] = ["sm", "md", "lg"];
    return (
      <div data-testid="capture" className="mf-demo-grid">
        {intents.map(intent => (
          <div key={intent} className="mf-demo-row">
            {sizes.map(size => (
              <Button key={size} intent={intent} size={size}>
                操作
              </Button>
            ))}
            <Button intent={intent} isDisabled>
              禁用
            </Button>
            <Button intent={intent} loading>
              加载
            </Button>
          </div>
        ))}
      </div>
    );
  },
};
