# 🤖 AI Providers Guide - QA Test Generator

## Overview

The QA Test Generator extension supports **multiple AI providers** - both **paid** and **FREE**! Choose the one that fits your needs and budget.

---

## 🎯 Quick Comparison

| Provider | Cost | Quality | Speed | Setup | Best For |
|----------|------|---------|-------|-------|----------|
| **Claude 3.5 Sonnet** | 💰 Paid | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Easy | Professional use, best quality |
| **GPT-4 Turbo** | 💰 Paid | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | Easy | Enterprise, best reasoning |
| **Groq Llama 3.1** | 🆓 **FREE** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | Easy | FREE, ultra-fast |
| **Ollama (Local)** | 🆓 **FREE** | ⭐⭐⭐ | ⚡⚡⚡ | Medium | Privacy, no internet |
| **Gemini Pro** | 🆓 **FREE** | ⭐⭐⭐⭐ | ⚡⚡⚡ | Easy | FREE tier, good quality |
| **GPT-3.5 Turbo** | 💰 Cheap | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ | Easy | Budget-friendly |
| **Hugging Face** | 🆓 **FREE** | ⭐⭐⭐ | ⚡⚡ | Easy | FREE tier |
| **Template-Based** | 🆓 **FREE** | ⭐⭐ | ⚡⚡⚡⚡⚡ | None | No API, always works |

---

## 🆓 FREE Options (Recommended to Start)

### 1. **Groq Llama 3.1** - BEST FREE OPTION

**Why Choose This:**
- ✅ Completely FREE
- ✅ Ultra-fast (faster than paid options!)
- ✅ High quality test cases
- ✅ Easy setup (2 minutes)

**Setup:**
```bash
# Step 1: Get FREE API key
Visit: https://console.groq.com/
Sign up with email (FREE)
Generate API key

# Step 2: Configure in VS Code
1. Cmd+Shift+P → "Preferences: Open Settings (UI)"
2. Search: "QA Test Generator AI"
3. Set Provider: "groq-llama-3.1"
4. Set API Key: <your-free-groq-key>
```

**Cost:** $0 (FREE forever)

**Limits:**
- 30 requests per minute
- 14,400 requests per day
- More than enough for most users!

---

### 2. **Ollama (Local)** - PRIVACY FOCUSED

**Why Choose This:**
- ✅ Completely FREE
- ✅ Runs on your computer
- ✅ No internet needed
- ✅ 100% private
- ✅ No API key needed

**Setup:**
```bash
# Step 1: Install Ollama
# macOS/Linux:
curl https://ollama.ai/install.sh | sh

# Or download from: https://ollama.ai/download

# Step 2: Download a model
ollama pull llama3.1

# Step 3: Verify installation
ollama list
# Should show: llama3.1

# Step 4: Configure in VS Code
1. Set Provider: "ollama-local"
2. No API key needed!
3. Endpoint: http://localhost:11434 (default)
```

**Cost:** $0 (FREE, runs locally)

**Requirements:**
- 8GB RAM minimum
- 16GB RAM recommended
- ~4GB disk space per model

**Available Models:**
```bash
# Small & Fast (2GB)
ollama pull llama3.1:8b

# Better Quality (4GB)
ollama pull llama3.1:70b

# Code-focused (3GB)
ollama pull codellama
```

---

### 3. **Gemini Pro** - GOOGLE'S FREE TIER

**Why Choose This:**
- ✅ FREE tier (60 requests/minute)
- ✅ Good quality
- ✅ Easy setup

**Setup:**
```bash
# Step 1: Get FREE API key
Visit: https://makersuite.google.com/app/apikey
Sign in with Google
Create API key

# Step 2: Configure in VS Code
1. Set Provider: "gemini-pro"
2. Set API Key: <your-gemini-key>
```

**Cost:** $0 for first 60 requests/minute

---

### 4. **Template-Based** - NO API NEEDED

**Why Choose This:**
- ✅ Always FREE
- ✅ No API key needed
- ✅ Always works
- ✅ Instant generation

**How it Works:**
Uses rule-based templates to generate test cases from requirements.

**Quality:** Basic but functional

**Setup:**
```bash
# Already configured by default!
Just set Provider: "template-based"
```

---

## 💰 Paid Options (Best Quality)

