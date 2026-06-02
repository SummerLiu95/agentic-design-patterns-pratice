# Prompt Chaining DeepSeek Demo Execution Plan

**Status:** Completed

## Goal

Convert the Prompt Chaining learning-material demo into a runnable TypeScript example under `apps/prompt-chaining`, using LangChain with DeepSeek via the OpenAI-compatible API and reading `DEEPSEEK_API_KEY` from the repository root `.env`.

## Scope

- Replace the placeholder app entry with a real Prompt Chaining example
- Use LangChain prompt templates, LCEL chaining, and string output parsing
- Configure the chat model to call DeepSeek through `@langchain/openai`
- Load `DEEPSEEK_API_KEY` from the root `.env`
- Add the missing app-level dependencies required by the demo
- Verify the app with TypeScript type checking

## Completed Steps

1. Reviewed the current `apps/prompt-chaining` app structure and the repository execution-plan convention.
2. Confirmed the demo should follow the learning material's Prompt Chaining flow while using DeepSeek instead of OpenAI.
3. Chose the OpenAI-compatible integration path with `ChatOpenAI` so the TypeScript version stayed close to the original teaching example.
4. Added `@langchain/core`, `@langchain/openai`, and `dotenv` as app dependencies.
5. Added `@types/node` as a development dependency so the Bun + TypeScript app could typecheck Node environment access cleanly.
6. Replaced the placeholder `src/index.ts` with a Prompt Chaining demo that loads the root `.env`, validates `DEEPSEEK_API_KEY`, and configures `ChatOpenAI` with DeepSeek's base URL.
7. Implemented the first prompt stage to extract technical specifications from a natural-language laptop description.
8. Implemented the second prompt stage to convert the extracted specifications into JSON containing only `cpu`, `memory`, and `storage`.
9. Composed the full prompt chain with `RunnableSequence` and `StringOutputParser`, and added console output for the input text, extracted specifications, and final JSON result.
10. Verified the current app state with `bun run --filter @agentic-demo/prompt-chaining typecheck`.

## Files Modified

- `apps/prompt-chaining/src/index.ts`
- `apps/prompt-chaining/package.json`

## Verification

- `bun run --filter @agentic-demo/prompt-chaining typecheck`

The current file state typechecks successfully.

## Notes

- The current model configuration in `apps/prompt-chaining/src/index.ts` uses `deepseek-v4-flash`.
- The script expects `DEEPSEEK_API_KEY` in the repository root `.env` file.
- Full runtime execution depends on a valid local `.env` and API access, so this record only confirms static verification from the current repository state.
