---
name: execplan-review
description: Use when the user requests a review of the ExecPlan.
---

# ExecPlan Review

Trigger: use when the user requests a review of the ExecPlan.

Now that you have put together the execplan, please spend some time reviewing it end to end (full file, no greps), in tandem, review all source code files in the repo either directly referenced by or likely to be impacted by the execplan.

Once you have reviewed all relevant files (and don't be shy, I expect you to use all your context window in this review), rate your confidence in the ability for you to execute the execplan as-is without intervention.

Consider factors like if the plan unintentionally introduces bugs, bad side-effects, if we need to reconsider our approach from first principles, any potential AI drift / slop.

Provide your confidence rating on a scale of 0-100%, if the rating is below 95% then you must provide a list of proposals to bridge the gap or propose rejecting the execplan in its entirety

Output format (use this):

- `Confidence: <N>%`
- `Key risks (numbered): ...`
- `Proposals if <95% (numbered): ...`
- For numbered findings/proposals, put each bullet on its own line; never combine multiple bullets onto one line.
