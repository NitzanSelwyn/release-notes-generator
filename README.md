# Release Notes Generator

A CLI tool to generate categorized release notes from git commit messages, optionally using an LLM API for summarization.

## Features
- Categorizes commits as Features, Bug Fixes, or Other Changes
- Summarizes commit messages using an LLM API (optional)
- Outputs release notes to the console (optionally to a file)

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your LLM API details if you want to use summarization.

## Usage

```bash
npx ts-node src/main.ts <repository_path> <last_release_tag>
```
- `<repository_path>`: Path to the git repository (e.g., `.` for current directory)
- `<last_release_tag>`: The git tag or commit hash to start from (e.g., `v1.0.0`)

Example:
```bash
npx ts-node src/main.ts . v1.0.0
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

- `LLM_API_URL` - (Optional) URL of your LLM summarization API
- `LLM_API_KEY` - (Optional) API key for your LLM service

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