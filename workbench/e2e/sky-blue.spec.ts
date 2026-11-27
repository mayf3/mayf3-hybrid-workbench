import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { directions, type SkyDirection } from "../stories/visual-directions/themes";
import { storyUrl, type StoryGlobals } from "./helpers";

const story = "visual-directions-sky-blue--comparison";
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;
const schemes = ["light", "dark"] as const;

async function openComparison(page: Page, direction: SkyDirection, globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(story, globals)}&args=direction:${direction}`);
  await expect(page.getByRole("heading", { name: "Agent 工作台" })).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-sky-theme", direction);
}

async function audit(page: Page, { tooltipPortal = false } = {}) {
  // Measure steady-state contrast after finite entrances and transitions.
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter(animation =>
      Number.isFinite(animation.effect?.getComputedTiming().endTime),
    );
    await Promise.allSettled(finite.map(animation => animation.finished));
  });
  const builder = new AxeBuilder({ page });
  if (tooltipPortal) {
    // The tooltip is transient and described by its trigger. React Aria
    // portals it outside the landmarks; the region check is a best practice.
    builder.disableRules("region");
  }
  const results = await builder.analyze();
  expect(results.violations.map(item => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  }))).toEqual([]);
}

async function expectThemedPortal(overlay: Locator, page: Page, token = "--mf-color-surface-raised") {
  await expect(overlay).toBeVisible();
  expect(await overlay.evaluate((element, property) => ({
    inherited: getComputedStyle(element).getPropertyValue(property).trim(),
    outsideStory: !element.closest("#storybook-root"),
    scheme: getComputedStyle(element).colorScheme,
  }), token)).toEqual(await page.locator("body").evaluate((element, property) => ({
    inherited: getComputedStyle(element).getPropertyValue(property).trim(),
    outsideStory: true,
    scheme: getComputedStyle(element).colorScheme,
  }), token));
}

for (const { id, name } of directions) {
  for (const scheme of schemes) {
    for (const [size, viewport] of Object.entries(viewports)) {
      test(`${name} · ${size} · ${scheme} screenshot and axe`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: "reduce" });
        const externalImages: string[] = [];
        page.on("request", request => {
          if (request.resourceType() === "image" && /^https?:/.test(request.url())) externalImages.push(request.url());
        });
        await openComparison(page, id, { theme: scheme });
        await expect(page.locator("body")).toHaveCSS("color-scheme", scheme);
        const main = page.getByRole("main");
        await expect(main.getByText("94.2%", { exact: true })).toBeVisible();
        await expect(main.getByRole("progressbar", { name: "Playwright 回归测试进度" })).toHaveAttribute("value", "82");
        await expect(main.getByRole("heading", { name: "交互演示" })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
        expect(externalImages).toEqual([]);
        await audit(page);
        await expect(page).toHaveScreenshot(`sky-${id}-${size}-${scheme}.png`, { fullPage: true });
      });
    }
  }
}

test("theme switching keeps shared state, exposes tokens, and renders the 390px preview", async ({ page }) => {
  await page.setViewportSize(viewports.desktop);
  await openComparison(page, "air");
  const workingSearch = page.getByRole("searchbox", { name: "搜索任务" });
  await workingSearch.fill("Agent B");
  await expect(page.getByRole("table", { name: "工作区任务" }).getByRole("row")).toHaveCount(2);
  await page.getByRole("radio", { name: "Sky Editorial" }).check();
  await expect(page.locator("body")).toHaveAttribute("data-sky-theme", "editorial");
  await expect(workingSearch).toHaveValue("Agent B");
  await page.getByRole("button", { name: "深色模式" }).click();
  await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
  await page.getByText("查看 Token 差异").click();
  const tokens = page.getByRole("region", { name: "六套方案 Token 差异" });
  await expect(tokens.getByRole("columnheader", { name: "Sky Editorial" })).toHaveAttribute("data-active", "true");
  await expect(tokens.getByRole("row", { name: /^主色 --/ }).locator("td code").first()).toContainText("rgb(");
  const mobile = page.getByRole("radio", { name: "移动" });
  await mobile.check();
  await expect(page.getByTestId("sky-viewport")).toHaveCSS("width", "390px");
  await workingSearch.fill("没有任务");
  await expect(page.getByText("没有匹配的任务")).toBeVisible();
  await page.getByRole("button", { name: "清除筛选" }).click();
  await expect(page.getByRole("table", { name: "工作区任务" }).getByRole("row")).toHaveCount(4);
  await page.getByRole("button", { name: "查看执行中" }).click();
  await expect(page.getByRole("tab", { name: "执行中" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "执行中" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "已完成" })).toHaveAttribute("aria-selected", "true");
});

test("button, form controls, and real React Aria overlays", async ({ page }) => {
  await page.setViewportSize(viewports.desktop);
  await openComparison(page, "bloom", { theme: "dark" });
  const controls = page.locator("#controls");
  const matrix = controls.getByRole("region", { name: "按钮矩阵" });
  const primary = matrix.getByRole("button", { name: "启动（中）" });
  await primary.hover();
  await expect(primary).toHaveAttribute("data-hovered", "true");
  await page.mouse.down();
  await expect(primary).toHaveAttribute("data-pressed", "true");
  await page.mouse.up();
  await expect(matrix.getByRole("status")).toContainText("已触发");
  await expect(matrix.getByRole("button", { name: "禁用" })).toBeDisabled();
  await expect(matrix.getByRole("button", { name: "加载" })).toHaveAttribute("aria-busy", "true");

  const form = page.getByRole("form", { name: "控件测试设置" });
  const slug = form.getByRole("textbox", { name: "任务键名" });
  await form.getByRole("button", { name: "保存测试设置" }).click();
  await expect(slug).toBeFocused();
  await expect(slug).toHaveAttribute("aria-invalid", "true");
  await slug.fill("agent-check");
  await form.getByRole("searchbox", { name: "搜索代理" }).fill("Agent C");
  await expect(form.getByRole("status").filter({ hasText: "Agent C" })).toBeVisible();
  const select = form.getByRole("button", { name: /负责人/ });
  await select.press("ArrowDown");
  await expectThemedPortal(page.getByRole("listbox"), page);
  await audit(page);
  await page.getByRole("option", { name: "Agent B" }).click();
  await expect(select).toBeFocused();
  const toggle = form.getByRole("switch", { name: "自动恢复" });
  await toggle.press("Space");
  await expect(toggle).not.toBeChecked();
  await form.getByRole("checkbox", { name: "包含已完成任务" }).press("Space");
  await form.getByRole("radio", { name: "仅分配给我" }).press("Space");
  await form.getByRole("radio", { name: "列表" }).press("ArrowRight");
  await expect(form.getByRole("radio", { name: "看板" })).toBeChecked();
  await form.getByRole("button", { name: "保存测试设置" }).click();
  await expect(form.getByRole("status").filter({ hasText: "已保存" })).toContainText("Agent B · 仅分配给我 · 看板 · 自动恢复已关闭");

  const overlays = page.locator("#interactions");
  const dialogTrigger = overlays.getByRole("button", { name: "打开对话框" });
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog", { name: "确认测试运行" });
  await expectThemedPortal(dialog, page);
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(dialogTrigger).toBeFocused();

  const popover = overlays.getByRole("button", { name: "打开浮层" });
  await popover.click();
  await expectThemedPortal(page.getByRole("dialog", { name: "工作区概况" }), page);
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(popover).toBeFocused();

  const tooltip = overlays.getByRole("button", { name: "状态说明" });
  await page.keyboard.press("Tab");
  await expect(tooltip).toBeFocused();
  await expectThemedPortal(page.getByRole("tooltip"), page);
  await audit(page, { tooltipPortal: true });
  await page.keyboard.press("Escape");

  const menuTrigger = overlays.getByRole("button", { name: "更多操作" });
  await menuTrigger.press("Enter");
  await expectThemedPortal(page.getByRole("menu"), page);
  await audit(page);
  await page.getByRole("menuitem", { name: "标为待确认" }).click();
  await expect(overlays.getByText("待确认", { exact: true })).toBeVisible();
  await expectThemedPortal(page.locator(".sky-notice[data-visible]"), page);
  await audit(page);
  await page.getByRole("button", { name: "关闭通知" }).click();
  const toastTrigger = overlays.getByRole("button", { name: "发送通知" });
  await toastTrigger.click();
  await expect(page.getByText("快照已保存", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "关闭通知" }).click();
  await expect(page.locator(".sky-notice")).not.toHaveAttribute("data-visible");
  await expect(toastTrigger).toBeFocused();
});

test("RTL keyboard and surfaces, reduced motion, and independent density", async ({ page }) => {
  await page.setViewportSize(viewports.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openComparison(page, "tech", { theme: "dark", dir: "rtl", density: "compact" });
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".sky-sidebar a[aria-current]")).toHaveCSS("border-right-width", "2px");
  await expect(page.getByRole("tab", { name: "全部" })).toBeVisible();
  await page.getByRole("tab", { name: "全部" }).press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "执行中" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".mf-switch__thumb")).toHaveCSS("transform", "matrix(1, 0, 0, 1, -16, 0)");
  const segment = page.locator(".sky-segment__track");
  expect(await segment.evaluate(element => parseFloat(getComputedStyle(element, "::before").transitionDuration))).toBeLessThan(0.001);
  await expect(page.locator(".sky-feature .mf-btn")).toHaveCSS("min-height", "32px");
  const radius = await page.locator(".sky-feature .mf-btn").evaluate(element => getComputedStyle(element).borderRadius);
  await audit(page);
  await openComparison(page, "tech", { theme: "dark", dir: "rtl", density: "spacious" });
  await expect(page.locator(".sky-feature .mf-btn")).toHaveCSS("min-height", "44px");
  await expect(page.locator(".sky-feature .mf-btn")).toHaveCSS("border-radius", radius);
  await page.getByRole("button", { name: "打开对话框" }).click();
  await expectThemedPortal(page.getByRole("dialog"), page);
  await expect(page.locator(".mf-dialog")).toHaveCSS("animation-name", "none");
});

test("Seaside stories load with their own theme", async ({ page }) => {
  await openComparison(page, "aurora", { theme: "dark", dir: "rtl" });
  await page.goto(storyUrl("components-button--matrix"));
  const body = page.locator("body");
  await expect(body).toHaveClass(/mf-theme-seaside/);
  await expect(body).not.toHaveAttribute("data-sky-theme");
  await expect(body).toHaveAttribute("data-theme", "light");
});
