# CONTINUITY

Facts only. No transcripts. If unknown, write UNCONFIRMED.
Add dated entries with provenance tags per AGENTS.md: [USER], [CODE], [TOOL], [ASSUMPTION].

## Snapshot

Goal: 2026-01-31 [USER] Provide a generic url-to-markdown curated skill that prints markdown to stdout with minimal SKILL.md.
Now: 2026-01-31 [CODE] Increased startup retry defaults to 120s with 10s intervals; updated advanced docs.
Next: 2026-01-31 [ASSUMPTION] Re-test cold-start scrape to confirm new retry cadence.
Open Questions: 2026-01-31 [USER] None.

## Done (recent)

- 2026-01-31 [CODE] Increased default startup retry window to 120 seconds and retry interval to 10 seconds.
- 2026-01-31 [CODE] Added empty-output retry logic (3 attempts, 10s wait) to the scrape script and documented it.
- 2026-01-31 [CODE] Updated url-to-markdown scripts to invoke via bash and treat missing/invalid lock timestamps as stale; refreshed docs.
- 2026-01-31 [USER] Validated `url_to_markdown_selftest.sh` and `url_to_markdown_scrape.sh` after shared-state changes.
- 2026-01-31 [CODE] Archived ExecPlan `EP-2026-01-31__firecrawl-selfhosted-cli` and updated the index.
- 2026-01-31 [CODE] Implemented shared state under `CODEX_HOME`/`~/.codex` with locking and updated docs/ignore rules.
- 2026-01-31 [CODE] Implemented url-to-markdown curated skill with stdout-only markdown, public images, retries, and idle shutdown.
- 2026-01-31 [CODE] Renamed and documented the skill, including `README.md` and `advanced.md`.
- 2026-01-31 [CODE] Quieted compose output and suppressed transient retry noise.
- 2026-01-28 [CODE] Repo scaffolding and ExecPlan index created (see `README.md`, `.agent/execplans/INDEX.md`).
## Working set

- .gitignore
- .agent/execplans/archive/EP-2026-01-31__firecrawl-selfhosted-cli.md
- .agent/execplans/archive/EP-2026-01-28__skills-repo-scaffold.md
- .agent/execplans/INDEX.md
- README.md
- skills/.curated/README.md
- skills/.curated/url-to-markdown/SKILL.md
- skills/.curated/url-to-markdown/README.md
- skills/.curated/url-to-markdown/advanced.md
- skills/.curated/url-to-markdown/scripts/
## Decisions

- 2026-01-28 [USER] D001 ACTIVE: Mirror OpenAI skills structure (`skills/.curated`, `skills/.experimental`), document repo-level installs only (`--dest .codex/skills`), defer automation scripts, and include an example template under `skills/.example/` with stub folders.
- 2026-01-31 [USER] D002 SUPERSEDED: Create a curated Firecrawl self-hosted CLI skill that uses `--api-url`, outputs markdown only, offers optional include/exclude tag filtering, avoids caching for now, stores deterministic outputs under `.codex/.firecrawl/output`, auto spins down after 20 minutes idle, tracks the latest Firecrawl repo, and assumes the CLI is installed.
- 2026-01-31 [USER] D003 ACTIVE: Move Firecrawl runtime state/output from `.agent/.firecrawl` to `.codex/.firecrawl` so the skill leaves nothing under `.agent`.
- 2026-01-31 [USER] D004 ACTIVE: Ignore `.codex/.firecrawl` in git and set non-empty defaults (MODEL_NAME=disabled) for optional Firecrawl service variables to suppress compose warnings.
- 2026-01-31 [USER] D005 ACTIVE: Add startup retry logic to handle ECONNRESET errors and show progress during idle shutdown waits; set MODEL_NAME to `disabled`.
- 2026-01-31 [USER] D006 ACTIVE: Keep stdout reserved for output paths by sending scrape CLI output to stderr and replace empty `.env` values with non-empty defaults.
- 2026-01-31 [USER] D007 ACTIVE: Force `USE_DB_AUTHENTICATION=false` and `DISABLE_BLOCKLIST=true` by default, with env overrides, to prevent Supabase-dependent worker crashes.
- 2026-01-31 [USER] D008 ACTIVE: Redirect `firecrawl_up.sh` stdout to stderr to avoid output path contamination.
- 2026-01-31 [USER] D009 ACTIVE: Set `firecrawl_selftest.sh` idle default to 5 minutes for faster validation.
- 2026-01-31 [USER] D010 ACTIVE: Align CLI flag ordering with docs and add a grace period before the self-test fails the running-container check.
- 2026-01-31 [USER] D011 ACTIVE: Output markdown to stdout only, disable output files, and stop containers immediately in self-test while keeping idle shutdown for normal runs.
- 2026-01-31 [USER] D012 ACTIVE: Suppress transient retry errors so ECONNRESET messages are not shown unless the scrape fails.
- 2026-01-31 [USER] D013 ACTIVE: Use public images with no local checkout, stdout-only output, and reduce idle shutdown default to 5 minutes.
- 2026-01-31 [USER] D014 ACTIVE: Share state across installs at `CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/...`) with no per-project override.
- 2026-01-31 [USER] D015 ACTIVE: Keep a single shared `.env` config across installs.
- 2026-01-31 [USER] D016 ACTIVE: Add a shared lock for compose up/down and `last_used` updates to prevent multi-install races.
- 2026-01-31 [USER] D017 ACTIVE: If `CODEX_HOME` is unset and `HOME` is unavailable, scripts exit with a hard error.
## Receipts

