# Design QA: Mobile-First Login And Signup

- Source visual truth: user-supplied current login screenshot and `_workspace/04_review/source-login-mobile.png`
- Implementation screenshots: `_workspace/04_review/login-mobile.png`, `_workspace/04_review/signup-mobile.png`, `_workspace/04_review/signup-desktop.png`
- Viewports: source effective 426 x 853; implementation mobile effective 433 x 938; implementation desktop effective 1600 x 1111
- Density normalization: CSS-pixel browser captures at device scale 1; mobile comparison uses the same sub-640px responsive state, with proportional layout comparison because the connected browser exposed a 7px width difference.
- States: logged-out login, logged-out new signup

## Full-View Comparison Evidence

- The source mobile state required scrolling through a desktop-derived login card and account-rights content before reaching signup.
- The implementation moves a two-option authentication switch directly below the compact heading and hides secondary account-rights guidance on mobile.
- Signup now begins at y=297, fits the primary submit action within the first 1075px page, and has no horizontal overflow or framework overlay.

## Focused Region Comparison Evidence

- Form controls were inspected separately because mobile input ergonomics are the core request.
- All four signup inputs render at 48px height and 16px font size; the submit action renders at 48px.
- The six-digit numeric constraint, visibility controls, labels, optional memo, error/success regions, and approval copy remain present.

## Required Fidelity Surfaces

- Fonts and typography: PASS. Existing Pretendard hierarchy is retained; mobile headline and supporting copy are reduced without changing desktop type.
- Spacing and layout rhythm: PASS. Mobile nested-shell padding is removed, tabs and forms move above secondary guidance, and desktop signup uses two columns.
- Colors and visual tokens: PASS. Warm canvas, parchment panels, stone inset outlines, orange eyebrow, and dark pill CTA remain unchanged.
- Image quality and asset fidelity: PASS. This surface has no new raster or decorative assets; the existing Google mark and Lucide visibility icon remain intact.
- Copy and content: PASS. Authentication and approval meaning is unchanged; only duplicated guidance and the redundant signup promotion are removed.

## Findings

- No actionable P0, P1, or P2 findings remain.
- P3: The optional memo remains visible rather than collapsible so applicants can still provide matching information without another interaction.

## Comparison History

- Initial source finding: mobile users reached signup only after a tall login and account-rights sequence.
- Fix: added immediate login/signup tabs, compacted the mobile shell, hid secondary rights guidance below `md`, increased touch targets, and used desktop-only two-column signup fields.
- Post-fix evidence: mobile login and signup screenshots show the mode switch and form above the fold; measured overflow is false and application console errors are empty.

## Final Result

final result: passed
