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
            vscode.window.showWarningMessage(`AI generation failed. Falling back to template-based generation. Error: ${error}`);
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
        const response = await this.anthropic.messages.create({
            model: this.currentConfig.model || 'claude-3-5-sonnet-20241022',
            max_tokens: this.currentConfig.maxTokens || 8000,
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
        const response = await this.openai.chat.completions.create({
            model: this.currentConfig.model || 'gpt-4-turbo-preview',
            max_tokens: this.currentConfig.maxTokens || 4000,
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
        const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-70b-versatile',
            messages: [{
                    role: 'system',
                    content: 'You are an expert QA engineer specializing in test case design.'
                }, {
                    role: 'user',
                    content: prompt
                }],
            temperature: 0.7,
            max_tokens: 8000
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const content = response.data.choices[0].message.content;
        return this.parseTestCasesFromCSV(content);
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
        const response = await axios_1.default.post('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
            inputs: prompt,
            parameters: {
                max_new_tokens: 4000,
                temperature: 0.7
            }
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const content = response.data[0].generated_text;
        return this.parseTestCasesFromCSV(content);
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
        const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            contents: [{
                    parts: [{
                            text: prompt
                        }]
                }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000
            }
        });
        const content = response.data.candidates[0].content.parts[0].text;
        return this.parseTestCasesFromCSV(content);
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
        return `You are an expert QA engineer. Generate comprehensive test cases for Jira issue ${issueKey}.

Requirements:
${requirements}

Generate test cases in this EXACT CSV format (include the header):
Test Case ID,Test Case Name,Objective,Preconditions,Test Steps,Expected Result,Priority

Requirements:
1. Create 25-30 comprehensive test cases
2. Cover: happy path, edge cases, error handling, UI/UX, accessibility, security
3. Test Case ID: TC001, TC002, etc.
4. Priority: High, Medium, or Low
5. Test Steps: Use \\n for line breaks (e.g., "1. Step one\\n2. Step two")
6. Preconditions: Clear setup requirements
7. Expected Result: Measurable, specific outcomes

Important formatting rules:
- Use quotes for multi-line fields
- Escape quotes inside fields with double quotes
- Each test case on one line
- Separate columns with commas

Generate the CSV now:`;
    }
    /**
     * Parse CSV response into TestCase objects
     */
    parseTestCasesFromCSV(csvText) {
        const testCases = [];
        // Extract CSV content (remove markdown code blocks if present)
        let cleanedText = csvText.replace(/```csv\n?/g, '').replace(/```\n?/g, '');
        // Split into lines
        const lines = cleanedText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
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