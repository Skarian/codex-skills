# reference-module

Study a git repository with a local cache across projects

References are stored outside the skill package:

```text
<scope-root>/reference-modules/<owner>/<repo-name>/
```

`<scope-root>` is resolved from the installed skill path by finding the nearest parent named `skills` and using its parent

Missing references clone at remote `HEAD`. Existing references are never changed silently: the agent asks whether to use as-is, update, or create a separate copy

References are read-only by default and are not added as submodules, symlinks, or pointer files unless explicitly requested
