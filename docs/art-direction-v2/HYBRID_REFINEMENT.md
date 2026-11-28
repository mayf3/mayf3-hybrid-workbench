# Mayf3 Hybrid V2 精修

审查基线为 Draft PR #2 的 `aab7f853dc492b1c2ed8710901f73773d32ff970`，截图对应精修实现 `d02fb97a58ab378710dc149dc5fc145e9000f71d`。前后截图均从同一份模拟数据冷启动，选择 Agent B 的「交互组件适配」，执行 68%，交付 18/21，浅色、LTR、舒适密度，`scrollY = 0`。纯产品取景仅隐藏对照工具栏，首屏和局部图均按原始 CSS 像素截取。

## 修复了哪些未生效的样式

独立构建基线后，浏览器加载了 13 条涉及旧主题覆盖与审批的规则，命中为零。V2 的 body 只有 `data-mf-art-v2="hybrid"` 等预览标记，旧版 `data-mf-art-direction="refined"` 为空。临时在浏览器设置旧标记用于定位后，旧规则开始命中，字重、底板和高风险审批的颜色随之改变。对照截图均取自实际提交的状态。

| 迁入 V2 的部分 | Chromium 1440px 实际样式 |
| --- | --- |
| 字体与数字 | 任务标题使用原组件的字体栈，字重 (660 → 620)，由 34px 的二级标题变为 38px 的一级标题。执行数字为 28px、620、`tabular-nums`。 |
| 底板、描边、表面 | 底板由 V2 的冷白语义值绘制。简报由纯白表面改为顶部浅蓝过渡，144px 处回到白色，1px 描边来自新的局部边缘角色。 |
| 接触影与 Portal | 简报实际计算为顶部内高光、3px/6px 接触影和 4px/10px 环境影。高风险对话框挂在工作台 DOM 之外，通过 Hybrid 的 body 标记取得材质。实测标题字重 680 → 620，环境影由 25px/54px 收至 12px/26px。 |
| 审批 | 基线高风险卡的红色内联起始边为 1px，后果底色为 `rgb(255, 240, 242)`。精修版边框为 0、阴影为 `none`，后果底透明，文字回到正文及次级角色，高风险标签继续使用危险色。 |
| 原生进度与比例 | 基线两个原生元素 `appearance: auto`，Chromium 高度均为 14px，灰槽为 `rgb(239, 239, 239)`，交付填充为绿。精修采用同一个作用域 recipe，`appearance: none`、6px 轨道、圆形端点，浅色填充和轨道分别为 `rgb(10, 92, 174)` 和 `rgb(201, 220, 237)`。 |

局部规则复用现有字体、天蓝、边缘、材质和阴影 Token。旧样式按原顺序导入，维持已有 Storybook 的 CSS 分块与级联。仅 Hybrid 审批启用「决定优先」的 DOM 顺序，共享组件的默认顺序与 React Aria 对话框逻辑由原用例覆盖。进度和交付仍是具名的原生 `progress` 与 `meter`。Chromium 和 WebKit 的轨道与填充分别显式设色和圆角，Gecko 从元素绘制轨道、从自身伪元素绘制填充。Chromium 的 meter 内层改为块级，恢复轨道的正常对齐，使填充铺满轨道高度。系统高对比模式使用系统颜色。

## 改变了哪些可见的视觉关系

- 1440px 的任务名升为主标题，「运行交接」缩为简报上方的小标签。阶段、操作、执行进度和证据聚在同一表面。原来等高的深蓝任务索引改成随内容结束的浅色辅助区，当前项以浅天蓝和 2px 的起始边标记。
- 决定标题、风险、后果与行动连在一起，申请人、责任人和审批范围移到操作下方的次级分组。截图中高风险依然可见，键盘批准仍先进入确认并聚焦取消。
- 390px 默认折叠任务切换列表。展开可访问完整列表，选完收合并回焦到入口。带工具栏时「暂停任务」的顶边从 y=865.1 提前到 y=454.4，纯产品从 y=740.1 提前到 y=329.4。当前阶段和暂停操作均在 844px 首屏内。

## 前后截图与计算值

| 证据 | 对照 |
| --- | --- |
| 1440×900 首屏 | [纯产品并排](hybrid-refinement/desktop-product.png) · [带工具栏并排](hybrid-refinement/desktop-workbench.png) · [精修后纯产品原图](hybrid-refinement/desktop-after.png) |
| 390×844 首屏 | [纯产品并排](hybrid-refinement/mobile-product.png) · [带工具栏并排](hybrid-refinement/mobile-workbench.png) · [精修后纯产品原图](hybrid-refinement/mobile-after.png) |
| 原尺寸局部 | [任务执行进度](hybrid-refinement/execution-progress.png) · [交付比例条](hybrid-refinement/delivery-meter.png) · [选中任务](hybrid-refinement/selected-task.png) · [高风险审批](hybrid-refinement/priority-approval.png) |
| 浏览器证据 | [前后 computed styles 与坐标](hybrid-refinement/computed.json) · [三浏览器像素与交互测量](hybrid-refinement/browser-matrix.json) |

在本机 Storybook 的 **Art Direction / V2 / Comparison** 选择 **Mayf3 Hybrid V2**。

## 验收

- `pnpm verify` 和 Storybook 构建通过。Vitest 为 43 项。Playwright 完整回归覆盖 159 项，视觉基线仅更新 Hybrid V2 的桌面和手机两张。
- Chromium 159、Firefox 159 和 Playwright WebKit 27.2 实测 390px 浅色 LTR 与深色 RTL。两种控件的可见填充都占满 6px 厚度，颜色匹配该方案的 Token。Chromium 的首屏证据另覆盖 1440px。
- 键盘实测切换任务时保留任务及暂停状态，列表收合后焦点回到入口。深色 RTL 下，高风险确认 Portal 通过 axe，按 Escape 和点取消均将焦点还给批准按钮。
