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
exports.TestGeneratorService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const aiProviderManager_1 = require("./aiProviderManager");
class TestGeneratorService {
    constructor() {
        this.aiProvider = new aiProviderManager_1.AIProviderManager(null); // Context will be passed later
    }
    async generateFromJiraIssue(issue) {
        const requirements = this.extractRequirements(issue);
        return await this.aiProvider.generateTestCases(requirements, issue.issue.key);
    }
    extractRequirements(issue) {
        let requirements = `Issue: ${issue.issue.key} - ${issue.issue.summary}\n\n`;
        if (issue.issue.description) {
            const descText = this.extractTextFromDescription(issue.issue.description);
            requirements += `Description:\n${descText}\n\n`;
        }
        if (issue.comments && issue.comments.length > 0) {
            requirements += `Comments:\n`;
            issue.comments.forEach((comment) => {
                requirements += `- ${comment.body}\n`;
            });
        }
        return requirements;
    }
    extractTextFromDescription(description) {
        if (typeof description === 'string') {
            return description;
        }
        // Handle ADF (Atlassian Document Format)
        if (description && description.content) {
            return this.extractTextFromADF(description);
        }
        return JSON.stringify(description);
    }
    extractTextFromADF(adf) {
        let text = '';
        const traverse = (node) => {
            if (node.type === 'text') {
                text += node.text + ' ';
            }
            if (node.content) {
                node.content.forEach((child) => traverse(child));
            }
        };
        if (adf.content) {
            adf.content.forEach((node) => traverse(node));
        }
        return text;
    }
    async saveTestCases(testCases, outputPath, fileName, format) {
        // Ensure output directory exists
        const workspace = vscode.workspace.workspaceFolders?.[0];
        if (!workspace) {
            throw new Error('No workspace folder open');
        }
        const fullPath = path.join(workspace.uri.fsPath, outputPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        const filePath = path.join(fullPath, fileName);
        if (format === 'csv') {
            const csv = this.convertToCSV(testCases);
            fs.writeFileSync(filePath, csv, 'utf-8');
        }
        else if (format === 'json') {
            fs.writeFileSync(filePath, JSON.stringify(testCases, null, 2), 'utf-8');
        }
        return filePath;
    }
    convertToCSV(testCases) {
        const header = 'Test Case ID,Test Case Name,Objective,Preconditions,Test Steps,Expected Result,Priority\n';
        const rows = testCases.map(tc => {
            return [
                tc.id,
                this.escapeCSV(tc.name),
                this.escapeCSV(tc.objective),
                this.escapeCSV(tc.preconditions),
                this.escapeCSV(tc.testSteps),
                this.escapeCSV(tc.expectedResult),
                tc.priority
            ].join(',');
        });
        return header + rows.join('\n');
    }
    escapeCSV(value) {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
exports.TestGeneratorService = TestGeneratorService;
//# sourceMappingURL=testGeneratorService.js.map