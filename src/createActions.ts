import { Locator, Page } from "@playwright/test";
import { randomUUID } from "crypto";
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { z } from "zod";
import { TestRecorder } from "./simplifAi";

type ERole = "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem";
const eRoleArr = ["alert" , "alertdialog" , "application" , "article" , "banner" , "blockquote" , "button" , "caption" , "cell" , "checkbox" , "code" , "columnheader" , "combobox" , "complementary" , "contentinfo" , "definition" , "deletion" , "dialog" , "directory" , "document" , "emphasis" , "feed" , "figure" , "form" , "generic" , "grid" , "gridcell" , "group" , "heading" , "img" , "insertion" , "link" , "list" , "listbox" , "listitem" , "log" , "main" , "marquee" , "math" , "meter" , "menu" , "menubar" , "menuitem" , "menuitemcheckbox" , "menuitemradio" , "navigation" , "none" , "note" , "option" , "paragraph" , "presentation" , "progressbar" , "radio" , "radiogroup" , "region" , "row" , "rowgroup" , "rowheader" , "scrollbar" , "search" , "searchbox" , "separator" , "slider" , "spinbutton" , "status" , "strong" , "subscript" , "superscript" , "switch" , "tab" , "table" , "tablist" , "tabpanel" , "term" , "textbox" , "time" , "timer" , "toolbar" , "tooltip" , "tree" , "treegrid" , "treeitem"];


async function appendToFile(command: string) {
  TestRecorder.getInstance().addCommand(command);
}

async function checkLocator(locator: Locator, type: string, args: any) {
    const elements = await locator.elementHandles();

    if (elements.length > 0) {
      const elementPaths = [];
        for (let i = 0; i < elements.length; i++) {
            const elementLocator = locator.nth(i);

            const elementHandle = await elementLocator.elementHandle();
            if (elementHandle) {
              // You now have access to the underlying DOM element
              const className = await elementHandle.evaluate(el => el.className);
              const selector = className
                .split(' ')
                .filter((cls: string) => !cls.includes('.'))
                .join('.');
              // const selector = unique(element);
              elementPaths.push(selector);
              console.log(`The element ${i} selector is: ${selector}`);
              // console.log(`The element ${i} selector is: ${selector}`);
            } else {
              console.log(`Element ${i} not found`);
            }
          }

            // Try to get the ID
            // const id = await elementLocator.getAttribute('id');
            // if (id) {
            //     // console.log(`Element ${i + 1} unique selector: #${id}`);
            //     elementPaths.push(`#${id}`);
            //     continue;
            // }

        if (elements.length === 1) {
          console.log(`Element found for locator '${type}' with arguments ${JSON.stringify(args)}, path: ${elementPaths[0]}`);
          return {
            elements: elementPaths,
            success: true
          }
        }
        console.log(`Multiple elements found for locator '${type}' with arguments ${JSON.stringify(args)}, paths: ${elementPaths}`);
        return {
          errorMessage: `Multiple elements found for locator '${type}' with arguments ${JSON.stringify(args)}`,
          type: type,
          args: args,
          elements: elementPaths,
        }
    } else {
        console.log(`No element found for locator '${type}' with arguments ${JSON.stringify(args)}`);
        return {
          errorMessage: `No element found for locator '${type}' with arguments ${JSON.stringify(args)}`,
        }
    }
}

