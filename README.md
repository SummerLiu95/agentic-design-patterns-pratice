# Agentic Design Patterns Practice

A minimal Bun workspace monorepo for practicing agentic design patterns with LangChain.

## Current Structure

```text
.
├── apps/
│   └── prompt-chaining/
├── docs/
│   └── exec-plans/
├── AGENTS.md
├── ARCHITECTURE.md
├── biome.json
├── bun.lock
├── package.json
└── tsconfig.json
```

## Included Today

- Bun workspaces with `apps/*`
- Shared TypeScript configuration at the root
- Shared Biome linting and formatting configuration at the root
- `langchain` installed as a common root dependency
- First demo app at `apps/prompt-chaining`

## Getting Started

Install dependencies:

```bash
bun install
```

Run linting:

```bash
bun run lint
```

Run formatting:

```bash
bun run format
```

Run type checking:

```bash
bun run typecheck
```

Run the first demo app:

```bash
bun run --filter @agentic-demo/prompt-chaining dev
```

## Documentation

- Agent guidance: `AGENTS.md`
- Architecture overview: `ARCHITECTURE.md`
- Execution plans: `docs/exec-plans/`

## Notes

- This repository is intentionally lightweight and optimized for practice.
- Separate design docs are not maintained in this repo.
- New demos should be added as new apps under `apps/`.
