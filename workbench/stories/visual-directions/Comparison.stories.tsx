import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useRef, useState } from "react";
import { I18nProvider } from "react-aria-components";
import { Icon } from "./Icon";
import { Workspace } from "./Workspace";
import { directions, tokenRows, type SkyDirection } from "./themes";
import "./themes.css";
import "./workspace.css";

type Mode = "light" | "dark";
type Density = "compact" | "comfortable" | "spacious";
type Viewport = "desktop" | "mobile";

interface ComparisonProps {
  direction: SkyDirection;
  globalTheme: Mode;
  density: Density;
  dir: "ltr" | "rtl";
}

function TokenMatrix({ mode, selected }: { mode: Mode; selected: SkyDirection }) {
  const tableRef = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    for (const cell of tableRef.current?.querySelectorAll<HTMLElement>("[data-token]") ?? []) {
      const probe = cell.querySelector("i");
      const output = cell.querySelector("code");
      if (!output || !cell.dataset.token) continue;
      output.textContent = probe
        ? getComputedStyle(probe).color
        : getComputedStyle(cell).getPropertyValue(cell.dataset.token).trim();
    }
  }, [mode]);
  return (
    <div className="sky-token-scroll" tabIndex={0} role="region" aria-label="六套方案 Token 差异">
      <table className="sky-token-table" ref={tableRef}>
        <thead><tr><th scope="col">语义 Token</th>{directions.map(item => <th scope="col" key={item.id} data-active={item.id === selected || undefined}>{item.name}</th>)}</tr></thead>
        <tbody>
          {tokenRows.map(({ label, token, kind }) => (
            <tr key={token}>
              <th scope="row">{label}<code>{token}</code></th>
              {directions.map(item => (
                <td data-sky-theme={item.id} data-theme={mode} data-token={token} key={item.id}>
                  {kind === "color" && <i aria-hidden="true" style={{ color: `var(${token})` }} />}
                  <code />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonCanvas({ direction, globalTheme, density, dir }: ComparisonProps) {
  const [selected, setSelected] = useState(() => directions.find(item => item.id === direction)?.id ?? "air");
  const [modeOverride, setModeOverride] = useState<Mode>();
  const [viewport, setViewport] = useState<Viewport>(() => window.matchMedia("(max-width: 470px)").matches ? "mobile" : "desktop");
  const [inspectTokens, setInspectTokens] = useState(false);
  const mode = modeOverride ?? globalTheme;
  const current = directions.find(item => item.id === selected);

  useLayoutEffect(() => {
    // Each Storybook canvas has its own document. React Aria renders portals
    // under body, so the same semantic scope reaches overlays and the workspace.
    const body = document.body;
    const html = document.documentElement;
    const previousLang = html.lang;
    const previousDir = html.dir;
    body.dataset.skyTheme = selected;
    body.dataset.theme = mode;
    body.dataset.density = density;
    body.dataset.expression = "expressive";
    body.dir = dir;
    html.lang = "zh-CN";
    html.dir = dir;
    return () => {
      for (const attribute of ["data-sky-theme", "data-theme", "data-density", "data-expression", "dir"]) body.removeAttribute(attribute);
      html.lang = previousLang;
      html.dir = previousDir;
    };
  }, [selected, mode, density, dir]);

  return (
    <I18nProvider locale={dir === "rtl" ? "ar" : "zh-CN"}>
      <div className="sky-comparison">
        <section className="sky-compare-bar" aria-label="视觉方案对照">
          <div className="sky-compare-inner">
            <div className="sky-compare-title"><Icon name="compare" /><span>视觉方案对照</span></div>
            <fieldset className="sky-choices">
              <legend className="sky-visually-hidden">视觉方案</legend>
              {directions.map(item => (
                <label key={item.id}>
                  <input type="radio" name="sky-direction" value={item.id} checked={item.id === selected} onChange={() => setSelected(item.id)} />
                  <span lang="en">{item.name}</span>
                </label>
              ))}
            </fieldset>
            <div className="sky-compare-options">
              <fieldset className="sky-options">
                <legend className="sky-visually-hidden">画布宽度</legend>
                <label><input type="radio" name="sky-size" checked={viewport === "desktop"} onChange={() => setViewport("desktop")} /><span>桌面</span></label>
                <label><input type="radio" name="sky-size" checked={viewport === "mobile"} onChange={() => setViewport("mobile")} /><span>移动</span></label>
              </fieldset>
              <button className="sky-mode" type="button" aria-pressed={mode === "dark"} onClick={() => setModeOverride(mode === "light" ? "dark" : "light")}>
                <Icon name={mode === "light" ? "sun" : "moon"} /><span>深色模式</span>
              </button>
            </div>
          </div>
          <details className="sky-compare-details" onToggle={event => setInspectTokens(event.currentTarget.open)}>
            <summary><span>{current?.description}</span><span className="sky-compare-token-label">查看 Token 差异 <Icon name="expand" /></span></summary>
            {inspectTokens && <TokenMatrix mode={mode} selected={selected} />}
          </details>
        </section>
        <div className="sky-viewport" data-viewport={viewport} data-testid="sky-viewport">
          <Workspace />
        </div>
      </div>
    </I18nProvider>
  );
}

const meta = {
  title: "Visual Directions/Sky Blue",
  parameters: {
    layout: "fullscreen",
    ownsCanvas: true,
    controls: { disable: true },
  },
  // Keep the addon available on demand. Playwright sweeps the same document
  // independently, including transient body portals.
  globals: { a11y: { manual: true } },
  tags: ["!autodocs"],
  args: { direction: "air", globalTheme: "light", density: "comfortable", dir: "ltr" },
  render: (args, context) => (
    <ComparisonCanvas
      key={args.direction}
      direction={args.direction}
      globalTheme={context.globals.theme === "dark" ? "dark" : "light"}
      density={context.globals.density ?? "comfortable"}
      dir={context.globals.dir === "rtl" ? "rtl" : "ltr"}
    />
  ),
} satisfies Meta<ComparisonProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
  name: "Comparison",
  // Keep a stable deep link for screenshot runs and local review.
  parameters: { docs: { disable: true } },
};
