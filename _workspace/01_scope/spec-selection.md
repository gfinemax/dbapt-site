# Spec Selection

- Selected approved spec path: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`.
- Implementation plan: update the existing `docs/superpowers/plans/2026-06-01-daebang-business-status.md` page slice with the operator-approved 2025.10.30 PDF correction.
- Implementation boundary: public `/business` page and its connected public navigation/search/library labels only. The page should display PDF-grounded architecture and circulation images, current district-unit-plan count `254세대`, and future minor-change count `270세대 예정`.
- Conflict resolution: the older business-status plan referenced 2025.09.06 briefing material and 270/353 figures; the current operator request supersedes that for this slice. The excluded PDF household figure must not be shown.
- Protected boundary retained: free-board member-only posts, private document permissions, accounting/payment/refund data, admin mutations, discussions, and voting remain unchanged.
- Follow-up implementation boundary: public `/news?tab=development`, connected public navigation/search labels, and admin-only development-log draft API. The feature reuses `CoopNews`; no private document, payment, voting, or member-only content exposure is added.
- Current follow-up boundary: keep release-style `개발일지` writing/status management admin-only, add logged-in user `요구사항` posts under the same `CoopNews` surface, and allow logged-in users to comment/reply on development logs and requirements. Non-admin users may delete only their own requirement posts and their own comments.
- Current presentation boundary: change only the `/news?tab=development` presentation from expanded cards to a compact list plus selected detail panel; permissions, categories, and APIs remain unchanged.
- Whether planning may continue: yes.
