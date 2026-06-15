# UI Review

## Reviewed Change

- Feature: Replace the redirect-prone Naver Maps iframe in `찾아오시는 길` with a stable location guide
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: small approved production bugfix; no separate plan file
- Files or pages reviewed:
  - `src/components/about/about-client.tsx`
  - `src/__tests__/about-client.test.tsx`
  - `/about#section-location`

## Boundary Review

- Finding: PASS
- Evidence: The change only affects the public location panel. Public navigation, login gating, document access, and private data boundaries are unchanged.

## Truthful Presentation Review

- Finding: PASS
- Evidence: The panel presents static office address and transit facts already shown on the page. The only map action remains an external `네이버 지도에서 보기` link, so no embedded live map is implied.

## Design And Accessibility Review

- Finding: PASS
- Evidence: The replacement panel uses the existing white card, parchment surface, stone outlines, ember accent, rounded controls, visible address text, and an external link with `target="_blank"`/`rel="noopener noreferrer"`. Removing the iframe avoids browser-specific redirect-loop error text in the visible UI.

## Outcome

- Result: PASS
- Required action: none
