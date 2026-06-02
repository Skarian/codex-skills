---
name: continuity
description: Use for durable handoff on nontrivial project work. Read at the start of a session, and update after meaningful decisions, constraints, project changes, validation results, blockers, or next steps change.
---

# Continuity Ledger

Use this skill for repo-local continuity files. Continuity is a recovery artifact, not a transcript and not a per-turn ritual.

## Purpose

`.agent/CONTINUITY.md` is the short briefing future sessions need to resume safely without relying on chat history.

Use it for durable facts:

- Current goal and success criteria.
- Current state: done, now, next.
- Open questions.
- User decisions and constraints.
- Important tool outcomes or verification receipts.
- Bounded working set.

Do not use it for raw transcripts, speculative notes, or every minor action.

## When To Read

Read `.agent/CONTINUITY.md` when:

- Starting work in a repo that uses it.
- Resuming after compaction or context loss.
- Resuming paused work.
- The user references prior decisions, state, or working set.

Do not reread it every turn unless there is a specific reason.

## When To Update

Update only after a meaningful durable delta in:

- Goal or success criteria.
- Constraints or invariants.
- Decisions.
- State: done, now, next.
- Open questions.
- Working set.
- Important tool outcomes or verification results.

If the repo lacks `.agent/CONTINUITY.md` and the user wants continuity, create it from `templates/CONTINUITY.md`.

## Format Rules

- Facts only. No transcripts.
- Every entry includes a date or timestamp.
- Every entry includes a provenance tag:
  - `[USER]`
  - `[CODE]`
  - `[TOOL]`
  - `[ASSUMPTION]`
- If unknown, write `UNCONFIRMED`.
- Supersede changed facts explicitly instead of silently rewriting history.

## Size Limits

Keep the ledger short and high-signal:

- Keep `Snapshot` concise.
- Keep `Done (recent)` bounded.
- Keep `Working set` bounded.
- Keep `Receipts` focused on recent durable outcomes.

If a section grows too large, compress older items into milestone bullets with pointers.

## Replies

Use a brief ledger snapshot only when useful. Print the full ledger only when the user asks or after meaningful changes where seeing the full file is useful.
