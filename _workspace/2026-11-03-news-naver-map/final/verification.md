# Verification

## Implemented

- 네이버 자동차 길찾기 URL에서 목적지명·장소 ID를 검증해 추출한다.
- URL 내부 축약 좌표는 사용하지 않고 지도 클릭 또는 위도·경도 입력으로 위치를 확인한다.
- 공지사항과 자유게시판의 등록·수정 API에 구조화된 지도 필드를 저장한다.
- 두 게시판 열람 화면에 반응형 네이버 지도, 마커, 원본 길찾기 링크를 표시한다.
- 지도 SDK 로딩 실패 시 장소 정보와 외부 길찾기 링크를 유지한다.
- 게시판 간 관리자 복사 시 지도 메타데이터도 보존한다.
- 기존 조합소개 네이버 지도는 공용 SDK 로더를 재사용하도록 정리했다.

## Checks

- Focused map and regression tests: `6 files passed`, `27 tests passed`
- Lint: `pnpm lint` passed with no warnings
- Full test suite: `111 files passed`, `702 tests passed`
- Production build: `pnpm build` passed
- Prisma schema: `pnpm exec prisma validate` passed
- Diff hygiene: `git diff --check` passed (line-ending conversion warnings only)
- Environment contract: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is configured in the local `.env`
- UI review: `FIX` because desktop/mobile browser rendering could not be completed

## Unresolved Risks

- Codex browser access host was unavailable. The Windows browser fallback stopped because it could not determine the current URL with enough confidence. Desktop and mobile visual verification remains outstanding.
- No production migration or deployment was executed.
- Because the required UI review did not reach `PASS`, this task was not committed or pushed.
