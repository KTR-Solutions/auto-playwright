import * as fs from 'fs';

export class TestRecorder {
  private static instance: TestRecorder;
  private commands: string[] = [];

  private testHeader = `
    import { test } from '@playwright/test';
    test('Test name', async ({ page }) => {
    `;

  private constructor() {
    // private constructor to prevent instantiation
  }

  public static getInstance(): TestRecorder {
    if (!TestRecorder.instance) {
      TestRecorder.instance = new TestRecorder();
    }
    return TestRecorder.instance;
  }

  public addCommand(command: string) {
    console.log(command);
    this.commands.push(`await ${command}`);
  }

  public setTestName(name: string) {
    this.testHeader = this.testHeader.replace("Test name", name);
  }

  public getTestCase() {
    return `${this.testHeader}\n${this.commands.join("\n")}\n});`;
  }
}

export const simplifAi = (testName: string) => {
  TestRecorder.getInstance().setTestName(testName);
  fs.writeFileSync('output.spec.ts', TestRecorder.getInstance().getTestCase());
}
TestRecorder.getInstance()