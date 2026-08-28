# Spec Selection

- Selected approved spec: `docs/superpowers/specs/2026-06-17-peopleon-member-management-mvp-design.md`
- Implementation boundary: 관리자 전용 가입 승인과 `/portal/admin/members` 홈페이지 계정 관리 화면, 해당 화면으로 이어지는 관리자 사이드바만 변경한다. 두 명단은 클라이언트 탭으로 구분하고 검색 결과를 20명 단위로 페이지 처리하며, 사이드바 하위 링크의 해시에 따라 해당 탭을 연다. 예비조합원은 `role=MEMBER`, `memberType=PRELIMINARY`로 저장하고 관계자/기타는 기존 `ASSOCIATE` 계약을 사용한다. PeopleOn은 읽기 전용으로 유지한다.
- Conflicts: none
- Planning may continue: yes. The user's explicit implementation request approves extending the existing plan with this bounded follow-up.
