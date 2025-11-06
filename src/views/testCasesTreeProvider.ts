import * as vscode from 'vscode';
import { TestCase } from '../services/aiProviderManager';

export class TestCasesTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private testCases: TestCase[] = [];
    private jiraKey: string = '';

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setTestCases(testCases: TestCase[], jiraKey: string): void {
        this.testCases = testCases;
        this.jiraKey = jiraKey;
        this.refresh();
    }

    getTestCases(): TestCase[] {
        return this.testCases;
    }

    getJiraKey(): string {
        return this.jiraKey;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (this.testCases.length === 0) {
            return Promise.resolve([]);
        }

        const items = this.testCases.map(tc => {
            const item = new vscode.TreeItem(
                `${tc.id}: ${tc.name}`,
                vscode.TreeItemCollapsibleState.None
            );
            item.tooltip = tc.objective;
            return item;
        });

        return Promise.resolve(items);
    }
}

