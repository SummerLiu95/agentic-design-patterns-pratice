import { config } from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import { z } from "zod";

config({
  path: new URL("../../../.env", import.meta.url).pathname,
});

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!deepseekApiKey) {
  throw new Error(
    "Missing DEEPSEEK_API_KEY. Add it to the repo root .env file before running this demo.",
  );
}

const llm = new ChatOpenAI({
  apiKey: deepseekApiKey,
  model: "deepseek-v4-flash",
  temperature: 0,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
});

// Simulated tool responses (faithful to the Python demo).
const simulatedResults: Record<string, string> = {
  "weather in london": "伦敦当前天气为多云，气温 13°C",
  "capital of france": "法国的首都是巴黎。",
  "population of paris": "巴黎人口约 220 万",
  "latest mountain": "当前的珠峰高度为 8848 米。",
  default: "抱歉，我无法找到信息，请尝试重新查询。",
};

// Single tool: agent decides which query string to pass; the tool looks up the
// matching simulated response. Mirrors the Python `search_information` tool.
const searchInformation = tool(
  async ({ query }) => {
    console.log(`--- 工具调用: search_information, 查询: '${query}' ---`);
    const result =
      simulatedResults[query.toLowerCase()] ?? simulatedResults.default;
    console.log(`--- 工具结果: ${result} ---`);
    return result;
  },
  {
    name: "search_information",
    description:
      "根据用户的问题搜索相关信息，常用于回答天气、地理、人口等常识类问题。",
    schema: z.object({
      query: z
        .string()
        .describe(
          "要搜索的关键词或短语，使用小写英文，例如 'weather in London'",
        ),
    }),
  },
);

const systemPrompt =
  "你是一个乐于助人的助手。当用户提出天气、地理、人口或山川相关的常识问题时，请先调用 search_information 工具获取数据后再用中文回答。";

// Modern LangChain v1 entry point: createAgent handles the tool-calling loop.
const agent = createAgent({
  model: llm,
  tools: [searchInformation],
  systemPrompt,
});

function renderMessage(message: {
  getType?: () => string;
  type?: string;
  content: unknown;
  tool_calls?: unknown[];
  name?: string;
}) {
  const type =
    typeof message.getType === "function" ? message.getType() : message.type;
  if (type === "human") {
    return `[human] ${String(message.content)}`;
  }
  if (type === "ai") {
    const text = String(message.content ?? "");
    const toolCalls = Array.isArray(message.tool_calls)
      ? (message.tool_calls as Array<{
          name: string;
          args: unknown;
        }>)
      : [];
    if (toolCalls.length > 0) {
      const calls = toolCalls
        .map((c) => `${c.name}(${JSON.stringify(c.args)})`)
        .join(", ");
      return text ? `[ai] ${text} | [tool_call] ${calls}` : `[tool_call] ${calls}`;
    }
    return `[ai] ${text}`;
  }
  if (type === "tool") {
    return `[tool:${message.name ?? "?"}] ${String(message.content)}`;
  }
  return `[${type ?? "unknown"}] ${String(message.content)}`;
}

async function runQuery(query: string) {
  console.log(`\n=== Agent 执行查询: ${query} ===`);

  const result = await agent.invoke({
    messages: [{ role: "user", content: query }],
  });

  // Print the full conversation so the tool-call loop is visible.
  for (const message of result.messages) {
    console.log(renderMessage(message as Parameters<typeof renderMessage>[0]));
  }

  const last = result.messages.at(-1);
  const finalText = typeof last?.content === "string" ? last.content : "";
  console.log(`\n=== Agent 最终结果 ===`);
  console.log(finalText.trim() || "(no text response)");

  return finalText;
}

async function main() {
  // The Python demo runs the queries in parallel via `asyncio.gather`. In
  // TypeScript the same effect is `Promise.all([runQuery(...), ...])`.
  // Sequential is used here to keep the per-query output easy to read.
  for (const query of [
    "伦敦现在的天气怎么样？",
    "法国的首都是哪座城市？",
    "巴黎的人口大约是多少？",
  ]) {
    await runQuery(query);
  }
}

await main();
