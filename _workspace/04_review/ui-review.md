# UI Review

## Reviewed Change
- Feature: 공개자료 PDF 열람 모달 모바일 헤더 최적화
- Governing spec: 직접 사용자 버그 리포트 및 `DESIGN.md`
- Implementation plan: inline bugfix; 별도 계획 문서 없음
- Files or pages reviewed:
  - `src/components/portal/pdf-viewer-modal.tsx`
  - `src/__tests__/pdf-viewer-modal.test.tsx`
  - 공개자료/자료실의 `PdfViewerModal` 사용 표면

## Boundary Review
- Finding: PASS
- Evidence: 문서 열람 API, 다운로드 API, 권한 정책, 문서 목록 카드 동작은 변경하지 않았다. 변경은 모달 내부의 모바일 레이아웃 class와 접근 가능한 테스트 id 추가에 한정된다.

## Truthful Presentation Review
- Finding: PASS
- Evidence: 새 기능이나 권한을 암시하는 문구를 추가하지 않았다. 기존 `보안 열람 세션`, 발생일, 등록일, 파일 크기 정보만 모바일에서 줄바꿈 가능한 정보 행으로 재배치했다.

## Design And Accessibility Review
- Finding: PASS
- Evidence: 모바일에서는 헤더를 `flex-col`로 바꿔 제목 블록과 액션 버튼 행을 분리했고, 제목은 `whitespace-normal break-keep`로 한 글자씩 세로 분해되지 않게 했다. 버튼은 3열 grid pill 버튼으로 정렬해 터치 대상과 가독성을 확보했다. 본문 문서 카드도 모바일에서 파일명과 다운로드 버튼을 세로 배치한다. `pnpm test -- src/__tests__/pdf-viewer-modal.test.tsx`로 모바일 헤더 구조를 검증했다. Codex in-app Browser는 세션에서 `iab`가 unavailable이라 실제 시각 브라우저 검증은 수행하지 못했다.

## Outcome
- Result: PASS
- Required action: none
