# Verification

- Implemented: 공개 아이디 찾기·비밀번호 재설정 요청, ADMIN 전용 처리 목록, 사무국 전용폰·관리자 개인폰 선택, 친절한 문자 안내문, 휴대전화 문자 앱 연결, 12시간 단일 사용 링크, 만료 후 재요청, 세션 무효화, 감사 시각·담당자 기록.
- Security boundaries: 기존 비밀번호는 조회·노출하지 않는다. 원문 재설정 토큰과 관리자 개인 휴대전화 번호는 저장하지 않는다. 공개 요청 응답은 계정 존재 여부와 무관하게 동일하다.
- Database: `20260924090000_add_account_recovery` migration applied; `pnpm exec prisma migrate status` reports 40 migrations and an up-to-date schema.
- Focused tests: PASS, 5 files / 29 tests.
- Lint: PASS.
- Full tests: PASS, 110 files / 696 tests.
- Production build: PASS; `/account-recovery`, `/reset-password/[token]`, `/portal/admin/account-recovery` routes included.
- Browser: PASS on local Codex Chrome desktop and 390x844 mobile. Login recovery links, public request form, invalid-link guidance, mobile bottom navigation, unauthenticated admin redirect, and zero console errors were observed.
- External boundary: 실제 ADMIN 계정으로 개인 또는 사무국 휴대전화의 문자 앱을 열고 문자를 전송하는 행위는 실사용 번호 공개와 외부 발송이 발생하므로 자동 실행하지 않았다. 사이트는 자동 문자 발송 성공을 주장하지 않는다.
