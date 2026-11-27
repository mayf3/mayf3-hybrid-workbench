# 工作区结构与控件研究

2026-11-28 读取 Vercel 官方 Geist 示例的渲染 HTML 和配套 CSS，并逐文件核对 Geist Font、Coss UI 和 Untitled UI React 的公开 Git 提交。本文记录可迁移的组件机制和 Mayf3 取舍。

## Vercel Geist

**布局。** Grid 示例的渲染 DOM 用 `--grid-rows`、`--grid-columns` 表达布局，CSS 由列宽和行高变量计算网格。虚线、交叉点和导线隐藏是单独的装饰处理，响应式示例按三个断点更改行列配置。官方用法也为无可见导线的普通内容推荐直接使用 CSS Grid。Mayf3 可保留工作流和审批两个有共同起始边的内容轨，手机上沿 DOM 顺序回到单列。分隔线只用于区分相邻指标、任务行或信息区块，每个区块继续保有标题和独立阅读顺序。[官方 Grid 示例](https://vercel.com/geist/grid) · [示例构建 CSS](https://vercel.com/vc-ap-b3331f/_next/static/immutable/chunks/2gaymabu2y4hf.css)

**表面与控件。** Materials 示例的菜单和模态共享表面底色和圆角规格，通过不同阴影变量区分层级。Button 页面实际渲染的按钮把高度和前景、底色、边缘的互动态分开映射，焦点环拥有独立的间隔色与强调色。示例说明也明确保留加载按钮语义和图标按钮的可访问名称。Mayf3 可用现有表面角色让标题、指标和任务行沿用底板，仅提升需要独立操作的审批、菜单与对话框。按钮、字段与浮层共用焦点及层级 Token，桌面与手机沿用相同的语义关系。[官方 Materials 示例](https://vercel.com/geist/materials) · [官方 Button 示例](https://vercel.com/geist/button) · [含材质与焦点变量的构建 CSS](https://vercel.com/vc-ap-b3331f/_next/static/immutable/chunks/0x3f4asy1it02.css)

**字体与许可。** 官方 `vercel/geist-font` 在 `ef2597cfc42f4797676df105517ccc0a1cfa6569` 将 Sans 与 Mono 各自加载为本地可变字体，分别输出家族变量，Mono 另设等宽 fallback。字体声明采用 SIL OFL 1.1，分发字体须按对应许可随附版权及许可文本。官网浏览器构建提供公开可观察的组件行为，此次未核实其生产 React 组件有可复用的源码许可证。Mayf3 沿用自身中英文系统字体栈与 `--mf-premium-numeric-variant`，在时长、进度和指标使用等宽数字，在任务描述保留阅读字体。[Sans 加载器](https://github.com/vercel/geist-font/blob/ef2597cfc42f4797676df105517ccc0a1cfa6569/packages/next/dist/sans.js#L1-L7) · [Mono 加载器](https://github.com/vercel/geist-font/blob/ef2597cfc42f4797676df105517ccc0a1cfa6569/packages/next/dist/mono.js#L1-L19) · [OFL 条件](https://github.com/vercel/geist-font/blob/ef2597cfc42f4797676df105517ccc0a1cfa6569/OFL.txt#L47-L78)

构建 CSS 内容校验可用于识别本次抽样。Grid 构建 SHA-256 为 `710e63d27c28f34577c0ea5a58ab48cc84697bebec53be3fc1b7a5d3f139c015`，Materials 构建为 `461dbe19f74bf2b22c84be9b7c516b3ed5af30654dc0512294139cfa7a6b5c77`。官网示例是随版本变化的公开页面。

## Coss UI

**按钮与输入。** 在 `106c20b698cad8f7a3f549fd55747a641c8cfd40`，Button 的尺寸矩阵独立于颜色语义，图标按钮和粗指针命中区域单独定义。实心按钮静止时有顶部浅内影和接触影，按下时消除外影并转用内影，键盘焦点则使用独立外环。loading 保留子元素几何并叠加指示器，此版本也将 loading 按钮设为 disabled。Input 的外壳通过子控件的 focus、invalid、disabled 状态决定描边与阴影，纯输入通道保持文本和游标职责。其主题在亮暗两套值里区分 `input`、`border`、`ring` 和 `popover`。[Button 尺寸与状态](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/button.tsx#L10-L45) · [Button 加载](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/button.tsx#L57-L95) · [Input 状态](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/input.tsx#L24-L62) · [亮暗主题角色](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/styles/globals.css#L161-L273)

**数据密度与状态位移。** 默认 Table 的 wrapper 承担横向滚动，表头和行间分隔，行 hover 与选中背景有不同强度。Tabs 从组件传来的 active tab 几何变量更新指示器，宽度和平移过渡在 reduced-motion 下关闭。Dialog 则分开处理遮罩、浮层和进入退出状态，减少动效时浮层保留透明度变化。Mayf3 可复用任务区域的细线、近底板 hover，以及现有 Tabs 的短选中指示过渡；Dialog 与 Select 由主题作用域中的 Portal 保持同套表面值。[Table 结构和行状态](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/table.tsx#L15-L101) · [Tabs 指示器](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/tabs.tsx#L35-L96) · [Dialog 浮层](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/src/components/dialog.tsx#L76-L110)

**许可与取舍。** Coss 公开根许可证为 MIT，保留代码副本或实质部分需附版权和许可文本。上游包使用 Base UI、Tailwind 与 Lucide。Mayf3 采纳静止、悬停、按压、焦点各有层级的处理，使用 React Aria 和已有 `--mf-control-shadow-pressed`、`--mf-control-focus-outline`、`--mf-premium-elevation-raised`、`--mf-motion-duration-normal` 实现原有行为与尺寸体系。[Coss 许可证](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/LICENSE#L1-L13) · [上游依赖](https://github.com/cosscom/ui/blob/106c20b698cad8f7a3f549fd55747a641c8cfd40/packages/ui/package.json#L1-L32) · [Mayf3 Token](../../src/tokens.json)

## Untitled UI React

**控件比例与加载。** 公开版 `bff7606f3ce705f0ba5984f383f11f865024e1f7` 在同一尺寸映射里配对文字、图标、水平留白及图标按钮区域。主、次、弱操作和危险操作分别映射表面、文字、边缘及 hover 角色。加载版本让 spinner 叠在原按钮中心以维持宽度，并把 pending 传给 React Aria Button。Mayf3 已有 React Aria Button 与加载内容保宽机制。主要操作只在任务创建等明确动作集中使用天蓝实心色，次要操作保留描边或透明层，危险决策用动作文字和风险上下文表达。[Button 尺寸及颜色](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/components/base/buttons/button.tsx#L10-L129) · [加载与 Pending](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/components/base/buttons/button.tsx#L197-L260) · [Mayf3 控件样式](../../packages/react/src/styles.css)

**字段层级。** 输入由 React Aria TextField、可见标签、输入组和帮助文本组成。输入组给平时的描边、focus-within、invalid、invalid+focus 各自定义状态。HintText 通过 React Aria 的 slot 在 `description` 和 `errorMessage` 之间切换。Mayf3 复用现有 TextField 的标签与错误语义并独立绘制错误边和焦点轮廓，支持输入组内有图标或辅助操作时保持同一视觉边界。错误文本保留具体描述，disabled 和 readonly 沿用不同表面与行为。[输入组状态](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/components/base/input/input.tsx#L73-L145) · [字段组合](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/components/base/input/input.tsx#L256-L305) · [描述与错误 Slot](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/components/base/input/hint-text.tsx#L19-L37)

**Token 与许可。** Upstream 将底色、文字、边缘和 ring 分别挂接至语义角色，暗色覆盖角色值，控件仍调用同一套语义。Mayf3 继续使用自有亮暗 Token、图标及尺寸。公开仓库的组件源码使用 MIT，README 单独列出 Pro 许可边界。此处研究的是公开仓库中的尺寸、交互通道和语义分工。[表面/文字/边缘映射](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/styles/theme.css#L277-L367) · [暗色角色](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/styles/theme.css#L637-L721) · [MIT](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/LICENSE#L1-L13) · [公开版范围](https://github.com/untitleduico/react/blob/bff7606f3ce705f0ba5984f383f11f865024e1f7/README.md#L35-L42)

## Mayf3 验收

在桌面核对标题、指标、执行与审批各自的对齐和留白，在窄屏核对自然阅读顺序和长文换行。按钮逐个确认按压反馈、加载前后宽度、图标命名和键盘焦点。字段单独检查默认、错误、错误加焦点、禁用和只读，暗色保持文字和边界可读。对话框与下拉需要在 Portal 中读取正确主题，RTL 与 reduced-motion 下继续沿用 React Aria 的键盘交互。
