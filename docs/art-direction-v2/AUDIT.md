# PR #1 构图审计

审计目标为 PR #1 的提交 `dac6c70`。对照其桌面首屏与源代码，真实的差异集中在各业务区出现的位置。产品任务、复合组件和页面的组成方法仍然接近。

| 判断 | 源码证据 |
| --- | --- |
| 样式变化 | 按方向调整了导航选中颜色、描边、圆角、接触阴影、页框和执行区蓝色渐变。Apple 的效果位于原工作区外框与已有面板，Hybrid 强调了已有执行组件。 |
| 真正的布局变化 | Vercel 导航由侧栏变为横向，任务和活动同排。Stripe 指标与全宽任务在运行和审批之前。Apple 和 Hybrid 的审批纵跨多行，指标与执行位于左列。窄屏变为各自顺序的单列。 |
| 仍共享的构图 | 比较入口始终渲染一次 `PremiumWorkspace`。四个方向把同一组 11 个 `reference-slot` 排序后填进同一个主区域。执行、审批、任务、时间线等组件在所有方向里保留原来的内部组织。 |
| 始终未重新设计的元素 | 产品抬头、工作区导航的条目和锚点交互、标题加「新建任务」的组合、相同任务表和筛选、审批卡的字段结构、工具手风琴、活动条目、底部提示表单及控件样张。Stripe 只有当前值的比例轨道，Vercel 没有独立控制交互，Apple 缺少有用途的窗口之间的关系。 |

[比较入口第 106–108 行](https://github.com/mayf3/mayf3-hybrid-workbench/blob/dac6c707165c8a3a0bd87a92f6e9808051fff63f/workbench/stories/reference-study/ReferenceStudy.stories.tsx#L106-L108) · [共享区域与导航第 99–191 行](https://github.com/mayf3/mayf3-hybrid-workbench/blob/dac6c707165c8a3a0bd87a92f6e9808051fff63f/workbench/stories/premium-agent/PremiumWorkspace.tsx#L99-L191) · [构图 CSS](https://github.com/mayf3/mayf3-hybrid-workbench/blob/dac6c707165c8a3a0bd87a92f6e9808051fff63f/workbench/stories/reference-study/composition.css) · [上一轮实施记录](https://github.com/mayf3/mayf3-hybrid-workbench/blob/dac6c707165c8a3a0bd87a92f6e9808051fff63f/docs/reference-study/IMPLEMENTATION.md)

V2 把共享边界收缩到一次 `useAgentWorkspace(true)`、同一任务选择、附有分子与分母的模拟观察记录、语义 Token 和可访问的基础控件。三个产品实现各自定义 DOM、导航、详情交互及桌面和手机的阅读顺序。其后增加一个独立的 Mayf3 候选，用运行、人工决定和验证记录组织跨方向的取舍。
