# humanizer

Project-level copy of the `humanizer` skill from [`blader/humanizer`](https://github.com/blader/humanizer).

Copied verbatim from [`blader/humanizer/SKILL.md`](https://github.com/blader/humanizer/blob/main/SKILL.md).

Behavior:

- Removes signs of AI-generated writing from text.
- Detects and fixes common AI writing patterns such as inflated symbolism, promotional language, vague attributions, rule-of-three structure, em dash overuse, passive voice, and filler phrasing.
- Supports optional voice calibration from a user-provided writing sample.
- Performs a final anti-AI audit pass before producing the final rewrite.

Install (Codex):

```bash
npx skills add https://github.com/Skarian/codex-skills/tree/main/project --skill humanizer -a codex -y
```
