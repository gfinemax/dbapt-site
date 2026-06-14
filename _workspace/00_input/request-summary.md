# Request Summary

## Requested Feature Slice

Refine the logged-in `내 분담금 현황` dashboard layout after visual review:

- reduce repeated `자료 대기` text in the pending state
- make the empty progress area lower emphasis instead of a dominant black card
- keep the left side as compact summary/progress
- replace the left/right split with a horizontal band layout for summary, progress, payment stages, and recent ledger
- refine text hierarchy, labels, and alignment for better readability
- fix today's public-document `열람` action so direct portal pages open the PDF viewer
- make successful `보관` actions switch to `내 보관함` so the saved document is immediately visible
- open the PDF viewer in full viewport mode by default instead of a narrow side-sized panel
- improve mobile density without horizontal overflow

## Explicitly Excluded Scope

- Changing contribution data calculations
- Adding real ERP integration
- Adding admin sync UI
- Showing fake payment amounts
- Changing public pages

## Candidate Governing Specification

`docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`

## Unanswered Decision

none
