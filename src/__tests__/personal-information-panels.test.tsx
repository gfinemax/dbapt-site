import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PersonalInformationAdminPanel } from "@/components/portal/personal-information-admin-panel";
import { PersonalInformationPanel } from "@/components/portal/personal-information-panel";

afterEach(() => vi.unstubAllGlobals());

describe("personal information panels", () => {
  it("shows masked profile values and opens a field-level correction dialog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        profile: {
          fields: [{ field: "phone", label: "휴대전화", value: "010-****-5678" }],
          accountCreatedAt: "2026-08-01T00:00:00.000Z",
          memberStatus: "MEMBER",
          lastConfirmedAt: null,
          updatedAt: null,
          peopleOnSyncedAt: null,
          hasPeopleOnBinding: true,
          peopleOn: {
            status: "CONNECTED",
            memberNumber: "56",
            joinedAt: "2009-07-13",
            certificateStatus: "발급 완료",
            certificateNumberSuffix: "1234",
          },
        },
        requests: [],
      }),
    }));
    render(<PersonalInformationPanel />);
    expect(await screen.findByText("010-****-5678")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "조합원 정보" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "주택 신청 정보" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "연락처" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "서류 및 신청 현황" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "보안 설정" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "휴대전화 수정 요청" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "연락처 변경" }));
    fireEvent.click(screen.getByRole("button", { name: /휴대전화/ }));
    expect(screen.getByRole("dialog", { name: "휴대전화" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "변경 요청 접수" })).toBeInTheDocument();
  });

  it("renders administrator approval and separate PeopleON reflection actions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requests: [{
          id: "request-1",
          memberName: "홍길동",
          label: "휴대전화",
          previousValue: "010-****-1111",
          requestedValue: "010-****-2222",
          status: "PENDING",
          peopleOnStatus: "PENDING",
          hasPeopleOnBinding: true,
          publicMemo: "번호 변경",
          adminMemo: null,
          createdAt: "2026-08-23T08:00:00.000Z",
        }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<PersonalInformationAdminPanel />);
    expect(await screen.findByText("홍길동 · 휴대전화")).toBeInTheDocument();
    expect(screen.getByText("010-****-1111 → 010-****-2222")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "승인" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/personal-info-requests/request-1",
      expect.objectContaining({ method: "PATCH" }),
    ));
  });
});
