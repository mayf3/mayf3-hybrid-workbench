import type { Preview } from "@storybook/react-vite";
import { useLayoutEffect } from "react";

// CSS load order matters: shared tokens -> theme (density/expression/dark) -> component styles.
import "../.generated/tokens.css";
import "../../src/foundation.css";
import "@mayf3/ui-react/styles.css";
import "./preview.css";

const preview: Preview = {
  // Keep the interactive panel available without racing Playwright's axe run.
  initialGlobals: { a11y: { manual: true } },
  globalTypes: {
    theme: {
      description: "Color scheme axis (data-theme)",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Density axis (data-density)",
      defaultValue: "comfortable",
      toolbar: {
        title: "Density",
        icon: "grid",
        items: [
          { value: "compact", title: "Compact" },
          { value: "comfortable", title: "Comfortable" },
          { value: "spacious", title: "Spacious" },
        ],
        dynamicTitle: true,
      },
    },
    expression: {
      description: "Expression axis (data-expression)",
      defaultValue: "expressive",
      toolbar: {
        title: "Expression",
        icon: "paintbrush",
        items: [
          { value: "quiet", title: "Quiet" },
          { value: "neutral", title: "Neutral" },
          { value: "expressive", title: "Expressive" },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: "Text direction",
      defaultValue: "ltr",
      toolbar: {
        title: "Direction",
        icon: "transfer",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    options: {
      storySort: {
        order: ["Premium UI", ["Hybrid Refinement", "Source-inspired Comparison"]],
        includeNames: true,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const { theme, density, expression, dir } = context.globals as Record<string, string>;
      const ownsCanvas = context.parameters.ownsCanvas === true;
      // Theme axes live on <body>: React Aria portals (Modal, Popover) mount
      // there, so body-level theming is the only way portal content inherits
      // the axes. This mirrors the documented product usage (theme class on
      // the app shell root, typically <body>).
      useLayoutEffect(() => {
        if (ownsCanvas) return;
        const body = document.body;
        body.classList.add("mf-theme-seaside", "mf-canvas");
        // Inline: Storybook's runtime-injected layout styles fight the
        // stylesheet for body padding; inline wins the cascade deterministically.
        body.style.padding = "var(--mf-space-6)";
        body.style.boxSizing = "border-box";
        body.style.minHeight = "100vh";
        body.dataset.theme = theme;
        body.dataset.density = density;
        body.dataset.expression = expression;
        body.dir = dir;
        return () => {
          body.classList.remove("mf-theme-seaside", "mf-canvas");
          for (const property of ["padding", "box-sizing", "min-height"]) body.style.removeProperty(property);
          for (const attribute of ["data-theme", "data-density", "data-expression", "dir"]) body.removeAttribute(attribute);
        };
      }, [theme, density, expression, dir, ownsCanvas]);
      return <Story />;
    },
  ],
} satisfies Preview;

export default preview;
