#!/usr/bin/env node
/**
 * Package exports smoke test for @mayf3/ui-react.
 *
 * Verifies the exports map points at real files and that both ESM and CJS
 * builds load and export the public components. Run after `pnpm build`.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const pkgDir = path.join(ROOT, "packages/react");
const pkg = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));

let failed = false;

for (const [entry, conditions] of Object.entries(pkg.exports)) {
  const targets =
    typeof conditions === "string" ? [conditions] : Object.values(conditions);
  for (const target of targets) {
    const resolved = path.resolve(pkgDir, target);
    if (!existsSync(resolved)) {
      failed = true;
      console.error(`✗ exports "${entry}" -> ${target} does not exist`);
    } else {
      console.log(`✓ exports "${entry}" -> ${target}`);
    }
  }
}

const esmPath = pathToFileURL(path.join(pkgDir, "dist/index.js")).href;
const esm = await import(esmPath);
const expected = [
  "Button",
  "TextField",
  "SelectField",
  "Dialog",
  "Tabs",
  "Switch",
  "StatusBadge",
];
for (const name of expected) {
  // forwardRef components are objects (React 19), not functions.
  if (esm[name] == null) {
    failed = true;
    console.error(`✗ ESM missing export: ${name}`);
  } else {
    console.log(`✓ ESM exports ${name}`);
  }
}

const require = createRequire(import.meta.url);
const cjs = require(path.join(pkgDir, "dist/index.cjs"));
for (const name of expected) {
  if (cjs[name] == null) {
    failed = true;
    console.error(`✗ CJS missing export: ${name}`);
  } else {
    console.log(`✓ CJS exports ${name}`);
  }
}

process.exit(failed ? 1 : 0);
