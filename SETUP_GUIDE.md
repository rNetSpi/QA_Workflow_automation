# VS Code Extension - Complete Setup Guide

## 🎯 Goal
Create a publishable VS Code extension that automates the complete QA workflow from Jira → Test Cases → Zephyr → Playwright.

---

## 📋 Prerequisites

### 1. Install Required Tools
```bash
# Node.js (v18 or higher)
node --version

# VS Code (latest version)
code --version

# Visual Studio Code Extension Manager (vsce)
npm install -g @vscode/vsce

# TypeScript
npm install -g typescript
```

### 2. Get API Credentials
- **Jira API Token**: https://id.atlassian.com/manage-profile/security/api-tokens
- **Zephyr API Token**: From Zephyr Scale settings
- **Zephyr JWT Token**: Extract from browser network tab
- **Figma API Token**: https://www.figma.com/settings (optional)

---

## 🛠️ Development Setup

### Step 1: Initialize Project
```bash
cd /Users/rpandit/Documents/QaPlugIn/proactive-security-platform-automation/vscode-extension

# Install dependencies
npm install

# Verify installation
npm list
```

### Step 2: Create Missing Service Files

You'll need to create these files (or I can help you):

#### Required Files:
```
src/
├── services/
│   ├── jiraService.ts ✅ (Created)
│   ├── zephyrService.ts ⏳ (Needs creation)
│   ├── testGeneratorService.ts ⏳
│   ├── playwrightGeneratorService.ts ⏳
│   └── figmaService.ts ⏳
├── views/
│   ├── requirementsTreeProvider.ts ⏳
│   ├── testCasesTreeProvider.ts ⏳
│   └── zephyrTreeProvider.ts ⏳
├── types/
│   └── index.d.ts ⏳
└── utils/
    ├── csvGenerator.ts ⏳
    └── logger.ts ⏳
```

### Step 3: Configure TypeScript
```bash
# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules", ".vscode-test"]
}
EOF
```

### Step 4: Add Extension Icon
```bash
# Create resources directory
mkdir -p resources

# Add icon (you'll need to create/download a 128x128 PNG)
# For now, use a placeholder or download one
```

---

## 🧪 Testing the Extension

### Run in Development Mode
1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window opens with your extension loaded
4. Test commands from Command Palette

### Manual Testing Checklist
- [ ] Extension activates without errors
- [ ] Commands appear in Command Palette
- [ ] Configuration settings are accessible
- [ ] Sidebar views render correctly
- [ ] API connections work
- [ ] File generation works
- [ ] Error handling is graceful

---

## 📦 Building for Distribution

### Step 1: Package the Extension
```bash
# Clean build
rm -rf out/
npm run compile

# Verify no errors
npm run lint

# Package as VSIX
vsce package

# Output: qa-test-generator-1.0.0.vsix
```

### Step 2: Test the VSIX
```bash
# Install locally
code --install-extension qa-test-generator-1.0.0.vsix

# Or in VS Code:
# Extensions → ... → Install from VSIX
```

### Step 3: Prepare for Publishing
```bash
# Create publisher account at:
# https://marketplace.visualstudio.com/manage

# Get Personal Access Token from:
# https://dev.azure.com → User Settings → Personal Access Tokens

# Login to vsce
vsce login <publisher-name>
```

---

## 🚀 Publishing to VS Code Marketplace

### Step 1: Update package.json
```json
{
  "name": "qa-test-generator",
  "displayName": "QA Test Generator Pro",
  "publisher": "YOUR_PUBLISHER_NAME",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/qa-test-generator"
  }
}
```

### Step 2: Publish
```bash
# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 1.0.0

# Or publish pre-release
vsce publish --pre-release
```

### Step 3: Verify Publication
- Visit: https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER_NAME.qa-test-generator
- Search for your extension in VS Code
- Install and test

---

## 🔄 Update & Maintenance

### Publishing Updates
```bash
# Bump version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# Publish update
vsce publish
```

### Unpublish (if needed)
```bash
# Unpublish specific version
vsce unpublish YOUR_PUBLISHER_NAME.qa-test-generator@1.0.0

# Unpublish entire extension
vsce unpublish YOUR_PUBLISHER_NAME.qa-test-generator
```

---

## 🎨 Branding & Assets

