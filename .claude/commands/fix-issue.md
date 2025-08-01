# Fix GitHub Issue

This command analyzes the repository for a specific GitHub issue, creates a branch, implements the fix, and creates a PR for review.

## Usage
```
/fix-issue <issue-number>
```

## Description
This command will:
1. Fetch the GitHub issue details using `gh` CLI
2. Analyze the codebase to understand the issue context
3. Create a new branch for the fix
4. Implement the necessary code changes
5. Commit the changes with a descriptive message
6. Push the branch to GitHub
7. Create a pull request with proper description
8. Request review from keving3ng

## Prerequisites
- GitHub CLI (`gh`) must be installed and authenticated
- Repository must be a git repository with GitHub remote
- User must have write access to the repository

## Example
```
/fix-issue 42
```

This will process GitHub issue #42, implement a fix, and create a PR for review.

---

# Implementation

```bash
#!/bin/bash

# Check if issue number is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide an issue number"
    echo "Usage: /fix-issue <issue-number>"
    exit 1
fi

ISSUE_NUMBER=$1
REPO_NAME=$(basename `git rev-parse --show-toplevel`)
BRANCH_NAME="fix/issue-$ISSUE_NUMBER"

echo "🔍 Analyzing GitHub issue #$ISSUE_NUMBER..."

# Fetch issue details
ISSUE_JSON=$(gh issue view $ISSUE_NUMBER --json title,body,labels,assignees)
ISSUE_TITLE=$(echo $ISSUE_JSON | jq -r '.title')
ISSUE_BODY=$(echo $ISSUE_JSON | jq -r '.body')

if [ "$ISSUE_TITLE" = "null" ]; then
    echo "❌ Error: Issue #$ISSUE_NUMBER not found or not accessible"
    exit 1
fi

echo "📋 Issue: $ISSUE_TITLE"
echo "📝 Description: $ISSUE_BODY"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "⚠️  Branch $BRANCH_NAME already exists. Switching to it..."
    git checkout $BRANCH_NAME
else
    echo "🌿 Creating new branch: $BRANCH_NAME"
    git checkout -b $BRANCH_NAME
fi

# Save issue context for Claude
cat > /tmp/issue_context.md << EOF
# GitHub Issue #$ISSUE_NUMBER: $ISSUE_TITLE

## Description
$ISSUE_BODY

## Task
Please analyze this issue and implement the necessary fixes. Consider:
1. The issue description and requirements
2. The current codebase structure
3. Best practices for this project
4. Existing patterns and conventions

After implementing the fix:
1. Test the changes thoroughly
2. Ensure all lint and type checks pass
3. Write clear commit messages
4. The changes should be ready for code review

## Repository Context
- Repository: $REPO_NAME
- Branch: $BRANCH_NAME
- Issue: #$ISSUE_NUMBER
EOF

echo "🤖 Claude will now analyze the issue and implement the fix..."
echo "📄 Issue context saved to /tmp/issue_context.md"

# This is where Claude would take over the implementation
# For now, we'll provide the context and let the user continue manually
echo ""
echo "Next steps:"
echo "1. Review the issue context in /tmp/issue_context.md"
echo "2. Implement the necessary changes"
echo "3. Run: npm run lint && npm run type-check && npm run build"
echo "4. Commit changes: git commit -m 'fix: resolve issue #$ISSUE_NUMBER - $ISSUE_TITLE'"
echo "5. Push branch: git push -u origin $BRANCH_NAME"
echo "6. Create PR: gh pr create --title 'Fix #$ISSUE_NUMBER: $ISSUE_TITLE' --body 'Resolves #$ISSUE_NUMBER' --reviewer keving3ng"
```

---

# Claude Integration Script

```javascript
// This would be the Claude-specific implementation
// File: .claude/commands/fix-issue.js

const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async function fixIssue(issueNumber, tools) {
  try {
    // Fetch issue details
    const issueJson = execSync(`gh issue view ${issueNumber} --json title,body,labels`, 
      { encoding: 'utf8' });
    const issue = JSON.parse(issueJson);
    
    if (!issue.title) {
      throw new Error(`Issue #${issueNumber} not found`);
    }

    console.log(`🔍 Analyzing issue #${issueNumber}: ${issue.title}`);
    
    // Create branch
    const branchName = `fix/issue-${issueNumber}`;
    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
      console.log(`🌿 Created branch: ${branchName}`);
    } catch (error) {
      execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
      console.log(`🌿 Switched to existing branch: ${branchName}`);
    }

    // Use Claude tools to analyze and implement
    const codebaseAnalysis = await tools.grep({
      pattern: '.*',
      output_mode: 'files_with_matches',
      glob: '**/*.{ts,tsx,js,jsx,json,md}'
    });

    const issueContext = `
# GitHub Issue #${issueNumber}: ${issue.title}

## Description
${issue.body}

## Codebase Files
${codebaseAnalysis.join('\n')}

## Instructions
Please analyze this issue and implement the necessary fixes following the project's patterns and conventions.
    `;

    // This would trigger Claude's analysis and implementation
    return {
      issueNumber,
      title: issue.title,
      branchName,
      context: issueContext,
      nextSteps: [
        'Analyze the issue requirements',
        'Implement the necessary changes',
        'Test the implementation',
        'Create pull request with review request'
      ]
    };
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
};
```