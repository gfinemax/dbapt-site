# UI Review

## Reviewed Change
- Feature: update the public `사업현황` page to the 2025.10.30 business plan PDF scope while applying operator corrections for household counts.
- Follow-up: add missing source imagery where useful, then remove duplicated source-table images after converting their contents to readable page content.
- Follow-up: fix the unit-plan section so all five floor-plan images render inside visible image frames instead of appearing as title-only rows.
- Follow-up: replace the unit-plan section with the five locally saved uploaded images in the requested order and remove duplicate metadata headers above each image.
- Follow-up: remove the architecture-plan key-figures source image and present the social-welfare facility plan as readable text cards and an accessible floor-by-floor table.
- Follow-up: remove the regional traffic section and move the rendering section directly after the overview section, including public navigation/search cleanup.
- Follow-up: merge the overview key-figure cards and source image into one text-based integrated architecture overview.
- Follow-up: retitle the overview note as `향후 계획` and remove the redundant business-plan 기준 prefix from that note.
- Follow-up: remove redundant layout-note and schedule-note cards and trim the rendering description to only the change/disclaimer sentence.
- Follow-up: replace the vehicle and pedestrian circulation diagrams with the two locally saved uploaded images.
- Follow-up: fix the circulation cards so the uploaded vehicle and pedestrian diagrams render as visible image panels instead of collapsed text-only cards.
- Follow-up: wrap each circulation map in an inset rounded map frame inside the card, preserving the uploaded vehicle-first and pedestrian-second images.
- Follow-up: add a readable `평형별 세대계획` block in the overview section, split between current district-unit-plan `254세대` and future minor-change `270세대 예정`, with 분양주택/공공주택 and 평형별 rows.
- Follow-up: update `향후 추진절차` so steps 1 through 4 are visually active and `건축심의` reads `2027.3 예정`.
- Follow-up: add a public `개발일지` tab inside `조합소식`, with version/status badges, formatted log cards, and admin-only automatic draft generation plus publish/hide controls.
- Governing spec: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `사업정보` surface, plus current operator request.
- Implementation plan: `docs/superpowers/plans/2026-06-01-daebang-business-status.md`, plus `docs/superpowers/plans/2026-06-21-daebang-household-plan-breakdown.md` and `docs/superpowers/plans/2026-06-21-news-development-log.md` for current follow-ups.
- Files or pages reviewed: `/business`, `/news?tab=development`, `src/components/business/*`, `src/components/news/development-log.tsx`, `src/components/news/news-client.tsx`, `src/content/landing.ts`, `src/content/site-search.ts`, `src/content/library.ts`, `src/app/api/news/development-log/draft/route.ts`, `public/assets/business/plan-20251030/*`, `C:\Users\finemax\Downloads\차량동선계획.png`, `C:\Users\finemax\Downloads\보행동선계획.png`.

## Boundary Review
- Finding: PASS
- Evidence: The business-status change remains limited to the public 사업현황 page and connected public navigation/search labels. The new development-log change is limited to public 조합소식 display plus an admin-only draft-generation API guarded by `ADMIN` session role. It does not expose private documents, payment/refund data, member-only posts, discussions, voting, or non-admin controls.

## Truthful Presentation Review
- Finding: PASS
- Evidence: The page states `2025.10.30 사업계획서 기준`, shows current district-unit-plan status as `254세대`, and shows `270세대 예정` as a future minor-change plan. The new household-plan block separates `현재 지구단위계획 254세대` as `분양주택 236세대` plus `공공주택 18세대`, and `향후 경미한 변경 270세대 예정` as `분양주택 252세대` plus `공공주택 18세대`. The overview note is labeled `향후 계획` and starts with the future household-plan wording instead of the removed business-plan 기준 prefix. The rendering copy now avoids the removed source-image statement and only keeps the change disclaimer. Browser checks confirmed the page text does not include the old hidden household figure, `353대`, or `2025.09.06`. The timeline now labels the architecture-review step as `건축심의 (2027.3 예정)`.

## Design And Accessibility Review
- Finding: PASS
- Evidence: The existing warm-canvas, stone-card, sticky section navigation, and responsive one-page rhythm were retained. Desktop and mobile Chrome screenshots at `/business#overview` show `평형별 세대계획` between the summary cards and `통합 건축개요`. A mobile 390px Chrome CDP width check reported `innerWidth=390`, `scrollWidth=390`, and `overflowX=false` after the table-width adjustment. Current `/business` browser checks confirmed section order `overview`, `rendering`, `plan`, `unit`, `mobility`, `timeline`; the traffic section, traffic nav button, traffic text, and traffic image are absent. Desktop and mobile browser checks at `/business#overview` confirmed the overview source-table image is absent and its values are exposed as grouped DOM text under `통합 건축개요`. Browser checks also confirmed `배치도 확인 사항`, `Layout Notes`, `일정 표기 원칙`, and the removed rendering sentence are absent. Image alt text exists for the retained business-plan diagrams. Follow-up checks at `/business#mobility` confirmed the uploaded vehicle and pedestrian circulation images use explicit `1994x1280` dimensions and render visibly inside two inset rounded map frames in full-page Chrome capture `_workspace/business-mobility-framed-fullpage.png`; the files still match the two uploaded Downloads images by SHA256. Earlier desktop and mobile browser checks at `/business#plan` confirmed the architecture-plan key-figures image and social-welfare source image are absent, while social-welfare details are exposed as readable DOM text and an accessible table. Follow-up checks at `/business#unit` confirmed five unit-plan image frames, five loaded uploaded floor-plan images in the requested order, and no duplicate DOM metadata above the images. Timeline CDP checks confirmed four active timeline cards, no horizontal overflow, and absence of the old `건축심의 (2026.10)` text.
- Development-log evidence: Desktop and mobile Chrome screenshots at `/news?tab=development` confirm the new `개발일지` tab renders as an active public tab, shows version/status badges and a readable log card, and stays within the existing warm-canvas/stone-card news page rhythm. The mobile tab order was adjusted so `개발일지` appears immediately after `공지사항` instead of being hidden behind the horizontal tab row.

## Outcome
- Result: PASS
- Required action: none
