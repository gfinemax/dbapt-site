# 공개자료 카카오 알림톡 그룹 발송 설계

## 목표

공개자료 카드에 자료가 등록되었을 때, 해당 자료를 볼 권한이 있는 조합원 그룹에게만 카카오 알림톡을 발송한다.

첫 구현 대상은 `Document`가 승인된 공개자료로 노출되는 시점이다.

- `Document.category = "DISCLOSURE"`
- `Document.status = "APPROVED"`
- 매핑 가능한 `Document.subCategory`가 있는 자료

기본 원칙은 전체 조합원에게 일괄 발송하지 않는 것이다. 자료 분류와 권한 그룹이 명시적으로 매칭된 경우에만 발송한다.

## 제외 범위

- 첫 단계에서는 공개 구독 설정 UI를 만들지 않는다.
- 홍보성 또는 마케팅성 카카오 메시지를 보내지 않는다.
- 카카오 API 키, 발신 프로필 키, 공급사 설정값을 브라우저에 노출하지 않는다.
- 공개자료 화면의 카드 UI만 보고 수신자를 추론하지 않는다.
- 이 기능으로 문서 열람 권한 자체를 바꾸지 않는다.

## 카카오 발송 채널

일반 카카오 Developers 친구/사용자 메시지 API가 아니라, 승인 템플릿 기반의 카카오 알림톡 또는 알림톡을 지원하는 비즈니스 메시지 공급사를 사용한다.

이 사이트의 요구사항은 "친구에게 메시지 보내기"가 아니라 "권한이 있는 조합원에게 운영성 안내를 발송"하는 것이므로, 알림톡 방식이 기본 설계에 더 맞다.

공급사 연동 세부사항은 서버 전용 어댑터 뒤에 감춘다. 이렇게 하면 첫 구현은 dry-run으로 검증하고, 이후 실제 카카오 비즈니스 메시지 공급사를 붙여도 문서 업로드 로직을 크게 바꾸지 않아도 된다.

참고:

- Kakao Developers 메시지 API: https://developers.kakao.com/docs/en/kakaotalk-message/common
- Kakao Business 알림톡 안내: https://kakaobusiness.gitbook.io/main/ad/infotalk

## 수신 그룹 모델

`User.role`만으로 발송 대상을 정하지 않고, 별도의 알림 수신 그룹을 둔다. 권한/업무 기준이 역할보다 더 세밀할 수 있기 때문이다.

### `NotificationGroup`

알림을 받을 수신자 그룹이다.

예시:

- `전체 정식 조합원`
- `대의원`
- `이사회`
- `환불 대상자`
- `회계자료 열람 대상`

필드:

