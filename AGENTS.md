# UI Foundation Agent Contract

Before editing UI:
1. Read this file, `docs/design-principles.md`, `docs/agent-contract.md`, and `registry/components.json`.
2. Inspect the consumer's current DOM, styles, layout, interaction states, and tests. Do not infer from screenshots alone.
3. Reuse an existing component/pattern; explain why a new abstraction is necessary.
4. Use semantic tokens. No raw hex, arbitrary radius, shadow, spacing, or z-index in reusable components.
5. Do not reimplement complex accessible widgets; use an approved primitive adapter.
6. Preserve product information architecture, content, routes, and behavior unless the task explicitly changes them.
7. Never silently change a published release. Create a new immutable version and explicit consumer upgrade.
8. Avoid generic shadcn appearance, decorative card grids, gratuitous gradients/glass/shadows, and motion without a comprehension purpose.
9. Use logical properties; test long text, narrow viewport, keyboard focus, and reduced motion.
10. Do not claim visual verification from typecheck/build alone.

Required report:
- files changed and design rationale;
- token/component/pattern reused or added;
- build, unit, accessibility, and screenshot test results (mark not run);
- desktop/mobile visual diff and known limitations;
- whether consumer upgrade or production deployment occurred.

When building an Agent workspace, read [Agent product components](docs/AGENT_PRODUCT_COMPONENTS.md) after identifying the use case. Prefer registered task, approval, tool and delivery patterns. Keep execution status public, risk and accountability adjacent to approvals, and related records on one surface. Treat the workbench simulator as review evidence.
