import { config } from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableBranch } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
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

const routeSchema = z.object({
  destination: z.enum(["animal", "vegetable", "vectorstore"]),
});

type Route = z.infer<typeof routeSchema>["destination"];

type BranchInput = {
  destination: Route;
  request: string;
};

const routerPrompt = ChatPromptTemplate.fromTemplate(`
Route the user's request to the best destination.

Choose exactly one destination:
- animal: questions about animals
- vegetable: questions about vegetables
- vectorstore: questions about vector stores, embeddings, or semantic search

Return a JSON object with exactly one key:
- destination: one of "animal", "vegetable", or "vectorstore"

User request:
{request}
`.trim());

async function classifyRoute(request: string) {
  const promptValue = await routerPrompt.invoke({ request });
  const response = await llm.invoke(promptValue, {
    response_format: {
      type: "json_object",
    },
  });
  const output = await new StringOutputParser().invoke(response);

  return routeSchema.parse(JSON.parse(output));
}

const animalChain = ChatPromptTemplate.fromTemplate(`
You are an expert on animals.
Answer the user's question clearly and concisely.

Question:
{request}
`.trim())
  .pipe(llm)
  .pipe(new StringOutputParser());

const vegetableChain = ChatPromptTemplate.fromTemplate(`
You are an expert on vegetables.
Answer the user's question clearly and concisely.

Question:
{request}
`.trim())
  .pipe(llm)
  .pipe(new StringOutputParser());

const vectorstoreChain = ChatPromptTemplate.fromTemplate(`
You are an expert on vector stores and semantic retrieval.
Answer the user's question clearly and concisely.

Question:
{request}
`.trim())
  .pipe(llm)
  .pipe(new StringOutputParser());

const branch = RunnableBranch.from<BranchInput, string>([
  [
    (input) => input.destination === "animal",
    (input) => animalChain.invoke({ request: input.request }),
  ],
  [
    (input) => input.destination === "vegetable",
    (input) => vegetableChain.invoke({ request: input.request }),
  ],
  [
    (input) => input.destination === "vectorstore",
    (input) => vectorstoreChain.invoke({ request: input.request }),
  ],
  () => "No matching route was found.",
]);

async function routeRequest(request: string) {
  const route = await classifyRoute(request);
  const result = await branch.invoke({
    destination: route.destination,
    request,
  });

  return {
    route: route.destination,
    result,
  };
}

const requests = [
  "What is a dog?",
  "What are carrots rich in?",
  "How does a vector store help semantic search?",
];

async function main() {
  for (const request of requests) {
    console.log("\n--- Request ---");
    console.log(request);

    const output = await routeRequest(request);

    console.log("\n--- Route ---");
    console.log(output.route);

    console.log("\n--- Result ---");
    console.log(output.result);
  }
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});
