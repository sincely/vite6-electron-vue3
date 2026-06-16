---
name: frontend-arch-reader
description: "Scan frontend project source code and generate architecture diagrams as SVGs. Covers layered architecture, module dependency topology, feature sequence flow, data model, state flow, route flow, auth guard, external deps, and component lifecycle diagrams."
---

# Frontend Architecture Reader

Reads a frontend project's source code and produces structured architecture diagrams saved as SVG under `./docs/`.

## Workflow

1. Determine which diagram(s) the user needs (default: all applicable).
2. Scan project source — imports, router config, store definitions, API calls, permission guards, `package.json`, `.env` files.
3. Build adjacency tables, dependency graphs, or decision trees from **real code only**.
4. Load the matching reference file and the skin spec before generating.
5. Run `scripts/svg-gen.mjs` to scaffold SVG layout, or write inline SVG.
6. Save to `./docs/<diagram-name>.svg`.

## Diagram Types

| Type | Output | Reference |
|------|--------|-----------|
| Layered Architecture | `frontend-architecture.svg` | [references/architecture.md](references/architecture.md) |
| Module Dependency | `module-deps.svg` | [references/module-deps.md](references/module-deps.md) |
| Feature Sequence | `sequence-<feature>.svg` | [references/sequence.md](references/sequence.md) |
| Data Model | `data-model.svg` | [references/data-model.md](references/data-model.md) |
| State Flow | `state-<component>.svg` | [references/state-flow.md](references/state-flow.md) |
| Route Flow | `route-flow.svg` | [references/route-flow.md](references/route-flow.md) |
| Auth Guard | `auth-guard.svg` | [references/auth-guard.md](references/auth-guard.md) |
| External Dependencies | `external-deps.svg` | [references/external-deps.md](references/external-deps.md) |
| Component Lifecycle | `lifecycle-<component>.svg` | [references/lifecycle.md](references/lifecycle.md) |

## SVG Skin

**Mandatory** — load [references/svg-skin.md](references/svg-skin.md) before any SVG output. All diagrams share this unified visual spec.

## Hard Rules

- All analysis based on **real source code**; never guess or assume.
- Node count within specified limits (10–20 for module deps).
- Detect and highlight circular dependencies with red dashed bold lines.
- Use `foreignObject` for multi-line text; compute width/height per skin formula.
- Output dir is `./docs/`; create if missing.
