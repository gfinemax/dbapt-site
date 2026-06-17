# PeopleOn 조합원 관리 MVP 설계

작성일: 2026-06-17
상태: 사용자 승인 후 1차 구현 대상

## 목표

관리자가 dbapt-site 관리자 포털에서 PeopleOn 조합원 원장과 홈페이지 계정 상태를 비교해 등기조합원, 환불 조합원, 홈페이지 미가입자, 가입 대기자, 권한 불일치 현황을 빠르게 확인한다.

## 범위

- PeopleOn `/api/members/table`을 서버에서 읽기 전용으로 호출한다.
- 홈페이지 DB의 `User` 계정과 PeopleOn 행을 이메일, 휴대폰, 이름+휴대폰 뒷자리 순서로 매칭한다.
- 관리자 전용 `/portal/admin/members` 페이지를 추가한다.
- 상단 통계 카드와 미가입/가입대기/권한불일치 중심 리스트를 제공한다.
- 기존 관리자 포털에서 새 관리 페이지로 이동하는 링크를 추가한다.

## 제외 범위

- PeopleOn 데이터 쓰기, 수정, 동기화 저장
- 정기 스케줄 동기화
- 수동 매칭 저장
- 대량 계정 생성
- PeopleOn 원장 상세 CRUD
- 공개 UI 노출

## 데이터 규칙

PeopleOn 행은 `is_registered`가 true이면 등기조합원 대상으로, `is_settlement_eligible`이 true이면 환불 조합원 대상으로 본다. 둘 다 true인 경우 환불 자격 검토가 더 시급하므로 권한 기대값은 `REFUND`로 표시한다.

홈페이지 계정 매칭은 다음 순서로 수행한다.

1. 이메일 완전 일치
2. 휴대폰 번호 정규화 후 일치
3. 이름 정규화 + 휴대폰 뒷자리 4자리 일치

매칭된 계정이 없으면 `홈페이지 미가입`, `PENDING`이면 `가입 승인 대기`, 기대 권한과 현재 권한이 다르면 `자격 불일치`로 분류한다.

## 환경 변수

- `PEOPLEON_MEMBERS_API_URL`: 기본값 `https://people-on.vercel.app/api/members/table`
- `PEOPLEON_MEMBERS_API_KEY`: PeopleOn API 호출용 키

키가 없거나 API 호출이 실패하면 페이지는 실패하지 않고 구성 안내와 현재 홈페이지 계정 통계만 표시한다.

## 검증

- 매칭/통계 유틸 단위 테스트
- 관리자 페이지 렌더링 테스트
- 관리자 포털 진입 링크 테스트
- `pnpm lint`
- 관련 테스트
- `pnpm build`
