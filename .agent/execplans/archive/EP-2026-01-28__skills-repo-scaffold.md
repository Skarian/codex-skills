# Skills Repo Scaffold for Codex Skill-Installer Use

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan must be maintained in accordance with `.agent/PLANS.md` from the repository root.

- Plan ID: EP-2026-01-28__skills-repo-scaffold
- Status: ARCHIVED
- Created: 2026-01-28
- Last Updated: 2026-01-28
- Owner: UNCONFIRMED

## Purpose / Big Picture

After this change, this repository becomes the primary source of custom Codex skills, structured so that users can install skills into any repository at the repo level only. A README at the root explains what the repository is for, how skills are organized, and provides quick-start commands that use `skill-installer` with a repo-level destination (`.codex/skills`). The structure mirrors the OpenAI skills layout so that users recognize where curated and experimental skills live. A user can verify success by reading the README and by installing a skill into a target repo with `skill-installer --dest .codex/skills`, then seeing the skill folder appear under that repo’s `.codex/skills`.

## Progress

- [x] (2026-01-28 07:04Z) Inspect current repository layout and confirm whether `README.md` already exists.
- [x] (2026-01-28 07:04Z) Create `skills/.curated/`, `skills/.experimental/`, and `skills/.example/` with placeholder files and a template skill scaffold.
- [x] (2026-01-28 07:04Z) Write `README.md` with overview, repository layout, and repo-level quick start commands for `skill-installer`.
- [x] (2026-01-28 07:04Z) Validate the structure via `ls`/`rg` checks and document the optional end-to-end install test.

## Surprises & Discoveries

- Observation: The repository had no README prior to scaffolding.
  Evidence: `rg --files -g 'README.md'` returned no matches.

## Decision Log

- Decision: Mirror the OpenAI skills repo structure with `skills/.curated/` and `skills/.experimental/`.
  Rationale: This matches the documented default layout and makes the repository familiar to users.
  Date/Author: 2026-01-28 / [USER]
- Decision: Provide repo-level installation only and document `--dest .codex/skills` as the required destination.
  Rationale: The goal is for skills to live alongside a repo, not in the user-level Codex home.
  Date/Author: 2026-01-28 / [USER]
- Decision: Defer automation scripts (e.g., shell installers); scope is scaffolding and README only.
  Rationale: Keep the initial setup minimal and avoid committing to tooling that may change.
  Date/Author: 2026-01-28 / [USER]
- Decision: Add an example skill template under `skills/.example/` with stub folders.
  Rationale: Provide a reusable scaffold that does not appear as a curated or experimental skill.
  Date/Author: 2026-01-28 / [USER]

## Outcomes & Retrospective

The repository now has the required OpenAI-style structure, a template skill scaffold, and a root README with repo-level install instructions. The optional end-to-end installation test was not run because it requires a separate target repo and network access.

## Context and Orientation

This repository is intended to be the primary store of custom Codex skills. A Codex skill is a folder that must contain `SKILL.md` and may contain `scripts/`, `references/`, and `assets/`. Codex discovers skills from multiple locations. The repo-level location is `.codex/skills` inside the target repository where you want skills available; user-level skills live under `$CODEX_HOME/skills`. `skill-installer` is a Codex skill that installs skills from GitHub. It installs into `$CODEX_HOME/skills` by default, but supports `--dest <path>` to override the destination. To enforce repo-level installs only, the README must always show `--dest .codex/skills` and avoid user-level install commands.

The desired structure mirrors OpenAI’s skills repository with two main subdirectories under `skills/`:

`skills/.curated/` holds stable skills intended for regular use.
`skills/.experimental/` holds skills that are still in flux.
`skills/.example/` holds a reusable template skill that is not meant to be installed directly.

This plan will create those directories and add placeholder files so the directories are tracked even before skills are added. The root `README.md` will be the user-facing entry point for installation and discovery.

## Plan of Work

First, check the current repository root to see whether a `README.md` already exists and whether any `skills/` directories are present. If a README exists, update it rather than replacing it; if it does not exist, create a new `README.md` at the root.

