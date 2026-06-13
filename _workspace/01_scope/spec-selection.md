# Spec 선택

- 선택한 승인 spec: `docs/superpowers/specs/2026-06-13-disclosure-kakao-group-notification-design.md`
- 구현 경계:
  - `DISCLOSURE` + `APPROVED` 문서만 자동 알림 대상이다.
  - 공개자료 하위 분류와 알림 그룹은 명시적 규칙으로 매칭한다.
  - 활성/비대기 사용자 중 전화번호와 발송 가능 플래그가 있는 사용자만 live 후보가 된다.
  - 첫 구현은 dry-run 로그를 만들고 외부 카카오 공급사 호출은 하지 않는다.
  - 문서 저장은 카카오 알림 실패 때문에 실패하면 안 된다.
- 요청/spec 충돌: none
- 계획 진행 가능 여부: 가능
