// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionMock = vi.fn();
const prismaMock = {
  user: {
    findMany: vi.fn(),
  },
  contributionSummary: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  paymentNotice: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  paymentImportBatch: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

describe("contribution payment APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
  });

  it("returns only the current user's contribution summary and notices", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });
    prismaMock.contributionSummary.findUnique.mockResolvedValue({
      userId: "member-1",
      totalDue: 120_000_000,
      totalPaid: 95_000_000,
      unpaidAmount: 25_000_000,
      overdueAmount: 5_000_000,
      lateFee: 120_000,
      nextDueDate: new Date("2026-06-30T00:00:00.000Z"),
      status: "OVERDUE",
      noticeMessage: "연체 미납금 납부 안내 대상입니다.",
      updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    });
    prismaMock.paymentNotice.findMany.mockResolvedValue([
      {
        id: "notice-1",
        type: "OVERDUE",
        status: "DRAFT",
        title: "연체 미납금 납부 안내",
        message: "연체 미납금 5,000,000원이 있습니다.",
        unpaidAmount: 25_000_000,
        overdueAmount: 5_000_000,
        lateFee: 120_000,
        dueDate: new Date("2026-06-30T00:00:00.000Z"),
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
      },
    ]);

    const { GET } = await import("@/app/api/me/contributions/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.contributionSummary.findUnique).toHaveBeenCalledWith({
      where: { userId: "member-1" },
    });
    expect(body.summary.totalDue).toBe(120_000_000);
    expect(body.summary.nextDueDate).toBe("2026-06-30T00:00:00.000Z");
    expect(body.notices).toHaveLength(1);
  });

  it("blocks non-admin users from creating payment import batches", async () => {
    getSessionMock.mockResolvedValue({
      id: "member-1",
      loginId: "member1",
      name: "이조합",
      role: "MEMBER",
    });

    const { POST } = await import("@/app/api/admin/payment-imports/route");
    const response = await POST(
      new Request("http://localhost/api/admin/payment-imports", {
        method: "POST",
        body: JSON.stringify({ rows: [] }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain("관리자");
    expect(prismaMock.paymentImportBatch.create).not.toHaveBeenCalled();
  });

  it("creates a pending admin payment import batch with row validation results", async () => {
    getSessionMock.mockResolvedValue({
      id: "admin-1",
      loginId: "admin",
      name: "관리자",
      role: "ADMIN",
    });
    prismaMock.user.findMany.mockResolvedValue([
      { id: "member-1", loginId: "member1", name: "이조합", role: "MEMBER" },
    ]);
    prismaMock.paymentImportBatch.create.mockResolvedValue({
      id: "batch-1",
      status: "PENDING",
      rowCount: 2,
      errorCount: 1,
      rows: [
        { loginId: "member1", validationStatus: "VALID", targetUserId: "member-1" },
        { loginId: "missing", validationStatus: "ERROR", targetUserId: null },
      ],
    });

    const { POST } = await import("@/app/api/admin/payment-imports/route");
    const response = await POST(
      new Request("http://localhost/api/admin/payment-imports", {
        method: "POST",
        body: JSON.stringify({
          source: "EXCEL",
          rows: [
            {
              loginId: "member1",
              memberName: "이조합",
              totalDue: 120_000_000,
              totalPaid: 95_000_000,
              unpaidAmount: 25_000_000,
              overdueAmount: 5_000_000,
              lateFee: 120_000,
              nextDueDate: "2026-06-30",
              noticeMessage: "연체 미납금 납부 안내 대상입니다.",
            },
            { loginId: "missing", totalDue: 1, totalPaid: 0 },
          ],
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.paymentImportBatch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: "EXCEL",
          status: "PENDING",
          rowCount: 2,
          errorCount: 1,
        }),
      }),
    );
    expect(body.batch.errorCount).toBe(1);
  });

  it("approves a valid import batch into summaries and draft overdue notices", async () => {
    getSessionMock.mockResolvedValue({
      id: "admin-1",
      loginId: "admin",
      name: "관리자",
      role: "ADMIN",
    });
    prismaMock.paymentImportBatch.findUnique.mockResolvedValue({
      id: "batch-1",
      status: "PENDING",
      rows: [
        {
          loginId: "member1",
          targetUserId: "member-1",
          totalDue: 120_000_000,
          totalPaid: 95_000_000,
          unpaidAmount: 25_000_000,
          overdueAmount: 5_000_000,
          lateFee: 120_000,
          nextDueDate: new Date("2026-06-30T00:00:00.000Z"),
          status: "OVERDUE",
          noticeMessage: "연체 미납금 납부 안내 대상입니다.",
          validationStatus: "VALID",
        },
      ],
    });
    prismaMock.paymentImportBatch.update.mockResolvedValue({ id: "batch-1", status: "APPROVED" });

    const { POST } = await import("@/app/api/admin/payment-imports/[id]/approve/route");
    const response = await POST(new Request("http://localhost/api/admin/payment-imports/batch-1/approve"), {
      params: Promise.resolve({ id: "batch-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.contributionSummary.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "member-1" },
        update: expect.objectContaining({
          unpaidAmount: 25_000_000,
          overdueAmount: 5_000_000,
          status: "OVERDUE",
        }),
      }),
    );
    expect(prismaMock.paymentNotice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "member-1",
          type: "OVERDUE",
          status: "DRAFT",
          unpaidAmount: 25_000_000,
          overdueAmount: 5_000_000,
        }),
      }),
    );
    expect(body.approvedRows).toBe(1);
  });
});
