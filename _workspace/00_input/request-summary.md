# Request Summary

- Requested feature slice: Implement an API-ready first slice for member/refund-member contribution payment status, overdue unpaid amount guidance, and admin-approved payment imports.
- Explicitly included scope: Add database models, admin import/approval APIs, current-user contribution read API, and login-gated portal display for approved contribution summaries and draft notices.
- Explicitly excluded scope: Do not connect external accounting systems, SMS, Kakao 알림톡, payment gateways, automatic public disclosure, or direct external writes into live member data.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, section `납부와 미납 안내`.
- Unanswered decision: none
