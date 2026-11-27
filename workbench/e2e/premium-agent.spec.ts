import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";

const story = "premium-ui--source-inspired-comparison";
const directions = ["untitled", "beautiful", "hybrid"] as const;
type Direction = (typeof directions)[number];
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

async function open(page: Page, direction: Direction = "hybrid", globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(story, globals)}&args=direction:${direction}`);
  await expect(page.getByRole("heading", { name: "Agent 工作台" })).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-mf-premium", direction);
}

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map(item => ({
    rule: item.id,
    targets: item.nodes.map(node => node.target),
    notes: item.nodes.map(node => node.failureSummary),
  }))).toEqual([]);
}

function section(page: Page, id: string) {
  return page.locator(`section#${id}`);
}

function task(page: Page, name: string) {
  return page.getByRole("table", { name: "工作区任务" }).getByRole("row").filter({ hasText: name });
}

async function themedPortal(page: Page, overlay: Locator) {
  await expect(overlay).toBeVisible();
  const body = await page.locator("body").evaluate(element => ({
    theme: element.dataset.mfPremium,
    scheme: getComputedStyle(element).colorScheme,
    surface: getComputedStyle(element).getPropertyValue("--mf-color-surface-raised").trim(),
  }));
  expect(await overlay.evaluate(element => ({
    theme: element.closest<HTMLElement>("[data-mf-premium]")?.dataset.mfPremium,
    scheme: getComputedStyle(element).colorScheme,
    surface: getComputedStyle(element).getPropertyValue("--mf-color-surface-raised").trim(),
    portaled: !element.closest("#storybook-root"),
  }))).toEqual({ ...body, portaled: true });
}

