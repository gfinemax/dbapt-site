import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DisclosurePageClientShell } from "@/components/disclosure/disclosure-page-client-shell";
import { DisclosureClient } from "@/components/disclosure/disclosure-client";
import { MeetingsTable } from "@/components/disclosure/meetings-table";
import { type Document } from "@/components/portal/document-table";

let mockedSearchParams = new URLSearchParams("tab=operations");

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return mockedSearchParams;
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  mockedSearchParams = new URLSearchParams("tab=operations");
});

describe("disclosure page", () => {
  it("opens the secured PDF viewer when a document id is provided in the URL", async () => {
    mockedSearchParams = new URLSearchParams("document=doc-operation-rules");

    render(
      <DisclosurePageClientShell
        session={{
          id: "member-1",
          loginId: "member1",
          name: "정식 조합원",
          role: "MEMBER",
        }}
        documents={[
          {
            id: "doc-operation-rules",
            title: "운영관리규정(260418 제정)",
            description: "2026년 4월18일 정기총회에서 제정",
            category: "DISCLOSURE",
            subCategory: "운영관리규정",
            fileName: "operation-rules.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-04-18T00:00:00.000Z",
            documentDate: "2026-04-18T00:00:00.000Z",
            createdAt: "2026-04-18T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(await screen.findByTestId("pdf-viewer-title")).toHaveTextContent("운영관리규정(260418 제정)");
    expect(screen.getByTitle("문서 온라인 열람 뷰어")).toHaveAttribute(
      "src",
      "/api/documents/doc-operation-rules/view",
    );
  });

  it("keeps correspondence direction in the category label without prefixing the document title", () => {
    render(
      <MeetingsTable
        isLoggedIn
        documents={[
          {
            id: "doc-sent",
            title: "[조합→서울시] 사업시행인가 본신청 접수",
            description: "발신 공문",
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "발신",
            fileName: "sent.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-01T00:00:00.000Z",
            documentDate: "2026-06-01T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
          {
            id: "doc-received",
            title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",
            description: "수신 공문",
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "수신",
            fileName: "received.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-02T00:00:00.000Z",
            documentDate: "2026-06-02T00:00:00.000Z",
            createdAt: "2026-06-02T00:00:00.000Z",
          },
          {
            id: "doc-reply",
            title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)",
            description: "회신 공문",
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "회신",
            fileName: "reply.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-03T00:00:00.000Z",
            documentDate: "2026-06-03T00:00:00.000Z",
            createdAt: "2026-06-03T00:00:00.000Z",
          },
        ]}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
      />
    );

    expect(screen.getAllByText("발신 공문").length).toBeGreaterThan(0);
    expect(screen.getAllByText("수신 공문").length).toBeGreaterThan(0);
    expect(screen.queryByText("발신")).not.toBeInTheDocument();
    expect(screen.queryByText("수신")).not.toBeInTheDocument();
    expect(screen.queryByText("회신")).not.toBeInTheDocument();
    expect(screen.getAllByText("[조합→서울시] 사업시행인가 본신청 접수").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)").length).toBeGreaterThan(0);
  });

  it("does not render demo disclosure documents when no documents are uploaded", () => {
    render(
      <MeetingsTable
        isLoggedIn
        documents={[]}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
      />
    );

    expect(screen.queryByText("[조합→서울시] 사업시행인가 본신청 접수")).not.toBeInTheDocument();
    expect(screen.queryByText("[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)")).not.toBeInTheDocument();
    expect(screen.queryByText(/데모 시연용/)).not.toBeInTheDocument();
  });

  it("places the business documents under operations and supervision", () => {
    const { container } = render(<DisclosureClient />);

    const rulesSection = container.querySelector("#section-rules");
    const operationsSection = container.querySelector("#section-operations");

    expect(rulesSection).toBeInTheDocument();
    expect(operationsSection).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("분기별 사업실적보고서")).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("토지 사용권원 및 소유권 확보 비율 명세서")).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("사업시행계획서 문서함")).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("공사시행 및 월별 공사진행 보고서")).toBeInTheDocument();
    expect(within(operationsSection as HTMLElement).getByText("분양신청 및 관련 자료 문서함")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "연간 자금운용계획" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "2026년도 연간 자금운용 계획 및 차입 예산서" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "5. 사업 및 감리" }));
    expect(screen.getByRole("button", { name: "토지확보" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "용역 계약서" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사업시행계획서" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공사시행" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "실적보고서" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "감리 보고서" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "분양" })).toBeInTheDocument();
  });

  it("splits meeting and administration disclosures into separate top tabs", () => {
    const { container } = render(<DisclosureClient />);

    expect(screen.queryByRole("button", { name: "2. 회의 및 행정" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2. 의사록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3. 공문서" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4. 회계 및 감사" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5. 사업 및 감리" })).toBeInTheDocument();

    const meetingsSection = container.querySelector("#section-meetings");
    const administrationSection = container.querySelector("#section-administration");
    expect(meetingsSection).toBeInTheDocument();
    expect(administrationSection).toBeInTheDocument();
    expect(within(meetingsSection as HTMLElement).getByText("총회의사록 문서함")).toBeInTheDocument();
    expect(within(meetingsSection as HTMLElement).getByText("이사회 의사록 문서함")).toBeInTheDocument();
    expect(within(meetingsSection as HTMLElement).getByText("대의원 의사록 문서함")).toBeInTheDocument();
    expect(within(meetingsSection as HTMLElement).queryByText("대관 공문서 문서함")).not.toBeInTheDocument();
    expect(within(administrationSection as HTMLElement).queryByText("대관 공문서 문서함")).not.toBeInTheDocument();
    expect(within(administrationSection as HTMLElement).getByText("수신 공문서 문서함")).toBeInTheDocument();
    expect(within(administrationSection as HTMLElement).getByText("발신 공문서 문서함")).toBeInTheDocument();
    expect(within(administrationSection as HTMLElement).getByText("기타 공문서 문서함")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "3. 공문서" }));
    expect(screen.getByRole("button", { name: "수신 공문" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "발신 공문" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기타 공문" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "총회 의사록" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2. 의사록" }));
    expect(screen.getByRole("button", { name: "총회 의사록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이사회 의사록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "대의원 의사록" })).toBeInTheDocument();
  });

  it("separates agency correspondence folders by received and sent direction", () => {
    const documents: Document[] = [
      {
        id: "doc-sent",
        title: "[조합→서울시] 사업시행인가 본신청 접수",
        description: "발신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "발신",
        fileName: "sent.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-01T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "doc-received",
        title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",
        description: "수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        fileName: "received.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-02T00:00:00.000Z",
        documentDate: "2026-06-02T00:00:00.000Z",
        createdAt: "2026-06-02T00:00:00.000Z",
      },
      {
        id: "doc-reply",
        title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)",
        description: "회신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        fileName: "reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-03T00:00:00.000Z",
        documentDate: "2026-06-03T00:00:00.000Z",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
    ];

    const { container } = render(
      <DisclosureClient
        session={{ id: "member-1", loginId: "member", name: "조합원", role: "MEMBER" }}
        documents={documents}
      />
    );

    const administrationSection = container.querySelector("#section-administration");
    expect(administrationSection).toBeInTheDocument();

    const receivedFolder = within(administrationSection as HTMLElement)
      .getByText("수신 공문서 문서함")
      .closest(".stone-card");
    const sentFolder = within(administrationSection as HTMLElement)
      .getByText("발신 공문서 문서함")
      .closest(".stone-card");

    expect(receivedFolder).toBeInTheDocument();
    expect(sentFolder).toBeInTheDocument();
    expect(within(receivedFolder as HTMLElement).getByText("[동작구청] 2025년도 행정실태점검 시정조치 요구")).toBeInTheDocument();
    expect(within(receivedFolder as HTMLElement).queryByText("[조합→서울시] 사업시행인가 본신청 접수")).not.toBeInTheDocument();
    expect(within(sentFolder as HTMLElement).getByText("[조합→서울시] 사업시행인가 본신청 접수")).toBeInTheDocument();
    expect(within(sentFolder as HTMLElement).getByText("[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)")).toBeInTheDocument();
    expect(within(sentFolder as HTMLElement).queryByText("[동작구청] 2025년도 행정실태점검 시정조치 요구")).not.toBeInTheDocument();
  });

  it("opens shared card registration for delegate meeting minutes", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2. 의사록" }));

    const delegateHeading = screen.getByRole("heading", { name: "대의원 의사록 문서함" });
    const delegateCard = delegateHeading.closest(".stone-card");
    expect(delegateCard).toBeInTheDocument();

    fireEvent.click(within(delegateCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));

    expect(screen.getAllByRole("heading", { name: "대의원 의사록 문서함" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "+ 신규 문서 등록" }));

    expect(screen.getByRole("heading", { name: "신규 정보공개 문서 등록" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("대의원 의사록");
  });

  it("uses the shared disclosure card layout for meeting and correspondence folders", () => {
    const documents: Document[] = [
      {
        id: "delegate-minutes",
        title: "대의원회 의사록 최신본",
        description: "대의원회 의결 결과",
        category: "DISCLOSURE",
        subCategory: "대의원 의사록",
        fileName: "delegate-minutes.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-06T00:00:00.000Z",
        documentDate: "2026-06-06T00:00:00.000Z",
        createdAt: "2026-06-06T00:00:00.000Z",
      },
      {
        id: "sent-correspondence",
        title: "서울시 발신 공문 최신본",
        description: "사업시행계획 협의 발신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "발신",
        fileName: "sent-correspondence.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-07T00:00:00.000Z",
        documentDate: "2026-06-07T00:00:00.000Z",
        createdAt: "2026-06-07T00:00:00.000Z",
      },
    ];

    const { container } = render(
      <DisclosureClient
        session={{ id: "member-1", loginId: "member", name: "조합원", role: "MEMBER" }}
        documents={documents}
      />
    );

    const meetingsSection = container.querySelector("#section-meetings");
    const administrationSection = container.querySelector("#section-administration");
    expect(meetingsSection).toBeInTheDocument();
    expect(administrationSection).toBeInTheDocument();

    const delegateCard = within(meetingsSection as HTMLElement)
      .getByRole("heading", { name: "대의원 의사록 문서함" })
      .closest(".stone-card");
    const sentCard = within(administrationSection as HTMLElement)
      .getByRole("heading", { name: "발신 공문서 문서함" })
      .closest(".stone-card");

    expect(delegateCard).toBeInTheDocument();
    expect(sentCard).toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).getByText("등록 자료")).toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).getByText("대의원회 의사록 최신본")).toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).getByRole("button", { name: "자료실 열기" })).toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).queryByText("문서함 내부 수납 목록")).not.toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).queryByRole("button", { name: "문서함 열기" })).not.toBeInTheDocument();

    expect(within(sentCard as HTMLElement).getByText("등록 자료")).toBeInTheDocument();
    expect(within(sentCard as HTMLElement).getByText("서울시 발신 공문 최신본")).toBeInTheDocument();
    expect(within(sentCard as HTMLElement).queryByText("대의원회 의사록 최신본")).not.toBeInTheDocument();
    expect(within(sentCard as HTMLElement).getByRole("button", { name: "자료실 열기" })).toBeInTheDocument();
  });

  it("lets admins edit meeting folder card title and content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        cardContent: {
          itemId: "meetings-3",
          title: "대의원회 의결 기록",
          description: "대의원회 의결 자료를 모아 둔 문서함입니다.",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    const delegateHeading = screen.getByRole("heading", { name: "대의원 의사록 문서함" });
    const delegateCard = delegateHeading.closest(".stone-card");
    expect(delegateCard).toBeInTheDocument();

    fireEvent.click(within(delegateCard as HTMLElement).getByRole("button", { name: "대의원 의사록 문서함 카드 제목과 내용 수정" }));

    expect(within(delegateCard as HTMLElement).getByRole("heading", { name: "공개자료 카드 문구 수정" })).toBeInTheDocument();
    fireEvent.change(within(delegateCard as HTMLElement).getByLabelText("카드 제목 *"), {
      target: { value: "대의원회 의결 기록" },
    });
    fireEvent.change(within(delegateCard as HTMLElement).getByLabelText("카드 내용 *"), {
      target: { value: "대의원회 의결 자료를 모아 둔 문서함입니다." },
    });
    fireEvent.click(within(delegateCard as HTMLElement).getByRole("button", { name: "저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/disclosure-card-contents",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"itemId\":\"meetings-3\""),
      }),
    ));
    expect(within(delegateCard as HTMLElement).getByText("대의원회 의결 기록")).toBeInTheDocument();
    expect(within(delegateCard as HTMLElement).getByText("대의원회 의결 자료를 모아 둔 문서함입니다.")).toBeInTheDocument();
  });

  it("lets direct card selection change the active card without changing list order", () => {
    const { container } = render(<DisclosureClient />);

    fireEvent.click(screen.getByRole("button", { name: "2. 의사록" }));
    fireEvent.click(screen.getByRole("button", { name: "대의원 의사록" }));

    const meetingsSection = container.querySelector("#section-meetings");
    expect(meetingsSection).toBeInTheDocument();

    let meetingCards = Array.from((meetingsSection as HTMLElement).querySelectorAll(".stone-card"));
    expect(within(meetingCards[0] as HTMLElement).getByRole("heading", { name: "총회의사록 문서함" })).toBeInTheDocument();
    expect(within(meetingCards[2] as HTMLElement).getByRole("heading", { name: "대의원 의사록 문서함" })).toBeInTheDocument();

    const generalMeetingCard = within(meetingsSection as HTMLElement)
      .getByRole("heading", { name: "총회의사록 문서함" })
      .closest(".stone-card");
    expect(generalMeetingCard).toBeInTheDocument();

    fireEvent.click(generalMeetingCard as HTMLElement);

    meetingCards = Array.from((meetingsSection as HTMLElement).querySelectorAll(".stone-card"));
    expect(within(meetingCards[0] as HTMLElement).getByRole("heading", { name: "총회의사록 문서함" })).toBeInTheDocument();
    expect(within(meetingCards[2] as HTMLElement).getByRole("heading", { name: "대의원 의사록 문서함" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "총회 의사록" })).toHaveClass("border-midnight");
  });

  it("filters correspondence tables by received or sent direction", () => {
    const documents: Document[] = [
      {
        id: "doc-sent",
        title: "[조합→서울시] 사업시행인가 본신청 접수",
        description: "발신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "발신",
        fileName: "sent.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-01T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "doc-received",
        title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",
        description: "수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        fileName: "received.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-02T00:00:00.000Z",
        documentDate: "2026-06-02T00:00:00.000Z",
        createdAt: "2026-06-02T00:00:00.000Z",
      },
      {
        id: "doc-reply",
        title: "[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)",
        description: "회신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        fileName: "reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-03T00:00:00.000Z",
        documentDate: "2026-06-03T00:00:00.000Z",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["발신", "회신"]}
      />
    );

    expect(screen.getAllByText("[조합→서울시] 사업시행인가 본신청 접수").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[조합→동작구청] 행정실태점검 조치결과 보고서 (3차)").length).toBeGreaterThan(0);
    expect(screen.queryByText("[동작구청] 2025년도 행정실태점검 시정조치 요구")).not.toBeInTheDocument();
  });

  it("uses the selected category filter after opening a sent correspondence folder", () => {
    const documents: Document[] = [
      {
        id: "doc-sent",
        title: "[조합→서울시] 사업시행인가 본신청 접수",
        description: "발신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "발신",
        fileName: "sent.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-01T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "doc-received",
        title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",
        description: "수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        fileName: "received.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-02T00:00:00.000Z",
        documentDate: "2026-06-02T00:00:00.000Z",
        createdAt: "2026-06-02T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["발신", "회신"]}
      />
    );

    expect(screen.getByDisplayValue("발신 공문")).toBeInTheDocument();
    expect(screen.getAllByText("[조합→서울시] 사업시행인가 본신청 접수").length).toBeGreaterThan(0);
    expect(screen.queryByText("[동작구청] 2025년도 행정실태점검 시정조치 요구")).not.toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("발신 공문"), {
      target: { value: "수신 공문" },
    });

    expect(screen.getByDisplayValue("수신 공문")).toBeInTheDocument();
    expect(screen.getAllByText("[동작구청] 2025년도 행정실태점검 시정조치 요구").length).toBeGreaterThan(0);
    expect(screen.queryByText("[조합→서울시] 사업시행인가 본신청 접수")).not.toBeInTheDocument();
  });

  it("removes the category column and places occurrence date first", () => {
    render(
      <MeetingsTable
        isLoggedIn
        documents={[
          {
            id: "doc-received",
            title: "[동작구청] 2025년도 행정실태점검 시정조치 요구",
            description: "수신 공문",
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "수신",
            fileName: "received.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-02T00:00:00.000Z",
            documentDate: "2026-06-02T00:00:00.000Z",
            createdAt: "2026-06-02T00:00:00.000Z",
          },
        ]}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    const columnHeaders = screen.getAllByRole("columnheader").map((header) => header.textContent);
    expect(columnHeaders.slice(0, 3)).toEqual(["발생일", "문서 제목", "회신기한"]);
    expect(screen.queryByRole("columnheader", { name: "No." })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "분류" })).not.toBeInTheDocument();
  });

  it("shows completed status in the due-date column for reply documents in the sent folder", () => {
    const documents: Document[] = [
      {
        id: "doc-reply",
        title: "[조합→동작구청] 행정실태점검 조치결과 보고서",
        description: "회신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        fileName: "reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-03T00:00:00.000Z",
        documentDate: "2026-06-03T00:00:00.000Z",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["발신", "회신"]}
      />
    );

    const row = screen.getAllByText("[조합→동작구청] 행정실태점검 조치결과 보고서")
      .map((element) => element.closest("tr"))
      .find(Boolean);

    expect(row).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("회신 완료")).toBeInTheDocument();
  });

  it("offers only pending received correspondence as reply targets", () => {
    const documents: Document[] = [
      {
        id: "received-pending",
        title: "회신 필요 대상 수신 공문",
        description: "회신 대상 선택 가능",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: false,
        fileName: "received-pending.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-01T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "received-no-reply",
        title: "회신 불필요 수신 공문",
        description: "선택지에서 제외",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: true,
        fileName: "received-no-reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-02T00:00:00.000Z",
        documentDate: "2026-06-02T00:00:00.000Z",
        createdAt: "2026-06-02T00:00:00.000Z",
      },
      {
        id: "received-completed",
        title: "회신 완료 수신 공문",
        description: "이미 회신 완료",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: false,
        fileName: "received-completed.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-03T00:00:00.000Z",
        documentDate: "2026-06-03T00:00:00.000Z",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
      {
        id: "reply-completed",
        title: "회신 완료 처리 공문",
        description: "회신 처리 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        replyToDocumentId: "received-completed",
        fileName: "reply-completed.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-04T00:00:00.000Z",
        documentDate: "2026-06-04T00:00:00.000Z",
        createdAt: "2026-06-04T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        role="ADMIN"
        documents={documents}
        router={{ push: vi.fn(), refresh: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["발신", "회신"]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "+ 신규 문서 등록" }));
    fireEvent.click(screen.getByLabelText("회신 공문으로 등록"));

    const targetSelect = screen.getByLabelText("회신 대상 수신 공문 (선택)");
    expect(within(targetSelect).getByRole("option", { name: "회신 필요 대상 수신 공문" })).toBeInTheDocument();
    expect(within(targetSelect).queryByRole("option", { name: "회신 불필요 수신 공문" })).not.toBeInTheDocument();
    expect(within(targetSelect).queryByRole("option", { name: "회신 완료 수신 공문" })).not.toBeInTheDocument();
  });

  it("marks received correspondence as complete when a reply document references it", () => {
    const documents: Document[] = [
      {
        id: "received-1",
        title: "동작구청 시정조치 요구 공문",
        description: "회신이 필요한 수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        fileName: "received.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-01T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "received-2",
        title: "서울시 보완 요청 수신 공문",
        description: "아직 회신 전인 수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        fileName: "received-2.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-02T00:00:00.000Z",
        documentDate: "2026-06-02T00:00:00.000Z",
        createdAt: "2026-06-02T00:00:00.000Z",
      },
      {
        id: "reply-1",
        title: "동작구청 시정조치 회신 공문",
        description: "회신 처리 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        replyToDocumentId: "received-1",
        fileName: "reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-03T00:00:00.000Z",
        documentDate: "2026-06-03T00:00:00.000Z",
        createdAt: "2026-06-03T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    const completedRow = screen.getAllByText("동작구청 시정조치 요구 공문")
      .map((element) => element.closest("tr"))
      .find(Boolean);
    const pendingRow = screen.getAllByText("서울시 보완 요청 수신 공문")
      .map((element) => element.closest("tr"))
      .find(Boolean);

    expect(completedRow).toBeInTheDocument();
    expect(pendingRow).toBeInTheDocument();
    expect(within(completedRow as HTMLElement).getByText("회신 완료")).toBeInTheDocument();
    expect(within(pendingRow as HTMLElement).getByText("회신 필요")).toBeInTheDocument();
  });

  it("marks received correspondence as not requiring a reply when flagged", () => {
    const documents: Document[] = [
      {
        id: "received-no-reply",
        title: "시정조치 대상 아님 안내 수신 공문",
        description: "회신이 필요 없는 수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: true,
        fileName: "received-no-reply.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-04T00:00:00.000Z",
        documentDate: "2026-06-04T00:00:00.000Z",
        createdAt: "2026-06-04T00:00:00.000Z",
      },
    ];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    const row = screen.getAllByText("시정조치 대상 아님 안내 수신 공문")
      .map((element) => element.closest("tr"))
      .find(Boolean);

    expect(row).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("회신 불필요")).toBeInTheDocument();
    expect(within(row as HTMLElement).queryByText("수신")).not.toBeInTheDocument();
    expect(within(row as HTMLElement).queryByText("회신 필요")).not.toBeInTheDocument();
  });

  it("shows reply due date column values for received correspondence that requires a reply", () => {
    const documents = [
      {
        id: "received-due",
        title: "동작구청 보완 요청 수신 공문",
        description: "회신기한이 있는 수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: false,
        replyDueDate: "2026-06-20T00:00:00.000Z",
        fileName: "received-due.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-04T00:00:00.000Z",
        documentDate: "2026-06-04T00:00:00.000Z",
        createdAt: "2026-06-04T00:00:00.000Z",
      },
    ] as Document[];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    const row = screen.getAllByText("동작구청 보완 요청 수신 공문")
      .map((element) => element.closest("tr"))
      .find(Boolean);

    expect(screen.getByText("회신기한")).toBeInTheDocument();
    expect(row).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("2026.06.20")).toBeInTheDocument();
  });

  it("keeps reply due date visible when received correspondence is completed", () => {
    const documents = [
      {
        id: "received-completed-due",
        title: "동작구청 회신 완료 대상 수신 공문",
        description: "회신기한이 있고 회신 완료된 수신 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "수신",
        replyNotRequired: false,
        replyDueDate: "2026-06-20T00:00:00.000Z",
        fileName: "received-completed-due.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-04T00:00:00.000Z",
        documentDate: "2026-06-04T00:00:00.000Z",
        createdAt: "2026-06-04T00:00:00.000Z",
      },
      {
        id: "reply-completed-due",
        title: "동작구청 회신 완료 처리 공문",
        description: "회신 처리 공문",
        category: "DISCLOSURE",
        subCategory: "수발신 공문",
        correspondenceType: "회신",
        replyToDocumentId: "received-completed-due",
        fileName: "reply-completed-due.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-05T00:00:00.000Z",
        documentDate: "2026-06-05T00:00:00.000Z",
        createdAt: "2026-06-05T00:00:00.000Z",
      },
    ] as Document[];

    render(
      <MeetingsTable
        isLoggedIn
        documents={documents}
        router={{ push: vi.fn() } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    const row = screen.getAllByText("동작구청 회신 완료 대상 수신 공문")
      .map((element) => element.closest("tr"))
      .find(Boolean);

    expect(row).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("회신 완료")).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText("2026.06.20")).toBeInTheDocument();
  });

  it("saves reply-not-required from the admin edit modal and updates the row status", async () => {
    const routerRefresh = vi.fn();
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url === "/api/documents/received-no-reply") {
        const body = JSON.parse(String(init?.body));
        return {
          ok: true,
          json: async () => ({
            success: true,
            document: {
              id: "received-no-reply",
              title: body.title,
              description: body.description,
              category: "DISCLOSURE",
              subCategory: "수발신 공문",
              correspondenceType: "수신",
              replyNotRequired: body.replyNotRequired,
              replyToDocumentId: null,
              fileName: "received-no-reply.pdf",
              fileSize: 1024,
              status: "APPROVED",
              publishedAt: "2026-06-04T00:00:00.000Z",
              documentDate: "2026-06-04T00:00:00.000Z",
              createdAt: "2026-06-04T00:00:00.000Z",
              attachments: [],
            },
          }),
        };
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MeetingsTable
        isLoggedIn
        role="ADMIN"
        documents={[
          {
            id: "received-no-reply",
            title: "시정조치 대상 아님 안내 수신 공문",
            description: "회신이 필요 없는 수신 공문",
            category: "DISCLOSURE",
            subCategory: "수발신 공문",
            correspondenceType: "수신",
            replyNotRequired: false,
            fileName: "received-no-reply.pdf",
            fileSize: 1024,
            status: "APPROVED",
            publishedAt: "2026-06-04T00:00:00.000Z",
            documentDate: "2026-06-04T00:00:00.000Z",
            createdAt: "2026-06-04T00:00:00.000Z",
            attachments: [],
          },
        ]}
        router={{ push: vi.fn(), refresh: routerRefresh } as never}
        initialFilterCat="수발신 공문"
        initialCorrespondenceTypes={["수신"]}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "시정조치 대상 아님 안내 수신 공문 문서 수정" })[0]);
    fireEvent.click(screen.getByLabelText("회신 불필요"));
    fireEvent.click(screen.getByRole("button", { name: "수정 저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/received-no-reply",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"replyNotRequired\":true"),
      }),
    ));
    expect(routerRefresh).toHaveBeenCalled();
    expect(await screen.findAllByText("회신 불필요")).not.toHaveLength(0);
  });

  it("shows received and sent correspondence as separate category filters", () => {
    render(
      <MeetingsTable
        isLoggedIn
        documents={[]}
        router={{ push: vi.fn() } as never}
      />
    );

    const categorySelect = screen.getByDisplayValue("전체 분류");
    expect(within(categorySelect).getByRole("option", { name: "수신 공문" })).toBeInTheDocument();
    expect(within(categorySelect).getByRole("option", { name: "발신 공문" })).toBeInTheDocument();
    expect(within(categorySelect).queryByRole("option", { name: "수발신 공문" })).not.toBeInTheDocument();
  });

  it("shows management regulation cards with uploaded document previews", () => {
    const documents: Document[] = [
      {
        id: "doc-operating-rule",
        title: "운영관리규정 최신본",
        description: "사무국 운영 및 문서 보존 절차",
        category: "DISCLOSURE",
        subCategory: "운영관리규정",
        fileName: "operating-rule.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-02-15T00:00:00.000Z",
        documentDate: "2026-02-14T00:00:00.000Z",
        createdAt: "2026-02-15T00:00:00.000Z",
      },
      {
        id: "doc-accounting-rule",
        title: "회계관리규정 최신본",
        description: "예산 집행 및 증빙 관리 절차",
        category: "DISCLOSURE",
        subCategory: "회계관리규정",
        fileName: "accounting-rule.pdf",
        fileSize: 2048,
        status: "APPROVED",
        publishedAt: "2026-02-16T00:00:00.000Z",
        documentDate: "2026-02-16T00:00:00.000Z",
        createdAt: "2026-02-16T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "member-1", loginId: "member", name: "조합원", role: "MEMBER" }}
        documents={documents}
      />
    );

    const rulesSection = screen.getByRole("heading", { name: "규약 및 연명부" }).closest("section");
    expect(rulesSection).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("운영관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("회계관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("선거관리규정")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("운영관리규정 최신본")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).getByText("회계관리규정 최신본")).toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText(/기준일:/)).not.toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText(/업로드 \d+건/)).not.toBeInTheDocument();
    expect(within(rulesSection as HTMLElement).queryByText("읽기 가이드")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1. 규약 및 연명부" }));
    expect(screen.getAllByText("운영관리규정").length).toBeGreaterThan(0);
    expect(screen.getAllByText("회계관리규정").length).toBeGreaterThan(0);
    expect(screen.getAllByText("선거관리규정").length).toBeGreaterThan(0);
  });

  it("opens folder-style registration for regulation documents", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));

    expect(screen.getByRole("heading", { name: "운영관리규정 문서함" })).toBeInTheDocument();
    const createButton = screen.getByRole("button", { name: "+ 신규 문서 등록" });
    expect(createButton).toBeInTheDocument();

    fireEvent.click(createButton);

    expect(screen.getByRole("heading", { name: "신규 정보공개 문서 등록" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("운영관리규정");
  });

  it("opens document edit controls from the folder list for uploaded documents", () => {
    const documents: Document[] = [
      {
        id: "doc-operating-rule",
        title: "운영관리규정 최신본",
        description: "사무국 운영 및 문서 보존 절차",
        category: "DISCLOSURE",
        subCategory: "운영관리규정",
        fileName: "operating-rule.pdf",
        fileSize: 1024,
        status: "APPROVED",
        isStarred: true,
        publishedAt: "2026-06-05T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-05T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "운영관리규정 최신본 문서 수정" })[0]);

    expect(screen.getByRole("heading", { name: "정보공개 문서 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서 제목 *")).toHaveValue("운영관리규정 최신본");
    expect(screen.getByLabelText("문서 설명 (선택)")).toHaveValue("사무국 운영 및 문서 보존 절차");
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("운영관리규정");
    expect(screen.getByLabelText("중요 문서로 표시")).toBeChecked();
  });

  it("lets admins edit disclosure card title and content by clicking the card text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        cardContent: {
          itemId: "rules-3",
          title: "운영관리규정 수정 제목",
          description: "운영관리규정 수정 본문입니다.",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "운영관리규정 카드 제목과 내용 수정" }));

    expect(within(operatingCard as HTMLElement).getByRole("heading", { name: "공개자료 카드 문구 수정" })).toBeInTheDocument();
    fireEvent.change(within(operatingCard as HTMLElement).getByLabelText("카드 제목 *"), {
      target: { value: "운영관리규정 수정 제목" },
    });
    fireEvent.change(within(operatingCard as HTMLElement).getByLabelText("카드 내용 *"), {
      target: { value: "운영관리규정 수정 본문입니다." },
    });
    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/disclosure-card-contents",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"itemId\":\"rules-3\""),
      }),
    ));
    expect(within(operatingCard as HTMLElement).getByText("운영관리규정 수정 제목")).toBeInTheDocument();
    expect(within(operatingCard as HTMLElement).getByText("운영관리규정 수정 본문입니다.")).toBeInTheDocument();
  });

  it("lets admins copy generated OpenChat announcements from uploaded disclosure cards", async () => {
    const copyText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: copyText },
    });
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("/api/openchat/announcements?documentId=doc-delegate-minutes")) {
        return {
          ok: true,
          json: async () => ({
            announcement: {
              id: "announcement-1",
              message: "[대방동 지역주택조합 공개자료 안내]\n대의원 회의록",
            },
          }),
        };
      }
      if (url === "/api/openchat/announcements" && init?.method === "PATCH") {
        return {
          ok: true,
          json: async () => ({
            result: {
              status: "COPIED",
            },
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const documents: Document[] = [
      {
        id: "doc-delegate-minutes",
        title: "2023년 1차_대방동지주택_회의록",
        description: "대의원 회의록입니다.",
        category: "DISCLOSURE",
        subCategory: "대의원 의사록",
        fileName: "delegate-minutes.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-14T00:00:00.000Z",
        documentDate: "2023-10-21T00:00:00.000Z",
        createdAt: "2026-06-13T15:07:12.955Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const delegateHeading = screen.getByRole("heading", { name: "대의원 의사록 문서함" });
    const delegateCard = delegateHeading.closest(".stone-card");
    expect(delegateCard).toBeInTheDocument();

    fireEvent.click(within(delegateCard as HTMLElement).getByRole("button", { name: "2023년 1차_대방동지주택_회의록 오픈채팅 공지문 복사" }));

    await waitFor(() => expect(copyText).toHaveBeenCalledWith("[대방동 지역주택조합 공개자료 안내]\n대의원 회의록"));
    expect(fetchMock).toHaveBeenCalledWith("/api/openchat/announcements?documentId=doc-delegate-minutes");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/openchat/announcements",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ announcementId: "announcement-1" }),
      }),
    );
    expect(within(delegateCard as HTMLElement).getByText("공지문 복사됨")).toBeInTheDocument();
  });

  it("confirms uploaded document deletion with an in-app modal", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "alert").mockImplementation(() => {});

    const documents: Document[] = [
      {
        id: "doc-operating-rule",
        title: "운영관리규정 최신본",
        description: "사무국 운영 및 문서 보존 절차",
        category: "DISCLOSURE",
        subCategory: "운영관리규정",
        fileName: "operating-rule.pdf",
        fileSize: 1024,
        status: "APPROVED",
        publishedAt: "2026-06-05T00:00:00.000Z",
        documentDate: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-05T00:00:00.000Z",
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const operatingHeading = screen.getByRole("heading", { name: "운영관리규정" });
    const operatingCard = operatingHeading.closest(".stone-card");
    expect(operatingCard).toBeInTheDocument();

    fireEvent.click(within(operatingCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "운영관리규정 최신본 문서 삭제" })[0]);

    expect(screen.getByRole("dialog", { name: "운영관리규정 최신본 삭제 확인" })).toBeInTheDocument();
    expect(screen.getByText("삭제된 문서와 첨부파일은 복구할 수 없습니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "영구 삭제" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/doc-operating-rule",
      { method: "DELETE" },
    ));
    expect(within(screen.getByLabelText("문서함 열기 상세 드로어")).queryByText("운영관리규정 최신본")).not.toBeInTheDocument();
  });

  it("shows append controls for additional attachments while editing uploaded report documents", () => {
    const documents: Document[] = [
      {
        id: "doc-progress-report",
        title: "23년 1사분기_실적보고서",
        description: "분기별 사업 실적 보고서입니다.",
        category: "DISCLOSURE",
        subCategory: "추진실적",
        fileName: "old-report.docx",
        fileSize: 13241,
        status: "APPROVED",
        publishedAt: "2026-06-09T00:00:00.000Z",
        documentDate: "2023-04-01T00:00:00.000Z",
        createdAt: "2026-06-09T00:00:00.000Z",
        attachments: [
          {
            id: "att-old",
            documentId: "doc-progress-report",
            filePath: "documents/old/old-extra.pdf",
            fileName: "old-extra.pdf",
            fileSize: 2048,
            createdAt: "2026-06-09T00:00:00.000Z",
          },
        ],
      },
    ];

    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={documents}
      />
    );

    const reportHeading = screen.getByRole("heading", { name: "분기별 사업실적보고서" });
    const reportCard = reportHeading.closest(".stone-card");
    expect(reportCard).toBeInTheDocument();

    fireEvent.click(within(reportCard as HTMLElement).getByRole("button", { name: "자료실 열기" }));
    fireEvent.click(screen.getAllByRole("button", { name: "23년 1사분기_실적보고서 문서 수정" })[0]);

    expect(screen.getByRole("heading", { name: "정보공개 문서 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("문서함 세부 분류 *")).toHaveValue("실적보고서");
    expect(within(screen.getByLabelText("문서함 세부 분류 *")).queryByRole("option", { name: "추진실적" })).not.toBeInTheDocument();
    expect(screen.getByText("현재 첨부 파일: old-report.docx")).toBeInTheDocument();
    expect(screen.getByText("현재 추가 첨부파일")).toBeInTheDocument();
    expect(screen.getByText("old-extra.pdf")).toBeInTheDocument();
    expect(screen.getByLabelText("첨부파일 선택 (본문 파일 교체)")).toBeInTheDocument();
    expect(screen.getByLabelText("추가 첨부파일 추가 (선택, 최대 10개)")).toBeInTheDocument();
  });

  it("lists multiple newly selected attachments together in the edit modal", () => {
    render(
      <MeetingsTable
        isLoggedIn
        role="ADMIN"
        router={{ push: vi.fn(), refresh: vi.fn() } as never}
        initialFilterCat="실적보고서"
        documents={[
          {
            id: "doc-progress-report",
            title: "23년 1사분기_실적보고서",
            description: "분기별 사업 실적 보고서입니다.",
            category: "DISCLOSURE",
            subCategory: "실적보고서",
            fileName: "old-report.docx",
            fileSize: 13241,
            status: "APPROVED",
            publishedAt: "2026-06-09T00:00:00.000Z",
            documentDate: "2023-04-01T00:00:00.000Z",
            createdAt: "2026-06-09T00:00:00.000Z",
            attachments: [
              {
                id: "att-old",
                documentId: "doc-progress-report",
                filePath: "documents/old/old-extra.pdf",
                fileName: "old-extra.pdf",
                fileSize: 2048,
                createdAt: "2026-06-09T00:00:00.000Z",
              },
            ],
          },
        ]}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "23년 1사분기_실적보고서 문서 수정" })[0]);

    fireEvent.change(screen.getByLabelText("추가 첨부파일 추가 (선택, 최대 10개)"), {
      target: {
        files: [
          new File(["pdf"], "new-extra-1.pdf", { type: "application/pdf" }),
          new File(["pdf"], "new-extra-2.pdf", { type: "application/pdf" }),
        ],
      },
    });

    expect(screen.getByText("추가 예정 첨부파일 (2개)")).toBeInTheDocument();
    expect(screen.getByText("new-extra-1.pdf")).toBeInTheDocument();
    expect(screen.getByText("new-extra-2.pdf")).toBeInTheDocument();
  });

  it("splits multiple files selected from the main file control into main and additional attachments", () => {
    render(
      <MeetingsTable
        isLoggedIn
        role="ADMIN"
        router={{ push: vi.fn(), refresh: vi.fn() } as never}
        initialFilterCat="실적보고서"
        documents={[
          {
            id: "doc-progress-report",
            title: "23년 1사분기_실적보고서",
            description: "분기별 사업 실적 보고서입니다.",
            category: "DISCLOSURE",
            subCategory: "실적보고서",
            fileName: "old-report.docx",
            fileSize: 13241,
            status: "APPROVED",
            publishedAt: "2026-06-09T00:00:00.000Z",
            documentDate: "2023-04-01T00:00:00.000Z",
            createdAt: "2026-06-09T00:00:00.000Z",
            attachments: [],
          },
        ]}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "23년 1사분기_실적보고서 문서 수정" })[0]);

    const fileInput = screen.getByLabelText("첨부파일 선택 (본문 파일 교체)") as HTMLInputElement;
    expect(fileInput).toHaveAttribute("multiple");

    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["main"], "new-main.pdf", { type: "application/pdf" }),
          new File(["extra1"], "new-extra-1.pdf", { type: "application/pdf" }),
          new File(["extra2"], "new-extra-2.pdf", { type: "application/pdf" }),
        ],
      },
    });

    expect(screen.getByText("새 본문 파일: new-main.pdf")).toBeInTheDocument();
    expect(screen.getByText("추가 예정 첨부파일 (2개)")).toBeInTheDocument();
    expect(screen.getByText("new-extra-1.pdf")).toBeInTheDocument();
    expect(screen.getByText("new-extra-2.pdf")).toBeInTheDocument();
  });

  it("sends appendAttachments when admins add more attachments during edit", async () => {
    const routerRefresh = vi.fn();
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      if (url === "/api/documents/upload-url") {
        return {
          ok: true,
          json: async () => ({
            uploads: [
              {
                path: "documents/2026-06-09/new-extra.pdf",
                signedUrl: "https://storage.example/new-extra",
                token: "new-extra-token",
                contentType: "application/pdf",
              },
            ],
          }),
        };
      }

      if (url === "https://storage.example/new-extra") {
        return {
          ok: true,
          text: async () => "",
        };
      }

      if (url === "/api/documents/doc-progress-report") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            document: {
              id: "doc-progress-report",
              title: "23년 1사분기_실적보고서",
              description: "분기별 사업 실적 보고서입니다.",
              category: "DISCLOSURE",
              subCategory: "실적보고서",
              fileName: "old-report.docx",
              fileSize: 13241,
              status: "APPROVED",
              publishedAt: "2026-06-09T00:00:00.000Z",
              documentDate: "2023-04-01T00:00:00.000Z",
              createdAt: "2026-06-09T00:00:00.000Z",
              attachments: [
                {
                  id: "att-old",
                  documentId: "doc-progress-report",
                  filePath: "documents/old/old-extra.pdf",
                  fileName: "old-extra.pdf",
                  fileSize: 2048,
                  createdAt: "2026-06-09T00:00:00.000Z",
                },
                {
                  id: "att-new",
                  documentId: "doc-progress-report",
                  filePath: "documents/2026-06-09/new-extra.pdf",
                  fileName: "new-extra.pdf",
                  fileSize: 1024,
                  createdAt: "2026-06-09T00:00:00.000Z",
                },
              ],
            },
          }),
        };
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MeetingsTable
        isLoggedIn
        role="ADMIN"
        router={{ push: vi.fn(), refresh: routerRefresh } as never}
        initialFilterCat="실적보고서"
        documents={[
          {
            id: "doc-progress-report",
            title: "23년 1사분기_실적보고서",
            description: "분기별 사업 실적 보고서입니다.",
            category: "DISCLOSURE",
            subCategory: "실적보고서",
            fileName: "old-report.docx",
            fileSize: 13241,
            status: "APPROVED",
            publishedAt: "2026-06-09T00:00:00.000Z",
            documentDate: "2023-04-01T00:00:00.000Z",
            createdAt: "2026-06-09T00:00:00.000Z",
            attachments: [
              {
                id: "att-old",
                documentId: "doc-progress-report",
                filePath: "documents/old/old-extra.pdf",
                fileName: "old-extra.pdf",
                fileSize: 2048,
                createdAt: "2026-06-09T00:00:00.000Z",
              },
            ],
          },
        ]}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "23년 1사분기_실적보고서 문서 수정" })[0]);

    const extraFileInput = screen.getByLabelText("추가 첨부파일 추가 (선택, 최대 10개)") as HTMLInputElement;
    fireEvent.change(extraFileInput, {
      target: {
        files: [new File(["pdf"], "new-extra.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "수정 저장" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents/doc-progress-report",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("\"appendAttachments\""),
      }),
    ));
    const patchCall = fetchMock.mock.calls.find(([url]) => url === "/api/documents/doc-progress-report");
    expect(patchCall).toBeDefined();
    expect(JSON.parse(String(patchCall?.[1]?.body))).toMatchObject({
      title: "23년 1사분기_실적보고서",
      subCategory: "실적보고서",
      appendAttachments: [
        {
          path: "documents/2026-06-09/new-extra.pdf",
          name: "new-extra.pdf",
          size: 3,
        },
      ],
    });
    expect(JSON.parse(String(patchCall?.[1]?.body)).attachments).toBeUndefined();
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("shows admin-editable custom empty messages on disclosure cards", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
        emptyMessages={[
          {
            subCategory: "회계관리규정",
            title: "회계관리규정 자료 준비 중",
            message: "회계 기준 개정본 검토 후 공개할 예정입니다.",
          },
        ]}
      />
    );

    expect(screen.getByText("회계관리규정 자료 준비 중")).toBeInTheDocument();
    expect(screen.getByText("회계 기준 개정본 검토 후 공개할 예정입니다.")).toBeInTheDocument();

    const accountingHeading = screen.getByRole("heading", { name: "회계관리규정" });
    const accountingCard = accountingHeading.closest(".stone-card");
    expect(accountingCard).toBeInTheDocument();

    fireEvent.click(within(accountingCard as HTMLElement).getByRole("button", { name: "안내문 수정" }));

    expect(within(accountingCard as HTMLElement).getByRole("heading", { name: "빈 자료 안내문 수정" })).toBeInTheDocument();
    expect(within(accountingCard as HTMLElement).getByLabelText("안내 제목 *")).toHaveValue("회계관리규정 자료 준비 중");
    expect(within(accountingCard as HTMLElement).getByLabelText("안내 본문 *")).toHaveValue("회계 기준 개정본 검토 후 공개할 예정입니다.");
  });

  it("emphasizes corrective-action guidance in orange", () => {
    render(
      <DisclosureClient
        session={{ id: "admin-1", loginId: "admin", name: "운영자", role: "ADMIN" }}
        documents={[]}
        emptyMessages={[
          {
            subCategory: "회계관리규정",
            title: "회계관리규정 자료 준비 중",
            message: "행정자료 검토 후 공개 예정입니다. (실태조사 시정조치)",
          },
        ]}
      />
    );

    const accountingHeading = screen.getByRole("heading", { name: "회계관리규정" });
    const accountingCard = accountingHeading.closest(".stone-card");
    expect(accountingCard).toBeInTheDocument();

    expect(within(accountingCard as HTMLElement).getByText("행정자료 검토 후 공개 예정입니다.")).toBeInTheDocument();
    expect(within(accountingCard as HTMLElement).getByText("실태조사 시정조치")).toHaveClass("text-ember-orange");
  });
});
