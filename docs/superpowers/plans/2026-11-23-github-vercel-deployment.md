# GitHub & Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize Git, secure secrets, push the project to a private GitHub repository, and link it to Vercel.

**Architecture:** Git Version Control -> GitHub Private Repository -> Vercel Deployment & Environment Configuration.

**Tech Stack:** Git, GitHub CLI (`gh`), Vercel, Node.js / Vite / Express / Prisma.

**Spec:** `docs/superpowers/specs/2026-11-23-github-vercel-deployment-design.md`

## Global Constraints
- Repository MUST be private.
- Never commit secret credentials, client secrets, or local environment files (`.env`, `.env.vercel`, `.env.vercel.prod`).

## Review Focus
- Check `git status` before commit to confirm untracked secret files are ignored.
- Verify repository accessibility on GitHub.
- Confirm Vercel configuration readiness.

---

### Task 1: Secure Secrets & Update `.gitignore`
- [ ] Add `client_secret_*.json`, `*.zip`, `*.log`, `*.db`, `sdd/` to `.gitignore`.
- [ ] Verify `git check-ignore` or file status ignores sensitive items.

### Task 2: Initialize Git Repository & Commit
- [ ] Run `git init -b main`.
- [ ] Stage files (`git add .`) excluding ignored files.
- [ ] Run `git commit -m "Initial commit for Vercel deployment"`.

### Task 3: Create GitHub Private Repository & Push
- [ ] Use `gh repo create aqar --private --source=. --remote=origin --push`.
- [ ] Verify remote `origin` and branch status.

### Task 4: Connect & Prepare Vercel Deployment
- [ ] Verify `vercel.json` rewrites and build script in `package.json`.
- [ ] Provide instructions and link to import/connect the repository in Vercel and set environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, etc.).
