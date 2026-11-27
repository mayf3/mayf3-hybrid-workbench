import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";

const storyPrefix = "visual-directions-sky-precision--";
const devices = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;
const schemes = ["light", "dark"] as const;
type Variant = "before" | "after";

async function open(page: Page, story: string, variant: Variant, globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(storyPrefix + story, globals)}&args=variant:${variant}`);
  await expect(page.locator("body")).toHaveAttribute("data-sky-theme", "air");
  if (story !== "comparison" && variant === "after") {
    await expect(page.locator("body")).toHaveAttribute("data-mf-surface", "precision");
  } else {
    await expect(page.locator("body")).not.toHaveAttribute("data-mf-surface");
  }
}

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map(item => ({
    rule: item.id,
    targets: item.nodes.map(node => node.target),
    notes: item.nodes.map(node => node.failureSummary),
  }))).toEqual([]);
}

async function expectPortaledSurface(surface: Locator, page: Page, scheme: string) {
  await expect(surface).toBeVisible();
  const host = await page.locator("body").evaluate(body => getComputedStyle(body).getPropertyValue("--mf-surface-raised").trim());
  expect(host).toMatch(/^#/);
  expect(await surface.evaluate(element => ({
    scope: element.closest<HTMLElement>("[data-mf-surface]")?.dataset.mfSurface,
    outsideStory: !element.closest("#storybook-root"),
    scheme: getComputedStyle(element).colorScheme,
    surface: getComputedStyle(element).getPropertyValue("--mf-surface-raised").trim(),
  }))).toEqual({ scope: "precision", outsideStory: true, scheme, surface: host });
}

for (const [name, viewport] of Object.entries(devices)) {
  for (const scheme of schemes) {
    for (const variant of ["before", "after"] as const) {
      test(`workspace ${variant} ${name} ${scheme}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: "reduce" });
        const imageRequests: string[] = [];
        page.on("request", request => {
          if (request.resourceType() === "image") imageRequests.push(request.url());
        });
        await open(page, "workspace", variant, { theme: scheme });
        const hero = page.getByTestId("precision-hero");
        await expect(hero.getByRole("heading", { name: "Agent 执行概览" })).toBeVisible();
        await expect(hero.getByRole("progressbar", { name: "当前任务执行进度" })).toHaveAttribute("value", "68");
        await expect(hero.getByText("18/21", { exact: true })).toBeVisible();
        await expect(hero.getByText(/Playwright 回归测试/)).toBeVisible();
        await expect(page.getByRole("table", { name: "工作区任务" })).toBeVisible();
        await expect(page.locator("body")).toHaveCSS("color-scheme", scheme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
        await expect(page.locator("canvas, iframe, video")).toHaveCount(0);
        expect(imageRequests).toEqual([]);
        if (variant === "after") {
          const focalRegions = page.locator("[data-visual-level='l2']");
          await expect(focalRegions).toHaveCount(1);
          await expect(focalRegions).toHaveAttribute("data-testid", "precision-hero");
          await expect(hero.locator(".sky-orbit")).toHaveCount(0);
          const metrics = page.locator(".sky-metrics");
          await expect(metrics).toHaveCSS("box-shadow", /inset/);
          await expect(metrics).toHaveCSS("background-image", "none");
          await expect(page.locator(".sky-timeline time").first()).toHaveCSS("font-variant-numeric", "tabular-nums");
          if (name === "mobile") {
            await expect(hero).toHaveCSS("background-image", "none");
          } else {
            await expect(hero).toHaveCSS("background-image", /radial-gradient/);
          }
          await audit(page);
        }
        await expect(page).toHaveScreenshot(`workspace-${variant}-${name}-${scheme}.png`, { fullPage: true });
      });
    }
  }
}

test("side-by-side isolates live canvases and keeps both layouts equally wide", async ({ page }) => {
  await page.setViewportSize(devices.desktop);
  await open(page, "comparison", "after");
  const before = page.frameLocator("iframe[title='精修前 · Sky Air']");
  const after = page.frameLocator("iframe[title='精修后 · Sky Precision']");
  await expect(after.getByTestId("precision-hero")).toBeVisible();
  await page.getByRole("radio", { name: "并排" }).check();
  await page.getByRole("radio", { name: "移动 390" }).check();
  await expect(before.getByTestId("precision-hero")).toBeVisible();
  await expect(after.getByTestId("precision-hero")).toBeVisible();
  await expect(before.locator("body")).not.toHaveAttribute("data-mf-surface");
  await expect(after.locator("body")).toHaveAttribute("data-mf-surface", "precision");
  const widths = await page.locator("iframe").evaluateAll(frames => frames.map(frame => frame.clientWidth));
  expect(widths).toEqual([390, 390]);
  expect(await before.getByRole("main").innerText()).toContain("18/21");
  const box = after.getByRole("searchbox", { name: "搜索任务" });
  await box.fill("Agent B");
  await expect(after.getByRole("table", { name: "工作区任务" }).getByRole("row")).toHaveCount(2);
  await expect(before.getByRole("table", { name: "工作区任务" }).getByRole("row")).toHaveCount(4);
  await page.getByRole("button", { name: "深色模式" }).click();
  await expect(before.locator("body")).toHaveCSS("color-scheme", "dark");
  await expect(after.locator("body")).toHaveCSS("color-scheme", "dark");
});

