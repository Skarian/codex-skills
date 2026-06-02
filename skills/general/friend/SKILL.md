---
name: friend
description: Use when the user asks to call a friend or get a CLI-backed second opinion from Claude, Gemini, or Codex.
---

# Friend

Use when the user asks to call a friend or wants a second opinion from another local CLI model.

Prefer Claude for UI, screenshots, and visual review; Gemini for web, source-backed research, and broad context; Codex for independent code, repo, plan, or process review.

Run the bundled `scripts/friend` wrapper:

```bash
friend <claude|gemini|codex> "question" [evidence paths or URLs...] [--model name]
```

Evidence can be paths, directories, images, URLs, or `.`. Use the configured model unless the user asks for one. Treat the friend as read-only advice: summarize, adjudicate, and verify important claims instead of forwarding the answer blindly.
