# URL to Markdown Skill

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan must be maintained in accordance with `.agent/PLANS.md` from the repository root.

- Plan ID: EP-2026-01-31__firecrawl-selfhosted-cli
- Status: ARCHIVED
- Created: 2026-01-31
- Last Updated: 2026-01-31
- Owner: UNCONFIRMED

## Purpose / Big Picture

After this change, a user can invoke a curated Codex skill that turns a single URL into markdown using a self-hosted Firecrawl backend. The skill ensures the Firecrawl container stack is running locally, calls the Firecrawl CLI with a local API URL, prints markdown to stdout, and shuts the container down after 5 minutes of inactivity. The stack state is shared across all installs on the same machine by using a single state directory under `$CODEX_HOME/url-to-markdown/.state` (or `~/.codex/url-to-markdown/.state` if `CODEX_HOME` is not set), so multiple projects reuse the same containers. The behavior is observable by running the scrape command from different installs, seeing markdown on stdout, and confirming the shared container stack stops after the idle window.

## Progress

- [x] (2026-01-31 17:11Z) Captured decisions for the Firecrawl self-hosted CLI skill scope and defaults.
- [x] (2026-01-31 17:20Z) Agreed on adding a self-test script and an idle timeout override for automated verification.
- [x] (2026-01-31 17:25Z) Create the curated skill folder and write `skills/.curated/url-to-markdown/SKILL.md`.
- [x] (2026-01-31 17:25Z) Implement the scripts that bootstrap the self-hosted Firecrawl stack and perform a markdown scrape with stdout output.
- [x] (2026-01-31 17:25Z) Update `skills/.curated/README.md` and `README.md` to list the new skill.
- [x] (2026-01-31 17:35Z) Move default state/output paths to `.codex/.firecrawl` and update documentation accordingly. (Superseded by `$CODEX_HOME/url-to-markdown/.state`.)
- [x] (2026-01-31 17:35Z) Add `.codex/.firecrawl` to `.gitignore` and ensure `.env` defaults silence optional service warnings. (Superseded by public-image compose.)
- [x] (2026-01-31 17:40Z) Add scrape retry logic and startup timeout to handle API readiness, plus self-test progress output.
- [x] (2026-01-31 17:45Z) Keep stdout clean by sending CLI output to stderr and normalize empty `.env` values.
- [x] (2026-01-31 17:50Z) Enforce `USE_DB_AUTHENTICATION=false` and `DISABLE_BLOCKLIST=true` by default to avoid Supabase-dependent worker crashes.
- [x] (2026-01-31 17:55Z) Redirect `url_to_markdown_up.sh` stdout to stderr to prevent stdout pollution.
- [x] (2026-01-31 18:05Z) Set self-test idle default to 5 minutes for faster validation (later superseded by immediate shutdown).
- [x] (2026-01-31 18:20Z) Align CLI invocation with docs, remove `--formats` detection, and add a grace period for container checks in self-test.
- [x] (2026-01-31 18:35Z) Detach idle shutdown background job so self-test no longer blocks on the idle timer.
- [ ] (2026-01-31 19:11Z) Package the skill into `dist/url-to-markdown.skill`. (Removed to align with repo-level install intent.)
- [x] (2026-01-31 19:20Z) Slim SKILL.md to minimal usage and move advanced details to `advanced.md`.
- [x] (2026-01-31 19:35Z) Rename skill to `url-to-markdown`, rename scripts, and add per-skill README with requirements and behavior.
- [x] (2026-01-31 19:50Z) Switch to stdout-only output and update self-test to stop containers immediately.
- [x] (2026-01-31 20:05Z) Suppress transient retry errors so stdout remains clean.
- [x] (2026-01-31 20:30Z) Replace local repo checkout with public images and set idle shutdown default to 5 minutes.
- [x] (2026-01-31 20:20Z) Quiet git/compose stdout so container startup/shutdown logs do not appear.
- [x] (2026-01-31 20:15Z) Validate self-test output is clean (no ECONNRESET noise) and containers stop.
- [x] (2026-01-31 18:45Z) Run validation: scrape a URL, confirm stdout output, and verify idle shutdown.
- [x] (2026-01-31 23:35Z) Move default state directory to `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`) and remove `FIRECRAWL_STATE_DIR` usage.
- [x] (2026-01-31 23:35Z) Add a shared-state lock around compose up/down and last_used updates to prevent multi-install races.
- [x] (2026-01-31 23:35Z) Update docs and `.gitignore` for the shared state directory location.
- [x] (2026-01-31 22:56Z) Validate shared stack behavior and record receipts in `.agent/CONTINUITY.md`.
- [x] (2026-01-31 22:56Z) Update `.agent/CONTINUITY.md` with decisions, state, and receipts after implementation (completed: implementation update; remaining: validation receipts).