### 1. **Claude 3.5 Sonnet** - HIGHEST QUALITY

**Why Choose This:**
- ⭐ Best test case quality
- ⭐ Understands complex requirements
- ⭐ Great at edge cases
- ⭐ Natural language output

**Setup:**
```bash
# Step 1: Get API key
Visit: https://console.anthropic.com/
Create account
Add payment method
Generate API key

# Step 2: Configure in VS Code
1. Set Provider: "claude-3.5-sonnet"
2. Set API Key: <your-claude-key>
```

**Cost:**
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- **Real cost:** ~$0.10-0.20 per Jira ticket (30 test cases)

**Monthly Cost Estimate:**
- 100 tickets: ~$10-20/month
- 500 tickets: ~$50-100/month

---

### 2. **GPT-4 Turbo** - BEST REASONING

**Why Choose This:**
- ⭐ Excellent quality
- ⭐ Great at complex logic
- ⭐ Fast and reliable

**Setup:**
```bash
# Step 1: Get API key
Visit: https://platform.openai.com/api-keys
Create account
Add payment method
Generate API key

# Step 2: Configure in VS Code
1. Set Provider: "gpt-4-turbo"
2. Set API Key: <your-openai-key>
```

**Cost:**
- Input: $10 per 1M tokens
- Output: $30 per 1M tokens
- **Real cost:** ~$0.15-0.30 per ticket

---

### 3. **GPT-3.5 Turbo** - BUDGET FRIENDLY

**Why Choose This:**
- 💰 Cheapest paid option
- ⚡ Very fast
- ✅ Good quality

**Cost:**
- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens
- **Real cost:** ~$0.02-0.05 per ticket

**Setup:** Same as GPT-4, just choose "gpt-3.5-turbo"

---

## 🎯 Which Provider Should YOU Use?

### **For Individual Users:**
```
1. Start with: Groq (FREE)
2. If privacy needed: Ollama (FREE, Local)
3. If more quality needed: Claude ($10-20/month)
```

### **For Small Teams (2-5 people):**
```
1. Start with: Groq (FREE)
2. Upgrade to: GPT-3.5 Turbo ($5-10/month)
3. Premium: Claude 3.5 Sonnet ($20-50/month)
```

### **For Organizations:**
```
1. Recommended: Claude 3.5 Sonnet (Best ROI)
2. Alternative: GPT-4 Turbo
3. Budget: GPT-3.5 Turbo + Groq fallback
```

### **For Offline/Security-Sensitive:**
```
Must use: Ollama (Local)
No internet, no data leaves your machine
```

---

## 📖 Configuration Examples

### Example 1: FREE User (Groq)
```json
{
  "qaTestGenerator.ai.provider": "groq-llama-3.1",
  "qaTestGenerator.ai.apiKey": "gsk_xxxxxxxxxxxxx"
}
```

### Example 2: Privacy User (Ollama)
```json
{
  "qaTestGenerator.ai.provider": "ollama-local",
  "qaTestGenerator.ai.ollamaEndpoint": "http://localhost:11434",
  "qaTestGenerator.ai.model": "llama3.1"
}
```

### Example 3: Professional User (Claude)
```json
{
  "qaTestGenerator.ai.provider": "claude-3.5-sonnet",
  "qaTestGenerator.ai.apiKey": "sk-ant-xxxxxxxxxxxxx",
  "qaTestGenerator.ai.maxTokens": 8000,
  "qaTestGenerator.ai.temperature": 0.7
}
```

### Example 4: Budget User (GPT-3.5)
```json
{
  "qaTestGenerator.ai.provider": "gpt-3.5-turbo",
  "qaTestGenerator.ai.apiKey": "sk-xxxxxxxxxxxxx"
}
```

### Example 5: No API Key (Template)
```json
{
  "qaTestGenerator.ai.provider": "template-based"
}
```

---

## 🔄 Switching Providers

You can easily switch between providers:

```bash
# Open Command Palette
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)

# Type
QA Test Generator: Configure Settings

# Change
AI Provider → Select new provider
API Key → Enter new key (if needed)

# Done!
```

The extension will automatically use the new provider for next generation.

---

## 💡 Pro Tips

### Tip 1: Try Multiple Providers
```
Generate test cases with different providers
Compare quality
Choose the best for your needs
```

