# Reflection DeepSeek Demo Execution Plan

**Status:** Completed

## Goal

Convert the Reflection design-pattern demo from the learning material into a runnable TypeScript example under `apps/reflection`, using LangChain with DeepSeek and a bounded generator-reflector loop.

## Scope

- Create a new workspace app at `apps/reflection`
- Add the app-local dependencies required for LangChain prompts, DeepSeek access, environment loading, and Zod validation
- Load `DEEPSEEK_API_KEY` from the repository root `.env`
- Implement one generator prompt that produces a candidate solution
- Implement one reflection prompt that evaluates the candidate and returns a structured review
- Run a bounded revision loop so reflection feedback can improve the next generation round
- Print the task, iteration logs, reflection result, and final candidate
- Verify the new app with focused type checking and runtime execution

## Completed Steps

1. Reviewed the current monorepo structure, the existing execution-plan format, and the LangChain guidance relevant to prompt composition and structured output.
2. Confirmed the Reflection pattern should be implemented as a separate workspace app at `apps/reflection`.
3. Chose the LangChain layer rather than LangGraph or a full multi-agent setup because the demo only needs a bounded generate-review-revise loop.
4. Added `apps/reflection/package.json` and `apps/reflection/tsconfig.json` to match the existing demo-app workspace structure.
5. Installed `@langchain/core`, `@langchain/openai`, `dotenv`, `zod`, and `@types/node` for the new app.
6. Implemented `apps/reflection/src/index.ts` with DeepSeek-backed `ChatOpenAI` configuration and fail-fast validation for `DEEPSEEK_API_KEY`.
7. Implemented a generator prompt that writes a Python solution for the requested task.
8. Implemented a reflection prompt that reviews the generated candidate and returns structured JSON containing `verdict`, `critique`, and `improvement`.
9. Used Zod to validate the reflection result so the loop decision remains explicit and reliable.
10. Implemented a bounded TypeScript loop that feeds reflection feedback back into the next generation round and stops early when the reflection result passes.
11. Added console output for the task, generation round, reflection round, final reflection result, and final candidate.
12. Verified the new app with focused type checking and a successful runtime execution.

## Data Flow And Verification

- Input: one coding task string
- Step 1: the generator prompt creates an initial candidate
- Step 2: the reflection prompt evaluates the candidate and returns a structured review
- Step 3: if the review verdict is `revise`, the feedback is passed into the next generation round
- Step 4: the loop stops when the review verdict is `pass` or the max iteration count is reached
- Verification:
  - `bun run --filter @agentic-demo/reflection typecheck`
  - `bun run --filter @agentic-demo/reflection dev`

## Files Created

- `apps/reflection/package.json`
- `apps/reflection/tsconfig.json`
- `apps/reflection/src/index.ts`
- `docs/exec-plans/2026-06-03-reflection-demo.md`

## Files Modified

- `bun.lock`

## Verification

- `bun run --filter @agentic-demo/reflection typecheck`
- `bun run --filter @agentic-demo/reflection dev`

The Reflection demo typechecks successfully and runs successfully with the current local `.env`.

## Notes

- The model provider is configured through `@langchain/openai` with DeepSeek's OpenAI-compatible base URL.
- The current model configuration in `apps/reflection/src/index.ts` uses `deepseek-v4-flash`.
- The script expects `DEEPSEEK_API_KEY` in the repository root `.env` file.
- `README.md` was intentionally not updated for this task based on the current workflow rule.
