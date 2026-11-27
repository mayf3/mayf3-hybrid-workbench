# 数据、选择状态与动效源码研究

2026-11-28 读取四个项目的默认分支源码。以下上游数值是被观测值，Mayf3 拟采用的参数另有说明。四个项目只作为设计与实现参考，本报告不包含其代码、图标、字体或 Registry 载荷。

| 项目 | 被检视的默认分支与提交 | 源码许可 |
| --- | --- | --- |
| Intent UI | `4.x` · `2d272426eafe8fd9d3be8d39334ca824db09f4b2` | MIT · Irsyad A. Panjaitan [LICENSE](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/LICENSE) |
| Motion Primitives | `main` · `120f64f6ca60348e251f929e9c81f11ccbe45eda` | MIT · ibelick [LICENCE.md](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/LICENCE.md) |
| NumberFlow | `main` · `c5906cf35c86583e756a6b91e043291c10b416e0` | MIT · Maxwell Barvian [LICENSE.md](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/LICENSE.md) |
| Sonner | `main` · `8e4662b39255120b62138312058f5d77c0139a5e` | MIT · Emil Kowalski [LICENSE.md](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/LICENSE.md) |

## Intent UI

| 层 | 源码观察 | Hybrid 对应 |
| --- | --- | --- |
| 表格容器 | `Table` 在 React Aria `Table` 外组合横向滚动和列宽容器，列的调整能力是可选的。表头单独加底线，网格、条纹和出血边距由变体控制。 [表格容器](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/table.tsx#L34-L90) [表头](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/table.tsx#L343-L383) | 任务列表继续共用一张原生表格。选中行功能未进入当前业务模型，当前学习点是单元格分隔线、行内留白和状态在行内的相对优先级。 |
| 表格状态 | RAC 行的 `composeRenderProps` 分出自身 focus-visible、内部焦点、已选中、拖拽和禁用。仅可点击、有动作或可多选的行启用 hover 效果。无条纹模式的边线落在单元格上，首末边距使用逻辑方向。行基础选中色由 secondary 派生，焦点示例用 5% primary 表面、primary 轮廓与低强度 ring。 [行状态](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/table.tsx#L399-L434) [单元格](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/table.tsx#L481-L501) | 以现有原生链接、操作按钮和 `:focus-within` 表达可操作区，表格各行不新增点击语义。仅行内控件有焦点时可用低强度语义色辅助定位，仍保留控件可见焦环。 |
| 标签页 | RAC 提供选中状态与 `SelectionIndicator`。标签文本、SVG、hover 底色分写；hydration 后才挂载指示器。横向 2px 下划线过渡 translate/width，垂直 2px 侧线过渡 translate/height，两者均为 200ms 且受 motion-safe 约束。 [标签与指示器](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/tabs.tsx#L111-L153) | 保留 Mayf3 RAC Tabs 和现有 marker。状态高亮靠文字和 marker 配合，焦点使用独立轮廓。可保留 160ms 的位置与尺寸过渡，RTL 与窄屏测同一 marker。 |
| 标签与 Token | `Badge` 的 DOM 为 `span`。意图通过边框、底色、前景和交互叠色角色表达。默认圆形边缘，字号为 `text-xs/5`、图标为 12px、纵向内距 1px。主题文件将 Tailwind 语义名映射到 CSS 变量，亮色主要按钮前景为白，primary 为 `oklch(0.546 0.245 262.881)`，subtle 底用 15% α，深色用独立 subtle 前景。 [Badge 变体](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/components/ui/badge.tsx#L3-L44) [角色映射](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/styles/app.css#L23-L49) [亮色](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/styles/app.css#L111-L149) [深色](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/src/styles/app.css#L188-L206) | 审批区域沿用角色分离。风险 badge 的语义色与后果提示的中性信息背景分别验收。Mayf3 使用现有 `--mf-color-status-*` 与工作区表面角色。 |

项目默认分支名为 `4.x`，该源码清单版本字段仍为 `3.0.0`，实际列出 React Aria Components `^1.22.0`、Tailwind CSS `^4.3.5`。这些是源码快照属性。公开源码和独立的 Premium Design 工作流有各自的来源范围。 [源码清单](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/package.json) [上游工作流](https://github.com/irsyadadl/intentui/blob/2d272426eafe8fd9d3be8d39334ca824db09f4b2/skills/README.md)

## Motion Primitives

- `AnimatedBackground` 克隆子控件，依 `data-id` 与内部 activeId 更新 `data-checked`，点击或可选鼠标 hover 触发。唯一 layoutId 绑定选中背景，片层绝对定位在内容之下，`AnimatePresence` 控制透明度及出入。背景可用作视觉投影，但该组件本身没有提供 radio 或 tab 的角色、键盘规则或 reduced-motion 分支。 [状态与共享层](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/animated-background.tsx#L24-L87)
- Segmented Control 示例采用 2px 托盘内距、8px 托盘圆角，目标项按压比例 0.98，片层移动为 200ms ease-in-out。另一套 Animated Tabs 示例采用 300ms spring、bounce 0.2。TransitionPanel 又用带 key 的活动面板作为存在性边界，示例给 200ms ease-in-out，以及上下 50px 和 4px 模糊。三组值属于不同演示，不能视为统一运动 Token。 [分段控件](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/app/docs/animated-background/segmented-control.tsx#L3-L28) [图标标签](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/app/docs/animated-background/animated-tabs.tsx#L24-L46) [面板边界](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/transition-panel.tsx#L19-L45) [面板示例](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/app/docs/transition-panel/transition-panel-tabs.tsx#L46-L54)
- Hybrid 可沿用 2px 托盘内距的相对比例，以本地 hover、pressed、focus 反馈承接触感。共享背景只跟随语义选中项，用现有 160ms 标准曲线过渡，切换 `prefers-reduced-motion` 时立即到位。面板保持原挂载行为，不需要加入大位移和模糊。上游背景依赖 `motion/react` 且 Registry 指定 `motion`，上述效果可用当前 CSS 和已有控件完成。 [Registry 依赖](https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/public/c/animated-background.json#L1-L11)

## NumberFlow

- React 封装通过 `Intl.NumberFormat` 缓存格式化器，用 `formatToParts` 构建带前后缀、整数、分数和键的分段结构。宿主为 `number-flow-react` 自定义元素，SSR 同时提供声明式 Shadow DOM 和完整文本回退。客户端的 `ElementInternals` 用整体数值作为 label，非当前滚轮数字用 `inert`。这让显示层拆位与读屏整体朗读分开。 [格式化](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/react/src/NumberFlow.tsx#L181-L227) [分段规则](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/formatter.ts#L32-L104) [SSR](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/ssr.ts#L55-L68) [整数数字层](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/lite.ts#L638-L692)
- 自定义元素在更新前测量，在更新后按位置差和数字差启动 WAAPI。默认 transform 为 900ms 的多采样 `linear()` 缓出，滚动默认沿用 transform timing，透明度 450ms ease-out。不可见、页面隐藏、缺少所需浏览器能力或系统要求 reduced motion 时，继续更新数值但跳过动画；不满足条件时也跳过前置布局测量。 [时间默认值](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/lite.ts#L69-L82) [动画守卫与生命周期](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/lite.ts#L176-L263) [动画轨迹](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/lite.ts#L696-L725)
- Hybrid 可用现有 `<bdi>` 与 `tabular-nums` 保持整体阅读与对齐。执行进度、验收通过率与本周交付完成率各有标签和数值。已确认的变化可使用现有 100ms 文本过渡，进度条仍由原生 `<progress>` 公布数值。上游按字符执行 `parseInt`，本地 Node 探针 `ar-EG` 把 24 格式化为 `٢٤`，这两个字符分别经 `parseInt` 得到 `NaN`。Hybrid 保留整串格式化，避免拆位引入此问题。对待审批等状态，默认 900ms 的逐位滚动可能让人误以为业务进度仍在推进。 [按字符解析](https://github.com/barvian/number-flow/blob/c5906cf35c86583e756a6b91e043291c10b416e0/packages/number-flow/src/formatter.ts#L53-L79) [Mayf3 指标](../../workbench/stories/premium-agent/PremiumWorkspace.tsx) [Mayf3 进度](../../workbench/stories/premium-agent/AgentTasks.tsx)

## Sonner

- `Toaster` 在带 `aria-live="polite"` 的 `section` 内按位置输出 `ol`，`li` 附挂 `data-mounted`、`data-removed`、`data-type`、`data-expanded` 等状态。Alt+T 展开并将焦点移到列表，Escape 收起。列表记录进入前的焦点以便恢复，普通 focus 事件本身只记录焦点来源。具有 action/cancel 的 toast 用具名原生按钮。 [Toast DOM](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L264-L300) [操作控件](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L427-L512) [键盘与 live region](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L751-L795) [焦点与交互](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L819-L856)
- 默认可见 3 条、间距 14px、宽 356px、桌面边距 24px / 移动 16px，显示 4000ms。退出先标记 removed，200ms 后卸载。默认 transform/opacity/height 为 400ms，shadow 200ms，普通通知从偏移一个自身高度到原位，系统 reduced motion 时禁用动画和过渡。栈展开、拖动交互和页面隐藏时暂停剩余时间，loading/Infinity 不启用计时。角色色按 light/dark 分别给前景、背景与边界。 [常量](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L21-L43) [通知计时](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/index.tsx#L192-L241) [入场与退出 CSS](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/styles.css#L81-L125) [栈状态](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/styles.css#L292-L342) [角色色](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/styles.css#L467-L524) [Reduced Motion](https://github.com/emilkowalski/sonner/blob/8e4662b39255120b62138312058f5d77c0139a5e/src/styles.css#L708-L715)
- Hybrid 适合继续使用一个低干扰的 polite 确认，新消息展示与计时分开，下一轮若引入自动收起，可低位移动（现有 `--mf-motion-overlay-enter`）加 160ms 透明度过渡。新增可操作通知时应在焦点留在通知时冻结剩余时间。审批结论、失败与恢复的详情留在审批队列及事件日志，Toast 只反馈刚才的操作。 [Mayf3 本地反馈](../../workbench/stories/premium-agent/PremiumWorkspace.tsx) [Mayf3 审批](../../workbench/stories/premium-agent/AgentOperations.tsx) [Mayf3 时间线](../../workbench/stories/premium-agent/AgentRecords.tsx)

## 可验证的设计取舍

| 位置 | 现有实现与复用入口 | 原型观察 |
| --- | --- | --- |
| 任务列表 | [AgentTasks](../../workbench/stories/premium-agent/AgentTasks.tsx) · [Agent 样式](../../workbench/stories/premium-agent/agent.css) | 桌面和移动保留行式排列。含 82% 的任务明确用「执行进度」命名，链接能定位失败与工具重试，同一数字不随审批结论变化。 |
| 指标 | [指标 DOM](../../workbench/stories/premium-agent/PremiumWorkspace.tsx) · [指标样式](../../workbench/stories/premium-agent/premium-workspace.css) | 24、94.2%、18/21 的标签和数值成组。深色、RTL 与窄屏保留全部字符，动态更新由同一短动效及 reduced-motion 规则控制。 |
| Tabs | [RAC 包装层](../../packages/react/src/components/tabs.tsx) · [运动 Tokens](../../src/tokens.json) | 键盘方向键、点击、focus-visible 和 reduced-motion 观察同一个选中目标；等待输入中的内容在切页后仍可返回。 |
| 操作反馈 | [审批操作](../../workbench/stories/premium-agent/AgentOperations.tsx) · [工作区模型](../../workbench/stories/premium-agent/AgentWorkspaceModel.tsx) | 打开确认时焦点进 Dialog，关闭后恢复；批准、拒绝或重试更新同一行和记录。临时反馈隐藏后，业务状态仍可查。 |

本次只读取代码和运行一个数值格式化探针。上游各自的浏览器表现与 CSS 实际渲染并未在本报告中跑测。
