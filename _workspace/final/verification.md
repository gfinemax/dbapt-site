# Verification Report

## Implemented Feature and Changed File Summary
We have updated terminology on the disclosure and library pages, renaming all user-visible instances of "회의록" to "의사록" and "수발신 공문" to "공문서".
We have also reorganised the "5. 사업 및 감리" submenus:
- Added "토지확보" submenu & card to the left of "용역 계약서" under Tab 5. It describes "토지 사용권원 및 소유권 확보 비율을 공개합니다. (의무공개 대상)".
- Moved "사업시행계획" (사업시행계획서) submenu & card from Tab 3 ("3. 공문서") to Tab 5 ("5. 사업 및 감리") (positioned to the right of "용역 계약서").
- Deleted "공사진행/토지" from Tab 5 submenus and cards.
- Added "공사시행" submenu and card under Tab 5, with description "월별 공사진행 상황에 관한 서류 (의무공개 대상)".
- Added "분양" submenu and card under Tab 5, with description "분양신청에 관한 서류 및 관련 자료로 구성되어 있습니다.".
- Deleted "시공자 협약서" from Tab 5 submenus and cards.
- Updated header/landing links to target the new `/disclosure?tab=operations` route for "사업시행계획서".

### Changed Files:
- [disclosure-client.tsx](file:///c:/workspace/antigravity/dbapt-site/src/components/disclosure/disclosure-client.tsx)
- [meetings-table.tsx](file:///c:/workspace/antigravity/dbapt-site/src/components/disclosure/meetings-table.tsx)
- [document-upload-form.tsx](file:///c:/workspace/antigravity/dbapt-site/src/components/portal/document-upload-form.tsx)
- [library-client.tsx](file:///c:/workspace/antigravity/dbapt-site/src/components/library/library-client.tsx)
- [landing.ts](file:///c:/workspace/antigravity/dbapt-site/src/content/landing.ts)
- [library.ts](file:///c:/workspace/antigravity/dbapt-site/src/content/library.ts)
- [route.ts (GET/POST)](file:///c:/workspace/antigravity/dbapt-site/src/app/api/documents/route.ts)
- [route.ts (PATCH)](file:///c:/workspace/antigravity/dbapt-site/src/app/api/documents/[id]/route.ts)
- [disclosure-page.test.tsx](file:///c:/workspace/antigravity/dbapt-site/src/__tests__/disclosure-page.test.tsx)
- [library-page.test.tsx](file:///c:/workspace/antigravity/dbapt-site/src/__tests__/library-page.test.tsx)
- [document-upload-form.test.tsx](file:///c:/workspace/antigravity/dbapt-site/src/__tests__/document-upload-form.test.tsx)
- [document-upload-api.test.ts](file:///c:/workspace/antigravity/dbapt-site/src/__tests__/document-upload-api.test.ts)

## Required Checks Run & Results
- **Unit Tests (`pnpm test`)**: Passed successfully (136/136 tests passed).
- **Linter (`pnpm lint`)**: Passed successfully (0 errors, 1 warning on an unrelated file).
- **Production Build (`pnpm build`)**: Compiled successfully with no TypeScript/Next.js errors.

## Browser Checks Completed
- Verified that "2. 의사록" and "3. 공문서" display correct terminology in both desktop and mobile view layouts.
- Verified that Tab 5 shows new submenus ("토지확보", "공사시행", "분양") and cards with proper text and descriptions, and that "공사진행/토지" and "시공자 협약서" have been completely removed.
- Verified that legacy data containing "회의록" or "수발신 공문" continues to load and map properly into the new "의사록" and "공문서" categories without error.

## Unresolved Risks or Follow-up Specs
- None.
