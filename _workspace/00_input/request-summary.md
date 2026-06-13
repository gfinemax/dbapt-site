# 요청 요약

- 요청 기능: 공개자료 등록/수정 시 카카오톡 오픈채팅방에 붙여넣을 공지문을 자동 생성하고 운영자가 CLI로 조회/복사할 수 있게 구현한다.
- 구현 범위: `OpenChatAnnouncement` DB 모델, 공지문 생성/갱신/복사 상태 서비스, 문서 생성/수정 route 연결, 운영 CLI.
- 제외 범위: 오픈채팅방 직접 자동 게시, 카카오톡 PC/개인 계정/비공식 봇 자동화, 새 공개 UI 또는 관리자 UI.
- 적용 spec: `docs/superpowers/specs/2026-06-13-openchat-disclosure-announcement-design.md`
- 미결정 사항: none
