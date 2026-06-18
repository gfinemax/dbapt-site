# Request Summary

## Requested Feature Slice

- Add a first-pass 관리자 전용 조합원 관리 page.
- Integrate the PeopleOn members table API as a read-only server-side source.
- Show counts for 등기조합원, 환불 조합원, 홈페이지 가입 완료, 가입 승인 대기, 홈페이지 미가입, and 자격 불일치.
- List PeopleOn target members who are missing from the homepage, pending approval, or mismatched against homepage role state.
- Add an admin portal entry point to the new page.
- Follow-up: Treat preliminary cooperative members as `MEMBER` access accounts while keeping a separate membership classification.
- Follow-up: Show a `자격 구분` column in the approved-member conversion list and PeopleOn member action list.
- Follow-up: Add preliminary-member conversion actions and make refund-to-regular conversion update both access role and membership type.
- Follow-up: Replace multiple force-conversion buttons with a dropdown plus a single apply button.
- Follow-up: Add `관계자/기타 승인 계정` as a distinct approved account type.
- Follow-up: Add a show/hide toggle for the member login password field and assess security impact.
- Follow-up: Prevent the administrator home/personal library from growing vertically as approved accounts increase by replacing the full approved-member conversion list with summary badges and a link to the dedicated management page.
- Follow-up: Exclude demo/mock approved accounts from approved-member management lists and security audit/download history.
- Follow-up: Remove hardcoded mock notice posts from the public notice board so only database-backed notices appear.
- Follow-up: Let administrators choose the public notice author label as `운영자` or `사무국` when creating a notice.
- Follow-up: Remove the circular red pulsing marker from important notice badges and apply the pulsing animation to the `★` mark itself.
- Follow-up: Remove hardcoded mock free-board posts so the free board shows only database-backed posts or the existing empty state.

## Explicitly Excluded Scope

- Writing to PeopleOn.
- Scheduled sync.
- Persisting PeopleOn snapshots.
- Manual matching save flow.
- Bulk account creation.
- New public navigation.
- New member-role mutation actions beyond the existing admin approval/conversion workflow.
- A dedicated UI for manually assigning `PRELIMINARY` membership type.
- Persisting password visibility preference.
- Changing password submission, hashing, or authentication policy.
- Removing the approved-member conversion workflow.
- Deleting real member accounts or audit records from the database.
- Deleting real notice posts from the database.
- Deleting real free-board posts from the database.
- Hiding or changing the underlying admin account that created a notice.

## Candidate Governing Specification

`docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`

## Unanswered Decision

none
