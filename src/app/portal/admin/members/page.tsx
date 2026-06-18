import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberManagementDashboard } from "@/components/portal/member-management-dashboard";
import {
  buildMemberManagementSnapshot,
  fetchPeopleOnMemberRows,
  type HomepageMemberAccount,
  type PeopleOnMemberRow,
} from "@/lib/admin/member-management";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDemoApprovedAccount } from "@/lib/demo-account-filter";
import { normalizeMemberType } from "@/lib/member-type";
import { getUserContactDisplay } from "@/lib/user-contact-display";
import type { ApprovedMemberConversionUser } from "@/components/portal/approved-member-conversion-panel";

const DEFAULT_PEOPLEON_MEMBERS_API_URL = "https://people-on.vercel.app/api/members/table";

export const metadata: Metadata = {
  title: "조합원 관리 | 대방동 지역주택조합",
};

export const dynamic = "force-dynamic";

function getPeopleOnApiKey() {
  const multipleKeys = process.env.PEOPLEON_MEMBERS_API_KEYS?.split(",").map((key) => key.trim()).filter(Boolean);
  if (multipleKeys?.length) return multipleKeys[0];
  return process.env.PEOPLEON_MEMBERS_API_KEY?.trim() || "";
}

async function getHomepageMemberAccounts(): Promise<HomepageMemberAccount[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["MEMBER", "REFUND", "ASSOCIATE", "PENDING"] },
    },
    select: {
      id: true,
      name: true,
      signupName: true,
      email: true,
      loginId: true,
      phone: true,
      signupPhone: true,
      role: true,
      memberType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users
    .filter((user) => !isDemoApprovedAccount(user))
    .map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
}

async function getApprovedMemberConversionUsers(): Promise<ApprovedMemberConversionUser[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["MEMBER", "REFUND", "ASSOCIATE"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  return users
    .filter((user) => !isDemoApprovedAccount(user))
    .map((user) => ({
      id: user.id,
      name: user.name || "이름 없음",
      signupName: user.signupName,
      email: getUserContactDisplay(user),
      role: user.role,
      memberType: normalizeMemberType(user.memberType, user.role),
      createdAt: user.createdAt.toISOString(),
    }));
}

export default async function AdminMemberManagementPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [homepageUsers, approvedSocialUsers] = await Promise.all([
    getHomepageMemberAccounts(),
    getApprovedMemberConversionUsers(),
  ]);
  const apiKey = getPeopleOnApiKey();
  const apiUrl = process.env.PEOPLEON_MEMBERS_API_URL?.trim() || DEFAULT_PEOPLEON_MEMBERS_API_URL;
  const isConfigured = Boolean(apiKey);
  let peopleOnRows: PeopleOnMemberRow[] = [];
  let generatedAt = new Date().toISOString();
  let syncError: string | null = null;

  if (!apiKey) {
    syncError = "PEOPLEON_MEMBERS_API_KEY가 설정되지 않았습니다.";
  } else {
    try {
      const result = await fetchPeopleOnMemberRows({ apiUrl, apiKey });
      peopleOnRows = result.rows;
      generatedAt = result.generatedAt;
    } catch (error) {
      syncError = error instanceof Error ? error.message : "PeopleOn API 원장 확인에 실패했습니다.";
    }
  }

  const snapshot = buildMemberManagementSnapshot({
    generatedAt,
    peopleOnRows,
    homepageUsers,
  });

  return (
    <MemberManagementDashboard
      snapshot={snapshot}
      syncError={syncError}
      isConfigured={isConfigured}
      approvedSocialUsers={approvedSocialUsers}
    />
  );
}
