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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraService = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class JiraService {
    constructor(context) {
        this.client = null;
        this.context = context;
        this.initializeClient();
    }
    initializeClient() {
        const config = vscode.workspace.getConfiguration('qaTestGenerator.jira');
        const host = config.get('host');
        const email = config.get('email');
        const apiToken = config.get('apiToken');
        if (!host || !email || !apiToken) {
            vscode.window.showWarningMessage('Jira credentials not configured. Please configure in settings.', 'Open Settings').then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('qaTestGenerator.configure');
                }
            });
            return;
        }
        this.client = axios_1.default.create({
            baseURL: host,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
    }
    async getIssue(issueKey) {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }
        try {
            const response = await this.client.get(`/rest/api/3/issue/${issueKey}`);
            const issue = response.data;
            return {
                id: issue.id,
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
        }
        catch (error) {
            throw new Error(`Failed to fetch Jira issue: ${error.message}`);
        }
    }
    async getIssueComplete(issueKey) {
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
            const jiraIssue = {
                id: issue.id,
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
        }
        catch (error) {
            throw new Error(`Failed to fetch complete Jira issue: ${error.message}`);
        }
    }
    async searchIssues(jql, maxResults = 50) {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }
        try {
            const response = await this.client.post('/rest/api/3/search', {
                jql,
                maxResults,
                fields: ['summary', 'status', 'assignee', 'reporter', 'priority', 'created', 'updated']
            });
            return response.data.issues.map((issue) => ({
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
        }
        catch (error) {
            throw new Error(`Failed to search Jira issues: ${error.message}`);
        }
    }
    async getProjects() {
        if (!this.client) {
            throw new Error('Jira client not initialized');
        }
        try {
            const response = await this.client.get('/rest/api/3/project/search');
            return response.data.values;
        }
        catch (error) {
            throw new Error(`Failed to fetch Jira projects: ${error.message}`);
        }
    }
    extractFigmaLinks(description, comments) {
        const figmaRegex = /https:\/\/www\.figma\.com\/[^\s]+/g;
        const links = new Set();
        // Extract from description
        if (description) {
            const descText = this.extractTextFromADF(description);
            const matches = descText.match(figmaRegex);
            if (matches) {
                matches.forEach(link => links.add(link));
            }
        }
        // Extract from comments
        comments.forEach((comment) => {
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
    extractTextFromADF(adf) {
        if (!adf || !adf.content) {
            return '';
        }
        let text = '';
        const traverse = (node) => {
            if (node.type === 'text') {
                text += node.text + ' ';
            }
            if (node.type === 'inlineCard' && node.attrs?.url) {
                text += node.attrs.url + ' ';
            }
            if (node.content) {
                node.content.forEach((child) => traverse(child));
            }
        };
        adf.content.forEach((node) => traverse(node));
        return text;
    }
    extractAcceptanceCriteria(description) {
        const text = this.extractTextFromADF(description);
        const criteria = [];
        // Simple extraction logic - can be enhanced
        const lines = text.split('\n');
        let inCriteria = false;
        lines.forEach(line => {
            if (line.includes('Acceptance Criteria') || line.includes('Acceptance criteria')) {
                inCriteria = true;
            }
            else if (inCriteria && line.trim().startsWith('[ ]')) {
                criteria.push(line.replace('[ ]', '').trim());
            }
        });
        return criteria;
    }
}
exports.JiraService = JiraService;
//# sourceMappingURL=jiraService.js.map