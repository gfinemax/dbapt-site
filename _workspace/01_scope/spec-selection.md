# Spec Selection

- selected approved spec path: `docs/superpowers/specs/2026-05-28-daebang-auth-and-document-disclosure-design.md`
- implementation boundary: 인증 세션 기반 계정 기능 안에서 현재 로그인한 password-based 계정의 `passwordHash`만 변경한다. MEMBER, REFUND, ASSOCIATE, ADMIN 모두 같은 본인 변경 흐름을 사용한다.
- conflicts between request and spec: none
- planning may continue: yes