export const createActions = (
  page: Page
): Record<string, RunnableFunctionWithParse<any>> => {
  const locatorMap = new Map();
  const locatorMap2 = new Map();

  const getLocator = (elementId: string) => {
    const locator = locatorMap.get(elementId);

    if (!locator) {
      throw new Error('Unknown elementId "' + elementId + '"');
    }

    return locator;
  };

  const getLocatorCommand = (elementId: string) => {
    const command = locatorMap2.get(elementId);

    if (!command) {
      throw new Error('Unknown elementId "' + elementId + '"');
    }

    return command;
  };

  return {
    locateElementByText: {
      function: async (args: { text: string }) => {
        const locator = page.getByText(args.text);
        const locatorResult = await checkLocator(locator, 'getByText', args);
        if (locatorResult.errorMessage) {
          return locatorResult;
        }

        const elementId = randomUUID();

        locatorMap.set(elementId, locator);
        locatorMap2.set(elementId, `page.getByText("${args.text}")`);

        return {
          elementId,
        };
      },
      name: "locateElementByText",
      description:
        "Locates element containing given text and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            text: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
          },
        },
      },
    },
    locateElementByLabel: {
      function: async (args: { label: string }) => {
        const locator = page.getByLabel(args.label);
        const locatorResult = await checkLocator(locator, 'getByLabel', args);
        if (locatorResult.errorMessage) {
          return locatorResult;
        }

        const elementId = randomUUID();

        locatorMap.set(elementId, locator);
        locatorMap2.set(elementId, `page.getByLabel("${args.label}")`);

        return {
          elementId,
        };
      },
      name: "locateElementByLabel",
      description:
        "Locates element with the given label and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            label: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
          },
        },
      },
    },
    locateElementByTestId: {
      function: async (args: { testId: string }) => {
        const locator = page.getByTestId(args.testId);
        const locatorResult = await checkLocator(locator, 'getByTestId', args);
        if (locatorResult.errorMessage) {
          return locatorResult;
        }

        const elementId = randomUUID();

        locatorMap.set(elementId, locator);
        locatorMap2.set(elementId, `page.getByTestId("${args.testId}")`);

        return {
          elementId,
        };
      },
      name: "locateElementByTestId",
      description: 
        "Locates element containing given testId and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            testId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          testId: {
            type: "string",
          },
        },
      },
    },
    locateElementByRole: {
      function: async (args: { role: ERole; name: string }) => {
        const locator = page.getByRole(args.role, { name: args.name })
        const locatorResult = await checkLocator(locator, 'getByRole', args);
        if (locatorResult.errorMessage) {
          return locatorResult;
        }

        const elementId = randomUUID();

        locatorMap.set(elementId, locator);
        locatorMap2.set(elementId, `page.getByRole("${args.role}", { name: "${args.name}" })`);

        return {
          elementId,
        };
      },
      name: "locateElementByRole",
      description:
        `Locates element by their role (one of :${eRoleArr.join(",")}) and returns elementId. This element ID can be used with other functions to perform actions on the element.`,
      parse: (args: string) => {
        return z
          .object({
            role: z.string(),
            name: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          role: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
    locateElement: {
      function: async (args: { cssSelector: string }) => {
        const locator = page.locator(args.cssSelector);
        const locatorResult = await checkLocator(locator, 'locator', args);
        if (locatorResult.errorMessage) {
          return locatorResult;
        }

        const elementId = randomUUID();

        locatorMap.set(elementId, locator);
        locatorMap2.set(elementId, `page.locator("${args.cssSelector}")`);

        return {
          elementId,
        };
      },
      name: "locateElement",
      description:
        "Locates element using a CSS selector and returns elementId. This element ID can be used with other functions to perform actions on the element.",
      parse: (args: string) => {
        return z
          .object({
            cssSelector: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          cssSelector: {
            type: "string",
          },
        },
      },
    },
    locator_evaluate: {
      function: async (args: { pageFunction: string; elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.evaluate("${args.pageFunction}")`;
        appendToFile(command);
        return {
          result: await getLocator(args.elementId).evaluate(args.pageFunction),
        };
      },
      description:
        "Execute JavaScript code in the page, taking the matching element as an argument.",
      name: "locator_evaluate",
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
          pageFunction: {
            type: "string",
            description:
              "Function to be evaluated in the page context, e.g. node => node.innerText",
          },
        },
      },
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            pageFunction: z.string(),
          })
          .parse(JSON.parse(args));
      },
    },
    locator_getAttribute: {
      function: async (args: { attributeName: string; elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.getAttribute("${args.attributeName}")`;
        appendToFile(command);
        return {
          attributeValue: await getLocator(args.elementId).getAttribute(
            args.attributeName
          ),
        };
      },
      name: "locator_getAttribute",
      description: "Returns the matching element's attribute value.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            attributeName: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          attributeName: {
            type: "string",
          },
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerHTML: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.innerHTML()`;
        appendToFile(command);
        return { innerHTML: await getLocator(args.elementId).innerHTML() };
      },
      name: "locator_innerHTML",
      description: "Returns the element.innerHTML.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_innerText: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.innerText()`;
        appendToFile(command);
        return { innerText: await getLocator(args.elementId).innerText() };
      },
      name: "locator_innerText",
      description: "Returns the element.innerText.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_textContent: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.textContent()`;
        appendToFile(command);
        return {
          textContent: await getLocator(args.elementId).textContent(),
        };
      },
      name: "locator_textContent",
      description: "Returns the node.textContent.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_inputValue: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.inputValue()`;
        appendToFile(command);
        return {
          inputValue: await getLocator(args.elementId).inputValue(),
        };
      },
      name: "locator_inputValue",
      description:
        "Returns input.value for the selected <input> or <textarea> or <select> element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_blur: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.blur()`;
        appendToFile(command);
        await getLocator(args.elementId).blur();

        return { success: true };
      },
      name: "locator_blur",
      description: "Removes keyboard focus from the current element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_boundingBox: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.boundingBox()`;
        appendToFile(command);
        return await getLocator(args.elementId).boundingBox();
      },
      name: "locator_boundingBox",
      description:
        "This method returns the bounding box of the element matching the locator, or null if the element is not visible. The bounding box is calculated relative to the main frame viewport - which is usually the same as the browser window. The returned object has x, y, width, and height properties.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_check: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.check()`;
        appendToFile(command);
        await getLocator(args.elementId).check();

        return { success: true };
      },
      name: "locator_check",
      description: "Ensure that checkbox or radio element is checked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_uncheck: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.uncheck()`;
        appendToFile(command);
        await getLocator(args.elementId).uncheck();

        return { success: true };
      },
      name: "locator_uncheck",
      description: "Ensure that checkbox or radio element is unchecked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isChecked: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.isChecked()`;
        appendToFile(command);
        return { isChecked: await getLocator(args.elementId).isChecked() };
      },
      name: "locator_isChecked",
      description: "Returns whether the element is checked.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isEditable: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.isEditable()`;
        appendToFile(command);
        return {
          isEditable: await getLocator(args.elementId).isEditable(),
        };
      },
      name: "locator_isEditable",
      description:
        "Returns whether the element is editable. Element is considered editable when it is enabled and does not have readonly property set.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isEnabled: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.isEnabled()`;
        appendToFile(command);
        return { isEnabled: await getLocator(args.elementId).isEnabled() };
      },
      name: "locator_isEnabled",
      description:
        "Returns whether the element is enabled. Element is considered enabled unless it is a <button>, <select>, <input> or <textarea> with a disabled property.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_isVisible: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.isVisible()`;
        appendToFile(command);
        return { isVisible: await getLocator(args.elementId).isVisible() };
      },
      name: "locator_isVisible",
      description: "Returns whether the element is visible.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_clear: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.clear()`;
        appendToFile(command);
        await getLocator(args.elementId).clear();

        return { success: true };
      },
      name: "locator_clear",
      description: "Clear the input field.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_click: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.click({ force: true })`;
        appendToFile(command);
        // .dispatchEvent('click');
        // TODO: WORKAROUND - click through stuff in the way
        await getLocator(args.elementId).click({ force: true });

        return { success: true };
      },
      name: "locator_click",
      description: "Click an element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_selectOption: {
      function: async (args: { elementId: string, option: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.selectOption("${args.option}")`;
        appendToFile(command);
        await getLocator(args.elementId).selectOption(args.option);

        return { success: true };
      },
      name: "locator_selectOption",
      description: "Select an option from a dropdown/select element.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            option: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
          option: {
            type: "string",
          },
        },
      },
    },
    locator_count: {
      function: async (args: { elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.count()`;
        appendToFile(command);
        return { elementCount: await getLocator(args.elementId).count() };
      },
      name: "locator_count",
      description: "Returns the number of elements matching the locator.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          elementId: {
            type: "string",
          },
        },
      },
    },
    locator_fill: {
      function: async (args: { value: string; elementId: string }) => {
        const command = `${getLocatorCommand(args.elementId)}.fill("${args.value}")`;
        appendToFile(command);
        await getLocator(args.elementId).fill(args.value);

        return {
          success: true,
        };
      },
      name: "locator_fill",
      description: "Set a value to the input field.",
      parse: (args: string) => {
        return z
          .object({
            elementId: z.string(),
            value: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          value: {
            type: "string",
          },
          elementId: {
            type: "string",
          },
        },
      },
    },
    page_goto: {
      function: async (args: { url: string }) => {
        const command = `page.goto("${args.url}")`;
        appendToFile(command);
        return {
          url: await page.goto(args.url),
          success: true
        };
      },
      name: "page_goto",
      description: "Go (navigate) to a specific page on the page e.g. /home, /test/1234. this is an action, run resultAction after",
      parse: (args: string) => {
        return z
          .object({
            url: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
          },
        },
      },
    },
    expect_toBe: {
      function: (args: { actual: string; expected: string }) => {
        return {
          actual: args.actual,
          expected: args.expected,
          success: args.actual === args.expected,
        };
      },
      name: "expect_toBe",
      description:
        "Asserts that the actual value is equal to the expected value.",
      parse: (args: string) => {
        return z
          .object({
            actual: z.string(),
            expected: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          actual: {
            type: "string",
          },
          expected: {
            type: "string",
          },
        },
      },
    },
    expect_notToBe: {
      function: (args: { actual: string; expected: string }) => {
        return {
          actual: args.actual,
          expected: args.expected,
          success: args.actual !== args.expected,
        };
      },
      name: "expect_notToBe",
      description:
        "Asserts that the actual value is not equal to the expected value.",
      parse: (args: string) => {
        return z
          .object({
            actual: z.string(),
            expected: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          actual: {
            type: "string",
          },
          expected: {
            type: "string",
          },
        },
      },
    },
    resultAssertion: {
      function: (args: { assertion: boolean }) => {
        return args;
      },
      parse: (args: string) => {
        return z
          .object({
            assertion: z.boolean(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "This function is called when the initial instructions asked to assert something; then 'assertion' is either true or false (boolean) depending on whether the assertion succeeded.",
      name: "resultAssertion",
      parameters: {
        type: "object",
        properties: {
          assertion: {
            type: "boolean",
          },
        },
      },
    },
    resultQuery: {
      function: (args: { assertion: boolean }) => {
        return args;
      },
      parse: (args: string) => {
        return z
          .object({
            query: z.string(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "This function is called at the end when the initial instructions asked to extract data; then 'query' property is set to a text value of the extracted data.",
      name: "resultQuery",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
          },
        },
      },
    },
    resultAction: {
      function: () => {
        return null;
      },
      parse: (args: string) => {
        return z.object({}).parse(JSON.parse(args));
      },
      description:
        "This function is called at the end when the initial instructions asked to perform an action.",
      name: "resultAction",
      parameters: {
        type: "object",
        properties: {},
      },
    },
    resultError: {
      function: (args: { errorMessage: string }) => {
        return {
          errorMessage: args.errorMessage,
        };
      },
      parse: (args: string) => {
        return z
          .object({
            errorMessage: z.string(),
          })
          .parse(JSON.parse(args));
      },
      description:
        "If user instructions cannot be completed, then this function is used to produce the final response.",
      name: "resultError",
      parameters: {
        type: "object",
        properties: {
          errorMessage: {
            type: "string",
          },
        },
      },
    },
  };
};
