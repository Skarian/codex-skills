# ExecPlan Index

This file tracks all ExecPlans for this repository. It is required by `.agent/PLANS.md`.

## Conventions

- Active plans live in: `.agent/execplans/active/`
- Archived plans live in: `.agent/execplans/archive/`
- Plan filename format: `EP-YYYY-MM-DD__slug.md`
- Plan header fields live inside each plan file and must match the index entry.

## Index entry format (use this consistently)

For each plan, add a single bullet in the appropriate section:

- `EP-YYYY-MM-DD__slug` — `<Title>` — `Status:<DRAFT|ACTIVE|BLOCKED|DONE|ARCHIVED>` — `Created:YYYY-MM-DD` — `Updated:YYYY-MM-DD` — `Path:<repo-relative path>` — `Owner:<UNCONFIRMED|name>` — `Summary:<one line>` — `Links:<optional>`

For archived plans, also include:

- `Archived:YYYY-MM-DD` — `Outcome:<one line>`

Keep entries short, greppable, and consistent.

## Active ExecPlans

- (none yet)

## Archived ExecPlans

- EP-2026-01-28__skills-repo-scaffold — Skills Repo Scaffold for Codex Skill-Installer Use — Status:ARCHIVED — Created:2026-01-28 — Updated:2026-01-28 — Path:.agent/execplans/archive/EP-2026-01-28__skills-repo-scaffold.md — Owner:UNCONFIRMED — Summary:Scaffold repo structure and README for repo-level skill-installer usage — Links: — Archived:2026-01-28 — Outcome:Created curated/experimental/example structure and repo-level README
