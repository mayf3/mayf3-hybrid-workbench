# 参考方向的 Token 差异

四个方向共用 `PremiumWorkspace`、`useAgentWorkspace` 及 React Aria 行为。表中的角色在 Storybook iframe 的 `body[data-mf-reference]` 解析，浮层由同一个边界继承。[共享 Token 源](../../src/tokens.json) · [方向规则](../../workbench/stories/reference-study/reference.css) · [React 状态样式](../../packages/react/src/styles.css)

| 角色 | A · Vercel | B · Stripe | C · Apple | D · Mayf3 Hybrid |
| --- | --- | --- | --- | --- |
| `surface-canvas` 与导航 | 提升中性底板的白色比例，13rem 导航，选中项由窄强调线定位 | 白色主底、独立浅色导航层 | 中性底板偏冷，11.5rem 导航，选中项为整块柔和底色 | 冷白底、12rem 导航、局部天蓝选中 |
| `premium-type-numeric` | 上限 2rem，短比例轨道 | 上限 2.75rem、560 字重，数字带上下细线，比例轨道覆盖数据列 | 上限 2.5rem，短轨道，留白较多 | 上限 2.125rem、610 字重，中等比例轨道 |
| `premium-numeric-variant` | 四个方向共用 tabular + lining。任务和交付文义由语义 HTML 提供 | 同左，任务表执行列在桌面向逻辑末端对齐 | 同左 | 同左 |
| `reference-run-split` | 1.72:1 | 1.95:1，给数据和工具更多横向空间 | 1.72:1 | 1.8:1 |
| `reference-focal-depth` 与审批 | 无深度，审批按行分隔 | 无深度，执行区有蓝色逻辑起始边，审批按行分隔 | `elevation-2` 提升当前执行，审批两条记录共享一个分组面 | `elevation-1` 用于局部浅蓝执行表面，审批保留独立风险语境和细边 |
| `premium-elevation-button` | 无静止投影 | 短接触影 | 顶缘高光、接触影和小环境影，主按钮有原位 180° 蓝色渐变 | 顶缘高光和接触影，主按钮为实色 |
| `premium-elevation-hairline` | 仅边缘 | 仅边缘 | 顶缘高光与字段内影，错误使用危险边，键盘焦点使用独立轮廓 | 顶缘高光与轻接触影 |
| `surface-glass` 与 `material-blur` | 浮层不透明 | 浮层不透明 | 锚定 Select 采用 94% raised 表面与 12px 模糊。高风险 Dialog 使用不透明 raised 表面 | 浮层不透明 |
| `motion-duration-fast/normal` | 100/160ms 共用，React Aria 负责焦点，CSS 负责视觉反馈 | 同左 | 同左，材质无持续动画 | 同左，Tabs 选中底板滑动，减少动态效果时移除位移 |

新增根角色只包含尺寸和预览合成参数。品牌蓝、文字、状态、主题亮暗、控制高度和材质等级均使用已有语义角色。密度可独立切换，移动与平板由现有容器查询重排。CSS 校验覆盖此目录，检查所有角色定义和组件颜色字面量。
