# 대방동지역주택조합 2단계 설계 명세: 인증·권한 및 문서공개

작성일: 2026-05-28  
상태: 구현 계획 전 사용자 검토 대상 (초안)

## 1. 목표 및 범위

본 문서는 **대방동지역주택조합 홈페이지 구현의 2단계 범위**인 **인증, 권한 관리, 그리고 문서 정보공개 서비스**의 아키텍처 및 상세 설계를 제안한다.

1단계에서 구축된 정적 셸 미리보기 구조(Member, Refund-Member, Admin)를 실제 동작 가능한 인증 세션 및 안전한 권한 제어 기반의 문서 열람/업로드 서비스로 전환하는 것을 골자로 한다.

---

## 2. 핵심 설계안 및 기술 선택지 (사용자 검토 필요)

실제 데이터베이스 연동과 사용자 세션 유지를 위해 다음과 같은 기술 선택지를 제안한다.

### 2.1 인증 및 세션 관리 기술
* **[권장] 선택지 A1: 경량 쿠키 기반 세션 (Custom JWT)**
  * **설명**: Next.js App Router의 `Middleware`와 `Server Actions`를 결합하여 JWT 토큰을 암호화 쿠키(httpOnly, secure)에 저장하고 검증하는 방식.
  * **장점**: 외부 라이브러리 의존성(NextAuth 등)을 최소화하며, Next.js 16 및 React 19 환경에서 오류 없이 매우 가볍고 안정적으로 작동한다.
  * **단점**: 자체 로그인 및 역할 판정 비즈니스 로직을 직접 구현해야 함.
* **선택지 A2: NextAuth.js (Auth.js) 도입**
  * **설명**: Next.js 공식 권장 인증 라이브러리를 사용한 로그인 시스템 구축.
  * **장점**: 나중에 카카오톡, 네이버 등 소셜 로그인 연동이 필요할 때 확장이 쉬움.
  * **단점**: React 19/Next.js 16과의 버전 호환성 이슈를 주의해야 하며, 커스텀 DB 어댑터 설정 시 다소 무거움.

### 2.2 데이터베이스(DB) 및 ORM 선택지
* **[권장] 선택지 B1: SQLite + Prisma ORM**
  * **설명**: 프로젝트 내부에 `dev.db` 단일 파일로 데이터를 보관하는 경량 관계형 DB와 데이터베이스 스키마 및 쿼리 작성을 돕는 Prisma ORM을 결합.
  * **장점**: 로컬 개발과 서버 배포가 매우 간편하며(별도 DB 서버 설치 불필요), 완전한 타입 안정성(Type-safety)을 얻을 수 있다.
  * **단점**: 아주 대규모 트래픽 환경이나 고비용 쓰기 작업에는 부적합하나, 현재 조합 규모(수천 명 미만)의 조회 중심 서비스에는 최적.
* **선택지 B2: PostgreSQL + Prisma ORM**
  * **설명**: 프로덕션 표준 데이터베이스 연동.
  * **장점**: 실서비스 배포 시 확장성과 내구성이 가장 뛰어남.
  * **단점**: 로컬 개발 시 PostgreSQL 서버를 직접 띄우거나 클라우드 DB를 연결해야 하므로 셋업 비용 발생.
* **선택지 B3: 파일 기반 가상 JSON DB (NeDB / Lowdb)**
  * **설명**: 서버 내부에 JSON 파일 하나로 모든 사용자 및 문서 메타데이터를 저장 및 파싱.
  * **장점**: 추가 라이브러리 없이 순수 Node.js 파일 시스템 API만으로 매우 빠르게 연동 가능.
  * **단점**: 트랜잭션 보장이나 정밀한 관계 쿼리가 어려움.

### 2.3 문서(PDF, 첨부파일) 저장 방식
* **[권장] 선택지 C1: 로컬 보안 디렉토리 + 권한 검증 파일 스트리밍 API**
  * **설명**: 업로드된 파일을 `public/`이 아닌 서버 내부의 비공개 디렉토리(예: `uploads/`)에 저장하고, 다운로드 시 `/api/documents/[id]/download`와 같은 API 라우터가 세션을 검증한 후에만 파일을 읽어 스트리밍해 주는 방식.
  * **장점**: 로그인하지 않은 사람이나 권한이 없는 조합원이 다운로드 주소(URL)를 알아내어 불법으로 다운로드하는 것을 물리적으로 완벽히 차단함.
  * **단점**: 로컬 파일 시스템을 사용하므로, 멀티 서버(다중 컨테이너) 환경에서는 디스크 공유가 필요함.
* **선택지 C2: AWS S3 + 서명된 URL (Presigned URL)**
  * **설명**: 파일을 클라우드 S3에 비공개로 저장하고, 권한이 있는 사용자에게만 수 분간 유효한 임시 다운로드 주소를 발송.
  * **장점**: 대용량 파일 저장에 안전하며 멀티 서버 환경에 적합.
  * **단점**: AWS 계정 셋업 및 요금 발생.

