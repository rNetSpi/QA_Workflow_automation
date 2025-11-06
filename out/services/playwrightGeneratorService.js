"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightGeneratorService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PlaywrightGeneratorService {
    async generateFromTestCases(testCases) {
        const scripts = [];
        for (const testCase of testCases) {
            const script = this.generateTestScript(testCase);
            scripts.push(script);
        }
        return scripts;
    }
    generateTestScript(testCase) {
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
    generateSteps(testSteps) {
        const steps = testSteps.split('\n').filter(s => s.trim());
        return steps.map((step, index) => {
            const cleaned = step.replace(/^\d+\.\s*/, '').trim();
            return `// Step ${index + 1}: ${cleaned}`;
        }).join('\n        ');
    }
    sanitizeFileName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
    }
    async saveTestScript(script, outputPath) {
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
exports.PlaywrightGeneratorService = PlaywrightGeneratorService;
//# sourceMappingURL=playwrightGeneratorService.js.map