# Request Summary

- Requested change: Fix uploaded meeting/library materials so logged-in users can open material details from the `/library` material list, and restyle the logged-in side badge as a narrow vertical `조합원 개인 자료실` action.
- Explicitly included scope: Keep the existing portal drawer open behavior; adjust the side badge color, corner radius, width, icon, and visible label. Keep the drawer title consistent with the new label. Use a brighter orange fill with white text, no explicit border, and remove the side shadow so the edge does not read as a border. Load approved uploaded documents for logged-in `/library` users and open real uploaded entries in the existing PDF viewer.
- Explicitly excluded scope: New document APIs, new permissions, public exposure of protected files, accounting, payment, voting, messaging, or private member data.
- Candidate governing specification: Existing public library index scope and repository UI rules in `AGENTS.md`.
- Unanswered decision: none
