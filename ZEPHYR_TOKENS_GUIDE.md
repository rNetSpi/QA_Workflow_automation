# 🔑 Zephyr Tokens Guide

## Quick Answer to Your Questions:

### ❓ "Is JWT mandatory for adding test steps?"
**Answer:** No, but **highly recommended**. 

- **Without JWT**: Extension will try v2 API (may not format correctly)
- **With JWT**: Uses TM4J API (reliable, proven to work)

### ❓ "Can API token link test cases to Jira?"
**Answer:** No! ❌ JWT token is required for linking test cases to Jira issues.

---

## 🔑 Token Comparison

| Feature | API Token (Bearer) | JWT Token |
|---------|-------------------|-----------|
| **Format** | Long alphanumeric string | Starts with `eyJ...` |
| **Get From** | Zephyr Settings in Jira | Browser Developer Tools |
| **Expires** | No (or very long-lived) | Yes (frequently) |
| **Required?** | ✅ YES - Mandatory | ✅ YES - For full functionality |
| **Create test cases** | ✅ Yes | ❌ No |
| **Find/create folders** | ✅ Yes | ❌ No |
| **Add test steps** | ❌ No | ✅ Yes |
| **Link to Jira** | ❌ No | ✅ Yes |
| **Get test case details** | ✅ Yes | ❌ No |

---

## 📋 What Each Token Does

### API Token (Bearer) - **REQUIRED**

```
Uses: Zephyr Scale Cloud API v2
Base URL: https://api.zephyrscale.smartbear.com/v2
Header: Authorization: Bearer {token}
```

**Capabilities:**
1. ✅ **Create test cases** - Name, objective, preconditions, priority
2. ✅ **List folders** - Find existing folders by name
3. ✅ **Create folders** - Create new folders if needed
4. ✅ **Get test case** - Retrieve test case details
5. ✅ **Link to Jira** - Link test cases to Jira issues
6. ⚠️ **Add test steps** - Can add, but formatting often incorrect

**Without this token:**
- ❌ Extension won't work at all
- ❌ Can't create test cases
- ❌ Can't upload anything to Zephyr

---

### JWT Token - **OPTIONAL (Recommended)**

```
Uses: TM4J Internal API
Base URL: https://app.tm4j.smartbear.com/backend/rest/tests/2.0
Header: Authorization: JWT {token}
```

**Capabilities:**
1. ✅ **Add test steps reliably** - Steps appear in correct section
2. ✅ **Format expected results** - Results in proper place
3. ✅ **Step-by-step script** - Proper Test Script section formatting

**Without this token:**
- ✅ Test cases still created
- ⚠️ Test steps added via v2 API (may be incorrect)
- ⚠️ Steps might appear in wrong sections
- ⚠️ Expected results might not format properly

---

## 🚀 How The Extension Works

### **Scenario 1: Only API Token Configured**

```
1. Create test case ✅ (API Token)
   ├─ Name, objective, preconditions added
   ├─ Folder assigned
   └─ Test case created successfully

2. Add test steps ⚠️ (API Token via v2 API)
   ├─ Attempts to add steps
   ├─ May work, may not format correctly
   └─ Warning shown: "Configure JWT for better results"

Result: Test case created, but steps may be in wrong place
```

### **Scenario 2: Both Tokens Configured** ✅ RECOMMENDED

```
1. Create test case ✅ (API Token)
   ├─ Name, objective, preconditions added
   ├─ Folder assigned
   └─ Test case created successfully

2. Add test steps ✅ (JWT Token via TM4J API)
   ├─ Steps added to Test Script section
   ├─ Expected results in proper place
   └─ Perfect formatting

Result: Test case created with properly formatted steps
```

---

## 📥 How to Get These Tokens

### **API Token (Bearer)**

1. Go to your Jira instance
2. Click profile picture → **Settings**
3. Look for **"Zephyr Scale API Access Tokens"**
4. Click **"Create API Token"**
5. Name it: `VS Code Extension`
6. Copy the token
7. Paste in VS Code settings: `qaTestGenerator.zephyr.apiToken`

