# Archive Mode

Use this mode when an ExecPlan should become a historical record because it is completed, cancelled, or superseded.

Never delete ExecPlans.

## Archival Steps

1. Ensure the plan reflects reality in `Progress`, `Decision Log`, and `Outcomes & Retrospective`.
2. If the work finished, set `Status: DONE` before archiving.
3. Move the file into `.agent/execplans/archive/`.
4. Set `Status: ARCHIVED` after the move and update `Last Updated`.
5. Move the index entry into `Archived ExecPlans`.
6. Update `Path:`, `Status:`, and `Updated:` in the archived index entry.
7. Add `Archived:YYYY-MM-DD` and a one-line outcome to the archived index entry.
8. Remove any stale draft or active index entry for the same Plan ID.

## Validation

After archiving, verify:

- The old draft or active path no longer exists.
- The archive path exists.
- The plan header status is `ARCHIVED`.
- `.agent/execplans/INDEX.md` lists the plan only under `Archived ExecPlans`.
