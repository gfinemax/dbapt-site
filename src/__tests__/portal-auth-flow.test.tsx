// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../lib/auth";
import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

describe("Phase 2 Authentication and Session Logic", () => {
  // 1. Session JWT encryption/decryption tests
  describe("session jwt token", () => {
    const mockPayload = {
      id: "test-user-id",
      loginId: "member-test",
      name: "홍길동",
      role: "MEMBER",
    };

    it("should encrypt and decrypt a payload correctly", async () => {
      const token = await encrypt(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decrypted = await decrypt(token);
      expect(decrypted).toBeDefined();
      expect(decrypted?.id).toBe(mockPayload.id);
      expect(decrypted?.loginId).toBe(mockPayload.loginId);
      expect(decrypted?.role).toBe(mockPayload.role);
    });

    it("should return null for malformed or expired tokens", async () => {
      const invalidToken = "invalid-token-string";
      const decrypted = await decrypt(invalidToken);
      expect(decrypted).toBeNull();
    });
  });

  // 2. Database schema and seed integration tests
  describe("database seed verification", () => {
    it("should retrieve seeded users and verify passwords", async () => {
      const users = await prisma.user.findMany();
      expect(users.length).toBeGreaterThanOrEqual(3);

      const member = users.find((u) => u.loginId === "member1");
      expect(member).toBeDefined();
      expect(member?.role).toBe("MEMBER");
      expect(member?.name).toContain("정식조합원");

      const passwordMatch = await bcrypt.compare("member123", member!.passwordHash);
      expect(passwordMatch).toBe(true);

      const wrongPasswordMatch = await bcrypt.compare("wrong-pass", member!.passwordHash);
      expect(wrongPasswordMatch).toBe(false);
    });

    it("should retrieve seeded refund information linked to refund user", async () => {
      const refundUser = await prisma.user.findUnique({
        where: { loginId: "refund1" },
        include: { refundInfo: true },
      });

      expect(refundUser).toBeDefined();
      expect(refundUser?.role).toBe("REFUND");
      expect(refundUser?.refundInfo).toBeDefined();
      expect(refundUser?.refundInfo?.totalPaid).toBe(45000000);
      expect(refundUser?.refundInfo?.refundAmount).toBe(38000000);
    });

    it("should retrieve mock documents and filter by category", async () => {
      const documents = await prisma.document.findMany();
      expect(documents.length).toBeGreaterThanOrEqual(3);

      const disclosures = documents.filter((d) => d.category === "DISCLOSURE");
      const accountings = documents.filter((d) => d.category === "ACCOUNTING");

      expect(disclosures.length).toBeGreaterThanOrEqual(2);
      expect(accountings.length).toBeGreaterThanOrEqual(1);

      // Verify that at least one document is pending and one is approved
      const approved = documents.find((d) => d.status === "APPROVED");
      const pending = documents.find((d) => d.status === "PENDING");

      expect(approved).toBeDefined();
      expect(pending).toBeDefined();
    });

    it("should point seeded documents to local demo files for secure download tests", async () => {
      const documents = await prisma.document.findMany();

      for (const document of documents) {
        expect(existsSync(join(process.cwd(), document.filePath))).toBe(true);
      }
    });
  });
});
