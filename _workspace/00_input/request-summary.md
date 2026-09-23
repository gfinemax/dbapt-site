# Request Summary

## Requested feature slice

- Add account recovery entry points to the login experience, starting with account ID recovery and continuing to password reset.
- Use friendly Korean guidance for members.
- Use a single-use password-reset link that expires after 12 hours.
- Complete password reset by replacing the password and invalidating existing login sessions.

## Explicitly excluded scope

- Revealing or recovering an existing plaintext password.
- Matching an account by name alone.
- Claiming that a message was delivered when no live contact-delivery provider is configured.
- Changing member role, member type, refund data, or other profile data as part of password reset.

## Candidate governing specification

- `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`

## Unanswered decision

- none. The user selected manual SMS delivery from either an office-dedicated mobile phone or an administrator's personal mobile phone, chosen per request. The site opens the device SMS app or copies the message; it does not claim automatic delivery.
