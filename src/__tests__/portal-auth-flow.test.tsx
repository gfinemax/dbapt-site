// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { decodeJwt } from "jose";
import { createSessionToken, decrypt, encrypt } from "../lib/auth";
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

    it("should use the corrected signup name as the session display name", async () => {
      const token = await createSessionToken({
        id: "google-user-1",
        loginId: "g_member_1001",
        name: "OH Hakdong",
        signupName: "오하동",
        role: "MEMBER",
        email: "gfinemax@gmail.com",
      });

      const decrypted = await decrypt(token);

      expect(decrypted?.name).toBe("오하동");
      expect(decrypted?.email).toBe("gfinemax@gmail.com");
      expect(decrypted?.role).toBe("MEMBER");
    });

    it("keeps session tokens valid for smartphone revisit windows", async () => {
      const token = await createSessionToken({
        id: "member-1",
        loginId: "member1",
        name: "정식 조합원",
        role: "MEMBER",
      });

      const payload = decodeJwt(token);
      const lifetimeSeconds = Number(payload.exp) - Number(payload.iat);

      expect(lifetimeSeconds).toBeGreaterThanOrEqual(30 * 24 * 60 * 60);
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

      // Verify documents use valid publication states without depending on a mutable shared DB having draft rows.
      const approved = documents.find((d) => d.status === "APPROVED");
      const invalidStatus = documents.find((d) => !["APPROVED", "PENDING"].includes(d.status));

      expect(approved).toBeDefined();
      expect(invalidStatus).toBeUndefined();
    });

    it("should point seeded documents to safe file object paths", async () => {
      const documents = await prisma.document.findMany();

      for (const document of documents) {
        const isStoragePath = document.filePath.startsWith("documents/");
        const isLegacyLocalPath = document.filePath.startsWith("uploads/");

        expect(isStoragePath || isLegacyLocalPath).toBe(true);
        expect(document.filePath).not.toContain("..");
        expect(document.filePath).not.toMatch(/^[A-Za-z]:\\/);

        if (isLegacyLocalPath) {
          expect(existsSync(join(process.cwd(), document.filePath))).toBe(true);
        }
      }
    });
  });
});
