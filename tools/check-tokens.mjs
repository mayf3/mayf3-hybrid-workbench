#!/usr/bin/env node
/** Check shared token references, precision material recipes and raw colors. */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = file => readFileSync(path.join(ROOT, file), "utf8");

const precisionDir = "workbench/stories/sky-precision";
const precisionMaterial = `${precisionDir}/materials.css`;
const precisionConsumers = readdirSync(path.join(ROOT, precisionDir))
  .filter(file => file.endsWith(".css") && file !== "materials.css")
  .map(file => `${precisionDir}/${file}`);

const premiumDir = "workbench/stories/premium-agent";
const premiumThemes = `${premiumDir}/themes.css`;
const premiumConsumers = readdirSync(path.join(ROOT, premiumDir))
  .filter(file => file.endsWith(".css") && file !== "themes.css")
  .map(file => `${premiumDir}/${file}`);

const artDirectionDir = "workbench/stories/art-direction-v2";
const artDirectionStyles = readdirSync(path.join(ROOT, artDirectionDir))
  .filter(file => file.endsWith(".css"))
  .map(file => `${artDirectionDir}/${file}`);

const componentStyles = [
  ...artDirectionStyles,
  "packages/react/src/styles.css",
  "workbench/stories/visual-directions/controls.css",
  "workbench/stories/visual-directions/workspace.css",
  "workbench/stories/reference-study/reference.css",
  "workbench/stories/reference-study/composition.css",
  ...precisionConsumers,
  ...premiumConsumers,
];
const tokenSources = [
  "workbench/.generated/tokens.css",
  "src/foundation.css",
  "workbench/stories/visual-directions/themes.css",
  precisionMaterial,
  premiumThemes,
];
const cssFiles = new Map([...tokenSources, ...componentStyles].map(file => [file, read(file)]));

const defined = new Set(["--mf-trigger-width", "--mf-tab-marker-x", "--mf-tab-marker-width"]);
for (const css of cssFiles.values()) {
  for (const match of css.matchAll(/(--mf-[\w-]+)\s*:/g)) defined.add(match[1]);
}

const errors = [];
let consumedCount = 0;
for (const [file, css] of cssFiles) {
  for (const [, name] of css.matchAll(/var\((--mf-[\w-]+)/g)) {
    consumedCount += 1;
    if (!defined.has(name)) errors.push(`${file}: missing token ${name}`);
  }
}

/* CSS named colors. Exclude compositional keywords currentcolor/transparent,
   which derive from the owning semantic role or intentionally add no ink. */
const namedColors = new Set(`
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown
  burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan
  darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid
  darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet
  deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro
  ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
  lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow
  lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine
  mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise
  mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab
  orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru
  pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
  seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan
  teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`.trim().split(/\s+/));

const rawColor = /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|device-cmyk)\(/i;
for (const file of componentStyles) {
  const css = cssFiles.get(file).replace(/\/\*[^]*?\*\//g, "");
  for (const [, property, value] of css.matchAll(/([\w-]+)\s*:\s*([^{};]+)(?:;|(?=\}))/g)) {
    const expression = value.replace(/--[\w-]+|"[^"]*"|'[^']*'/g, "");
    const words = [...expression.toLowerCase().matchAll(/(?<![\w-])[a-z]+(?![\w(-])/g)];
    if (rawColor.test(expression) || words.some(([word]) => namedColors.has(word))) {
      errors.push(`${file}: raw color in ${property}: ${value.trim()}`);
    }
  }
}

const tokens = JSON.parse(read("src/tokens.json"));
const required = [
  "surface-canvas", "surface-default", "surface-raised", "surface-sunken",
  "surface-tint", "surface-highlight", "surface-glass", "surface-focal-light",
  "edge-highlight", "edge-subtle", "edge-strong", "edge-light-top",
  "material-opacity", "material-blur", "material-noise-opacity", "material-reflection",
  "motion-duration-fast", "motion-duration-normal", "motion-duration-slow",
  "motion-ease-standard", "motion-ease-spring",
];
for (const key of required) {
  if (!tokens[key]?.trim()) errors.push(`src/tokens.json: missing ${key}`);
}

const premiumRoles = [
  ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(step => `blue-${step}`),
  ...["canvas", "surface", "raised", "sunken", "text-primary", "text-secondary", "text-muted", "border-subtle", "border-default"]
    .map(role => `premium-neutral-${role}`),
  ...["chip", "control", "card", "panel", "window", "pill"].map(role => `premium-radius-${role}`),
  ...["hairline", "button", "card", "raised", "overlay"].map(role => `premium-elevation-${role}`),
  ...["display", "heading", "body", "caption", "label", "mono", "numeric"].map(role => `premium-type-${role}`),
  "premium-numeric-variant",
];
for (const key of premiumRoles) {
  if (!tokens[key]?.trim()) errors.push(`src/tokens.json: missing ${key}`);
}
for (const file of componentStyles) {
  if (/var\(--mf-blue-\d+/.test(cssFiles.get(file))) errors.push(`${file}: use a semantic role instead of a raw blue scale step`);
}

const elevationParts = ["sm", "md", "lg"];
if (tokens["elevation-0"] !== "none") errors.push("elevation-0 must have no shadow");
for (const [index, size] of elevationParts.entries()) {
  const level = index + 1;
  const layers = [
    "var(--mf-edge-light-top)",
    `var(--mf-shadow-contact-${size})`,
    `var(--mf-shadow-ambient-${size})`,
  ];
  if (tokens[`elevation-${level}`]?.split(",").map(part => part.trim()).join() !== layers.join()) {
    errors.push(`elevation-${level} must compose top edge, ${size} contact and ${size} ambient shadows in that order`);
  }
  for (const type of ["contact", "ambient"]) {
    if (!tokens[`shadow-${type}-${size}`]?.includes(`var(--mf-shadow-${type}-ink)`)) {
      errors.push(`shadow-${type}-${size} must use its own ink token`);
    }
  }
}

if (errors.length) {
  console.error([...new Set(errors)].map(error => `✗ ${error}`).join("\n"));
  process.exit(1);
}

console.log(`✓ all consumed --mf-* tokens are defined (${consumedCount} references)`);
console.log("✓ no raw color literals in component CSS");
console.log("✓ surface, material, motion and elevation recipes are declared");
