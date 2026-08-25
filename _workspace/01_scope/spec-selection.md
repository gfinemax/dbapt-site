# Specification Selection

- Selected approved specs:
  - `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`
  - `docs/superpowers/specs/2026-06-14-personal-library-curated-documents-design.md`
- Implementation boundary: 로그인 사용자의 개인 문서 저장은 공개 범위·승인 상태·감사 이력을 변경하지 않는다. 관리자는 기존 전체 문서 관리표를 유지하고, 조합원·환불 사용자는 승인된 문서의 추천 및 개인 저장 화면을 유지한다.
- Approved extension: 관리자의 전체 문서 관리표에도 동일한 사용자별 문서 즐겨찾기를 제공하고 관리 검색·필터·페이지 구분을 보강한다.
- Conflicts: none. 사용자별 즐겨찾기는 전역 중요 표시와 분리한다.
- Planning may continue: yes.

---

# Specification Selection - News Editor Typography Consistency

- Selected approved spec: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Implementation boundary: 기존 HTML 저장/API 계약과 게시판 권한을 유지하면서 공용 편집기·sanitizer·조회 fallback만 확장한다.
- Conflicts: none.
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

---

# Specification Selection - Immersive Mobile PDF Controls

- Selected approved spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation boundary: 기존 보호된 보기 URL과 다운로드 확인 흐름을 유지하고 PDF 열람 화면의 컨트롤 배치·자동 숨김·전체화면 진입만 확장한다.
- Approved extension: 세로·가로 공통 오버레이 컨트롤, 1.8초 자동 숨김, 탭 재표시, Fullscreen API와 인페이지 대체 모드.
- Conflicts: none.
- Planning may continue: yes.

---

# Specification Selection - Persistent Landscape Reading Mode

- Selected approved spec: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Implementation boundary: 자유게시판 PDF 전용 화면과 공통 PDF 컨트롤의 가로 표시 상태만 변경하며 보기·다운로드 API는 유지한다.
- Approved extension: 가로에서 문서 정보와 PDF 도구를 잠그고 종료 버튼, 최초 안내, history 기반 뒤로가기 복원, 세로 회전 복원을 제공한다.
- Conflicts: none.
- Planning may continue: yes.
## 2026-08-13 editor numeric control visibility follow-up

- Selected approved spec: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Boundary: correct only numeric control sizing/native chrome and responsive wrapping.
- Conflicts: none.
- Planning may continue: yes, under the existing approved implementation plan.
## 2026-08-14 Google Docs-style compact toolbar follow-up

- Selected approved spec: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Boundary: correct numeric-entry interaction and compact the existing toolbar without adding new document capabilities.
- Conflicts: none.
- Planning may continue: yes, under the existing approved implementation plan.
## 2026-08-14 paragraph indent and line-height buttons follow-up

- Selected approved spec: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Boundary: extend existing paragraph formatting and toolbar usability only.
- Conflicts: none.
- Planning may continue: yes, under the existing approved implementation plan.
## 2026-08-14 matching font-size stepper and line-height label follow-up

- Selected approved spec: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Boundary: visual and interaction consistency of existing typography controls only.
- Conflicts: none.
- Planning may continue: yes, under the existing approved implementation plan.
# Specification Selection: Kakao Social Preview Cache Refresh

- Selected approved basis: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md` (approved social-preview design decisions and Task 8 cache-safety requirement).
- Implementation boundary: Preserve the existing 1200 x 628 cropped PNG and `socialImagePath` priority; version only generated short share URLs when a custom social image exists; keep legacy short URLs parseable; declare the actual 1200 x 628 Open Graph dimensions.
- Conflicts between request and approved basis: none.
- Planning may continue: yes. The current user explicitly approved implementation of the diagnosed cache issue, and this is a corrective follow-up within the existing approved plan rather than new product scope.

# Specification Selection: Kakao 800 x 400 Safe-Area Preview

- Selected approved basis: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md` plus the user's explicit approval to adopt the diagnosed Kakao-specific 800 x 400 output.
- Implementation boundary: Preserve existing social preview URLs and legacy 1200 x 628 metadata; generate only newly confirmed crops as 800 x 400 JPEGs; declare new dimensions from the new filename marker; update the crop frame to 2:1 with an inset safe-area guide.
- Conflicts between request and approved basis: The original generic Open Graph 1.91:1 decision is superseded only for newly generated Kakao-specific images. Existing stored images remain compatible.
- Planning may continue: yes.

# Specification Selection: Full-Width Notice Reader

- Selected approved basis: the user's explicit approval of a full-screen notice reading layer, extending the notice readability decisions in `docs/superpowers/plans/2026-07-10-notice-detail-mobile-readability.md`.
- Implementation boundary: Change only notice detail presentation in `NewsClient` and the standalone `NoticeBoard` fallback; preserve all actions, access rules, data flows, and other news detail surfaces.
- Conflicts: none.
- Planning may continue: yes.

# Specification Selection: Full-Width Free-Board Reader

- Selected approved basis: the user's explicit request to reuse the implemented notice full-screen reader pattern, governed by `docs/superpowers/plans/2026-08-21-notice-fullscreen-reader.md` and the free-board reading decisions in `docs/superpowers/plans/2026-07-02-free-board-side-edit.md`.
- Implementation boundary: Change only the selected free-board post reading shell; preserve its existing state, actions, permissions, public-share behavior, and the narrow edit form. Keep new-post creation as its current right-side drawer.
- Conflicts: none.
- Planning may continue: yes.

# Specification Selection: Live Contribution Ledger Integration

