# Spec 선택

- 선택한 승인 spec: 직접 사용자 버그 리포트(`스마트폰에서 구글로그인시에 오류`)를 긴급 수정 범위로 적용.
- 구현 경계:
  - 기존 `/api/auth/google` 서버 OAuth 흐름과 callback 처리는 변경하지 않는다.
  - 내장 브라우저에서 Google OAuth로 바로 진입해 `disallowed_useragent`가 발생하는 사용자 경험만 완화한다.
  - Android WebView 계열은 Chrome intent URL로 OAuth 시작 요청을 외부 브라우저에서 새로 시작한다.
  - 가입 신청 폼의 `signupName`, `signupPhone`, `signupMemo` 쿼리도 외부 브라우저 OAuth 시작 URL에 유지한다.
  - 일반 데스크톱/모바일 브라우저에서는 기존 Google 로그인 링크와 가입 신청 제출 흐름을 유지한다.
- 요청/spec 충돌: none
- 계획 진행 가능 여부: 가능