### Required Assets
1. **Extension Icon**: 128x128 PNG (resources/icon.png)
2. **Repository Banner**: 1280x640 PNG
3. **Screenshots**: 1920x1080 PNG (3-5 screenshots)
4. **Demo Video**: YouTube/GIF

### Screenshot Ideas
1. Command Palette with extension commands
2. Sidebar views showing test cases
3. Configuration screen
4. Generated test cases file
5. Complete workflow in action

---

## 📊 Analytics & Monitoring

### VS Code Marketplace Stats
- Daily/Weekly/Monthly downloads
- Rating and reviews
- Version adoption rates

### User Feedback Collection
```typescript
// In extension.ts
vscode.window.showInformationMessage(
  'Enjoying QA Test Generator?',
  'Rate Extension',
  'Report Issue'
).then(selection => {
  if (selection === 'Rate Extension') {
    vscode.env.openExternal(vscode.Uri.parse(
      'https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER_NAME.qa-test-generator&ssr=false#review-details'
    ));
  }
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module"
```bash
# Solution: Install missing dependencies
npm install
npm run compile
```

### Issue 2: "Extension not activating"
```json
// Check package.json activationEvents
{
  "activationEvents": [
    "onStartupFinished"  // Activates on startup
  ]
}
```

### Issue 3: "API connection failed"
```typescript
// Check configuration
const config = vscode.workspace.getConfiguration('qaTestGenerator');
console.log('Config:', config.get('jira.host'));
```

### Issue 4: "Cannot publish - missing publisher"
```bash
# Create publisher at:
# https://marketplace.visualstudio.com/manage/createpublisher
```

---

## 📚 Resources

### Official Documentation
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Example Extensions
- [Sample Extension](https://github.com/microsoft/vscode-extension-samples)
- [REST Client](https://github.com/Huachao/vscode-restclient)
- [GitLens](https://github.com/gitkraken/vscode-gitlens)

### Community
- [VS Code Extension Discord](https://aka.ms/vscode-dev-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/visual-studio-code-extension)
- [GitHub Discussions](https://github.com/microsoft/vscode-discussions)

---

## 🎯 Monetization Options

### Free vs Paid Model
1. **Free Tier**
   - Basic test generation (10 cases/day)
   - Jira integration
   - CSV export

2. **Pro Tier ($9/month)**
   - Unlimited test generation
   - Zephyr integration
   - Playwright generation
   - Priority support

3. **Enterprise Tier**
   - Custom deployment
   - SSO integration
   - Dedicated support
   - Custom templates

### Implementation
Use a licensing server or:
- GitHub Sponsors
- OpenCollective
- Patreon
- Stripe for subscriptions

---

## 🚀 Next Steps

1. **Complete Core Services** (Week 1-2)
   - Finish zephyrService.ts
   - Create testGeneratorService.ts
   - Build playwrightGeneratorService.ts

2. **Build UI Components** (Week 3)
   - Tree view providers
   - Webviews for forms
   - Status bar items

3. **Testing** (Week 4)
   - Unit tests
   - Integration tests
   - User acceptance testing

4. **Polish & Publish** (Week 5-6)
   - Documentation
   - Screenshots/videos
   - Package and publish
   - Marketing

---

## 💡 Pro Tips

1. **Start Small**: Get basic functionality working first
2. **Use Telemetry**: Track feature usage (with user consent)
3. **Version Carefully**: Use semantic versioning
4. **Collect Feedback**: GitHub issues, ratings, surveys
5. **Iterate Quickly**: Release often, improve continuously
6. **Community First**: Build for your users, not yourself
7. **Document Everything**: README, CHANGELOG, API docs
8. **Security First**: Never store tokens in plain text

---

## ✅ Launch Checklist

Before publishing v1.0.0:

- [ ] All core features working
- [ ] Comprehensive README
- [ ] CHANGELOG.md created
- [ ] LICENSE file added
- [ ] Extension icon created
- [ ] Screenshots prepared
- [ ] Demo video recorded
- [ ] Extension tested on:
  - [ ] macOS
  - [ ] Windows
  - [ ] Linux
- [ ] Code reviewed
- [ ] No security vulnerabilities
- [ ] Performance optimized
- [ ] Error handling complete
- [ ] User documentation complete
- [ ] Marketplace listing prepared

---

**🎉 Ready to Launch!**

Once you complete this checklist, you'll have a professional VS Code extension ready for thousands of QA engineers worldwide!

---

*Last Updated: November 4, 2025*

