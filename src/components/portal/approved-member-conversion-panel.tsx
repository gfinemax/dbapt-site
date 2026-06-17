"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approveUserAction } from "@/lib/auth";
import { getMemberTypeLabel, normalizeMemberType, type MemberType } from "@/lib/member-type";
import { cn } from "@/lib/utils";

export type ApprovedMemberConversionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  memberType?: string | null;
  createdAt: string;
};

const memberConversionActions = [
  {
    label: "정식조합원",
    role: "MEMBER" as const,
    memberType: "REGULAR" as const,
  },
  {
    label: "예비조합원",
    role: "MEMBER" as const,
    memberType: "PRELIMINARY" as const,
  },
  {
    label: "환불조합원",
    role: "REFUND" as const,
    memberType: "REFUND" as const,
  },
  {
    label: "관계자/기타 승인 계정",
    role: "ASSOCIATE" as const,
    memberType: "ASSOCIATE" as const,
  },
];

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "관리자";
    case "MEMBER":
      return "정식 조합원";
    case "REFUND":
      return "환불 조합원";
    case "ASSOCIATE":
      return "관계자/기타 승인 계정";
    default:
      return role;
  }
}

function getMemberTypeClass(memberType?: string | null, role?: string | null) {
  switch (normalizeMemberType(memberType, role)) {
    case "PRELIMINARY":
      return "bg-sunburst-yellow/15 text-charcoal-primary";
    case "REFUND":
      return "bg-ember-orange/10 text-ember-orange";
    case "ASSOCIATE":
      return "bg-sky-blue/10 text-sky-blue";
    default:
      return "bg-meadow-green/10 text-meadow-green";
  }
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "MEMBER":
      return "bg-meadow-green/10 text-meadow-green";
    case "REFUND":
      return "bg-ember-orange/10 text-ember-orange";
    case "ASSOCIATE":
      return "bg-sky-blue/10 text-sky-blue";
    default:
      return "bg-sunburst-yellow/20 text-charcoal-primary";
  }
}

export function ApprovedMemberConversionPanel({
  approvedUsers,
}: {
  approvedUsers: ApprovedMemberConversionUser[];
}) {
  const router = useRouter();
  const [memberConversionSelections, setMemberConversionSelections] = useState<Record<string, MemberType>>({});

  return (
    <section id="approved-member-conversion" className="stone-card mt-6 bg-white p-6">
      <h2 className="text-xl font-semibold text-charcoal-primary">가입 승인 회원 자격 변경 관리</h2>
      <p className="mt-2 text-xs leading-5 text-graphite">
        이미 가입이 승인된 회원의 자격을 정식조합원, 예비조합원, 환불조합원, 관계자/기타 승인 계정 간에 전환할 수 있습니다.
      </p>

      <div className="mt-6 border-t border-[#f2f0ed] pt-4">
        {approvedUsers.length === 0 ? (
          <p className="py-6 text-center text-xs text-graphite/70">
            권한 변경이 가능한 가입 승인 회원이 존재하지 않습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#f2f0ed] font-medium text-graphite/80">
                  <th className="pb-3 pr-4">회원 명의</th>
                  <th className="pb-3 pr-4">이메일/휴대폰</th>
                  <th className="pb-3 pr-4">자격 구분</th>
                  <th className="pb-3 pr-4">현재 권한 상태</th>
                  <th className="pb-3 text-right">자격 강제 전환 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f7f4]">
                {approvedUsers.map((user) => {
                  const currentMemberType = normalizeMemberType(user.memberType, user.role);
                  const selectedMemberType = memberConversionSelections[user.id] ?? currentMemberType;
                  const selectedAction =
                    memberConversionActions.find((action) => action.memberType === selectedMemberType) ??
                    memberConversionActions[0];

                  return (
                    <tr key={user.id} className="text-charcoal-primary">
                      <td className="py-3.5 pr-4 font-semibold">{user.name}</td>
                      <td className="py-3.5 pr-4 font-mono">{user.email}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                            getMemberTypeClass(user.memberType, user.role),
                          )}
                        >
                          {getMemberTypeLabel(user.memberType, user.role)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                            getRoleBadgeClass(user.role),
                          )}
                        >
                          {getRoleLabel(user.role)} ({user.role})
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <select
                            aria-label={`${user.name} 전환할 자격`}
                            value={selectedMemberType}
                            onChange={(event) => {
                              setMemberConversionSelections((prev) => ({
                                ...prev,
                                [user.id]: event.target.value as MemberType,
                              }));
                            }}
                            className="h-9 rounded-full border border-stone-surface bg-[#f8f7f4] px-3 text-[11px] font-semibold text-charcoal-primary outline-none transition focus:border-charcoal-primary focus:bg-white"
                          >
                            {memberConversionActions.map((action) => (
                              <option key={action.memberType} value={action.memberType}>
                                {action.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant={selectedMemberType === currentMemberType ? "secondary" : "default"}
                            className="h-9 rounded-full px-3 text-[11px] font-semibold cursor-pointer"
                            disabled={selectedMemberType === currentMemberType}
                            onClick={async () => {
                              const res = await approveUserAction(user.id, selectedAction.role, selectedAction.memberType);
                              if (res.success) {
                                alert(`${user.name}님의 자격을 ${selectedAction.label}으로 강제 전환했습니다.`);
                                router.refresh();
                              }
                            }}
                          >
                            자격 변경
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
