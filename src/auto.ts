import { completeTask } from "./completeTask";
import { MAX_TASK_CHARS } from "./config";
import { UnimplementedError } from "./errors";
import { getSnapshot } from "./getSnapshot";
import { type Page, type Test, StepOptions } from "./types";

let totalCostSum = 0;

export const auto = async (
  task: string,
  config: { page: Page; test?: Test },
  options?: StepOptions
): Promise<any> => {
  if (!config || !config.page) {
    throw Error(
      "The auto() function is missing the required `{ page }` argument."
    );
  }

  const { test, page } = config as { page: Page; test?: Test };

  if (!test) {
    return await runTask(task, page, options);
  }

  return test.step(`auto-playwright.ai '${task}'`, async () => {
    const result = await runTask(task, page, options);

    if (result.errorMessage) {
      throw new UnimplementedError(result.errorMessage);
    }

    if (result.assertion !== undefined) {
      return result.assertion;
    }

    if (result.query !== undefined) {
      return result.query;
    }

    return undefined;
  });
};

async function runTask(
  task: string,
  page: Page,
  options: StepOptions | undefined
) {
  if (task.length > MAX_TASK_CHARS) {
    throw new Error(
      `Provided task string is too long, max length is ${MAX_TASK_CHARS} chars.`
    );
  }

  const result = await completeTask(page, {
    task,
    snapshot: await getSnapshot(page),
    options: options
      ? {
          model: options.model ?? "gpt-4o",
          debug: options.debug ?? false,
          openaiApiKey: options.openaiApiKey,
          openaiBaseUrl: options.openaiBaseUrl,
          openaiDefaultQuery: options.openaiDefaultQuery,
          openaiDefaultHeaders: options.openaiDefaultHeaders,
        }
      : undefined,
  });
  
  const totalUsage = result.usage || { prompt_tokens: 0, completion_tokens: 0 };
  
  let inputCost = 0;
  let outputCost = 0;
  
  if (options?.model === "gpt-4o") {
    inputCost = (totalUsage.prompt_tokens || 0) * 0.000005;
    outputCost = (totalUsage.completion_tokens || 0) * 0.000015;
  } else if (options?.model === "gpt-4o-mini") {
    inputCost = (totalUsage.prompt_tokens || 0) * 0.00000015;
    outputCost = (totalUsage.completion_tokens || 0) * 0.0000006;
  }
  
  const totalCost = inputCost + outputCost;
  
  // Add the current cost to the global totalCostSum
  totalCostSum += totalCost;

  console.log(`COST: [task=${task}, model=${options?.model}, prompt=${totalUsage.prompt_tokens}, completion=${totalUsage.completion_tokens}, Cost=${totalCost.toFixed(2)}$]`);
  console.log(`Total Accumulated Cost: ${totalCostSum.toFixed(2)}$`);
  return result;
}
