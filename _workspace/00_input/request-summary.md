# Request Summary

- Requested feature slice: update the public `사업현황` page with the 2025.10.30 business plan PDF's architecture overview, architecture plan, layout plan, unit plans, vehicle/pedestrian circulation, rendering, and revised future process.
- Explicitly included operator corrections: show current district-unit-plan status as 254 households, show future minor-change plan as 270 households, and do not mention the excluded PDF household figure.
- Follow-up image request: add missing source images needed for the business-status environment, especially the architecture overview and architecture-plan source tables.
- Follow-up unit-plan request: replace all existing unit-plan images with the five locally saved uploaded images in order, do not crop the old images, delete the old unit-plan assets, and remove duplicate metadata above the uploaded images.
- Follow-up plan-section request: remove the `건축계획(안) 주요 수치` source-image block and convert the `사회복지시설 계획` source image into a readable summary-card plus floor-by-floor table layout.
- Follow-up section-order request: remove the `교통처리계획(광역)` section and move `조감도` directly after `건축개요`, including connected public navigation/search labels.
- Follow-up overview-section request: merge the duplicated `건축개요 주요 수치` cards and `사업계획서 건축개요 이미지` into one readable text-based `통합 건축개요`, removing the source image from the public page.
- Follow-up overview-note request: change the bottom overview note to `향후 계획`, keep the current/future household wording, and remove the `본 페이지는 2025년 10월 30일 사업계획서를 기준으로 하되` prefix.
- Follow-up cleanup request: remove the `배치도 확인 사항` and `일정 표기 원칙` cards, and remove `사업계획서에 수록된 조감도입니다.` from the rendering description.
- Follow-up circulation-image request: replace the vehicle and pedestrian circulation plan images with the two locally saved uploaded files, in the requested vehicle-first and pedestrian-second order.
- Follow-up circulation-rendering fix: the user reported that the `차량·보행 동선계획` cards showed text only and did not display the uploaded diagrams; fix the image panel so the uploaded vehicle and pedestrian diagrams render visibly.
- Follow-up circulation-frame request: wrap each visible vehicle/pedestrian map inside an inset map box within the existing card instead of placing the map directly against the card edge.
- Follow-up household-plan request: add a readable `평형별 세대계획` block to the public `사업현황` overview, split between current district-unit-plan `254세대` and future minor-change `270세대 예정`, including sale/public housing and unit-type breakdowns.
- Follow-up timeline request: in `향후 추진절차`, show steps 1, 2, and 3 as active together with `지구단위계획 수립`, and change `건축심의 (2026.10)` to `건축심의 (2027.3 예정)`.
- Follow-up news request: add a modest unified `개발일지` area inside `조합소식`, combining development log and implementation-request history, with version labels, formatted log content, admin draft generation, and publish/hide confirmation flow.
- Explicitly excluded scope: no private document exposure, no authentication/accounting/payment/voting feature changes, no unrelated disclosure/news/admin edits, and no public claim that final permits are already approved.
- Candidate governing specification: `docs/superpowers/specs/2026-05-25-daebang-housing-cooperative-portal-design.md`, public `사업정보` / `사업현황` surface.
- Unanswered decision: none.