## Surprises & Discoveries

- Observation: `docker compose up -d` emitted warnings about unset optional variables (model and search settings) during the first self-test run.
  Evidence: Self-test output showed warnings for `MODEL_NAME`, `MODEL_EMBEDDING_NAME`, `OPENAI_BASE_URL`, `OLLAMA_BASE_URL`, and `SEARXNG_*`.

- Observation: Self-test hit `Error: read ECONNRESET`, likely due to API readiness after compose startup.
  Evidence: Self-test output ended with `Error: read ECONNRESET`.

- Observation: API logs show Supabase client initialization errors and worker crashes when DB auth is enabled without Supabase configuration.
  Evidence: `Supabase RR client is not configured` followed by workers exiting in container logs.

## Decision Log

- Decision: Use Firecrawl CLI with `--api-url` pointing to the local self-hosted API. Limit output to markdown only and avoid AI-dependent formats.
  Rationale: Keeps the pipeline free and token-efficient while aligning with the user’s request to use the CLI and markdown output.
  Date/Author: 2026-01-31 [USER]

- Decision: Assume Firecrawl CLI is already installed on the host.
  Rationale: Avoids host package installation and aligns with the user’s preference.
  Date/Author: 2026-01-31 [USER]

- Decision: No caching layer for now. Output is stdout-only, so idempotence relies on deterministic content rather than file paths.
  Rationale: Keeps scope small while preserving repeatable outputs without writing files.
  Date/Author: 2026-01-31 [USER]

- Decision: Track the latest Firecrawl self-hosted repository state when bootstrapping. (Superseded by public images.)
  Rationale: User explicitly requested tracking latest.
  Date/Author: 2026-01-31 [USER]

- Decision: Implement idle shutdown after 5 minutes of no usage by scheduling a delayed check that shuts down the compose stack if no newer activity occurred.
  Rationale: Meets the request for automatic spin-down without introducing a long-running daemon.
  Date/Author: 2026-01-31 [USER]

- Decision: Do not write output files; print markdown to stdout and place the skill in `skills/.curated/`.
  Rationale: Keeps state in-repo and avoids file outputs while following the curated skill expectation.
  Date/Author: 2026-01-31 [USER]

- Decision: Move the Firecrawl state directory from `.agent/.firecrawl` to `.codex/.firecrawl` and ensure the skill leaves nothing under `.agent`. (Superseded by `$CODEX_HOME/url-to-markdown/.state`.)
  Rationale: Aligns with the requested state location and avoids populating `.agent` with runtime data.
  Date/Author: 2026-01-31 [USER]

- Decision: Ignore `.codex/.firecrawl` in git and set non-empty defaults for optional service variables in `.env` (notably `MODEL_NAME=disabled`). (Superseded by public-image compose.)
  Rationale: Prevents accidental commits of runtime state and silences non-essential Compose warnings without enabling AI services.
  Date/Author: 2026-01-31 [USER]

- Decision: Add scrape retry logic with a startup timeout and a progress message during idle shutdown wait.
  Rationale: Prevents transient API readiness errors from failing the self-test and clarifies when the script is waiting.
  Date/Author: 2026-01-31 [USER]

- Decision: Send CLI logs to stderr and replace empty `.env` values (e.g., `MODEL_NAME=`) with non-empty defaults.
  Rationale: Keeps stdout reserved for markdown and prevents Compose warnings from empty env variables.
  Date/Author: 2026-01-31 [USER]

