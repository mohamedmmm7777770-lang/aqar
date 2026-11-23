# GitHub & Vercel Deployment Design

## Intent & Why
Connect the `aqar` real estate web application to GitHub as a private repository under `mohamedmmm7777770-lang`, and link it to Vercel for continuous deployment, while protecting credentials and API keys.

## Goals
1. Secure `.gitignore` to prevent leaking API keys, client secrets (`client_secret_*.json`), and unnecessary files.
2. Ensure environment variables can be safely injected on Vercel (`DATABASE_URL`, `GEMINI_API_KEY`, etc.).
3. Initialize local Git repository and create the initial commit.
4. Create a private GitHub repository `aqar` via `gh` CLI and push the code.
5. Provide and configure the Vercel link and deployment.

## Non-Goals
- Modifying UI components or business logic in the app.

## Security Constraints
- Repository must be `private`.
- No sensitive client secrets, OAuth tokens, or private credentials committed to GitHub.
