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

운영자가 다른 사용자의 비밀번호를 초기화해야 하는 경우에는 웹 UI가 아니라 위의 `--update-existing` CLI 절차를 사용한다. 이때 계정 이름과 역할을 함께 확인해 의도치 않은 권한 변경이 없도록 한다.

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
