# Verification

## Implemented Feature

- Updated public `/business` from the prior explanation-material presentation to the 2025.10.30 business plan PDF scope.
- Reflected the operator-approved household framing: current district-unit-plan status `254세대`, future minor-change plan `270세대 예정`, and no public mention of the unwanted PDF household figure.
- Added rendering, architecture plan diagram, layout, unit plan, vehicle circulation, pedestrian circulation, and revised future-process sections.
- Merged the overview source-table image and key-figure cards into a grouped text-based `통합 건축개요`.
- Removed the regional traffic section from the public business-status page and moved rendering directly after the overview section.
- Removed the architecture-plan key-figures source image and converted the social-welfare facility plan from a source image into readable summary cards plus an accessible floor-by-floor table.
- Fixed unit-plan floor-plan rendering by replacing the fill-based image area with explicit source-size uploaded images inside visible frames.
- Removed the duplicated per-card unit-plan metadata above each uploaded image so the floor-plan image itself is the visible source for type, area, and household details.
- Changed the overview bottom note to `향후 계획` and removed the redundant business-plan 기준 prefix from that note.
- Removed the `배치도 확인 사항` and `일정 표기 원칙` cards, and removed `사업계획서에 수록된 조감도입니다.` from the rendering description.
- Replaced the vehicle and pedestrian circulation plan images with the two locally saved uploaded files.
- Fixed the vehicle/pedestrian circulation cards so the uploaded diagrams render with explicit `1994x1280` image dimensions instead of relying on a collapsible `fill` image frame.
- Wrapped each vehicle/pedestrian circulation diagram in an inset rounded map frame inside the existing card.
- Added a readable `평형별 세대계획` overview block separating current district-unit-plan `254세대` and future minor-change `270세대 예정`.
- Reflected the current `254세대` as `분양주택 236세대` plus `공공주택 18세대`, and the future `270세대 예정` as `분양주택 252세대` plus `공공주택 18세대`, with 평형별 rows.
- Updated `향후 추진절차` so the first four steps are active and the architecture-review step reads `건축심의 (2027.3 예정)`.
- Replaced old business-status static assets with new cropped/selected PDF images under `public/assets/business/plan-20251030/`.
- Deleted the old unit-plan PDF page assets and replaced them with the five locally saved uploaded files in the requested 48A, 59A, 59B, 84A, 84B order.
- Updated connected public navigation/search/library copy for the revised business-status sections.
- Added a public `개발일지` tab inside `조합소식`, combining development-log and implementation-request history in one modest log surface.
- Added version/status presentation for development logs, using `vYYYY.MM.week` labels and status badges for `게시됨`, `게시 대기`, and `숨김`.
- Added an admin-only automatic development-log draft API that can create `DEVELOPMENT_LOG_DRAFT` entries from recent git-style change subjects, while publish/hide uses the existing `/api/news` mutation path.
- Connected public navigation and site search to `/news?tab=development`.

## Changed Files

- `_workspace/00_input/request-summary.md`
- `_workspace/01_scope/spec-selection.md`
- `_workspace/04_review/ui-review.md`
- `_workspace/final/verification.md`
- `docs/superpowers/plans/2026-06-21-daebang-household-plan-breakdown.md`
- `src/components/business/business-client.tsx`
- `src/components/business/overview-tab.tsx`
- `src/components/business/plan-tab.tsx`
- `src/components/business/unit-tab.tsx`
- `src/components/business/mobility-tab.tsx`
- `src/components/business/rendering-tab.tsx`
- deleted `src/components/business/traffic-tab.tsx`
- `src/components/business/timeline-tab.tsx`
- `src/content/landing.ts`
- `src/content/site-search.ts`
- `src/content/library.ts`
- `src/components/news/news-client.tsx`
- `src/components/news/development-log.tsx`
- `src/lib/news/development-log.ts`
- `src/lib/news/deep-links.ts`
- `src/lib/news/news-client-summary.ts`
- `src/app/api/news/development-log/draft/route.ts`
- `src/__tests__/news-development-log.test.ts`
- `src/__tests__/news-development-log-api.test.ts`
- `src/__tests__/news-development-log-component.test.tsx`
- `src/__tests__/news-client-summary.test.ts`
- `src/__tests__/news-deep-links.test.ts`
- `src/__tests__/business-page.test.tsx`
- `src/__tests__/landing-page.test.tsx`
- `public/assets/business/plan-20251030/*`

## Checks Run

- `pnpm vitest run src/__tests__/business-page.test.tsx`: passed, 14 tests
- `pnpm vitest run src/__tests__/landing-page.test.tsx`: passed, 15 tests
- `pnpm vitest run src/__tests__/news-development-log.test.ts src/__tests__/news-deep-links.test.ts src/__tests__/news-client-summary.test.ts src/__tests__/news-development-log-api.test.ts src/__tests__/news-development-log-component.test.tsx`: passed, 5 files / 14 tests
- `pnpm vitest run src/__tests__/news-development-log-component.test.tsx src/__tests__/news-deep-links.test.ts src/__tests__/news-client-summary.test.ts`: passed, 3 files / 8 tests
- `pnpm lint`: passed
- `pnpm test`: passed, 69 files / 373 tests
- `pnpm build`: passed

## Browser Checks

