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

---

# Request Summary - Continuous Mobile PDF Viewer

- Requested feature slice: 모바일과 카카오톡 인앱 브라우저에서 PDF를 다운로드하지 않고 연속 스크롤, 손가락 확대·축소, 페이지 빠른 이동으로 열람한다.
- Explicitly excluded scope: 문서 권한·저장소·감사 정책 변경, 비 PDF 형식 변환, 브라우저 네이티브 PDF 다운로드 동작 호출.
- Candidate governing specification: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Unanswered decision: none. 사용자가 브라우저 기본 PDF 뷰어와 유사한 사용성을 사이트 내부 PDF.js 뷰어로 구현하도록 승인했다.

---

# Request Summary - PDF Viewer Entry Correction

- Reported issue: 연속 PDF 렌더링은 반영됐지만 기존 문서 정보 카드가 기본 화면으로 남아 사용성이 이전과 같았다.
- Corrected behavior: PDF 문서는 문서 정보 카드 없이 PDF 전용 전체 화면으로 바로 열고, 사용자가 선택할 때만 문서 정보를 표시한다.
- Download boundary: PDF 전용 화면의 다운로드 버튼을 선택한 뒤 확인할 때만 다운로드한다.

---

# Request Summary - Unbounded PDF Pinch Zoom

- Requested feature slice: 모바일 PDF의 두 손가락 확대에서 250% 상한을 제거하고 반복 제스처로 계속 확대할 수 있게 한다.
- Safety boundary: 표시 배율은 계속 증가시키되 캔버스 내부 렌더링 해상도는 휴대폰 메모리 보호를 위해 제한한다.

---

# Request Summary - Smooth PDF Pinch Zoom

- Reported issue: 두 손가락을 움직일 때마다 PDF 캔버스를 다시 렌더링해 확대 화면이 떨렸다.
- Corrected behavior: 제스처 중에는 프레임 단위 화면 확대와 중심점 보정만 수행하고, 손을 뗄 때 한 번만 선명도를 다시 렌더링한다.

---

# Request Summary - Smooth PDF Quality Refresh

- Reported issue: 손을 뗀 뒤 고해상도 캔버스로 교체되는 순간에도 화면이 번쩍이거나 끊겨 보일 수 있었다.
- Corrected behavior: 기존 캔버스를 유지한 채 보이지 않는 보조 캔버스에서 고해상도 렌더링을 끝낸 후 180ms 교차 전환한다.

---

# Request Summary - Immersive Mobile PDF Controls

- Requested feature slice: 세로·가로 PDF 열람에서 상단 문서 정보와 페이지 도구를 자동으로 감추고, 화면 탭으로 다시 표시하며, 특히 가로 화면에서 전체화면을 지원한다.
- Explicitly excluded scope: 문서 권한·저장·다운로드 확인 정책 변경, 카카오톡 자체 브라우저 UI의 강제 제어.
- Approved behavior: Fullscreen API를 우선 사용하고 차단되는 인앱 브라우저에서는 페이지 내부 몰입 모드로 대체한다.

---

# Request Summary - Persistent Landscape Reading Mode

- Requested feature slice: 가로 열람 중 일반 상단 메뉴가 다시 나타나지 않게 유지하고, 사용을 마치면 명확한 종료 동작으로 기존 메뉴를 복원한다.
- Safety behavior: 항상 보이는 `× 열람 종료`, 최초 2.4초 안내, 안드로이드 뒤로가기 우선 종료, 세로 회전 자동 복원을 제공한다.
- Explicitly excluded scope: 카카오톡 자체 주소창 강제 제어, 문서·다운로드 권한 변경.