- 2026-01-28 [TOOL] Read `.agent/PLANS.md` and `.agent/execplans/INDEX.md` to follow ExecPlan requirements.
- 2026-01-28 [TOOL] Created repo scaffolding directories and README content; verified with `ls` and `rg`.
- 2026-01-28 [TOOL] Archived ExecPlan and updated ExecPlan index.
- 2026-01-31 [TOOL] Created ExecPlan `EP-2026-01-31__firecrawl-selfhosted-cli` and updated the ExecPlan index.
- 2026-01-31 [TOOL] Added the Firecrawl self-hosted CLI skill files and updated related documentation and ExecPlan progress.
- 2026-01-31 [TOOL] Reviewed Firecrawl CLI and self-hosted docs on docs.firecrawl.dev for flags and required env configuration.
- 2026-01-31 [TOOL] Re-checked Firecrawl CLI docs confirming `--api-url` as a global option and `--format` usage.
- 2026-01-31 [TOOL] Checked Firecrawl CLI installation docs to confirm the current install command for the CLI.
- 2026-01-31 [USER] `firecrawl_selftest.sh` completed successfully; output at `.codex/.firecrawl/output/100680ad546ce6a577f42f52df33b4cfdca756859e664b8d7de329b150d09ce9.md`.
- 2026-01-31 [USER] Ran `firecrawl_selftest.sh`; output showed docker image pulls and warnings for unset optional variables; completion status UNCONFIRMED.
- 2026-01-31 [USER] Re-ran `firecrawl_selftest.sh`; output showed `Error: read ECONNRESET` after containers started; fix pending.
- 2026-01-31 [USER] Reported API container logs showing Supabase client errors and worker shutdowns when DB auth is enabled without Supabase configuration.
- 2026-01-31 [USER] `url_to_markdown_selftest.sh` completed with clean stdout output and immediate shutdown.
- 2026-01-31 [USER] Confirmed `url_to_markdown_selftest.sh` and `url_to_markdown_scrape.sh` both work correctly after shared-state changes.
- 2026-01-31 [CODE] Archived ExecPlan `EP-2026-01-31__firecrawl-selfhosted-cli` and updated `.agent/execplans/INDEX.md`.
- 2026-01-31 [CODE] Updated url-to-markdown scripts to run helper scripts via bash and hardened stale-lock cleanup; adjusted docs.
- 2026-01-31 [CODE] Added empty-output retry logic to url-to-markdown scrape and documented the retry timing.
- 2026-01-31 [CODE] Updated default startup retry cadence to 120s total with 10s intervals.
