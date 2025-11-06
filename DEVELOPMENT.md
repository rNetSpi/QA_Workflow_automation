# Development Guide

## ✅ Setup Complete!

Your QA Test Generator Pro extension is ready to run!

## 🚀 How to Run the Extension

### Method 1: Using VS Code Debugger (Recommended)
1. Open this project in VS Code
2. Press **F5** or click **Run → Start Debugging**
3. A new VS Code window will open with the extension loaded (Extension Development Host)
4. In the new window, you can test your extension

### Method 2: Using Command Palette
1. Open this project in VS Code
2. Press **Cmd+Shift+D** (or **Ctrl+Shift+D** on Windows/Linux) to open the Run view
3. Select "Run Extension" from the dropdown
4. Click the green play button
5. A new VS Code window will open with the extension loaded

## 🎯 Testing the Extension

Once the Extension Development Host window opens:

1. **Open Command Palette**: Press `Cmd+Shift+P` (or `Ctrl+Shift+P`)
2. **Type**: "QA Test Generator"
3. **You'll see available commands**:
   - `QA Test Generator: Configure Settings`
   - `QA Test Generator: Fetch Jira Issue`
   - `QA Test Generator: Generate Test Cases`
   - `QA Test Generator: Upload to Zephyr Scale`
   - `QA Test Generator: Run Complete Workflow`
   - And more...

4. **Try the Complete Workflow**:
   - Run: `QA Test Generator: Run Complete Workflow`
   - Enter a Jira issue key (e.g., `PLTF-4571`)
   - Watch the automation happen!

## 📦 Package the Extension

To create a `.vsix` file for distribution:

```bash
npm run package
```

This will create `qa-test-generator-1.0.0.vsix` that you can install in any VS Code instance.

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on file changes)
npm run watch

# Run linter
npm run lint

# Run tests
npm run test

# Package extension
npm run package
```

## 🐛 Debugging Tips

1. **View Extension Logs**: In the Extension Development Host window, go to `Help → Toggle Developer Tools` to see console logs
2. **Set Breakpoints**: Add breakpoints in your TypeScript files and they'll work when debugging
3. **Reload Extension**: In the Extension Development Host window, press `Cmd+R` (or `Ctrl+R`) to reload the extension after making changes

## 📝 Configuration Required

Before using the extension, you need to configure:

1. **Jira Settings**:
   - Host: `https://yourcompany.atlassian.net`
   - Email: Your Jira email
   - API Token: [Generate here](https://id.atlassian.com/manage-profile/security/api-tokens)

2. **Zephyr Settings**:
   - API Token: Your Zephyr Scale API token
   - Project Key: e.g., `PLTF`
   - Project ID: e.g., `10024`

3. **AI Provider** (Optional):
   - Default is "template-based" (no API key needed)
   - For AI-powered generation, select a provider and add API key

## 🌟 Features to Test

- ✅ Fetch Jira issues
- ✅ Generate test cases from requirements
- ✅ Upload to Zephyr Scale
- ✅ Link test cases to Jira
- ✅ Generate Playwright automation tests
- ✅ Complete end-to-end workflow

## 📂 Project Structure

```
├── src/
│   ├── extension.ts           # Main entry point
│   ├── services/              # Core services
│   │   ├── aiProviderManager.ts
│   │   ├── jiraService.ts
│   │   ├── playwrightGeneratorService.ts
│   │   ├── testGeneratorService.ts
│   │   └── zephyrService.ts
│   └── views/                 # UI components
│       ├── requirementsTreeProvider.ts
│       └── testCasesTreeProvider.ts
├── out/                       # Compiled JavaScript
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript config
```

## 🎉 You're All Set!

Press **F5** now to start the extension and begin testing!



