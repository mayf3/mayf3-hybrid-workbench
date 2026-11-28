# Mayf3 Art Direction V2

[PR #1 审计](AUDIT.md) · [V2 本地可交互对照](http://127.0.0.1:49196/?path=/story/art-direction-v2--comparison)

在此工作树执行 `pnpm install --frozen-lockfile` 和 `pnpm dev`，然后在 Storybook 选择 **Art Direction / V2 / Comparison**。上方可以切换四个独立产品、1440 / 768 / 390 预览及深色。Storybook 的方向工具栏提供 RTL。点击「旧 Hybrid」可打开 PR #1 中的 Hybrid。

## 首屏与信息重心

| 方向 | 1440×900 首屏实际观察 | 390px 独立构图 |
| --- | --- | --- |
| Command Center | 深色工作区指令栏先出现。当前运行是一行紧凑状态，任务表和实时活动检查器形成主双栏。选中任务、执行、审批与失败工具均可继续操作。 | 状态条简化为可读行，先看任务和行内动作，再进入检查器和复核。 |
| Intelligence | 大数字与真实观测图统领页面。数据区只在指标与图表之间画细线，风险摘要和台账在分析之后。 | KPI 与趋势纵向衔接，七日柱图仍保留同一百分比比例尺与日期交互。 |
| Spatial Workspace | 执行窗与错位审批窗分别拥有自己的标题栏和深度。工具托盘位于主要工作面之外。 | 单列工作窗先看当前任务，接共用任务栏、审批与工具。窗口菜单仍可键盘导航。 |
| Mayf3 Hybrid V2 | 从任务索引进入当前简报，右边保留需要人工决定的事项。报告式指标退到标题旁，交付与验收是下一层证据。 | 索引改为垂直可点行，紧接简报、人工决定和证据，一次完成一段判断。 |

Hybrid 吸收 Command Center 清晰的选中任务和操作路径、Intelligence 的可核对分母与验收边界、Spatial 的独立操作表面。实际工作流采用任务索引、动态执行简报和人工决定。它有独立的 JSX 与导航。

## 视觉证据

- [三案首屏并排，原尺寸](evidence/first-fold-comparison.png)
- [三案 25% 缩略图，裁去共用的对照工具栏](evidence/quarter-size-comparison.png)
- [导航与页面骨架，取自真实布局边界](evidence/navigation-skeletons.png)
- [旧 Hybrid 与新 Hybrid 并排](evidence/hybrid-before-after.png)

| 方向 | 完整桌面页面 | 完整移动页面 | 实际浏览器首屏 |
| --- | --- | --- | --- |
| Command Center | [1440px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-vercel-desktop-darwin.png) | [390px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-vercel-mobile-darwin.png) | [1440×900](evidence/vercel-desktop.png) · [390×844](evidence/vercel-mobile.png) |
| Intelligence | [1440px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-stripe-desktop-darwin.png) | [390px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-stripe-mobile-darwin.png) | [1440×900](evidence/stripe-desktop.png) · [390×844](evidence/stripe-mobile.png) |
| Spatial Workspace | [1440px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-apple-desktop-darwin.png) | [390px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-apple-mobile-darwin.png) | [1440×900](evidence/apple-desktop.png) · [390×844](evidence/apple-mobile.png) |
| Mayf3 Hybrid V2 | [1440px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-hybrid-desktop-darwin.png) | [390px](../../workbench/e2e/art-direction-v2.spec.ts-snapshots/art-v2-hybrid-mobile-darwin.png) | [1440×900](evidence/hybrid-desktop.png) · [390×844](evidence/hybrid-mobile.png) |

前后对比的左侧从 PR #1 提交 `dac6c70` 单独构建的 [旧 Hybrid](evidence/hybrid-before.png) 截取。骨架取自浏览器中导航及主要区域的实际像素边界。

## 自审与修正

1. **Command Center 的台账下方。** 初稿右侧检查器把左边任务表下面撑成一块空白，像静态分栏模板。桌面版把真实审批动作接在台账下，任务行和检查器的审核入口直接定位对应决定。手机仍沿任务、检查器、审批的顺序。
2. **Intelligence 的首屏分析区。** 初稿用一个大圆角框把指标和图表装在一起，像通用 KPI 栅格。移除外框圆角和色块背景，改为编辑式横向规则、独立纵分栏与局部日期高亮。手机分隔线随内容改为上下区段。
3. **Spatial 的任务选择。** 初稿用三张同样的圆角卡作为任务开关。合成一条共用任务栏，以分隔线及选中边标识任务。390px 使用同一列表语义和紧凑纵排，每项均可单独聚焦。

## 数据与交互

一次 `useAgentWorkspace(true)` 提供任务、审批、工具和事件。方向切换共享业务变化和选中的任务。四个页面拥有各自的 DOM。输入、图表日期和窗口开合是对应产品的局部界面状态。

[七天模拟日志](../../workbench/stories/art-direction-v2/workspace.ts)逐日记录恢复尝试、成功恢复、计划及实交。周累计恢复 **163/173 → 94.2%**，交付 **18/21 → 85.7%**。图表逐日以真实分母计算两条百分比系列，选择日期可查回原始数量。观察的是同一周期的两个指标，无法推断因果。任务 C 的 **82%** 仍表示执行进度，验收通过率显示未统计。

## 验证

- `pnpm verify` 通过构建、Token 和导出检查、类型检查、lint、43 个 Vitest 用例。Storybook 静态构建完成。
- macOS Chromium 的 Playwright 回归覆盖 138 个既有用例和 19 个 V2 用例。V2 的矩阵覆盖 1440 和 390 浅色、768 和 390 深色 RTL，并启用 reduced motion。16 个页面组合均无 axe 违规、横向溢出和图片请求。交互用例覆盖模拟数据分母与日期导航、跨方向任务状态、窗口菜单焦点和命令面板快捷键。
- 四套 1440×900 深色页面也在常规动效下通过 axe 和横向溢出检查。浏览器交互复核覆盖四套审批浮层和同一 Agent 两条在执行任务的交接证据。
- V2 沿用 React Aria 控件、项目已有的审批和工具组件，以及现有颜色、间距、材质和焦点角色。新增三个预览画布宽度 Token，分别对应 `1440px`、`768px` 和 `390px`。旧 Premium、Hybrid、Reference Study 的 CSS 分块与视觉基线均沿用原版本。正式主题和共享 Agent 状态模型保持原样。
