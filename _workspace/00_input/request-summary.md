# 요청 요약

- 요청 기능: 이전 dry-run 구현의 다음 단계로, 실제 수신자 검토를 위한 운영 도구를 보강한다.
- 구현 범위: 조합원 연락처/알림 가능 상태 설정 CLI, 공개자료 알림 로그 조회 CLI, 관련 포맷/검증 유틸과 테스트.
- 제외 범위: 공개 구독 UI, 마케팅 메시지, 브라우저로 노출되는 카카오 자격 증명, 실제 카카오 공급사 live 발송, 새 DB migration.
- 적용 spec: `docs/superpowers/specs/2026-06-13-disclosure-kakao-group-notification-design.md`
- 미결정 사항: live 발송 정책은 아직 미확정이므로 구현 기본값은 dry-run으로 둔다.
