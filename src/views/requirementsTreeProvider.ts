import * as vscode from 'vscode';
import { CompleteIssue } from '../services/jiraService';

export class RequirementsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private currentIssue: CompleteIssue | null = null;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setIssue(issue: CompleteIssue): void {
        this.currentIssue = issue;
        this.refresh();
    }

    getCurrentIssue(): CompleteIssue | null {
        return this.currentIssue;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!this.currentIssue) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level
            return Promise.resolve([
                this.createTreeItem('Issue Details', vscode.TreeItemCollapsibleState.Expanded),
                this.createTreeItem('Attachments', vscode.TreeItemCollapsibleState.Collapsed),
                this.createTreeItem('Comments', vscode.TreeItemCollapsibleState.Collapsed)
            ]);
        }

        return Promise.resolve([]);
    }

    private createTreeItem(label: string, state: vscode.TreeItemCollapsibleState): vscode.TreeItem {
        const item = new vscode.TreeItem(label, state);
        return item;
    }
}

