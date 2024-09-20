import { TaskMessage } from "./types";

/**
 * The prompt itself is very simple because the vast majority of the logic is derived from
 * the instructions contained in the parameter and function descriptions provided to `openai.beta.chat.completions`.
 * @see https://www.npmjs.com/package/openai#automated-function-calls
 * @see https://openai.com/blog/function-calling-and-other-api-updates
 */
export const prompt = (message: TaskMessage) => {
  return `This is your task: ${message.task}

* When creating CSS selectors, ensure they are unique and specific enough to select only one element, even if there are multiple elements of the same type (like multiple h1 elements).
* Avoid using generic tags like 'h1' alone. Instead, combine them with other attributes or structural relationships to form a unique selector.
* You must not derive data from the page if you are able to do so by using one of the provided functions, e.g. locator_evaluate.
* Best case use ids or classes to clearly identify elements in the selector. Using test-ids is another option.
* Getting Button elements can be best done by using their role + name or a testId (if set). Use the specific tools for it.
* For Inputs you can get them by their label using the respective tool.
* if using isVisible or some other kind of assertion outputting a boolean make sure to use the result_assertion function.
* When wanting to click on something and there is a cursor-pointer class attached higher in the hierarchy, click on the object with cursor-pointer instead.
* If locating an element using one tool fails, try at least 3 different tools to locate the element, you can also retry a tool with different arguments (e.g. after trying label, try role).
* Make sure to run a result function every time to get the final result!!
* Don't run multiple tools to find an element at the same time, start with one and if the element is not found try another tool.
* To whats in the description of the test. Nothing more, nothing less. Don't hallucinate.
* If there are multiple elements in a tool response, pick one and try proceeding with this one. If it fails, try another one.
* In case of selecting a value (VALUE_TO_SELECT) in a dropdown, try the following: getByRole('button', { name: 'Not selected' }).click() and then page.getByLabel('Not selected').getByText('VALUE_TO_SELECT').click()

Webpage snapshot:

\`\`\`
${message.snapshot.dom}
\`\`\`
`;
};