Create the directories `skills/.curated/`, `skills/.experimental/`, and `skills/.example/` and place short `README.md` files inside each that explain the purpose of the folder and the expectation that each skill is a subfolder containing `SKILL.md`. Under `skills/.example/`, create a template skill folder that includes a minimal `SKILL.md` and stub `scripts/`, `references/`, and `assets/` directories. Do not add `.system/` unless there is a specific need to ship preinstalled system skills; the scope here is curated, experimental, and example only.

Write or update the root `README.md` to include: a high-level overview describing this repository as the primary home for custom Codex skills; a layout section describing `skills/.curated/` and `skills/.experimental/`; and a Quick Start section that shows how to install a skill from this repo into another repository at the repo level using `skill-installer --dest .codex/skills`. Include a reminder to restart Codex after installation. Keep the instructions clear that repo-level installation is required and that user-level installs are out of scope.

## Concrete Steps

From the repository root, inspect existing files so you can update rather than overwrite.

    pwd
    ls -la
    rg --files -g 'README.md'

Create the directory structure and placeholder README files if they do not already exist.

    mkdir -p skills/.curated skills/.experimental skills/.example

Then create or edit:

    skills/.curated/README.md
    skills/.experimental/README.md
    skills/.example/README.md
    skills/.example/template-skill/SKILL.md
    skills/.example/template-skill/scripts/
    skills/.example/template-skill/references/
    skills/.example/template-skill/assets/
    README.md

Include the following minimal content in the two placeholder READMEs (edit wording as needed to match existing style):

    # Curated Skills
    This folder contains stable skills intended for regular use. Each skill lives in its own subfolder and must include SKILL.md.

    # Experimental Skills
    This folder contains skills that are still evolving. Each skill lives in its own subfolder and must include SKILL.md.

    # Example Skills
    This folder contains templates to copy when creating new skills. Do not install these directly.

In the root README, include a Quick Start section with a repo-level install command. The command should be shown as a template, not a literal skill name, because skills may be added later. Example template to include:

    $skill-installer --repo <owner>/<repo> --path skills/.curated/<skill-name> --dest .codex/skills

If you prefer to show a GitHub URL form, use:

    $skill-installer --url https://github.com/<owner>/<repo>/tree/<ref>/skills/.curated/<skill-name> --dest .codex/skills

## Validation and Acceptance

Run a directory listing and ensure the expected folders and README files exist:

    ls -la skills
    ls -la skills/.curated
    ls -la skills/.experimental
    ls -la skills/.example
    ls -la skills/.example/template-skill

Verify the root `README.md` includes the repo-level install command with `--dest .codex/skills` and explicitly states that repo-level installation is required.

Optional end-to-end validation (requires network and a target repo):

1. In a separate target repo, run the Quick Start command from the README.
2. Confirm that the skill directory appears under the target repo’s `.codex/skills/`.
3. Restart Codex and confirm the skill appears in available skills.

Acceptance is met when a reader can follow the README to install skills into a target repo at `.codex/skills`, and the repository clearly explains the curated vs experimental structure.

## Idempotence and Recovery

Creating directories and README files is safe to repeat. If files already exist, update them in place; do not delete or rename skill folders that might already be present. If a mistake is made in the README content, edit the file and re-run the validation checks.

## Artifacts and Notes

Expected directory structure after completion (example):

    skills/
    ├── .curated/
    │   └── README.md
    └── .experimental/
        └── README.md
    └── .example/
        ├── README.md
        └── template-skill/
            ├── SKILL.md
            ├── scripts/
            ├── references/
            └── assets/

Root README Quick Start snippet example:

    Quick Start (repo-level install)
    $skill-installer --repo <owner>/<repo> --path skills/.curated/<skill-name> --dest .codex/skills
    Restart Codex to pick up new skills.

## Interfaces and Dependencies

No new runtime dependencies are required. The only external interface is the Codex `skill-installer` skill, which is used by readers to install skills from this repository. The README must show repo-level installation using `--dest .codex/skills`, and should not document user-level installs to `$CODEX_HOME/skills`.

## Plan Revision Notes (bottom-of-file change notes)

- (2026-01-28) Added an example skill template under `skills/.example/` with stub folders to support easy scaffolding without appearing as a curated or experimental skill.
- (2026-01-28) Marked plan as DONE after completing scaffolding and README updates.
