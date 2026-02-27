# CONTINUITY

Facts only. No transcripts. If unknown, write UNCONFIRMED.
Add dated entries with provenance tags per AGENTS.md: [USER], [CODE], [TOOL], [ASSUMPTION].

## Snapshot

Goal: 2026-02-27 [USER] Fully migrate this repo to a Vercel `skills` CLI workflow with simpler structure, remove template skill content, and document Codex + Claude install commands and install paths.
Now: 2026-02-27 [CODE] Repo migrated from `skills/.curated` scaffolding to flat `skills/<skill-name>`; docs now use `npx skills add` commands and install-location tables.
Next: 2026-02-27 [ASSUMPTION] Await user review and any follow-up skill additions under the new flat layout.
Open Questions: 2026-02-27 [USER] None.

## Done (recent)

- 2026-02-27 [CODE] Flattened skill layout to `skills/url-to-markdown` and removed `.curated`, `.experimental`, and `.example` directories (including template skill artifacts).
- 2026-02-27 [CODE] Rewrote root `README.md` for Vercel workflow with skill inventory table and Codex/Claude install commands.
- 2026-02-27 [CODE] Added explicit install-location documentation for project and global installs (`.agents`, `.claude`, and home directories).
- 2026-02-27 [CODE] Updated `url-to-markdown` docs (`SKILL.md`, `README.md`, `advanced.md`) to use installed-path commands for Codex and Claude scopes.
- 2026-02-27 [CODE] Updated `.gitignore` to ignore project-local installed skill directories (`.agents/skills`, `.claude/skills`).
- 2026-02-01 [USER] Confirmed `url_to_markdown_selftest.sh` and `url_to_markdown_scrape.sh` succeed after readiness + RabbitMQ changes.
- 2026-01-31 [CODE] Implemented and documented the `url-to-markdown` skill with stdout-only output and shared state.

## Working set

- .gitignore
- README.md
- skills/README.md
- skills/url-to-markdown/SKILL.md
- skills/url-to-markdown/README.md
- skills/url-to-markdown/advanced.md
- skills/url-to-markdown/scripts/url_to_markdown_scrape.sh
- skills/url-to-markdown/scripts/url_to_markdown_selftest.sh
- skills/url-to-markdown/scripts/url_to_markdown_up.sh
- .agent/execplans/INDEX.md
- .agent/execplans/archive/EP-2026-02-27__vercel-skills-migration.md

## Decisions

- 2026-01-28 [USER] D001 SUPERSEDED: Mirror OpenAI skills structure (`skills/.curated`, `skills/.experimental`) with repo-level `--dest .codex/skills` guidance.
- 2026-02-27 [USER] D018 ACTIVE: Adopt flat `skills/<name>` repository layout and Vercel `npx skills` install workflow as the default documentation path.
- 2026-01-31 [USER] D003 ACTIVE: Keep Firecrawl runtime state/output under `.codex/.firecrawl` (not `.agent`).
- 2026-01-31 [USER] D004 ACTIVE: Ignore `.codex/.firecrawl` in git and set non-empty defaults for optional Firecrawl service vars.
- 2026-01-31 [USER] D005 ACTIVE: Keep startup retry logic for ECONNRESET handling and idle-shutdown progress output.
- 2026-01-31 [USER] D006 ACTIVE: Keep scrape stdout reserved for markdown output path behavior and send non-result output to stderr.
- 2026-01-31 [USER] D007 ACTIVE: Keep `USE_DB_AUTHENTICATION=false` and `DISABLE_BLOCKLIST=true` defaults with env overrides.
- 2026-01-31 [USER] D008 ACTIVE: Keep `firecrawl_up.sh` stdout redirected to stderr.
- 2026-01-31 [USER] D009 ACTIVE: Keep self-test idle default at 5 minutes for faster validation.
- 2026-01-31 [USER] D010 ACTIVE: Keep CLI flag ordering aligned with docs and self-test grace period behavior.
- 2026-01-31 [USER] D011 ACTIVE: Keep stdout-only markdown output and immediate container stop in self-test.
- 2026-01-31 [USER] D012 ACTIVE: Keep transient retry-error suppression unless scrape fails.
- 2026-01-31 [USER] D013 ACTIVE: Keep public images/no local checkout and 5-minute idle shutdown default.
- 2026-01-31 [USER] D014 ACTIVE: Keep shared state at `CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/...`).
- 2026-01-31 [USER] D015 ACTIVE: Keep single shared `.env` config across installs.
- 2026-01-31 [USER] D016 ACTIVE: Keep shared lock for compose and `last_used` updates.
- 2026-01-31 [USER] D017 ACTIVE: If `CODEX_HOME` is unset and `HOME` unavailable, scripts hard-fail.

## Receipts

- 2026-02-27 [TOOL] Verified current repository layout and files with `find` and `sed` before migration.
- 2026-02-27 [TOOL] Confirmed Vercel CLI support for `skills/.curated` and `skills/` plus Codex/Claude install locations from `vercel-labs/skills` README (`Skill Discovery`, `Installation Locations`).
- 2026-02-27 [TOOL] Created ExecPlan `EP-2026-02-27__vercel-skills-migration` and added it to `.agent/execplans/INDEX.md`.
- 2026-02-27 [TOOL] Applied structural migration: moved `skills/.curated/url-to-markdown` to `skills/url-to-markdown`; removed `.curated`, `.experimental`, `.example`, and `skills/.DS_Store`.
- 2026-02-27 [TOOL] Rewrote root and skill docs to Vercel commands and `.agents/.claude` installed-path usage.
- 2026-02-27 [TOOL] Updated `.gitignore` for `.agents/skills/` and `.claude/skills/`.
- 2026-02-27 [TOOL] Validation: `bash -n` passed for all `url-to-markdown` scripts after path migration.
- 2026-02-27 [TOOL] Validation: `rg` found no remaining `.curated/.experimental/.example` or `$skill-installer` references in `README.md` and `skills/`.
- 2026-02-27 [TOOL] Archived `EP-2026-02-27__vercel-skills-migration` and updated `.agent/execplans/INDEX.md`.
- 2026-02-27 [USER] Confirmed deletion of `.state/notify.log` and `.state/notify_last_payload.json` is intentional.
- 2026-02-01 [USER] `url_to_markdown_selftest.sh` output shows Example Domain markdown and containers stop cleanly.
- 2026-02-01 [USER] `url_to_markdown_scrape.sh https://example.com` returns Example Domain markdown.
