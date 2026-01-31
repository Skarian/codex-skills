# Codex Skills Repository

This repository is the primary home for custom Codex skills. It is structured to work with the Codex `skill-installer` and to support repo-level installs only.

## Repository Layout

- `skills/.curated/`: Stable skills intended for regular use.
- `skills/.experimental/`: Skills that are still evolving.
- `skills/.example/`: Template skills to copy when creating new skills. Do not install these directly.

Each skill lives in its own folder and must include `SKILL.md`. Optional folders are `scripts/`, `references/`, and `assets/`.

## Quick Start (repo-level install only)

From the target repository where you want the skill available:

```
$skill-installer let me pick skills from https://github.com/Skarian/codex-skills/tree/main/skills/.curated/
```

Restart Codex to pick up new skills.

## Skills

- `skills/.curated/url-to-markdown`: Local URL-to-markdown pipeline that prints markdown to stdout with idle shutdown.
