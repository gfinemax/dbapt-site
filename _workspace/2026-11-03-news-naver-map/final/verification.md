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
- Production migration: `pnpm exec prisma migrate deploy` applied `20261103013000_add_news_naver_map_fields`; a follow-up `pnpm exec prisma migrate status` reported `Database schema is up to date!`
- Git publication: commit `ca4ce5b1f4f15f3bc20475ebda0f5e8fe66aa4c0` is on `origin/main`
- Vercel deployment: production deployment `dpl_DS1QW3KHMrx7c7s9GXbPEr7obs6v` for the same commit is `READY` with alias `dbapt-site.vercel.app`
- Production HTTP checks: `/news`, `/news?tab=notice`, and `/news?tab=free` returned HTTP 200
- Production API check: `/api/news?category=NOTICE` returned HTTP 200 and exposed all five structured Naver map fields; unauthenticated `/api/news/free` returned the expected HTTP 401
- Browser layout checks: production notice desktop at 1440px and free-board mobile at 390px rendered without visible layout breakage; the mobile login gate appeared normally
- UI review: `FIX` because the authenticated editor and a post containing map data were not available for feature-specific live rendering

## Unresolved Risks

- The Vercel connection can read deployment status but returned 403 for project environment-variable inventory and protected URL fetch. Production presence of `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` was therefore not independently enumerated.
- No production test post was created. Authenticated registration/editing and the actual Naver SDK map card remain visually unverified on desktop and mobile.
- The UI review remains `FIX` until that feature-specific live check is completed; database migration, Git publication, deployment readiness, public page responses, and the public notice API contract are verified separately above.
