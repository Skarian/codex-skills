# execplan-review

This skill forces a deep, end-to-end review before implementation:

- Read the ExecPlan fully (no greps).
- Read all referenced and likely-impacted source files.
- Produce a confidence rating (0-100%).
- If `<95%`, propose concrete fixes or recommend rejecting the ExecPlan.

Install (Codex):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill execplan-review -a codex -y
```

Install (Claude Code):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill execplan-review -a claude-code -y
```
