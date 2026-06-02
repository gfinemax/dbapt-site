# Request Summary

- Requested change: Restore the login 안내 modal that was previously implemented but no longer appears after login.
- Explicitly included scope: Ensure the `조합원 개인 자료실 등록 알림` 안내 modal appears after authenticated users land on their role-specific portal page, including administrator sessions. Keep the existing `/login` to `/portal/*` redirect behavior and do not change permissions. Apply the modal primary button style to the right-side vertical `조합원 개인 자료실` badge. Hide the browser's page scrollbar while keeping page scrolling functional.
- Explicitly excluded scope: New document APIs, new permissions, public exposure of protected files, accounting, payment, voting, messaging, or private member data.
- Candidate governing specification: Existing authenticated portal preview and repository UI rules in `AGENTS.md`.
- Unanswered decision: none
