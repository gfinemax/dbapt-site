# Spec 선택

- 선택한 승인 spec: `docs/superpowers/specs/2026-06-13-disclosure-kakao-group-notification-design.md`
- 구현 경계:
  - `DISCLOSURE` + `APPROVED` 문서만 자동 알림 대상이다.
  - 공개자료 하위 분류와 알림 그룹은 명시적 규칙으로 매칭한다.
  - 활성/비대기 사용자 중 전화번호와 발송 가능 플래그가 있는 사용자만 live 후보가 된다.
  - 이번 slice는 dry-run 검토에 필요한 연락처 설정과 로그 조회 운영 도구를 추가한다.
  - 외부 카카오 공급사 live 호출은 아직 하지 않는다.
- 요청/spec 충돌: none
- 계획 진행 가능 여부: 가능
