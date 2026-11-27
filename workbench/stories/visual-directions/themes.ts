export const directions = [
  {
    id: "air",
    name: "Sky Air",
    description: "淡蓝与白面的清透层次。用柔边、短投影和细高光勾勒控件。",
  },
  {
    id: "editorial",
    name: "Sky Editorial",
    description: "衬线标题、印刷感细线和克制的直角，突出内容层级。",
  },
  {
    id: "aurora",
    name: "Sky Aurora",
    description: "冰蓝、青色和淡紫在特色面板与选中底板上轻微交叠。",
  },
  {
    id: "tech",
    name: "Sky Tech",
    description: "电蓝刻度、等宽读数和清晰的表格分界，接近仪表界面。",
  },
  {
    id: "warm",
    name: "Sky Warm",
    description: "天蓝保留操作主色，暖白与琥珀给表面和指标带来纸感。",
  },
  {
    id: "bloom",
    name: "Sky Bloom",
    description: "圆润字形、胶囊控件和柔和紫蓝面板，保留清晰的操作层次。",
  },
] as const;

export type SkyDirection = (typeof directions)[number]["id"];

export const tokenRows = [
  { label: "画布", token: "--mf-color-surface-canvas", kind: "color" },
  { label: "表面", token: "--mf-color-surface-default", kind: "color" },
  { label: "主色", token: "--mf-color-accent-default", kind: "color" },
  { label: "主色悬停", token: "--mf-color-accent-hover", kind: "color" },
  { label: "次要色面", token: "--sky-secondary-surface", kind: "color" },
  { label: "指标强调", token: "--sky-metric-mark", kind: "color" },
  { label: "导航选中", token: "--sky-nav-selected", kind: "paint" },
  { label: "特色面板", token: "--sky-feature-background", kind: "paint" },
  { label: "标题字体", token: "--sky-display-font", kind: "value" },
  { label: "指标数字字体", token: "--sky-metric-number-font", kind: "value" },
  { label: "控件圆角", token: "--sky-control-radius", kind: "value" },
  { label: "面板圆角", token: "--sky-panel-radius", kind: "value" },
  { label: "面板阴影", token: "--sky-panel-shadow", kind: "value" },
  { label: "特色面板标线", token: "--sky-feature-rule", kind: "value" },
  { label: "轨迹圆角", token: "--sky-orbit-radius", kind: "value" },
  { label: "轨迹倾角", token: "--sky-orbit-tilt", kind: "value" },
] as const;
