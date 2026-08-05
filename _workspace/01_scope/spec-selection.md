# Specification Selection

- Selected approved specs:
  - `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
  - `docs/superpowers/specs/2026-06-14-personal-library-curated-documents-design.md`
- Implementation boundary: 로그인 사용자의 개인 문서 저장은 공개 범위·승인 상태·감사 이력을 변경하지 않는다. 관리자는 기존 전체 문서 관리표를 유지하고, 조합원·환불 사용자는 승인된 문서의 추천 및 개인 저장 화면을 유지한다.
- Approved extension: 관리자의 전체 문서 관리표에도 동일한 사용자별 문서 즐겨찾기를 제공하고 관리 검색·필터·페이지 구분을 보강한다.
- Conflicts: none. 사용자별 즐겨찾기는 전역 중요 표시와 분리한다.
- Planning may continue: yes.

---

# Specification Selection - KakaoTalk PDF Online Viewer

- Selected approved specs:
  - `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
  - `docs/superpowers/plans/2026-06-25-free-board-public-share.md`
- Implementation boundary: 공개 공유가 허용된 자유게시판 글만 비로그인 첨부 열람을 허용하고, 나머지 글은 기존 세션 경계를 유지한다. PDF는 사이트 전용 온라인 뷰어에서 제공하며 원본 다운로드는 별도 동작으로 유지한다.
- Approved extension: 사용자가 2026-08-05 PDF.js 기반 페이지별 모바일 열람 방향을 검토한 뒤 구현을 승인했다.
- Conflicts: none.
- Planning may continue: yes.

---

# Specification Selection - Document PDF Online Viewer

- Selected approved spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`
- Implementation boundary: 세션 권한을 검증하는 비공개 문서 스트리밍 API와 VIEW/DOWNLOAD 감사 기록을 유지하면서 전체 화면 PDF 열람 및 PDF만 크게 보기를 제공한다.
- Conflicts: none.
- Planning may continue: yes.

---

# Specification Selection - Continuous Mobile PDF Viewer

- Selected approved spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation boundary: 기존 보호된 PDF 보기 URL과 다운로드 확인 흐름을 유지하며, 공통 캔버스 뷰어의 표시·탐색 기능만 확장한다.
- Approved extension: 모든 페이지 연속 스크롤, 화면 주변 지연 렌더링, 두 손가락 확대·축소, 페이지 번호 직접 이동.
- Conflicts: none.
- Planning may continue: yes.
