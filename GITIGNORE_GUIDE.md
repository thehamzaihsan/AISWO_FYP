# 📋 AISWO Project - .gitignore Guide

## Overview
This guide explains the `.gitignore` configuration for the AISWO (AI Smart Waste Optimization) project. The gitignore file is properly organized and documented to ensure sensitive data never gets committed to version control.

---

## 🔒 Security - Critical Files (NEVER COMMIT!)

### 1. **Environment Variables**
Files containing API keys, credentials, and configuration:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**✅ Safe to commit:** `.env.example` (template file without real credentials)

### 2. **Firebase Credentials**
Firebase service account keys containing project secrets:
```
serviceAccountKey.json
firebase-adminsdk-*.json
```

**⚠️ Warning:** These files contain full admin access to your Firebase project!

### 3. **Certificates & Keys**
SSL/TLS certificates and private keys:
```
*.pem
*.key
*.crt
*.p12
*.pfx
```

---

## 📦 Build & Dependencies

### Node.js Dependencies
```
node_modules/          # NPM packages (can be reinstalled)
package-lock.json     # ✅ COMMIT THIS (locks dependency versions)
```

### Build Outputs
```
build/                 # React production build
dist/                  # Distribution files
.next/                # Next.js build
```

**Why ignore builds?** They can be regenerated from source code.

---

## 📂 Project Structure

```
AISWO_FYP/
├── .gitignore                    # ✅ Main project gitignore
├── .env.example                  # ✅ Template (safe to commit)
├── .env                          # ❌ Actual credentials (IGNORED)
│
├── aiswo-backend/
│   ├── .env                      # ❌ Backend secrets (IGNORED)
│   ├── .env.example              # ✅ Template
│   ├── serviceAccountKey.json    # ❌ Firebase key (IGNORED)
│   ├── node_modules/             # ❌ Dependencies (IGNORED)
│   ├── server.log                # ❌ Log file (IGNORED)
│   ├── chatbot/                  # ✅ Source code (COMMIT)
│   └── server.js                 # ✅ Source code (COMMIT)
│
├── aiswo_frontend/
│   ├── .gitignore                # ✅ Frontend-specific ignore
│   ├── .env                      # ❌ Frontend secrets (IGNORED)
│   ├── node_modules/             # ❌ Dependencies (IGNORED)
│   ├── build/                    # ❌ Build output (IGNORED)
│   └── src/                      # ✅ Source code (COMMIT)
│
├── esp32/
│   └── esp32.ino                 # ✅ ESP32 code (COMMIT)
│
└── esp32_code/
    ├── smart_bin_esp32.ino       # ✅ ESP32 code (COMMIT)
    └── README.md                 # ✅ Documentation (COMMIT)
```

---

## 🎯 What to Commit vs. Ignore

### ✅ **ALWAYS COMMIT:**
- Source code (`*.js`, `*.jsx`, `*.ino`, etc.)
- Configuration templates (`.env.example`)
- Documentation (`README.md`, `*.md`)
- Package definitions (`package.json`)
- Lock files (`package-lock.json`)
- Git configuration (`.gitignore`)

### ❌ **NEVER COMMIT:**
- Credentials & secrets (`.env`, API keys)
- Firebase service account keys
- Dependencies (`node_modules/`)
- Build outputs (`build/`, `dist/`)
- Log files (`*.log`)
- OS-specific files (`.DS_Store`, `Thumbs.db`)
- IDE settings (`.vscode/`, `.idea/`)

---

## 🔍 How to Check if Files are Ignored

### Test a specific file:
```bash
git check-ignore -v .env
```

**Output:**
```
.gitignore:14:.env    .env
```
✅ File is ignored (safe!)

### Check multiple files:
```bash
git check-ignore -v serviceAccountKey.json .env node_modules/
```

### See what files are currently tracked:
```bash
git ls-files
```

### See what files would be added:
```bash
git status --short
```

---

## 🛠️ Common Issues & Solutions

### ❌ **Problem:** Already committed sensitive files
```bash
# Remove from Git but keep locally
git rm --cached .env
git rm --cached serviceAccountKey.json

# Commit the removal
git commit -m "Remove sensitive files from version control"

# Make sure .gitignore includes these files
# Then push
git push
```

### ❌ **Problem:** .gitignore not working
```bash
# Clear Git cache and reapply .gitignore
git rm -r --cached .
git add .
git commit -m "Fix .gitignore"
```

### ❌ **Problem:** Large node_modules committed
```bash
# Remove node_modules from Git
git rm -r --cached node_modules/

# Make sure node_modules/ is in .gitignore
echo "node_modules/" >> .gitignore

# Commit and push
git add .gitignore
git commit -m "Remove node_modules from version control"
git push
```

---

## 📊 File Categories Explained

### 1. **Security & Sensitive Data**
- Environment variables with API keys
- Firebase credentials
- SSL certificates
- Database credentials

### 2. **Dependencies**
- `node_modules/` - Can be reinstalled with `npm install`
- Package manager cache files

### 3. **Build Artifacts**
- Compiled/transpiled code
- Production builds
- Temporary build files

### 4. **Logs & Runtime Data**
- Application logs (`*.log`)
- Process IDs (`*.pid`)
- Debug information

### 5. **OS & Editor Files**
- macOS: `.DS_Store`
- Windows: `Thumbs.db`
- Linux: `*~`
- VSCode: `.vscode/`

### 6. **Temporary & Cache**
- Cache directories
- Temporary files
- Backup files (`*.bak`)

---

## 🚀 Best Practices

### 1. **Never commit secrets**
Use `.env.example` as a template:
```bash
# .env.example (SAFE - commit this)
FIREBASE_API_KEY=your_api_key_here
MISTRAL_API_KEY=your_mistral_key_here

# .env (NEVER COMMIT - contains real keys)
FIREBASE_API_KEY=AIzaSyBxyz...
MISTRAL_API_KEY=sk_abc123...
```

### 2. **Check before committing**
```bash
# See what you're about to commit
git status

# Review changes
git diff

# Make sure no sensitive files are staged
git diff --cached
```

### 3. **Use environment variables**
```javascript
// ✅ GOOD - uses environment variable
const apiKey = process.env.MISTRAL_API_KEY;

// ❌ BAD - hardcoded secret
const apiKey = "sk_abc123...";
```

### 4. **Keep .gitignore updated**
When you add new sensitive files or directories, immediately add them to `.gitignore`.

---

## 🔗 Quick Commands

```bash
# Check ignored files
git check-ignore -v <filename>

# See all tracked files
git ls-files

# Remove file from Git but keep locally
git rm --cached <filename>

# Reset .gitignore (clear cache and reapply)
git rm -r --cached .
git add .
git commit -m "Reapply .gitignore"

# See what would be committed
git status --short
git diff --cached
```

---

## 📚 Additional Resources

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub's gitignore templates](https://github.com/github/gitignore)
- [Gitignore.io - Generate gitignore files](https://www.toptal.com/developers/gitignore)

---

## ✅ Checklist for New Team Members

Before committing:
- [ ] Created `.env` file from `.env.example`
- [ ] Added your API keys to `.env` (NOT `.env.example`)
- [ ] Verified `.env` is in `.gitignore`
- [ ] Checked `serviceAccountKey.json` is ignored
- [ ] Ran `git status` to verify no sensitive files are staged
- [ ] Reviewed changes with `git diff`
- [ ] Never committed passwords, API keys, or credentials

---

**Last Updated:** 2025-11-25  
**Maintainer:** AISWO Development Team  
**Project:** AI Smart Waste Optimization (FYP)
