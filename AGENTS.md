# This project is positioned as follows: a Bun monorepo practice demo for learning agentic design patterns with LangChain.

## Overall Design

- System architecture -> `ARCHITECTURE.md`
- Execution plan -> `docs/exec-plans/xxx.md`
- Project overview -> `README.md`

## Overall Workflow Convention

1. Convert the Python code demo to the TypeScript version.
2. Offer the implementation plan in chat and wait for confirmation before implementation.
3. Confirm the plan in chat but there is no need to create a plan file.
4. Implement the approved plan.
5. Add an execution plan under `docs/exec-plans/` after the work is finished.
6. Use the execution-plan filename format `{date}-xxx-xxx.md`.
7. Follow the content format used by the existing files in `docs/exec-plans/`.
8. There is no need to update the README.md file.

## Detailed Docs

- Execution plans -> `docs/exec-plans/`
- Architecture overview -> `ARCHITECTURE.md`

## Usage Rules

- Only read documents related to the current task
- Do not load all documentation at once
- If information conflicts, prefer the more specific document
- This practice repo does not maintain separate design docs
