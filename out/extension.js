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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const jiraService_1 = require("./services/jiraService");
const zephyrService_1 = require("./services/zephyrService");
const testGeneratorService_1 = require("./services/testGeneratorService");
const playwrightGeneratorService_1 = require("./services/playwrightGeneratorService");
const requirementsTreeProvider_1 = require("./views/requirementsTreeProvider");
const testCasesTreeProvider_1 = require("./views/testCasesTreeProvider");
let jiraService;
let zephyrService;
let testGeneratorService;
let playwrightGeneratorService;
function activate(context) {
    console.log('QA Test Generator extension is now active!');
    // Initialize services
    jiraService = new jiraService_1.JiraService(context);
    zephyrService = new zephyrService_1.ZephyrService(context);
    testGeneratorService = new testGeneratorService_1.TestGeneratorService();
    playwrightGeneratorService = new playwrightGeneratorService_1.PlaywrightGeneratorService();
    // Initialize tree views
    const requirementsProvider = new requirementsTreeProvider_1.RequirementsTreeProvider();
    const testCasesProvider = new testCasesTreeProvider_1.TestCasesTreeProvider();
    vscode.window.registerTreeDataProvider('qaTestGenerator.requirementsView', requirementsProvider);
    vscode.window.registerTreeDataProvider('qaTestGenerator.testCasesView', testCasesProvider);
    // Register commands
    registerCommands(context, requirementsProvider, testCasesProvider);
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(beaker) QA Test Gen';
    statusBarItem.tooltip = 'QA Test Generator - Click to configure';
    statusBarItem.command = 'qaTestGenerator.configure';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
function registerCommands(context, requirementsProvider, testCasesProvider) {
    // Fetch Jira Issue
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.fetchJiraIssue', async () => {
        const issueKey = await vscode.window.showInputBox({
            prompt: 'Enter Jira Issue Key (e.g., PLTF-4571)',
            placeHolder: 'PLTF-4571',
            validateInput: (value) => {
                return /^[A-Z]+-\d+$/.test(value) ? null : 'Invalid Jira issue key format';
            }
        });
        if (!issueKey) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Fetching Jira Issue',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: `Fetching ${issueKey}...` });
                const issue = await jiraService.getIssueComplete(issueKey);
                requirementsProvider.setIssue(issue);
                vscode.window.showInformationMessage(`✅ Successfully fetched ${issueKey}: ${issue.issue.summary}`);
                // Ask if user wants to generate test cases
                const generate = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Generate test cases now?'
                });
                if (generate === 'Yes') {
                    vscode.commands.executeCommand('qaTestGenerator.generateTestCases');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to fetch Jira issue: ${error}`);
            }
        });
    }));
    // Generate Test Cases
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.generateTestCases', async () => {
        const issue = requirementsProvider.getCurrentIssue();
        if (!issue) {
            vscode.window.showWarningMessage('Please fetch a Jira issue first');
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating Test Cases',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Analyzing requirements...' });
                const testCases = await testGeneratorService.generateFromJiraIssue(issue);
                progress.report({ message: `Generated ${testCases.length} test cases...` });
                // Save to file
                const config = vscode.workspace.getConfiguration('qaTestGenerator');
                const outputPath = config.get('testCases.outputPath', './testCases');
                const format = config.get('testCases.format', 'csv');
                const fileName = `${issue.issue.key}_TestCases.${format}`;
                const filePath = await testGeneratorService.saveTestCases(testCases, outputPath, fileName, format);
                testCasesProvider.setTestCases(testCases, issue.issue.key);
                vscode.window.showInformationMessage(`✅ Generated ${testCases.length} test cases`, 'Open File', 'Upload to Zephyr').then(selection => {
                    if (selection === 'Open File') {
                        vscode.workspace.openTextDocument(filePath).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                    else if (selection === 'Upload to Zephyr') {
                        vscode.commands.executeCommand('qaTestGenerator.uploadToZephyr');
                    }
                });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to generate test cases: ${error}`);
            }
        });
    }));
    // Upload to Zephyr
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.uploadToZephyr', async () => {
        const testCases = testCasesProvider.getTestCases();
        const jiraKey = testCasesProvider.getJiraKey();
        if (!testCases || testCases.length === 0) {
            vscode.window.showWarningMessage('No test cases to upload');
            return;
        }
        const config = vscode.workspace.getConfiguration('qaTestGenerator');
        let folderName = config.get('zephyr.defaultFolder', 'AutomatedTests');
        // Ask user for folder name
        const inputFolder = await vscode.window.showInputBox({
            prompt: 'Enter Zephyr folder name',
            value: folderName,
            placeHolder: 'AutomatedTests'
        });
        if (!inputFolder) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Uploading to Zephyr Scale',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Finding folder...' });
                const folderId = await zephyrService.findFolderByName(inputFolder);
                progress.report({ message: `Uploading ${testCases.length} test cases...` });
                const results = await zephyrService.uploadTestCases(testCases, folderId, (current, total) => {
                    progress.report({
                        message: `Uploading test case ${current}/${total}...`,
                        increment: (1 / total) * 100
                    });
                });
                vscode.window.showInformationMessage(`✅ Uploaded ${results.successful} test cases to Zephyr`, 'Link to Jira').then(selection => {
                    if (selection === 'Link to Jira') {
                        vscode.commands.executeCommand('qaTestGenerator.linkToJira');
                    }
                });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to upload to Zephyr: ${error}`);
            }
        });
    }));
    // Link to Jira
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.linkToJira', async () => {
        const jiraKey = testCasesProvider.getJiraKey();
        if (!jiraKey) {
            vscode.window.showWarningMessage('No Jira issue associated with test cases');
            return;
        }
        const config = vscode.workspace.getConfiguration('qaTestGenerator');
        const folderName = config.get('zephyr.defaultFolder', 'AutomatedTests');
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Linking Test Cases to Jira',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Fetching test cases from folder...' });
                const testCaseKeys = await zephyrService.getTestCasesFromFolder(folderName);
                progress.report({ message: `Linking ${testCaseKeys.length} test cases...` });
                const results = await zephyrService.linkTestCasesToJira(testCaseKeys, jiraKey, (current, total) => {
                    progress.report({
                        message: `Linking test case ${current}/${total}...`,
                        increment: (1 / total) * 100
                    });
                });
                vscode.window.showInformationMessage(`✅ Linked ${results.successful} test cases to ${jiraKey}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to link test cases: ${error}`);
            }
        });
    }));
    // Generate Playwright Tests
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.generatePlaywright', async () => {
        const testCases = testCasesProvider.getTestCases();
        if (!testCases || testCases.length === 0) {
            vscode.window.showWarningMessage('No test cases available');
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating Playwright Tests',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Generating test scripts...' });
                const scripts = await playwrightGeneratorService.generateFromTestCases(testCases);
                const config = vscode.workspace.getConfiguration('qaTestGenerator');
                const outputPath = config.get('playwright.outputPath', './tests');
                for (let i = 0; i < scripts.length; i++) {
                    progress.report({
                        message: `Writing test file ${i + 1}/${scripts.length}...`,
                        increment: (1 / scripts.length) * 100
                    });
                    await playwrightGeneratorService.saveTestScript(scripts[i], outputPath);
                }
                vscode.window.showInformationMessage(`✅ Generated ${scripts.length} Playwright test files`, 'Open Tests Folder').then(selection => {
                    if (selection === 'Open Tests Folder') {
                        vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(outputPath));
                    }
                });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to generate Playwright tests: ${error}`);
            }
        });
    }));
    // Run Complete Workflow
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.runCompleteWorkflow', async () => {
        const issueKey = await vscode.window.showInputBox({
            prompt: 'Enter Jira Issue Key for complete workflow',
            placeHolder: 'PLTF-4571'
        });
        if (!issueKey) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running Complete Workflow',
            cancellable: false
        }, async (progress) => {
            try {
                // Step 1: Fetch Jira
                progress.report({ message: 'Step 1/5: Fetching Jira issue...' });
                await vscode.commands.executeCommand('qaTestGenerator.fetchJiraIssue');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Step 2: Generate Test Cases
                progress.report({ message: 'Step 2/5: Generating test cases...', increment: 20 });
                await vscode.commands.executeCommand('qaTestGenerator.generateTestCases');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Step 3: Upload to Zephyr
                progress.report({ message: 'Step 3/5: Uploading to Zephyr...', increment: 20 });
                await vscode.commands.executeCommand('qaTestGenerator.uploadToZephyr');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Step 4: Link to Jira
                progress.report({ message: 'Step 4/5: Linking to Jira...', increment: 20 });
                await vscode.commands.executeCommand('qaTestGenerator.linkToJira');
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Step 5: Generate Playwright
                progress.report({ message: 'Step 5/5: Generating Playwright tests...', increment: 20 });
                await vscode.commands.executeCommand('qaTestGenerator.generatePlaywright');
                vscode.window.showInformationMessage(`✅ Complete workflow finished for ${issueKey}!`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Workflow failed: ${error}`);
            }
        });
    }));
    // Configure Settings
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.configure', async () => {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'qaTestGenerator');
    }));
    // Test AI API Connection
    context.subscriptions.push(vscode.commands.registerCommand('qaTestGenerator.testAIConnection', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Testing AI API Connection',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Connecting to AI provider...' });
                const config = vscode.workspace.getConfiguration('qaTestGenerator.ai');
                const provider = config.get('provider', 'template-based');
                const apiKey = config.get('apiKey', '');
                vscode.window.showInformationMessage(`Testing connection for: ${provider}\nAPI Key configured: ${apiKey ? 'Yes' : 'No'}`);
                // Create a new AI provider manager instance
                const { AIProviderManager } = require('./services/aiProviderManager');
                const aiManager = new AIProviderManager(context);
                const result = await aiManager.testAPIConnection();
                if (result.success) {
                    vscode.window.showInformationMessage(result.message);
                }
                else {
                    vscode.window.showErrorMessage(result.message, 'Show Details').then(selection => {
                        if (selection === 'Show Details' && result.details) {
                            const detailsPanel = vscode.window.createOutputChannel('AI API Test Details');
                            detailsPanel.clear();
                            detailsPanel.appendLine('AI API Connection Test Failed');
                            detailsPanel.appendLine('='.repeat(50));
                            detailsPanel.appendLine(`Provider: ${provider}`);
                            detailsPanel.appendLine(`API Key Present: ${apiKey ? 'Yes' : 'No'}`);
                            detailsPanel.appendLine('');
                            detailsPanel.appendLine('Error Details:');
                            detailsPanel.appendLine(JSON.stringify(result.details, null, 2));
                            detailsPanel.show();
                        }
                    });
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Connection test failed: ${error}`);
            }
        });
    }));
}
function deactivate() {
    console.log('QA Test Generator extension is now deactivated');
}
//# sourceMappingURL=extension.js.map