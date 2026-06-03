import { config } from "dotenv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
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

const reflectionSchema = z.object({
  verdict: z.enum(["pass", "revise"]),
  critique: z.string(),
  improvement: z.string(),
});

const generatorPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a careful coding assistant. Return only Python code with no markdown fences.",
  ],
  [
    "user",
    `Task:
{task}

Previous reflection feedback:
{feedback}

Write an improved solution that directly addresses the feedback when it is present.`,
  ],
]);

const reflectionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a strict reviewer. Evaluate the candidate solution and decide whether it is acceptable.",
  ],
  [
    "user",
    `Review the candidate solution for the task below.

Task:
{task}

Candidate solution:
{candidate}

Return a JSON object with exactly these keys:
- verdict: "pass" or "revise"
- critique: short review summary
- improvement: specific revision guidance

Choose "pass" only when the candidate fully satisfies the task and does not need meaningful changes.`,
  ],
]);

const generatorChain = generatorPrompt.pipe(llm).pipe(new StringOutputParser());

async function reflectOnCandidate(task: string, candidate: string) {
  const promptValue = await reflectionPrompt.invoke({
    task,
    candidate,
  });
  const response = await llm.invoke(promptValue, {
    response_format: {
      type: "json_object",
    },
  });
  const output = await new StringOutputParser().invoke(response);

  return reflectionSchema.parse(JSON.parse(output));
}

async function runReflectionLoop(task: string, maxIterations = 3) {
  let currentCandidate = "";
  let feedback = "No prior feedback. Produce the best initial solution you can.";

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    console.log(`\n--- Iteration ${iteration}: Generate ---`);

    currentCandidate = await generatorChain.invoke({
      task,
      feedback,
    });

    console.log(currentCandidate);

    console.log(`\n--- Iteration ${iteration}: Reflect ---`);

    const reflection = await reflectOnCandidate(task, currentCandidate);

    console.log(reflection);

    if (reflection.verdict === "pass") {
      return {
        accepted: true,
        iteration,
        candidate: currentCandidate,
        reflection,
      };
    }

    feedback = `Critique: ${reflection.critique}\nImprovement guidance: ${reflection.improvement}`;
  }

  const finalReflection = await reflectOnCandidate(task, currentCandidate);

  return {
    accepted: false,
    iteration: maxIterations,
    candidate: currentCandidate,
    reflection: finalReflection,
  };
}

const task = "Write a Python function named calculate_factorial that returns the factorial of a non-negative integer and raises ValueError for negative inputs.";

console.log("\n--- Task ---");
console.log(task);

const result = await runReflectionLoop(task);

console.log("\n--- Final Reflection Result ---");
console.log(result.reflection);

console.log("\n--- Final Candidate ---");
console.log(result.candidate);
