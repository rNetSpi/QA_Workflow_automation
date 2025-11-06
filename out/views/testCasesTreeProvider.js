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
exports.TestCasesTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
class TestCasesTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.testCases = [];
        this.jiraKey = '';
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    setTestCases(testCases, jiraKey) {
        this.testCases = testCases;
        this.jiraKey = jiraKey;
        this.refresh();
    }
    getTestCases() {
        return this.testCases;
    }
    getJiraKey() {
        return this.jiraKey;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (this.testCases.length === 0) {
            return Promise.resolve([]);
        }
        const items = this.testCases.map(tc => {
            const item = new vscode.TreeItem(`${tc.id}: ${tc.name}`, vscode.TreeItemCollapsibleState.None);
            item.tooltip = tc.objective;
            return item;
        });
        return Promise.resolve(items);
    }
}
exports.TestCasesTreeProvider = TestCasesTreeProvider;
//# sourceMappingURL=testCasesTreeProvider.js.map