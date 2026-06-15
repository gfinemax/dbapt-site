# UI Review

## Reviewed Change

- Feature: Replace the redirect-prone Naver Maps iframe in `찾아오시는 길` with a Naver Maps SDK map surface, correct its fixed marker coordinate, add selectable detailed route guidance with a blinking `+ 자세히보기` affordance, remove consultation-hours/parking rows, remove the specific trust-company name from the partner card, revise the history-section copy toward renewed transparent cooperative-led execution, add the `2026.04.18` regular general meeting milestone, and remove the `2013.05.01` leader-change milestone
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: small approved production bugfix; no separate plan file
- Files or pages reviewed:
  - `src/components/about/about-client.tsx`
  - `src/__tests__/about-client.test.tsx`
  - `/about#section-location`

## Boundary Review

- Finding: PASS
- Evidence: The change only affects public `조합소개` presentation copy and the public location panel. Public navigation, login gating, document access, and private data boundaries are unchanged.

## Truthful Presentation Review

- Finding: PASS
- Evidence: The page continues to show a Naver map surface plus static office address, route facts, the user-requested station-by-station guidance, and a generic `자금관리 신탁사` partner card. The history copy acknowledges member concern without claiming completed trust restoration, the `2026.04.18` milestone presents the user-provided regular general meeting fact as a public timeline item, the removed `2013.05.01` leader-change milestone no longer appears in the highlighted or full history views, the marker uses the verified office coordinate rather than client-side address geocoding, the external `네이버 지도에서 보기` link remains available, and removing the consultation-hours/parking rows or specific trust-company name does not imply a live reservation, route-search, or private-service action.

## Design And Accessibility Review

- Finding: PASS
- Evidence: The replacement map stays inside the existing rounded card frame with stone outlines, preserves visible focusable external link behavior with `target="_blank"`/`rel="noopener noreferrer"`, avoids the browser-specific `map.naver.com` search iframe redirect-loop error text, avoids geocoder-driven marker drift, and exposes the long directions through an `aria-expanded` button with a small `+ 자세히보기` pulse that stops under reduced-motion settings.

## Outcome

- Result: PASS
- Required action: none
