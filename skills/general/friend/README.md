# friend

Use Claude, Gemini, or Codex for reviews

```bash
friend <claude|gemini|codex> "question" [evidence paths or URLs...] [--model name]
```

The bundled `scripts/friend` wrapper calls the selected CLI in read-only review mode and prints the response to stdout. It accepts a question plus optional evidence paths or URLs, including directories, images, and `.` for the current repo
