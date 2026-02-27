# Codex Skills Repository

Vercel `skills` CLI-compatible skill repository.

## Install locations

| Agent | Project install (default) | Global install (`-g`) |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.codex/skills/<skill-name>/` |

Run install commands from the project root when you want project-scoped installs.

## Available skills

### `execplan-review`

Use when the user requests a review of the ExecPlan.

```bash
npx skills add https://github.com/Skarian/codex-skills --skill execplan-review -a codex -y
```

### `reference-module`

Use to research git repos when user requests.

```bash
npx skills add https://github.com/Skarian/codex-skills --skill reference-module -a codex -y
```

### `url-to-markdown`

Local URL-to-markdown pipeline using Firecrawl self-hosted, with stdout output and idle shutdown.

```bash
npx skills add https://github.com/Skarian/codex-skills --skill url-to-markdown -a codex -y
```

## Listing skills from this repo

```bash
npx skills add https://github.com/Skarian/codex-skills --list -a codex
```

## Using With Claude Code

Claude Code project install path: `.claude/skills/<skill-name>/`.

To list skills:

```bash
npx skills add https://github.com/Skarian/codex-skills --list -a claude-code
```

To install a skill:

```bash
npx skills add https://github.com/Skarian/codex-skills --skill <skill-name> -a claude-code -y
```
