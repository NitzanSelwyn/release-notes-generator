import { simpleGit, SimpleGit } from 'simple-git';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const LLM_API_URL = process.env.LLM_API_URL || '';
const LLM_API_KEY = process.env.LLM_API_KEY || '';

interface CommitInfo {
    message: string;
    hash: string;
}

async function analyzeCommits(repoPath: string, lastReleaseTag: string): Promise<{ features: CommitInfo[]; bugFixes: CommitInfo[]; otherChanges: CommitInfo[] }> {
    const git: SimpleGit = simpleGit(repoPath); // Use the provided repoPath

    try {
        const log = await git.log({ from: lastReleaseTag, to: 'HEAD' });

        const features: CommitInfo[] = [];
        const bugFixes: CommitInfo[] = [];
        const otherChanges: CommitInfo[] = [];

        log.all.forEach(commit => {
            const message = commit.message.trim();
            const hash = commit.hash;

            if (new RegExp("^feat(\([^)]*\))?:").test(message)) {
                features.push({ message, hash });
            } else if (new RegExp("^fix(\([^)]*\))?:").test(message)) {
                bugFixes.push({ message, hash });
            } else if (message.toLowerCase().includes("bug") || message.toLowerCase().includes("fix")) {
                bugFixes.push({ message, hash });
            } else {
                otherChanges.push({ message, hash });
            }
        });

        return { features, bugFixes, otherChanges };

    } catch (error) {
        console.error("Error analyzing commits:", error);
        return { features: [], bugFixes: [], otherChanges: [] }; // Return empty arrays in case of error
    }
}

async function summarizeWithLLM(text: string, instruction: string): Promise<string | null> {
    if (!LLM_API_URL || !LLM_API_KEY) {
        console.warn("LLM_API_URL or LLM_API_KEY not set. Skipping LLM summarization.");
        return null;
    }

    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({ prompt: `${instruction}\n\n${text}` }),
        });

        if (!response.ok) {
            console.error(`LLM API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.summary || null; // Assuming the API returns a "summary" field
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return null;
    }
}


async function generateReleaseNotes(features: CommitInfo[], bugFixes: CommitInfo[], otherChanges: CommitInfo[]): Promise<string> {
    let releaseNotes = "";

    if (features.length > 0) {
        releaseNotes += "## New Features\n";
        for (const feature of features) {
            const summary = await summarizeWithLLM(feature.message, "Summarize this Git commit message:");
            releaseNotes += `- ${summary ? summary : feature.message} (Commit: ${feature.hash.substring(0, 7)})\n`; //Show commit hash
        }
    }

    if (bugFixes.length > 0) {
        releaseNotes += "\n## Bug Fixes\n";
        for (const fix of bugFixes) {
            const summary = await summarizeWithLLM(fix.message, "Summarize this Git commit message:");
            releaseNotes += `- ${summary ? summary : fix.message} (Commit: ${fix.hash.substring(0, 7)})\n`; //Show commit hash
        }
    }

    if (otherChanges.length > 0) {
        releaseNotes += "\n## Other Changes\n";
        for (const change of otherChanges) {
            releaseNotes += `- ${change.message} (Commit: ${change.hash.substring(0, 7)})\n`; //Show commit hash
        }
    }

    return releaseNotes;
}

// Main function to handle the process

// Get the source and target branches and repo path from command line arguments

const sourceBranch = process.argv[2];
const targetBranch = process.argv[3];
const repoPath = process.argv[4] || '.';

if (!sourceBranch || !targetBranch) {
    console.error("Usage: ts-node src/main.ts <source_branch> <target_branch> [repo_path]");
    process.exit(1);
}

// Refactor main to use branches and repo path
async function main(sourceBranch: string, targetBranch: string, repoPath: string): Promise<void> {
    try {
        const { features, bugFixes, otherChanges } = await analyzeCommits(repoPath, `${targetBranch}..${sourceBranch}`);
        const releaseNotes = await generateReleaseNotes(features, bugFixes, otherChanges);
        console.log(releaseNotes);
        fs.writeFileSync('release_notes.md', releaseNotes); // Save to file
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main(sourceBranch, targetBranch, repoPath);