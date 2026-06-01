# Free Board Post Editing Plan

This plan introduces post editing/modification functionality to the login-gated free board of the Daebang Housing Cooperative site. It deletes the "Delete" (삭제) button from the upper-right corner of the post focus panel and replaces it with an "Edit" (수정) button. It also implements the corresponding server-side API support (`PATCH` method) and verifies the implementation with regression/unit tests.

## User Review Required

Document anything that requires user review or feedback, for example, breaking changes or significant design decisions.

> [!IMPORTANT]
> - The **Delete** button in the upper-right corner of the focus panel will be **removed**. The delete action remains available inside the main table row of the free board list for authors and admins.
> - The **Edit** button will be visible only to the post's author and administrators.

## Proposed Changes

### Database & API Layer

#### [MODIFY] [route.ts](file:///c:/workspace/antigravity/dbapt-site/src/app/api/news/free/route.ts)
- Add a `PATCH` handler to allow post editing.
- Validate that the user is authenticated.
- Ensure the user is either the author of the post or an administrator.
- Update the title and content of the post using Prisma.

---

### UI Components

#### [MODIFY] [free-board.tsx](file:///c:/workspace/antigravity/dbapt-site/src/components/news/free-board.tsx)
- Add state `editingPost` to track the post being edited.
- Replace the upper-right "삭제" button with an "수정" button that sets the editing state, pre-fills the form fields (`writeTitle` and `writeContent`), and opens the write/edit drawer.
- Modify `handleCreatePost` to check if `editingPost` is active. If so, invoke `PATCH` instead of `POST`.
- Reset `editingPost`, `writeTitle`, and `writeContent` states when closing or completing the drawer.
- Customize the drawer headings and submit button depending on whether the user is creating or modifying a post (e.g. "토론 게시글 수정" and "수정 완료").

---

### Verification and Testing

#### [NEW] [news-admin-controls.test.tsx](file:///c:/workspace/antigravity/dbapt-site/src/__tests__/news-admin-controls.test.tsx)
- Add test case: `"rejects post update for non-author and non-admin sessions"`
- Add test case: `"allows post update for the author"`
- Add test case: `"allows post update for administrators"`
- Add test case: `"renders the Edit button in the focus panel for eligible users"`

## Verification Plan

### Automated Tests
Run the test suite using `vitest` to verify both server and client changes:
```powershell
pnpm test
```

### Manual Verification
Run the development server and verify the flow in the browser:
1. Access the portal as an authenticated member.
2. Select a post to open it in the focus panel.
3. Verify that the "삭제" button is no longer present in the upper-right of the focus panel.
4. Verify that the "수정" button is visible and opens the drawer with the correct pre-filled title and rich content.
5. Save the edits and check that the focus panel and list view update instantly.
