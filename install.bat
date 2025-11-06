@echo off
REM QA Test Generator Extension - Easy Install Script for Windows
REM For internal team members

echo ================================================================
echo.
echo     QA Test Generator Extension - Installation
echo.
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js first:
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo OK: Node.js found
node --version
echo.

REM Check if VS Code is installed
where code >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: VS Code command not found.
    echo    Please install VS Code and enable 'code' command:
    echo    VS Code - Ctrl+Shift+P - 'Shell Command: Install code command'
    pause
    exit /b 1
)

echo OK: VS Code found
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

REM Compile TypeScript
echo Compiling TypeScript...
call npm run compile
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to compile
    pause
    exit /b 1
)
echo OK: Compilation successful
echo.

REM Package extension
echo Packaging extension...
where vsce >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing vsce...
    call npm install -g @vscode/vsce
)

call vsce package
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to package
    pause
    exit /b 1
)
echo OK: Package created
echo.

REM Find the VSIX file (most recent)
for /f "delims=" %%i in ('dir /b /o-d *.vsix 2^>nul') do (
    set VSIX_FILE=%%i
    goto :found
)

echo ERROR: VSIX file not found
pause
exit /b 1

:found
echo Installing extension: %VSIX_FILE%
call code --install-extension "%VSIX_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo.
    echo     Installation Successful!
    echo.
    echo ================================================================
    echo.
    echo QA Test Generator is now installed!
    echo.
    echo Next Steps:
    echo    1. Restart VS Code
    echo    2. Configure settings:
    echo       Ctrl+Shift+P - 'QA Test Generator: Configure Settings'
    echo    3. Add your API keys (Jira, Zephyr, AI provider)
    echo    4. Start generating test cases!
    echo.
    echo Documentation: See README.md
    echo Support: Contact your team admin
    echo.
    pause
) else (
    echo.
    echo ERROR: Installation failed
    echo    Please install manually:
    echo    1. Open VS Code
    echo    2. Extensions - ... - Install from VSIX
    echo    3. Select: %VSIX_FILE%
    pause
    exit /b 1
)

