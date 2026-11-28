import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";

async function openHybrid(page: Page, globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl("art-direction-v2--comparison", globals)}&args=direction:hybrid`);
  const workspace = page.locator('[data-v2-workspace="hybrid"]');
  await expect(workspace).toBeVisible();
  return workspace;
}

test("Hybrid mobile keeps its task action above the fold and retains state when switching tasks", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const workspace = await openHybrid(page);
  await expect(page.locator("body")).not.toHaveAttribute("data-mf-art-direction", "refined");
  const picker = workspace.locator(".v2h-mobile-picker");
  const summary = picker.locator("summary");
  const taskHeading = workspace.getByRole("heading", { level: 1 });
  const taskButton = (name: string) => picker.getByRole("button", { name: new RegExp(name) });
  const pause = workspace.getByRole("button", { name: "暂停任务", exact: true });

  await expect(summary).toContainText("切换任务");
  await expect(picker).toHaveJSProperty("open", false);
  await expect(taskHeading).toHaveText("交互组件适配");
  await expect(taskHeading).toBeInViewport({ ratio: 1 });
  await expect(pause).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  const progress = workspace.getByRole("progressbar", { name: "交互组件适配执行进度" });
  await expect(progress).toHaveJSProperty("value", 68);
  await expect(progress).toHaveJSProperty("max", 100);
  const delivery = workspace.getByRole("meter", { name: "本周交付完成比例" });
  await expect(delivery).toHaveJSProperty("value", 18);
  await expect(delivery).toHaveJSProperty("max", 21);

  await pause.press("Enter");
  await expect(workspace.getByRole("button", { name: "继续任务", exact: true })).toBeVisible();
  await summary.press("Enter");
  await expect(picker).toHaveJSProperty("open", true);
  await expect(taskButton("语义 Token 整理")).toBeVisible();
  await expect(taskButton("交互组件适配")).toHaveAttribute("aria-pressed", "true");
  await taskButton("Playwright 回归测试").press("Enter");
  await expect(taskHeading).toHaveText("Playwright 回归测试");
  await expect(workspace.getByRole("progressbar", { name: "Playwright 回归测试执行进度" })).toHaveJSProperty("value", 82);
  await expect(picker).toHaveJSProperty("open", false);
  await expect(summary).toBeFocused();

  await summary.press("Enter");
  await expect(taskButton("Playwright 回归测试")).toHaveAttribute("aria-pressed", "true");
  await taskButton("交互组件适配").press("Enter");
  await expect(taskHeading).toHaveText("交互组件适配");
  await expect(progress).toHaveJSProperty("value", 68);
  await expect(workspace.getByRole("button", { name: "继续任务", exact: true })).toBeInViewport({ ratio: 1 });
});

test("Hybrid high-risk approval keeps its visible consequence and restores keyboard focus on cancel", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const workspace = await openHybrid(page, { theme: "dark", dir: "rtl" });
  await workspace.getByRole("navigation", { name: "任务索引" })
    .getByRole("button", { name: /Playwright 回归测试/ }).press("Enter");
  const approval = workspace.getByRole("article", { name: "更新视觉回归基线", exact: true });
  const approve = approval.getByRole("button", { name: "批准", exact: true });
  const consequence = /未经复核的变化可能被视为正常/;

  await expect(approval.getByText("高风险", { exact: true })).toBeVisible();
  await expect(approval.getByText(consequence)).toBeVisible();
  await approve.press("Enter");
  const dialog = page.getByRole("dialog", { name: "批准更新视觉回归基线？", exact: true });
  await expect(dialog.getByRole("button", { name: "取消", exact: true })).toBeFocused();
  await expect(dialog.getByText(consequence)).toBeVisible();
  expect(await dialog.evaluate(element => element.closest("[data-mf-art-v2]") === document.body
    && element.closest("#storybook-root") === null)).toBe(true);
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.map(issue => ({ rule: issue.id, targets: issue.nodes.map(node => node.target) }))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(approve).toBeFocused();
  await expect(approval.getByRole("status")).toHaveText("待审批");

  await approve.press("Enter");
  await dialog.getByRole("button", { name: "确认批准", exact: true }).press("Enter");
  await expect(dialog).toBeHidden();
  await expect(approval.getByRole("status")).toHaveText("已批准");
  await expect(workspace.getByRole("heading", { level: 1 })).toHaveText("Playwright 回归测试");
  await expect(workspace.getByRole("heading", { name: "等待索引重试" })).toBeVisible();
  await expect(workspace.getByRole("progressbar", { name: "Playwright 回归测试执行进度" })).toHaveJSProperty("value", 82);
});
