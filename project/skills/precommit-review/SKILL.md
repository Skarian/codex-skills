---
name: precommit-review
description: Use when the user requests a phased pre-commit review of the worktree.
---

# Pre-Commit Review

Trigger: use when the user asks for a commit-readiness review in phases (source, tests, commit-message prep).

Run phases sequentially. Do not auto-advance from one phase to the next.
After each phase:

- Present findings.
- Pause for user-directed fixes/discussion.
- Continue to the next phase only when the user asks to proceed.

## Phase 1: Source Review

- Review source changes in the current worktree exhaustively.
- Read full files for changed files and tangentially related files as needed to validate behavior.
- Focus on bugs, regressions, race conditions, broken UX, contract breaks, and risky side effects.
- Use concrete evidence from code paths and call sites, not speculation.

## Phase 2: Test Review

- Review changed tests in the worktree exhaustively.
- Review the broader existing test suite for drift against current behavior.
- Identify stale tests worth removing, missing coverage worth adding, and mismatches between tests and intended behavior.
- Call out whether test gaps are commit-blocking or safe to defer.

## Phase 3: Commit-Prep Output

- Produce commit message options in common commit style based on shipped behavior/features.
- Do not mention planning artifacts (`.agents/*`, ExecPlans, continuity files) in commit text.
- Do not execute `git commit`; provide message options and let the user run the commit.

## Required Output Format

Use the following section order and keep numbering stable inside each section:

1. `Phase 1 Findings (Source Review)`
2. `Phase 2 Findings (Test Review)`
3. `Must-fix before commit`
4. `Safe to defer`
5. `Commit message options`

Formatting rules:

- Every finding/proposal is a numbered item on its own line.
- Never combine multiple findings into one numbered line.
- Prefix each finding with severity: `[critical]`, `[high]`, `[medium]`, or `[low]`.
- Include a file reference for each code/test finding when applicable.
- If a section has no items, write exactly `1. none`.

Commit message option rules:

- Provide 2-4 options.
- Use `type(scope): summary` style.
- Keep each option to one line.
- Never execute `git commit` as part of this skill.
