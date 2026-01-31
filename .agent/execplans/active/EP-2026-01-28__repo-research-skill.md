# Repo Research Skill (Light + Heavy, gh-based)

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

This plan must be maintained in accordance with `.agent/PLANS.md` from the repository root.

- Plan ID: EP-2026-01-28__repo-research-skill
- Status: DRAFT
- Created: 2026-01-28
- Last Updated: 2026-01-28
- Owner: UNCONFIRMED

## Purpose / Big Picture

After this change, the agent can research any public GitHub repository using a two-mode workflow that stays token efficient. Light mode uses the GitHub CLI to retrieve a filtered tree and then fetches only selected entrypoint files via raw URLs, answering questions without full checkout. Heavy mode clones the repo into a temporary directory and uses ripgrep for deep search when light mode is insufficient. Success is observable when a user supplies a public repo URL and the agent can provide an accurate, file-backed explanation with minimal tokens, escalating to heavy mode only when needed.

## Progress

- [ ] (2026-01-28) Confirm skill location, default output format, and gh authentication expectations.
- [ ] Create the skill directory and write `SKILL.md` with light/heavy workflows and safety constraints.
- [ ] Add scripts for: tree fetch + filter (gh), entrypoint detection, raw file fetch, heavy clone + rg search.
- [ ] Add a reference file that captures rate-limit and tree truncation constraints and mode-switch rules.
- [ ] Update `README.md` to mention the new skill and its two modes.
- [ ] Validate both modes against a public repo and capture minimal proof output.

## Surprises & Discoveries

None yet.

## Decision Log

- Decision: Use two explicit modes (light and heavy) and auto-escalate to heavy mode when light mode cannot reliably answer the question.
  Rationale: Keeps token usage low while preserving a reliable fallback for complex repos.
  Date/Author: 2026-01-28 / UNCONFIRMED

- Decision: Use GitHub CLI as the primary mechanism for tree and metadata retrieval.
  Rationale: Simplifies access to GitHub APIs while keeping scripts small and portable.
  Date/Author: 2026-01-28 / UNCONFIRMED

- Decision: Heavy mode uses a shallow full clone (`--depth 1`) into a temporary directory by default.
  Rationale: Ensures search completeness while limiting bandwidth and disk usage.
  Date/Author: 2026-01-28 / UNCONFIRMED

## Outcomes & Retrospective

Not started.

## Context and Orientation

This repository currently contains agent configuration and helper scripts but no skill directory. The new skill will live under a repo-local `skills/` directory. The skill is read-only with respect to target repositories and must not execute code from them. Temporary data must be created under the repo root in a dedicated, git-ignored directory (for example `.repo-research-tmp/`) and removed by default.

Definitions used in this plan:

Light mode means a minimal, token-efficient workflow that fetches a filtered tree and only a handful of entrypoint files via raw URLs.

Heavy mode means a local, shallow clone into a temporary directory and full-text search via ripgrep.

Entrypoints are files likely to explain structure or behavior, such as README, package manifests, build files, main entry files, CLI entrypoints, and configuration files.

Constraints:

GitHub tree responses can be truncated for large repos, and API rate limits can be triggered by excessive calls. Raw URLs require exact file paths. The GitHub CLI must be installed and usable; if the CLI is not available, the skill should stop and request installation rather than falling back silently.

## Plan of Work

First, establish the skill directory and author `SKILL.md` to define the two-mode workflow, prerequisites, and safety rules. Light mode should explicitly describe how to resolve the default branch, retrieve a tree via the GitHub CLI, filter entrypoints, and fetch raw files for analysis. It should also define the escalation conditions to heavy mode, such as truncated trees, missing entrypoints, or questions that require cross-repo symbol analysis.

Second, add scripts that keep the workflow reproducible and token efficient. The tree fetch script should call `gh api` for the tree and filter at the source to avoid large output. The entrypoint filter should be a regex-driven pass that produces a short list for further inspection. The raw fetch script should download a single file using a raw URL and store it in a repo-local temp directory. The heavy mode script should shallow-clone into a repo-local temp directory and run ripgrep searches, then clean up.

Third, add a short reference file documenting mode selection, tree truncation signals, and rate-limit precautions so the agent knows when to reduce API calls or escalate to heavy mode.

Finally, update the README to mention the skill and validate both modes against a public repo, capturing minimal evidence and expected outcomes.

## Concrete Steps

1) Create skill directories.

   Working directory: repository root.

   Commands:

     mkdir -p skills/repo-research/scripts
     mkdir -p skills/repo-research/references

2) Write `skills/repo-research/SKILL.md` to include:

   - Trigger phrases for any GitHub repo research.
   - Light mode flow:
     - Resolve repo URL and default branch via `gh api repos/{owner}/{repo}`.
     - Fetch tree with `gh api repos/{owner}/{repo}/git/trees/{sha}?recursive=1` and filter to entrypoints.
     - Fetch selected files via raw URLs and answer questions using file paths.
     - Escalate to heavy mode when the tree is truncated or entrypoint coverage is insufficient.
   - Heavy mode flow:
     - Shallow clone into a repo-local temp directory.
     - Run `rg` for symbols or keywords.
     - Read files locally and clean up by default.
   - Safety rules: read-only, no code execution, temp storage only.
   - Output format: concise repo summary, entrypoint list, and file-backed answers.

3) Add scripts under `skills/repo-research/scripts`:

   - `tree_light.sh`: uses `gh api` to fetch default branch and a filtered tree list, outputting only likely entrypoints.
   - `entrypoints.sh`: regex-based filter for entrypoints when a raw tree list is provided.
   - `fetch_raw.sh`: downloads a specific file from raw.githubusercontent.com into a repo-local temp dir and prints its path.
   - `heavy_clone_search.sh`: shallow clone into a repo-local temp dir, run `rg`, print results, and clean up.

4) Add `skills/repo-research/references/limits.md` with:

   - Tree truncation signals and escalation rules.
   - Rate-limit precautions for `gh api`.
   - Guidance on keeping light-mode outputs small.

5) Update `.gitignore` to exclude the repo-local temp directory (for example, add `.repo-research-tmp/`).

6) Update `README.md` with a new section describing the repo research skill, its two modes, the repo-local temp directory, and prerequisites (`gh`, `git`, `rg`).

7) Validate the workflows.

   Light mode validation:

     - Provide a known public repo URL.
     - Run `tree_light.sh` to produce a short entrypoint list.
     - Fetch 1 to 3 files with `fetch_raw.sh`.
     - Produce a short summary referencing those files.

   Heavy mode validation:

     - Run `heavy_clone_search.sh` with a keyword from the repo.
     - Confirm results include file paths and content snippets.
     - Confirm the repo-local temp directory is removed by default (unless a keep flag is set).

Expected verification:

Light mode produces a concise entrypoint list and answers a focused question with file-backed evidence. Heavy mode yields ripgrep hits and leaves no repo-local temp artifacts unless explicitly configured to keep them.
