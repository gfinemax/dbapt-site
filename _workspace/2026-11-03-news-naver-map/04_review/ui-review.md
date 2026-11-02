# UI Review

## Reviewed Change

- Feature: 자유게시판·공지사항 네이버 길찾기 링크 입력, 위치 확인, 게시글 지도 카드
- Governing spec: `docs/superpowers/specs/2026-11-03-news-naver-map-design.md`
- Implementation plan: `docs/superpowers/plans/2026-11-03-news-naver-map.md`
- Files or pages reviewed: 지도 입력 필드와 지도 카드의 소스·컴포넌트 테스트; 프로덕션 `/news?tab=notice` 데스크톱(1440px)과 `/news?tab=free` 모바일(390px) 렌더링

## Boundary Review

- Finding: PASS
- Evidence: 기존 공지 공개 범위, 자유게시판 로그인·공개 공유 범위, 댓글, 첨부파일, 유튜브 기능을 변경하지 않았다. 지도는 선택형 구조화 필드이며 임의 iframe·script를 허용하지 않는다.

## Truthful Presentation Review

- Finding: PASS
- Evidence: 내부 축약 좌표를 자동 확정하지 않고 사용자가 마커 또는 숫자 좌표로 위치를 확인해야 저장된다. 지도 SDK 실패 시 외부 길찾기 링크와 실패 안내를 유지한다.

## Design And Accessibility Review

- Finding: FIX
- Evidence: 기존 Pretendard·warm canvas·stone outline·pill action 스타일을 사용했고, 명시적 입력 라벨·숫자 좌표 대체 입력·focus-visible 스타일·모바일 세로 배치를 구현했다. 프로덕션 공지 데스크톱과 자유게시판 모바일 페이지가 레이아웃 깨짐 없이 렌더링되고, 모바일 자유게시판의 조합원 인증 잠금 화면도 정상 표시되는 것을 headless Edge/Chrome 캡처로 확인했다. 다만 운영에 테스트 글을 생성하지 않았으므로 로그인된 등록·수정 폼과 지도 데이터가 있는 게시글 카드의 실제 SDK 렌더링은 확인하지 못했다.

## Outcome

- Result: FIX
- Required action: 로그인된 검증 계정과 지도 데이터가 있는 검증용 게시글을 사용할 수 있을 때 공지·자유게시판의 등록, 수정, 열람 지도 카드를 데스크톱과 모바일에서 확인한다.
