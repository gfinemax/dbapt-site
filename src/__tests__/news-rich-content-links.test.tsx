import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  NoticeRichContent,
  NoticeRichEditor,
  buildNoticeLinkHtml,
  sanitizeNoticeContentHtml,
} from "@/components/news/notice-rich-editor";

describe("notice rich content links", () => {
  it("turns plain free-board post URLs into clickable links", () => {
    const html = sanitizeNoticeContentHtml(
      "관련 글: http://localhost:3000/news?tab=free&post=free-2",
    );

    expect(html).toContain('<a href="/news?tab=free&amp;post=free-2">');
    expect(html).toContain("http://localhost:3000/news?tab=free&amp;post=free-2</a>");
    expect(html).not.toContain('target="_blank"');
  });

  it("keeps custom link text instead of showing the URL", () => {
    const html = buildNoticeLinkHtml(
      "http://localhost:3000/news?tab=free&post=free-2",
      "동작구청 방문 결과 보기",
    );

    expect(html).toBe(
      '<a href="/news?tab=free&amp;post=free-2">동작구청 방문 결과 보기</a>',
    );
  });

  it("replaces selected URL text with a custom display label in the editor", () => {
    const onChange = vi.fn();
    const prompt = vi
      .spyOn(window, "prompt")
      .mockReturnValueOnce("https://dbapt-site.vercel.app/news?tab=notice&news=notice-1")
      .mockReturnValueOnce("대방동지주택 입장문");

    render(
      <NoticeRichEditor
        value="https://dbapt-site.vercel.app/news?tab=notice&news=notice-1"
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "본문 편집창" });
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent.click(screen.getByRole("button", { name: "링크" }));

    expect(onChange).toHaveBeenLastCalledWith(
      '<a href="/news?tab=notice&amp;news=notice-1">대방동지주택 입장문</a>',
    );
    expect(editor.innerHTML).not.toContain("https://dbapt-site.vercel.app");
    expect(editor.innerHTML).toContain("대방동지주택 입장문");

    prompt.mockRestore();
  });

  it("renders custom free-board links with the chosen text", () => {
    render(
      <NoticeRichContent content='<p><a href="/news?tab=free&post=free-2">동작구청 방문 결과 보기</a></p>' />,
    );

    const link = screen.getByRole("link", { name: "동작구청 방문 결과 보기" });
    expect(link).toHaveAttribute("href", "/news?tab=free&post=free-2");
  });
});
