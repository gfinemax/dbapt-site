# Verification

## Implemented Feature

- Updated `src/components/about/about-client.tsx` so the `찾아오시는 길` panel uses a fixed Naver Maps marker coordinate without client-side geocoding.
- Added a selectable `대방동 지역주택조합 사무실 찾아오시는 길안내` section with route details from 대방역, 노량진역, 장승배기역, plus walking directions from `대방현대아파트` 정류장.
- Removed `상담시간` from the `조합 사무실 정보` block.
- Removed the `주차` row from the public location panel.
- Added a blinking `+ 자세히보기` label to the route-guide selector, with `motion-reduce:animate-none`.
- Removed the specific trust-company name from the `자금관리 신탁사` partner card title and body copy.
- Revised the history-section headline and support copy to acknowledge member distrust and emphasize renewed transparent cooperative-led execution.
- Added a `2026.04.18` highlighted milestone for the 2026 regular general meeting after the founding general meeting.
- Removed the `2013.05.01` leader-change milestone from both the highlighted timeline and the full history list.
- Updated `src/__tests__/about-client.test.tsx` to cover fixed coordinates, no geocoder module, hidden-then-expanded route guidance, consultation-hours/parking removal, the blinking `+ 자세히보기` affordance, trust-company-name removal, the renewed transparent leadership history copy, the new 2026 regular general meeting milestone, and removal of the 2013 leader-change milestone.

## Checks Run

- `pnpm test -- src/__tests__/about-client.test.tsx`: PASS, 1 file / 7 tests
- `pnpm lint`: PASS
- `pnpm test`: PASS, 34 files / 204 tests
- `pnpm build`: PASS
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/about`: PASS, 200 OK; new history headline/support copy present; old history headline absent; `2026.04.18` regular general meeting date/title/copy present; `2013.05.01` and leader-change copy absent; guide toggle and `+ 자세히보기` present; specific trust-company name absent

## Browser Checks

- Codex in-app browser was attempted after reading the Browser skill, but it was unavailable with `Browser is not available: iab`.
- Fallback HTTP and component-test verification completed.

## Unresolved Risks Or Follow-Up Specs

- none
