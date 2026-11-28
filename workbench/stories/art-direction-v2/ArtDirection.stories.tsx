import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useState } from "react";
import { I18nProvider } from "react-aria-components";
import { useAgentWorkspace } from "../premium-agent/AgentWorkspaceModel";
import { AppleWorkspace } from "./AppleWorkspace";
import { HybridWorkspace } from "./HybridWorkspace";
import { StripeWorkspace } from "./StripeWorkspace";
import { VercelWorkspace } from "./VercelWorkspace";
// Match the existing workbench's stylesheet sequence so Vite preserves its cascade.
import "../visual-directions/themes.css";
import "../visual-directions/workspace.css";
import "../sky-precision/materials.css";
import "../premium-agent/themes.css";
import "../premium-agent/premium-workspace.css";
import "../premium-agent/hybrid-refinement.css";
import "./base.css";

const directions = [
  { id: "vercel", label: "Command Center", workspace: VercelWorkspace },
  { id: "stripe", label: "Intelligence", workspace: StripeWorkspace },
  { id: "apple", label: "Spatial Workspace", workspace: AppleWorkspace },
  { id: "hybrid", label: "Mayf3 Hybrid V2", workspace: HybridWorkspace },
] as const;
const sizes = [
  { id: "desktop", label: "桌面" },
  { id: "tablet", label: "平板" },
  { id: "mobile", label: "手机" },
] as const;

type Direction = typeof directions[number]["id"];
type Width = typeof sizes[number]["id"];
type Scheme = "light" | "dark";
type Args = { direction: Direction };

function ArtDirection({ direction, theme, dir, density }: Args & {
  theme: Scheme;
  dir: "ltr" | "rtl";
  density: "compact" | "comfortable" | "spacious";
}) {
  const workspace = useAgentWorkspace(true);
  const [task, selectTask] = useState(workspace.activeTask.id);
  const [choice, choose] = useState<Direction>();
  const [scheme, setScheme] = useState<Scheme>();
  const [width, setWidth] = useState<Width>(() => innerWidth <= 520 ? "mobile" : innerWidth <= 950 ? "tablet" : "desktop");
  const active = directions.find(item => item.id === (choice ?? direction)) ?? directions[0];
  const appearance = scheme ?? theme;
  const Workspace = active.workspace;

  useLayoutEffect(() => {
    const { body, documentElement } = document;
    const attributes = {
      "data-mf-art-v2": active.id,
      "data-sky-theme": "air",
      "data-mf-surface": "precision",
      "data-mf-premium": "hybrid",
      "data-theme": appearance,
      "data-density": density,
      "data-expression": "expressive",
      dir,
    };
    const previous = Object.keys(attributes).map(name => [name, body.getAttribute(name)] as const);
    const previousDir = documentElement.dir;
    const previousLang = documentElement.lang;
    for (const [name, value] of Object.entries(attributes)) body.setAttribute(name, value);
    documentElement.dir = dir;
    documentElement.lang = "zh-CN";
    return () => {
      for (const [name, value] of previous) {
        if (value === null) body.removeAttribute(name);
        else body.setAttribute(name, value);
      }
      documentElement.dir = previousDir;
      documentElement.lang = previousLang;
    };
  }, [active.id, appearance, density, dir]);

  return (
    <I18nProvider locale={dir === "rtl" ? "ar" : "zh-CN"}>
      <div className="art-v2">
        <section className="v2-preview-controls" aria-label="V2 对照设置">
          <fieldset>
            <legend className="v2-sr">产品方向</legend>
            {directions.map(({ id, label }) => (
              <label key={id}>
                <input type="radio" name="art-v2-direction" checked={active.id === id} onChange={() => choose(id)} />
                <span lang="en">{label}</span>
              </label>
            ))}
          </fieldset>
          <div className="v2-preview-options">
            <fieldset>
              <legend className="v2-sr">预览宽度</legend>
              {sizes.map(({ id, label }) => (
                <label key={id}>
                  <input type="radio" name="art-v2-width" checked={width === id} onChange={() => setWidth(id)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" aria-pressed={appearance === "dark"} onClick={() => setScheme(appearance === "dark" ? "light" : "dark")}>深色</button>
            <a
              href={`./iframe.html?id=visual-directions-reference-study--comparison&viewMode=story&args=direction:hybrid&globals=theme:${appearance};dir:${dir};density:${density}`}
              target="_blank" rel="noreferrer"
            >旧 Hybrid</a>
          </div>
        </section>
        <div className="v2-preview-canvas" data-width={width}>
          <Workspace workspace={workspace} selectedTaskId={task} onSelectTask={selectTask} />
        </div>
      </div>
    </I18nProvider>
  );
}

const story = {
  title: "Art Direction/V2",
  args: { direction: "vercel" },
  globals: { a11y: { manual: true } },
  parameters: { layout: "fullscreen", ownsCanvas: true, controls: { disable: true }, docs: { disable: true } },
  tags: ["!autodocs"],
} satisfies Meta<Args>;

export default story;

export const Comparison: StoryObj<Args> = {
  render: ({ direction }, { globals }) => (
    <ArtDirection
      direction={direction}
      theme={globals.theme === "dark" ? "dark" : "light"}
      dir={globals.dir === "rtl" ? "rtl" : "ltr"}
      density={globals.density === "compact" || globals.density === "spacious" ? globals.density : "comfortable"}
    />
  ),
};
