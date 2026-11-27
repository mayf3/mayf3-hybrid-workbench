#!/usr/bin/env node
/**
 * Generate workbench theme CSS from src/tokens.json.
 *
 * Output is generated (not committed): workbench/.generated/tokens.css
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const tokens = JSON.parse(readFileSync(path.join(ROOT, "src/tokens.json"), "utf8"));

const lines = Object.entries(tokens).map(([key, value]) => `  --mf-${key}: ${value};`);
const css = `/* Generated from src/tokens.json by tools/generate-theme-css.mjs. Do not edit. */\n:root {\n${lines.join("\n")}\n}\n`;

const outDir = path.join(ROOT, "workbench/.generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "tokens.css"), css);
console.log(`tokens.css written: ${Object.keys(tokens).length} tokens -> workbench/.generated/tokens.css`);
