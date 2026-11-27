import type { Page } from "@playwright/test";

export interface StoryGlobals {
  theme?: "light" | "dark";
  density?: "compact" | "comfortable" | "spacious";
  expression?: "quiet" | "neutral" | "expressive";
  dir?: "ltr" | "rtl";
}

/** Build an iframe.html URL for a story with theme-axis globals. */
export function storyUrl(id: string, globals: StoryGlobals = {}): string {
  const parts = Object.entries(globals)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`);
  const q = parts.length > 0 ? `&globals=${parts.join(";")}` : "";
  return `/iframe.html?id=${id}&viewMode=story${q}`;
}

export async function openStory(page: Page, id: string, globals: StoryGlobals = {}) {
  await page.goto(storyUrl(id, globals));
  // Wait for the story to render. Use "attached": open modals (StaticOpen)
  // mark the background story root inert, which Playwright treats as hidden.
  // RAC also emits invisible <template> nodes worth skipping.
  await page.waitForSelector("#storybook-root > :not(template)", { state: "attached" });
}

/** The capture root used by matrix stories for stable element screenshots. */
export function captureRoot(page: Page) {
  return page.getByTestId("capture");
}
