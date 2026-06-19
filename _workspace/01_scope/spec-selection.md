# Spec Selection

- Selected approved spec path: direct operator request from the current thread.
- Implementation boundary: only `APPROVED` documents with category `DISCLOSURE` can be opened through anonymous inline PDF preview routes and `/disclosure?document=<id>` preloading.
- Protected boundary retained: accounting documents, pending disclosure documents, private/member documents, document downloads, admin mutations, payment/refund data, discussions, and voting remain login-gated.
- Whether planning may continue: yes.