- `id`
- `key`: 고정 slug, 예: `delegates`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`

### `NotificationGroupMember`

사용자를 알림 그룹에 연결한다.

필드:

- `id`
- `groupId`
- `userId`
- `createdAt`

규칙:

- 실제 발송 대상은 `User.isActive = true`인 사용자만 포함한다.
- `User.role = "PENDING"` 사용자는 실제 발송에서 제외한다.
- `(groupId, userId)`에는 unique 제약을 둔다.

### `DisclosureNotificationRule`

공개자료의 분류를 하나 이상의 수신 그룹에 연결한다.

필드:

- `id`
- `category`: 첫 단계에서는 항상 `DISCLOSURE`
- `subCategory`
- `correspondenceType`: 공문 세부 구분이 필요한 경우 사용, nullable
- `groupId`
- `isActive`
- `createdAt`
- `updatedAt`

규칙:

- `DisclosureClient`에서 이미 쓰는 정규화 기준과 맞춘다. 예: `수발신 공문 -> 공문서`, `이사회 회의록 -> 이사회 의사록`, `대의원 회의록 -> 대의원 의사록`
- 여러 규칙이 동시에 매칭되면 `userId` 기준으로 중복 수신자를 제거한다.
- 매칭되는 활성 규칙이 없으면 자동 발송하지 않고, `SKIPPED` 로그만 남긴다.

## 사용자 연락처와 동의 상태

카카오 알림톡 발송에는 수신자 휴대폰 번호가 필요하다. 현재 `User` 모델에는 운영 계정용 검증 휴대폰 필드가 없고, 가입 요청 단계에서 쓰는 전화번호 성격의 필드만 있다.

실제 발송 전에는 서버에서 관리되는 연락처 필드나 별도 연락처 테이블이 필요하다.

첫 단계 권장 필드:

- `User.phone`: nullable
- `User.kakaoNotificationOptIn`: boolean, 기본값 `false`
- `User.kakaoNotificationEnabled`: boolean, 기본값 `false`

실제 발송 조건:

- 활성 사용자
- `PENDING`이 아닌 역할
- 휴대폰 번호 존재
- 알림톡 수신 동의 또는 운영상 발송 가능 상태
- 알림 발송 enabled 상태

운영 정책상 공개자료 알림이 필수 고지라면 `kakaoNotificationOptIn`을 공개 마케팅 동의가 아니라 "관리자가 발송 가능으로 확인한 상태"로 해석할 수 있다. 다만 실제 live 발송 전에는 이 정책 결정을 먼저 확정해야 한다.

## 발송 로그

자동 알림은 감사 추적이 가능해야 한다. 발송 성공/실패뿐 아니라, 왜 발송하지 않았는지도 남긴다.

### `DisclosureNotification`

문서 단위 발송 시도 로그다.

필드:

- `id`
- `documentId`
- `trigger`: 예: `DOCUMENT_APPROVED`
- `status`: `PENDING`, `SENT`, `PARTIAL_FAILED`, `FAILED`, `SKIPPED`
- `matchedRuleCount`
- `recipientCount`
- `sentCount`
- `failedCount`
- `skippedReason`
- `createdAt`
- `updatedAt`

### `DisclosureNotificationRecipient`

수신자별 발송 결과 로그다.

필드:

- `id`
- `notificationId`
- `userId`
- `groupId`
- `phoneMasked`
- `status`: `PENDING`, `SENT`, `FAILED`, `SKIPPED`
- `providerMessageId`
- `errorCode`
- `errorMessage`
- `createdAt`
- `updatedAt`

## 발송 흐름

1. 관리자가 문서를 업로드하거나 수정한다.
2. 기존 관리자 문서 API를 통해 문서가 저장된다.
3. 저장 결과가 승인된 공개자료이면 서버 전용 알림 코디네이터를 호출한다.
4. 코디네이터가 `subCategory`와 `correspondenceType`을 정규화한다.
5. 활성화된 `DisclosureNotificationRule`을 조회한다.
6. 규칙에 연결된 그룹에서 발송 가능한 활성 수신자를 계산한다.
7. `DisclosureNotification`과 `DisclosureNotificationRecipient` 로그를 생성한다.
8. dry-run 모드에서는 실제 카카오 발송 없이 수신자 로그를 `SKIPPED`, 사유를 `DRY_RUN`으로 남긴다.
9. live 모드에서는 카카오 공급사 어댑터를 통해 발송하고 수신자별 결과를 기록한다.

카카오 발송 실패 때문에 문서 업로드 자체가 실패하면 안 된다. 문서 저장은 성공시키고, 알림 실패는 로그로 남겨 관리자가 나중에 확인할 수 있게 한다.

## 알림톡 템플릿

승인된 정보성 템플릿을 사용하고, 민감한 문서 내용이나 파일 URL은 메시지에 넣지 않는다.

권장 템플릿 변수:

- `#{documentTitle}`
- `#{documentCategory}`
- `#{publishedAt}`
- `#{siteUrl}`

예시 문구:

`[대방동 지역주택조합] 공개자료가 등록되었습니다. 분류: #{documentCategory}. 제목: #{documentTitle}. 홈페이지 로그인 후 확인해 주세요.`

