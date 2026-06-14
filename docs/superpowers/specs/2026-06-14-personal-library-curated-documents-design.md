# Personal Library Curated Documents Design

## Goal

Implement the approved A+B direction for the logged-in personal library: show a concise recommendation queue built from important, recent, and unread public documents, and add a persistent personal document stash.

## Scope

- Applies only to logged-in member/refund personal library document presentation.
- Admin document management keeps the existing full document table.
- Public disclosure pages keep their normal full search/list behavior.
- Recommended documents exclude documents the current user has already viewed or downloaded.
- Saved documents remain visible in "내 보관함" even after viewing.
- Personal saved state is stored per user and per document.

## Recommendation Policy

- Include starred documents that are unread.
- Include recent documents that are unread.
- "Recent" means document date, published date, or created date within the last 14 days.
- Sort starred documents first, then newest documents.
- Limit the initial recommended queue to 6 documents.

## Personal Stash Policy

- Users can save or remove a document from the personal library.
- The action must be server-side and tied to the authenticated user.
- Saving a document does not change document approval, visibility, or admin metadata.
- Saved documents are shown under a separate "내 보관함" tab.

## UI Direction

- Replace the member/refund personal library full public table with a warm, compact hub:
  - Header summary: recommendation count, saved count, unread policy.
  - Tabs: "추천자료" and "내 보관함".
  - Document cards with status chips: 중요, 최근, 보관됨.
  - Actions: "열람" and "보관/보관 해제".
- Empty states should be truthful:
  - No recommended docs: "새로 확인할 중요/최근 자료가 없습니다."
  - No saved docs: "아직 보관한 자료가 없습니다."

## Data

- Add `PersonalDocumentBookmark` as a user-document join table.
- Extend serialized document view data with:
  - `isViewedByCurrentUser`
  - `isBookmarkedByCurrentUser`
- Use existing `DocumentLog` entries for view/download history.

## Verification

- Add tests for:
  - Recommended queue hides viewed documents and includes unread important/recent documents.
  - Saved documents are available under "내 보관함".
  - Bookmark API creates and deletes the current user's bookmark.
- Run `pnpm lint`, `pnpm test`, and `pnpm build`.
