# Account Management

운영 계정은 seed로 만들지 않는다. `pnpm exec prisma db seed`는 demo 데이터를 다시 쓰는 파괴적 작업이라 `CONFIRM_SEED_RESET=true`가 없으면 차단된다.

## Create A Member

```powershell
pnpm user:create -- --login-id member1001 --password "change-this-password" --name "홍길동" --role MEMBER
```

## Create A Refund Member

```powershell
pnpm user:create -- --login-id refund1001 --password "change-this-password" --name "홍길동" --role REFUND --total-paid 45000000 --refund-amount 38000000 --processed-state "정산 정보 등록 대기"
```

## Create An Admin

```powershell
pnpm user:create -- --login-id admin2 --password "change-this-password" --name "운영관리자" --role ADMIN
```

## Safer Password Entry

명령 기록에 비밀번호를 남기기 싫으면 환경변수로 넣고 실행한다.

```powershell
$env:DBAPT_USER_LOGIN_ID = "member1002"
$env:DBAPT_USER_PASSWORD = Read-Host "Password"
$env:DBAPT_USER_NAME = "김조합"
$env:DBAPT_USER_ROLE = "MEMBER"
pnpm user:create
Remove-Item Env:\DBAPT_USER_LOGIN_ID, Env:\DBAPT_USER_PASSWORD, Env:\DBAPT_USER_NAME, Env:\DBAPT_USER_ROLE
```

## Existing Accounts

같은 `loginId`가 이미 있으면 기본적으로 실패한다. 의도적으로 이름, 역할, 비밀번호를 갱신할 때만 `--update-existing`을 붙인다.

```powershell
pnpm user:create -- --login-id member1001 --password "new-password" --name "홍길동" --role MEMBER --update-existing
```

## User Password Changes

로그인 가능한 password-based 계정은 포털 상단의 프로필 메뉴에서 본인 비밀번호를 직접 변경할 수 있다. 관리자 계정도 본인 비밀번호 변경은 같은 화면을 사용한다.

사용자가 아이디 또는 비밀번호 도움을 요청하면 관리자는 `/portal/admin/account-recovery`의 `계정 도움` 화면에서 처리한다.

1. 요청자의 이름, 계정 아이디, 등록 휴대전화 끝 네 자리를 확인한다.
2. `사무국 전용 휴대전화` 또는 `관리자 개인 휴대전화`를 선택한다.
3. `안내문 준비`를 누른다.
4. 표시된 문구를 복사하거나 휴대전화에서 `문자 앱 열기`를 누른다.
5. 실제 문자 수신인이 맞는지 확인한 뒤 문자를 보낸다.
6. 사이트로 돌아와 `발송 완료로 표시`를 누른다.

비밀번호 재설정 링크는 12시간 동안 한 번만 사용할 수 있다. 새 링크를 만들면 그 계정의 이전 미사용 링크는 취소된다. 사용자가 비밀번호를 바꾸면 기존 로그인 세션도 만료되어 다시 로그인해야 한다.

사이트는 문자 발송업체와 연결되지 않으므로 `문자 앱 열기`만으로 발송 완료가 되지는 않는다. 휴대전화 문자 앱에서 직접 전송한 뒤 사이트에서 발송 완료를 표시해야 한다. 관리자 개인 휴대전화 번호는 사이트에 저장하지 않으며, 감사 기록에는 사용한 발송 수단만 남는다.

기존 비밀번호는 관리자도 확인할 수 없고, 사용자에게 기존 비밀번호를 알려 주면 안 된다. 다른 사용자의 비밀번호를 CLI의 `--update-existing`으로 직접 바꾸는 방식은 이름과 역할까지 덮어쓸 위험이 있으므로 일반 지원 절차로 사용하지 않는다.

Google 로그인만 사용하는 계정은 사이트 비밀번호가 없으므로 Google 계정에서 비밀번호를 관리한다.

## Disable Or Enable An Account

외부 공유 전 demo 계정을 잠그거나, 더 이상 접근하면 안 되는 계정을 비활성화할 때 사용한다. 비활성 계정은 비밀번호가 맞아도 로그인할 수 없다.

```powershell
pnpm user:status -- --login-id member1 --inactive
pnpm user:status -- --login-id refund1 --inactive
pnpm user:status -- --login-id admin --inactive
```

다시 활성화해야 하면:

```powershell
pnpm user:status -- --login-id member1 --active
```

## Dry Run

DB에 쓰지 않고 입력값만 검증한다.

```powershell
pnpm user:create -- --login-id test1001 --password "change-this-password" --name "테스트" --role MEMBER --dry-run
pnpm user:status -- --login-id member1 --inactive --dry-run
```
