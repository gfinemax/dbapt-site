# Spec Selection

## Selected Approved Spec

`docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`

## Implementation Boundary

This pass adds an admin-only `/portal/admin/members` page that reads PeopleOn member rows server-side, compares them with local homepage `User` accounts, and renders statistics plus the prioritized rows requiring office action. It also adds a link from the existing admin portal to the new page.

Follow-up scope adds a separate local `User.memberType` classification so 예비조합원 can keep `MEMBER` access while appearing separately as `PRELIMINARY`. The approved-member conversion list and PeopleOn action table show `자격 구분` separately from access role.

The approved-member conversion list now offers administrator actions for 정식조합원, 예비조합원, and 환불조합원. These actions update local homepage `User.role` and `User.memberType` only.

Follow-up scope replaces those separate action buttons with one dropdown and one `자격 변경` button per approved account. It also adds a local `ASSOCIATE` role/member type for 관계자/기타 승인 계정.

Additional follow-up scope adds a client-side show/hide toggle to the member login password input. It keeps the password hidden by default, does not persist the visibility state, and does not alter server-side authentication.

Additional follow-up scope moves the full approved-member conversion table out of the administrator home view. The home view now shows only total and member-type summary badges plus a link to `/portal/admin/members#approved-member-conversion`, while the dedicated management page keeps the dropdown conversion workflow.

Additional follow-up scope excludes known demo/mock approved accounts from administrator approved-member management lists and security audit/download history. This is a presentation/query filtering change and does not physically delete database rows.

Additional follow-up scope removes hardcoded mock notice posts from the public notice board. This is a rendering-data-source change: database-backed notices still render, and an empty state appears when no real notice rows are available.

Additional follow-up scope lets administrators choose a public notice author label of `운영자` or `사무국` when creating a notice. The underlying `authorId` remains the logged-in administrator account for accountability, while `CoopNews.displayAuthorName` controls the public notice-board label.

Additional follow-up scope changes only the important notice badge microinteraction: the separate circular red pulse marker is removed and the reduced-motion-safe pulse animation is applied to the visible `★` mark.

Additional follow-up scope removes hardcoded mock free-board posts. This is a rendering-data-source change: database-backed free-board posts still render, and the existing empty state appears when no real free-board rows are available.

It does not write to PeopleOn, persist sync snapshots, create scheduled jobs, save manual matches, bulk-create accounts, expose new public navigation, introduce PeopleOn-side role mutation actions, remove local conversion actions, delete real database records, or change password storage/submission behavior.

## Conflicts

none

## May Planning Continue

yes
