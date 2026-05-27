# Architecture

## Purpose

This repository is a practice-focused Bun monorepo for learning agentic design patterns. The current baseline is intentionally small so new demos can be added without carrying unnecessary tooling or package complexity.

## Current Scope

- Monorepo manager: Bun workspaces
- Main learning dependency: `langchain`
- First demo app: `apps/prompt-chaining`
- Shared configuration: root TypeScript config and root Biome config

## Repository Layout

```text
.
├── apps/
│   └── prompt-chaining/
│       ├── package.json
│       ├── src/
│       │   └── index.ts
│       └── tsconfig.json
├── AGENTS.md
├── ARCHITECTURE.md
├── README.md
├── biome.json
├── bun.lock
├── docs/
│   └── exec-plans/
└── package.json
```

## Workspace Model

The root `package.json` owns the Bun workspace definition through `apps/*`. Each demo app lives under `apps/` as its own workspace package. This keeps the repo easy to expand while avoiding extra shared packages until they are actually needed.

## Dependency Strategy

`langchain` is installed at the repository root as the common dependency for demos in this practice repo. This keeps setup simple and avoids introducing a dedicated shared package before there is a real need for one.

## Tooling

- Package manager and runtime: Bun
- Type checking: TypeScript
- Linting and formatting: Biome

The root configuration provides the common defaults. Each app can extend the shared TypeScript settings with local overrides if a future demo needs them.

## Documentation Strategy

This repo keeps lightweight operational docs instead of a full design-doc process. Architecture lives in `ARCHITECTURE.md`, execution history and plans live in `docs/exec-plans/`, and setup guidance lives in `README.md`.
