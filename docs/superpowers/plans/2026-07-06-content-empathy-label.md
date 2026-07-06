# Content Empathy Label Follow-up

## Goal

Rename the user-facing common content-like affordance from `좋아요` to `공감` across 소통마당 and 공개자료 surfaces, while keeping the existing single persisted reaction model.

## Scope

- Change list/table column headers from `좋아요` to `공감`.
- Change the shared content reaction button label, title, accessible name, and user-facing failure copy from `좋아요` to `공감`.
- Use a friendlier visible emoji cue for the button without changing stored data.
- Keep `ContentReaction`, `/api/content-reactions`, permissions, counts, and target types unchanged.
- Do not add a multi-emoji reaction picker for posts or documents in this slice.

## Verification

- Run focused content count/reaction UI tests first.
- Run `pnpm lint`.
- Run `pnpm test`.
- Run `pnpm build`.
