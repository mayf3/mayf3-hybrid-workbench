import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  core: { disableTelemetry: true },
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async config => {
    config.resolve = config.resolve ?? {};
    // Always work against package sources so the workbench reflects edits
    // without a rebuild of @mayf3/ui-react/dist. Object keys keep insertion
    // order, so the more specific styles.css alias comes first.
    config.resolve.alias = {
      "@mayf3/ui-react/styles.css": new URL(
        "../../packages/react/src/styles.css",
        import.meta.url,
      ).pathname,
      "@mayf3/ui-react": new URL("../../packages/react/src/index.ts", import.meta.url).pathname,
    };
    return config;
  },
};

export default config;
