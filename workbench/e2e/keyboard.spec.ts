import { expect, test } from "@playwright/test";
import { openStory } from "./helpers";

/**
 * Browser-level keyboard and focus acceptance, mirroring the handoff checklist:
 * keyboard navigation, focus trap, focus restoration, reduced motion.
 */

test.describe("keyboard & focus", () => {
  test("button: keyboard activation", async ({ page }) => {
    await openStory(page, "components-button--primary");
    const button = page.getByRole("button", { name: "开始学习" });
    await button.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    // No crash + focus stays (button has no handler; activation must not throw).
    await expect(button).toBeFocused();
  });

  test("button: focus-visible outline on keyboard, absent on mouse", async ({ page }) => {
    await openStory(page, "components-button--primary");
    const button = page.getByRole("button", { name: "开始学习" });
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    // RAC marks keyboard focus with data-focus-visible; our outline styles follow it.
    await expect(button).toHaveAttribute("data-focus-visible");
    await expect(button).toHaveCSS("outline-style", "solid");

    // A fresh pointer interaction must not produce keyboard focus styling.
    await openStory(page, "components-button--primary");
    await button.click();
    await expect(button).not.toHaveAttribute("data-focus-visible");
  });

  test("tabs: arrow key navigation selects and shows panel", async ({ page }) => {
    await openStory(page, "components-tabs--default");
    const tablist = page.getByRole("tablist", { name: "课程工作区" });
    await tablist.getByRole("tab", { name: "概览" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tabpanel")).toContainText("全部课程列表与筛选");
    await page.keyboard.press("End");
    await expect(page.getByRole("tabpanel")).toContainText("主题、密度与通知偏好");
    await expect(tablist.getByRole("tab", { name: "设置" })).toHaveAttribute("aria-selected", "true");
  });

  test("select: keyboard open, navigate, select, escape", async ({ page }) => {
    await openStory(page, "components-selectfield--default");
    const trigger = page.getByRole("button", { name: /潜点/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(listbox).toBeHidden();
    await expect(trigger).toContainText("深海区");
    // Focus returns to the trigger after selection.
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(listbox).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("select: popover stays inside the viewport near the screen edge (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-selectfield--default");
    const trigger = page.getByRole("button", { name: /潜点/ });
    await trigger.click();
    const popover = page.locator(".mf-select__popover");
    await expect(popover).toBeVisible();
    const box = await popover.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize()!;
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  });

  test("dialog: focus trap, escape, focus restoration", async ({ page }) => {
    await openStory(page, "components-dialog--interactive");
    const opener = page.getByRole("button", { name: "删除草稿…" });
    await opener.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();

    // Tab cycles through the tabbables and wraps to the first one.
    const cancel = page.getByRole("button", { name: "取消" });
    const confirm = page.getByRole("button", { name: "确认删除" });
    await page.keyboard.press("Tab");
    await expect(cancel).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(confirm).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(cancel).toBeFocused();
    const contained = await dialog.evaluate(
      el => el.contains(document.activeElement) || document.activeElement === el,
    );
    expect(contained).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("dialog: overlay press dismisses", async ({ page }) => {
    await openStory(page, "components-dialog--interactive");
    await page.getByRole("button", { name: "删除草稿…" }).click();
    const overlay = page.locator(".mf-dialog__overlay");
    await expect(overlay).toBeVisible();
    await page.mouse.click(8, 8); // top-left corner = overlay, outside surface
    await expect(overlay).toBeHidden();
  });

  test("switch: space toggles and checked state is reflected", async ({ page }) => {
    await openStory(page, "components-switch--default");
    const sw = page.getByRole("switch", { name: "自动同步学习进度" });
    await expect(sw).toBeChecked();
    await sw.focus();
    await page.keyboard.press("Space");
    await expect(sw).not.toBeChecked();
    await page.keyboard.press("Space");
    await expect(sw).toBeChecked();
  });

  test("reduced motion: dialog appears without transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "components-dialog--interactive");
    await page.getByRole("button", { name: "删除草稿…" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Reduced motion must zero out animation/transition durations.
    const overlay = page.locator(".mf-dialog__overlay");
    const duration = await overlay.evaluate(el => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.05);
  });

  test("RTL: switch thumb mirrors via translateX sign", async ({ page }) => {
    await openStory(page, "components-switch--default", { dir: "rtl" });
    const sw = page.getByRole("switch", { name: "自动同步学习进度" });
    await expect(sw).toBeChecked();
    const thumb = page.locator(".mf-switch[data-selected] .mf-switch__thumb");
    const transform = await thumb.evaluate(el => getComputedStyle(el).transform);
    // matrix(...) with negative x translation in RTL.
    expect(transform).toMatch(/matrix\(\s*-?[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*-/);
  });

  test("long content: narrow container keeps select trigger readable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, "components-selectfield--long-content");
    const trigger = page.getByRole("button", { name: /潜点/ });
    const box = await trigger.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.width).toBeLessThanOrEqual(viewport.width - 48);
  });
});
