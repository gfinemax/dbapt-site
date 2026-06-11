import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutClient } from "@/components/about/about-client";

describe("about client", () => {
  it("renders the chairman signature image without replacing the sign-off text", () => {
    render(<AboutClient />);

    const signature = screen.getByRole("img", { name: "안동연 조합장 서명" });

    expect(signature).toHaveAttribute("src", "/assets/about/chairman-signature.png");
    expect(signature).toHaveClass("h-14", "w-auto", "object-contain");
    expect(screen.getByText("대방동 지역주택조합 조합장")).toBeInTheDocument();
    expect(screen.queryByText("안동연(인)")).not.toBeInTheDocument();
  });

  it("separates the cooperative organization chart from partner status cards", () => {
    const { container } = render(<AboutClient />);

    expect(screen.getByRole("heading", { name: "대방동 지역주택조합 조직도" })).toBeInTheDocument();
    expect(container.querySelector("[data-organization-chart]")).toBeInTheDocument();
    expect(screen.getByText("조합원 총회")).toBeInTheDocument();
    expect(screen.getByText("조합장")).toBeInTheDocument();
    expect(screen.getByText("이사회")).toBeInTheDocument();
    expect(screen.getByText("감사")).toBeInTheDocument();
    expect(screen.getByText("사무국")).toBeInTheDocument();
    expect(screen.getByText("전문 협력사")).toBeInTheDocument();

    const governanceLine = screen.getByTestId("organization-governance-line");
    expect(Array.from(governanceLine.querySelectorAll("h4")).map((heading) => heading.textContent)).toEqual([
      "이사회",
      "조합장",
    ]);

    const auditNode = screen.getByTestId("organization-audit-node");
    expect(auditNode).toHaveTextContent("감사");
    expect(auditNode).toHaveTextContent("독립 감사");

    const executionStack = screen.getByTestId("organization-execution-stack");
    expect(Array.from(executionStack.querySelectorAll("h4")).map((heading) => heading.textContent)).toEqual(["사무국"]);

    const advisoryNode = screen.getByTestId("organization-advisory-node");
    expect(advisoryNode).toHaveTextContent("전문 협력사");
    expect(advisoryNode).toHaveTextContent("자문·협력");
    expect(executionStack).not.toHaveTextContent("전문 협력사");

    expect(screen.getByRole("heading", { name: "협력사 현황" })).toBeInTheDocument();
    expect(screen.getByText("자금관리 신탁사: 신영부동산신탁")).toBeInTheDocument();
    expect(screen.getByText("법무·회계 자문기관")).toBeInTheDocument();
  });
});
