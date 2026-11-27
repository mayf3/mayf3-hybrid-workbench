# Mayf3 Hybrid 高级视觉重构

## 打开对照

在仓库运行 `pnpm install --frozen-lockfile` 和 `pnpm dev`，打开 [Visual Directions / Reference Study / Comparison](http://127.0.0.1:6006/?path=/story/visual-directions-reference-study--comparison)。上方可以切换四个方向、1440 / 768 / 390 预览和浅深色。Storybook 工具栏提供文本方向与密度。四个方向复用同一实例。切换时保留搜索、草稿、任务状态和审批记录。对照默认打开 Hybrid，原 Hybrid Refinement 仍是 Storybook 首页。

## 实际截图观察

2026-11-28 解压用户提供的交接 ZIP，阅读 README、HTML 图册、JSON 清单和两份研究文档。Chromium 打开的图册实际显示 V01、V02、A01，另将原图在完整宽度下逐张检查。桌面页面只使用本地 Mayf3 图标与 CSS。

| 参考 | 实际观察 | 本次决定 |
| --- | --- | --- |
| V01 / V02 与 Vercel 官方新版 | 旧捕获中项目身份与操作列先于内容，分隔线贯穿活动记录。新版侧栏用小圆角中性选中面，内容列起点清楚。 | 保留 Mayf3 顶栏和工作区栏目，桌面面包屑与主栏同起点。选中态只在导航一行出现，任务和活动用细线组织。[V01](https://learn.nextwork.org/projects/static/ai-finops-vercel/unframed/v0-updates/screenshot-24.webp) · [V02](https://lws.academy/_next/image?q=75&url=%2Fimages%2Fblog%2Fvercel-dashboard.webp&w=3840) · [官方截图](https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/2Y43YuHnMCvnuYMC3VCvWX/9a16131f4a4a06532246b10258b43cff/Dash_-_Light__2_.png) · [新版导航说明](https://vercel.com/changelog/dashboard-navigation-redesign-rollout) |
| Stripe 官方 Radar | 各指标的名称、单位和数字分层，数字和比例轨道对齐，横向细刻度给图表参照。下方操作数据和复核共用版面。 | 将指标作为同一条量化区域。用带明确分母的真实比例表示恢复和交付，避免从单个观察点捏造趋势。风险标签、任务状态和操作保持独立。[官方截图](https://images.stripeassets.com/fzn2n1nzq965/62HR92TuysQaMb2HCRnA7c/6b7d6144ecc1bd61089a1fba005fb767/Radar_overview.png?w=1616&q=80&fm=jpg) · [官方说明](https://stripe.com/blog/new-radar-features) · [图表指南](https://support.stripe.com/questions/dashboard-home-page-charts-for-business-insights) |
| Apple A01 控制中心 | 背景色隔着浮层可见，边缘和接触处仍可辨。控制区按任务组合，边缘反光仅在功能面上出现。 | 透明度仅给覆盖内容的负责人 Select 浮层，执行和审批是实体表面。高风险确认需要一块稳定、清楚的表面。[A01](https://help.apple.com/assets/68FBBA193607B5D7D10E93FA/68FBBA1F5B40BB61910BDFBB/it_IT/0827674815d921eaad3d47402073f3da.png) · [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |

ZIP 内 S01、S02、A02、A03 在本轮浏览器解码失败，直接请求也超时。Stripe 由上表的官方 Radar 图补足，Apple 由 A01 和官方 Materials 指南覆盖。第三方图片只在本地研究使用，仓库附图是 Mayf3 页面。

## 源码与许可证审计

- [结构与控件](STRUCTURE_CONTROLS.md) 记录 Vercel Geist 官网实际 DOM/CSS、Geist Font、Coss UI 和 Untitled UI React。
- [数据与动效](DATA_MOTION.md) 记录 Intent UI、Motion Primitives、NumberFlow、Sonner 的实际仓库版本、精确源码和许可证。在其商业与开源边界中仅研究可公开的部分。
- 指定的 `vercel/geist-design` GitHub API 返回 404，匿名 Git 也返回 Repository not found。实际查阅了官网的 Geist DOM、CSS 构建与公开的 Geist Font 源码。Geist Font 的 OFL 只适用于字体。Apple 和 Stripe 使用公开截图和指南作为依据，未读取产品内部源码。
- 所有主题规则均为自有实现。未分发外部源码、组件包、图片、字体、商用图标或许可证素材。工作区依赖和锁文件没有差异。

## 可复核映射

| 参考 → 决策 | Token → React / CSS | Story → 证据 |
| --- | --- | --- |
| Vercel 标题、导航与细线 → 统一起点、较少闭合边界 | `reference-workspace-rail` / `reference-section-rule` → `.premium-header`、侧栏、审批队列、时间线 | Vercel → 桌面 / 移动全页 |
| Stripe 的指标与比例 → 标签、分母、数值和容器节奏 | `premium-type-numeric` / `reference-metric-span` → 指标 `meter`、任务进度、交付摘要 | Stripe → 桌面 / 移动全页及语义断言 |
| Coss / Untitled 的按钮边缘和残留触感 → 悬停换底、按下降深度、键盘焦点独立 | `control-primary-*-paint` / `control-shadow-pressed` / `control-focus-outline` → `.mf-btn` | Hybrid 控件区 → 真实悬停、按下、聚焦、禁用 |
| Untitled / Intent 输入与选择 → 独立边缘、错误和焦点通道 | `premium-field-edge` / `color-status-danger` → `.mf-input`、`.mf-select__trigger` | 四方案 → 键盘下拉与焦点归还 |
| Apple / Coss 层级 → 只有锚定浮层透出上下文、审批 Dialog 维持不透明 | `surface-glass` / `material-blur` / `elevation-3` → `.mf-select__popover`、`.mf-dialog__surface` | Apple → 实际浮层截图、对比与强制颜色回退；四案 → Portal axe |
| Motion Primitives / Intent → 选中底板连续移动、避免操作反馈堆叠 | `premium-tab-duration` / `motion-duration-normal` / `motion-ease-standard` → Tabs、Switch、工具展开 | 四案 → RTL、Reduced Motion、选中状态 |
| NumberFlow / Sonner → 数字读取稳定，成功与失败留在业务记录 | `premium-numeric-variant` → `bdi` 数值；状态边缘与标签保留语义前景 | 四案 → 24、94.2%、18/21、100%、68% 与 82% 断言 |

[Token 对照](TOKENS.md) · [React 工作台](../../workbench/stories/reference-study/ReferenceStudy.stories.tsx) · [Playwright 用例](../../workbench/e2e/reference-study.spec.ts) · [桌面、移动和深色截图基线](../../workbench/e2e/reference-study.spec.ts-snapshots/)

## 业务一致性

Agent C 的 82% 表示执行进度。验收通过率未统计，交付为 18 / 21（85.7%）。任务可跳转到失败事件与工具调用。审批仍显示申请人、责任人、影响范围、后果和两个动作。审批确认、重试、状态和草稿由同一模型维护。

## 四种构图

初轮四个方向共享了导航位置、指标行和执行／审批网格，主要差异集中在字号与表面。此轮让各方向决定各业务区的实际位置。切换方案时，React 按业务区的稳定键移动同一节点，任务筛选、草稿和打开的工具详情会保留。窄屏沿对应方向的 DOM 顺序阅读。

| 方向 | 首屏组织 | 1440px 首屏 |
| --- | --- | --- |
| Vercel-inspired | 上方横向导航和紧凑运行条。任务表与活动时间线并排，指标位于业务主体之后。 | [Vercel 首屏](preview/vercel-1440-light.png) |
| Stripe-inspired | 独立侧栏和占主导的指标板。比例轨道基于恢复率和交付分母。任务表和交付数据位于执行记录之前。 | [Stripe 首屏](preview/stripe-1440-light.png) |
| Apple-inspired | 内嵌工作窗和上方导航。运行与审批为优先操作，表面分组和接触影区分层次。 | [Apple 首屏](preview/apple-1440-light.png) |
| Mayf3 Hybrid | 侧栏收拢。当前执行和人工审批并列在前，指标作为执行区之后的辅助读数，任务和活动在后。 | [Hybrid 首屏](preview/hybrid-1440-light.png) |

[布局入口](../../workbench/stories/premium-agent/PremiumWorkspace.tsx) · [布局样式](../../workbench/stories/reference-study/composition.css) · [构图回归](../../workbench/e2e/reference-study.spec.ts)

## 浏览器前后对照

| 视口 | 既有 Hybrid Refinement | 新 Mayf3 Hybrid |
| --- | --- | --- |
| 1440×900 浅色 | [桌面首屏](preview/baseline-1440-light.png) | [桌面首屏](preview/hybrid-1440-light.png) |
| 768×900 深色 | [平板首屏](preview/baseline-768-dark.png) | [平板首屏](preview/hybrid-768-dark.png) |
| 390×844 浅色 | [移动首屏](preview/baseline-390-light.png) | [移动首屏](preview/hybrid-390-light.png) |

在同一 1440×900 Chromium 视口，Hybrid 的执行区起点从 y=333px 提到 y=242px，审批从 y=312px 提到 y=225px，任务区从 y=706px 提到 y=586px。

工具栏「原版」会按当前浅深色、密度与文字方向打开原 Hybrid Refinement。尺寸、运行区与审批的位置可直接用上面的截图比较。Apple 的[真实 Select 玻璃浮层](preview/apple-popover.png)记录在控件示例中，系统要求减少透明度或强制颜色时回退到实体表面。

Hybrid 基础控件的真实浏览器状态截取了[悬停](preview/controls-hover.png)、[按下](preview/controls-pressed.png)、[键盘聚焦且字段有错](preview/controls-focus.png)和[禁用](preview/controls-disabled.png)。

## 首轮构图的本地性能

以下采样对应初轮对照提交 `2fa0c3b`。macOS 上用 Chromium 159.0.8154.6，以 1440×900 浅色、减少动态效果打开同一个静态 Storybook 构建。五轮交替顺序测试，每次使用新 Chromium 上下文。工作台就绪帧为找到标题、等待字体就绪和随后两帧的时间。数据用于对照本地实验，不能代替真实用户或低功耗设备测量。

| 方向 | FCP 中位数 | 工作台就绪帧中位数 | 资源数中位数 | ≥50ms 长任务中位数 |
| --- | ---: | ---: | ---: | ---: |
| 既有 Hybrid | 392 ms | 413 ms | 36 | 2 |
| Vercel | 388 ms | 409 ms | 37 | 2 |
| Stripe | 376 ms | 397 ms | 37 | 2 |
| Apple | 380 ms | 408 ms | 37 | 2 |
| Mayf3 Hybrid | 404 ms | 425 ms | 37 | 2 |

25 次冷上下文打开的外部请求、失败请求、图片、视频和 Canvas 均为 0。所有方案共用业务加载路径。初轮额外的 Story 样式资源 gzip 后约 2.0 KiB。重排版继续通过 Playwright 的外部图片和媒体检查。Apple 的背景过滤只在下拉展开时启用。

## 验收结果

| 检查 | 命令与结果 |
| --- | --- |
| 安装 | `pnpm --config.manage-package-manager-versions=false install --offline --frozen-lockfile` 退出 0，使用 Node 26.7.0、pnpm 10.28.1 和现有锁文件 |
| Foundation 与 Vitest | `pnpm verify` 退出 0，43 项单测通过。含导出、Token、类型与 lint |
| Storybook | `pnpm build:workbench` 退出 0。保留 Vite 对既有大分块的提示 |
| 新截图基线 | `WORKBENCH_TEST_PORT=49190 pnpm test:browser e2e/reference-study.spec.ts --update-snapshots` 退出 0，31 项通过。保存 12 张 macOS Chromium 全页基线，新增四种首屏构图的几何断言 |
| 完整 Playwright | `WORKBENCH_TEST_PORT=49190 pnpm test:browser --workers=3` 退出 0，138 项通过。独立执行常规基线比对 |
| axe-core | 四个方向在 1440/768/390、浅深色矩阵，及深色 RTL 的 Select 与 Dialog 上通过。另测实开启 Apple 玻璃与强制颜色回退 |
| 状态与主题隔离 | 实测 Hover、Pressed、Focus、Disabled、错误、键盘焦点归还及减少动效。Storybook 侧栏从新方向返回旧 Hybrid，预览属性正确清理 |

首轮回归发现 Sky Precision 的深色别名与 Premium 同优先级。拆开六个共享表面角色的选择器，使其优先级与所有权一致。最终使用原有截图基线通过 Seaside、Sky Blue、Sky Precision、Premium 和 Hybrid 回归。Storybook 的 axe 面板保留手动审计入口，避免与 Playwright 的 axe 并发。浏览器检查使用 macOS Chromium 和模拟视口。