### 2.4 PDF 저장 용량 최적화 기준

PDF 업로드는 원본과 압축본을 함께 저장하지 않고 최종 저장 파일 1개만 유지한다. 기본값은 `자동 최적화`이며, 5MB 초과 PDF만 최적화를 시도하고 15% 이상 줄어든 경우에만 최적화본을 저장한다. 품질 확인이 필요한 도면, 직인, 서명, 스캔 문서는 관리자가 `원본 그대로 저장`을 선택할 수 있다.

현재 기준은 PDF 내부 구조를 정리하는 안전한 최적화이며, 스캔 이미지를 강제 다운샘플링하거나 PDF를 이미지로 변환하지 않는다.

---

## 3. 데이터 모델 설계 (Prisma Schema 초안)

SQLite/PostgreSQL을 사용하는 경우 설계하게 될 핵심 테이블 스키마 구조이다.

```prisma
// 1. 사용자 계정 및 권한
model User {
  id            String      @id @default(uuid())
  loginId       String      @unique                  // 로그인 아이디 (조합원 번호 등)
  passwordHash  String                               // 암호화된 비밀번호
  name          String                               // 조합원 성명
  role          Role        @default(MEMBER)         // 권한: MEMBER (정식), REFUND (환불), ADMIN (관리자)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // 관계 정의
  documentLogs  DocumentLog[]
  refundInfo    RefundInfo?
  documentBookmarks PersonalDocumentBookmark[]
  contentBookmarks  PersonalContentBookmark[]
}

enum Role {
  MEMBER      // 정식 조합원 (전체 자료 열람 가능)
  REFUND      // 환불 조합원 (제한된 자료 및 환불 현황만 열람 가능)
  ADMIN       // 관리자 (문서 업로드, 승인, 회원 관리 등 가능)
}

// 2. 정보공개 및 회계 보고 문서
model Document {
  id           String       @id @default(uuid())
  title        String                                // 문서 제목
  description  String?                               // 문서 설명
  category     DocCategory                           // 의무공개자료 / 이사회·총회 / 예산·결산 / 수입·지출 등
  filePath     String                                // 업로드된 내부 파일 경로 (보안 저장)
  fileName     String                                // 원본 파일명
  fileSize     Int                                   // 파일 용량 (bytes)
  originalFileSize Int?                              // 업로드 원본 용량
  storedFileSize   Int?                              // 실제 저장된 최종 파일 용량
  uploadOptimizationStatus String?                   // 자동 최적화 적용 결과
  uploadReductionPercent   Int?                      // 용량 절감률
  status       DocStatus    @default(PENDING)        // 상태: PENDING (대기), APPROVED (승인/게시)
  publishedAt  DateTime?                             // 실제 조합원 대상 공개 일시
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  // 관계 정의
  logs         DocumentLog[]
  bookmarks    PersonalDocumentBookmark[]
}

model PersonalDocumentBookmark {
  id          String   @id @default(uuid())
  userId      String
  documentId  String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([userId, documentId])
}

model PersonalContentBookmark {
  id          String   @id @default(uuid())
  userId      String
  targetType  String
  targetId    String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
}

enum DocCategory {
  DISCLOSURE     // 의무 정보 공개 자료 (조합규약, 총회 의사록 등)
  ACCOUNTING     // 회계 및 자금 실적 보고
  NOTICE         // 조합원 중요 공지사항
}

enum DocStatus {
  PENDING        // 작성중 / 승인 대기
  APPROVED       // 승인 완료 (일반 조합원 화면 노출)
}

// 3. 보안 감사 로그 (열람 및 다운로드 이력)
model DocumentLog {
  id          String      @id @default(uuid())
  userId      String
  documentId  String
  actionType  LogAction   // VIEW (화면 열람), DOWNLOAD (파일 다운로드)
  ipAddress   String?     // 열람자 IP
  userAgent   String?     // 브라우저 정보
  createdAt   DateTime    @default(now())

  // 관계 정의
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  document    Document    @relation(fields: [documentId], references: [id], onDelete: Cascade)
}

enum LogAction {
  VIEW
  DOWNLOAD
}

// 4. 환불 조합원 전용 환불 정보 (1:1 매핑)
model RefundInfo {
  id             String      @id @default(uuid())
  userId         String      @unique
  totalPaid      Int         // 총 납부액
  refundAmount   Int         // 정산금액 (환불예정액)
  processedState String      // 정산 상태 (예: '정산 통지 완료', '서류 검토 중', '환불금 지급 대기')
  targetDate     DateTime?   // 지급 예정일
  updatedAt      DateTime    @updatedAt

  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 4. 세부 아키텍처 및 구현 계획

### 4.1 로그인 진입점 고도화
* `/login` 페이지에 **실제 아이디/비밀번호 입력 폼**을 배치하고, 검증 처리 로직을 구현한다.
* 인증 성공 시 세션 JWT 쿠키를 브라우저에 설정하고, 유저의 역할(`Role`)에 맞는 대시보드 주소로 리다이렉트한다.
  * `MEMBER` -> `/portal/member`
  * `REFUND` -> `/portal/refund`
  * `ADMIN` -> `/portal/admin`
* 비로그인 상태에서 대시보드 진입 시 Next.js Middleware를 사용하여 `/login`으로 튕겨내는 **접근 제어(Access Guard)**를 활성화한다.
* 로그인한 password-based 계정은 포털 프로필 메뉴에서 본인 비밀번호를 변경할 수 있다. 운영자 계정도 본인 비밀번호 변경은 같은 흐름을 사용한다.
* 비밀번호 변경은 현재 비밀번호 재확인, 새 비밀번호 확인 일치, 승인된 비밀번호 규칙 검증 후 현재 세션 사용자의 `passwordHash`만 갱신한다.
* Google 로그인처럼 사이트 비밀번호가 없는 계정은 사이트 내부 비밀번호 변경을 제공하지 않고 외부 계정 비밀번호 관리를 안내한다.

### 4.2 조합원용 문서 열람 및 검색 화면
* `/portal/member` 및 `/portal/refund`에 정적으로 렌더링되었던 빈 카드를 대체하여, **카테고리별 문서 목록 조회 테이블**을 제공한다.
* 제목 검색, 카테고리 필터링이 가능하도록 Client/Server 컴포넌트 쿼리를 결합한다.
* **환불조합원(`/portal/refund`)**은 권한 검증 API를 통해 지정된 공통 문서 카테고리와 자신의 개인 환불 현황(`RefundInfo`)만 조회할 수 있도록 필터를 고정한다.
* 공개자료와 권한 내 문서는 개인자료실 `내 보관함`에 저장할 수 있다.
* 공지사항, 조합뉴스, 자유게시판 게시글은 개인자료실 `보관한 게시글`에 저장할 수 있다.
* 개인자료실에서 문서를 열어도 전체 화면 PDF 뷰어로 열리며, 모든 PDF 뷰어는 `PDF만 크게` 전환을 제공한다.

### 4.3 관리자용 문서 관리 화면 (`/portal/admin`)
* **문서 업로드**: 관리자가 PDF 등 문서 파일을 선택하고 카테고리와 제목을 입력하여 업로드하는 다이얼로그 폼 구현.
  * PDF 기본 저장 방식은 `자동 최적화`이며, 필요 시 `원본 그대로 저장`을 선택할 수 있다.
* **승인 프로세스**: 업로드된 문서의 승인 상태 전환 토글을 제공하여, `APPROVED` 상태가 되어야만 일반 조합원에게 노출되도록 제어.
* **보안 감사 이력 확인**: 어떤 조합원이 어떤 문서를 언제 열람/다운로드했는지 감사 로그(`DocumentLog`) 테이블을 조회하는 목록 뷰를 관리자 화면 하단에 제공.

---

## 5. 법률 및 보안 제어 장치 (중요)

* **파일 불법 유출 원천 차단**: PDF/첨부파일은 URL 주소 공유만으로는 다운로드할 수 없도록, API 레벨에서 요청자의 쿠키 세션 권한을 무조건 1차 검증한 뒤 스트림으로 제공한다.
* **이력 보존 요건 충족**: 주택법 등에 따른 조합 정보공개 열람 이력 증빙 의무를 지원하기 위해, `DocumentLog` 데이터를 임의 삭제할 수 없도록 관리자 API에서도 삭제 기능은 차단하고 기록(Append-only)만 유지한다.

---

## 6. 다음 구현을 위한 의견 청취

2단계 세부 설계를 통과시키고 코딩에 착수하기 위해, 사용자님의 피드백을 수렴하고자 합니다.

> [!IMPORTANT]
> 1. **인증 방식 선택**: 경량화되고 외부 연동이 필요 없는 **A1(Custom JWT 쿠키)** 방식을 먼저 가동할까요?
> 2. **데이터베이스 선택**: 로컬 테스트 파일로 관리가 가장 쉽고 안정적인 **B1(SQLite + Prisma)**으로 데이터베이스 뼈대를 시작할까요?
> 3. **문서 저장소 선택**: 보안성이 우수한 **C1(로컬 보안 폴더 + 스트리밍 API)** 방식으로 문서 저장 설계를 채택할까요?
> 
> 이 3가지 사항이 정해지는 대로, 상세 구현 사양 파일 생성과 실제 테스트/코드 구현 계획 작성을 시작하겠습니다.
