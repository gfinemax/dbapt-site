import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchPage from "@/app/search/page";

describe("site search page", () => {
  it("shows full-site results for district plan notice searches", async () => {
    render(
      await SearchPage({
        searchParams: Promise.resolve({ q: "결정고시" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "전체 찾기" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "검색어" })).toHaveValue("결정고시");
    expect(
      screen.getByText((_, element) => element?.textContent === "결정고시 검색 결과 3건입니다."),
    ).toBeInTheDocument();

    const historyResult = screen.getByTestId("site-search-result-history-district-plan-notice-2022");
    expect(within(historyResult).getByText("조합연혁")).toBeInTheDocument();
    expect(
      within(historyResult).getByRole("link", {
        name: "대방동 11-103번지 일대 지구단위계획 결정 및 지형도면 최종 고시",
      }),
    ).toHaveAttribute("href", "/about#section-history");

    const libraryResult = screen.getByTestId("site-search-result-library-district-plan-notice-2022");
    expect(within(libraryResult).getByText("자료실")).toBeInTheDocument();
    expect(
      within(libraryResult).getByRole("link", {
        name: "서울특별시 고시 제2022-291호 지구단위계획 결정고시",
      }),
    ).toHaveAttribute(
      "href",
      "/library?category=permits&q=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EA%B3%A0%EC%8B%9C%20%EC%A0%9C2022-291%ED%98%B8",
    );
  });

  it("matches full-site search results when spacing is omitted", async () => {
    render(
      await SearchPage({
        searchParams: Promise.resolve({ q: "총회책자" }),
      }),
    );

    expect(screen.getByRole("searchbox", { name: "검색어" })).toHaveValue("총회책자");
    expect(
      screen.getByText((_, element) => element?.textContent === "총회책자 검색 결과 1건입니다."),
    ).toBeInTheDocument();

    const assemblyBookResult = screen.getByTestId("site-search-result-library-assembly-book");
    expect(within(assemblyBookResult).getByText("자료실")).toBeInTheDocument();
    expect(
      within(assemblyBookResult).getByRole("link", { name: "총회 책자 / 안내문" }),
    ).toHaveAttribute("href", "/news?tab=notice");
  });

  it("keeps stenographic record searches limited to stenographic titles", async () => {
    render(
      await SearchPage({
        searchParams: Promise.resolve({ q: "속기" }),
      }),
    );

    expect(screen.getByRole("searchbox", { name: "검색어" })).toHaveValue("속기");
    expect(screen.queryByText("검색 결과가 없습니다. 다른 검색어를 입력해 주세요.")).not.toBeInTheDocument();

    const stenographicRecordResult = screen.getByTestId(
      "site-search-result-disclosure-regular-meeting-stenographic-record-2026",
    );
    expect(within(stenographicRecordResult).getByText("공개자료")).toBeInTheDocument();
    expect(
      within(stenographicRecordResult).getByRole("link", {
        name: "2026년 정기총회 속기록",
      }),
    ).toHaveAttribute("href", "/disclosure?tab=meetings");
    expect(screen.queryByTestId("site-search-result-library-meeting-minutes")).not.toBeInTheDocument();
  });

  it("finds registered stenographic record titles from disclosure document boxes", async () => {
    render(
      await SearchPage({
        searchParams: Promise.resolve({ q: "속기록" }),
      }),
    );

    const stenographicRecordResult = screen.getByTestId(
      "site-search-result-disclosure-regular-meeting-stenographic-record-2026",
    );
    expect(within(stenographicRecordResult).getByText("공개자료")).toBeInTheDocument();
    expect(
      within(stenographicRecordResult).getByRole("link", {
        name: "2026년 정기총회 속기록",
      }),
    ).toHaveAttribute("href", "/disclosure?tab=meetings");
  });

  it("finds disclosure folder descriptions such as administrative investigation materials", async () => {
    render(
      await SearchPage({
        searchParams: Promise.resolve({ q: "실태조사" }),
      }),
    );

    const receivedCorrespondenceResult = screen.getByTestId(
      "site-search-result-disclosure-folder-administration-1",
    );
    expect(within(receivedCorrespondenceResult).getByText("공개자료")).toBeInTheDocument();
    expect(
      within(receivedCorrespondenceResult).getByRole("link", {
        name: "수신 공문서 문서함",
      }),
    ).toHaveAttribute("href", "/disclosure?tab=administration");
  });

  it("guides users when there is no search query", async () => {
    render(await SearchPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "전체 찾기" })).toBeInTheDocument();
    expect(screen.getByText("찾을 내용을 입력해 주세요.")).toBeInTheDocument();
  });
});
