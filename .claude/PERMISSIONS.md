# Claude Code Permissions Configuration

This document explains the permissions configuration for Claude Code auto-accept mode to speed up development workflows while maintaining safety.

## Purpose

The permissions configuration allows Claude Code to automatically execute safe commands without requiring manual approval, significantly speeding up development workflows while preventing potentially destructive operations.

## Safe Commands (Auto-Approved)

### File Operations
- `ls`, `find`, `cat`, `head`, `tail` - Safe file viewing/listing
- `grep`, `rg` - Safe text searching  
- `wc`, `sort`, `uniq` - Safe text processing
- `mkdir`, `chmod` - Safe directory/permission operations
- `rm` - File deletion (with careful patterns, excluding system paths)

### Text Processing
- `awk`, `sed` - Safe text manipulation
- `echo`, `pwd`, `date`, `whoami` - Safe system information
- `which` - Safe command location lookup

### Git Operations (Safe)
- `git status`, `git log`, `git diff`, `git branch`, `git show` - Safe repository inspection
- `git add`, `git commit`, `git push`, `git pull` - Safe repository operations
- `git checkout`, `git show-ref`, `git remote` - Safe branch/reference operations
- `git rev-parse`, `git config --get` - Safe configuration reading

### GitHub CLI (Safe)
- `gh issue list`, `gh issue view` - Safe issue viewing
- `gh pr list`, `gh pr view`, `gh pr create` - Safe PR operations
- `gh auth status` - Safe authentication checking

### Development Tools
- `npm install`, `npm run *` - Safe package management and script execution
- `node --version`, `npm --version`, `npx --version` - Safe version checking
- `curl`, `wget` - Safe HTTP requests (with domain restrictions)

### Process Management (Limited)
- `pkill`, `killall` - Safe process termination (for development servers)

### Utilities
- `basename`, `dirname` - Safe path manipulation
- `jq` - Safe JSON processing

## Restricted Commands (Requires Manual Approval)

### System Administration
- `sudo`, `su` - Privilege escalation
- `chown`, `chgrp` - Ownership changes
- `passwd`, `useradd`, `userdel`, `usermod` - User management
- `groupadd`, `groupdel` - Group management

### Dangerous File Operations
- `rm -rf /*`, `rm -rf /` - System-wide deletion
- `dd`, `format`, `fdisk`, `mkfs` - Disk formatting/partitioning
- `mount`, `umount` - Filesystem mounting

### Destructive Git Operations
- `git reset --hard` - Hard resets
- `git clean -fd` - Force deletion of untracked files
- `git push --force`, `git push -f` - Force pushes

### Destructive GitHub Operations
- `gh repo delete` - Repository deletion
- `gh issue close`, `gh pr close` - Issue/PR closure

## Web Fetch Domains

The following domains are pre-approved for automatic web fetching:
- `linkedin.com` - Professional networking
- `github.com` - Code repository information
- `docs.anthropic.com` - Claude Code documentation
- `nextjs.org` - Next.js documentation
- `tailwindcss.com` - Tailwind CSS documentation
- `reactjs.org` - React documentation
- `typescript.org` - TypeScript documentation
- `www.faire.com` - Work-related research
- `job-boards.greenhouse.io` - Job posting research

## Usage

With this configuration, Claude Code will automatically execute approved commands without requiring manual confirmation, significantly speeding up development workflows while maintaining safety through:

1. **Explicit Allow List**: Only pre-approved commands are auto-executed
2. **Explicit Deny List**: Dangerous operations are explicitly blocked
3. **Domain Restrictions**: Web fetches are limited to trusted domains
4. **Pattern Matching**: Commands are matched against specific patterns

## Updating Permissions

To add new safe commands:
1. Add the command pattern to the `allow` array
2. Ensure the command doesn't pose security risks
3. Test the command in a safe environment
4. Document any domain-specific restrictions

To block additional commands:
1. Add the command pattern to the `deny` array
2. Document the reason for the restriction

## Security Considerations

- All file operations are limited to the project directory
- No system-wide modifications are permitted
- Network access is restricted to approved domains
- Process termination is limited to development tools
- No privilege escalation is allowed
- Git force operations are blocked to prevent data loss