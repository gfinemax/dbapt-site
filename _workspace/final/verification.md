# Verification

## Implemented Feature

- 랜딩 홈의 공지 카드 제목을 `공지사항 및 조합원 게시글`로 변경했다.
- 카드 제목 위 `조합소식` eyebrow를 일관성 유지 목적으로 표시한다.
- 홈 서버에서 최신 공식 공지 2건과 자유게시판 글 1건을 조회한 뒤 중요 표시와 작성일 기준으로 최대 3건을 표시한다.
- 각 항목에 `공지` 또는 `게시글` 라벨을 붙이고, 공지는 `/news?tab=notice`, 게시글은 `/news?tab=free&post=<id>`로 연결한다.
- 하드코딩된 목업 공지 배열은 제거된 상태를 유지했다.

## Changed Files

- `src/app/page.tsx`
- `src/components/landing/home-client.tsx`
- `src/components/landing/notices-section.tsx`
- `src/content/landing.ts`
- `src/__tests__/landing-page.test.tsx`
- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`

## Checks Run

- `pnpm test -- src/__tests__/landing-page.test.tsx -t "combines public notices"`: passed, 1 test
- `pnpm test -- src/__tests__/landing-page.test.tsx`: passed, 15 tests
- `pnpm lint`: passed
- `pnpm test`: passed, 42 files / 281 tests
- `pnpm build`: passed
- `git diff --check`: passed with CRLF conversion warnings only

## Browser Checks

- Dev server: `http://127.0.0.1:3000/` ready.
- Codex in-app browser: unavailable (`iab` browser session not available).
- HTTP check: `/` returned 200, `조합소식` and `공지사항 및 조합원 게시글` were present, old mock notice text was absent.
- Chrome headless screenshots: desktop and mobile captures generated under `.next-dev-logs/`.
- CDP DOM measurement: desktop `innerWidth=1366`, `scrollWidth=1366`; mobile `innerWidth=432`, `scrollWidth=432`; notice card eyebrow `조합소식` and heading `공지사항 및 조합원 게시글` present.

## Unresolved Risks Or Follow-Up Specs

- none
