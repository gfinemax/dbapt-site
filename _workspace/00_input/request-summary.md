# Request Summary

- Requested feature slice: 운영자 전체 등록 문서 목록에 개인 즐겨찾기, 명확한 중요 표시, 검색·상태 필터와 페이지 구분을 추가하고 조합원 개인자료실의 보관 데이터 연결과 명칭을 일관되게 정리한다.
- Explicitly excluded scope: 공개 권한 정책 변경, 문서 스키마 변경, 새 문서 승인 절차, 감사 로그 정책 변경.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, `docs/superpowers/specs/2026-06-14-personal-library-curated-documents-design.md`.
- Unanswered decision: none. 사용자가 2026-07-22 개선 방향 전체 구현을 승인했다.

---

# Request Summary - KakaoTalk PDF Online Viewer

- Requested feature slice: 카카오톡으로 공유된 자유게시판 글의 PDF 첨부를 다운로드로 이탈하지 않고 홈페이지에서 바로 열람할 수 있게 한다.
- Explicitly excluded scope: 카카오 SDK 도입, 자동 메시지 발송, 비공개 게시글 공개, PDF 이외 문서 형식의 온라인 변환.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, `docs/superpowers/plans/2026-06-25-free-board-public-share.md`.
- Unanswered decision: none. 사용자가 2026-08-05 제안한 보기·다운로드 분리와 PDF.js 기반 개선 방향의 구현을 승인했다.

---

# Request Summary - Document PDF Online Viewer

- Requested feature slice: 카카오톡 인앱 브라우저에서 대용량 PDF를 자동 다운로드하지 않고 즉시 온라인 열람하며, 명시적으로 다운로드를 선택한 경우에만 확인 후 다운로드한다.
- Explicitly excluded scope: DB, 문서 저장 정책, 권한 정책, 감사 로그 정책 변경.
- Candidate governing specification: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Unanswered decision: none.
