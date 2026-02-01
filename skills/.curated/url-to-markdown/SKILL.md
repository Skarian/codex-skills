---
name: url-to-markdown
description: Convert a single URL to markdown with stdout output and idle shutdown. Use for a free local URL-to-markdown workflow.
---

# URL to Markdown

## Run

    bash "${CODEX_HOME:-$HOME/.codex}/skills/url-to-markdown/scripts/url_to_markdown_scrape.sh" <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]

Provide a URL and capture the markdown from stdout.
If network access is gated, request approval before the first run (Docker pulls and fetches require network access).

## Defaults

- Markdown only, main-content-only enabled.
- No output files are written; stdout only.
- Auto spin-up for the local stack and idle shutdown after inactivity.

## Advanced

See `advanced.md` for environment overrides, self-test, and cleanup.
