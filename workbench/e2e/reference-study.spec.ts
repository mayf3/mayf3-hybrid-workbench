import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";

const story = "visual-directions-reference-study--comparison";
const directions = [
  { id: "vercel", label: "Vercel-inspired" },
  { id: "stripe", label: "Stripe-inspired" },
  { id: "apple", label: "Apple-inspired" },
  { id: "hybrid", label: "Mayf3 Hybrid" },
] as const;
type Direction = (typeof directions)[number]["id"];

const desktop = { width: 1440, height: 900 };
const tablet = { width: 768, height: 900 };
const mobile = { width: 390, height: 844 };
const scenarios = [
  { name: "desktop", viewport: desktop, scheme: "light", screenshot: true },
  { name: "desktop", viewport: desktop, scheme: "dark", screenshot: true },
  { name: "tablet", viewport: tablet, scheme: "light", screenshot: false },
  { name: "mobile", viewport: mobile, scheme: "light", screenshot: true },
  { name: "mobile", viewport: mobile, scheme: "dark", screenshot: false },
] as const;

async function open(page: Page, direction: Direction, globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(story, globals)}&args=direction:${direction}`);
  await expect(page.getByRole("heading", { name: "Agent 工作台", exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-mf-reference", direction);
}

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map(item => ({
    rule: item.id,
    targets: item.nodes.map(node => node.target),
    notes: item.nodes.map(node => node.failureSummary),
  }))).toEqual([]);
}

function task(page: Page, name: string) {
  return page.getByRole("table", { name: "工作区任务" }).getByRole("row").filter({ hasText: name });
}

async function expectThemedPortal(overlay: Locator, direction: Direction) {
  await expect(overlay).toBeVisible();
  const resolved = await overlay.evaluate(element => {
    const body = element.ownerDocument.body;
    const style = getComputedStyle(element);
    const bodyStyle = getComputedStyle(body);
    return {
      direction: element.closest<HTMLElement>("[data-mf-reference]")?.dataset.mfReference,
      portaled: !element.closest("#storybook-root"),
      scheme: style.colorScheme,
      surface: style.getPropertyValue("--mf-color-surface-raised").trim(),
      bodySurface: bodyStyle.getPropertyValue("--mf-color-surface-raised").trim(),
    };
  });
  expect(resolved).toMatchObject({ direction, portaled: true, scheme: "dark" });
  expect(resolved.surface).toBeTruthy();
  expect(resolved.surface).toBe(resolved.bodySurface);
}

for (const { id, label } of directions) {
  for (const { name, viewport, scheme, screenshot } of scenarios) {
    test(`${label} ${name} ${scheme} renders the shared workspace and passes axe`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const imageRequests: string[] = [];
      page.on("request", request => {
        if (request.resourceType() === "image") imageRequests.push(request.url());
      });
      await open(page, id, { theme: scheme });
      await expect(page.locator("body")).toHaveCSS("color-scheme", scheme);
      await expect(page.getByRole("radio", { name: label, exact: true })).toBeChecked();

      const metrics = page.getByRole("region", { name: "工作区指标" });
      for (const value of ["24", "94.2%", "18/21"]) {
        await expect(metrics.getByText(value, { exact: true })).toBeVisible();
      }
      await expect(task(page, "语义 Token 整理")).toContainText("100%");
      await expect(task(page, "交互组件适配")).toContainText("68%");
      const regression = task(page, "Playwright 回归测试");
      await expect(regression.getByRole("progressbar", { name: "Playwright 回归测试执行进度" })).toHaveAttribute("value", "82");
      await expect(regression).toContainText("待人工确认");
      await expect(page.locator("#delivery")).toContainText("本周交付完成率");
      await expect(page.locator("#delivery")).toContainText("18 / 21（85.7%）");
      await expect(page.locator("#delivery")).toContainText("验收通过率");
      await expect(page.locator("#delivery")).toContainText("未统计");
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("img, canvas, video")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);

      await audit(page);
      expect(imageRequests).toEqual([]);
      if (screenshot) await expect(page).toHaveScreenshot(`reference-${id}-${name}-${scheme}.png`, { fullPage: true });
    });
  }
}

test("direction, viewport and scheme switches preserve in-progress work", async ({ page }) => {
  await page.setViewportSize(desktop);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "vercel");
  const draft = page.getByRole("textbox", { name: "任务意图" });
  await draft.fill("继续处理这份工作区草稿");
  const runningTask = task(page, "交互组件适配");
  await runningTask.getByRole("button", { name: "暂停交互组件适配" }).click();
  await expect(runningTask).toHaveAttribute("data-state", "paused");

  for (const { id, label } of directions.slice(1)) {
    await page.getByRole("radio", { name: label, exact: true }).check();
    await expect(page.locator("body")).toHaveAttribute("data-mf-reference", id);
    await expect(draft).toHaveValue("继续处理这份工作区草稿");
    await expect(runningTask).toHaveAttribute("data-state", "paused");
  }

  await page.getByRole("radio", { name: "平板", exact: true }).check();
  await expect(page.locator(".premium-workspace")).toHaveCSS("width", "768px");
  await page.getByRole("radio", { name: "移动", exact: true }).check();
  await expect(page.locator(".premium-workspace")).toHaveCSS("width", "390px");
  await page.getByRole("button", { name: "深色", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
  await expect(draft).toHaveValue("继续处理这份工作区草稿");
  await expect(runningTask).toHaveAttribute("data-state", "paused");
  await expect(runningTask).toContainText("68%");
});

for (const { id, label } of directions) {
  test(`${label} keeps keyboard and themed portals usable in dark RTL with reduced motion`, async ({ page }) => {
    await page.setViewportSize(mobile);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, id, { theme: "dark", dir: "rtl", density: "compact" });
    await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("body")).toHaveAttribute("data-density", "compact");

    const tabs = page.locator("#tasks").getByRole("tablist");
    await tabs.getByRole("tab").first().press("ArrowLeft");
    await expect(tabs.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");

    const controls = page.locator("#controls");
    const toggle = controls.getByRole("switch", { name: "自动恢复" });
    await expect(controls.locator(".mf-switch__thumb")).toHaveCSS("transition-property", "none");
    await toggle.press("Space");
    await expect(toggle).not.toBeChecked();

    const select = controls.getByRole("button", { name: /负责人/ });
    await select.press("ArrowDown");
    const listbox = page.getByRole("listbox");
    await expectThemedPortal(listbox, id);
    await audit(page);
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();
    await expect(select).toBeFocused();

    const approval = page.getByRole("article", { name: "更新视觉回归基线" });
    const approve = approval.getByRole("button", { name: "批准", exact: true });
    await approve.press("Enter");
    const dialog = page.getByRole("dialog");
    await expectThemedPortal(dialog, id);
    await expect(dialog.getByRole("button", { name: "取消", exact: true })).toBeFocused();
    await audit(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(approve).toBeFocused();
  });
}

test("controls show distinct hover, keyboard focus, pressed, invalid and disabled states", async ({ page }) => {
  await page.setViewportSize(desktop);
  await open(page, "hybrid");
  const controls = page.locator("#controls");
  const save = controls.getByRole("button", { name: "保存设置" });
  await save.scrollIntoViewIfNeeded();
  const resting = await save.evaluate(el => getComputedStyle(el).backgroundColor);
  await save.hover();
  await expect(save).toHaveAttribute("data-hovered", "true");
  await expect(save).not.toHaveCSS("background-color", resting);
  await page.mouse.down();
  await expect(save).toHaveAttribute("data-pressed", "true");
  await expect(save).toHaveCSS("box-shadow", /inset/);
  await page.mouse.up();

  const invalid = controls.getByRole("textbox", { name: "任务键名" });
  await invalid.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(invalid).toBeFocused();
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(invalid).toHaveCSS("outline-style", "solid");
  await controls.getByRole("radio", { name: "禁用" }).check();
  await expect(save).toBeDisabled();
  await expect(invalid).toBeDisabled();
});

test("Apple uses glass only on the anchored popover and respects transparency preferences", async ({ page, context }) => {
  await page.setViewportSize(desktop);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await open(page, "apple");
  await expect(page.locator(".premium-workspace")).toHaveCSS("backdrop-filter", "none");
  const select = page.locator("#controls").getByRole("button", { name: /负责人/ });
  await select.press("ArrowDown");
  const popover = page.locator(".mf-select__popover");
  await expect(popover).toHaveCSS("backdrop-filter", "blur(12px)");
  await audit(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect(popover).toHaveCSS("backdrop-filter", "none");
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  await expect(popover).toHaveCSS("backdrop-filter", "blur(12px)");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(popover).toHaveCSS("backdrop-filter", "none");
});
