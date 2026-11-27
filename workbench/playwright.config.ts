import { defineConfig } from "@playwright/test";

const port = process.env.WORKBENCH_TEST_PORT ?? "4173";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // Serial execution keeps screenshot timing deterministic on this machine.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL,
    caret: "hide",
    screenshot: "off",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 32,
      threshold: 0.06,
      animations: "disabled",
      caret: "hide",
    },
  },
  webServer: {
    command: `pnpm exec http-server storybook-static -a 127.0.0.1 -p ${port} --silent`,
    url: `${baseURL}/iframe.html`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
