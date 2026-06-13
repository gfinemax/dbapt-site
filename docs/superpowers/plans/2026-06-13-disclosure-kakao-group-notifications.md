# 공개자료 카카오 알림톡 그룹 발송 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 승인된 공개자료 등록/수정 시 권한 그룹 기준 카카오 알림톡 dry-run 로그를 만들고, 운영자가 그룹/규칙/수신자를 CLI로 관리할 수 있게 한다.

**Architecture:** Prisma에 알림 그룹, 멤버, 공개자료 알림 규칙, 발송 로그 모델을 추가한다. 서버 전용 `src/lib/notifications` 모듈에서 수신자 계산과 dry-run 로그 생성을 담당하고, 문서 생성/수정 API는 저장 성공 뒤 코디네이터를 호출하되 실패를 업로드 응답으로 전파하지 않는다.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Prisma 7, Vitest, Node `--experimental-strip-types` 운영 스크립트.

---

## File Structure

- Modify `prisma/schema.prisma`: `User` 연락처/발송 가능 플래그와 알림 관련 모델/관계를 추가한다.
- Create `prisma/migrations/20260613231000_add_disclosure_kakao_notifications/migration.sql`: DB migration.
- Create `src/lib/notifications/disclosure-notifications.ts`: 공개자료 알림 대상 계산, 로그 생성, dry-run/live 모드 분기.
- Create `src/lib/notifications/kakao-provider.ts`: 서버 전용 카카오 공급사 어댑터 경계. 첫 slice는 dry-run과 live 미구현 guard만 제공한다.
- Modify `src/app/api/documents/route.ts`: 승인 공개자료 생성 뒤 알림 코디네이터 호출.
- Modify `src/app/api/documents/[id]/route.ts`: 승인 공개자료 수정 뒤 알림 코디네이터 호출.
- Create `scripts/notify-group.ts`, `scripts/notify-member.ts`, `scripts/notify-rule.ts`, `scripts/notify-dry-run.ts`: 운영 CLI.
- Modify `package.json`: notify scripts 추가.
- Create `src/__tests__/disclosure-notifications.test.ts`: 서비스 동작 테스트.
- Modify `src/__tests__/document-upload-api.test.ts`: API 트리거/실패 격리 테스트.

---

### Task 1: Prisma Schema And Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260613231000_add_disclosure_kakao_notifications/migration.sql`

- [ ] **Step 1: Add schema relations and fields**

Add `phone`, `kakaoNotificationOptIn`, `kakaoNotificationEnabled` to `User`, notification relations to `User` and `Document`, and new models: `NotificationGroup`, `NotificationGroupMember`, `DisclosureNotificationRule`, `DisclosureNotification`, `DisclosureNotificationRecipient`.

- [ ] **Step 2: Add SQL migration**

Create tables and indexes matching the schema. Use text status fields to match the repo's current string status convention.

- [ ] **Step 3: Run Prisma generation**

Run: `pnpm exec prisma generate`

Expected: Prisma client generated successfully.

---

### Task 2: Notification Coordinator TDD

**Files:**
- Create: `src/__tests__/disclosure-notifications.test.ts`
- Create: `src/lib/notifications/disclosure-notifications.ts`
- Create: `src/lib/notifications/kakao-provider.ts`

- [ ] **Step 1: Write failing tests**

Cover:

- non-`DISCLOSURE` or non-`APPROVED` documents return `SKIPPED`
- no matching rules creates a skipped notification
- matching rules dedupe users across groups
- inactive, `PENDING`, missing phone, opt-out, disabled users are skipped/excluded correctly
- dry-run creates recipient rows without provider calls
- duplicate document trigger is skipped unless forced

- [ ] **Step 2: Verify red**

Run: `pnpm test src/__tests__/disclosure-notifications.test.ts`

Expected: FAIL because `@/lib/notifications/disclosure-notifications` does not exist.

- [ ] **Step 3: Implement minimal coordinator**

Implement `notifyDisclosureDocumentApproved`, `resolveDisclosureNotificationRecipients`, `normalizeDisclosureNotificationSubCategory`, and status constants.

- [ ] **Step 4: Verify green**

Run: `pnpm test src/__tests__/disclosure-notifications.test.ts`

Expected: PASS.

---

### Task 3: Document API Trigger TDD

**Files:**
- Modify: `src/__tests__/document-upload-api.test.ts`
- Modify: `src/app/api/documents/route.ts`
- Modify: `src/app/api/documents/[id]/route.ts`

- [ ] **Step 1: Write failing API tests**

Mock the notification module and assert:

- POST `/api/documents` calls coordinator after approved disclosure creation
- PATCH `/api/documents/[id]` calls coordinator after approved disclosure update
- coordinator rejection does not turn successful document writes into 500 responses

- [ ] **Step 2: Verify red**

Run: `pnpm test src/__tests__/document-upload-api.test.ts`

Expected: FAIL because route handlers do not call the coordinator yet.

- [ ] **Step 3: Wire the coordinator**

Import `notifyDisclosureDocumentApproved` and call it after `prisma.document.create`/`update`. Wrap the call in `try/catch` and log failures.

- [ ] **Step 4: Verify green**

Run: `pnpm test src/__tests__/document-upload-api.test.ts`

Expected: PASS.

---

### Task 4: Operational CLI

**Files:**
- Create: `scripts/notify-group.ts`
- Create: `scripts/notify-member.ts`
- Create: `scripts/notify-rule.ts`
- Create: `scripts/notify-dry-run.ts`
- Modify: `package.json`

- [ ] **Step 1: Add CLI scripts**

Use the same argument parsing and Prisma adapter pattern as `scripts/create-user.ts`. Each script supports `--dry-run`.

- [ ] **Step 2: Add package scripts**

Add:

```json
"notify:group": "node --experimental-strip-types scripts/notify-group.ts",
"notify:member": "node --experimental-strip-types scripts/notify-member.ts",
"notify:rule": "node --experimental-strip-types scripts/notify-rule.ts",
"notify:dry-run": "node --experimental-strip-types scripts/notify-dry-run.ts"
```

- [ ] **Step 3: Smoke test help output**

Run:

```powershell
pnpm notify:group -- --help
pnpm notify:member -- --help
pnpm notify:rule -- --help
pnpm notify:dry-run -- --help
```

Expected: each command prints usage and exits 0.

---

### Task 5: Verification And Completion Record

**Files:**
- Modify: `_workspace/final/verification.md`

- [ ] **Step 1: Run focused tests**

Run:

```powershell
pnpm test src/__tests__/disclosure-notifications.test.ts
pnpm test src/__tests__/document-upload-api.test.ts
```

- [ ] **Step 2: Run project checks**

Run:

```powershell
pnpm lint
pnpm test
pnpm build
```

- [ ] **Step 3: Record verification**

Update `_workspace/final/verification.md` with changed files, command results, and remaining live-send policy risk.
