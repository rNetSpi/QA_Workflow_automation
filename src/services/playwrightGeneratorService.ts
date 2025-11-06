import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TestCase } from './aiProviderManager';

interface TestScript {
    fileName: string;
    content: string;
}

export class PlaywrightGeneratorService {
    async generateFromTestCases(testCases: TestCase[]): Promise<TestScript[]> {
        const scripts: TestScript[] = [];
        
        for (const testCase of testCases) {
            const script = this.generateTestScript(testCase);
            scripts.push(script);
        }

        return scripts;
    }

    private generateTestScript(testCase: TestCase): TestScript {
        const fileName = `${testCase.id.toLowerCase()}-${this.sanitizeFileName(testCase.name)}.spec.ts`;
        
        const content = `import { test, expect } from '@playwright/test';

test.describe('${testCase.name}', () => {
    test.beforeEach(async ({ page }) => {
        // Setup: ${testCase.preconditions}
    });

    test('${testCase.id}: ${testCase.name}', async ({ page }) => {
        // Objective: ${testCase.objective}
        
        // Test Steps:
        ${this.generateSteps(testCase.testSteps)}
        
        // Expected Result:
        // ${testCase.expectedResult}
    });
});
`;

        return { fileName, content };
    }

    private generateSteps(testSteps: string): string {
        const steps = testSteps.split('\n').filter(s => s.trim());
        return steps.map((step, index) => {
            const cleaned = step.replace(/^\d+\.\s*/, '').trim();
            return `// Step ${index + 1}: ${cleaned}`;
        }).join('\n        ');
    }

    private sanitizeFileName(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
    }

    async saveTestScript(script: TestScript, outputPath: string): Promise<string> {
        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            throw new Error('No workspace folder open');
        }

        const fullPath = path.join(workspace.uri.fsPath, outputPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        const filePath = path.join(fullPath, script.fileName);
        fs.writeFileSync(filePath, script.content, 'utf-8');

        return filePath;
    }
}

