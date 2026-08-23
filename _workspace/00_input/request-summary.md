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

# Current Request: Member Personal Information Management

- Requested feature slice: authenticated members can request changes to personal information, retain dated before/after history and notes, and track homepage and PeopleON reflection separately.
- Included: profile display, field-specific requests, administrator approval/rejection, immutable events, masking, manual PeopleON reflection tracking, and responsive UI.
- Excluded: resident-registration-number storage, name-based external matching, unverified immediate phone changes, and unsupported PeopleON writes.
- Governing specification: `docs/superpowers/specs/2026-08-23-member-personal-information-management-design.md`.
- Unanswered decision: none; manual PeopleON reflection is the approved fallback.

## Follow-up: Five-card Information Home

- Requested feature slice: replace the burdensome all-fields edit grid with five calm summary cards for member, housing, contact, documents/applications, and security information.
- Preserve: existing correction persistence, approval/history, PeopleON manual reflection, payment dashboard, navigation, and refund-member unit privacy.
- Excluded: fabricated member numbers, contract/certificate data, device management, or direct contact mutation without verification.
- Unanswered decision: none; the user explicitly selected the original five-card proposal as the first composition.

# 2026-08-23 Member Service Full-Screen Navigation

- Requested feature slice: remove excess personal-service space, use member/refund-member labels, repair the populated shortcut destinations, remove the customer-center card, and add a full-screen home action.
- Explicitly excluded scope: authentication, role-code migration, new private data, and public exposure.
- Candidate governing specification: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`.
- Unanswered decision: none.

## Home Action Follow-up

- Requested fix: make the visible `홈으로` action actually close the full-screen member service when it is already open over `/`.
- Preserve: current authenticated content, shortcut destinations, role labels, and responsive layout.

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

---

# Request Summary - News Editor Typography Consistency

- Requested feature slice: 공지사항·자유게시판 공용 편집기를 1px 글자 크기, 명시적인 줄간격, 문단 간격을 제공하는 사용자 편의형 작성 도구로 개선한다.
- Explicitly excluded scope: DB/API 변경, 협업 편집, 자동 저장, 기존 게시글 일괄 재작성.
- Candidate governing specification: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Unanswered decision: none. 사용자가 제안 계획과 기본값 14px/1.6/12px 구현을 승인했다.
## 2026-08-13 editor numeric control visibility follow-up

- Requested feature slice: prevent the font-size and line-height values from being covered by native number/datalist controls.
- Explicitly excluded scope: typography storage rules and editor command behavior remain unchanged.
- Candidate governing specification: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Unanswered decision: none.
## 2026-08-14 Google Docs-style compact toolbar follow-up

- Requested feature slice: allow freely typed line-height values and reorganize the editor toolbar into compact Google Docs-inspired groups.
- Explicitly excluded scope: editor persistence format, image/YouTube behavior, and new document features.
- Candidate governing specification: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Unanswered decision: none.
## 2026-08-14 paragraph indent and line-height buttons follow-up

- Requested feature slice: make indent/outdent work for ordinary paragraphs and add minus/plus line-height controls while retaining direct entry.
- Explicitly excluded scope: new editor document types or persistence changes outside sanitized HTML attributes.
- Candidate governing specification: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Unanswered decision: none.
## 2026-08-14 matching font-size stepper and line-height label follow-up

- Requested feature slice: use the same vertical arrows for font size and line height, rename `줄` to `줄간격`, and normalize toolbar label typography.
- Explicitly excluded scope: formatting behavior and stored HTML.
- Candidate governing specification: `docs/superpowers/specs/2026-08-13-news-editor-typography-consistency-design.md`.
- Unanswered decision: none.
# Current Request: Kakao Social Preview Cache Refresh

- Requested feature slice: Fix notice Kakao preview links so a newly cropped 1.91:1 social image is fetched instead of a previously cached card image, and align Open Graph dimensions with the generated 1200 x 628 PNG.
- Explicitly excluded scope: Kakao SDK integration, automatic Kakao posting, cropper layout redesign, storage schema changes, and changes to notice visibility or permissions.
- Candidate governing specification: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md`, especially Task 8 (Upload Naming And Kakao Cache Safety).
- Unanswered decision: none.

# Current Request: Kakao 800 x 400 Safe-Area Preview

- Requested feature slice: Generate newly cropped Kakao preview images as 800 x 400 (2:1) JPEGs and show a safe-area guide so important text stays away from Kakao thumbnail edges.
- Explicitly excluded scope: Reprocessing existing stored images, changing notice content or permissions, Kakao SDK integration, and automatic Kakao posting.
- Candidate governing specification: `docs/superpowers/plans/2026-07-05-social-preview-cropper.md`, with the user-approved Kakao-specific output follow-up below.
- Unanswered decision: none.

# Current Request: Full-Width Notice Reader