- Decision: Force `USE_DB_AUTHENTICATION=false` and `DISABLE_BLOCKLIST=true` by default, with overrides via `FIRECRAWL_USE_DB_AUTHENTICATION` and `FIRECRAWL_DISABLE_BLOCKLIST`.
  Rationale: Avoids Supabase-dependent worker crashes in self-hosted mode while keeping an escape hatch.
  Date/Author: 2026-01-31 [USER]

- Decision: Redirect `url_to_markdown_up.sh` output to stderr so stdout contains only markdown.
  Rationale: Prevents compose output from corrupting stdout content.
  Date/Author: 2026-01-31 [USER]

- Decision: Set `url_to_markdown_selftest.sh` default idle window to 5 minutes (superseded by immediate shutdown).
  Rationale: Reduced validation wait time while still exercising the idle shutdown path before stdout-only changes.
  Date/Author: 2026-01-31 [USER]

- Decision: Add a self-test script to enable fast automated verification.
  Rationale: Provides a repeatable methodology to validate functionality without waiting the full 5 minutes.
  Date/Author: 2026-01-31 [USER]

- Decision: Output markdown to stdout only and disable file outputs; keep idle shutdown for normal runs but stop containers immediately in self-test.
  Rationale: Avoids writing output files while still keeping containers warm between runs.
  Date/Author: 2026-01-31 [USER]

- Decision: Use public images for the stack and remove the local Firecrawl repo checkout; set idle shutdown default to 5 minutes.
  Rationale: Eliminates local checkout state while keeping containers warm between runs.
  Date/Author: 2026-01-31 [USER]

- Decision: Share runtime state across installs at `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`) and remove the per-install state override.
  Rationale: Ensures multiple project installs reuse one container stack and avoid port collisions.
  Date/Author: 2026-01-31 [USER]

- Decision: Treat the shared `.env` as a single global configuration file and create it only if missing; edits should be made directly in that file to change shared settings.
  Rationale: Keeps configuration consistent across installs while avoiding per-run or per-project overrides.
  Date/Author: 2026-01-31 [USER]

- Decision: Add a shared-state lock (atomic directory) with stale-lock cleanup (10 minutes) and a 30-second acquisition timeout for compose up/down and `last_used` updates.
  Rationale: Prevents concurrent installs from racing the shared container lifecycle.
  Date/Author: 2026-01-31 [USER]

- Decision: If `CODEX_HOME` is unset and `HOME` is unavailable, the scripts exit with a hard error instead of inventing another fallback.
  Rationale: Avoids writing state to an unintended location when the user environment is incomplete.
  Date/Author: 2026-01-31 [USER]

## Outcomes & Retrospective

Validation completed via `url_to_markdown_selftest.sh` and `url_to_markdown_scrape.sh`, confirming clean stdout markdown, shared state behavior, and immediate shutdown behavior in self-test.

## Context and Orientation

This repository is a Codex skills repo. Curated skills live under `skills/.curated/`, with each skill in its own folder containing `SKILL.md` and optional `scripts/`, `references/`, or `assets/`. The template skill lives at `skills/.example/template-skill/` and can be copied or used as a reference for structure.

The Firecrawl self-hosted backend is a Docker Compose stack using public images with a generated compose file. The stack uses a remote build context for `nuq-postgres`. The Firecrawl CLI is assumed to be installed and accessible as `firecrawl` in PATH. The CLI will be configured to hit the local API using the `--api-url` flag, which skips API-key auth.

Runtime state for this skill lives under a shared state directory at `$CODEX_HOME/url-to-markdown/.state`. If `CODEX_HOME` is not set, use `~/.codex/url-to-markdown/.state`. Markdown output is written to stdout only; no output files are produced. The state directory is shared across all installs so only one container stack runs per machine.

## Plan of Work

Create a new curated skill folder named `skills/.curated/url-to-markdown/`. Write a `SKILL.md` that clearly instructs another Codex instance how to use the skill to perform a single URL scrape into markdown, including default behavior and optional flags for main-content selection and HTML tag filtering. The instructions must be written in imperative form and must mention stdout-only output and idle shutdown behavior.

