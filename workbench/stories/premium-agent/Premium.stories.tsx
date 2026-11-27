import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useState } from "react";
import { I18nProvider } from "react-aria-components";
import { Icon } from "../visual-directions/Icon";
import { PremiumWorkspace } from "./PremiumWorkspace";
import "../visual-directions/themes.css";
import "../visual-directions/workspace.css";
import "../sky-precision/materials.css";
import "./themes.css";
import "./premium-workspace.css";
import "./hybrid-refinement.css";

const directions = [
  { id: "untitled", label: "Untitled-inspired" },
  { id: "beautiful", label: "Beautiful-inspired" },
  { id: "hybrid", label: "Mayf3 Hybrid" },
] as const;
type Direction = (typeof directions)[number]["id"];
type Scheme = "light" | "dark";
type Density = "comfortable" | "compact";
type Layout = "desktop" | "tablet" | "mobile";

const revisions = [
  { id: "original", label: "精修前" },
  { id: "refined", label: "本轮精修" },
] as const;
type Revision = (typeof revisions)[number]["id"];
type PreviewArgs = { direction: Direction; revision?: Revision };

const widths = [
  { id: "desktop", label: "桌面", width: 1440 },
  { id: "tablet", label: "平板", width: 768 },
  { id: "mobile", label: "移动", width: 390 },
] as const;

function Comparison({
  initialDirection, initialScheme, initialDensity, dir, initialRevision,
}: {
  initialDirection: Direction; initialScheme: Scheme; initialDensity: Density; dir: "ltr" | "rtl";
  initialRevision?: Revision;
}) {
  const [direction, setDirection] = useState(initialDirection);
  const [revision, setRevision] = useState(initialRevision);
  const isHybridReview = initialRevision !== undefined;
  const refined = isHybridReview && revision === "refined";
  const [scheme, setScheme] = useState<Scheme>();
  const [density, setDensity] = useState<Density>();
  const [layout, setLayout] = useState<Layout>(() => (
    innerWidth <= 520 ? "mobile" : innerWidth <= 950 ? "tablet" : "desktop"
  ));
  const activeScheme = scheme ?? initialScheme;
  const activeDensity = density ?? initialDensity;

  useLayoutEffect(() => {
    // React Aria portals render beside the canvas. They need the same scope.
    const body = document.body;
    const html = document.documentElement;
    const previousLang = html.lang;
    const previousDir = html.dir;
    body.dataset.skyTheme = "air";
    body.dataset.mfSurface = "precision";
    body.dataset.mfPremium = direction;
    if (refined) body.dataset.mfArtDirection = "refined";
    body.dataset.theme = activeScheme;
    body.dataset.density = activeDensity;
    body.dataset.expression = "expressive";
    body.dir = dir;
    html.lang = "zh-CN";
    html.dir = dir;
    return () => {
      for (const name of ["data-sky-theme", "data-mf-surface", "data-mf-premium", "data-mf-art-direction", "data-theme", "data-density", "data-expression", "dir"]) {
        body.removeAttribute(name);
      }
      html.lang = previousLang;
      html.dir = previousDir;
    };
  }, [activeDensity, activeScheme, dir, direction, refined]);

  return (
    <I18nProvider locale={dir === "rtl" ? "ar" : "zh-CN"}>
      <div className="premium-comparison">
        <section className="premium-toolbar" aria-label="视觉对照设置">
          <div className="premium-toolbar__row">
            <span className="premium-toolbar__title"><Icon name="compare" /> {isHybridReview ? "Mayf3 Hybrid" : "视觉对照"}</span>
            {isHybridReview ? (
              <fieldset>
                <legend className="premium-sr">精修版本</legend>
                {revisions.map(({ id, label }) => (
                  <label key={id}><input type="radio" name="premium-revision" checked={revision === id} onChange={() => setRevision(id)} /><span>{label}</span></label>
                ))}
              </fieldset>
            ) : <fieldset>
              <legend className="premium-sr">视觉方向</legend>
              {directions.map(({ id, label }) => (
                <label key={id}><input type="radio" name="premium-direction" checked={direction === id} onChange={() => setDirection(id)} /><span lang="en">{label}</span></label>
              ))}
            </fieldset>}
            <div className="premium-toolbar__settings">
              <fieldset>
                <legend className="premium-sr">预览宽度</legend>
                {widths.map(({ id, label, width }) => (
                  <label key={id} title={`${width} px`}><input type="radio" name="premium-size" checked={id === layout} onChange={() => setLayout(id)} /><span>{label}</span></label>
                ))}
              </fieldset>
              <button type="button" aria-pressed={activeDensity === "compact"} onClick={() => setDensity(activeDensity === "compact" ? "comfortable" : "compact")}>紧凑</button>
              <button type="button" aria-pressed={activeScheme === "dark"} onClick={() => setScheme(activeScheme === "dark" ? "light" : "dark")}>深色</button>
              {!isHybridReview && <a href="./iframe.html?id=visual-directions-sky-precision--workspace&viewMode=story&args=variant:after" target="_blank" rel="noreferrer">精修前 <Icon name="arrow" /></a>}
            </div>
          </div>
        </section>
        <div className="premium-viewport" data-layout={layout} data-testid="premium-viewport">
          <PremiumWorkspace refined={refined} />
        </div>
      </div>
    </I18nProvider>
  );
}

const meta = {
  title: "Premium UI",
  args: { direction: "hybrid" },
  globals: { a11y: { manual: true } },
  parameters: { layout: "fullscreen", ownsCanvas: true, controls: { disable: true }, docs: { disable: true } },
  tags: ["!autodocs"],
} satisfies Meta<PreviewArgs>;

export default meta;

export const SourceInspiredComparison: StoryObj<PreviewArgs> = {
  name: "Source-inspired Comparison",
  render: ({ direction }, { globals }) => (
    <Comparison
      key={direction}
      initialDirection={direction}
      initialScheme={globals.theme === "dark" ? "dark" : "light"}
      initialDensity={globals.density === "compact" ? "compact" : "comfortable"}
      dir={globals.dir === "rtl" ? "rtl" : "ltr"}
    />
  ),
};

export const HybridRefinement: StoryObj<PreviewArgs> = {
  name: "Hybrid Refinement",
  args: { revision: "refined" },
  render: ({ revision }, { globals }) => (
    <Comparison
      key={revision}
      initialDirection="hybrid"
      initialRevision={revision === "original" ? "original" : "refined"}
      initialScheme={globals.theme === "dark" ? "dark" : "light"}
      initialDensity={globals.density === "compact" ? "compact" : "comfortable"}
      dir={globals.dir === "rtl" ? "rtl" : "ltr"}
    />
  ),
};
