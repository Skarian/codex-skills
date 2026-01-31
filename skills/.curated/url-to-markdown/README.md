# URL to Markdown

Backend uses the Firecrawl self-hosted stack.

## User requirements

- Docker with Docker Compose available.
- Node.js and npm available.
- CLI dependency installed:

    npm install -g firecrawl-cli

## Description

This skill converts a single URL into markdown through a local, self-hosted pipeline and returns the markdown on stdout.

## Desired behavior

- Accept one URL and produce markdown only.
- Write markdown to stdout only (no output files).
- Auto spin-up the local stack on demand.
- Auto shut down the stack after idle time (5 minutes).
- Share a single local stack across installs via `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`).
- Provide optional include/exclude tags and main-content control.

## Usage

    scripts/url_to_markdown_scrape.sh <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]

## Self-test

    scripts/url_to_markdown_selftest.sh

The self-test prints markdown to stdout and stops the containers immediately after validation.
