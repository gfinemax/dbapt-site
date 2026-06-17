# UI Review

## Reviewed Change

- Feature: PeopleOn 조합원 원장과 홈페이지 계정을 비교하는 관리자 전용 조합원 관리 MVP
- Follow-up: Include email-less phone/password MEMBER and REFUND accounts in the administrator role-conversion list
- Follow-up: Display phone numbers in the role-conversion contact column when approved accounts do not have email
- Follow-up: Add local `memberType` classification and show `자격 구분` separately from access role
- Follow-up: Add 정식/예비/환불 conversion buttons in the administrator approved-member list
- Follow-up: Replace conversion buttons with a dropdown and add 관계자/기타 승인 계정 as `ASSOCIATE`
- Follow-up: Add a show/hide toggle to the member login password field
- Follow-up: Replace the administrator home conversion table with summary badges and move the full conversion table to `/portal/admin/members`
- Follow-up: Exclude demo/mock approved accounts from approved-member management lists and security audit/download history
- Follow-up: Remove hardcoded mock notice posts from the public notice board
- Follow-up: Add an administrator notice author-label selector for `운영자` / `사무국`
- Follow-up: Show the same notice author-label selector when editing existing notices
- Follow-up: Remove the circular red pulse marker from important notice badges and animate the `★` mark instead
- Governing spec: `docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-17-peopleon-member-management-mvp.md`
- Files or pages reviewed:
  - `src/app/portal/admin/members/page.tsx`
  - `src/components/portal/approved-member-conversion-panel.tsx`
  - `src/components/portal/member-management-dashboard.tsx`
  - `src/components/portal/portal-shell.tsx`
  - `src/components/landing/site-header.tsx`
  - `src/app/portal/admin/page.tsx`
  - `src/lib/personal-library-data.ts`
  - `src/lib/user-contact-display.ts`
  - `src/lib/demo-account-filter.ts`
  - `src/lib/member-type.ts`
  - `src/lib/auth.ts`
  - `src/app/login/login-client.tsx`
  - `src/app/api/news/route.ts`
  - `src/app/news/page.tsx`
  - `src/components/news/notice-board.tsx`
  - `src/components/news/news-client.tsx`
  - `src/lib/news-display-author.ts`
  - `/login`
  - `/news?tab=notice`
  - `prisma/schema.prisma`
  - `/portal/admin`
  - `/portal/admin/members`
  - `/`

## Boundary Review

- Finding: PASS
- Evidence: The new surface is under `/portal/admin/members`, checks for an `ADMIN` session before rendering, and is linked from the existing administrator portal plus the logged-in administrator profile dropdown. The role-conversion list remains inside the admin-only management page and now includes all non-demo approved MEMBER/REFUND/ASSOCIATE accounts regardless of whether they came from social email login or phone/password signup. The administrator home view now exposes only aggregate approved-account counts plus a link to the dedicated management page. Phone-number display is limited to the administrator role-conversion surface. Demo/mock approved accounts are excluded from administrator account lists and audit-log presentation but no database rows are deleted. `memberType`, the dropdown conversion control, and `ASSOCIATE` are local admin-only account controls and do not expose a new public capability. Public navigation remains unchanged for logged-out users and non-admin users. PeopleOn integration is read-only and no PeopleOn write, scheduled sync, bulk account creation, or new public member data exposure was added. The login password toggle changes only the local input visibility and does not add a new authentication pathway.
- Follow-up evidence: Removing hardcoded notice-board mock rows changes only the public notice list's fallback data source. It does not delete database-backed notices, change administrator notice mutation permissions, or expose new content.
- Follow-up evidence: The notice author selector is rendered only inside the administrator notice creation drawer. It stores a separate public label while preserving the logged-in administrator `authorId`, so audit accountability and mutation permissions remain tied to the real admin account.
- Follow-up evidence: The important-notice visual change removes only the decorative circular pulse marker and keeps the existing database-backed notice list, notice permissions, and important flag semantics unchanged.

## Truthful Presentation Review

- Finding: PASS
- Evidence: The page says it compares PeopleOn 원장 rows with 홈페이지 계정. It surfaces only counts and action-needed rows from server-side data. When the PeopleOn API key is missing or API access fails, it shows configuration/failure guidance instead of pretending sync is live. The header dropdown shortcut and administrator-home summary button are plain navigation links for administrators and do not imply a new public or non-admin capability. The home copy truthfully states that it shows only summary counts and that actual changes happen on the dedicated page. The role-conversion copy now states that approved members can be converted among 정식조합원, 예비조합원, 환불조합원, and 관계자/기타 승인 계정. The contact column truthfully labels mixed identifiers as `이메일/휴대폰`, and the `자격 구분` column distinguishes 정식/예비/환불/관계자 classification from access role. Known demo account names and generated demo login IDs no longer appear in approved-member management or audit history. The login toggle is labeled as `비밀번호 보기` / `비밀번호 숨기기` and does not imply recovery or credential management.
- Follow-up evidence: The notice board no longer pads real notices with sample operational copy such as 론칭 안내, 에스크로 자금보고, or 설계·용역 공람 안내. Empty notice results now use the existing empty-state sentence instead of presenting sample posts as live notices.
- Follow-up evidence: The author selector is constrained to `운영자` and `사무국`; unsupported labels such as `감사단` are rejected by the API. Public lists and detail views use the selected label instead of implying that the individual admin account name is the public author.
- Follow-up evidence: Existing notice edit mode now exposes the same `공지 작성자` select and PATCH requests persist the selected label.
- Follow-up evidence: The important notice badge still truthfully labels starred notices as important; only the animation target changed from a separate dot to the visible `★`.

## Design And Accessibility Review

- Finding: PASS
- Evidence: The page uses warm canvas, stone-card surfaces, dark pill links, small colored text badges, and Pretendard-driven existing typography. Action links have visible text labels and lucide icons. Tables are wrapped in `overflow-x-auto` for narrow screens, stat cards collapse through responsive grid classes, and no decorative motion was added. The profile dropdown shortcut reuses the existing compact text-link treatment inside the authenticated user menu. The administrator home role-conversion area now uses compact summary badges, preventing long account lists from stretching the page. The dedicated role-conversion action cell uses a labeled native select plus one compact `자격 변경` button, reducing horizontal crowding compared with multiple pill buttons. The login password toggle is an icon button with accessible labels, `aria-pressed`, stable input padding, and no layout-shifting text. Desktop and mobile browser checks found no horizontal overflow on `/portal/admin` or `/portal/admin/members`.
- Follow-up evidence: The notice-board table layout, search control, comment count button, important badge, and empty state are unchanged; only hardcoded fallback rows were removed.
- Follow-up evidence: The new author control is a native labeled select placed in the existing notice creation drawer before the title field. It uses the same rounded stone-border input treatment and remains keyboard accessible through the associated label.
- Follow-up evidence: The edit-mode author control uses the same native labeled select and sits before the title field in the notice edit form.
- Follow-up evidence: The separate round marker was removed from the notice-board badge. The `★` mark now carries `animate-ping` and `motion-reduce:animate-none`, keeping the decorative motion reduced-motion-safe without adding layout-affecting elements.

## Outcome

- Result: PASS
- Required action: none