Add scripts that make the behavior reliable and repeatable. The scripts will generate a local Docker Compose file that uses public images inside the shared state directory under `$CODEX_HOME/url-to-markdown/.state`, ensure the Compose stack is running with a shared lock, execute the Firecrawl CLI scrape with the correct flags, print markdown to stdout, and schedule a 5-minute idle shutdown. The shared `.env` should be created only if missing and reused across runs. The scripts must fail fast if required tooling is missing and must only write inside the shared state directory.

Finally, update the curated skills README and root README to list the new skill, then validate by running the script against a public URL and observing stdout markdown and container shutdown behavior.

## Concrete Steps

Work from the repository root.

1. Create the curated skill folder structure:

   - `mkdir -p skills/.curated/url-to-markdown/scripts`

2. Draft `skills/.curated/url-to-markdown/SKILL.md` with frontmatter limited to `name` and `description`, and with body instructions that:

   - Describe the single URL to markdown flow.
   - Explain that the script manages a local self-hosted Firecrawl stack using Docker Compose.
   - Note defaults: markdown only, main content only, stdout-only output.
   - Describe optional flags for include/exclude tags and for disabling main-content-only behavior.
   - Document any environment variables and stdout-only behavior.

3. Implement scripts in `skills/.curated/url-to-markdown/scripts/`.

   Script 1: `url_to_markdown_up.sh`

  - Inputs: no state override; compute the shared state directory as `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`).
   - Behavior: ensure required tools (`docker`, `docker compose`, `firecrawl`) exist; acquire the shared lock; generate a Compose file in the state directory using public images; create a minimal `.env` with defaults only if it does not exist; enforce `USE_DB_AUTHENTICATION` and `DISABLE_BLOCKLIST`; run `docker compose up -d`; write a `last_used` timestamp file under the state directory; release the lock.
   - The script should fail with a clear error message if any required command is missing or if the compose stack fails to start.

   Script 2: `url_to_markdown_scrape.sh`

   - Inputs: first argument is the URL; optional flags for `--include-tags`, `--exclude-tags`, `--no-main` to disable main-content-only. Any remaining args after `--` should be passed through to `firecrawl scrape`, but output file flags must be rejected.
   - Behavior: call `url_to_markdown_up.sh`; call `firecrawl scrape` with `--api-url` and markdown output only (`--format markdown`); print markdown to stdout only; retry scrape failures for up to `FIRECRAWL_STARTUP_TIMEOUT` seconds (default 60) with `FIRECRAWL_RETRY_INTERVAL` seconds between tries (default 2); update the `last_used` timestamp under the shared lock; spawn a background idle check that waits for `FIRECRAWL_IDLE_SECONDS` (default 300) and, after acquiring the shared lock, calls `docker compose down` only if no newer timestamp exists.
   - The script should fail if the URL is missing or invalid, and should exit non-zero on any CLI failure.

   Script 3: `url_to_markdown_selftest.sh`

   - Inputs: none.
   - Behavior: run a scrape against `https://example.com`, assert the markdown contains the string `Example Domain`, print the markdown to stdout, then stop the compose stack immediately. The script must exit non-zero on any failure and print a concise reason.

4. Update `skills/.curated/README.md` with a short entry naming the new skill and its purpose. Update the root `README.md` in the “Skills” section to list the new skill.

## Validation and Acceptance

Validation must prove the system works end-to-end without relying on external services beyond the target URL. From the repository root:

- Run `skills/.curated/url-to-markdown/scripts/url_to_markdown_scrape.sh https://example.com`.
- Confirm markdown is printed to stdout and contains expected content.
- Run `docker compose -f $CODEX_HOME/url-to-markdown/.state/docker-compose.yaml ps` (or `~/.codex/url-to-markdown/.state/docker-compose.yaml` if `CODEX_HOME` is unset) to confirm the stack is running immediately after a scrape.
- Wait at least 5 minutes without running the script, then run `docker compose ps` again and confirm the stack is stopped.

For automated verification, run `skills/.curated/url-to-markdown/scripts/url_to_markdown_selftest.sh`, which should print markdown to stdout and stop the containers immediately on success.

