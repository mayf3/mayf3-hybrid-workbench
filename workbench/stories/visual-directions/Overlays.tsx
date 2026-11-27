import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Dialog, StatusBadge } from "@mayf3/ui-react";
import {
  DialogTrigger, Menu, MenuItem, MenuTrigger,
  Popover, Tooltip, TooltipTrigger, VisuallyHidden,
} from "react-aria-components";
import { Icon } from "./Icon";
import "./controls.css";

type Notice = { title: string; details: string };
const menuActions = {
  copy: { title: "已复制任务摘要", details: "语义 Token 整理 · Agent A · 已完成" },
  mark: { title: "已标为待确认", details: "交互演示的测试状态已更新。" },
} satisfies Record<string, Notice>;

export function Overlays() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>();
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const origin = useRef<HTMLButtonElement | null>(null);
  const toastTrigger = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const dialogTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible || hovered || focused) return;
    const timeout = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [visible, hovered, focused, notice]);

  function notify(message: Notice, trigger: HTMLButtonElement | null) {
    origin.current = trigger;
    setNotice({ ...message });
    setVisible(true);
  }

  function closeToast() {
    setVisible(false);
    setHovered(false);
    setFocused(false);
    origin.current?.focus();
  }

  return (
    <section id="interactions" className="sky-preview-section sky-overlays" aria-labelledby="sky-overlays-title">
      <h2 id="sky-overlays-title">交互演示</h2>
      <div className="sky-control-panel sky-overlay-panel">
        <div className="sky-overlay-summary">
          <Icon name="layers" className="sky-overlay-emblem" />
          <div>
            <h3>浮层和通知</h3>
            <p>测试确认、焦点和操作反馈。</p>
          </div>
          <StatusBadge intent={needsReview ? "warning" : "info"}>
            {needsReview ? "待确认" : "可测试"}
          </StatusBadge>
        </div>

        <div className="sky-overlay-actions">
          <Button ref={dialogTrigger} intent="secondary" onPress={() => setDialogOpen(true)}>打开对话框</Button>
          <Dialog isOpen={dialogOpen} onOpenChange={setDialogOpen} title="确认测试运行"
            description="执行一次示例检查。" size="sm"
            footer={
              <>
                <Button intent="quiet" onPress={() => setDialogOpen(false)}>取消</Button>
                <Button onPress={() => {
                  setDialogOpen(false);
                  notify({ title: "测试运行已排队", details: "Agent A 将执行示例检查。" }, dialogTrigger.current);
                }}>确认运行</Button>
              </>
            }
          >
            <StatusBadge intent="info">Agent A</StatusBadge>
          </Dialog>

          <DialogTrigger isOpen={popoverOpen} onOpenChange={setPopoverOpen}>
            <Button intent="secondary">打开浮层</Button>
            <Popover className="sky-floating-panel" placement="bottom start" aria-labelledby="sky-popover-title">
              <div className="sky-floating-dialog">
                <h3 id="sky-popover-title">工作区概况</h3>
                <p>本周已交付 18 / 21 项。</p>
                <Button intent="quiet" size="sm" onPress={() => setPopoverOpen(false)}>关闭浮层</Button>
              </div>
            </Popover>
          </DialogTrigger>

          <TooltipTrigger delay={250} closeDelay={80}>
            <Button intent="secondary">状态说明</Button>
            <Tooltip className="sky-overlay-tooltip">待确认表示需要人工复核。</Tooltip>
          </TooltipTrigger>

          <MenuTrigger>
            <Button ref={menuTrigger} intent="secondary" className="sky-overlay-menu-trigger">
              更多操作 <Icon name="expand" className="sky-control-icon" />
            </Button>
            <Popover className="sky-floating-panel sky-floating-panel--menu" placement="bottom start">
              <Menu
                className="sky-overlay-menu"
                onAction={key => {
                  if (key === "copy") {
                    const summary = menuActions.copy.details;
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(summary).then(
                        () => notify(menuActions.copy, menuTrigger.current),
                        () => notify({ title: "任务摘要", details: summary }, menuTrigger.current),
                      );
                    } else {
                      notify({ title: "任务摘要", details: summary }, menuTrigger.current);
                    }
                  }
                  if (key === "mark") {
                    setNeedsReview(true);
                    notify(menuActions.mark, menuTrigger.current);
                  }
                }}
              >
                <MenuItem className="sky-overlay-menu-item" id="copy">复制任务摘要</MenuItem>
                <MenuItem className="sky-overlay-menu-item" id="mark">标为待确认</MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>

          <Button ref={toastTrigger} intent="secondary" onPress={() =>
            notify({ title: "快照已保存", details: "当前工作区状态已记录。" }, toastTrigger.current)
          }>发送通知</Button>
        </div>

        <VisuallyHidden>
          <p role="status">{visible && notice ? `${notice.title}。${notice.details}` : ""}</p>
        </VisuallyHidden>
        {notice && createPortal(
          <div
            className="sky-notice"
            role="region"
            aria-label="工作区通知"
            data-visible={visible || undefined}
            aria-hidden={!visible}
            inert={!visible}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}
          >
            <span className="sky-notice__emblem"><Icon name="check" /></span>
            <div className="sky-notice__content">
              <strong>{notice.title}</strong>
              <p>{notice.details}</p>
            </div>
            <Button intent="quiet" size="sm" className="sky-icon-button" aria-label="关闭通知" onPress={closeToast}>
              <span aria-hidden="true">×</span>
            </Button>
          </div>,
          document.body,
        )}
      </div>
    </section>
  );
}
