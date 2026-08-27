# Verification

- Implemented: 가입 승인 대기 표의 네 자격 선택 및 저장, 확인 필요/홈페이지 관리 회원 탭, 각 명단 검색과 20명 단위 페이지 이동.
- Changed product files: `src/components/portal/portal-shell.tsx`, `src/components/portal/approved-member-conversion-panel.tsx`, `src/components/portal/member-management-dashboard.tsx`.
- Focused tests: PASS, member management 6 tests.
- Lint: PASS.
- Full tests: PASS, 106 files / 680 tests.
- Build: PASS.
- Browser: PASS on production `/portal/admin/members`; confirmation list 18 pages, homepage list 3 pages, search result 49명 중 1명, mobile no document overflow, no console errors.
- Deployment: PASS, Vercel production deployment `dpl_3A4b3MHSDQkADJbgLRmyPYst23it` Ready and aliased to `dbapt-site.vercel.app`.
- Unresolved risk: none.
