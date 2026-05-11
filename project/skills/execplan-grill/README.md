# execplan-grill

Project-level skill for the intake step before writing an ExecPlan.

This adapts Matt Pocock's [`grill-with-docs`](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) workflow for this repo's ExecPlan process.

Behavior:

- Runs before drafting a new ExecPlan or substantially re-scoping an existing one.
- First resolves the required ExecPlan type: `draft`, `active`, or `archive`.
- Interviews one blocking question at a time.
- Inspects code/docs instead of asking when the answer is discoverable.
- Challenges fuzzy terminology, hidden assumptions, scope leaks, and contradictions with repo state.
- Bakes resolved decisions into the ExecPlan.
- Uses `.agent/CONTINUITY.md` for durable cross-session state when appropriate.
- Updates project documentation only when requested or required by the repo workflow.

Install (Codex):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill execplan-grill -a codex -y
```

Install (Claude Code):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill execplan-grill -a claude-code -y
```
