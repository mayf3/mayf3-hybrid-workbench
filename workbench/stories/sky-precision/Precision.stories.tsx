import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { Button, SelectField, TextField } from "@mayf3/ui-react";
import { I18nProvider } from "react-aria-components";
import { Workspace as AgentWorkspace } from "../visual-directions/Workspace";
import { Icon } from "../visual-directions/Icon";
import "../visual-directions/themes.css";
import "../visual-directions/workspace.css";
import "./materials.css";
import "./workspace.css";
import "./comparison.css";

type Scheme = "light" | "dark";
type Dir = "ltr" | "rtl";
type Variant = "before" | "after";
type View = Variant | "both";

interface PreviewArgs {
  variant: Variant;
}

const storyPrefix = "visual-directions-sky-precision--";
const widths = [
  { key: "desktop", width: 1440, label: "桌面" },
  { key: "tablet", width: 768, label: "平板" },
  { key: "mobile", width: 390, label: "移动" },
] as const;
type Width = (typeof widths)[number];

function PrecisionCanvas({ variant, scheme, dir, children }: {
  variant: Variant; scheme: Scheme; dir: Dir; children: ReactNode;
}) {
  useLayoutEffect(() => {
    // Body is the React Aria portal host inside this isolated Storybook canvas.
    const body = document.body;
    const html = document.documentElement;
    const langBefore = html.lang;
    const dirBefore = html.dir;
    body.dataset.skyTheme = "air";
    body.dataset.theme = scheme;
    body.dataset.density = "comfortable";
    body.dataset.expression = "expressive";
    if (variant === "after") body.dataset.mfSurface = "precision";
    body.dir = dir;
    html.lang = "zh-CN";
    html.dir = dir;
    return () => {
      for (const name of ["data-sky-theme", "data-theme", "data-density", "data-expression", "data-mf-surface", "dir"]) {
        body.removeAttribute(name);
      }
      html.lang = langBefore;
      html.dir = dirBefore;
    };
  }, [variant, scheme, dir]);
  return <I18nProvider locale={dir === "rtl" ? "ar" : "zh-CN"}>{children}</I18nProvider>;
}

function canvasUrl(story: string, variant: Variant, scheme: Scheme, dir: Dir) {
  return `./iframe.html?id=${storyPrefix}${story}&viewMode=story&args=variant:${variant}&globals=theme:${scheme};dir:${dir}`;
}

