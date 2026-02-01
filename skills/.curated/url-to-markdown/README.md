# URL to Markdown

Backend uses the Firecrawl self-hosted stack.

## User requirements

- Docker with Docker Compose available.
- Node.js and npm available.
- `curl` available for readiness checks.
- CLI dependency installed:

    npm install -g firecrawl-cli

## Description

This skill converts a single URL into markdown through a local, self-hosted pipeline and returns the markdown on stdout.

## Desired behavior

- Accept one URL and produce markdown only.
- Write markdown to stdout only (no output files).
- Auto spin-up the local stack on demand.
- Auto shut down the stack after idle time (5 minutes).
- Wait for the local API health endpoint before scraping (`/health` by default).
- Share a single local stack across installs via `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`).
- Provide optional include/exclude tags and main-content control.

## Usage

    bash "${CODEX_HOME:-$HOME/.codex}/skills/url-to-markdown/scripts/url_to_markdown_scrape.sh" <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]

First run can take a few minutes. Let the command finish without rerunning it.
If your tool enforces a timeout, allow at least 180 seconds on the first run.

## Self-test

    bash "${CODEX_HOME:-$HOME/.codex}/skills/url-to-markdown/scripts/url_to_markdown_selftest.sh"

The self-test prints markdown to stdout and stops the containers immediately after validation.
