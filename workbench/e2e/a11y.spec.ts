import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openStory, type StoryGlobals } from "./helpers";

const STORY_IDS = [
  "components-button--matrix",
  "components-textfield--matrix",
  "components-selectfield--matrix",
  "components-dialog--static-open",
  "components-tabs--matrix",
  "components-switch--matrix",
  "components-statusbadge--matrix",
];

const THEMES: StoryGlobals[] = [{ theme: "light" }, { theme: "dark" }];

for (const globals of THEMES) {
  test(`axe: no serious/critical violations (${globals.theme})`, async ({ page }) => {
    // Reduced motion removes entrance animations, so axe samples final-state
    // colors (and we cover the reduced-motion a11y scenario at the same time).
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const id of STORY_IDS) {
      await openStory(page, id, globals);
      // Scan the whole document: React Aria portals (Dialog, Select popover)
      // mount outside #storybook-root and must be covered too.
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      expect(
        serious.map(v => `${id}: ${v.id} (${v.impact}) on ${v.nodes.map(n => n.target.join(" ")).join(", ")}`),
        `axe found serious/critical violations in ${globals.theme}`,
      ).toEqual([]);
    }
  });
}

test("axe: RTL matrix sweep has no serious/critical violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of ["components-button--matrix", "components-switch--matrix"]) {
    await openStory(page, id, { dir: "rtl" });
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(v => v.impact === "serious" || v.impact === "critical");
    expect(serious.map(v => `${id}: ${v.id}`)).toEqual([]);
  }
});
