# Request Summary

- requested feature slice: PDF 업로드 시 서버 저장 용량 부담을 줄이기 위해 PDF 자동 최적화 기준을 적용한다.
- approved behavior: 저장소에는 원본+압축본을 병행 보관하지 않고 최종 저장 파일 1개만 유지한다. 기본값은 `자동 최적화`이며, 5MB 초과 PDF만 최적화를 시도하고 15% 이상 줄어든 경우에만 최적화본을 저장한다. 품질이 우려되는 문서는 관리자가 `원본 그대로 저장`을 선택할 수 있다.
- explicitly excluded scope: 이미지 자동 압축, PDF를 이미지로 변환하는 방식, 원본/압축본 이중 보관, 스캔 이미지 다운샘플링처럼 문서 품질을 손상시킬 수 있는 강압축, 문서 접근 권한/열람 로그/다운로드 정책 변경.
- candidate governing specification: current user-approved chat direction for PDF-only storage optimization.
- unanswered decision: none.
