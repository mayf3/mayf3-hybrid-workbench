import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { storyUrl, type StoryGlobals } from "./helpers";
import { operationsTotals, weeklyOperations } from "../stories/art-direction-v2/workspace";
import { weeklyDelivery, workspaceMetrics } from "../stories/premium-agent/agent-model";

const story = "art-direction-v2--comparison";
const directions = ["vercel", "stripe", "apple", "hybrid"] as const;
type Direction = typeof directions[number];

async function open(page: Page, direction: Direction, globals: StoryGlobals = {}) {
  await page.goto(`${storyUrl(story, globals)}&args=direction:${direction}`);
  await expect(page.locator("[data-v2-workspace]")).toHaveAttribute("data-v2-workspace", direction);
}

for (const direction of directions) {
  for (const screen of [
    { name: "desktop", width: 1440, height: 900, globals: { theme: "light" }, capture: true },
    { name: "mobile", width: 390, height: 844, globals: { theme: "light" }, capture: true },
    { name: "tablet RTL", width: 768, height: 900, globals: { theme: "dark", dir: "rtl" }, capture: false },
    { name: "mobile RTL", width: 390, height: 844, globals: { theme: "dark", dir: "rtl" }, capture: false },
  ] as const) {
    test(`${direction} ${screen.name} keeps shared values and passes accessibility checks`, async ({ page }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const imageRequests: string[] = [];
      page.on("request", request => { if (request.resourceType() === "image") imageRequests.push(request.url()); });
      await open(page, direction, screen.globals);
      const product = page.locator("[data-v2-workspace]");
      const audit = await new AxeBuilder({ page }).analyze();
      expect(audit.violations.map(item => [item.id, item.nodes.map(node => node.target)])).toEqual([]);
      await expect(page.locator("main")).toHaveCount(1);
      const picker = direction === "hybrid" && screen.width === 390
        ? product.locator(".v2h-mobile-picker")
        : undefined;
      if (picker) {
        await expect(product.getByRole("heading", { level: 1, name: "交互组件适配" })).toBeVisible();
        await picker.evaluate(element => { (element as HTMLDetailsElement).open = true; });
      }
      for (const text of ["语义 Token 整理", "交互组件适配", "Playwright 回归测试"]) {
        await expect((picker ?? product).getByText(text, { exact: true }).first()).toBeVisible();
      }
      if (picker) await picker.evaluate(element => { (element as HTMLDetailsElement).open = false; });
      for (const text of ["24", "94.2%", "18/21"]) {
        await expect(product.getByText(text, { exact: true }).first()).toBeVisible();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(screen.width);
      expect(imageRequests).toEqual([]);
      await page.evaluate(() => document.fonts.ready);
      if (screen.capture) await expect(page).toHaveScreenshot(`art-v2-${direction}-${screen.name}.png`, { fullPage: true });
    });
  }
}

test("Stripe trend, ratio tracks and overview are derived from the same daily records", async ({ page }) => {
  expect(operationsTotals.delivered).toBe(weeklyDelivery.completed);
  expect(operationsTotals.planned).toBe(weeklyDelivery.planned);
  expect(`${operationsTotals.recoveryRate.toFixed(1)}%`).toBe(workspaceMetrics.recovery);
  for (const day of weeklyOperations) {
    expect(day.recovered).toBeLessThanOrEqual(day.attempts);
    expect(day.delivered).toBeLessThanOrEqual(day.planned);
  }
  await open(page, "stripe");
  const recovery = page.locator('meter[data-series="recovery"]');
  await expect(recovery).toHaveAttribute("max", "173");
  await expect(recovery).toHaveAttribute("value", "163");
  const group = page.getByRole("group", { name: "选择日期查看指标" });
  await expect(group.getByRole("button")).toHaveCount(7);
  await group.getByRole("button", { name: "周一", exact: true }).click();
  await expect(page.locator(".v2s-chart-detail")).toContainText("17/20");
  await group.getByRole("button", { name: "周一", exact: true }).press("ArrowRight");
  await expect(group.getByRole("button", { name: "周二", exact: true })).toBeFocused();
  await expect(page.locator(".v2s-chart-detail")).toContainText("29/30");
  await expect(page.locator(".v2s-chart-detail")).toContainText("3/3");
});

test("a change made in Command Center is reflected in the Spatial Workspace", async ({ page }) => {
  await open(page, "vercel");
  await page.getByRole("button", { name: "暂停交互组件适配", exact: true }).click();
  await page.getByRole("radio", { name: "Spatial Workspace", exact: true }).check();
  await expect(page.locator("[data-v2-workspace]")).toHaveAttribute("data-v2-workspace", "apple");
  await expect(page.getByRole("progressbar", { name: "交互组件适配执行进度" })).toHaveAttribute("value", "68");
  await expect(page.getByText("已暂停", { exact: true }).first()).toBeVisible();
  const menu = page.getByRole("button", { name: "窗口菜单" });
  await menu.press("ArrowDown");
  await expect(page.getByRole("menu", { name: "窗口菜单" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
});

test("Command Center shortcut switches project scope and opens the selected task", async ({ page }) => {
  await open(page, "vercel");
  await expect(page.getByRole("button", { name: "查找任务" })).toHaveAccessibleDescription(/Control 或 Command 加 K/);
  await page.keyboard.press("Control+k");
  const picker = page.getByRole("dialog", { name: "查找任务" });
  await expect(picker.getByRole("searchbox", { name: "搜索任务" })).toBeFocused();
  await picker.getByRole("button", { name: "回归验收" }).click();
  await expect(picker.getByRole("list", { name: "匹配任务" }).getByRole("listitem")).toHaveCount(1);
  await picker.getByRole("button", { name: /Playwright 回归测试/ }).press("Enter");
  await expect(picker).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "运行检查器" })).toContainText("Playwright 回归测试");
});
