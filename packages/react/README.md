# @mayf3/ui-react

React implementation of the Mayf3 UI Foundation. React Aria Components owns accessible interaction behavior; Mayf3 owns the visual layer, which consumes shared `--mf-*` semantic tokens only.

## Status

The workbench uses seven components: Button, TextField, SelectField, Dialog, Tabs, Switch and StatusBadge. See the commands in [Development](#development) to run the package and browser checks.

## Workspace usage

Peer requirements: `react` / `react-dom` `>=18.2 <20`, `react-aria-components` `>=1.12 <2`.

Import the styles once at the application entry point, **after** the theme CSS:

```ts
import "@mayf3/ui-react/styles.css";
```

## Theme contract

Load order: tokens (`:root { --mf-* }`, generated from `src/tokens.json`) → theme (`src/foundation.css`) → `@mayf3/ui-react/styles.css`.

Choose theme axes at the product boundary; the axes are orthogonal:

```html
<div class="mf-theme-seaside" data-theme="light" data-density="comfortable" data-expression="expressive">
  <!-- product-owned page structure -->
</div>
```

- `data-theme`: `light | dark`
- `data-density`: `compact | comfortable | spacious`
- `data-expression`: `quiet | neutral | expressive`

The default expression is `quiet`/neutral unless set; the Mayf3 visual baseline is `expressive + comfortable`. Component CSS never hardcodes colors — dark mode, density and expression come entirely from tokens.

## Components

| Component | Key props | Notes |
| --- | --- | --- |
| `Button` | `intent`, `size`, `loading`, `isDisabled`, plus native button props | `loading` sets `aria-busy`, blocks re-trigger, keeps the accessible name |
| `TextField` | `label` (required), `description`, `errorMessage`, `size`, `inputRef`, plus React Aria field props (`value/defaultValue/onChange`, `isRequired`, `isDisabled`, `isReadOnly`) | error text is wired via `aria-describedby` + `aria-invalid` |
| `SelectField` | `label` (required), `items: {id,label}[]`, `value/defaultValue/onChange(null\|string)`, `placeholder`, `emptyMessage`, `size` | keyboard selection and popover placement by React Aria; empty state rendered in-listbox |
| `Dialog` | `isOpen/onOpenChange`, `title` (required), `description`, `footer`, `isDismissable`, `size` | focus trap/restore, Escape, scroll lock by React Aria |
| `Tabs` | `items: {id,label,content}[]`, `selectedKey/defaultSelectedKey/onSelectionChange`, `aria-label` | panels stay mounted so inner state survives tab switches |
| `Switch` | `children` (visible label), `isSelected/defaultSelected/onChange`, `isDisabled` | state via native `checked`; RTL mirrors the thumb |
| `StatusBadge` | `intent: success\|info\|warning\|danger\|neutral`, children (status text) | the dot is decorative; the text is the content |

All components accept `className` and `style`; class names compose after the built-in classes. Refs: `Button` forwards a `ref` to the native `<button>`; `TextField` exposes `inputRef` for the `<input>`.

## Product independence

The package exports components, not an AppShell or a prescribed page layout. Projects own navigation, information architecture, page composition, content, chart palettes, and product-specific patterns. Use shared components only where they fit the product task.

## Anti-patterns

- Do not bypass semantic props (`intent`, `size`) with raw CSS overrides in consumers.
- Do not use `placeholder` as a label; every field has a visible label.
- Do not place more than one `intent="primary"` Button per view.
- Do not use StatusBadge without visible status text.
- Do not reimplement focus management, keyboard navigation, or modal semantics in consumer applications.

## SSR

Components are client components built on React Aria and render fine with SSR frameworks when imported from a client entry (the package marks `"type": "module"` and ships ESM + CJS + declarations). Styles are a plain CSS import; no runtime style injection, so SSR HTML needs the same stylesheet link as the client.

## Development

```bash
pnpm install --frozen-lockfile
pnpm build              # tokens + package build (tsup: esm/cjs/dts)
pnpm verify             # build + exports + token integrity + typecheck + lint + unit tests
pnpm build:workbench    # static Storybook build
pnpm test:browser       # Playwright: keyboard/a11y/visual
pnpm dev                # live Storybook on :6006
```
