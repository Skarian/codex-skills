# ExecPlan Rules

An ExecPlan is a checked-in design and execution document that a coding agent can follow to deliver a working feature or system change. Treat the reader as a complete beginner to the repository. They have only the current working tree and the single ExecPlan file.

## Storage

By default, store ExecPlans under `.agent/execplans/`:

- Draft plans: `.agent/execplans/draft/`
- Active plans: `.agent/execplans/active/`
- Archived plans: `.agent/execplans/archive/`
- Required index: `.agent/execplans/INDEX.md`

If the repo's `AGENTS.md` defines an override directory, follow that override.

If required directories or the index are missing, create them inside the repository. Do not create ExecPlan artifacts outside the repo.

Every ExecPlan is one markdown file named:

`EP-YYYY-MM-DD__<slug>.md`

Use the creation date. Keep the slug short, kebab-case, and stable.

Avoid `v2` and `v3` plan sprawl. If the direction truly forks, append `__v2` to the slug and record the reason in the `Decision Log`.

## Plan Type And Status

Every ExecPlan has a storage type and a lifecycle status. The storage type controls which directory and index section contains the plan. The lifecycle status is the `Status:` field in the plan header and index entry.

The storage type must be one of:

- `draft`: research projects, future execution plans, or parked work that is not approved for execution.
- `active`: work currently being executed or about to be executed.
- `archive`: historical record of completed, cancelled, or superseded plans.

If the user's request does not specify a type, ask: `What type is this ExecPlan: draft, active, or archive?`

Type transitions are intentionally non-linear. Common transitions include `draft -> active`, `active -> draft`, `draft -> archive`, and `active -> archive`.

When a plan type changes, move the file to the matching directory, update the plan header `Status` to match the new lifecycle state, update `Last Updated`, move the index entry to the matching section, update `Path:`, and remove stale duplicate entries. Active plans may use `ACTIVE` or `BLOCKED`; completed plans may briefly use `DONE` before archival; archived plans use `ARCHIVED`.

## Index Maintenance

The index is required. If `.agent/execplans/INDEX.md` is missing, initialize it from `templates/index.md`.

When creating a plan in `draft/`, add an entry under `Draft ExecPlans`. When creating a plan in `active/`, add an entry under `Active ExecPlans`. Remove the matching `- (none yet)` placeholder when adding the first real entry to a section.

When creating or moving a plan into `archive/`, place its entry under `Archived ExecPlans` and include `Archived:YYYY-MM-DD` plus a one-line outcome.

Keep index entries consistent with plan headers:

- `Status:` matches the plan header status.
- `Updated:` matches the plan header `Last Updated`.
- `Path:` points to the current repo-relative plan file path.
- Each Plan ID appears in exactly one index section.

## Header

Each plan starts with:

- Plan ID: EP-YYYY-MM-DD__slug
- Status: DRAFT | ACTIVE | BLOCKED | DONE | ARCHIVED
- Created: YYYY-MM-DD
- Last Updated: YYYY-MM-DD
- Owner: UNCONFIRMED | <name/role>

Update `Last Updated` whenever the plan changes meaningfully.

## Non-Negotiables

- The plan must be self-contained.
- The plan must define every term of art in plain language.
- The plan must produce demonstrably working behavior, not only code changes.
- The plan must include exact validation commands and expected observations.
- The plan must be revised as progress, discoveries, and decisions occur.
- The plan must repeat every assumption it relies on.
- If the plan builds on a prior plan, reference that prior plan only when it is checked into the repo; otherwise include the relevant context directly.
- External references are allowed, but the plan must embed the actionable context needed to execute safely without relying on chat history.

Purpose and intent come first. Begin by explaining why the work matters from a user's perspective, what someone can do after the change, and how to see it working.

## Required Sections

Use these sections:

- `Purpose / Big Picture`
- `Progress`
- `Surprises & Discoveries`
- `Decision Log`
- `Outcomes & Retrospective`
- `Context and Orientation`
- `Milestones`
- `Plan of Work`
- `Concrete Steps`
- `Validation and Acceptance`
- `Idempotence and Recovery`
- `Artifacts and Notes`
- `Interfaces and Dependencies`
- `Plan Revision Notes`

`Progress` must use checkboxes, include timestamps, and reflect actual current state. If work is partially complete, split the entry into done and remaining pieces. `Milestones` must describe independently verifiable chunks of work in prose. Progress and milestones are distinct: progress tracks granular state, while milestones tell the implementation story. `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` are living sections and must not be omitted.

## Formatting

When presenting an ExecPlan in chat, use one fenced `md` block containing the whole plan. Do not put fenced blocks inside that plan; use indented blocks for commands, transcripts, diffs, and code examples.

When writing an ExecPlan to a markdown file where the file content is only the plan, omit the outer fence.

Use two blank lines after every heading. Narrative sections should be prose-first. Checklists are allowed only in `Progress`.

## Authoring Guidance

Write in plain prose. Prefer sentences over long enumerations. Avoid jargon unless you define it immediately and tie it to concrete files or commands.

Be specific:

- Name repository-relative paths.
- Name functions, modules, commands, and data boundaries precisely.
- Explain how touched files fit together.
- Resolve ambiguity inside the plan instead of leaving decisions to the implementer.

Validation is required. Phrase acceptance as behavior a human can verify, such as a command output, passing test, rendered UI state, HTTP response, or file system result.

Include tests, startup or exercise instructions when applicable, expected outputs or error messages, and proof beyond compilation. If tests should change, state which test fails before the work and passes after.

State exact commands with the working directory. When outcomes depend on environment, state the assumptions and provide alternatives when reasonable.

Idempotence and recovery are required. Explain which steps are repeatable, how to retry or recover from halfway failure, and what fallback or backup protects risky operations.

Capture evidence in `Artifacts and Notes`. Use concise terminal output, logs, diffs, or file-scoped patch excerpts that prove success.

## Milestones

Milestones are narrative, not bureaucracy. Each milestone should describe the scope, what will exist at the end that did not exist before, the commands to run, and the acceptance to observe.

Each milestone must be independently verifiable and incrementally implement the overall goal of the execution plan.

Use proof-of-concept or prototyping milestones when requirements are challenging or feasibility is uncertain. Keep prototypes additive and testable, label them clearly, and state criteria for promoting or discarding them.

Parallel implementations are acceptable when they reduce risk. Describe how to validate both paths and how to retire one safely while keeping tests passing.

## Execution Guidance

When implementing an ExecPlan:

- Read the whole plan first.
- Proceed milestone by milestone.
- Keep `Progress` updated at stopping points.
- Record surprises and decisions as they occur.
- Pause only for unresolved ambiguity, risky/destructive action, or a blocked dependency not resolved by the plan.
- At completion, update `Outcomes & Retrospective` with what shipped, what did not, and the validation evidence.
- Keep the index entry aligned whenever `Status`, `Last Updated`, or `Path:` changes.

## Archival

Never delete ExecPlans. When completed, cancelled, or superseded:

1. Update the plan to reflect reality.
2. If completed, set `Status: DONE`.
3. Move it into `.agent/execplans/archive/`.
4. Set `Status: ARCHIVED`.
5. Move the index entry to `Archived ExecPlans` and add archive date plus outcome.

## Interfaces and Dependencies

Be prescriptive. Name libraries, modules, services, commands, data shapes, types, traits, interfaces, and function signatures that must exist at the end of the work. Explain why each non-obvious dependency is needed.

## Plan Revision Notes

When revising a plan, append a dated note at the bottom describing what changed and why. Ensure the change is reflected across the living sections, not only in the new note.
