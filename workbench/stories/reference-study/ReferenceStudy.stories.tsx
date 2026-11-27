import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useState } from "react";
import { I18nProvider } from "react-aria-components";
import { PremiumWorkspace, type WorkspaceComposition } from "../premium-agent/PremiumWorkspace";
import "../visual-directions/themes.css";
import "../visual-directions/workspace.css";
import "../sky-precision/materials.css";
import "../premium-agent/themes.css";
import "../premium-agent/premium-workspace.css";
import "../premium-agent/hybrid-refinement.css";
import "./reference.css";
import "./composition.css";

const directions = [
  { id: "vercel", label: "Vercel-inspired" },
  { id: "stripe", label: "Stripe-inspired" },
  { id: "apple", label: "Apple-inspired" },
  { id: "hybrid", label: "Mayf3 Hybrid" },
] as const;
const widths = [
  { id: "desktop", label: "桌面", width: 1440 },
  { id: "tablet", label: "平板", width: 768 },
  { id: "mobile", label: "移动", width: 390 },
] as const;

type Direction = WorkspaceComposition;
type Width = typeof widths[number]["id"];
type Scheme = "light" | "dark";
type Args = { direction: Direction };

function ReferenceStudy({ direction, scheme, density, dir }: Args & {
  scheme: Scheme;
  density: "comfortable" | "compact" | "spacious";
  dir: "ltr" | "rtl";
}) {
  const [selection, setSelection] = useState<Direction>();
  const [appearance, setAppearance] = useState<Scheme>();
  const [width, setWidth] = useState<Width>(() => innerWidth <= 520 ? "mobile" : innerWidth <= 950 ? "tablet" : "desktop");
  const active = selection ?? (directions.some(option => option.id === direction) ? direction : "hybrid");
  const colorScheme = appearance ?? scheme;

  useLayoutEffect(() => {
    const { body, documentElement } = document;
    // React Aria's portal mounts under body, alongside the canvas.
    const attributes = {
      "data-mf-reference": active,
      "data-sky-theme": "air",
      "data-mf-surface": "precision",
      "data-mf-premium": "hybrid",
      "data-mf-art-direction": "refined",
      "data-theme": colorScheme,
      "data-density": density,
      "data-expression": "expressive",
      dir,
    };
    const previous = Object.keys(attributes).map(name => [name, body.getAttribute(name)] as const);
    for (const [name, value] of Object.entries(attributes)) body.setAttribute(name, value);
    const previousLang = documentElement.lang;
    const previousDir = documentElement.dir;
    documentElement.lang = "zh-CN";
    documentElement.dir = dir;
    return () => {
      for (const [name, value] of previous) {
        if (value === null) body.removeAttribute(name);
        else body.setAttribute(name, value);
      }
      documentElement.lang = previousLang;
      documentElement.dir = previousDir;
    };
  }, [active, colorScheme, density, dir]);

  return (
    <I18nProvider locale={dir === "rtl" ? "ar" : "zh-CN"}>
      <div className="premium-comparison reference-study">
        <section className="premium-toolbar" aria-label="参考方案设置">
          <div className="premium-toolbar__row">
            <fieldset>
              <legend className="premium-sr">视觉方向</legend>
              {directions.map(({ id, label }) => (
                <label key={id}>
                  <input type="radio" name="reference-direction" checked={id === active} onChange={() => setSelection(id)} />
                  <span lang="en">{label}</span>
                </label>
              ))}
            </fieldset>
            <div className="premium-toolbar__settings">
              <fieldset>
                <legend className="premium-sr">预览宽度</legend>
                {widths.map(({ id, label, width: px }) => (
                  <label key={id} title={`${px} px`}>
                    <input type="radio" name="reference-width" checked={id === width} onChange={() => setWidth(id)} />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <button type="button" aria-pressed={colorScheme === "dark"} onClick={() => setAppearance(colorScheme === "light" ? "dark" : "light")}>深色</button>
              <a
                href={`./iframe.html?id=premium-ui--hybrid-refinement&viewMode=story&globals=theme:${colorScheme};dir:${dir};density:${density}`}
                target="_blank"
                rel="noreferrer"
                aria-label="在新标签页打开原版 Hybrid"
              >原版</a>
            </div>
          </div>
        </section>
        <div className="premium-viewport" data-layout={width}>
          <PremiumWorkspace refined composition={active} />
        </div>
      </div>
    </I18nProvider>
  );
}

const meta = {
  title: "Visual Directions/Reference Study",
  args: { direction: "hybrid" },
  globals: { a11y: { manual: true } },
  parameters: { layout: "fullscreen", ownsCanvas: true, controls: { disable: true }, docs: { disable: true } },
  tags: ["!autodocs"],
} satisfies Meta<Args>;

export default meta;

export const Comparison: StoryObj<Args> = {
  render: ({ direction }, { globals }) => (
    <ReferenceStudy
      direction={direction}
      scheme={globals.theme === "dark" ? "dark" : "light"}
      density={globals.density === "compact" || globals.density === "spacious" ? globals.density : "comfortable"}
      dir={globals.dir === "rtl" ? "rtl" : "ltr"}
    />
  ),
};
