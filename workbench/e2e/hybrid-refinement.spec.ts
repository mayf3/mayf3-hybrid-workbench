import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";

const story = "premium-ui--hybrid-refinement";
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

async function open(page: Page, revision: "refined" | "original" = "refined", globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(story, globals)}&args=revision:${revision}`);
  await expect(page.getByRole("heading", { name: "Agent 工作台" })).toBeVisible();
  if (revision === "refined") {
    await expect(page.locator("body")).toHaveAttribute("data-mf-art-direction", "refined");
  } else {
    await expect(page.locator("body")).not.toHaveAttribute("data-mf-art-direction");
  }
}

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map(item => ({ rule: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
}

function regressionTask(page: Page) {
  return page.locator("#agent-task-c:visible");
}

async function approveBaseline(page: Page) {
  const approval = page.getByRole("article", { name: "更新视觉回归基线" });
  await approval.getByRole("button", { name: "批准", exact: true }).press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "取消", exact: true })).toBeFocused();
  await dialog.getByRole("button", { name: "确认批准" }).click();
  await expect(dialog).toBeHidden();
}

async function retrySnapshotIndex(page: Page) {
  const tool = page.locator("details").filter({ hasText: "快照索引校验" });
  if (await tool.getAttribute("open") === null) await tool.locator("summary").click();
  await tool.getByRole("button", { name: "重试校验" }).click();
}

for (const [size, viewport] of Object.entries(viewports)) {
  for (const scheme of ["light", "dark"] as const) {
    test(`Hybrid refined ${size} ${scheme}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, "refined", { theme: scheme });
      const delivery = page.locator("#delivery");
      await expect(delivery).toContainText("本周交付完成率");
      await expect(delivery).toContainText("18 / 21（85.7%）");
      await expect(delivery).toContainText("验收通过率");
      await expect(delivery).toContainText("未统计");
      await expect(regressionTask(page).getByRole("progressbar", { name: "Playwright 回归测试执行进度" })).toHaveAttribute("value", "82");
      await expect(regressionTask(page)).toContainText("待人工确认");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await audit(page);
      await expect(page).toHaveScreenshot(`hybrid-refined-${size}-${scheme}.png`, { fullPage: true });
    });
  }
}

test("same workspace has fewer perimeter borders and earlier first-fold actions", async ({ page }) => {
  await page.setViewportSize(viewports.desktop);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "original");
  const geometry = () => page.evaluate(() => {
    const outlined = [...document.querySelectorAll(".premium-metrics, .premium-focal, .agent-approval, .premium-reviews, .agent-prompt-form, .premium-controls__sample")]
      .filter(element => {
        const styles = getComputedStyle(element);
        return [styles.borderTopWidth, styles.borderRightWidth, styles.borderBottomWidth, styles.borderLeftWidth].every(width => Number.parseFloat(width) > 0);
      }).length;
    function top(selector: string) {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().top + window.scrollY : Number.NaN;
    }
    return { outlined, executionTop: top("#execution"), approvalTop: top("#approvals"), tasksTop: top("#tasks") };
  });
  const original = await geometry();
  const prompt = page.getByRole("textbox", { name: "任务意图" });
  await prompt.fill("保留精修切换前的草稿");
  await page.getByRole("radio", { name: "本轮精修" }).check();
  await expect(page.locator("body")).toHaveAttribute("data-mf-art-direction", "refined");
  const refined = await geometry();
  expect(refined.outlined).toBeLessThan(original.outlined);
  expect(refined.executionTop).toBeLessThan(original.executionTop);
  expect(refined.approvalTop).toBeLessThan(original.approvalTop);
  expect(refined.tasksTop).toBeLessThan(original.tasksTop);
  await expect(page.getByRole("heading", { name: "Agent 工作台" })).toHaveCSS("font-weight", "620");
  await expect(prompt).toHaveValue("保留精修切换前的草稿");
});

test("Agent C links the failed event and call even after tasks were filtered", async ({ page }) => {
  await page.setViewportSize(viewports.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "refined", { theme: "dark", dir: "rtl" });
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  await regressionTask(page).getByRole("link", { name: "查看失败记录" }).press("Enter");
  await expect(page).toHaveURL(/#agent-event-failure$/);
  const failedEvent = page.locator("#agent-event-failure");
  await expect(failedEvent).toContainText("移动端快照索引校验失败");
  await expect(failedEvent).toContainText("Agent C");
  await page.getByRole("tab", { name: "进行中" }).click();
  await expect(regressionTask(page)).toHaveCount(0);
  await failedEvent.getByRole("link", { name: "查看任务" }).press("Enter");
  await expect(regressionTask(page)).toBeFocused();
  await expect(page.getByRole("tab", { name: "全部" })).toHaveAttribute("aria-selected", "true");
  await failedEvent.getByRole("link", { name: "查看工具调用" }).press("Enter");
  await expect(page).toHaveURL(/#agent-tool-snapshots$/);
  await expect(page.locator("#agent-tool-snapshots").locator("xpath=..")).toHaveAttribute("open", "");
  await expect(page.getByText("索引与截图清单不一致。尚未应用截图基线。")).toBeVisible();
  await audit(page);

  const select = page.locator("#controls").getByRole("button", { name: /负责人/ });
  await select.press("ArrowDown");
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  expect(await listbox.evaluate(element => element.closest("[data-mf-art-direction]") === document.body && !element.closest("#storybook-root"))).toBe(true);
  await expect(page.locator(".mf-select__popover")).toHaveCSS("box-shadow", /inset/);
  await page.keyboard.press("Escape");
  await expect(select).toBeFocused();
});

test("approval and retry preserve distinct states and the 82% execution measure", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  await approveBaseline(page);
  await expect(regressionTask(page)).toHaveAttribute("data-state", "blocked");
  await expect(regressionTask(page)).toContainText("82%");
  await retrySnapshotIndex(page);
  await expect(regressionTask(page)).toHaveAttribute("data-state", "running");
  await expect(regressionTask(page)).toContainText("82%");
  await expect(page.locator("#agent-event-failure")).toContainText("失败");
  await expect(page.locator("#delivery")).toContainText("未统计");

  await open(page);
  await retrySnapshotIndex(page);
  await expect(regressionTask(page)).toContainText("待人工确认");
  await approveBaseline(page);
  await expect(regressionTask(page)).toHaveAttribute("data-state", "running");
  await expect(regressionTask(page)).toContainText("82%");

  await open(page);
  await page.getByRole("article", { name: "更新视觉回归基线" }).getByRole("button", { name: "拒绝" }).click();
  await retrySnapshotIndex(page);
  await expect(regressionTask(page)).toHaveAttribute("data-state", "paused");
  await expect(regressionTask(page)).toContainText("审批已拒绝");
});