for (const direction of directions) {
  for (const [size, viewport] of Object.entries(viewports)) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${direction} ${size} ${scheme} screenshot and axe`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: "reduce" });
        const images: string[] = [];
        page.on("request", request => {
          if (request.resourceType() === "image") images.push(request.url());
        });
        await open(page, direction, { theme: scheme });
        await expect(page.locator("body")).toHaveCSS("color-scheme", scheme);
        const metrics = page.getByRole("region", { name: "工作区指标" });
        for (const value of ["24", "94.2%", "18/21"]) await expect(metrics.getByText(value, { exact: true })).toBeVisible();
        await expect(task(page, "语义 Token 整理")).toContainText("100%");
        await expect(task(page, "交互组件适配")).toContainText("68%");
        await expect(task(page, "Playwright 回归测试")).toContainText("82%");
        await expect(page.locator("[data-visual-level=l2]")).toHaveCount(1);
        await expect(page.locator("canvas, video")).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
        expect(images).toEqual([]);
        await audit(page);
        await expect(page).toHaveScreenshot(`premium-${direction}-${size}-${scheme}.png`, { fullPage: true });
      });
    }
  }
}

test("comparison retains data while changing direction, width, density and control states", async ({ page }) => {
  await page.setViewportSize(viewports.desktop);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const prompt = page.getByRole("textbox", { name: "任务意图" });
  await prompt.fill("保留未提交的工作区草稿");
  await page.getByRole("radio", { name: "Beautiful-inspired" }).check();
  await expect(page.locator("body")).toHaveAttribute("data-mf-premium", "beautiful");
  await page.getByRole("radio", { name: "平板" }).check();
  await expect(page.getByTestId("premium-viewport")).toHaveCSS("width", "768px");
  await page.getByRole("radio", { name: "移动" }).check();
  await expect(page.getByTestId("premium-viewport")).toHaveCSS("width", "390px");
  const button = section(page, "controls").getByRole("button", { name: "保存设置" });
  const comfortableHeight = await button.evaluate(element => element.getBoundingClientRect().height);
  await page.getByRole("button", { name: "紧凑" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-density", "compact");
  expect(await button.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(comfortableHeight);
  await page.getByRole("button", { name: "深色" }).click();
  await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
  await expect(prompt).toHaveValue("保留未提交的工作区草稿");
  const controls = section(page, "controls");
  for (const state of ["悬停", "聚焦", "按下", "禁用"] as const) {
    await controls.getByRole("radio", { name: state }).check();
    if (state === "聚焦") {
      await expect(button).toHaveCSS("outline-style", "solid");
      await expect(controls).toHaveScreenshot("premium-controls-focus-mobile-dark.png");
    }
    if (state === "禁用") {
      await expect(button).toBeDisabled();
      await expect(controls).toHaveScreenshot("premium-controls-disabled-mobile-dark.png");
    }
  }
  await controls.getByRole("radio", { name: "正常" }).check();
  const sync = controls.getByRole("button", { name: "同步设置" });
  const beforeWidth = await sync.evaluate(element => element.getBoundingClientRect().width);
  await sync.click();
  await expect(sync).toHaveAttribute("aria-busy", "true");
  expect(await sync.evaluate(element => element.getBoundingClientRect().width)).toBe(beforeWidth);
  await expect(controls.getByRole("status").filter({ hasText: "本地设置已同步" })).toBeVisible();
});

test("task transitions and timeline share state", async ({ page }) => {
  await open(page);
  const row = task(page, "交互组件适配");
  await row.getByRole("button", { name: "暂停交互组件适配" }).click();
  await expect(row).toContainText("已暂停");
  await expect(row).toContainText("68%");
  let events = section(page, "activity").getByRole("listitem");
  await expect(events.first()).toContainText("暂停任务");
  await row.getByRole("button", { name: "继续交互组件适配" }).click();
  await expect(row).toContainText("执行中");
  events = section(page, "activity").getByRole("listitem");
  await expect(events.first()).toContainText("继续任务");
  const timestamps = await events.locator("time").allTextContents();
  expect(timestamps).toEqual([...timestamps].sort().reverse());
  await row.getByRole("button", { name: "暂停交互组件适配" }).press("Control+k");
  const search = section(page, "tasks").getByRole("searchbox", { name: "搜索任务" });
  await expect(search).toBeFocused();
  await search.fill("未匹配的示例");
  await expect(section(page, "tasks").getByText("没有匹配的任务")).toBeVisible();
  await section(page, "tasks").getByRole("button", { name: "清除筛选" }).click();
  await expect(row).toBeVisible();
});

test("approval risk, responsible owner, confirmation and focus", async ({ page }) => {
  await page.setViewportSize(viewports.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "hybrid", { theme: "dark" });
  const approvals = section(page, "approvals");
  const high = approvals.locator("article").filter({ hasText: "更新视觉回归基线" });
  const low = approvals.locator("article").filter({ hasText: "生成覆盖率摘要" });
  await expect(high).toContainText("高风险");
  await expect(high).toContainText("前端验收负责人");
  await expect(high).toContainText("未经复核的变化");
  await expect(low).toContainText("低风险");
  await low.getByRole("button", { name: "拒绝", exact: true }).click();
  await expect(low).toContainText("已拒绝");
  const trigger = high.getByRole("button", { name: "批准", exact: true });
  await trigger.press("Enter");
  const dialog = page.getByRole("dialog");
  await themedPortal(page, dialog);
  await expect(dialog.getByRole("button", { name: "取消", exact: true })).toBeFocused();
  await expect(dialog).toContainText("未经复核的变化");
  await audit(page);
  await expect(page).toHaveScreenshot("premium-approval-dialog-mobile-dark.png", { timeout: 12_000 });
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await dialog.getByRole("button", { name: "确认批准" }).click();
  await expect(high).toContainText("已批准");
  await expect(task(page, "Playwright 回归测试")).toContainText("执行中");
  await expect(section(page, "diff").getByRole("row").filter({ hasText: "移动端截图基线" })).toContainText("已批准");
});

test("tool failure, retry, evidence and delivery risk", async ({ page }) => {
  await open(page, "beautiful");
  const tools = section(page, "tools");
  const failed = tools.locator("details").filter({ hasText: "快照索引校验" });
  await expect(failed).toContainText("失败");
  await failed.locator("summary").press("Enter");
  await expect(failed).toHaveAttribute("open", "");
  await expect(failed).toContainText("索引与截图清单不一致");
  await expect(tools).toHaveScreenshot("premium-tool-failure-desktop-light.png");
  const delivery = section(page, "delivery");
  await expect(delivery.getByRole("link", { name: "查看工具证据" })).toHaveAttribute("href", "#tools");
  await expect(delivery).toContainText("移动端深色截图");
  await expect(delivery).toContainText("前端验收负责人");
  await failed.getByRole("button", { name: "重试校验" }).click();
  await expect(failed).toContainText("通过");
  await expect(delivery).toContainText("快照索引检查通过");
  await expect(section(page, "activity").getByRole("listitem").first()).toContainText("重试通过");
});

test("prompt keyboard submission preserves context and wraps long content", async ({ page }) => {
  await page.setViewportSize(viewports.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "untitled");
  await page.getByRole("button", { name: "新建任务" }).click();
  const input = page.getByRole("textbox", { name: "任务意图" });
  await expect(input).toBeFocused();
  const prompt = section(page, "prompt");
  const context = prompt.getByRole("button", { name: /任务上下文/ });
  await context.press("ArrowDown");
  await page.getByRole("option", { name: "回归验收" }).click();
  const mode = prompt.getByRole("button", { name: /执行方式/ });
  await mode.press("ArrowDown");
  await page.getByRole("option", { name: "沙箱演示" }).click();
  await input.fill("第一行");
  await input.press("End");
  await input.press("Enter");
  await expect(input).toHaveValue("第一行\n");
  const long = "CheckAccessibleKeyboardNavigationAcrossTheAgentWorkspaceAndPersistEvidenceWithoutOverflow";
  await input.fill(long);
  await input.press("Control+Enter");
  await expect(task(page, long)).toContainText("已排队");
  await expect(input).toHaveValue("");
  await expect(context).toContainText("回归验收");
  await expect(mode).toContainText("沙箱演示");
  await expect(page.getByRole("region", { name: "工作区指标" }).getByText("25", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("RTL keyboard selection, reduced motion, select portal and focus restoration", async ({ page }) => {
  await page.setViewportSize(viewports.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "hybrid", { theme: "dark", density: "compact", dir: "rtl" });
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  const tabs = section(page, "tasks").getByRole("tablist");
  const startTab = tabs.getByRole("tab").first();
  await expect(tabs).toHaveAttribute("data-mf-slide-marker", "");
  const markerOffset = () => tabs.evaluate(node => node.style.getPropertyValue("--mf-tab-marker-x"));
  const initialOffset = await markerOffset();
  await startTab.press("ArrowLeft");
  await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await expect.poll(markerOffset).not.toBe(initialOffset);
  const controls = section(page, "controls");
  const switcher = controls.getByRole("switch", { name: "自动恢复" });
  const thumb = controls.locator(".mf-switch__thumb");
  expect(await thumb.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41)).toBeLessThan(0);
  await expect(thumb).toHaveCSS("transition-property", "none");
  await switcher.press("Space");
  await expect(switcher).not.toBeChecked();
  const select = controls.getByRole("button", { name: /负责人/ });
  await select.press("ArrowDown");
  const menu = page.getByRole("listbox");
  await themedPortal(page, menu);
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(select).toBeFocused();
});

test("existing visual stories have no Premium scope", async ({ page }) => {
  await open(page);
  await page.goto(storyUrl("visual-directions-sky-precision--workspace"));
  await expect(page.locator("body")).toHaveAttribute("data-mf-surface", "precision");
  await expect(page.locator("body")).not.toHaveAttribute("data-mf-premium");
  await page.goto(storyUrl("visual-directions-sky-blue--comparison"));
  await expect(page.locator("body")).toHaveAttribute("data-sky-theme", "air");
  await expect(page.locator("body")).not.toHaveAttribute("data-mf-premium");
});
