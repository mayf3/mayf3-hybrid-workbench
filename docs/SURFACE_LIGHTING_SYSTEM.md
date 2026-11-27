# Surface & Lighting System

Sky Precision 是一种预览材质。工作台将 `data-sky-theme="air"` 和 `data-mf-surface="precision"` 放在 Storybook iframe 的 `body`，使页面和 React Aria Portal 取得同一组 Token。基础控件故事的默认画布样式位于 `src/foundation.css`。

Token 的默认声明和光影尺寸统一存放在 [src/tokens.json](../src/tokens.json)。[预览材质](../workbench/stories/sky-precision/materials.css) 提供浅深配色与兼容回退，[React 样式](../packages/react/src/styles.css) 按作用域消费这些角色。表中记法 `surface.canvas` 对应 CSS `--mf-surface-canvas`。

## 表面与边光

| Token | 用途 | Light | Dark |
| --- | --- | --- | --- |
| `surface.canvas` | 页面底板 | `#eef4fa` | `#101b2a` |
| `surface.default` | 纸面、指标区、普通内容 | `#f9fbfe` | `#172638` |
| `surface.raised` | 输入与明确抬升的表面，兼作玻璃回退 | `#ffffff` | `#213349` |
| `surface.sunken` | 静态只读、禁用输入和凹入轨道 | `#e8eff6` | `#142132` |
| `surface.tint` | 特色区底色和逻辑选中态 | `#e1eefb` | `#223d5c` |
| `surface.highlight` | 短暂高光和浅层前景状态面 | `#edf7ff` | `#2b4764` |
| `surface.glass` | 单个锚定 Popover 的轻透面 | 96% Raised | 96% Raised |
| `surface.focal-light` | Hero 上沿的局部漫射光 | 静态径向光，窄屏纯底色 | 静态径向光，窄屏纯底色 |
| `edge.highlight` | 顶部内边光色 | 88% 白光 | 18% 冷白光 |
| `edge.subtle` | 隔断、普通表面与浮层边界 | `#d1dfeb` | `#36516c` |
| `edge.strong` | 输入和操作控件可辨识的轮廓 | `#7c8ea4` | `#70849b` |
| `edge.light-top` | 1 px inset 高光投影层 | 复用 `edge.highlight` | 复用 `edge.highlight` |

`material.opacity` 只混出浮层背景色，文字保持不透明。`material.blur` 为 0 px，`material.noise-opacity` 为 0，两种配色使用相同预算。窄屏与无 `color-mix()` 的浏览器直接采用 `surface.raised`。 `material.reflection` 定义单个 Hero 漫射光；无 Canvas、动画帧循环或持续 GPU 滤镜。

## 接触影与环境影

| Token | 几何值（X / Y / Blur / Spread） | 作用 |
| --- | --- | --- |
| `shadow.contact.sm` | 0 / 1 / 2 / −1 px | 小操作与日常内容贴近底板 |
| `shadow.contact.md` | 0 / 3 / 6 / −3 px | 锚定浮层贴近触发器 |
| `shadow.contact.lg` | 0 / 7 / 12 / −6 px | 模态底部落点 |
| `shadow.ambient.sm` | 0 / 4 / 10 / −4 px | 引入轻微空间感 |
| `shadow.ambient.md` | 0 / 12 / 26 / −10 px | 浮层与底板分离 |
| `shadow.ambient.lg` | 0 / 25 / 54 / −15 px | 模态聚焦 |

投影几何使用对应的 `shadow.profile.{contact,ambient}.{sm,md,lg}`，浅深主题共用这些轮廓。对应的 `shadow.contact.ink` / `shadow.ambient.ink` 分别控制近影/漫射影，Dark 独立调整两种浓度。每个材质先有边界，再由组合投影表达离地高度。

| Token | 组合 | 用途 |
| --- | --- | --- |
| `elevation.0` | none | 背景、数据区、凹入状态 |
| `elevation.1` | 上边光 + contact.sm + ambient.sm | 普通抬升表面 |
| `elevation.2` | 上边光 + contact.md + ambient.md | Popover、Select、Toast |
| `elevation.3` | 上边光 + contact.lg + ambient.lg | Dialog |

## 控件与动效

- **Button**。 `control.primary.{base,top,edge}` 形成正面亮度层。Hover 使用 `control.primary.hover-{base,top}` 和短接触影，Pressed 用 `control.primary.press-base` 与压入影。 `control.shadow.{rest,hover,pressed,recessed}` 独立描述状态。
- **TextField / SelectField**。默认边缘引用 `edge.strong`，内凹感来自 `control.shadow.recessed`。 `control.focus.{outline,offset,glow}` 同时提供可识别轮廓和柔和扩散。失效边缘由危险语义覆盖，包括悬停时。Readonly 可聚焦复制，Disabled 延续 React Aria 的禁用语义。
- **Dialog**。抬升至第 3 级，动作区由细横线连接到内容，入场只做短位移加淡入。
- **Tabs**。选中底色和下边标记同时可读，键盘焦点在可滚动视口内。
- **Switch**。轨道背景、滑块亮度与位置三种提示联动。关闭状态使用钢蓝滑块分明轨道，在浅深主题中分别达到 3.16:1 和 4.43:1 对比度。受控状态及 RTL 镜像沿用原实现。
- **StatusBadge**。文字和状态点继续表达语义， `badge.edge` 只给低对比描边取当前状态色。

| 动效 Token | 值 | 适用 |
| --- | --- | --- |
| `motion.duration.fast` | 100 ms | 控件短反馈 |
| `motion.duration.normal` | 160 ms | 开关与浮层进场 |
| `motion.duration.slow` | 220 ms | 需要可跟随的表面变化上限 |
| `motion.ease.standard` | cubic-bezier(.22, .75, .28, 1) | 颜色、阴影、浮层 |
| `motion.ease.spring` | cubic-bezier(.26, .76, .34, 1) | 模拟较快起步的短位移，曲线无超调 |
| `motion.control.{lift,press}` | −1 / 1 px | 悬浮与按下 |
| `motion.overlay.enter` | 8 px | Dialog 光学入场位移 |

运行时降级沿用纯色、不可见位移或静态选中态。 `prefers-reduced-motion` 停止进场和状态过渡，保留焦点轮廓、文字、明暗与状态位置。

## 约束与证据

组件的视觉定义由 **Anatomy + Semantic Tokens + Behavior + States + Constraints + Evidence** 组成。选择材质属于 Tokens 和 Constraints，React Aria 负责 Behavior。Stable 的依据包括 API 与状态定义、实现与模型对应、键盘和可访问性测试、实际浏览器截图。预览方向的视觉评审独立于组件 API 的成熟度。

这里可机械校验的约束是 `Shadow(0) = none`，对第 1 至 3 级始终有 `Shadow(e) = top-edge ⊕ contact(e) ⊕ ambient(e)`，其中 `⊕` 表示 CSS 图层拼接。控件引用角色，Token 提供颜色。 `pnpm check:tokens` 对源码核对角色、引用、投影分层与未经声明的颜色， `pnpm verify` 运行这一检查。浏览器测试覆盖状态、作用域、Portal 与视口。色彩观感、光影自然度和焦点质量由人工检查浏览器结果。

本工作台的光效预算为一个 L2 Hero。强化反馈用于任务进度和需要介入的状态。L0 为纯色底板，L1 使用边界和轻微接触影，普通控件走短反馈。约束、浏览器结果和限制见 [精修记录](SKY_PRECISION_VISUAL_REFINEMENT.md)。