- Selected approved basis: `docs/superpowers/plans/2026-06-14-contribution-dashboard-mvp.md`의 ERP adapter 및 개인별 대시보드 구조와 사용자의 명시적 실연동 요청.
- Implementation boundary: 기존 로그인·역할·개인자료실 UI를 유지하고 서버 측 읽기 전용 연동만 활성화한다. 회계 원본 거래와 조합원 귀속은 변경하지 않는다.
- Approved extension: 회계 `member_id` 고정 연결, 실시간 합산 납부액·단계·최근 원장 반영, 84㎡ 신청평형 표시, 환불조합원 평형 비노출.
- Conflicts: none.
- Planning may continue: yes.
# 2026-08-23 Spec Selection

- Selected approved spec: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`.
- Implementation boundary: Logged-in member contribution presentation only; preserve current approved ledger data, API, access controls, and pending-state truthfulness.
- Conflict: The original spec permits planned amount, unpaid amount, and progress when data exists. The user's later explicit direction supersedes that visible presentation only; compatibility fields remain in the view model and API.
- Planning may continue: yes. The user selected visual option 1 and explicitly requested implementation.

# 2026-08-23 Member Service Full-Screen Navigation

- Selected approved spec: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`.
- Implementation boundary: authenticated personal-service presentation only; preserve stored role values and existing protected data/destinations.
- Conflicts: none.
- Planning may continue: yes.

## Home Action Follow-up

- Boundary: interaction repair only; use the existing `close-portal` contract and preserve all access/data behavior.
- Conflicts: none.

## Precise Sidebar Navigation Follow-up

- Selected approved basis: the existing member-service full-screen navigation plan plus the user's explicit request for precise, working section navigation.
- Implementation boundary: authenticated member-service navigation and focus targets only; reuse the existing contribution, personal-curation, library, notice, and free-board surfaces.
- Conflicts: none. Stored roles, data, bookmarks, and route permissions remain unchanged.
- Planning may continue: yes.

## Member-Service Interaction Containment Follow-up

- Selected approved basis: `docs/superpowers/plans/2026-08-23-member-service-fullscreen-navigation.md` plus the user's explicit defect report.
- Implementation boundary: event containment, stacking order, and shortcut transition behavior across existing personal-service hosts only.
- Conflicts: none. Explicit home/close actions and all stored data/access behavior remain unchanged.
- Planning may continue: yes.

## Sidebar-Controlled Payment Ledger Disclosure Follow-up

- Selected approved basis: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`, the existing collapsible ledger behavior, and `docs/superpowers/plans/2026-08-23-member-service-fullscreen-navigation.md`.
- Implementation boundary: coordinate only the authenticated sidebar section selection with the existing native payment-ledger disclosure; preserve all stored values, access rules, API contracts, and manual disclosure controls.
- Conflicts: none.
- Planning may continue: yes. The user explicitly requested implementation.

## Member Personal Information Management

- Selected spec: `docs/superpowers/specs/2026-08-23-member-personal-information-management-design.md`.
- Implementation boundary: users view their own masked profile, submit corrections, and view history; administrators approve/reject and record PeopleON reflection.
- Existing-spec conflict: the 2026-06-17 PeopleON MVP excludes writes, so this implementation preserves read-only integration and records manual reflection only.
- Planning may continue: yes. The user approved the plan and requested implementation.

### Five-card Information Home Follow-up

- Selected basis: the approved personal-information spec plus its `1차 정보 홈 후속 승인 범위` section.
- Boundary: presentation and truthful summary data only; reuse existing mutation and audit contracts without schema changes.
- Conflicts: none.
- Planning may continue: yes. The user explicitly requested implementation of the selected first composition.

### PeopleON Profile Read Follow-up

- Selected contract: authenticated `GET /api/integrations/ledger/members`, narrowed in dbapt-site by the saved PeopleON identifier.
- Identity boundary: prefer exact `peopleon_id`; accept legacy `member_id` only when exactly one row matches. Names are display values, never identity keys.
- Presentation boundary: mask phone, address, birth date, account, and certificate number before returning them to the browser.
- Failure boundary: retain current website values and show a temporary connection-check state without failing the member portal.

### Simplified Six-Digit Signup

- Selected basis: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Boundary: Keep the existing phone-password signup and pending approval flow; simplify only its visible form and align signup/password-change validation to the user-approved numeric six-digit rule.
- Conflict resolution: Update the operations manual from the previous eight-character rule to the newly approved six-digit rule.
- Planning may continue: yes, based on the user's explicit clarification.

### Mobile-First Login And Signup Layout

- Selected basis: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`.
- Boundary: Reorder and compact only the `/login` presentation while preserving all existing authentication and signup contracts.
- Conflicts: none.
- Planning may continue: yes; the request approves responsive layout implementation.

---

# 2026-08-25 Admin Member Composition Donut

- Selected approved spec: `docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`
- Implementation boundary: 관리자 전용 화면에서 홈페이지 계정 상태를 읽기 전용으로 요약하고 기존 PeopleOn 조합원 관리 페이지로 이동하는 링크를 제공한다. PeopleOn 데이터 쓰기와 공개 UI 노출은 제외한다.
- Conflicts: none.
- Planning may continue: yes. 사용자가 가입자 구성 원형 차트 계획을 승인했다.

## 2026-08-25 Denominator Correction

- Governing spec remains `docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`.
- Boundary: 기존 read-only PeopleOn 원장 통계를 관리자 홈에 재사용해 같은 자격끼리만 비교한다.
- Conflicts: none.
- Planning may continue: yes. 사용자가 잘못된 구성비를 구체적으로 지적하고 올바른 분모를 제시했다.
