# Spec Selection

- Selected approved spec path: Existing authenticated portal preview and repository UI rules in `AGENTS.md`.
- Implementation boundary: Restore the post-login 안내 modal on role-specific portal pages without changing redirect rules, access rules, document APIs, or permissions. The existing homepage modal may remain available when a logged-in user visits `/`.
- Request/spec conflicts: none. The login flow already redirects authenticated users from `/login` to `/portal/*`, so the modal must also be available in `PortalShell`.
- Planning may continue: yes