Acceptance is met when markdown is printed to stdout for the URL, repeated runs produce deterministic content, and the container stack shuts down after the idle period.

## Idempotence and Recovery

All scripts must be safe to run multiple times. Compose file and env file generation should be idempotent, and `docker compose up -d` is safe to rerun. Output is stdout-only, so deterministic behavior is based on content rather than file names. If the Firecrawl stack fails to start, the scripts should stop and report the failure without leaving partial output files. If the state directory becomes corrupted, the safe recovery is to remove `$CODEX_HOME/url-to-markdown/.state` (or `~/.codex/url-to-markdown/.state`) and rerun the script.

## Artifacts and Notes

Keep artifacts minimal and focused. Example expected outputs to capture during validation include a stdout markdown snippet and a short `docker compose ps` snippet showing the stack running, followed by the stack stopped after idle.

## Interfaces and Dependencies

This plan introduces one curated skill folder at `skills/.curated/url-to-markdown/` with a `SKILL.md` and a `scripts/` directory. The scripts define the public interface for the skill and should be treated as stable entry points.

`skills/.curated/url-to-markdown/scripts/url_to_markdown_up.sh` must be callable directly with no arguments and must compute the shared state directory from `CODEX_HOME` (fallback `~/.codex`).

`skills/.curated/url-to-markdown/scripts/url_to_markdown_scrape.sh` must be callable as:

    url_to_markdown_scrape.sh <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]

External dependencies are the host’s `docker`, `docker compose`, and `firecrawl` CLI binaries. No new language runtimes or global packages should be installed. The only network access required is pulling container images, building `nuq-postgres` from a remote context, and fetching the target URL.

## Plan Revision Notes

Initial draft created on 2026-01-31 based on agreed requirements.
- (2026-01-31) Added a self-test script and idle timeout override to provide a fast, repeatable verification path.
- (2026-01-31) Updated script behavior descriptions to match implementation details (env file handling and CLI flag usage).
- (2026-01-31) Switched default state and output paths to `.codex/.firecrawl` to avoid `.agent` runtime state (later superseded by `$CODEX_HOME/url-to-markdown/.state`).
- (2026-01-31) Added `.codex/.firecrawl` to `.gitignore` and set empty defaults for optional service variables in the generated `.env` (later superseded by public-image compose).
- (2026-01-31) Added scrape retry logic with startup timeout and clarified self-test wait behavior.
- (2026-01-31) Redirected scrape CLI output to stderr and normalized empty `.env` values to avoid warnings and stdout pollution.
- (2026-01-31) Enforced `USE_DB_AUTHENTICATION=false` and `DISABLE_BLOCKLIST=true` to prevent Supabase-dependent worker crashes.
- (2026-01-31) Switched to a shared state directory under `CODEX_HOME` and added shared locking for multi-install safety.
- (2026-01-31) Redirected `url_to_markdown_up.sh` stdout to stderr to keep output path parsing stable.
- (2026-01-31) Updated self-test idle default to 5 minutes to speed up validation.
- (2026-01-31) Aligned CLI flag ordering with docs, removed `--formats` detection, and added a grace period to self-test container checks.
- (2026-01-31) Detached idle shutdown background job to avoid blocking callers waiting on stdout.
- (2026-01-31) Slimmed SKILL.md and added `advanced.md` for extended details.
- (2026-01-31) Renamed skill to `url-to-markdown`, renamed scripts, and added a per-skill README.
- (2026-01-31) Switched to stdout-only output and updated self-test to stop containers immediately.
- (2026-01-31) Suppressed transient retry errors to keep stdout clean unless the scrape ultimately fails.
- (2026-01-31) Switched to public images with a generated Compose file and reduced idle shutdown default to 5 minutes.
- (2026-01-31) Quieted git and compose stdout to avoid container status noise.
- (2026-01-31) Confirmed self-test output is clean after retry suppression.
- (2026-01-31) Documented the hard error when `HOME` is missing and `CODEX_HOME` is unset.
- (2026-01-31) Marked plan complete after user-validated self-test and scrape runs.
