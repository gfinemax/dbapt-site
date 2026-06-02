# UI Review

## Reviewed Change

- Feature: `/library` uploaded material details and narrow orange right-side `조합원 개인 자료실` badge
- Governing spec: Existing public library index scope and repository UI rules in `AGENTS.md`
- Implementation plan: Not required for this narrow correction
- Files or pages reviewed: `/`, `/library`, `src/components/landing/site-header.tsx`, `src/components/library/library-client.tsx`, `src/app/library/page.tsx`, `src/__tests__/site-header.test.tsx`, `src/__tests__/library-page.test.tsx`

## Boundary Review

- Finding: The change does not alter public navigation, roles, permissions, or public document access.
- Evidence: The badge renders only for logged-in sessions, still calls the existing portal-open path, and is hidden on `/portal/*` routes. `/library` loads approved uploaded documents only when a session exists and opens real entries through `/api/documents/[id]/view`.

## Truthful Presentation Review

- Finding: The CTA remains truthful and does not imply a new public document feature.
- Evidence: The visible label is now `조합원 개인 자료실`; clicking it opens the same authenticated drawer as before, now titled `조합원 개인 자료실`. Real uploaded material cards use actual document titles and route through the existing viewer instead of exposing private file URLs.

## Design And Accessibility Review

- Finding: The material panel and side badge follow the requested visible behavior while keeping the site layout stable.
- Evidence: Browser check found one fixed right-side badge with width about 40px, background `rgb(255, 90, 31)`, text color `rgb(255, 255, 255)`, 12px left corner radius, zero-width borders on all sides, vertical text, and box-shadow layers all at `rgba(0,0,0,0)`. Mobile behavior remains hidden below the desktop breakpoint to avoid duplicating the bottom navigation.

## Outcome

- Result: PASS
- Required action: none
