# Review Mode

Use this mode when reviewing an ExecPlan for executability, correctness risk, missing contracts, or likely implementation drift.

## Review Scope

Review the full ExecPlan end to end. Do not rely on greps alone.

Then review all source files directly referenced by the ExecPlan and discover additional impacted files by tracing changed contracts, interfaces, data boundaries, and immediate dependents.

For every non-referenced file included in review, state the concrete reason: shared contract, call path, schema boundary, or test coverage impact.

## Code-Contract Check

Before assigning confidence, verify the ExecPlan includes enough code contracts for reliable execution without guesswork:

- Concrete file/module touchpoints.
- API, function, or interface boundaries expected to change.
- Data shape or schema expectations at boundaries.
- Invariants and error-handling expectations.
- Verification steps that prove those contracts are satisfied.

If impacted files are missing from the ExecPlan:

- Flag each missing file as a finding.
- Propose adding those file touchpoints to the ExecPlan.
- Do not expand further unless a material risk remains unverified.

## Cross-Plan Coupling

If multiple active ExecPlans exist, enumerate `.agent/execplans/INDEX.md` before deciding whether they must be reviewed together.

Review coupled plans together when they share files, contracts, interfaces, or execution order. If coupled, require each plan's `Context and Orientation` section to list related Plan IDs, shared contracts/interfaces, and required execution order.

## Output Format

Output exactly this shape:

- `Confidence: <N>%`
- `Key risks: ...`
- `Code-contract gaps: ...`
- `Split recommendation: none | required (why)`
- `Cross-plan coupling: none | present (plans/contracts/order)`
- `Proposals if <95%: ...`
- `If confidence >=95%: Proposals: none`
- `Proposal complexity cost: N/A when there are no proposals; otherwise low | medium | high per proposal`

Include only material, evidence-backed risks likely to cause regressions, blocked execution, or significant rework. Prefer the smallest set of findings needed to execute safely.
