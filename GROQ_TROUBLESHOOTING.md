# Groq API Troubleshooting Guide

## 🔴 Error 400: Bad Request

If you're getting a 400 error with Groq, here are the most common causes and solutions:

### 1. ✅ Verify Your API Key

**Step 1: Check if API key is configured**
- Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
- Search for: `qaTestGenerator.ai.apiKey`
- Make sure your Groq API key is entered

**Step 2: Verify API Key Format**
- Groq API keys start with `gsk_`
- Example format: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Make sure there are NO spaces before or after the key

**Get a new API key:**
1. Go to https://console.groq.com
2. Sign up/Log in (it's FREE)
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy it and paste in VS Code settings

### 2. ✅ Verify Provider Selection

**Check your settings:**
- Setting: `qaTestGenerator.ai.provider`
- Value should be: `groq-llama-3.1` (NOT `groq-llm`)

### 3. ✅ Max Tokens Limit

Groq has a limit on `max_tokens`. The fix I've implemented caps it at 6000.

**Check your settings:**
- Setting: `qaTestGenerator.ai.maxTokens`
- Value should be: `6000` or less (default is now 6000)
- If you set it higher (like 8000), it will be automatically capped

### 4. ✅ Model Name

**Available Groq Models (Updated 2025):**
- `llama-3.3-70b-versatile` (default, recommended) ✅
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

**Note:** `llama-3.1-70b-versatile` has been decommissioned. Use `llama-3.3-70b-versatile` instead.

If you've specified a custom model name, make sure it's one of the above.

### 5. ✅ Test Your Connection

**NEW: Use the Test Command**
1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type: `QA Test Generator: Test AI API Connection`
3. Run the command
4. It will show you the exact error details

### 6. ✅ Check Console Logs

**View detailed logs:**
1. Open VS Code Developer Console:
   - Mac: `Cmd+Option+I`
   - Windows/Linux: `Ctrl+Shift+I`
2. Click on "Console" tab
3. Look for messages starting with `[Groq]` or `[AI Provider]`
4. These will show the exact request details and error

## 🔧 Common Error Messages & Solutions

### Error: "Invalid API key"
```
{
  "error": {
    "message": "Invalid API Key",
    "type": "invalid_request_error"
  }
}
```
**Solution:** Your API key is wrong. Get a new one from console.groq.com

### Error: "Rate limit exceeded"
```
{
  "error": {
    "message": "Rate limit exceeded"
  }
}
```
**Solution:** Wait a few seconds and try again. Groq free tier has rate limits.

### Error: "max_tokens is too large"
```
{
  "error": {
    "message": "max_tokens is too large"
  }
}
```
**Solution:** Lower your `maxTokens` setting to 6000 or less

### Error: "Model not found"
```
{
  "error": {
    "message": "Model not found"
  }
}
```
**Solution:** Don't specify a custom model, or use one of the valid models listed above

## 📝 Step-by-Step Setup Guide

1. **Get Groq API Key:**
   ```
   Visit: https://console.groq.com
   Sign up (FREE)
   Go to API Keys
   Create new key
   Copy the key (starts with gsk_)
   ```

2. **Configure VS Code:**
   ```
   Open Settings (Cmd+, or Ctrl+,)
   Search: qaTestGenerator.ai
   
   Set:
   - Provider: groq-llama-3.1
   - API Key: [paste your key here]
   - Max Tokens: 6000
   - Temperature: 0.7
   ```

3. **Test Connection:**
   ```
   Command Palette (Cmd+Shift+P)
   Run: "QA Test Generator: Test AI API Connection"
   Should see: "✅ Groq API connection successful!"
   ```

4. **Generate Test Cases:**
   ```
   Command Palette (Cmd+Shift+P)
   Run: "Fetch Jira Issue"
   Enter issue key (e.g., PLTF-4571)
   Click "Yes" to generate test cases
   ```

## 🎯 Quick Fix Checklist

- [ ] API key starts with `gsk_`
- [ ] API key has no spaces
- [ ] Provider is set to `groq-llama-3.1`
- [ ] Max tokens is 6000 or less
- [ ] No custom model specified (or using valid model)
- [ ] Test connection command passes
- [ ] Checked console logs for detailed errors

## 📞 Still Having Issues?

If you've tried all the above and still getting errors:

1. **Check the exact error details:**
   - Run the "Test AI API Connection" command
   - Click "Show Details" on the error
   - Copy the error JSON

2. **Verify Groq service status:**
   - Visit: https://status.groq.com
   - Check if there are any outages

3. **Try a different provider:**
   - Switch to `template-based` (always works, no API needed)
   - Or try `gemini-pro` (also FREE with Google API key)

## 🚀 Updates in This Fix

I've made the following improvements to help with the 400 error:

1. ✅ **Correct model names** - Fixed Claude and GPT-4 model names
2. ✅ **Token limits** - Capped max_tokens for each provider
3. ✅ **Better error messages** - Now shows exact error from API
4. ✅ **Console logging** - Detailed logs in developer console
5. ✅ **Test command** - New command to test API connection
6. ✅ **Error details** - Full API response shown in errors

## 📄 Example Working Configuration

```json
{
  "qaTestGenerator.ai.provider": "groq-llama-3.1",
  "qaTestGenerator.ai.apiKey": "gsk_your_actual_api_key_here",
  "qaTestGenerator.ai.maxTokens": 6000,
  "qaTestGenerator.ai.temperature": 0.7
}
```





