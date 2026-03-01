# precommit-review

Use this skill when the user wants a commit-readiness review in phases:

- Phase 1: exhaustive source/worktree review (including tangential files as needed).
- Phase 2: exhaustive test review (changed tests + suite drift/gap checks).
- Phase 3: commit prep output with common commit-style message options.

The process is intentionally long-form and phase-gated: after each phase, present findings, pause for fixes/discussion, and only proceed when the user asks.
Canonical phase headings in output are `Phase 1 Findings (Source Review)` and `Phase 2 Findings (Test Review)`.

The skill enforces strict numbered output, one item per line, with severity and file references where applicable.
It prepares commit messages but does not execute `git commit`.

Install (Codex):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill precommit-review -a codex -y
```

Install (Claude Code):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill precommit-review -a claude-code -y
```
