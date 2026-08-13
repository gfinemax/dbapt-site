# 게시판 유튜브 영상 구현 계획

**Goal:** 공지사항과 자유게시판에서 유튜브 링크를 저장·수정하고 상세 화면에서 안전하게 재생한다.

1. 유튜브 URL 파서와 개인정보 보호 강화 embed URL 생성기를 테스트 우선으로 추가한다.
2. `CoopNews`, `FreePost`에 nullable `youtubeVideoId` 필드와 additive migration을 추가한다.
3. 공지·자유게시판 생성 및 수정 API에서 링크를 검증해 영상 ID만 저장한다.
4. 공지 생성/수정과 자유게시판 생성/수정 UI에 URL 입력을 연결한다.
5. 공지와 자유게시판 상세에 공용 반응형 플레이어를 렌더링한다.
6. focused tests, `pnpm lint`, `pnpm test`, `pnpm build`, 데스크톱·모바일 브라우저 검증을 수행한다.
