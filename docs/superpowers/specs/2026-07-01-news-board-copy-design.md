# News Board Copy Design

## Goal

Add a low-risk administrator convenience tool that copies an existing post between the public notice board and the login-gated free board.

## Scope

- Administrators can copy a `CoopNews` notice into a new `FreePost`.
- Administrators can copy a `FreePost` into a new `CoopNews` notice.
- The source post remains unchanged. This is a copy tool, not a destructive move.
- Copied fields are limited to title, rich content, attachment metadata, pinned/starred state, display author label, and registered date.
- The copied row uses the acting administrator as `authorId` to avoid exposing a member account as a public notice author.
- Comments, replies, reactions, bookmarks, open-chat announcements, view counts, and public-share settings are not copied.

## Access Boundary

- The API is administrator-only.
- Non-admin and unauthenticated sessions must not create copied posts.
- The UI controls are visible only to administrators on real posts.
- The public notice board remains public. The free board remains login-gated except for already approved public-share behavior.

## Data Mapping

### Notice To Free Board

- Source: `CoopNews`
- Target: `FreePost`
- Target `postType`: `NOTICE`
- Target `authorId`: current administrator session id
- Target `isPublicShareEnabled`: `false`
- Target `publicShareEnabledAt`: `null`

### Free Board To Notice

- Source: `FreePost`
- Target: `CoopNews`
- Target `category`: `NOTICE`
- Target `authorId`: current administrator session id
- Target `imagePath`: `null`

## UI

- Notice rows and notice detail expose `자유게시판으로 복사` for administrators.
- Free-board rows and focused post detail expose `공지사항으로 복사` for administrators.
- Each action asks for browser confirmation before calling the copy API.
- A successful copy refreshes the current board data and shows a completion alert.
- A failed copy shows the server error message when available.

## Out Of Scope

- Moving or deleting source posts.
- Copying comments, reactions, bookmarks, open-chat announcements, view counts, or public-share state.
- Adding a bulk migration screen.
- Adding schema fields or a cross-board relationship between source and copy.

