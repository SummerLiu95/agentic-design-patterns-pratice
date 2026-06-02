import { config } from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnableParallel,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

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
  temperature: 0.7,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
});

const jokeChain = ChatPromptTemplate.fromMessages([
  ["system", "你是一个擅长短笑话创作的助手。"],
  ["user", "请针对以下主题创作一个简短笑话：{topic}"],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const haikuChain = ChatPromptTemplate.fromMessages([
  ["system", "你是一个擅长俳句写作的助手。"],
  ["user", "请针对以下主题写一首三行短俳句：{topic}"],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const explainChain = ChatPromptTemplate.fromMessages([
  ["system", "你是一个清晰简洁的说明型助手。"],
  ["user", "请用几句话解释以下主题：{topic}"],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const parallelChain = RunnableParallel.from({
  topic: new RunnablePassthrough<string>(),
  joke: (topic: string) => jokeChain.invoke({ topic }),
  haiku: (topic: string) => haikuChain.invoke({ topic }),
  explanation: (topic: string) => explainChain.invoke({ topic }),
});

const synthesisChain = ChatPromptTemplate.fromMessages([
  ["system", "你是一个整合写作助手。"],
  [
    "user",
    `请综合以下并行生成的内容，围绕主题“{topic}”整理成一段自然、连贯的总结：

笑话：
{joke}

俳句：
{haiku}

说明：
{explanation}`,
  ],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const fullParallelChain = parallelChain.pipe(synthesisChain);

const topic = "LangChain";

console.log("\n--- Input Topic ---");
console.log(topic);

const parallelResult = await parallelChain.invoke(topic);

console.log("\n--- Parallel Outputs ---");
console.log(parallelResult);

const finalResult = await fullParallelChain.invoke(topic);

console.log("\n--- Final Synthesized Result ---");
console.log(finalResult);
