# Retirement History

Retired: 2026-05-28

## Why It Was Retired

`precommit-review` was retired because Codex now has built-in review functionality that covers the main commit-readiness use case with less dedicated workflow overhead. The phased skill was useful when the repo needed a strict custom review ritual, but Codex `/review` and Codex code review now provide a more native review path.

OpenAI describes Codex as helping developers "write, review, and ship code" and documents automated code review directly in GitHub. OpenAI's Codex use cases also list reviewing GitHub pull requests to catch regressions before human review. Public OpenAI customer stories for Ramp and Datadog describe Codex code review as useful because it can reason across broader codebase context, surface substantive feedback, and catch risks beyond immediate diff-only review.

References:

- <https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan>
- <https://developers.openai.com/codex/use-cases>
- <https://openai.com/index/ramp/>
- <https://openai.com/es-ES/index/datadog/>

## Replacement

No replacement skill. Use Codex `/review` or Codex code review for commit-readiness review.

## Interview Notes

- The user confirmed this is a full retirement.
- The reason is that Codex slash review functionality has reduced the need for a dedicated phased pre-commit review skill.
- Keep the original `SKILL.md` for historical reference.
