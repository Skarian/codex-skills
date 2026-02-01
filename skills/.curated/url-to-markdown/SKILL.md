---
name: url-to-markdown
description: Convert a single URL to markdown with stdout output and idle shutdown. Use for a free local URL-to-markdown workflow.
---

# URL to Markdown

## Run

    bash "${CODEX_HOME:-$HOME/.codex}/skills/url-to-markdown/scripts/url_to_markdown_scrape.sh" <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]

Provide a URL and capture the markdown from stdout.
Before every run, explicitly ask the user for network permission and wait for a clear “yes.” Do this even for repeats.
Never run or retry unless permission is granted for that specific run.
When permission is granted, execute the command with explicit network escalation (sandbox permissions required for network access). If escalation is not granted, do not run.
First run may take a few minutes while the stack warms up; avoid rerunning while it is starting.
Requires `curl` for readiness checks.
If your tool has a timeout, allow at least 180 seconds on the first run.

## Defaults

- Markdown only, main-content-only enabled.
- No output files are written; stdout only.
- Auto spin-up for the local stack and idle shutdown after inactivity.

## Advanced

See `advanced.md` for environment overrides, self-test, and cleanup.
