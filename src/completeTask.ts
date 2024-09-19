import OpenAI from "openai";
import { createActions } from "./createActions";
import { prompt } from "./prompt";
import { type Page, TaskMessage, TaskResult } from "./types";

const defaultDebug = process.env.AUTO_PLAYWRIGHT_DEBUG === "true";

export const completeTask = async (
  page: Page,
  task: TaskMessage
): Promise<TaskResult> => {
  const openai = new OpenAI({
    apiKey: task.options?.openaiApiKey,
    baseURL: task.options?.openaiBaseUrl,
    defaultQuery: task.options?.openaiDefaultQuery,
    defaultHeaders: task.options?.openaiDefaultHeaders,
  });

  let lastFunctionResult: null | { errorMessage: string } | { query: string } =
    null;

  const actions = createActions(page);

  const debug = task.options?.debug ?? defaultDebug;

  const runner = openai.beta.chat.completions
    .runTools({
      model: task.options?.model ?? "gpt-4o",
      messages: [{ role: "user", content: prompt(task) }],
      tools: Object.values(actions).map((action) => ({
        type: "function",
        function: action,
      })),
    })
    .on("message", (message) => {
      if (debug) {
        console.log("> message", JSON.stringify(message, null, 2));
      }

      if (
        message.role === "assistant" &&
        message.tool_calls &&
        message.tool_calls.length > 0
      ) {
        // console.log("> TOOL_CALL JSON", JSON.stringify(message));
        if (message.tool_calls[0].function.name.startsWith("result")) {
          // console.log(`> RESULT!!! ${message.tool_calls[0].function.arguments}`);
        lastFunctionResult = JSON.parse(
          message.tool_calls[0].function.arguments
        );
      }
      }
    });

  const finalContent = await runner.finalContent();
  const totalUsage = await runner.totalUsage()

  if (debug) {
    console.log("> finalContent", finalContent);
  }

  if (!lastFunctionResult) {
    throw new Error("Expected to have result");
  }

  if (debug) {
    console.log("> lastFunctionResult", lastFunctionResult);
  }

  return Object.assign({}, lastFunctionResult, { usage: totalUsage });
};
