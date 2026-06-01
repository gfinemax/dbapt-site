# 대방동 자료실 통합 색인 구현 계획

## Scope

- Add a public `/library` page that works as a unified document index.
- Include duplicated references to materials that also live under `공개자료`, `사업현황`, and `조합소식`.
- Show document names, categories, source locations, and access status.
- Keep protected documents gated: the public page may describe them, but must not expose private files or imply direct access.
- Update public navigation, mega menu entries, and landing feature links from `/#library` to `/library`.

## Non-Goals

- No new document upload, download, search API, or database schema.
- No public exposure of private document files.
- No accounting, voting, personal payment, or messaging feature expansion.

## Implementation Steps

1. Add a focused test for the library page content and gated access labels.
2. Add a navigation test that confirms 자료실 links route to `/library`.
3. Implement typed library content and a `LibraryClient` component.
4. Add `src/app/library/page.tsx`.
5. Update `src/content/landing.ts` and landing 자료실 card link.
6. Run UI review, lint, tests, build, and browser checks.
