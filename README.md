# Codex Skills Repository

Vercel `skills` CLI-compatible skill repository.

## Repository layout

```text
skills/
  url-to-markdown/
    SKILL.md
    README.md
    advanced.md
    scripts/
```

## Install locations

| Agent | Project install (default) | Global install (`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.codex/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |

Run install commands from the project root when you want project-scoped installs.

## Available skills

| Name | Description | Install command (Codex) | Install command (Claude Code) |
| --- | --- | --- | --- |
| `url-to-markdown` | Local URL-to-markdown pipeline using Firecrawl self-hosted, with stdout output and idle shutdown. | `npx skills add https://github.com/Skarian/codex-skills --skill url-to-markdown -a codex -y` | `npx skills add https://github.com/Skarian/codex-skills --skill url-to-markdown -a claude-code -y` |

## Listing skills from this repo

```bash
npx skills add https://github.com/Skarian/codex-skills --list -a codex
```

```bash
npx skills add https://github.com/Skarian/codex-skills --list -a claude-code
```
