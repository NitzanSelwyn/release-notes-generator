# Release Notes Generator

A CLI tool and GitHub Action to generate categorized release notes from git commit messages, optionally using an LLM API for summarization.

## Features
- Categorizes commits as Features, Bug Fixes, or Other Changes
- Summarizes commit messages using an LLM API (optional)
- Outputs release notes to the console and to a `release_notes.md` file
- Usable as a GitHub Action in any repository

## Setup (Local CLI)

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your LLM API details if you want to use summarization.

## Usage (Local CLI)

```bash
npx ts-node src/main.ts <source_branch> <target_branch> [repo_path]
```
- `<source_branch>`: The branch with new changes (e.g., `dev`)
- `<target_branch>`: The branch to compare against (e.g., `main`)
- `[repo_path]`: (Optional) Path to the git repository (defaults to current directory)

Example:
```bash
npx ts-node src/main.ts dev main /path/to/any/repo
```

## Usage as a GitHub Action

You can use this project as a GitHub Action in any repository to automatically generate release notes between two branches. The action will output the release notes to both the workflow logs and a downloadable `release_notes.md` artifact.

### Example Workflow
Add the following to `.github/workflows/release-notes.yml` in your repository:

```yaml
name: Generate Release Notes

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: <yourusername>/release-notes-generator@main
        with:
          source_branch: dev
          target_branch: main
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          LLM_API_URL: ${{ secrets.LLM_API_URL }}
      - name: Upload release notes
        uses: actions/upload-artifact@v3
        with:
          name: release-notes
          path: release_notes.md
```
- Replace `<yourusername>/release-notes-generator@main` with your actual repo and branch/tag.
- The `release_notes.md` file will be available as a downloadable artifact after the workflow runs.

## Environment Variables

Create a `.env` file in the project root with the following variables:

- `LLM_API_URL` - (Optional) URL of your LLM summarization API (e.g., OpenAI Chat API)
- `OPENAI_API_KEY` - (Optional) API key for your LLM service

See `.env.example` for a template.

## Example Output
```
## New Features
- Add user login (Commit: ab12cd3)

## Bug Fixes
- Fix crash on startup (Commit: ef45gh6)

## Other Changes
- Update dependencies (Commit: ij78kl9)
```

## License
MIT 