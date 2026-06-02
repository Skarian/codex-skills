---
name: execplan
description: Use when the user wants to create, revise, execute, review, or archive an ExecPlan.
---

# ExecPlan Workflow

Use this skill for any request involving an ExecPlan: drafting one, reshaping one, executing one, reviewing one, or archiving one.

## First Step

Classify the request into one mode and read that mode file first. Then read any referenced files the mode names:

- `create`: create a new ExecPlan or substantially re-scope an existing one. Read `modes/create.md`.
- `execute`: implement an existing ExecPlan. Read `modes/execute.md`.
- `review`: review an ExecPlan for executability, risks, and missing code contracts. Read `modes/review.md`.
- `archive`: move a completed, cancelled, or superseded ExecPlan into history. Read `modes/archive.md`.

If the user wants to create, move, or index a plan and has not specified the ExecPlan type, ask exactly:

`What type is this ExecPlan: draft, active, or archive?`

Wait for the answer before creating, moving, or indexing a plan file.

## Repo Artifacts

ExecPlans are repo artifacts by default:

- Draft plans: `.agent/execplans/draft/`
- Active plans: `.agent/execplans/active/`
- Archived plans: `.agent/execplans/archive/`
- Required index: `.agent/execplans/INDEX.md`

If these paths do not exist and the user asked for durable ExecPlan work, create them from the templates in this skill. If the repo defines an explicit override in `AGENTS.md`, follow the repo override.

Use `references/rules.md` for the rules of a valid ExecPlan. Use `templates/execplan.md` as the starting skeleton for a new plan file and `templates/index.md` as the starting skeleton for a new index.
