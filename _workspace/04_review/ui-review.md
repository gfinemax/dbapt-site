# UI Review

## Reviewed Change
- Feature: smartphone disclosure PDF viewing was restored to the in-page embedded PDF frame flow, matching the direct website viewing path used by copied OpenChat disclosure URLs.
- Related local feature: copied public notice/news announcements continue to route to public website detail pages instead of direct attachment PDF URLs.
- Governing spec: direct operator request in the current thread, narrowed to disclosure announcement copy and mobile PDF viewer behavior.
- Implementation plan: test-first regression fixes in `src/__tests__/pdf-viewer-modal.test.tsx` and `src/__tests__/openchat-announcements.test.ts`.
- Files or pages reviewed: `src/components/portal/pdf-viewer-modal.tsx`, `src/lib/notifications/openchat-announcements.ts`, and related tests.

## Boundary Review
- Finding: PASS
- Evidence: The change only restores embedded PDF rendering for already-authorized public disclosure preview URLs and updates OpenChat copy text. Free-board member-only links/login gating, private document permissions, and download policy remain unchanged.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Disclosure announcement copy now tells users to check the public website material without saying login is required for the shared public disclosure URL.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No broad visual redesign was introduced. The mobile-specific direct-open panel was removed, and the existing embedded PDF frame now renders at mobile and desktop sizes. In-app Browser was unavailable in this session and Playwright CLI is not installed, so visible verification uses component tests plus build/lint validation.

## Outcome
- Result: PASS
- Required action: none.
