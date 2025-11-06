import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { CompleteIssue } from './jiraService';
import { AIProviderManager, TestCase } from './aiProviderManager';

export class TestGeneratorService {
    private aiProvider: AIProviderManager;

    constructor() {
        this.aiProvider = new AIProviderManager(null as any); // Context will be passed later
    }

    async generateFromJiraIssue(issue: CompleteIssue): Promise<TestCase[]> {
        const requirements = this.extractRequirements(issue);
        return await this.aiProvider.generateTestCases(requirements, issue.issue.key);
    }

    private extractRequirements(issue: CompleteIssue): string {
        let requirements = `Issue: ${issue.issue.key} - ${issue.issue.summary}\n\n`;
        
        if (issue.issue.description) {
            const descText = this.extractTextFromDescription(issue.issue.description);
            requirements += `Description:\n${descText}\n\n`;
        }

        if (issue.comments && issue.comments.length > 0) {
            requirements += `Comments:\n`;
            issue.comments.forEach((comment: any) => {
                requirements += `- ${comment.body}\n`;
            });
        }

        return requirements;
    }

    private extractTextFromDescription(description: any): string {
        if (typeof description === 'string') {
            return description;
        }
        
        // Handle ADF (Atlassian Document Format)
        if (description && description.content) {
            return this.extractTextFromADF(description);
        }
        
        return JSON.stringify(description);
    }

    private extractTextFromADF(adf: any): string {
        let text = '';
        
        const traverse = (node: any) => {
            if (node.type === 'text') {
                text += node.text + ' ';
            }
            if (node.content) {
                node.content.forEach((child: any) => traverse(child));
            }
        };

        if (adf.content) {
            adf.content.forEach((node: any) => traverse(node));
        }
        
        return text;
    }

    async saveTestCases(
        testCases: TestCase[],
        outputPath: string,
        fileName: string,
        format: string
    ): Promise<string> {
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
        } else if (format === 'json') {
            fs.writeFileSync(filePath, JSON.stringify(testCases, null, 2), 'utf-8');
        }

        return filePath;
    }

    private convertToCSV(testCases: TestCase[]): string {
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

    private escapeCSV(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}

