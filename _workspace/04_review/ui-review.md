# UI Review

## Reviewed Change
- Feature: OpenChat copied public notice/news announcements now route to the public website detail page instead of direct attachment PDF URLs.
- Related local feature: smartphone PDF preview avoids automatic iframe PDF loading and offers a direct browser-open action.
- Governing spec: direct operator request in the current thread, narrowed to public notice/news link behavior and mobile PDF preview behavior.
- Implementation plan: test-first regression fixes in `src/__tests__/openchat-announcements.test.ts`, `src/__tests__/news-deep-links.test.ts`, `src/__tests__/news-notice-deep-link.test.tsx`, `src/__tests__/pdf-viewer-modal.test.tsx`, and `src/__tests__/document-public-view-api.test.ts`.
- Files or pages reviewed: `src/lib/notifications/openchat-announcements.ts`, `src/lib/news/deep-links.ts`, `src/components/news/news-client.tsx`, `src/components/news/coop-newsletter.tsx`, `src/components/portal/pdf-viewer-modal.tsx`, document inline preview API routes, `src/lib/pdf-response-headers.ts`, and related tests.

## Boundary Review
- Finding: PASS
- Evidence: Public notice/news posts were already loaded for non-login visitors. The change only points copied announcements to those public detail URLs and keeps free-board member-only links/login gating unchanged. PDF access/download policy is not widened.

## Truthful Presentation Review
- Finding: PASS
- Evidence: Announcement copy now tells users to check the corresponding website post content. It no longer implies that a direct PDF attachment is the primary destination for public notice/news posts.

## Design And Accessibility Review
- Finding: PASS
- Evidence: No broad visual redesign was introduced. The newsletter detail modal gained an explicit `aria-label` for addressable detail state, and the mobile PDF fallback retains existing warm canvas/parchment styling and focusable anchor controls. In-app Browser was unavailable in this session and Playwright CLI is not installed, so visible verification used component tests plus a local `/news?tab=newsletter` HTTP 200 check.

## Outcome
- Result: PASS
- Required action: none.
