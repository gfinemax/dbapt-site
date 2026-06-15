# Request Summary

## Requested Feature Slice

Update the logged-in refund-member portal status card:

- add truthful guidance that refund-member refund/settlement and payment status will be reflected after ERP program integration
- keep the message scoped to the logged-in refund-member personal screen
- make the refund/settlement/payment status card use the full available horizontal width
- preserve existing approved refund/payment values when data is already supplied
- remove demo test account information from the login page entirely, even when demo-related environment flags are present
- replace the new-member signup request flow with a phone-number and password application form
- enforce the approved password rules: at least 8 characters, letters plus numbers, optional special characters, and no phone-number, date-like birthdate, repeated-character, or sequential-number patterns
- create phone-password signup requests as `PENDING` users for office approval
- preserve a phone login ID when office staff later approve the pending user
- remove the admin-account destination helper text from the login page route guidance
- make `신규 가입 신청` switch to a dedicated signup screen instead of expanding a form inside the member login screen
- remove the login destination route guidance card from the login/signup page composition
- add a login-page account permission guide explaining 정식 조합원, 환불 조합원, and 관계자/기타 승인 계정 access differences without reintroducing admin destination guidance

## Explicitly Excluded Scope

- Calling a live ERP endpoint
- Adding browser-side ERP integration
- Changing authentication, authorization, or routing boundaries
- Changing member/admin portal surfaces
- Changing refund calculation logic or stored values
- Adding new public navigation
- Implementing SMS phone verification, general email signup, arbitrary login ID signup, password reset, email verification, or Kakao OAuth in this pass

## Candidate Governing Specification

`docs/superpowers/specs/2026-06-14-contribution-dashboard-mvp-design.md`
`docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`

## Unanswered Decision

none
