# 구현 완료 검증

## 구현 요약

- 공개자료 카카오 알림톡 그룹 발송 설계의 첫 slice를 dry-run 중심으로 구현했다.
- Prisma에 알림 그룹, 그룹 멤버, 공개자료 알림 규칙, 문서 단위 발송 로그, 수신자별 발송 로그 모델을 추가했다.
- `User`에 운영 알림용 `phone`, `kakaoNotificationOptIn`, `kakaoNotificationEnabled` 필드를 추가했다.
- 승인된 공개자료 생성/수정 뒤 서버 알림 코디네이터를 호출하도록 문서 API를 연결했다.
- 알림 코디네이터 실패는 문서 업로드/수정 응답 실패로 전파하지 않고 서버 로그로만 남긴다.
- 운영 CLI를 추가했다: `notify:group`, `notify:member`, `notify:rule`, `notify:dry-run`.

## 주요 변경 파일

- `prisma/schema.prisma`
- `prisma/migrations/20260613231000_add_disclosure_kakao_notifications/migration.sql`
- `src/lib/notifications/disclosure-notifications.ts`
- `src/lib/notifications/kakao-provider.ts`
- `src/app/api/documents/route.ts`
- `src/app/api/documents/[id]/route.ts`
- `scripts/notify-utils.ts`
- `scripts/notify-group.ts`
- `scripts/notify-member.ts`
- `scripts/notify-rule.ts`
- `scripts/notify-dry-run.ts`
- `src/__tests__/disclosure-notifications.test.ts`
- `src/__tests__/document-upload-api.test.ts`
- `package.json`

## 검증 결과

- `pnpm exec prisma generate`: PASS
- `pnpm notify:group -- --help`: PASS
- `pnpm notify:member -- --help`: PASS
- `pnpm notify:rule -- --help`: PASS
- `pnpm notify:dry-run -- --help`: PASS
- `pnpm test src/__tests__/disclosure-notifications.test.ts`: PASS
- `pnpm test src/__tests__/document-upload-api.test.ts`: PASS
- `pnpm lint`: PASS, 기존 `src/components/portal/document-table.tsx` unused warning 1개 유지
- `pnpm test`: PASS, 23 files / 147 tests
- `pnpm build`: PASS

## DB 적용

- `pnpm exec prisma migrate status`: 신규 migration `20260613231000_add_disclosure_kakao_notifications` 미적용 확인
- `pnpm exec prisma migrate deploy`: PASS, Supabase Postgres에 신규 migration 적용 완료

## UI 검증

- visible UI 변경 없음
- `dbapt-site-ui-review` 및 브라우저 레이아웃 검증 대상 아님

## 남은 리스크

- 실제 카카오 live 발송은 아직 미구현 guard 상태다.
- live 전환 전 알림톡 템플릿 승인, 공급사 자격 증명, 필수 운영 고지/수신 동의 정책 결정이 필요하다.
- 현재 기본값은 `KAKAO_NOTIFICATION_MODE`가 `live`가 아닌 한 dry-run이다.
