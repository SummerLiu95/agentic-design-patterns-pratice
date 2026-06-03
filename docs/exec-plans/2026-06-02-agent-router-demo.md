# Agent Router DeepSeek Demo Execution Plan

**Status:** Completed

## Goal

Convert the Router design-pattern demo from the learning material into a runnable TypeScript example under `apps/agent-router`, using LangChain with DeepSeek and a typed routing flow that branches requests to specialized handlers.

## Scope

- Create a new workspace app at `apps/agent-router`
- Add the app-local dependencies required for LangChain routing, DeepSeek access, environment loading, and Zod validation
- Load `DEEPSEEK_API_KEY` from the repository root `.env`
- Implement a router that classifies requests into `animal`, `vegetable`, or `vectorstore`
- Dispatch requests to specialized branches with `RunnableBranch`
- Add sample requests and console output so the route selection is visible
- Verify the demo with both type checking and runtime execution

## Completed Steps

1. Reviewed the current monorepo structure, the existing execution-plan format, and the LangChain documentation relevant to router-style branching and structured output.
2. Confirmed the Router pattern should be implemented as a separate workspace app at `apps/agent-router`.
3. Chose the LangChain layer rather than LangGraph because the demo is a single classify-then-branch workflow without graph state or loops.
4. Added `apps/agent-router/package.json` and `apps/agent-router/tsconfig.json` to match the existing demo-app workspace structure.
5. Installed `@langchain/core`, `@langchain/openai`, `dotenv`, `zod`, and `@types/node` for the new app.
6. Implemented `apps/agent-router/src/index.ts` with DeepSeek-backed `ChatOpenAI` configuration and fail-fast validation for `DEEPSEEK_API_KEY`.
7. Implemented a typed route schema for `animal`, `vegetable`, and `vectorstore` using Zod.
8. Tested LangChain's direct `withStructuredOutput()` path and found that DeepSeek rejected the response format required by that method in this setup.
9. Replaced that direct structured-output path with a provider-compatible router classifier that requests JSON output from the model and validates the parsed result with Zod before branching.
10. Implemented three specialized chains and connected them with `RunnableBranch` so the original request is routed to the correct handler.
11. Added sample requests and console output showing the request, selected route, and final answer for each demo run.
12. Verified the new app with focused type checking and a successful runtime execution.

## Data Flow And Verification

- Input: a plain user request string such as "What is a dog?" or "What is a vector store?"
- Step 1: router prompt asks the model to classify the request into one of the allowed routes using a Zod-backed structured output schema
- Step 2: RunnableBranch checks the typed route and forwards the original request to the matching specialized branch
- Step 3: the selected branch answers with a domain-specific response
- Step 4: the script prints both the chosen route and the final answer so the routing behavior is easy to inspect

## Files Created

- `apps/agent-router/package.json`
- `apps/agent-router/tsconfig.json`
- `apps/agent-router/src/index.ts`
- `docs/exec-plans/2026-06-02-agent-router-demo.md`

## Files Modified

- `bun.lock`

## Verification

- `bun run --filter @agentic-demo/agent-router typecheck`
- `bun run --filter @agentic-demo/agent-router dev`

The Router demo typechecks successfully and runs successfully with the current local `.env`.

## Notes

- The model provider is configured through `@langchain/openai` with DeepSeek's OpenAI-compatible base URL.
- The current model configuration in `apps/agent-router/src/index.ts` uses `deepseek-v4-flash`.
- The script expects `DEEPSEEK_API_KEY` in the repository root `.env` file.
- The final router keeps typed validation through Zod, but uses provider-compatible JSON output parsing instead of the direct `withStructuredOutput()` helper because that helper path was not accepted by DeepSeek in this environment.
