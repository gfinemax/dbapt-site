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

## Dry Run

DB에 쓰지 않고 입력값만 검증한다.

```powershell
pnpm user:create -- --login-id test1001 --password "change-this-password" --name "테스트" --role MEMBER --dry-run
```