링크는 개별 파일 URL이 아니라 로그인 또는 공개자료 페이지로 연결한다.

## 서버 어댑터

카카오 공급사 연동은 서버 전용 모듈로 격리한다.

권장 파일:

- `src/lib/notifications/kakao-provider.ts`
- `src/lib/notifications/disclosure-notifications.ts`

환경 변수:

- `KAKAO_NOTIFICATION_MODE=dry-run|live`
- `KAKAO_PROVIDER_API_KEY`
- `KAKAO_PROVIDER_SENDER_KEY`
- `KAKAO_ALIMTALK_TEMPLATE_CODE`
- `NEXT_PUBLIC_SITE_URL`

첫 구현은 외부 공급사 자격 증명 없이도 dry-run이 가능해야 한다.

## 관리자 운영 방식

첫 단계는 공개 UI보다 CLI 또는 서버 사이드 운영 도구를 우선한다.

필요한 운영 기능:

- 알림 그룹 생성/수정
- 그룹에 사용자 추가/제거
- 공개자료 분류와 수신 그룹 연결
- 특정 분류 기준 dry-run 수신자 확인
- 발송 로그 조회

권장 스크립트:

- `pnpm notify:group`
- `pnpm notify:member`
- `pnpm notify:rule`
- `pnpm notify:dry-run`

관리자 UI는 규칙과 발송 결과가 검증된 뒤 추가하는 편이 안전하다.

## 오류 처리

- 휴대폰 번호 없음: 수신자 로그 `SKIPPED`
- 비활성 사용자: 수신자 계산에서 제외
- 승인 대기 사용자: 수신자 계산에서 제외
- 매칭 규칙 없음: 알림 로그 `SKIPPED`
- 공급사 장애: 알림 로그 `FAILED` 또는 `PARTIAL_FAILED`
- 같은 문서에 대한 중복 트리거: 관리자가 명시적으로 강제 재발송하지 않는 한 재발송하지 않음

## 테스트 범위

단위/통합 테스트로 확인할 항목:

- 공개자료 하위 분류 정규화가 기존 라벨을 올바르게 매핑하는지
- 규칙이 매칭되는 그룹만 선택하는지
- 비활성 사용자와 승인 대기 사용자가 제외되는지
- 휴대폰 번호가 없는 사용자가 skip되는지
- 여러 그룹에 중복으로 속한 사용자가 한 번만 계산되는지
- dry-run이 공급사 호출 없이 로그만 생성하는지
- 공급사 실패가 문서 업로드 실패로 번지지 않는지
- 승인된 공개자료 업로드가 알림 코디네이터를 호출하는지
- 공개자료가 아니거나 승인 전 문서이면 live 발송이 발생하지 않는지

검증 명령:

```powershell
pnpm lint
pnpm test
pnpm build
```

## 단계별 적용 계획

1. Prisma schema와 migration에 그룹, 그룹 멤버, 규칙, 연락처 플래그, 발송 로그를 추가한다.
2. dry-run 알림 코디네이터와 테스트를 먼저 만든다.
3. 그룹/멤버/규칙 관리 CLI를 추가한다.
4. 문서 생성/수정 경로에 알림 코디네이터를 연결한다.
5. 로컬과 배포 환경에서 dry-run 로그를 검증한다.
6. 카카오 공급사 자격 증명과 승인 템플릿을 설정한다.
7. dry-run 수신자 목록을 수동 검토한 뒤에만 live 모드를 켠다.

## live 발송 전 정책 결정

실제 발송 전에 공개자료 알림톡이 필수 운영 고지인지, 명시적 수신 동의가 있는 사용자에게만 보내는 알림인지 확정해야 한다.

이 결정 전까지 구현 기본값은 dry-run으로 둔다. live 모드는 명시적인 관리자 설정과 발송 가능 상태가 모두 충족될 때만 허용한다.
