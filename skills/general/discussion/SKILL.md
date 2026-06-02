---
name: discussion
description: Use when a response will have more than three blocking decisions, risks, or questions that must be discussed with the user.
---

# Discussion Protocol

Use this skill to keep longer decision, risk, or question discussions easy to scan and answer.

## When To Use

Use this skill when:

- Your next response would contain more than three blocking decisions, risks, or questions.
- Those items need user discussion before you can confidently continue.

This can happen during planning, review, implementation, debugging, or re-scoping. If there are three or fewer blocking items, keep the response direct.

Do not use this skill for normal explanations, teaching answers, status updates, or reviews that already have a clearer output format.

## Response Guidance

- Start with one sentence of context.
- Use a numbered list for the blocking items.
- Keep each item concise and independently answerable.
- Include the practical consequence when it is not obvious.
- Recommend a default path when there is a clear best option.
- After the list, state what answer would let you continue.

Keep non-blocking context in short prose outside the numbered list.

Example shape:

```text
I need to settle these before continuing:
1. ...
2. ...
3. ...
4. ...

Recommended path: ...
```
