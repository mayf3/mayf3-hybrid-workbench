# Design principles

## 1. Shared language, not identical pages
Foundation standardizes semantic meaning, interaction quality, accessibility, and visual rhythm. Each product retains its own information architecture, content model, and brand expression.

## 2. Semantic tokens are the public API
Reusable UI consumes semantic tokens only. Primitive colors and raw dimensions belong to token/theme definitions. A color that happens to match another role is not interchangeable with it.

## 3. Hierarchy before decoration
Use typography, spacing, alignment, grouping, and surface tone to explain structure. Borders, shadows, gradients, and motion require an explicit communication purpose.

## 4. Density is intentional
Projects choose compact, comfortable, or spacious density at the theme boundary. The default expressive showcase uses comfortable density: 40px-class controls, generous but efficient 12–20px grouping gaps, and readable content measures. Components must not independently invent heights and spacing.

## 5. Expression is a controlled axis
Expressive means a distinctive accent, richer but restrained surface contrast, tactile control feedback, and a few intentional feature moments. It does not mean gradients on every surface, excessive rounding, glow, or animation everywhere. Reserve warm/coral and lilac accents for meaningful secondary emphasis.

## 6. Behavior is not a styling problem
Complex widgets use maintained accessible primitives. Foundation components own visual language and stable APIs; primitives own keyboard, focus, and interaction mechanics.

## 7. Theme axes are orthogonal
Light/dark, density, and expression are separate decisions. A project can be dark and compact without inheriting a different brand identity.

## 8. Preserve product context
Do not flatten a map, editorial lesson, media editor, or DIY workflow into the same dashboard template. Shared patterns are opt-in and must fit the task. The expressive showcase is a component/pattern reference, not a mandatory product shell.

## 9. Motion communicates state
Use motion for continuity, confirmation, hierarchy, and spatial relationships. Prefer short transitions and clear pressed/selected states; respect reduced-motion preferences.

## 10. Evidence over assertion
A source change is not a verified visual change. Record build, automated tests, screenshot review, accessibility review, and deployment independently.

## 11. Surface and effect levels

- **L0 · Background.** Choose a stable canvas with room for text and focus indicators. A static diffuse tint or very low-opacity texture can separate the canvas from foreground surfaces. Keep contrast and motion subordinate to content. Reserve high-contrast grids and pronounced gradients for a justified focal point.
- **L1 · Product components.** Use edge highlights, contact shadows and restrained ambient shadows to signal which surfaces sit above the canvas. Use short hover or press feedback. Keep decorative beams, continuous shimmer, broad spotlights and particles out of routine controls and data regions.
- **L2 · Visual focal point.** A hero, primary action group, or critical status can use localized light, a mesh gradient or limited overlay depth where it clarifies a reading priority. Record the purpose, focal count and fallback. Sky Precision budgets one L2 region per workspace. Contextual overlays use L1 elevation.

## 12. Model components and effects together

Define anatomy, semantic tokens, behavior, states, constraints and evidence before marking a component Stable. State the testable invariants, including independent focus and selection, mirrored RTL movement, and intact labels and actions when visual effects are removed. Use screenshot review to evaluate the quality of hierarchy and material.

Reserve compositor-heavy effects for cases where the useful distinction survives their removal. Use a static surface fallback for narrow viewports and reduced motion. For an approved animated Canvas or shader, pin the version, stop work outside view and in hidden documents, and record render cost on representative hardware. See [Surface and lighting](SURFACE_LIGHTING_SYSTEM.md).

## 13. Make the Agent's work inspectable

Keep task identity, owner, lifecycle, and progress adjacent. Label the public execution stage, organize evidence by action, and put failures and retry outcomes in the same record. Use tabular numerals for elapsed times, percentages, and progress. Use one shared work surface with dividers when records belong to the same activity.

Place risk, intended change, consequence, and accountable reviewer beside an approval action. Require explicit confirmation for a high-risk decision. Keep tool input, outcome and error available independently. Prompt controls show task intent, selected context and mode before submission. See [Agent product components](AGENT_PRODUCT_COMPONENTS.md).
