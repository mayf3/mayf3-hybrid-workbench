import { expect, test } from "@playwright/test";
import { captureRoot, openStory, storyUrl } from "./helpers";

/**
 * Visual regression baselines.
 *
 * Matrix stories capture one stable element (`data-testid="capture"`), so the
 * canvas padding and toolbar cannot leak into diffs. Three viewports from the
 * handoff: 1440x900, 768, 390x844; themes light/dark; plus RTL and
 * expression=quiet sweeps.
 */

const VIEWPORTS = [
  { name: "1440x900", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
];

const MATRIX_STORIES = [
  "components-button--matrix",
  "components-textfield--matrix",
  "components-selectfield--matrix",
  "components-tabs--matrix",
  "components-switch--matrix",
  "components-statusbadge--matrix",
];

for (const viewport of VIEWPORTS) {
  for (const theme of ["light", "dark"] as const) {
    test(`matrix sweep ${viewport.name} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const id of MATRIX_STORIES) {
        await openStory(page, id, { theme });
        const root = captureRoot(page);
        await expect(root).toBeVisible();
        await expect(root).toHaveScreenshot(`${id}-${viewport.name}-${theme}.png`);
      }
    });
  }
}

test("select popover open state, light and dark", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const theme of ["light", "dark"] as const) {
    await openStory(page, "components-selectfield--open", { theme });
    const trigger = page.getByRole("button", { name: /潜点/ });
    await trigger.click();
    const popover = page.locator(".mf-select__popover");
    await expect(popover).toBeVisible();
    await expect(popover).toHaveScreenshot(`select-open-${theme}.png`);
    await page.keyboard.press("Escape");
  }
});

test("dialog open state, light and dark", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const theme of ["light", "dark"] as const) {
    await openStory(page, "components-dialog--static-open", { theme });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(260); // let the entrance animation settle
    await expect(dialog).toHaveScreenshot(`dialog-open-${theme}.png`);
  }
});

test("expression=quiet keeps components intact", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStory(page, "components-button--matrix", { expression: "quiet" });
  await expect(captureRoot(page)).toHaveScreenshot("button-matrix-quiet.png");
});

test("density=compact and spacious keep control heights distinct", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openStory(page, "components-button--sizes", { density: "compact" });
  const compactHeight = await page
    .getByRole("button", { name: "中" })
    .evaluate(el => el.getBoundingClientRect().height);
  await openStory(page, "components-button--sizes", { density: "spacious" });
  const spaciousHeight = await page
    .getByRole("button", { name: "中" })
    .evaluate(el => el.getBoundingClientRect().height);
  expect(compactHeight).toBeLessThan(spaciousHeight);
});

test("RTL switch state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(storyUrl("components-switch--matrix", { dir: "rtl" }));
  await page.waitForSelector("#storybook-root > *");
  const root = captureRoot(page);
  await expect(root).toHaveScreenshot("switch-matrix-rtl.png");
});
