# UI Review

## Reviewed Change
- Feature: 랜딩 홈 공지 카드에 조합소식 라벨과 공지사항 및 조합원 게시글 통합 표시
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-25-daebang-landing-page.md`
- Files or pages reviewed: `src/app/page.tsx`, `src/components/landing/home-client.tsx`, `src/components/landing/notices-section.tsx`, `src/content/landing.ts`, `/`

## Boundary Review
- Finding: PASS
- Evidence: 변경은 공개 랜딩 홈의 요약 카드에 제목과 링크만 표시하는 범위에 한정된다. 비로그인 작성, 자유게시판 작성/댓글 흐름, 관리자 권한 정책은 변경하지 않았다.

## Truthful Presentation Review
- Finding: PASS
- Evidence: 홈 카드는 상위 라벨 `조합소식`과 제목 `공지사항 및 조합원 게시글`로 범위를 명시하고, 각 행에 `공지` 또는 `게시글` 라벨을 붙인다. 게시글은 제목 링크만 노출하고 `/news?tab=free&post=...`로 이동한다.

## Design And Accessibility Review
- Finding: PASS
- Evidence: 기존 카드 구조, 오렌지 eyebrow, warm canvas, stone border, pill/link 스타일을 유지했다. 카드에는 `aria-labelledby` region을 추가했고, desktop/mobile DOM 측정에서 수평 오버플로우가 없었다.

## Outcome
- Result: PASS
- Required action: none
