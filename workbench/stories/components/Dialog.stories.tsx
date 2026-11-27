import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Dialog, TextField, type DialogSize } from "@mayf3/ui-react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "模态对话框。React Aria Modal/ModalOverlay/Dialog 负责焦点圈闭与恢复、Escape、滚动锁、模态语义；Mayf3 负责遮罩层次与出现动效。\n\n" +
          "**API**：`isOpen/onOpenChange`（受控）、`title`（aria-labelledby 目标）、`description`、`children`、`footer`（操作行，调用方提供按钮）、" +
          "`isDismissable`（默认 true：Escape/点遮罩关闭）、`size`（sm|md|lg）。\n\n" +
          "**适用**：确认操作、短表单、需要用户明确决策的打断。\n" +
          "**反例**：不要嵌套对话框；不要把长内容塞进 sm 尺寸（改用 lg 或页面）；footer 不要超过一个 primary 按钮；" +
          "不要用对话框展示纯信息流（用页面或 Toast——规划中）。\n\n" +
          "**A11y**：打开后焦点进入对话框（title 由读屏播报），Tab 循环圈闭在内部，关闭后焦点回到触发器；" +
          "遮罩点击与 Escape 均走 onOpenChange。出现动效遵循 reduced-motion。",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="mf-demo-section">
        <Button onPress={() => setOpen(true)}>删除草稿…</Button>
        <Dialog
          isOpen={open}
          onOpenChange={setOpen}
          title="删除草稿"
          description="删除后无法恢复。此操作不影响已发布版本。"
          footer={
            <>
              <Button intent="quiet" onPress={() => setOpen(false)}>
                取消
              </Button>
              <Button intent="danger" onPress={() => setOpen(false)}>
                确认删除
              </Button>
            </>
          }
        >
          <p>正在删除《海边的统计学》第 3 课草稿。</p>
        </Dialog>
      </div>
    );
  },
  parameters: {
    docs: { description: { story: "点击按钮打开。试试 Tab 圈闭、Escape、点遮罩关闭与焦点恢复。" } },
  },
};

export const FormDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="mf-demo-section">
        <Button intent="secondary" onPress={() => setOpen(true)}>
          新建标签…
        </Button>
        <Dialog
          isOpen={open}
          onOpenChange={setOpen}
          title="新建标签"
          description="标签会出现在课程筛选栏。"
          footer={
            <>
              <Button intent="quiet" onPress={() => setOpen(false)}>
                取消
              </Button>
              <Button onPress={() => setOpen(false)}>创建</Button>
            </>
          }
        >
          <TextField label="标签名称" placeholder="例如：入门友好" description="最多 12 个字" />
        </Dialog>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<DialogSize>("md");
    const [open, setOpen] = useState(false);
    return (
      <div className="mf-demo-section">
        <div className="mf-demo-row">
          {(["sm", "md", "lg"] as DialogSize[]).map(s => (
            <Button
              key={s}
              intent={s === size ? "primary" : "secondary"}
              onPress={() => {
                setSize(s);
                setOpen(true);
              }}
            >
              {s.toUpperCase()}
            </Button>
          ))}
        </div>
        <Dialog
          isOpen={open}
          onOpenChange={setOpen}
          size={size}
          title={`尺寸 ${size.toUpperCase()} 对话框`}
          footer={
            <Button intent="quiet" onPress={() => setOpen(false)}>
              关闭
            </Button>
          }
        >
          <p>sm 适合确认类短文案；md 是默认；lg 适合短表单与列表选择。</p>
        </Dialog>
      </div>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="mf-demo-section">
        <Button intent="secondary" onPress={() => setOpen(true)}>
          打开长内容对话框
        </Button>
        <Dialog
          isOpen={open}
          onOpenChange={setOpen}
          title="这是一个比较长的中文对话框标题用于检验换行与窄屏表现 Internationalization"
          description="描述文本也应当正确换行并保持可读，而不是把对话框撑出屏幕。"
          footer={
            <Button intent="quiet" onPress={() => setOpen(false)}>
              关闭
            </Button>
          }
        >
          <p>
            Pneumonoultramicroscopicsilicovolcanoconiosis 与长中文段落混合排布：对话框标题、描述与正文都要在
            390px 窄屏下正确换行，保持信息清晰且不出现横向滚动。
          </p>
        </Dialog>
      </div>
    );
  },
};

/** Rendered already-open for static visual capture (screenshot/a11y suites). */
export const StaticOpen: Story = {
  render: () => (
    <div className="mf-demo-section">
      <Dialog
        isOpen
        onOpenChange={() => undefined}
        title="确认发布"
        description="发布后课程将出现在地图上。"
        footer={
          <>
            <Button intent="quiet">取消</Button>
            <Button>发布</Button>
          </>
        }
      >
        <p>《海边的统计学》第 3 课已通过全部检查。</p>
      </Dialog>
    </div>
  ),
  parameters: { docs: { description: { story: "静态打开状态，供截图与 a11y 扫描；真实使用请用受控开关。" } } },
};
