# Agent Tools DeepSeek Demo Execution Plan

**Status:** Completed

## Goal

Convert the Tool Usage design-pattern demo from the learning material into a runnable TypeScript example under `apps/agent-tools`, using LangChain v1's modern `createAgent` API with a single `search_information` tool backed by a simulated-results dictionary, all powered by DeepSeek.

## Scope

- Create a new workspace app at `apps/agent-tools`
- Add the app-local dependencies required for LangChain v1 agent, DeepSeek access, environment loading, and Zod validation
- Load `DEEPSEEK_API_KEY` from the repository root `.env`
- Implement one tool (`search_information`) that returns simulated responses from a hardcoded lookup dictionary
- Wire the tool to a LangChain agent using `createAgent` (the modern v1 entry point) with a Chinese system prompt
- Run three queries (London weather, France capital, Paris population) and print the full conversation so the tool-calling loop is visible
- Print the final AI answer for each query
- Verify the new app with focused type checking and a successful runtime execution

## Completed Steps

1. Reviewed the current monorepo structure, the existing execution-plan format, and the LangChain guidance relevant to agent construction and tool calling.
2. Confirmed the Tool Usage pattern should be implemented as a separate workspace app at `apps/agent-tools` to match the existing `apps/agent-<pattern>` naming convention.
3. Chose the LangChain v1 `createAgent` API rather than the legacy `createToolCallingAgent` + `AgentExecutor` pattern from the screenshot, because `createAgent` is the recommended v1 entry point and the legacy entry points have been removed from the current `langchain` package.
4. Kept the original provider as DeepSeek via `@langchain/openai` to stay consistent with all other demos in this repo.
5. Added `apps/agent-tools/package.json` and `apps/agent-tools/tsconfig.json` to match the existing demo-app workspace structure.
6. Installed `langchain`, `@langchain/core`, `@langchain/openai`, `dotenv`, `zod`, and `@types/node` for the new app.
7. Implemented `apps/agent-tools/src/index.ts` with DeepSeek-backed `ChatOpenAI` configuration and fail-fast validation for `DEEPSEEK_API_KEY`.
8. Implemented a `search_information` tool via `tool()` from `langchain` with a Zod schema for the `query` parameter. The tool resolves the query against a hardcoded `simulated_results` lookup and returns the matching string (or a `default` fallback), printing the call site and result to the console (mirrors the Python `print` statements in the screenshot).
9. Implemented a Chinese `systemPrompt` that instructs the agent to use `search_information` for weather, geography, population, and mountain-peak questions and to answer in Chinese afterwards.
10. Built the agent via `createAgent({ model, tools, systemPrompt })` — the modern LangChain v1 entry point.
11. Implemented `runQuery` using `agent.invoke()` and printed the full conversation history (human → ai/tool_call → tool → ai/... → ai) so the tool-calling loop is visible in the console output.
12. Added `main` to run the three sample queries (London weather, France capital, Paris population) sequentially; the parallel `Promise.all` form is also valid and noted in the source.
13. Verified the new app with focused type checking and a successful runtime execution that exercises the tool-calling loop.

## Data Flow And Verification

- Input: one user query string per run
- Step 1: the user query is sent to the agent via `agent.invoke({ messages: [{ role: "user", content: query }] })`
- Step 2: the model decides whether to call `search_information` and which `query` value to pass
- Step 3: the tool resolves the query against `simulatedResults` and returns the matching string (or the `default` fallback)
- Step 4: the model receives the tool result and either calls the tool again (tool-calling loop) or composes a final answer
- Step 5: the full conversation (human → ai with tool_call → tool result → ai final answer) is printed; the final AI message is also surfaced as the Agent 最终结果
- Verification:
  - `bun run --filter @agentic-demo/agent-tools typecheck`
  - `bun run --filter @agentic-demo/agent-tools dev`

## Files Created

- `apps/agent-tools/package.json`
- `apps/agent-tools/tsconfig.json`
- `apps/agent-tools/src/index.ts`
- `docs/exec-plans/2026-06-30-agent-tools-demo.md`

## Files Modified

- `bun.lock`

## Verification

- `bun run --filter @agentic-demo/agent-tools typecheck`
- `bun run --filter @agentic-demo/agent-tools dev`

The Agent Tools demo typechecks successfully and runs successfully with the current local `.env`. The runtime output shows the agent invoking `search_information` for the three sample queries, the tool returning simulated data (or the default fallback for free-form query strings), and the model composing a final Chinese answer that incorporates the tool result.

## Notes

- The provider is configured through `@langchain/openai` with DeepSeek's OpenAI-compatible base URL.
- The current model configuration in `apps/agent-tools/src/index.ts` uses `deepseek-v4-flash`.
- The script expects `DEEPSEEK_API_KEY` in the repository root `.env` file.
- `createAgent` (from the `langchain` v1 package) is used instead of the screenshot's legacy `createToolCallingAgent` + `AgentExecutor`, because the legacy entry points have been removed from the current `langchain` package. The `createAgent` API is the modern recommended replacement.
- The simulated-results dictionary is keyed on lowercase English query strings (e.g. `weather in london`, `capital of france`, `population of paris`, `latest mountain`). The model may produce free-form query strings (e.g. `paris population 2024`) that do not match a key, in which case the tool returns the `default` fallback. This is a known characteristic of the simulated-data demo, not a code issue.
- Sequential execution is used in `main` for clean per-query output. The Python demo's `asyncio.gather` form is equivalent to `Promise.all([runQuery(...), ...])` and is noted in the source.
- `agent.invoke()` is used instead of `agent.streamEvents()` because the v3 stream's tool-call channel was not consistently capturing all tool calls with the current model; `invoke()` is simpler, more reliable, and prints the full conversation history (which is more educational for this pattern).
- `README.md` was intentionally not updated for this task based on the current workflow rule.
