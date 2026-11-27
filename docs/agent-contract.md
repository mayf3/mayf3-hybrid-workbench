# Agent consumption contract

## Decision order
1. Identify product type and task context.
2. Preserve the product's information architecture.
3. Select a project theme (brand accent, typography personality, density, expression).
4. Select an existing component or pattern from the registry.
5. Use the approved behavior primitive for complex interactions.
6. Validate states and viewport behavior.

## Theme axes
- `color-scheme`: light | dark
- `density`: compact | comfortable | spacious
- `expression`: quiet | neutral | expressive

These axes are independent. Do not encode all three into a single named theme.

## Component API rules
Prefer semantic APIs such as `intent="primary"`, `size="md"`, and `density="compact"`. Do not expose CSS implementation values such as `bg="#..." `, `radius="13px"`, or arbitrary shadow strings.

## Visual review questions
- Can a first-time user identify the primary task and next action?
- Are related elements grouped without turning every region into a card?
- Are status, ownership, and destructive actions visually distinguishable?
- Does the layout preserve meaningful content at 390px and with long labels?
- Are keyboard focus and reduced-motion preferences respected?
- Does the product still feel like itself rather than a cloned reference site?

## Agent product patterns

Choose from the Agent patterns in the registry after identifying the present task and who owns the next action. Render task and event rows on shared surfaces. Use semantic roles for state, elevation and type. Keep public execution stage and results distinct from model reasoning. For approvals, show requester, accountable human, risk, scope and consequences before the decision, and collect explicit confirmation for high-risk approval.

A preview pattern has a real workbench implementation and review evidence. Use its [contract](AGENT_PRODUCT_COMPONENTS.md) to assess readiness before choosing a production integration. The Premium workbench uses a local simulator. Product mutations require the owning service's authority, permissions and audit.
