# 오픈채팅 공개자료 공지문 생성 설계

## 배경

공개자료가 사이트에 등록되면 카카오톡 오픈채팅방에도 알림 글을 올리고 싶다. 다만 공식 카카오 문서 기준으로, 서버가 임의 오픈채팅방에 자동으로 글을 게시하는 공개 API는 확인되지 않는다.

공식 기능의 경계는 다음과 같다.

- 카카오톡 공유는 사용자가 직접 카카오톡에서 친구 또는 채팅방을 선택해 공유하는 방식이다. 서버 REST API로 오픈채팅방에 자동 게시하는 기능이 아니다.
- 카카오톡 메시지 API는 같은 서비스 사용자/친구 기반 메시지 또는 나에게 보내기 중심이다. 서비스가 오픈채팅방에 직접 글을 쓰는 구조가 아니다.
- 카카오 챗봇/Event API는 카카오톡 채널을 추가한 사용자에게 메시지를 보내는 구조다. 오픈채팅방 자동 게시와는 다르다.

따라서 이 기능은 비공식 자동화가 아니라, 관리자가 오픈채팅방에 붙여넣을 수 있는 공지문을 사이트가 자동 생성하고 보관하는 방식으로 구현한다.

## 목표

승인된 공개자료가 생성되거나 수정될 때, 오픈채팅방에 붙여넣을 수 있는 공지문을 자동 생성한다.

공지문은 관리자 운영 도구에서 조회하고 복사할 수 있어야 한다. 첫 구현은 CLI 중심으로 만들고, 관리자 UI는 후속 범위로 둔다.

## 제외 범위

- 카카오톡 오픈채팅방에 서버가 직접 자동 게시하지 않는다.
- 카카오톡 PC, 개인 계정 자동 로그인, 브라우저 매크로, 비공식 봇을 사용하지 않는다.
- 오픈채팅방 참여자 목록을 수집하거나 저장하지 않는다.
- 공개자료 파일 URL 또는 비공개 다운로드 URL을 공지문에 직접 넣지 않는다.
- 첫 구현에서 새 공개 UI 또는 관리자 UI를 만들지 않는다.

## 공지문 생성 기준

공지문 생성 대상은 기존 카카오 알림 dry-run과 같은 공개자료 기준을 따른다.

- `Document.category = "DISCLOSURE"`
- `Document.status = "APPROVED"`
- `Document.subCategory`가 존재하거나 정규화 가능

자료가 생성되거나 수정되면 서버는 공지문 텍스트를 생성한다. 문서 저장이 성공했다면 공지문 생성 실패 때문에 문서 저장 응답이 실패하면 안 된다.

## 공지문 형식

첫 구현의 기본 템플릿은 고정된 정보성 문구로 둔다.

```text
[대방동 지역주택조합 공개자료 안내]

새 공개자료가 등록되었습니다.
- 분류: {subCategory}
- 제목: {title}
- 등록일: {publishedAt}

홈페이지 로그인 후 공개자료 메뉴에서 확인해 주세요.
{siteUrl}/disclosure
```

규칙:

- 제목과 분류는 한 줄 공지에 맞게 공백을 정리한다.
- `publishedAt`이 없으면 `createdAt` 또는 현재 생성 시각을 사용한다.
- 링크는 공개자료 페이지까지만 안내하고 파일 직접 링크는 넣지 않는다.
- 공지문은 정보성 안내로 유지하고 홍보성 문구를 넣지 않는다.

## 데이터 모델

새 테이블 `OpenChatAnnouncement`를 추가한다.

필드:

- `id`
- `documentId`
- `status`: `DRAFT`, `COPIED`, `ARCHIVED`
- `message`
- `createdAt`
- `updatedAt`
- `copiedAt`

규칙:

- 같은 문서에 대해 중복 생성하지 않는다. 문서가 수정되면 기존 `DRAFT` 공지문은 최신 문서 정보로 갱신한다.
- 이미 `COPIED` 상태인 공지문은 자동으로 덮어쓰지 않는다. 수정 후 새 공지문이 필요하면 운영자가 `--force`로 재생성한다.
- 문서가 삭제되면 공지문도 cascade 삭제한다.

## 서버 모듈

새 모듈을 둔다.

- `src/lib/notifications/openchat-announcements.ts`

책임:

- 공개자료 대상 여부 판단
- 공지문 텍스트 생성
- `OpenChatAnnouncement` upsert
- 복사 완료 상태 마킹
- 공지문 목록 조회용 포맷 생성

기존 `disclosure-notifications.ts`와 직접 결합하지 않는다. 문서 API에서 두 코디네이터를 각각 호출한다.

## 운영 CLI

첫 구현은 CLI 중심으로 제공한다.

### `pnpm openchat:announcements`

최근 생성된 오픈채팅 공지문 목록을 조회한다.

옵션:

- `--document-id <id>`: 특정 문서 공지문만 조회
- `--limit <number>`: 기본 10개
- `--include-archived`: 보관 상태 포함

### `pnpm openchat:copy`

특정 공지문의 전체 문구를 콘솔에 출력하고, 선택적으로 `COPIED` 상태로 표시한다.

옵션:

- `--announcement-id <id>`
- `--document-id <id>`
- `--mark-copied`: 출력 후 `COPIED` 상태로 변경

### `pnpm openchat:generate`

특정 문서의 공지문을 수동 생성 또는 재생성한다.

옵션:

- `--document-id <id>`
- `--force`: 이미 복사된 공지문도 새 `DRAFT`로 재생성

## API 연결

문서 생성/수정 route에서 공개자료 저장이 성공한 뒤 `upsertOpenChatAnnouncementForDocument`를 호출한다.

오류 처리:

- 공지문 생성 실패는 서버 로그로 남긴다.
- 문서 업로드/수정 응답은 실패시키지 않는다.

## 테스트 범위

- 공개자료가 아니면 공지문을 생성하지 않는다.
- 승인 전 문서는 공지문을 생성하지 않는다.
- 승인 공개자료는 공지문 텍스트를 생성한다.
- 파일 URL이 공지문에 들어가지 않는다.
- 기존 `DRAFT` 공지문은 문서 수정 시 갱신한다.
- `COPIED` 공지문은 기본 동작에서 덮어쓰지 않는다.
- `--force`는 새 공지문 생성을 허용한다.
- 문서 API는 공지문 생성 실패에도 성공 응답을 유지한다.
- CLI 도움말과 dry-run/조회 동작을 검증한다.

## 검증 명령

```powershell
pnpm test src/__tests__/openchat-announcements.test.ts
pnpm test src/__tests__/document-upload-api.test.ts
pnpm lint
pnpm test
pnpm build
```

## 후속 가능 범위

첫 CLI 운영이 안정화되면 관리자 UI에 "오픈채팅 공지문 복사" 버튼을 추가할 수 있다. 이 경우 visible UI 변경이므로 `DESIGN.md` 확인과 `dbapt-site-ui-review`가 필요하다.
