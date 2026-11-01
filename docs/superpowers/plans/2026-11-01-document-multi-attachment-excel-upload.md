# Document Multi-Attachment Excel Upload Fix Plan

## Goal

Allow an administrator to upload a mixed set of additional document attachments, including Excel workbooks, without one supported workbook causing the whole batch to fail.

## Scope

- Add `.xls` and `.xlsx` to the private document-storage extension and MIME allowlists.
- Keep the primary document control limited to PDF, HWP/HWPX, and Word files.
- Declare the supported additional-attachment formats on both create and edit file inputs.
- Update validation messages so Excel is included in the advertised allowlist.
- Add regression coverage for mixed multi-file signed-upload preparation and storage metadata.

## Non-Goals

- Do not change the 20MB per-file limit or 10-file attachment limit.
- Do not change authentication, authorization, approval, viewing, download, audit, or notification behavior.
- Do not change existing attachment records or upload files on behalf of the user.

## Verification

1. Run focused storage, upload API, upload form, and disclosure-page tests.
2. Run `pnpm lint`, `pnpm test`, and `pnpm build`.
3. Review the create and edit attachment controls at desktop and mobile widths.
4. Record the `dbapt-site-ui-review` result and final verification evidence.