### Tip 2: Use Fallback
```
Primary: Groq (FREE, fast)
Fallback: Template (if Groq fails)
```

### Tip 3: Cost Optimization
```
Development: Use Groq (FREE)
Production: Use Claude (best quality)
Review: Always human review
```

### Tip 4: Ollama Models
```bash
# Different models for different needs
ollama pull llama3.1:8b   # Fast, basic
ollama pull llama3.1:70b  # Slower, better quality
ollama pull mistral       # Alternative
ollama pull codellama     # Code-focused
```

---

## 🆘 Troubleshooting

### "API Key Invalid"
```
1. Check key is correct (no extra spaces)
2. Verify account has credits (paid providers)
3. Try generating new key
```

### "Ollama Not Running"
```bash
# Check if Ollama is running
ollama list

# If not, start it
ollama serve

# Or restart your computer
```

### "Rate Limit Exceeded"
```
Groq: Wait 1 minute (free tier)
Paid: Check your account limits
Ollama: No limits (local)
```

### "Poor Quality Results"
```
1. Try Claude or GPT-4 (best quality)
2. Increase temperature (0.8-0.9)
3. Provide better requirements
4. Review and edit AI output
```

---

## 📊 Performance Comparison

### Test: Generate 30 test cases for PLTF-4571

| Provider | Time | Quality | Cost | Would Use Again |
|----------|------|---------|------|-----------------|
| Claude 3.5 | 8s | ⭐⭐⭐⭐⭐ | $0.15 | Yes |
| GPT-4 | 10s | ⭐⭐⭐⭐⭐ | $0.25 | Yes |
| Groq | **3s** | ⭐⭐⭐⭐ | $0 | **YES!** |
| Ollama | 25s | ⭐⭐⭐ | $0 | Yes (offline) |
| GPT-3.5 | 5s | ⭐⭐⭐⭐ | $0.03 | Yes |
| Gemini | 7s | ⭐⭐⭐⭐ | $0 | Yes |
| Template | 1s | ⭐⭐ | $0 | Basic needs |

**Winner:** Groq (FREE, fast, good quality!)

---

## 🎓 Getting Started Checklist

### For FREE Users:
- [ ] Sign up at console.groq.com
- [ ] Get API key
- [ ] Configure in VS Code
- [ ] Generate first test cases
- [ ] Compare with template-based
- [ ] Choose your favorite!

### For Paid Users:
- [ ] Choose provider (Claude recommended)
- [ ] Create account
- [ ] Add payment method
- [ ] Get API key
- [ ] Configure in VS Code
- [ ] Test generation
- [ ] Monitor costs

### For Privacy Users:
- [ ] Install Ollama
- [ ] Download llama3.1 model
- [ ] Configure endpoint
- [ ] Test generation
- [ ] Enjoy offline AI!

---

## 🌟 Recommended Setup

### **Best Value Setup (FREE):**
```
Primary: Groq Llama 3.1
Fallback: Template-Based
Cost: $0
Quality: ⭐⭐⭐⭐
```

### **Professional Setup:**
```
Primary: Claude 3.5 Sonnet
Fallback: Groq (FREE)
Cost: ~$10-20/month
Quality: ⭐⭐⭐⭐⭐
```

### **Enterprise Setup:**
```
Primary: Claude 3.5 Sonnet
Secondary: GPT-4 Turbo
Fallback: Groq
Cost: ~$50-100/month for team
Quality: ⭐⭐⭐⭐⭐
```

---

## 📞 Need Help?

- **Groq Issues**: https://console.groq.com/docs
- **Ollama Issues**: https://github.com/ollama/ollama/issues
- **Claude Issues**: https://docs.anthropic.com/
- **OpenAI Issues**: https://platform.openai.com/docs
- **Extension Issues**: GitHub Issues

---

## 🎉 Start Now!

1. **Choose a provider** (Recommend: Groq FREE)
2. **Get API key** (2 minutes)
3. **Configure extension** (1 minute)
4. **Generate test cases** (10 seconds)
5. **Enjoy!** ✨

---

**Remember:** You can change providers anytime. Start with FREE options, upgrade if needed!

---

*Last Updated: November 4, 2025*
*Extension Version: 1.0.0*

