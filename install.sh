#!/bin/bash

# QA Test Generator Extension - Easy Install Script
# For internal team members

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     QA Test Generator Extension - Installation            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ VS Code command not found."
    echo "   Please install VS Code and enable 'code' command:"
    echo "   VS Code → Cmd+Shift+P → 'Shell Command: Install code command'"
    exit 1
fi

echo "✅ VS Code found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Failed to compile"
    exit 1
fi
echo "✅ Compilation successful"
echo ""

# Package extension
echo "📦 Packaging extension..."
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce..."
    npm install -g @vscode/vsce
fi

vsce package
if [ $? -ne 0 ]; then
    echo "❌ Failed to package"
    exit 1
fi
echo "✅ Package created"
echo ""

# Find the VSIX file
VSIX_FILE=$(ls -t *.vsix | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ VSIX file not found"
    exit 1
fi

echo "📦 Installing extension: $VSIX_FILE"
code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║     ✅ Installation Successful! ✅                        ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 QA Test Generator is now installed!"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Restart VS Code"
    echo "   2. Configure settings:"
    echo "      Cmd+Shift+P → 'QA Test Generator: Configure Settings'"
    echo "   3. Add your API keys (Jira, Zephyr, AI provider)"
    echo "   4. Start generating test cases!"
    echo ""
    echo "📚 Documentation: See README.md"
    echo "🆘 Support: Contact your team admin"
    echo ""
else
    echo ""
    echo "❌ Installation failed"
    echo "   Please install manually:"
    echo "   1. Open VS Code"
    echo "   2. Extensions → ... → Install from VSIX"
    echo "   3. Select: $VSIX_FILE"
    exit 1
fi

