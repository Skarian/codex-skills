# Execute Mode

Use this mode when implementing an existing ExecPlan.

## Before Editing

Read the full ExecPlan, not excerpts.

Then inspect:

- `AGENTS.md` and relevant repo instructions.
- `.agent/execplans/INDEX.md` for other active plans and coupling.
- Files named by the plan.
- Immediate dependents of any changed contracts, interfaces, or data boundaries.

If the plan leaves a material ambiguity or tradeoff unresolved, pause and present the issue clearly. Incorporate the agreed decision into the plan before continuing.

## Execution

Proceed milestone by milestone. Do not prompt for generic next steps.

Keep the ExecPlan current as work proceeds:

- Update `Progress` at every stopping point.
- Add discoveries to `Surprises & Discoveries` with concise evidence.
- Add material decisions to `Decision Log` with rationale.
- Update `Last Updated` whenever the plan changes meaningfully.

Commit only when the user or repo instructions explicitly authorize commits. Otherwise leave reviewable diffs.

## Completion

Run the plan's validation commands. If validation cannot be run, state exactly why and provide commands the user can run.

At completion:

- Update `Outcomes & Retrospective`.
- Keep the index entry aligned with the plan header and file location. If `Status`, `Last Updated`, or `Path:` changed, update the matching `Status:`, `Updated:`, and `Path:` fields in `.agent/execplans/INDEX.md`.
