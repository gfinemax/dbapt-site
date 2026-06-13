# 오픈채팅 공개자료 공지문 생성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 승인된 공개자료 등록/수정 시 오픈채팅방에 붙여넣을 공지문을 자동 생성하고 CLI로 조회/복사/재생성할 수 있게 한다.

**Architecture:** Prisma에 `OpenChatAnnouncement` 모델을 추가하고, `src/lib/notifications/openchat-announcements.ts`가 공지문 생성/갱신/복사 상태를 담당한다. 기존 문서 API는 문서 저장 성공 뒤 오픈채팅 공지문 코디네이터를 호출하되, 공지문 생성 실패는 문서 응답 실패로 전파하지 않는다.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Prisma 7, Vitest, Node `--experimental-strip-types` 운영 스크립트.

---

## File Structure

- Modify `prisma/schema.prisma`: `Document` relation과 `OpenChatAnnouncement` 모델을 추가한다.
- Create `prisma/migrations/20260613234500_add_openchat_announcements/migration.sql`: DB migration.
- Create `src/lib/notifications/openchat-announcements.ts`: 공지문 대상 판단, 메시지 생성, upsert, force 재생성, 복사 상태 마킹, 출력 포맷.
- Modify `src/app/api/documents/route.ts`: 문서 생성 뒤 오픈채팅 공지문 코디네이터 호출.
- Modify `src/app/api/documents/[id]/route.ts`: 문서 수정 뒤 오픈채팅 공지문 코디네이터 호출.
- Create `scripts/openchat-announcements.ts`: 최근 공지문 조회 CLI.
- Create `scripts/openchat-copy.ts`: 공지문 본문 출력 및 `COPIED` 상태 마킹 CLI.
- Create `scripts/openchat-generate.ts`: 특정 문서 공지문 수동 생성/재생성 CLI.
- Modify `package.json`: openchat scripts 추가.
- Create `src/__tests__/openchat-announcements.test.ts`: 서비스 동작 테스트.
- Modify `src/__tests__/document-upload-api.test.ts`: API 트리거/실패 격리 테스트.
- Modify `_workspace/final/verification.md`: 검증 결과 기록.

---

### Task 1: Prisma Schema And Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260613234500_add_openchat_announcements/migration.sql`

- [ ] **Step 1: Add schema model**

Add `OpenChatAnnouncement` with `id`, `documentId`, `status`, `message`, `copiedAt`, `createdAt`, `updatedAt`; add `openChatAnnouncements OpenChatAnnouncement[]` to `Document`.

- [ ] **Step 2: Add SQL migration**

Create `OpenChatAnnouncement` table, `documentId/status/createdAt` indexes, and cascade FK to `Document`.

- [ ] **Step 3: Generate Prisma client**

Run: `pnpm exec prisma generate`

Expected: PASS.

---

### Task 2: Announcement Service TDD

**Files:**
- Create: `src/__tests__/openchat-announcements.test.ts`
- Create: `src/lib/notifications/openchat-announcements.ts`

- [ ] **Step 1: Write failing tests**

Cover:

- non-disclosure or non-approved document is skipped
- approved disclosure document creates a message
- message includes disclosure page link but not file path
- existing `DRAFT` announcement updates
- existing `COPIED` announcement is not overwritten without force
- force creates a new `DRAFT`
- marking copied sets status and copiedAt
- formatting list rows shows id/status/document title

- [ ] **Step 2: Verify red**

Run: `pnpm test src/__tests__/openchat-announcements.test.ts`

Expected: FAIL because the service module does not exist.

- [ ] **Step 3: Implement service**

Implement `buildOpenChatAnnouncementMessage`, `upsertOpenChatAnnouncementForDocument`, `markOpenChatAnnouncementCopied`, and `formatOpenChatAnnouncement`.

- [ ] **Step 4: Verify green**

Run: `pnpm test src/__tests__/openchat-announcements.test.ts`

Expected: PASS.

---

### Task 3: Document API Trigger TDD

**Files:**
- Modify: `src/__tests__/document-upload-api.test.ts`
- Modify: `src/app/api/documents/route.ts`
- Modify: `src/app/api/documents/[id]/route.ts`

- [ ] **Step 1: Write failing API tests**

Mock the openchat service and assert:

- POST `/api/documents` calls `upsertOpenChatAnnouncementForDocument` after approved disclosure creation
- PATCH `/api/documents/[id]` calls it after approved disclosure update
- openchat service rejection does not fail a successful document write

- [ ] **Step 2: Verify red**

Run: `pnpm test src/__tests__/document-upload-api.test.ts`

Expected: FAIL because route handlers do not call openchat service yet.

- [ ] **Step 3: Wire the coordinator**

Import `upsertOpenChatAnnouncementForDocument` and call it after document create/update. Wrap in `try/catch` and log failures.

- [ ] **Step 4: Verify green**

Run: `pnpm test src/__tests__/document-upload-api.test.ts`

Expected: PASS.

---

### Task 4: Operational CLI

**Files:**
- Create: `scripts/openchat-announcements.ts`
- Create: `scripts/openchat-copy.ts`
- Create: `scripts/openchat-generate.ts`
- Modify: `package.json`

- [ ] **Step 1: Add scripts**

Use `scripts/notify-utils.ts` for argument parsing and Prisma client creation.

- [ ] **Step 2: Add package scripts**

Add:

```json
"openchat:announcements": "node --experimental-strip-types scripts/openchat-announcements.ts",
"openchat:copy": "node --experimental-strip-types scripts/openchat-copy.ts",
"openchat:generate": "node --experimental-strip-types scripts/openchat-generate.ts"
```

- [ ] **Step 3: Smoke test help output**

Run:

```powershell
pnpm openchat:announcements -- --help
pnpm openchat:copy -- --help
pnpm openchat:generate -- --help
```

Expected: each command prints usage and exits 0.

---

### Task 5: Verification And Completion

**Files:**
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused tests**

Run:

```powershell
pnpm test src/__tests__/openchat-announcements.test.ts
pnpm test src/__tests__/document-upload-api.test.ts
```

- [ ] **Step 2: Apply migration if needed**

Run:

```powershell
pnpm exec prisma migrate status
pnpm exec prisma migrate deploy
```

- [ ] **Step 3: Run project checks**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

- [ ] **Step 4: Record verification**

Update `_workspace/final/verification.md` with changed files, command results, and UI review status.