### **JWT Token**

⚠️ **Note:** This token expires! You'll need to refresh it regularly.

**Method 1: Browser Developer Tools**
1. Open Zephyr Scale in your browser
2. Press `F12` or `Cmd+Option+I` (Developer Tools)
3. Go to **Network** tab
4. Open any test case in Zephyr
5. Look for requests to `tm4j.smartbear.com`
6. Click on a request → **Headers** → **Request Headers**
7. Find: `authorization: JWT eyJ...`
8. Copy everything after `JWT ` (the `eyJ...` part)
9. Paste in VS Code settings: `qaTestGenerator.zephyr.jwtToken`

**Method 2: Console** (Advanced)
1. Open Zephyr Scale in browser
2. Press `F12` → **Console** tab
3. Paste this code:
```javascript
localStorage.getItem('jwt')
```
4. Copy the result (without quotes)
5. Paste in VS Code settings: `qaTestGenerator.zephyr.jwtToken`

---

## ⚙️ Configuration Example

```json
{
  // REQUIRED - For creating test cases
  "qaTestGenerator.zephyr.apiToken": "abc123def456...",
  
  // OPTIONAL - For proper test steps formatting
  "qaTestGenerator.zephyr.jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  // Project details
  "qaTestGenerator.zephyr.projectKey": "PLTF",
  "qaTestGenerator.zephyr.projectId": "10024"
}
```

---

## 🔍 How to Check What's Happening

### **Watch the Console Logs:**

1. Press `Cmd+Shift+U` (Output panel)
2. Select **"Extension Host"** from dropdown
3. Upload test cases
4. Look for these messages:

**With JWT Token:**
```
[Zephyr] 🔑 JWT token configured - using TM4J API for test steps
[Zephyr] Getting test case ID for key: PLTF-T123
[Zephyr] Adding 8 test steps to PLTF-T123 (ID: 12345)
[Zephyr] Sending 8 steps to TM4J API
[Zephyr] ✅ Test steps added successfully
```

**Without JWT Token:**
```
[Zephyr] ⚠️ JWT token not configured. Attempting v2 API
[Zephyr] 💡 For best results, configure JWT token
[Zephyr] Adding 8 test steps using v2 API
[Zephyr] ⚠️ Note: Steps may not format correctly
```

---

## 💡 Recommendations

### **For Development/Testing:**
- ✅ Configure API Token only
- ⚠️ Accept that steps may not format perfectly
- ✅ Quick setup, good enough for testing

### **For Production Use:**
- ✅ Configure BOTH tokens
- ✅ Proper formatting guaranteed
- ✅ Professional results
- ⚠️ Remember to refresh JWT token when it expires

### **Token Expiry Warning:**
```
If you see this error:
[Zephyr] ❌ Error: 401 Unauthorized
[Zephyr] 💡 JWT token expired or invalid

Solution:
1. Get fresh JWT token from browser
2. Update qaTestGenerator.zephyr.jwtToken
3. Reload VS Code
4. Try again
```

---

## 🎯 Summary

| Task | Minimum Needed | Required |
|------|---------------|----------|
| **Create test cases** | API Token | API Token |
| **Assign to folders** | API Token | API Token |
| **Add test steps** | JWT Token | JWT Token |
| **Link to Jira** | JWT Token | JWT Token |
| **Production use** | Both Tokens | API Token + JWT Token |

---

## ✅ Final Answer:

**Q: "Is JWT mandatory for adding test steps?"**
- **A:** YES! JWT token is **required** for adding test steps properly.

**Q: "Can API token link test cases to Jira?"**
- **A:** NO! JWT token is **required** for linking test cases to Jira.

**Best Practice:**
- ✅ Always configure BOTH tokens (both required for full functionality)
- ✅ API Token: For creating/managing test cases
- ✅ JWT Token: For adding test steps and linking to Jira
- ✅ Refresh JWT Token when it expires (it expires frequently!)


