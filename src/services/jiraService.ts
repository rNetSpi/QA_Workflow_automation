import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface JiraIssue {
    key: string;
    summary: string;
    description: any;
    status: string;
    assignee: string;
    reporter: string;
    priority: string;
    labels: string[];
    created: string;
    updated: string;
}

export interface CompleteIssue {
    issue: JiraIssue;
    attachments: any[];
    comments: any[];
    figmaLinks: string[];
}

export class JiraService {
    private client: AxiosInstance | null = null;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeClient();
    }

    private initializeClient() {
        const config = vscode.workspace.getConfiguration('qaTestGenerator.jira');
        const host = config.get<string>('host');
        const email = config.get<string>('email');
        const apiToken = config.get<string>('apiToken');

        if (!host || !email || !apiToken) {
            vscode.window.showWarningMessage(
                'Jira credentials not configured. Please configure in settings.',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('qaTestGenerator.configure');
                }
            });
            return;
        }

        this.client = axios.create({
            baseURL: host,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async getIssue(issueKey: string): Promise<JiraIssue> {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }

        try {
            const response = await this.client.get(`/rest/api/3/issue/${issueKey}`);
            const issue = response.data;

            return {
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description,
                status: issue.fields.status.name,
                assignee: issue.fields.assignee?.displayName || 'Unassigned',
                reporter: issue.fields.reporter?.displayName || 'Unknown',
                priority: issue.fields.priority?.name || 'Medium',
                labels: issue.fields.labels || [],
                created: issue.fields.created,
                updated: issue.fields.updated
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch Jira issue: ${error.message}`);
        }
    }

    async getIssueComplete(issueKey: string): Promise<CompleteIssue> {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }

        try {
            const response = await this.client.get(`/rest/api/3/issue/${issueKey}`, {
                params: {
                    expand: 'renderedFields'
                }
            });
            const issue = response.data;

            // Get basic issue info
            const jiraIssue: JiraIssue = {
                key: issue.key,
                summary: issue.fields.summary,
                description: issue.fields.description,
                status: issue.fields.status.name,
                assignee: issue.fields.assignee?.displayName || 'Unassigned',
                reporter: issue.fields.reporter?.displayName || 'Unknown',
                priority: issue.fields.priority?.name || 'Medium',
                labels: issue.fields.labels || [],
                created: issue.fields.created,
                updated: issue.fields.updated
            };

            // Get attachments
            const attachments = issue.fields.attachment || [];

            // Get comments
            const comments = issue.fields.comment?.comments || [];

            // Extract Figma links
            const figmaLinks = this.extractFigmaLinks(issue.fields.description, comments);

            return {
                issue: jiraIssue,
                attachments,
                comments,
                figmaLinks
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch complete Jira issue: ${error.message}`);
        }
    }

    async searchIssues(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }

        try {
            const response = await this.client.post('/rest/api/3/search', {
                jql,
                maxResults,
                fields: ['summary', 'status', 'assignee', 'reporter', 'priority', 'created', 'updated']
            });

            return response.data.issues.map((issue: any) => ({
                key: issue.key,
                summary: issue.fields.summary,
                description: null,
                status: issue.fields.status.name,
                assignee: issue.fields.assignee?.displayName || 'Unassigned',
                reporter: issue.fields.reporter?.displayName || 'Unknown',
                priority: issue.fields.priority?.name || 'Medium',
                labels: issue.fields.labels || [],
                created: issue.fields.created,
                updated: issue.fields.updated
            }));
        } catch (error: any) {
            throw new Error(`Failed to search Jira issues: ${error.message}`);
        }
    }

    async getProjects(): Promise<any[]> {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }

        try {
            const response = await this.client.get('/rest/api/3/project/search');
            return response.data.values;
        } catch (error: any) {
            throw new Error(`Failed to fetch Jira projects: ${error.message}`);
        }
    }

    private extractFigmaLinks(description: any, comments: any[]): string[] {
        const figmaRegex = /https:\/\/www\.figma\.com\/[^\s]+/g;
        const links: Set<string> = new Set();

        // Extract from description
        if (description) {
            const descText = this.extractTextFromADF(description);
            const matches = descText.match(figmaRegex);
            if (matches) {
                matches.forEach(link => links.add(link));
            }
        }

        // Extract from comments
        comments.forEach((comment: any) => {
            if (comment.body) {
                const commentText = this.extractTextFromADF(comment.body);
                const matches = commentText.match(figmaRegex);
                if (matches) {
                    matches.forEach(link => links.add(link));
                }
            }
        });

        return Array.from(links);
    }

    private extractTextFromADF(adf: any): string {
        if (!adf || !adf.content) {
            return '';
        }

        let text = '';
        const traverse = (node: any) => {
            if (node.type === 'text') {
                text += node.text + ' ';
            }
            if (node.type === 'inlineCard' && node.attrs?.url) {
                text += node.attrs.url + ' ';
            }
            if (node.content) {
                node.content.forEach((child: any) => traverse(child));
            }
        };

        adf.content.forEach((node: any) => traverse(node));
        return text;
    }

    extractAcceptanceCriteria(description: any): string[] {
        const text = this.extractTextFromADF(description);
        const criteria: string[] = [];

        // Simple extraction logic - can be enhanced
        const lines = text.split('\n');
        let inCriteria = false;

        lines.forEach(line => {
            if (line.includes('Acceptance Criteria') || line.includes('Acceptance criteria')) {
                inCriteria = true;
            } else if (inCriteria && line.trim().startsWith('[ ]')) {
                criteria.push(line.replace('[ ]', '').trim());
            }
        });

        return criteria;
    }
}

