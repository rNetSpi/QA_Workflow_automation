#!/bin/bash

echo "🔧 Rebuilding QA Test Generator Extension..."
echo ""

cd /Users/rpandit/Documents/Hackathon/QA_Workflow_automation

echo "Step 1: Compiling TypeScript..."
npm run compile

echo ""
echo "Step 2: Building VSIX package..."
npx vsce package --no-yarn

echo ""
echo "✅ Done! New VSIX file created:"
ls -lh qa-test-generator-1.0.0.vsix

echo ""
echo "📦 Next steps:"
echo "1. Uninstall old extension (Cmd+Shift+X → find extension → uninstall)"
echo "2. Install new version (Cmd+Shift+P → 'Extensions: Install from VSIX...')"
echo "3. Reload VS Code (Cmd+Shift+P → 'Developer: Reload Window')"
echo "4. Try generating test cases again!"
echo ""
echo "🎉 The Groq model has been updated to llama-3.3-70b-versatile"





