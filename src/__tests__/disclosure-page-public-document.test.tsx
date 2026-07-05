import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockPrisma = vi.hoisted(() => ({
  disclosureCardContent: {
    findMany: vi.fn(),
  },
  document: {
    findFirst: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/document-serializer", () => ({
  serializeDocuments: vi.fn((documents) => documents),
}));

vi.mock("@/components/disclosure/disclosure-page-client-shell", () => ({
  DisclosurePageClientShell: vi.fn(() => null),
}));

describe("disclosure page public document links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(null);
    mockPrisma.disclosureCardContent.findMany.mockResolvedValue([]);
  });

  it("loads the requested approved disclosure document for anonymous OpenChat links", async () => {
    const publicDocument = {
      id: "doc-public",
      title: "대의원 회의록",
      category: "DISCLOSURE",
      status: "APPROVED",
      fileName: "delegate-minutes.pdf",
      filePath: "documents/delegate-minutes.pdf",
      attachments: [],
    };
    mockPrisma.document.findFirst.mockResolvedValue(publicDocument);

    const { default: DisclosurePage } = await import("@/app/disclosure/page");
    const element = await DisclosurePage({
      searchParams: Promise.resolve({ document: "doc-public" }),
    } as never);

    expect(mockPrisma.document.findFirst).toHaveBeenCalledWith({
      where: {
        id: "doc-public",
        category: "DISCLOSURE",
        status: "APPROVED",
      },
      include: {
        attachments: true,
      },
    });
    expect((element as { props: { documents: unknown[] } }).props.documents).toEqual([publicDocument]);
  });

  it("uses a public document Kakao preview image for disclosure metadata", async () => {
    mockPrisma.document.findFirst.mockResolvedValue({
      id: "doc-public",
      title: "대의원 회의록",
      description: "7월 회의자료",
      category: "DISCLOSURE",
      status: "APPROVED",
      socialImagePath: "/uploads/social-preview.png",
      attachments: [],
    });

    const { generateMetadata } = await import("@/app/disclosure/page");
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ document: "doc-public" }),
    } as never);

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/uploads/social-preview.png",
        width: 1200,
        height: 628,
        alt: "대의원 회의록",
      },
    ]);
  });
});