for (const scheme of schemes) {
  test(`button and TextField states ${scheme}`, async ({ page }) => {
    await page.setViewportSize(devices.desktop);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "control-states", "after", { theme: scheme });
    const primary = page.getByRole("button", { name: "提交", exact: true });
    const input = page.getByRole("textbox", { name: "可编辑" });
    await expect(page.getByRole("button", { name: "提交中" })).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("button", { name: "不可用" })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "只读" })).toHaveAttribute("readonly", "");
    await expect(page.getByRole("textbox", { name: "验证错误" })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("textbox", { name: "禁用" })).toBeDisabled();
    await audit(page);
    const sheet = page.getByRole("main");
    await page.keyboard.press("Tab");
    await expect(primary).toBeFocused();
    await expect(primary).toHaveCSS("outline-style", "solid");
    await expect(sheet).toHaveScreenshot(`controls-${scheme}-button-focus.png`);
    await sheet.getByRole("heading", { name: "按钮", exact: true }).click();
    await primary.hover();
    await expect(primary).toHaveAttribute("data-hovered", "true");
    await expect(sheet).toHaveScreenshot(`controls-${scheme}-button-hover.png`);
    await page.mouse.down();
    await expect(primary).toHaveAttribute("data-pressed", "true");
    await expect(sheet).toHaveScreenshot(`controls-${scheme}-button-pressed.png`);
    await page.mouse.up();
    const restingEdge = await input.evaluate(element => getComputedStyle(element).borderTopColor);
    await input.hover();
    await expect(input).not.toHaveCSS("border-top-color", restingEdge);
    await expect(sheet).toHaveScreenshot(`controls-${scheme}-input-hover.png`);
    await input.press("ArrowLeft");
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "solid");
    await expect(sheet).toHaveScreenshot(`controls-${scheme}-input-focus.png`);
  });

  test(`dialog and popover portals ${scheme}`, async ({ page }) => {
    await page.setViewportSize(scheme === "dark" ? devices.mobile : devices.desktop);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "workspace", "after", { theme: scheme });
    const dialogButton = page.getByRole("button", { name: "打开对话框" });
    await dialogButton.click();
    const dialog = page.getByRole("dialog", { name: "确认测试运行" });
    await expectPortaledSurface(dialog, page, scheme);
    await audit(page);
    await expect(page).toHaveScreenshot(`dialog-portal-${scheme}.png`);
    await page.keyboard.press("Escape");
    await expect(dialogButton).toBeFocused();
    const trigger = page.getByRole("button", { name: "打开浮层" });
    await trigger.click();
    const popover = page.getByRole("dialog", { name: "工作区概况" });
    await expectPortaledSurface(popover, page, scheme);
    await expect(popover).toHaveCSS("backdrop-filter", "none");
    await audit(page);
    await expect(page).toHaveScreenshot(`popover-portal-${scheme}.png`);
    await popover.getByRole("button", { name: "关闭浮层" }).click();
    await expect(trigger).toBeFocused();
  });
}

test("RTL and reduced motion preserve state and remove motion", async ({ page }) => {
  await page.setViewportSize(devices.mobile);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "workspace", "after", { theme: "dark", dir: "rtl" });
  await expect(page.locator("body")).toHaveAttribute("dir", "rtl");
  const hero = page.getByTestId("precision-hero");
  await expect(hero.getByRole("button", { name: "查看执行中" })).toHaveCSS("transition-property", "none");
  await hero.getByRole("button", { name: "查看执行中" }).press("Enter");
  const selected = page.getByRole("tab", { name: "执行中" });
  await expect(selected).toHaveAttribute("aria-selected", "true");
  await selected.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "已完成" })).toHaveAttribute("aria-selected", "true");
  const thumb = page.locator(".mf-switch__thumb");
  expect(await thumb.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBeLessThan(0);
  await page.getByRole("switch", { name: "自动恢复" }).press("Space");
  await expect(page.getByRole("switch", { name: "自动恢复" })).not.toBeChecked();
  await page.getByRole("button", { name: "打开对话框" }).click();
  await expect(page.locator(".mf-dialog")).toHaveCSS("animation-name", "none");
  await audit(page);
});

test("button surface responds to hover and press with bounded motion", async ({ page }) => {
  await open(page, "control-states", "after");
  const primary = page.getByRole("button", { name: "提交", exact: true });
  const getY = () => primary.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42);
  await expect(primary).toHaveCSS("background-image", /linear-gradient/);
  await primary.hover();
  await expect.poll(getY).toBe(-1);
  await page.mouse.down();
  try {
    await expect.poll(getY).toBe(1);
    await expect(primary).toHaveCSS("background-image", "none");
  } finally {
    await page.mouse.up();
  }
});

test("precision surface stays local to its canvas", async ({ page }) => {
  await open(page, "workspace", "after", { theme: "dark" });
  await page.goto(storyUrl("visual-directions-sky-blue--comparison"));
  await expect(page.locator("body")).toHaveAttribute("data-sky-theme", "air");
  await expect(page.locator("body")).not.toHaveAttribute("data-mf-surface");
  await page.goto(storyUrl("components-button--matrix"));
  await expect(page.locator("body")).toHaveClass(/mf-theme-seaside/);
  await expect(page.locator("body")).not.toHaveAttribute("data-mf-surface");
});