- Server: `http://127.0.0.1:3001/business` via `pnpm start --hostname 127.0.0.1 --port 3001`.
- Desktop check: `innerWidth=1440`, `scrollWidth=1440`, `overflowX=false`.
- Mobile check: `innerWidth=390`, `scrollWidth=390`, `overflowX=false`.
- Text checks: `현재 지구단위계획 254세대=true`, `경미한 변경으로 270세대 예정=true`, old hidden household text `false`, `353대=false`, `2025.09.06=false`.
- Image checks: retained business-plan image alt labels present and loaded on desktop and mobile after scroll-triggering lazy images. The removed overview source-table image, architecture-plan key-figures image, and social-welfare source image are not present.
- Overview checks: desktop and mobile `/business#overview` show grouped `통합 건축개요` text content with 사업 정보, 면적 계획, 규모·비율, 주차·기준 and the PDF-derived values. The overview source-image title and image alt are absent; `overflowX=false`.
- Household-plan checks: `/business#overview` now shows `평형별 세대계획` between the top summary cards and `통합 건축개요`, with `현재 지구단위계획 254세대`, `236 + 18 = 254세대`, `향후 경미한 변경 270세대 예정`, `252 + 18 = 270세대 예정`, and 48㎡/59㎡/74㎡/84㎡ rows. Mobile Chrome CDP width check reported `innerWidth=390`, `scrollWidth=390`, `bodyScrollWidth=390`, and `overflowX=false`.
- Timeline checks: production HTML confirmed `건축심의 (2027.3 예정)=true`, `건축심의 (2026.10)=false`, and four active timeline cards. Chrome CDP check on `/business` confirmed timeline text includes the new date, active timeline card count is `4`, old date is absent, and `overflow=false`.
- Overview note checks: `/business#overview` shows `향후 계획`, includes the future household-plan wording, and does not include the removed business-plan 기준 prefix.
- Cleanup checks: `/business` no longer shows `배치도 확인 사항`, `Layout Notes`, `일정 표기 원칙`, or `사업계획서에 수록된 조감도입니다.`, while the rendering change disclaimer remains visible.
- Mobility image checks: `/business#mobility` uses `vehicle-circulation-uploaded.png` for `차량동선계획 도면` and `pedestrian-circulation-uploaded.png` for `보행동선계획 도면`. The rendered images now carry explicit `width="1994"` and `height="1280"` attributes so the panels do not collapse, and each image is wrapped by `data-testid="circulation-map-frame"` inside an inset rounded box. The repo asset hashes match `C:\Users\finemax\Downloads\차량동선계획.png` and `C:\Users\finemax\Downloads\보행동선계획.png`.
- Section order checks: desktop and mobile `/business` sections render as overview, rendering, plan, unit, mobility, timeline. The traffic section, traffic nav button, traffic text, and regional traffic image are absent. The rendering image loads directly after the overview section and before the plan section.
- Social-welfare plan checks: summary cards show location, use, scale, and gross floor area; accessible table `사회복지시설 층별 계획` shows floor-by-floor area and use.
- Plan-section browser follow-up desktop `/business#plan`: architecture-plan key-figures title/image absent, social-welfare source image absent, social-welfare heading/location/scale/area present, accessible table present, and `overflowX=false`.
- Plan-section browser follow-up mobile `/business#plan`: same checks passed with `innerWidth=390`, `scrollWidth=390`, and `overflowX=false`.
- Unit-plan follow-up desktop `/business#unit`: `frameCount=5`, image order `unit-48a.png`, `unit-59a.png`, `unit-59b.png`, `unit-84a.png`, `unit-84b.png`, complete image loading, no duplicate DOM metadata above the images, and `overflowX=false`.
- Unit-plan follow-up mobile `/business#unit`: `frameCount=5`, same image order, complete image loading, no duplicate DOM metadata above the images, and `overflowX=false`.
- Screenshots written: `_workspace/unit-fixed-desktop.png`, `_workspace/business-images-desktop.png`, `_workspace/business-images-mobile.png`, `_workspace/business-final-desktop.png`, `_workspace/business-final-mobile.png`, `_workspace/business-final-plan.png`.
- Follow-up screenshots written: `_workspace/unit-uploaded-no-meta-desktop.png`, `_workspace/unit-uploaded-no-meta-mobile.png`.
- Plan-section screenshots written: `_workspace/business-plan-welfare-table-desktop.png`, `_workspace/business-plan-welfare-table-mobile.png`.
- Section-order screenshots written: `_workspace/business-rendering-after-overview-desktop.png`, `_workspace/business-rendering-after-overview-mobile.png`.
- Overview screenshots written: `_workspace/business-overview-integrated-desktop.png`, `_workspace/business-overview-integrated-mobile.png`.
- Follow-up overview-note screenshots written: `_workspace/business-overview-future-plan-desktop.png`, `_workspace/business-overview-future-plan-mobile.png`.
- Follow-up cleanup screenshots written: `_workspace/business-cleanup-desktop.png`, `_workspace/business-cleanup-mobile.png`.
- Follow-up mobility screenshots written: `_workspace/business-mobility-uploaded-desktop.png`, `_workspace/business-mobility-uploaded-mobile.png`.
- Mobility fix screenshot written: `_workspace/business-mobility-fixed-fullpage.png`.
- Mobility framed-map screenshot written: `_workspace/business-mobility-framed-fullpage.png`.
- Household-plan screenshots written: `_workspace/business-household-desktop.png`, `_workspace/business-household-mobile.png`.
- Timeline follow-up screenshot written: `_workspace/business-timeline-202703-fullpage.png`.
- Development-log browser checks: `/news?tab=development` renders the active `개발일지` tab and public log card on desktop and mobile; mobile tab order places `개발일지` immediately after `공지사항`.
- Development-log screenshots written: `_workspace/news-development-log-desktop.png`, `_workspace/news-development-log-mobile-full.png`.
- `dbapt-site-ui-review`: PASS in `_workspace/04_review/ui-review.md`.

## Unresolved Risks Or Follow-Up Specs

- none
