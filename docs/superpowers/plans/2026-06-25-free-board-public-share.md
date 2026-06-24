# 자유게시판 게시글별 공개 공유

## Goal

Allow administrators to mark an individual 자유게시판 post as publicly shareable so KakaoTalk/shared-link recipients can open that specific post body without logging in.

## Scope

- Add `FreePost.isPublicShareEnabled` and `FreePost.publicShareEnabledAt`.
- Add an administrator-only checkbox in the free-board write/edit drawer.
- Include the public-share flag in admin create/update payloads.
- When `/news?tab=free&post=<id>` is opened without a session, load only that post if public sharing is enabled.
- Render public shared posts read-only: title, body, registered date, type, attachment link, and safe author label.

## Exclusions

- No anonymous writing, comments, replies, editing, deleting, or full free-board browsing.
- No public private-account, document, payment, refund, voting, or portal data.
- No automatic public exposure of existing posts.

## Verification

- Add failing tests first for admin public-share payloads, API persistence, and unauthenticated read-only rendering.
- Run focused tests, then `pnpm lint`, `pnpm test`, and `pnpm build`.
- Apply the Prisma migration locally and verify desktop/mobile render of a public shared post.
