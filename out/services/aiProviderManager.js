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
exports.AIProviderManager = void 0;
const vscode = __importStar(require("vscode"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
class AIProviderManager {
    constructor(context) {
        this.context = context;
        this.currentConfig = this.loadConfig();
        this.initializeProviders();
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration('qaTestGenerator.ai');
        return {
            provider: config.get('provider', 'template-based'),
            apiKey: config.get('apiKey'),
            model: config.get('model'),
            maxTokens: config.get('maxTokens', 4000),
            temperature: config.get('temperature', 0.7),
            localEndpoint: config.get('ollamaEndpoint', 'http://localhost:11434')
        };
    }
    async initializeProviders() {
        // Initialize paid providers if API keys are available
        if (this.currentConfig.apiKey) {
            switch (this.currentConfig.provider) {
                case 'claude-3.5-sonnet':
                case 'claude-3-opus':
                    this.anthropic = new sdk_1.default({ apiKey: this.currentConfig.apiKey });
                    break;
                case 'gpt-4-turbo':
                case 'gpt-3.5-turbo':
                    this.openai = new openai_1.default({ apiKey: this.currentConfig.apiKey });
                    break;
            }
        }
    }
    /**
     * Generate test cases using the configured AI provider
     */
    async generateTestCases(requirements, issueKey) {
        try {
            vscode.window.showInformationMessage(`🤖 Generating test cases with ${this.getProviderDisplayName()}...`);
            console.log(`[AI Provider] Provider: ${this.currentConfig.provider}`);
            console.log(`[AI Provider] API Key present: ${!!this.currentConfig.apiKey}`);
            console.log(`[AI Provider] Max Tokens: ${this.currentConfig.maxTokens}`);
            console.log(`[AI Provider] Model: ${this.currentConfig.model || 'default'}`);
            switch (this.currentConfig.provider) {
                case 'claude-3.5-sonnet':
                case 'claude-3-opus':
                    return await this.generateWithClaude(requirements, issueKey);
                case 'gpt-4-turbo':
                case 'gpt-3.5-turbo':
                    return await this.generateWithOpenAI(requirements, issueKey);
                case 'groq-llama-3.1':
                    return await this.generateWithGroq(requirements, issueKey);
                case 'ollama-local':
                    return await this.generateWithOllama(requirements, issueKey);
                case 'huggingface-free':
                    return await this.generateWithHuggingFace(requirements, issueKey);
                case 'gemini-pro':
                    return await this.generateWithGemini(requirements, issueKey);
                case 'template-based':
                default:
                    return this.generateWithTemplates(requirements, issueKey);
            }
        }
        catch (error) {
            console.error('[AI Provider] Error:', error);
            // Provide more detailed error message
            let errorMessage = 'Unknown error';
            if (error.response) {
                // Axios error
                errorMessage = `${error.response.status} - ${JSON.stringify(error.response.data)}`;
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            else {
                errorMessage = String(error);
            }
            vscode.window.showWarningMessage(`AI generation failed. Falling back to template-based generation. Error: ${errorMessage}`);
            return this.generateWithTemplates(requirements, issueKey);
        }
    }
    /**
     * Claude (Anthropic) - Paid, High Quality
     */
    async generateWithClaude(requirements, issueKey) {
        if (!this.anthropic) {
            throw new Error('Claude API not initialized. Please add API key in settings.');
        }
        const prompt = this.buildPrompt(requirements, issueKey);
        // Use correct Claude model name
        const model = this.currentConfig.model || 'claude-3-5-sonnet-20240620';
        const maxTokens = Math.min(this.currentConfig.maxTokens || 8000, 8000); // Claude max is 8192
        console.log(`[Claude] Using model: ${model}, max_tokens: ${maxTokens}`);
        const response = await this.anthropic.messages.create({
            model: model,
            max_tokens: maxTokens,
            temperature: this.currentConfig.temperature || 0.7,
            messages: [{
                    role: 'user',
                    content: prompt
                }]
        });
        const content = response.content[0];
        if (content.type === 'text') {
            return this.parseTestCasesFromCSV(content.text);
        }
        return [];
    }
    /**
     * OpenAI GPT-4/3.5 - Paid, High Quality
     */
    async generateWithOpenAI(requirements, issueKey) {
        if (!this.openai) {
            throw new Error('OpenAI API not initialized. Please add API key in settings.');
        }
        const prompt = this.buildPrompt(requirements, issueKey);
        // Get the correct model based on provider selection
        let defaultModel = 'gpt-4-turbo';
        if (this.currentConfig.provider === 'gpt-3.5-turbo') {
            defaultModel = 'gpt-3.5-turbo';
        }
        else if (this.currentConfig.provider === 'gpt-4-turbo') {
            defaultModel = 'gpt-4-turbo';
        }
        const model = this.currentConfig.model || defaultModel;
        const maxTokens = Math.min(this.currentConfig.maxTokens || 4000, 16000); // GPT-4 Turbo max
        console.log(`[OpenAI] Using model: ${model}, max_tokens: ${maxTokens}`);
        const response = await this.openai.chat.completions.create({
            model: model,
            max_tokens: maxTokens,
            temperature: this.currentConfig.temperature || 0.7,
            messages: [{
                    role: 'system',
                    content: 'You are an expert QA engineer specializing in test case design.'
                }, {
                    role: 'user',
                    content: prompt
                }]
        });
        const content = response.choices[0].message.content;
        return this.parseTestCasesFromCSV(content || '');
    }
    /**
     * Groq (Llama 3.1) - FREE, Fast, Good Quality
     * Requires free API key from https://console.groq.com
     */
    async generateWithGroq(requirements, issueKey) {
        const apiKey = this.currentConfig.apiKey;
        if (!apiKey) {
            throw new Error('Groq API key required. Get free key at https://console.groq.com');
        }
        const prompt = this.buildPrompt(requirements, issueKey);
        // Groq has a max_tokens limit of 6000-8000 depending on the model
        // Updated to use llama-3.3-70b-versatile (llama-3.1-70b-versatile is decommissioned)
        const model = this.currentConfig.model || 'llama-3.3-70b-versatile';
        const maxTokens = Math.min(this.currentConfig.maxTokens || 6000, 8000);
        console.log(`[Groq] Using model: ${model}, max_tokens: ${maxTokens}`);
        console.log('[Groq] Requirements length:', requirements.length);
        console.log('[Groq] Requirements preview:', requirements.substring(0, 300));
        try {
            const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                model: model,
                messages: [{
                        role: 'system',
                        content: 'You are an expert QA engineer specializing in test case design.'
                    }, {
                        role: 'user',
                        content: prompt
                    }],
                temperature: this.currentConfig.temperature || 0.7,
                max_tokens: maxTokens
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            console.log('[Groq] Response received, length:', content?.length || 0);
            console.log('[Groq] First 200 chars of response:', content?.substring(0, 200));
            console.log('[Groq] Full response:', content);
            return this.parseTestCasesFromCSV(content);
        }
        catch (error) {
            if (error.response) {
                console.error('[Groq] API Error:', error.response.status, error.response.data);
                throw new Error(`Groq API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Ollama (Local) - FREE, Runs on your machine
     * Install: https://ollama.ai/
     * Models: llama3.1, mistral, codellama
     */
    async generateWithOllama(requirements, issueKey) {
        const endpoint = this.currentConfig.localEndpoint || 'http://localhost:11434';
        const model = this.currentConfig.model || 'llama3.1';
        const prompt = this.buildPrompt(requirements, issueKey);
        try {
            const response = await axios_1.default.post(`${endpoint}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 4000
                }
            });
            return this.parseTestCasesFromCSV(response.data.response);
        }
        catch (error) {
            throw new Error('Ollama not running. Install from https://ollama.ai/ and run: ollama pull llama3.1');
        }
    }
    /**
     * Hugging Face - FREE tier available
     */
    async generateWithHuggingFace(requirements, issueKey) {
        const apiKey = this.currentConfig.apiKey;
        if (!apiKey) {
            throw new Error('Hugging Face API key required. Get free key at https://huggingface.co/settings/tokens');
        }
        const prompt = this.buildPrompt(requirements, issueKey);
        const model = this.currentConfig.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
        const maxTokens = Math.min(this.currentConfig.maxTokens || 4000, 4000);
        console.log(`[HuggingFace] Using model: ${model}, max_new_tokens: ${maxTokens}`);
        try {
            const response = await axios_1.default.post(`https://api-inference.huggingface.co/models/${model}`, {
                inputs: prompt,
                parameters: {
                    max_new_tokens: maxTokens,
                    temperature: this.currentConfig.temperature || 0.7
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data[0]?.generated_text || response.data;
            return this.parseTestCasesFromCSV(content);
        }
        catch (error) {
            if (error.response) {
                console.error('[HuggingFace] API Error:', error.response.status, error.response.data);
                throw new Error(`HuggingFace API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Google Gemini Pro - FREE tier available
     */
    async generateWithGemini(requirements, issueKey) {
        const apiKey = this.currentConfig.apiKey;
        if (!apiKey) {
            throw new Error('Gemini API key required. Get free key at https://makersuite.google.com/app/apikey');
        }
        const prompt = this.buildPrompt(requirements, issueKey);
        const model = this.currentConfig.model || 'gemini-pro';
        const maxTokens = Math.min(this.currentConfig.maxTokens || 4000, 8192); // Gemini Pro max is 8192
        console.log(`[Gemini] Using model: ${model}, maxOutputTokens: ${maxTokens}`);
        try {
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }],
                generationConfig: {
                    temperature: this.currentConfig.temperature || 0.7,
                    maxOutputTokens: maxTokens
                }
            });
            const content = response.data.candidates[0].content.parts[0].text;
            return this.parseTestCasesFromCSV(content);
        }
        catch (error) {
            if (error.response) {
                console.error('[Gemini] API Error:', error.response.status, error.response.data);
                throw new Error(`Gemini API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Template-based generation - FREE, Always works, Basic quality
     */
    generateWithTemplates(requirements, issueKey) {
        const testCases = [];
        // Basic template-based generation logic
        const sections = this.extractSections(requirements);
        sections.forEach((section, index) => {
            const tcNumber = String(index + 1).padStart(3, '0');
            testCases.push({
                id: `TC${tcNumber}`,
                name: `Verify ${section.name}`,
                objective: `Test the ${section.name} functionality`,
                preconditions: `1. User is logged in\n2. User has necessary permissions\n3. Test data is prepared`,
                testSteps: `1. Navigate to ${section.name}\n2. Verify ${section.name} is displayed\n3. Interact with ${section.name}\n4. Verify expected behavior`,
                expectedResult: `${section.name} functions correctly and meets requirements`,
                priority: section.isCore ? 'High' : 'Medium'
            });
        });
        return testCases;
    }
    /**
     * Build prompt for AI generation
     */
    buildPrompt(requirements, issueKey) {
        return `You are an expert QA engineer specializing in test case design. Analyze the following Jira ticket and generate comprehensive, detailed test cases.

JIRA TICKET: ${issueKey}
${requirements}

CRITICAL INSTRUCTIONS:
1. ANALYZE THE TICKET CAREFULLY - Read the entire description, acceptance criteria, and all details mentioned
2. EXTRACT ALL TESTABLE ELEMENTS - Identify every UI component, field, button, validation, workflow step, and business rule mentioned
3. CREATE GRANULAR TEST CASES - For each element mentioned, create specific test cases
4. GENERATE COMPREHENSIVE COVERAGE:
   - For each field/component mentioned: test display, data validation, formatting, boundaries
   - For each workflow: test happy path, alternative paths, error scenarios
   - For each business rule: test valid cases, edge cases, invalid cases, UI verification
5. NUMBER OF TEST CASES: Generate Number of test cases based on the ticket description/requirement

GENERATE TEST CASES IN THIS EXACT CSV FORMAT (include header):
Test Case ID,Test Case Name,Objective,Preconditions,Test Steps,Expected Result,Priority

FORMATTING RULES:
1. Test Case ID: TC001, TC002, TC003, etc. (sequential)
2. Test Case Name: Short, descriptive title (e.g., "Verify Progress bar displays correct percentage")
3. Objective: Clear purpose (e.g., "To verify that the progress bar accurately calculates and displays completion percentage based on checklist items")
4. Preconditions: Specific setup (e.g., "1. User is logged in\n2. Checklist with 10 items exists\n3. 5 items are completed")
5. Test Steps: Detailed numbered steps using \\n for breaks (e.g., "1. Navigate to checklist page\\n2. Locate Progress bar\\n3. Verify percentage displays as 50%\\n4. Complete one more item\\n5. Verify percentage updates to 60%")
6. Expected Result: Specific, measurable outcome (e.g., "Progress bar shows 50% initially, updates to 60% after completing 6th item, visual bar fills proportionally")
7. Priority: High (critical functionality), Medium (important features), Low (nice-to-have)

CSV FORMATTING:
- Enclose multi-line fields in double quotes
- Escape internal quotes with double quotes ("")
- One test case per line
- Comma-separated values
- No extra line breaks within a row
- DO NOT add any notes, disclaimers, or explanatory text after the test cases
- DO NOT add lines like "Note: The priority of each test case is subjective..."
- Only output the CSV header and test case rows, nothing else

COVERAGE REQUIREMENTS:
✓ Functional Testing - Every feature mentioned
✓ UI Testing - Every component, field, button, layout element
✓ Data Validation - Every input field with valid/invalid data
✓ Boundary Testing - Min/max values, character limits
✓ Integration Testing - Data flow between components
✓ Error Handling - All error scenarios mentioned or implied
✓ Negative Testing - Invalid inputs, unauthorized access
✓ Edge Cases - Empty states, null values, special characters
✓ Accessibility - Screen reader support, keyboard navigation
✓ Responsiveness - Different screen sizes if UI-related

IMPORTANT: Generate ONLY the CSV header and test case rows. NO additional notes or explanations.

Generate comprehensive CSV test cases NOW:`;
    }
    /**
     * Parse CSV response into TestCase objects
     */
    parseTestCasesFromCSV(csvText) {
        const testCases = [];
        console.log('[CSV Parser] Raw response length:', csvText.length);
        console.log('[CSV Parser] First 500 chars:', csvText.substring(0, 500));
        // Extract CSV content (remove markdown code blocks if present)
        let cleanedText = csvText.replace(/```csv\n?/g, '').replace(/```\n?/g, '');
        // Split into lines
        const lines = cleanedText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        console.log('[CSV Parser] Total lines found:', lines.length);
        console.log('[CSV Parser] First line (header):', lines[0]);
        // Skip header line(s) and notes
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
            // Skip header rows (check if line starts with "Test Case ID")
            if (line.startsWith('Test Case ID') || line.startsWith('"Test Case ID')) {
                console.log(`[CSV Parser] Skipping header row at line ${i}`);
                continue;
            }
            // Skip note lines
            if (line.toLowerCase().startsWith('note:') || line.toLowerCase().includes('the priority of each test case is subjective')) {
                console.log(`[CSV Parser] Skipping note line at line ${i}`);
                continue;
            }
            const parts = this.parseCSVLine(line);
            if (parts.length >= 7) {
                testCases.push({
                    id: parts[0].trim(),
                    name: parts[1].trim(),
                    objective: parts[2].trim(),
                    preconditions: parts[3].trim(),
                    testSteps: parts[4].trim(),
                    expectedResult: parts[5].trim(),
                    priority: parts[6].trim()
                });
            }
            else {
                console.log(`[CSV Parser] Line ${i} has insufficient columns (${parts.length}):`, line.substring(0, 100));
            }
        }
        console.log('[CSV Parser] Successfully parsed test cases:', testCases.length);
        if (testCases.length === 0) {
            console.warn('[CSV Parser] No test cases parsed! Response may not be in CSV format.');
            throw new Error('Failed to parse CSV response. AI may not have generated valid CSV format.');
        }
        return testCases;
    }
    /**
     * Parse a single CSV line (handles quotes and commas)
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current); // Add last field
        return result;
    }
    /**
     * Extract sections from requirements for template-based generation
     */
    extractSections(requirements) {
        const sections = [];
        const lines = requirements.split('\n');
        lines.forEach(line => {
            // Look for bullet points, headers, or acceptance criteria
            if (line.match(/^[\-\*•]/) || line.match(/^#{1,3}\s/)) {
                const cleaned = line.replace(/^[\-\*•#\s]+/, '').trim();
                if (cleaned.length > 10 && cleaned.length < 100) {
                    sections.push({
                        name: cleaned,
                        isCore: line.includes('MUST') || line.includes('should')
                    });
                }
            }
        });
        // If no sections found, create generic ones
        if (sections.length === 0) {
            sections.push({ name: 'Basic Functionality', isCore: true }, { name: 'User Interface', isCore: true }, { name: 'Error Handling', isCore: false }, { name: 'Performance', isCore: false });
        }
        return sections;
    }
    /**
     * Get display name for current provider
     */
    getProviderDisplayName() {
        const names = {
            'claude-3.5-sonnet': 'Claude 3.5 Sonnet (Paid)',
            'claude-3-opus': 'Claude 3 Opus (Paid)',
            'gpt-4-turbo': 'GPT-4 Turbo (Paid)',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo (Paid)',
            'groq-llama-3.1': 'Groq Llama 3.1 (FREE)',
            'ollama-local': 'Ollama Local (FREE)',
            'huggingface-free': 'Hugging Face (FREE)',
            'gemini-pro': 'Gemini Pro (FREE tier)',
            'template-based': 'Template-Based (FREE)'
        };
        return names[this.currentConfig.provider] || 'Unknown';
    }
    /**
     * Test API connection for the configured provider
     */
    async testAPIConnection() {
        try {
            switch (this.currentConfig.provider) {
                case 'groq-llama-3.1':
                    return await this.testGroqConnection();
                case 'claude-3.5-sonnet':
                case 'claude-3-opus':
                    return await this.testClaudeConnection();
                case 'gpt-4-turbo':
                case 'gpt-3.5-turbo':
                    return await this.testOpenAIConnection();
                case 'gemini-pro':
                    return await this.testGeminiConnection();
                default:
                    return { success: true, message: `${this.currentConfig.provider} does not require API testing` };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error.message}`,
                details: error.response?.data
            };
        }
    }
    async testGroqConnection() {
        const apiKey = this.currentConfig.apiKey;
        if (!apiKey) {
            return { success: false, message: 'No API key configured' };
        }
        try {
            const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                message: '✅ Groq API connection successful!',
                details: { model: response.data.model, status: 'connected' }
            };
        }
        catch (error) {
            let errorDetails = 'Unknown error';
            if (error.response) {
                errorDetails = JSON.stringify(error.response.data, null, 2);
            }
            return {
                success: false,
                message: `❌ Groq API Error (${error.response?.status || 'unknown'}): ${errorDetails}`,
                details: error.response?.data
            };
        }
    }
    async testClaudeConnection() {
        if (!this.anthropic) {
            return { success: false, message: 'Claude API not initialized' };
        }
        try {
            await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hello' }]
            });
            return { success: true, message: '✅ Claude API connection successful!' };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Claude API Error: ${error.message}`,
                details: error
            };
        }
    }
    async testOpenAIConnection() {
        if (!this.openai) {
            return { success: false, message: 'OpenAI API not initialized' };
        }
        try {
            await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            });
            return { success: true, message: '✅ OpenAI API connection successful!' };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ OpenAI API Error: ${error.message}`,
                details: error
            };
        }
    }
    async testGeminiConnection() {
        const apiKey = this.currentConfig.apiKey;
        if (!apiKey) {
            return { success: false, message: 'No API key configured' };
        }
        try {
            await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                contents: [{ parts: [{ text: 'Hello' }] }],
                generationConfig: { maxOutputTokens: 10 }
            });
            return { success: true, message: '✅ Gemini API connection successful!' };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Gemini API Error: ${error.message}`,
                details: error.response?.data
            };
        }
    }
    /**
     * Check if provider is available
     */
    async checkProviderAvailability() {
        switch (this.currentConfig.provider) {
            case 'claude-3.5-sonnet':
            case 'claude-3-opus':
                if (!this.currentConfig.apiKey) {
                    return { available: false, message: 'Claude API key required' };
                }
                return { available: true, message: 'Claude available' };
            case 'gpt-4-turbo':
            case 'gpt-3.5-turbo':
                if (!this.currentConfig.apiKey) {
                    return { available: false, message: 'OpenAI API key required' };
                }
                return { available: true, message: 'OpenAI available' };
            case 'groq-llama-3.1':
                if (!this.currentConfig.apiKey) {
                    return { available: false, message: 'Groq API key required (free at console.groq.com)' };
                }
                return { available: true, message: 'Groq available (FREE)' };
            case 'ollama-local':
                try {
                    await axios_1.default.get(`${this.currentConfig.localEndpoint}/api/tags`);
                    return { available: true, message: 'Ollama available (FREE, Local)' };
                }
                catch {
                    return { available: false, message: 'Ollama not running. Install from ollama.ai' };
                }
            case 'template-based':
                return { available: true, message: 'Template-based always available (FREE)' };
            default:
                return { available: true, message: 'Provider available' };
        }
    }
    /**
     * Get list of available providers
     */
    getAvailableProviders() {
        return [
            { value: 'claude-3.5-sonnet', label: '🟣 Claude 3.5 Sonnet (Best Quality)', free: false },
            { value: 'gpt-4-turbo', label: '🟢 GPT-4 Turbo (Excellent)', free: false },
            { value: 'groq-llama-3.1', label: '🆓 Groq Llama 3.1 (FREE - Fast)', free: true },
            { value: 'ollama-local', label: '🆓 Ollama Local (FREE - Private)', free: true },
            { value: 'gemini-pro', label: '🆓 Gemini Pro (FREE tier)', free: true },
            { value: 'gpt-3.5-turbo', label: '🟢 GPT-3.5 Turbo (Fast & Cheap)', free: false },
            { value: 'huggingface-free', label: '🆓 Hugging Face (FREE tier)', free: true },
            { value: 'template-based', label: '🆓 Template-Based (Always FREE)', free: true }
        ];
    }
}
exports.AIProviderManager = AIProviderManager;
//# sourceMappingURL=aiProviderManager.js.map