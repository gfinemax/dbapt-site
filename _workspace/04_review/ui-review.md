# UI Review

## Reviewed Change
- Feature: Google OAuth WebView 차단 안내 및 외부 브라우저 로그인 버튼
- Governing spec: 직접 사용자 버그 리포트 및 Google OAuth `disallowed_useragent` 정책
- Implementation plan: inline bugfix; 별도 계획 문서 없음
- Files or pages reviewed:
  - `src/app/login/login-client.tsx`
  - `src/__tests__/portal-preview-pages.test.tsx`
  - `/login`

## Boundary Review
- Finding: PASS
- Evidence: 기존 계정 로그인, Google OAuth route, callback, 권한 부여 정책은 변경하지 않았다. 변경은 로그인 화면에서 내장 브라우저 감지 시 OAuth 시작 URL을 외부 브라우저로 유도하는 UI와 가입 신청 submit 처리에 한정된다.

## Truthful Presentation Review
- Finding: PASS
- Evidence: 안내 문구는 Google 로그인이 앱 안 브라우저에서 차단될 수 있다고 설명하며, 자동 승인이나 앱 설정 변경을 암시하지 않는다. iOS 계열처럼 웹 페이지에서 외부 브라우저 실행을 강제하기 어려운 경우는 Safari 또는 Chrome으로 열어 다시 시도하라고 안내한다.

## Design And Accessibility Review
- Finding: PASS
- Evidence: 기존 로그인 카드 안의 pill 버튼, warm recessed panel, `role="alert"` 안내 패턴을 사용했다. 버튼 접근성 이름은 내장 브라우저에서 `외부 브라우저에서 Google 로그인`으로 바뀌며, 일반 브라우저에서는 기존 `Google 계정으로 계속하기` 문구를 유지한다. 자동 테스트로 Android WebView user-agent에서 안내 문구와 `intent://` 링크가 렌더링됨을 확인했다. Codex in-app Browser는 세션에서 `iab`가 unavailable이라 실제 시각 브라우저 검증은 수행하지 못했다.

## Outcome
- Result: PASS
- Required action: none
