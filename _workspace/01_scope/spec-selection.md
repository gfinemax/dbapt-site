# Spec Selection

- selected approved spec path: no standalone spec file; this implementation follows the user-approved PDF storage optimization direction captured in `_workspace/00_input/request-summary.md`.
- implementation boundary: add PDF upload optimization policy to admin document upload and disclosure document replacement flows. Persist final stored file size and optimization metadata on `Document` and `Attachment` records. Keep the actual stored file count at one per uploaded file.
- conflicts between the request and spec: none.
- whether planning may continue: yes.
