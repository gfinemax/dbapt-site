# Admin Member Composition Donut Plan

**Goal:** Make approved member composition the primary administrator dashboard summary while keeping pending approvals, document totals, and audit activity as independent operational metrics.

## Task 1: Derive an accessible member composition

- Reuse `approvedSocialUsers` and the existing normalized member-type counts.
- Calculate exact percentages and cumulative donut segments for regular, preliminary, refund, and associate accounts.
- Provide a neutral zero state and an exact accessible text alternative.

## Task 2: Reorder the dashboard hierarchy

- Replace the document donut with the approved member composition donut.
- Show count and percentage in the legend and link the member summary to the approved-member management section.
- Keep pending approvals and security activity outside the composition chart.
- Demote document totals to a compact independent metric without changing document behavior.

## Task 3: Preserve responsive and access behavior

- Stack chart, legend, and independent metrics naturally on mobile without horizontal overflow.
- Preserve visible keyboard focus and existing administrator-only boundaries.
- Do not change approval actions, authentication, PeopleOn synchronization, or public navigation.

## Task 4: Verify

- Update focused portal-shell assertions for composition, independent metrics, and zero state.
- Run focused tests, lint, the full test suite, and a production build.
- Verify the administrator dashboard at desktop and mobile sizes, then complete the repository UI review gate.

## Approved Correction: Compare Like With Like

- Use PeopleOn registered-member count as the denominator for approved regular homepage accounts.
- Draw the donut as regular homepage approval progress, not composition across unrelated member types.
- Show preliminary and refund progress only against their matching PeopleOn populations.
- Show associate/other as a count because no equivalent PeopleOn population is defined.
- If PeopleOn data is unavailable, hide rates and state that the registry needs confirmation.