function ComparisonWorkbench({ initialScheme, dir }: { initialScheme: Scheme; dir: Dir }) {
  const [view, setView] = useState<View>("after");
  const [schemeOverride, setScheme] = useState<Scheme>();
  const [width, setWidth] = useState<Width>(() => {
    if (window.matchMedia("(max-width: 520px)").matches) return widths[2];
    if (window.matchMedia("(max-width: 1024px)").matches) return widths[1];
    return widths[0];
  });
  const scheme = schemeOverride ?? initialScheme;
  return (
    <PrecisionCanvas variant="before" scheme={scheme} dir={dir}>
      <div className="precision-review">
        <header className="precision-review__header">
          <div className="precision-review__identity">
            <Icon name="compare" />
            <div>
              <h1>Sky Precision</h1>
              <p>同一工作区的表面、排版和交互对照</p>
            </div>
          </div>
          <div className="precision-review__controls">
            <fieldset>
              <legend>视觉版本</legend>
              <div>
                {([["before", "精修前"], ["after", "精修后"], ["both", "并排"]] as const).map(([value, label]) => (
                  <label key={value}><input type="radio" name="precision-view" checked={view === value} onChange={() => setView(value)} /><span>{label}</span></label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>视口宽度</legend>
              <div>
                {widths.map(size => (
                  <label key={size.key}><input type="radio" name="precision-width" checked={size.key === width.key} onChange={() => setWidth(size)} /><span>{size.label} {size.width}</span></label>
                ))}
              </div>
            </fieldset>
            <button type="button" className="precision-review__scheme" aria-pressed={scheme === "dark"} onClick={() => setScheme(scheme === "light" ? "dark" : "light")}>
              <Icon name={scheme === "light" ? "sun" : "moon"} /> 深色模式
            </button>
            <a href={canvasUrl("control-states", "after", scheme, dir)} target="_blank" rel="noreferrer">控件状态 <Icon name="arrow" /></a>
          </div>
        </header>
        <main className="precision-review__panes" data-view={view} data-width={width.key}>
          {(["before", "after"] as const).map(variant => {
            const label = variant === "before" ? "精修前 · Sky Air" : "精修后 · Sky Precision";
            const visible = view === "both" || view === variant;
            return (
              <section className="precision-review__pane" aria-label={label} hidden={!visible} key={variant}>
                {view === "both" && <h2>{label}</h2>}
                <iframe src={canvasUrl("workspace", variant, scheme, dir)} title={label} loading="lazy" />
              </section>
            );
          })}
        </main>
      </div>
    </PrecisionCanvas>
  );
}

function ControlStateExamples() {
  return (
    <main className="precision-state-sheet" aria-labelledby="precision-states-title">
      <h1 id="precision-states-title">控件状态</h1>
      <section className="precision-state-panel" aria-labelledby="precision-buttons-title">
        <h2 id="precision-buttons-title">按钮</h2>
        <div className="precision-state-buttons">
          <Button>提交</Button>
          <Button intent="secondary">复核</Button>
          <Button intent="quiet">详情</Button>
          <Button intent="danger">清除</Button>
          <Button isDisabled>不可用</Button>
          <Button loading>提交中</Button>
        </div>
      </section>
      <section className="precision-state-panel" aria-labelledby="precision-inputs-title">
        <h2 id="precision-inputs-title">文本输入与选择</h2>
        <div className="precision-state-inputs">
          <TextField label="默认" placeholder="输入工作区名称" />
          <TextField label="可编辑" defaultValue="Mayf3 Agent" />
          <TextField label="验证错误" defaultValue="Agent 测试" errorMessage="请输入小写字母和连字符。" />
          <TextField label="只读" defaultValue="Mayf3 Agent" isReadOnly />
          <TextField label="禁用" defaultValue="Mayf3 Agent" isDisabled />
          <SelectField label="负责人" items={[{ id: "a", label: "Agent A" }, { id: "b", label: "Agent B" }]} defaultValue="a" />
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: "Visual Directions/Sky Precision",
  args: { variant: "after" },
  parameters: { layout: "fullscreen", ownsCanvas: true, controls: { disable: true }, docs: { disable: true } },
  globals: { a11y: { manual: true } },
  tags: ["!autodocs"],
} satisfies Meta<PreviewArgs>;

export default meta;
type Story = StoryObj<PreviewArgs>;

function axes(globals: Record<string, unknown>): { scheme: Scheme; dir: Dir } {
  return { scheme: globals.theme === "dark" ? "dark" : "light", dir: globals.dir === "rtl" ? "rtl" : "ltr" };
}

export const Comparison: Story = {
  render: (_, { globals }) => {
    const { scheme, dir } = axes(globals);
    return <ComparisonWorkbench initialScheme={scheme} dir={dir} />;
  },
};

export const Workspace: Story = {
  render: ({ variant }, { globals }) => (
    <PrecisionCanvas variant={variant} {...axes(globals)}>
      <div className="sky-comparison">
        <div className="sky-viewport"><AgentWorkspace precision={variant} /></div>
      </div>
    </PrecisionCanvas>
  ),
};

export const ControlStates: Story = {
  name: "Control States",
  render: ({ variant }, { globals }) => (
    <PrecisionCanvas variant={variant} {...axes(globals)}><ControlStateExamples /></PrecisionCanvas>
  ),
};
