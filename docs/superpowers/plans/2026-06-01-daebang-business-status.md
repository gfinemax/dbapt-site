# Daebang Business Status Plan

## Scope

Implement the approved B option plus the follow-up user-approved presentation revision: public menu `사업현황`, `/business` route, PDF-grounded business status content, and a `조합소개`-style one-page scroll layout.

## Tasks

1. Add failing tests for the landing business entry and the `/business` page content.
2. Restore the staged `/business` page structure and replace unsupported claims with figures visible in the 2025-09-06 briefing PDF.
3. Update the business navigation to one-page anchors for `현황요약`, `조감도·배치도`, `세대계획`, and `추진절차`.
4. Match the `조합소개` page rhythm: hero typography, sticky scroll-spy subnav, large section spacing, stone cards, and mobile-friendly content.
5. Keep the page public-only and avoid login-gated service claims or private data.
6. Run focused tests, full lint/test/build, browser desktop/mobile checks, and the dbapt-site UI review gate.
