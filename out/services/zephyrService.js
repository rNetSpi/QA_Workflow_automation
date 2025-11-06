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
exports.ZephyrService = void 0;
const vscode = __importStar(require("vscode"));
class ZephyrService {
    constructor(context) {
        this.context = context;
    }
    async findFolderByName(folderName) {
        // Stub implementation
        vscode.window.showInformationMessage(`Finding folder: ${folderName}`);
        return '25532992'; // Default folder ID
    }
    async uploadTestCases(testCases, folderId, progressCallback) {
        // Stub implementation
        vscode.window.showInformationMessage(`Uploading ${testCases.length} test cases to folder ${folderId}`);
        return {
            successful: testCases.length,
            failed: 0
        };
    }
    async getTestCasesFromFolder(folderName) {
        // Stub implementation
        vscode.window.showInformationMessage(`Getting test cases from folder: ${folderName}`);
        return [];
    }
    async linkTestCasesToJira(testCaseKeys, jiraKey, progressCallback) {
        // Stub implementation
        vscode.window.showInformationMessage(`Linking ${testCaseKeys.length} test cases to ${jiraKey}`);
        return {
            successful: testCaseKeys.length,
            failed: 0
        };
    }
}
exports.ZephyrService = ZephyrService;
//# sourceMappingURL=zephyrService.js.map