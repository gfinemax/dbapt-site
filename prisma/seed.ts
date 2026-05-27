import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.refundInfo.deleteMany();
  await prisma.documentLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const memberPasswordHash = await bcrypt.hash("member123", 10);
  const refundPasswordHash = await bcrypt.hash("refund123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      loginId: "admin",
      passwordHash: adminPasswordHash,
      name: "김관리 (관리자)",
      role: "ADMIN",
    },
  });

  const member = await prisma.user.create({
    data: {
      loginId: "member1",
      passwordHash: memberPasswordHash,
      name: "이조합 (정식조합원)",
      role: "MEMBER",
    },
  });

  const refund = await prisma.user.create({
    data: {
      loginId: "refund1",
      passwordHash: refundPasswordHash,
      name: "박정산 (환불조합원)",
      role: "REFUND",
    },
  });

  console.log("Created users:", { admin: admin.loginId, member: member.loginId, refund: refund.loginId });

  // 2. Create RefundInfo
  await prisma.refundInfo.create({
    data: {
      userId: refund.id,
      totalPaid: 45000000,
      refundAmount: 38000000,
      processedState: "정산 서류 검토 완료 (지급 대기)",
      targetDate: new Date("2026-06-30"),
    },
  });
  console.log("Created RefundInfo for refund user.");

  // 3. Create Documents
  // - Approved Documents (Visible to authorized members)
  await prisma.document.create({
    data: {
      title: "대방동 지역주택조합 창립총회 의사록",
      description: "2026년 창립총회 진행 결과 및 규약 제정 결의록 파일입니다.",
      category: "DISCLOSURE",
      filePath: "uploads/disclosure_founding_meeting.pdf",
      fileName: "창립총회의사록_최종.pdf",
      fileSize: 1048576, // 1MB
      status: "APPROVED",
      publishedAt: new Date(),
    },
  });

  await prisma.document.create({
    data: {
      title: "2026년도 1분기 수입 및 지출 자금집행 실적 보고서",
      description: "1분기 수입/지출 세부 내역 및 이사회 승인 보고서입니다.",
      category: "ACCOUNTING",
      filePath: "uploads/accounting_2026_q1.pdf",
      fileName: "2026_1분기_자금집행보고서.pdf",
      fileSize: 2048576, // 2MB
      status: "APPROVED",
      publishedAt: new Date(),
    },
  });

  // - Pending Document (Only visible to admin)
  await prisma.document.create({
    data: {
      title: "대방동 지역주택조합 규약 개정 초안 (검토 대기)",
      description: "규약 개정 심의를 위해 법률 대리인이 작성한 임시 개정 초안입니다.",
      category: "DISCLOSURE",
      filePath: "uploads/disclosure_rules_draft_pending.pdf",
      fileName: "규약개정초안_대기.pdf",
      fileSize: 512000, // 500KB
      status: "PENDING",
    },
  });

  console.log("Created mock documents.");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