- Requested feature slice: Replace the left-side notice detail drawer with a full-screen reading layer so long notices and large evidence images use the available viewport width.
- Preserve: close behavior, list position, shared-link opening, sharing, editing, deletion, attachments, comments, and existing notice permissions.
- Explicitly excluded scope: notice data/API changes, editor behavior changes, and newsletter/free-board detail layout changes.
- Candidate governing plan: `docs/superpowers/plans/2026-08-21-notice-fullscreen-reader.md`.
- Unanswered decision: none. The user explicitly approved implementation after selecting the full-screen reading direction.

# Current Request: Full-Width Free-Board Reader

- Requested feature slice: Apply the same full-screen reading experience used by notices to free-board post details.
- Preserve: post deep links, list state, public read-only sharing, close behavior, bookmarks, sharing, editing, deletion, attachments, comments, replies, reactions, and permissions.
- Explicitly excluded scope: new-post writing layout, stored post data/API changes, and notice/newsletter/development-log layouts.
- Candidate governing plan: `docs/superpowers/plans/2026-08-22-free-board-fullscreen-reader.md`.
- Unanswered decision: none. The user explicitly requested implementation using the notice reader as the reference.

# Current Request: Live Contribution Ledger Integration

- Requested feature slice: 로그인 조합원의 `내 분담금 현황`을 dbapt-ledger의 확정 납부 원장과 서버 간 연동하고 신청평형을 표시한다.
- Required exception: 환불조합원 화면과 저장 프로필에는 신청평형을 노출하지 않는다.
- Identity boundary: 이름 자동 병합은 금지하고, 최초 검증 전화번호 단일 일치 후 회계 `member_id`를 `externalMemberId`로 고정한다.
- Security boundary: 로그인 사용자 본인 화면에서만 표시하며, 회계 연동 API는 전용 Bearer 키와 HTTPS를 요구한다.
- Unanswered decision: none.

## 2026-08-23 Collapsible Ledger Follow-up

- Requested feature slice: 최근 납부 원장을 기본 접힘 상태의 거래내역으로 바꾸고 전체 내역을 필요할 때 펼쳐 본다.
- Terminology: 거래별 `ERP 반영` 표기를 `회계원장 반영`으로 교체한다.
- Preserve: 실제 회계 원장 값, 신청평형, 납부 단계, 역할·로그인 경계와 반응형 카드 디자인.

# Current Request: Precise Member-Service Sidebar Navigation

- Requested feature slice: Make each left-sidebar action visibly and functionally distinct inside the full-screen member service.
- Required internal destinations: `내정보` to the contribution overview, `납부내역` to the actual ledger table, and a new `개인자료` item to the personal curation section.
- Required external destinations: `서류발급`, `공지사항`, and `문의하기` must close the full-screen service and open their existing populated pages.
- Preserve: existing authenticated access, contribution data, bookmark behavior, role labels, and public route permissions.
- Unanswered decision: none.

# Current Request: Prevent Member-Service Home Bounce

- Requested feature slice: Stop `내 즐겨찾기` and other member-service interactions from closing the full-screen service or exposing the home page unexpectedly.
- Required interaction boundary: Personal curation tabs, bookmarks, document cards, and load-more controls stay in the current service; only explicit home/close actions may reveal the home page.
- Required navigation boundary: Sidebar shortcuts must complete their real route navigation without a router/unmount race.
- Preserve: existing tab contents, bookmark persistence, document viewer, protected access, and intended explicit home/close behavior.
- Unanswered decision: none.
# 2026-08-23 Member Contribution Payment-First Redesign

- Requested feature slice: Redesign the logged-in member `내 분담금 현황` around `내가 납부한 금액`, using the selected receipt-board visual direction, and make the personal-library surface slightly wider.
- Explicitly excluded scope: No backend/model changes, no fabricated totals, no display of total planned amount, unpaid amount, payment progress, or percentage; no public exposure.
- Candidate governing specification: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`, narrowed by the user's 2026-08-23 display decision.
- Unanswered decision: none.

# Current Request: Sidebar-Controlled Payment Ledger Disclosure

- Requested feature slice: Selecting `납부내역` in the authenticated member-service sidebar opens the complete payment ledger; selecting `내정보`, `개인자료`, or another menu closes it again.
- Preserve: native manual expand/collapse, approved accounting values, member-scoped access, role labels, section focus, and existing shortcut destinations.
- Explicitly excluded scope: contribution API/model changes, ledger data mutation, new payment states, and public exposure.
- Candidate governing basis: `docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md` and `docs/superpowers/plans/2026-08-23-member-service-fullscreen-navigation.md`.
- Unanswered decision: none.

# Current Request: PeopleON Profile Read Integration

- Populate the member information home from the authenticated PeopleON ledger API when an exact saved `peopleOnMemberId` or `externalMemberId` match exists.
- Read member number, name, phone, legal address, joined date, member status, unit group, certificate status, related-name presence, birth date, and masked refund-account metadata.
- Never match or merge by name. Keep website values as the fallback when the API key, remote service, or exact external ID is unavailable.
- Keep corrections in the existing website approval and PeopleON reflection workflow; this slice does not call a PeopleON write API.
