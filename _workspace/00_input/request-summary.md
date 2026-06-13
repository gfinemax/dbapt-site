# 요청 요약

- 요청 기능: 스마트폰에서 Google 로그인 시 `403 disallowed_useragent` 오류가 발생하는 문제를 완화한다.
- 증상: Google OAuth 승인 화면이 앱 내장 브라우저/WebView에서 열리며 Google의 보안 브라우저 정책에 의해 차단된다.
- 구현 범위: 로그인 화면에서 내장 브라우저 계열 user-agent를 감지하고, Android에서는 외부 Chrome intent로 `/api/auth/google` OAuth 시작 URL을 다시 열도록 안내/버튼을 제공한다.
- 제외 범위: Google OAuth client 설정 변경, 모바일 앱 WebView 설정 변경, 카카오/오픈채팅 자동화, 인증 권한 정책 변경.
- 적용 기준: 직접 사용자 버그 리포트 및 Google OAuth `disallowed_useragent` 정책.
- 미결정 사항: iOS 앱 내장 브라우저는 웹 페이지가 Safari를 강제 실행할 수 없어 안내 문구와 새 창 시도만 제공한다.
