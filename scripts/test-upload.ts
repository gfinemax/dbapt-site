// Load dotenv to resolve process.env.DATABASE_URL first
import "dotenv/config";

import { prisma } from "../src/lib/db.ts";

async function main() {
  console.log("Starting diagnostic database document write test...");
  try {
    const doc = await prisma.document.create({
      data: {
        title: "진단용 테스트 문서",
        description: "디버깅용 테스트입니다.",
        category: "DISCLOSURE",
        subCategory: "총회 의사록",
        filePath: "uploads/test-dummy-path.pdf",
        fileName: "test-dummy-path.pdf",
        fileSize: 12345,
        status: "APPROVED",
        publishedAt: new Date(),
        documentDate: new Date("2026-04-18"),
      },
    });
    console.log("SUCCESS! Created test document successfully:", doc);
    
    // Clean up
    await prisma.document.delete({
      where: { id: doc.id }
    });
    console.log("CLEANUP! Deleted test document successfully.");
  } catch (error) {
    console.error("DIAGNOSTIC ERROR CAUGHT:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
