# Contribution Dashboard MVP Design

## Approved Request

Build the first personal contribution dashboard inside the logged-in personal library. The dashboard should make the member's housing-unit and payment status readable, polished, and ready for later ERP integration.

## Scope

- Redesign the member personal-library contribution area around the member's own payment status.
- Show these fields when approved data exists:
  - selected housing unit or unit label
  - total planned amount
  - total paid amount
  - unpaid amount
  - payment progress
  - next due date
  - payment stages and ledger entries
- When data does not exist, show a truthful `자료 대기` / `ERP 연동 예정` state.
- Avoid hardcoded sales prices, stage amounts, or real-looking fake balances.
- Extend the internal dbapt-site model so future ERP data can map into unit profile, payment plan, payment stages, and ledger entries.
- Keep ERP access server-side only. The browser must not call the ERP host directly.
- Add a basic audit-log structure for contribution dashboard views.
- Represent common contribution stages separately from unit-dependent stages. The current operating reference is:
  - common across unit types: `신청금(가입필증)`, `계약금`, `1차분담금`, `2차분담금`
  - unit-dependent after that: `초반 납입금`, `중도금`, `잔금`
  - amounts must still come from approved DB/ERP data before being shown as live data.

## Excluded Scope

- Building the dbapt-erp payment ledger feature itself.
- Calling a live ERP endpoint.
- Admin sync UI beyond model and adapter-ready foundations.
- Showing the user's example 30-pyeong/1,000,000,000 KRW numbers as live data.
- Publicly exposing contribution data.

## UX Requirements

- The logged-in member page should prioritize `내 분담금 현황`.
- Empty and pending states must be visually polished and clear.
- The layout must remain readable on mobile and desktop without horizontal overflow.
- The visual language must follow `DESIGN.md`: warm canvas, white cards with restrained stone borders, dark primary emphasis, and limited accent use.

## Data Requirements

- Preserve the existing `ContributionSummary` behavior.
- Add future-ready models for:
  - member contribution profile
  - payment plan
  - payment stages
  - ledger entries
  - contribution view audit logs
  - contribution sync runs
- API/view types should support the new shape while remaining backward-compatible when only `ContributionSummary` exists.

## Acceptance Criteria

- A logged-in member with no plan/profile sees a polished dashboard with `자료 대기` and `ERP 연동 예정`, not zero-won fake totals.
- A logged-in member with existing summary data sees totals and progress derived from approved data.
- Stage and ledger sections render from structured arrays when provided.
- `/api/me/contributions` remains self-only and returns the extended dashboard fields.
- Prisma schema and migration describe the future ERP-ready structure.
- Tests cover pending data, populated dashboard data, and self-only API serialization.
