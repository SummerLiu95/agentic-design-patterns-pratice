import { config } from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
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
  temperature: 0,
  configuration: {
    baseURL: "https://api.deepseek.com",
  },
});

const promptExtract = ChatPromptTemplate.fromTemplate(`
请从以下文本中提取技术规格：

{text_input}
`.trim());

const promptTransform = ChatPromptTemplate.fromTemplate(`
请将以下技术规格转换为 JSON 格式，只包含 "cpu"、"memory" 和 "storage" 三个键。
如果某个字段缺失，请填入 null。
只返回 JSON，不要输出额外说明。

技术规格：
{specifications}
`.trim());

const extractionChain = promptExtract.pipe(llm).pipe(new StringOutputParser());

const fullChain = RunnableSequence.from([
  {
    specifications: extractionChain,
  },
  promptTransform,
  llm,
  new StringOutputParser(),
]);

const inputText = "新款笔记本配备 3.5GHz 八核处理器、16GB 内存和 1TB NVMe SSD。";

console.log("\n--- Input Text ---");
console.log(inputText);

const extractedSpecifications = await extractionChain.invoke({
  text_input: inputText,
});

console.log("\n--- Extracted Specifications ---");
console.log(extractedSpecifications);

const finalResult = await fullChain.invoke({
  text_input: inputText,
});

console.log("\n--- Final JSON Output ---");
console.log(finalResult);
