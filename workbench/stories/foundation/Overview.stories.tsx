import type { Meta } from "@storybook/react-vite";
import { Button, SelectField, StatusBadge, Switch, Tabs, TextField } from "@mayf3/ui-react";

const meta: Meta = {
  title: "Foundation/Overview",
  parameters: {
    layout: "fullscreen",
    options: { showToolbar: true },
  },
};

export default meta;

export const Overview = {
  render: () => (
    <div className="mf-demo-section" style={{ maxWidth: 720 }}>
      <h1 className="mf-demo-title">Mayf3 UI Foundation 工作台</h1>
      <p className="mf-demo-label">React Aria 行为层 + Mayf3 视觉层 + 共享 Semantic Tokens</p>

      <div className="mf-demo-panel">
        <h2 className="mf-demo-title">CSS 加载顺序</h2>
        <p style={{ fontSize: "var(--mf-font-size-sm)", lineHeight: "var(--mf-line-height-normal)" }}>
          1. tokens（<code>--mf-*</code> 变量，由 <code>src/tokens.json</code> 生成）→ 2. 主题（
          <code>foundation.css</code>：density / expression / dark 轴）→ 3. 组件样式（
          <code>@mayf3/ui-react/styles.css</code>）。组件 CSS 只消费语义 token，不定义颜色。
        </p>
      </div>

      <div className="mf-demo-panel">
        <h2 className="mf-demo-title">主题轴</h2>
        <p style={{ fontSize: "var(--mf-font-size-sm)", lineHeight: "var(--mf-line-height-normal)" }}>
          用顶部工具栏切换 <code>theme</code>（light/dark）、<code>density</code>（compact/comfortable/spacious）、
          <code>expression</code>（quiet/neutral/expressive）与 <code>dir</code>（LTR/RTL）。
          四个轴正交，Playwright 套件在多轴组合下做回归。
        </p>
        <div className="mf-demo-row" style={{ marginTop: "var(--mf-space-4)" }}>
          <Button>主操作</Button>
          <Button intent="secondary">次级</Button>
          <StatusBadge intent="success">已发布</StatusBadge>
          <Switch defaultSelected>自动同步</Switch>
        </div>
      </div>

      <div className="mf-demo-panel">
        <h2 className="mf-demo-title">反例速查</h2>
        <ul style={{ fontSize: "var(--mf-font-size-sm)", lineHeight: "var(--mf-line-height-relaxed)" }}>
          <li>一个视图一个 primary 按钮；quiet 用于低强调操作。</li>
          <li>不要用 placeholder 代替 label；错误必须关联到输入（TextField 已内置）。</li>
          <li>状态徽标必须带文字；圆点只是冗余提示。</li>
          <li>复杂交互（焦点管理、键盘、模态）交给 React Aria，不要在业务里重写。</li>
          <li>组件不暴露 CSS 实现细节（颜色/圆角/阴影），只暴露 intent/size 等语义 API。</li>
        </ul>
      </div>

      <div className="mf-demo-panel">
        <h2 className="mf-demo-title">快速试用</h2>
        <TextField label="邮箱" description="工作台内所有组件都是活的，可以直接操作" />
        <div style={{ marginTop: "var(--mf-space-3)" }}>
          <SelectField
            label="潜点"
            items={[
              { id: "a", label: "浅滩珊瑚带" },
              { id: "b", label: "深海区" },
            ]}
          />
        </div>
        <div style={{ marginTop: "var(--mf-space-3)" }}>
          <Tabs
            items={[
              { id: "1", label: "概览", content: <p>面板一</p> },
              { id: "2", label: "设置", content: <p>面板二</p> },
            ]}
            aria-label="试用"
          />
        </div>
      </div>
    </div>
  ),
};
