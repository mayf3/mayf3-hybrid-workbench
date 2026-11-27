import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "@mayf3/ui-react";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "二元开关。role=switch + aria-checked 由 React Aria 提供；整行 label 都是点击目标；Space/点击切换。\n\n" +
          "**API**：`children`（可见标签，即 accessible name）、`isSelected/defaultSelected/onChange`、`isDisabled`。\n\n" +
          "**适用**：即时生效的偏好设置（通知、自动同步）。\n" +
          "**反例**：不要用它替代提交型复选（表单条款勾选用 checkbox）；不要省略 children 只留轨道——读屏用户将听到无名开关；" +
          "不要用颜色作为唯一状态线索（本组件由滑块位置 + 轨道色共同表达）。\n\n" +
          "**A11y**：状态由原生 checked 承载；RTL 下滑块方向自动镜像；禁用态整行降透明度并阻断交互。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="mf-demo-section">
      <Switch defaultSelected>自动同步学习进度</Switch>
      <Switch>仅 Wi-Fi 下下载</Switch>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div className="mf-demo-section">
        <Switch isSelected={on} onChange={setOn}>
          深海模式（当前：{on ? "开" : "关"}）
        </Switch>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="mf-demo-section">
      <Switch isDisabled>访客模式下不可用</Switch>
      <Switch isDisabled defaultSelected>
        已锁定的偏好
      </Switch>
    </div>
  ),
};

export const Matrix: Story = {
  render: () => (
    <div data-testid="capture" className="mf-demo-grid">
      <Switch defaultSelected>开启状态</Switch>
      <Switch>关闭状态</Switch>
      <Switch isDisabled>禁用关闭</Switch>
      <Switch isDisabled defaultSelected>
        禁用开启
      </Switch>
    </div>
  ),
};
