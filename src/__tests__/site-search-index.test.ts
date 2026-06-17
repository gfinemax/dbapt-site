import { describe, expect, it } from "vitest";
import { searchSiteItems } from "@/content/site-search";

describe("site search index", () => {
  it("includes session-visible registered document titles without exposing file paths", () => {
    const results = searchSiteItems("실태조사", {
      documents: [
        {
          id: "doc-investigation-2026",
          title: "(대방동) 2026년 지역주택조합 실태조사 결과통지 및 조치계획",
          description: "동작구청 수신 공문입니다.",
          category: "DISCLOSURE",
          subCategory: "공문서",
          correspondenceType: "수신",
          status: "APPROVED",
          fileName: "2026-investigation.pdf",
          filePath: "documents/private/2026-investigation.pdf",
          documentDate: "2026-06-11T00:00:00.000Z",
          publishedAt: "2026-06-11T00:00:00.000Z",
          createdAt: "2026-06-11T00:00:00.000Z",
        },
      ],
    });

    const documentResult = results.find((item) => item.id === "document-doc-investigation-2026");
    expect(documentResult).toMatchObject({
      title: "(대방동) 2026년 지역주택조합 실태조사 결과통지 및 조치계획",
      href: "/disclosure?document=doc-investigation-2026",
      section: "공개자료",
    });
    expect(JSON.stringify(documentResult)).not.toContain("documents/private/2026-investigation.pdf");
  });
});
