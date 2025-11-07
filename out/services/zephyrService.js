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
exports.ZephyrService = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class ZephyrService {
    constructor(context, jiraService) {
        this.jiraService = null;
        this.context = context;
        this.jiraService = jiraService || null;
    }
    /**
     * Load config dynamically to pick up any settings changes
     */
    getConfig() {
        const config = vscode.workspace.getConfiguration('qaTestGenerator.zephyr');
        return {
            apiToken: config.get('apiToken', ''),
            jwtToken: config.get('jwtToken', ''),
            projectKey: config.get('projectKey', 'PLTF'),
            projectId: config.get('projectId', '10024'),
            baseUrl: 'https://api.zephyrscale.smartbear.com/v2',
            tm4jBaseUrl: 'https://app.tm4j.smartbear.com/backend/rest/tests/2.0'
        };
    }
    getHeaders() {
        const config = this.getConfig();
        return {
            'Authorization': `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json'
        };
    }
    /**
     * Find folder by name in Zephyr Scale
     */
    async findFolderByName(folderName) {
        const config = this.getConfig();
        if (!config.apiToken) {
            console.warn('[Zephyr] No API token configured, using mock mode');
            vscode.window.showWarningMessage('⚠️ Zephyr API token not configured. Running in mock mode.');
            return 'mock-folder-id';
        }
        try {
            console.log(`[Zephyr] 🔍 Searching for folder: "${folderName}" in project ${config.projectKey}`);
            const response = await axios_1.default.get(`${config.baseUrl}/folders`, {
                headers: this.getHeaders(),
                params: {
                    projectKey: config.projectKey,
                    folderType: 'TEST_CASE',
                    maxResults: 1000
                }
            });
            const folders = response.data.values || response.data;
            console.log(`[Zephyr] 📁 Retrieved ${folders.length} folders from Zephyr`);
            // Log all folder names for debugging
            if (folders.length > 0) {
                console.log(`[Zephyr] 📋 Available folders:`);
                folders.forEach((f) => {
                    console.log(`   - "${f.name}" (ID: ${f.id})`);
                });
            }
            // Recursive function to search through folders and subfolders
            const searchFolders = (folderList) => {
                for (const f of folderList) {
                    // Exact match (case-sensitive)
                    if (f.name === folderName) {
                        return f;
                    }
                    // Search in subfolders if they exist
                    if (f.children && f.children.length > 0) {
                        const found = searchFolders(f.children);
                        if (found)
                            return found;
                    }
                }
                return null;
            };
            // First try exact match
            let folder = searchFolders(folders);
            // If not found, try case-insensitive match
            if (!folder) {
                console.log(`[Zephyr] ⚠️ Exact match not found, trying case-insensitive search...`);
                const searchFoldersCaseInsensitive = (folderList) => {
                    for (const f of folderList) {
                        if (f.name.toLowerCase() === folderName.toLowerCase()) {
                            return f;
                        }
                        if (f.children && f.children.length > 0) {
                            const found = searchFoldersCaseInsensitive(f.children);
                            if (found)
                                return found;
                        }
                    }
                    return null;
                };
                folder = searchFoldersCaseInsensitive(folders);
            }
            if (folder) {
                console.log(`[Zephyr] ✅ Found existing folder: "${folder.name}" (ID: ${folder.id})`);
                vscode.window.showInformationMessage(`📁 Using existing folder: "${folder.name}"`);
                return folder.id.toString();
            }
            else {
                console.log(`[Zephyr] ❌ Folder "${folderName}" not found in Zephyr`);
                // Ask user if they want to create a new folder
                const choice = await vscode.window.showWarningMessage(`Folder "${folderName}" does not exist in Zephyr. What would you like to do?`, 'Create New Folder', 'Cancel Upload', 'Use Root Folder');
                if (choice === 'Create New Folder') {
                    console.log(`[Zephyr] 📁 Creating new folder: ${folderName}`);
                    return await this.createFolder(folderName);
                }
                else if (choice === 'Use Root Folder') {
                    console.log(`[Zephyr] 📁 Using root folder (no folder assignment)`);
                    vscode.window.showInformationMessage(`Test cases will be created in root folder`);
                    return 'root'; // Special value to skip folder assignment
                }
                else {
                    throw new Error('Upload cancelled by user');
                }
            }
        }
        catch (error) {
            console.error('[Zephyr] Error finding folder:', error.response?.data || error.message);
            if (error.message === 'Upload cancelled by user') {
                throw error;
            }
            vscode.window.showWarningMessage(`⚠️ Could not connect to Zephyr. Running in mock mode. Error: ${error.message}`);
            return 'mock-folder-id';
        }
    }
    /**
     * Create a new folder in Zephyr Scale
     */
    async createFolder(folderName) {
        const config = this.getConfig();
        try {
            const response = await axios_1.default.post(`${config.baseUrl}/folders`, {
                name: folderName,
                projectKey: config.projectKey,
                folderType: 'TEST_CASE'
            }, { headers: this.getHeaders() });
            const folderId = response.data.id;
            console.log(`[Zephyr] Created folder ${folderName} with ID: ${folderId}`);
            vscode.window.showInformationMessage(`✅ Created Zephyr folder: ${folderName}`);
            return folderId.toString();
        }
        catch (error) {
            console.error('[Zephyr] Error creating folder:', error.response?.data || error.message);
            throw new Error(`Failed to create folder: ${error.message}`);
        }
    }
    /**
     * Upload test cases to Zephyr Scale
     */
    async uploadTestCases(testCases, folderId, progressCallback) {
        const config = this.getConfig();
        console.log(`[Zephyr] Starting upload of ${testCases.length} test cases to folder ${folderId}`);
        // Array to track successfully uploaded test cases
        const uploadedTestCases = [];
        // Check if we're in mock mode
        if (!config.apiToken || folderId === 'mock-folder-id') {
            console.log('[Zephyr] Running in MOCK mode - not actually uploading to Zephyr');
            // Simulate progress
            for (let i = 0; i < testCases.length; i++) {
                if (progressCallback) {
                    progressCallback(i + 1, testCases.length);
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            vscode.window.showWarningMessage(`⚠️ Mock upload completed. Configure Zephyr API token to upload for real.`);
            return { successful: testCases.length, failed: 0, uploadedTestCases: [] };
        }
        // Log folder assignment info
        if (folderId === 'root') {
            console.log('[Zephyr] ℹ️  Test cases will be created in root folder (no folder assignment)');
        }
        else {
            console.log(`[Zephyr] ℹ️  Test cases will be created in folder ID: ${folderId}`);
        }
        let successful = 0;
        let failed = 0;
        const errors = [];
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            try {
                console.log(`[Zephyr] Uploading test case ${i + 1}/${testCases.length}: ${testCase.id}`);
                // Normalize preconditions (handle \n escapes)
                const normalizedPreconditions = testCase.preconditions.replace(/\\n/g, '\n');
                console.log(`[Zephyr] Test case: ${testCase.name}`);
                console.log(`[Zephyr] Preconditions: ${normalizedPreconditions.substring(0, 100)}...`);
                // First, create the test case WITHOUT test script
                // Step 1: Create test case WITHOUT folder (folder assignment comes later)
                const testCasePayload = {
                    projectKey: config.projectKey,
                    name: testCase.name,
                    objective: testCase.objective,
                    precondition: normalizedPreconditions,
                    estimatedTime: 0,
                    labels: [],
                    customFields: {},
                    priority: this.mapPriority(testCase.priority),
                    status: 'Approved'
                };
                console.log(`[Zephyr] Creating test case: ${testCase.name}`);
                const createResponse = await axios_1.default.post(`${config.baseUrl}/testcases`, testCasePayload, { headers: this.getHeaders() });
                const createdTestCase = createResponse.data;
                console.log(`[Zephyr] Test case created with key: ${createdTestCase.key}, ID: ${createdTestCase.id}`);
                // Step 2: Move to folder (if not mock or root)
                if (folderId !== 'mock-folder-id' && folderId !== 'root') {
                    console.log(`[Zephyr] Moving test case to folder ${folderId}...`);
                    // Get the full test case to preserve all fields
                    const getResponse = await axios_1.default.get(`${config.baseUrl}/testcases/${createdTestCase.key}`, { headers: this.getHeaders() });
                    const currentTestCase = getResponse.data;
                    // Update with folder assignment
                    const updateData = {
                        ...currentTestCase,
                        folder: {
                            id: parseInt(folderId)
                        }
                    };
                    const updateResponse = await axios_1.default.put(`${config.baseUrl}/testcases/${createdTestCase.key}`, updateData, { headers: this.getHeaders() });
                    if (updateResponse.status === 200) {
                        console.log(`[Zephyr] ✅ Successfully moved to folder ${folderId}`);
                    }
                    else {
                        console.warn(`[Zephyr] ⚠️ Folder assignment may have failed: ${updateResponse.status}`);
                    }
                }
                else {
                    console.log(`[Zephyr] Skipping folder assignment (will stay in root)`);
                }
                // Step 3: Add test steps using the correct API endpoint
                await this.addTestStepsToTestCase(createdTestCase.key, testCase.testSteps, testCase.expectedResult);
                // Track the uploaded test case
                uploadedTestCases.push({
                    key: createdTestCase.key,
                    id: createdTestCase.id,
                    name: createdTestCase.name
                });
                successful++;
                console.log(`[Zephyr] Successfully uploaded: ${testCase.id}`);
            }
            catch (error) {
                failed++;
                const errorMsg = error.response?.data?.message || error.message;
                console.error(`[Zephyr] Failed to upload ${testCase.id}:`, errorMsg);
                errors.push(`${testCase.id}: ${errorMsg}`);
            }
            if (progressCallback) {
                progressCallback(i + 1, testCases.length);
            }
        }
        console.log(`[Zephyr] Upload completed. Success: ${successful}, Failed: ${failed}`);
        console.log(`[Zephyr] Uploaded test case keys:`, uploadedTestCases.map(tc => tc.key).join(', '));
        if (failed > 0) {
            vscode.window.showWarningMessage(`⚠️ Uploaded ${successful} test cases, ${failed} failed. Check console for details.`);
            console.error('[Zephyr] Failed uploads:', errors);
        }
        else {
            vscode.window.showInformationMessage(`✅ Successfully uploaded ${successful} test cases to Zephyr Scale`);
        }
        return { successful, failed, uploadedTestCases };
    }
    /**
     * Add test steps to an existing test case
     * Tries TM4J API (with JWT) first for reliability, falls back to v2 API (with Bearer) if needed
     */
    async addTestStepsToTestCase(testCaseKey, testSteps, expectedResult) {
        const config = this.getConfig();
        // If JWT token is configured, use TM4J API (most reliable)
        if (config.jwtToken) {
            console.log(`[Zephyr] 🔑 JWT token configured - using TM4J API for test steps`);
            return await this.addTestStepsViaTM4J(testCaseKey, testSteps, expectedResult);
        }
        // Otherwise try v2 API with API token (less reliable but might work)
        console.warn(`[Zephyr] ⚠️ JWT token not configured. Attempting v2 API (may not format correctly).`);
        console.warn(`[Zephyr] 💡 For best results, configure JWT token: qaTestGenerator.zephyr.jwtToken`);
        return await this.addTestStepsViaV2API(testCaseKey, testSteps, expectedResult);
    }
    /**
     * Add test steps using TM4J API with JWT token (RECOMMENDED - most reliable)
     */
    async addTestStepsViaTM4J(testCaseKey, testSteps, expectedResult) {
        const config = this.getConfig();
        try {
            // First, get the test case ID from the key
            console.log(`[Zephyr] Getting test case ID for key: ${testCaseKey}`);
            const testCaseResponse = await axios_1.default.get(`${config.baseUrl}/testcases/${testCaseKey}`, { headers: this.getHeaders() });
            const testCaseId = testCaseResponse.data.id;
            console.log(`[Zephyr] Test case ID: ${testCaseId}`);
            // Normalize line breaks
            const normalizedSteps = testSteps.replace(/\\n/g, '\n');
            const stepLines = normalizedSteps.split('\n').filter(s => s.trim());
            console.log(`[Zephyr] Adding ${stepLines.length} test steps to ${testCaseKey} (ID: ${testCaseId})`);
            // Create test steps array in TM4J format
            const steps = stepLines.map((step, index) => {
                const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
                const isLastStep = index === stepLines.length - 1;
                return {
                    id: Date.now() + index, // Generate unique ID
                    index: index,
                    description: cleanStep,
                    testData: null,
                    expectedResult: isLastStep ? (expectedResult || 'No expected result specified') : null,
                    userHasAccessToTestCase: null,
                    stepParameters: [],
                    customFieldValues: [],
                    reflectRef: null,
                    customFieldValueIndex: {}
                };
            });
            // If no steps parsed, create a single step
            if (steps.length === 0) {
                steps.push({
                    id: Date.now(),
                    index: 0,
                    description: testSteps || 'No test steps specified',
                    testData: null,
                    expectedResult: expectedResult || 'No expected result specified',
                    userHasAccessToTestCase: null,
                    stepParameters: [],
                    customFieldValues: [],
                    reflectRef: null,
                    customFieldValueIndex: {}
                });
            }
            // Create payload in TM4J format
            const testStepData = {
                id: testCaseId,
                projectId: parseInt(config.projectId),
                testScript: {
                    stepByStepScript: {
                        steps: steps
                    }
                }
            };
            console.log(`[Zephyr] Sending ${steps.length} steps to TM4J API`);
            console.log(`[Zephyr] API URL: ${config.tm4jBaseUrl}/testcase/${testCaseId}`);
            console.log(`[Zephyr] Using JWT token for authentication`);
            // Add test steps using TM4J API with JWT token
            const response = await axios_1.default.put(`${config.tm4jBaseUrl}/testcase/${testCaseId}`, testStepData, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': `JWT ${config.jwtToken}`,
                    'content-type': 'application/json',
                    'jira-project-id': config.projectId
                }
            });
            console.log(`[Zephyr] ✅ Test steps added successfully to ${testCaseKey}`);
            console.log(`[Zephyr] Response status:`, response.status);
        }
        catch (error) {
            console.error(`[Zephyr] ❌ Error adding test steps to ${testCaseKey}:`, error.response?.data || error.message);
            if (error.response) {
                console.error(`[Zephyr] Response status: ${error.response.status}`);
                console.error(`[Zephyr] Response data:`, JSON.stringify(error.response.data, null, 2));
                if (error.response.status === 401) {
                    console.error(`[Zephyr] 💡 JWT token expired or invalid. Please update qaTestGenerator.zephyr.jwtToken in settings.`);
                    vscode.window.showErrorMessage(`❌ JWT token expired or invalid. Get a fresh token from Zephyr and update settings.`);
                }
            }
            // Don't throw - test case was still created, just without proper steps
        }
    }
    /**
     * Add test steps using v2 API with API token (FALLBACK - may not format correctly)
     */
    async addTestStepsViaV2API(testCaseKey, testSteps, expectedResult) {
        const config = this.getConfig();
        try {
            // Normalize line breaks
            const normalizedSteps = testSteps.replace(/\\n/g, '\n');
            const steps = normalizedSteps.split('\n').filter(s => s.trim());
            console.log(`[Zephyr] Adding ${steps.length} test steps using v2 API to ${testCaseKey}`);
            // Create test steps array - each step is a separate object
            const testStepsPayload = steps.map((step, index) => {
                const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
                const isLastStep = index === steps.length - 1;
                return {
                    inline: {
                        description: cleanStep,
                        testData: '',
                        expectedResult: isLastStep ? expectedResult : ''
                    }
                };
            });
            // If no steps parsed, create a single step with all content
            if (testStepsPayload.length === 0) {
                testStepsPayload.push({
                    inline: {
                        description: testSteps || 'No test steps specified',
                        testData: '',
                        expectedResult: expectedResult || ''
                    }
                });
            }
            console.log(`[Zephyr] Sending ${testStepsPayload.length} steps to v2 API`);
            console.log(`[Zephyr] API URL: ${config.baseUrl}/testcases/${testCaseKey}/teststeps`);
            // Add test steps using v2 API
            const response = await axios_1.default.post(`${config.baseUrl}/testcases/${testCaseKey}/teststeps`, testStepsPayload, { headers: this.getHeaders() });
            console.log(`[Zephyr] ✅ Test steps added via v2 API to ${testCaseKey}`);
            console.log(`[Zephyr] ⚠️ Note: Steps may not format correctly. For best results, configure JWT token.`);
        }
        catch (error) {
            console.error(`[Zephyr] ❌ Error adding test steps via v2 API to ${testCaseKey}:`, error.response?.data || error.message);
            if (error.response) {
                console.error(`[Zephyr] Response status: ${error.response.status}`);
                console.error(`[Zephyr] Response data:`, JSON.stringify(error.response.data, null, 2));
            }
            vscode.window.showWarningMessage(`⚠️ Failed to add test steps. For better results, configure JWT token in settings.`);
        }
    }
    /**
     * Parse test steps into Zephyr format (legacy method, no longer used for v2 API)
     */
    parseStepsToZephyrFormat(testSteps, expectedResult) {
        // Handle escaped newlines (\n) and actual newlines
        const normalizedSteps = testSteps.replace(/\\n/g, '\n');
        const steps = normalizedSteps.split('\n').filter(s => s.trim());
        console.log(`[Zephyr] Parsing ${steps.length} test steps`);
        return steps.map((step, index) => {
            // Remove numbering like "1. ", "2. ", etc.
            const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
            // Only add expected result to the last step
            const stepExpectedResult = (index === steps.length - 1) ? expectedResult : '';
            console.log(`[Zephyr] Step ${index + 1}: "${cleanStep.substring(0, 50)}..."`);
            return {
                index: index,
                description: cleanStep,
                expectedResult: stepExpectedResult,
                testData: ''
            };
        });
    }
    /**
     * Map priority to Zephyr format
     */
    mapPriority(priority) {
        const p = priority.toLowerCase();
        if (p.includes('high') || p.includes('critical'))
            return 'High';
        if (p.includes('low') || p.includes('minor'))
            return 'Low';
        return 'Normal';
    }
    /**
     * Get test cases from a folder
     */
    async getTestCasesFromFolder(folderName) {
        const config = this.getConfig();
        if (!config.apiToken) {
            console.warn('[Zephyr] No API token configured');
            vscode.window.showWarningMessage('⚠️ Zephyr API token not configured');
            return [];
        }
        try {
            const folderId = await this.findFolderByName(folderName);
            const response = await axios_1.default.get(`${config.baseUrl}/testcases`, {
                headers: this.getHeaders(),
                params: {
                    projectKey: config.projectKey,
                    folderId: folderId
                }
            });
            const testCases = response.data.values || response.data;
            return testCases.map((tc) => tc.key);
        }
        catch (error) {
            console.error('[Zephyr] Error getting test cases:', error.response?.data || error.message);
            throw new Error(`Failed to get test cases: ${error.message}`);
        }
    }
    /**
     * Get Jira issue ID from issue key using JiraService
     */
    async getJiraIssueId(jiraKey) {
        try {
            if (!this.jiraService) {
                throw new Error('JiraService not available. Please configure Jira settings.');
            }
            console.log(`[Zephyr] Getting Jira issue ID for ${jiraKey} using JiraService...`);
            const issue = await this.jiraService.getIssue(jiraKey);
            if (!issue || !issue.id) {
                throw new Error(`Issue ${jiraKey} not found or has no ID`);
            }
            const issueId = parseInt(issue.id);
            console.log(`[Zephyr] Found Jira issue ID: ${issueId}`);
            return issueId;
        }
        catch (error) {
            console.error(`[Zephyr] Failed to get Jira issue ID for ${jiraKey}:`, error.message);
            throw new Error(`Failed to get Jira issue ID: ${error.message}. Make sure Jira credentials are configured in Settings.`);
        }
    }
    /**
     * Link test cases to Jira issue using bulk trace link API (requires JWT token)
     * This uses the uploaded test case details (with IDs) for linking
     */
    async linkTestCasesToJira(uploadedTestCases, jiraKey, jiraIssueId, progressCallback) {
        const config = this.getConfig();
        if (!config.jwtToken) {
            vscode.window.showWarningMessage('⚠️ JWT token not configured. Cannot link test cases to Jira. Configure qaTestGenerator.zephyr.jwtToken in settings.');
            console.warn('[Zephyr] JWT token required for linking test cases to Jira');
            return { successful: 0, failed: uploadedTestCases.length };
        }
        console.log(`[Zephyr] Linking ${uploadedTestCases.length} test cases to ${jiraKey} (ID: ${jiraIssueId}) using JWT token`);
        try {
            console.log(`[Zephyr] Jira issue ID: ${jiraIssueId}`);
            // Create trace links in bulk
            const traceLinks = uploadedTestCases.map(tc => ({
                testCaseId: tc.id,
                issueId: jiraIssueId,
                typeId: 1 // 1 = Tests (standard trace link type)
            }));
            console.log(`[Zephyr] Creating ${traceLinks.length} trace links via bulk API...`);
            console.log(`[Zephyr] API URL: ${config.tm4jBaseUrl}/tracelink/bulk/create`);
            const response = await axios_1.default.post(`${config.tm4jBaseUrl}/tracelink/bulk/create`, traceLinks, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': `JWT ${config.jwtToken}`,
                    'content-type': 'application/json',
                    'jira-project-id': config.projectId,
                    'origin': 'https://app.tm4j.smartbear.com',
                    'referer': 'https://app.tm4j.smartbear.com/',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });
            console.log(`[Zephyr] ✅ Bulk trace link response:`, response.status);
            console.log(`[Zephyr] Successfully linked all ${uploadedTestCases.length} test cases to ${jiraKey}`);
            // Update progress
            if (progressCallback) {
                progressCallback(uploadedTestCases.length, uploadedTestCases.length);
            }
            vscode.window.showInformationMessage(`✅ Linked ${uploadedTestCases.length} test cases to ${jiraKey}`);
            return { successful: uploadedTestCases.length, failed: 0 };
        }
        catch (error) {
            console.error(`[Zephyr] ❌ Failed to create bulk trace links:`, error.response?.data || error.message);
            if (error.response) {
                console.error(`[Zephyr] Response status: ${error.response.status}`);
                console.error(`[Zephyr] Response data:`, JSON.stringify(error.response.data, null, 2));
                if (error.response.status === 401) {
                    console.error(`[Zephyr] 💡 JWT token expired. Please update qaTestGenerator.zephyr.jwtToken`);
                }
            }
            vscode.window.showWarningMessage(`⚠️ Failed to link test cases. Error: ${error.message}. Check console for details.`);
            return { successful: 0, failed: uploadedTestCases.length };
        }
    }
}
exports.ZephyrService = ZephyrService;
//# sourceMappingURL=zephyrService.js.map