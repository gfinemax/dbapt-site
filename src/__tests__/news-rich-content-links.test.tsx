import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  NoticeRichContent,
  NoticeRichEditor,
  buildNoticeLinkHtml,
  sanitizeNoticeContentHtml,
} from "@/components/news/notice-rich-editor";
import { shouldMoveCursorToDocumentEndOnClick } from "@/components/news/rich-text-editor-v2";

describe("notice rich content links", () => {
  it("does not move the editor cursor to the end while mouse-selected text is active", () => {
    const editorRoot = document.createElement("div");
    const paragraph = document.createElement("p");
    paragraph.textContent = "마우스로 선택한 문단";
    editorRoot.append(paragraph);
    document.body.append(editorRoot);

    const textNode = paragraph.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(shouldMoveCursorToDocumentEndOnClick(editorRoot, editorRoot)).toBe(false);
  });

  it("moves the editor cursor to the end only for an empty root click", () => {
    const editorRoot = document.createElement("div");
    document.body.append(editorRoot);
    window.getSelection()?.removeAllRanges();

    expect(shouldMoveCursorToDocumentEndOnClick(editorRoot, editorRoot)).toBe(true);
  });

  it("keeps trusted image galleries uncropped while sanitizing unsafe gallery images", () => {
    const html = sanitizeNoticeContentHtml(
      '<div data-notice-gallery="two-column"><img src="/uploads/a.png" alt="첫 번째" /><img src="javascript:alert(1)" alt="위험" /><img src="/uploads/b.png" alt="두 번째" /></div>',
    );

    expect(html).toContain('data-notice-gallery="two-column"');
    expect(html).toContain("grid-template-columns:repeat(2,minmax(0,1fr))");
    expect(html).toContain("max-width:820px");
    expect(html).toContain('data-fit="contain"');
    expect(html).toContain("object-fit:contain");
    expect(html).toContain('src="/uploads/a.png"');
    expect(html).toContain('src="/uploads/b.png"');
    expect(html).toContain('alt="첫 번째"');
    expect(html).not.toContain("javascript:");
    expect(html.match(/<img/g)).toHaveLength(2);
  });

  it("renders saved two-column galleries as two visible grid columns", () => {
    render(
      <NoticeRichContent content='<div data-notice-gallery="two-column"><img src="/uploads/gallery-left.png" alt="왼쪽 이미지" /><img src="/uploads/gallery-right.png" alt="오른쪽 이미지" /></div>' />,
    );

    const gallery = document.querySelector('[data-notice-gallery="two-column"]') as HTMLElement;

    expect(gallery).toBeInTheDocument();
    expect(gallery).toHaveStyle({
      display: "grid",
      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
      width: "100%",
      maxWidth: "820px",
    });
    expect(screen.getByAltText("왼쪽 이미지")).toHaveStyle({ width: "100%" });
    expect(screen.getByAltText("오른쪽 이미지")).toHaveStyle({ width: "100%" });
  });

  it("does not add layer reserve spacing for images rendered inside a gallery", () => {
    render(
      <NoticeRichContent content='<div data-notice-gallery="two-column"><img src="/uploads/gallery-layer-1.png" alt="첫 번째" data-layout="front" data-pixel-width="407" data-pixel-height="640" data-offset-y="0" /><img src="/uploads/gallery-layer-2.png" alt="두 번째" data-layout="front" data-pixel-width="407" data-pixel-height="640" data-offset-y="0" /></div>' />,
    );

    const contentRoot = document.querySelector(".notice-rich-content") as HTMLElement;

    expect(contentRoot.style.paddingBottom).toBe("");
  });

  it("sanitizes image fitting, crop focus, and rotation metadata", () => {
    const html = sanitizeNoticeContentHtml(
      '<p><img src="/uploads/a.png" alt="본문 이미지" data-width="75" data-pixel-width="415" data-pixel-height="320" data-fit="cover" data-crop-x="left" data-crop-y="top" data-rotate="90" style="width:1px" /></p>',
    );

    expect(html).toContain('data-width="75"');
    expect(html).toContain('data-pixel-width="415"');
    expect(html).toContain('data-pixel-height="320"');
    expect(html).toContain('data-fit="cover"');
    expect(html).toContain('data-crop-x="left"');
    expect(html).toContain('data-crop-y="top"');
    expect(html).toContain('data-rotate="90"');
    expect(html).toContain("width:415px");
    expect(html).toContain("height:320px");
    expect(html).toContain("object-fit:fill");
    expect(html).toContain("object-position:left top");
    expect(html).toContain("transform:rotate(90deg)");
    expect(html).not.toContain("width:1px");
  });

  it("keeps saved pixel-height images proportional on mobile read views", () => {
    render(
      <NoticeRichContent content='<p><img src="/uploads/mobile-ratio.png" alt="본문 이미지" data-width="75" data-pixel-width="415" data-pixel-height="320" data-fit="cover" data-crop-x="left" data-crop-y="top" /></p>' />,
    );

    const contentRoot = document.querySelector(".notice-rich-content") as HTMLElement;
    const image = screen.getByAltText("본문 이미지");

    expect(image).toHaveStyle({
      width: "415px",
      height: "320px",
      objectFit: "fill",
    });
    expect(contentRoot).toHaveClass("max-sm:[&_img]:!h-auto", "max-sm:[&_img]:!object-contain");
  });

  it("uses shared mobile reading density for notice and free-board rich content", () => {
    render(
      <NoticeRichContent content='<p><img src="/uploads/mobile-full-width.png" alt="본문 이미지" data-width="75" data-pixel-width="415" data-pixel-height="320" data-fit="contain" /></p>' />,
    );

    const contentRoot = document.querySelector(".notice-rich-content") as HTMLElement;

    expect(contentRoot).toHaveClass(
      "max-sm:px-3",
      "max-sm:py-4",
      "max-sm:[&_img]:!w-full",
      "max-sm:[&_img]:!max-w-full",
    );
  });

  it("renders rotated cover images without adding a crop frame", () => {
    const html = sanitizeNoticeContentHtml(
      '<p><img src="/uploads/rotated-cover.png" alt="본문 이미지" data-width="75" data-fit="cover" data-crop-x="center" data-crop-y="center" data-rotate="33" /></p>',
    );

    expect(html).toContain('data-fit="cover"');
    expect(html).toContain('data-rotate="33"');
    expect(html).toContain("object-fit:contain");
    expect(html).toContain("transform:rotate(33deg)");
    expect(html).not.toContain("aspect-ratio");
  });

  it("preserves saved front and behind layer offsets in displayed rich content", () => {
    const html = sanitizeNoticeContentHtml(
      '<p>본문 <img src="/uploads/layer-saved.png" alt="본문 이미지" data-width="40" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="front" data-offset-x="160" data-offset-y="-20" style="width:40%;left:160px;top:-20px;" /> 이어쓰기</p>',
    );

    expect(html).toContain('data-layout="front"');
    expect(html).toContain('data-offset-x="160"');
    expect(html).toContain('data-offset-y="-20"');
    expect(html).toContain("position:relative");
    expect(html).toContain("left:160px");
    expect(html).toContain("top:-20px");
    expect(html).toContain("z-index:3");
  });

  it("reserves published layer image space outside the text flow", () => {
    render(
      <NoticeRichContent content='<p>앞글 <img src="/uploads/published-layer.png" alt="본문 이미지" data-width="40" data-pixel-width="320" data-pixel-height="240" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="front" data-offset-x="80" data-offset-y="30" /> 뒷글</p>' />,
    );

    const contentRoot = document.querySelector(".notice-rich-content") as HTMLElement;
    const layerNode = document.querySelector("[data-notice-image-layer]") as HTMLElement;
    const layerSurface = document.querySelector("[data-notice-image-layer-surface]") as HTMLElement;
    const image = screen.getByAltText("본문 이미지");

    expect(contentRoot).toHaveStyle({
      paddingBottom: "calc(1.5rem + 270px)",
    });
    expect(layerNode).toHaveAttribute("data-notice-image-layer", "front");
    expect(layerNode).toHaveStyle({
      display: "inline-block",
      position: "relative",
      width: "0px",
      height: "0px",
      overflow: "visible",
    });
    expect(layerSurface).toHaveStyle({
      position: "absolute",
      left: "80px",
      top: "30px",
      width: "320px",
      zIndex: "3",
    });
    expect(image).toHaveStyle({
      width: "100%",
      height: "240px",
      objectFit: "fill",
    });
  });

  it("sanitizes professional editor formatting from the V2 editor", () => {
    const html = sanitizeNoticeContentHtml(
      '<p data-text-align="center" data-line-height="1.8" style="text-align:center;line-height:1.8;color:expression(alert(1))"><span data-font-family="Gulim" data-font-size="18px" style="font-family:Gulim;font-size:18px;color:#0090ff;background-color:#ffbb26">전문 편집 문장</span></p><p data-text-align="evil" data-line-height="999" style="text-align:evil;line-height:999"><span data-font-family="BadFont" data-font-size="99px" style="font-family:BadFont;font-size:99px;color:url(javascript:alert(1))">위험</span></p>',
    );

    expect(html).toContain('data-text-align="center"');
    expect(html).toContain('data-line-height="1.8"');
    expect(html).toContain('style="text-align:center;line-height:1.8;"');
    expect(html).toContain('data-font-family="Gulim"');
    expect(html).toContain('data-font-size="18px"');
    expect(html).toContain('style="font-family:Gulim;font-size:18px;color:#0090ff;background-color:#ffbb26;"');
    expect(html).toContain("전문 편집 문장");
    expect(html).toContain("위험");
    expect(html).not.toContain("expression");
    expect(html).not.toContain("javascript");
    expect(html).not.toContain("BadFont");
    expect(html).not.toContain("99px");
    expect(html).not.toContain("line-height:999");
  });

  it("preserves empty editor paragraphs as visible blank lines in published content", () => {
    const html = sanitizeNoticeContentHtml(
      '<p data-line-height="1.625" style="line-height:1.625;">윗줄</p><p></p><p data-line-height="1.8" style="line-height:1.8;"></p><p>아랫줄</p>',
    );

    expect(html).toContain('<p data-line-height="1.625" style="line-height:1.625;">윗줄</p>');
    expect(html).toContain("<p><br /></p>");
    expect(html).toContain('<p data-line-height="1.8" style="line-height:1.8;"><br /></p>');

    render(<NoticeRichContent content={html} />);

    const paragraphs = document.querySelectorAll(".notice-rich-content p");
    expect(paragraphs[0]).toHaveStyle({ lineHeight: "1.625" });
    expect(paragraphs[1].querySelector("br")).toBeInTheDocument();
    expect(paragraphs[2]).toHaveStyle({ lineHeight: "1.8" });
    expect(paragraphs[2].querySelector("br")).toBeInTheDocument();
  });

  it("inserts multiple selected images as normal body images by default", async () => {
    const onChange = vi.fn();
    const onUploadImage = vi
      .fn()
      .mockResolvedValueOnce({ url: "/uploads/inline-1.png" })
      .mockResolvedValueOnce({ url: "/uploads/inline-2.png" });

    render(
      <NoticeRichEditor
        value=""
        onChange={onChange}
        onUploadImage={onUploadImage}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    expect(screen.getByRole("button", { name: "이미지 삽입" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByLabelText("본문 이미지 선택"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });

    await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining("/uploads/inline-2.png")));
    expect(onChange.mock.lastCall?.[0]).not.toContain("data-notice-gallery");
    await waitFor(() => expect(screen.getAllByAltText("본문 이미지")).toHaveLength(2));
  });

  it("renders a professional V2 editor toolbar with font, size, line-height, text, and image controls", () => {
    render(
      <NoticeRichEditor
        value=""
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    expect(screen.getByLabelText("글꼴")).toHaveValue("Pretendard Variable");
    expect(screen.getByLabelText("글자 크기")).toHaveValue("14px");
    expect(screen.getByLabelText("줄간격")).toHaveValue("1.625");
    expect(screen.getByRole("textbox", { name: "본문 편집창" })).toHaveClass(
      "px-6",
      "py-6",
      "text-sm",
      "leading-relaxed",
      "[&_p]:mb-3",
    );
    expect(screen.getByRole("textbox", { name: "본문 편집창" })).not.toHaveClass("text-xs", "px-7");
    expect(screen.getByRole("button", { name: "굵게" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "밑줄" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소선" })).toBeInTheDocument();
    expect(screen.getByLabelText("글자색")).toHaveValue("#343433");
    expect(screen.getByLabelText("배경색")).toHaveValue("#ffffff");
    expect(screen.getByRole("button", { name: "왼쪽 정렬" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "글머리 기호" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "들여쓰기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이미지 삽입" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2열 이미지" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "대표+2열 이미지" })).toBeInTheDocument();
  });

  it("schedules external HTML value updates outside the React effect call stack", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { rerender } = render(
      <NoticeRichEditor
        value="<p>초기 본문</p>"
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    rerender(
      <NoticeRichEditor
        value="<p>외부에서 바뀐 본문</p>"
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    expect(screen.getByRole("textbox", { name: "본문 편집창" })).not.toHaveTextContent("외부에서 바뀐 본문");
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "본문 편집창" })).toHaveTextContent("외부에서 바뀐 본문"),
    );
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining("flushSync was called"));

    consoleError.mockRestore();
  });

  it("preserves the site's Pretendard Variable font in published content", () => {
    const html = sanitizeNoticeContentHtml(
      '<p><span data-font-family="Pretendard Variable" data-font-size="14px" style="font-family:Pretendard Variable;font-size:14px;">기본 본문</span></p>',
    );

    expect(html).toContain('data-font-family="Pretendard Variable"');
    expect(html).toContain('data-font-size="14px"');
    expect(html).toContain('style="font-family:Pretendard Variable;font-size:14px;"');
  });

  it("does not rewrite rich text formatting from a native input event during mouse selection", () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p data-text-align="center" data-line-height="1.8" style="text-align:center;line-height:1.8;"><span data-font-family="Gulim" data-font-size="18px" style="font-family:Gulim;font-size:18px;color:#0090ff;background-color:#ffbb26;"><strong>서식이 있는 문장</strong></span></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "본문 편집창" });
    const range = document.createRange();
    const textNode = editor.querySelector("strong")?.firstChild;
    expect(textNode).toBeInstanceOf(Text);
    range.setStart(textNode as Text, 0);
    range.setEnd(textNode as Text, "서식이 있는 문장".length);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);

    fireEvent.input(editor);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("uploads multiple selected body images as one two-column gallery", async () => {
    const onChange = vi.fn();
    const onUploadImage = vi
      .fn()
      .mockResolvedValueOnce({ url: "/uploads/gallery-1.png" })
      .mockResolvedValueOnce({ url: "/uploads/gallery-2.png" });

    render(
      <NoticeRichEditor
        value=""
        onChange={onChange}
        onUploadImage={onUploadImage}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2열 이미지" }));
    fireEvent.change(screen.getByLabelText("본문 이미지 선택"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });

    await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('data-notice-gallery="two-column"')),
    );
    expect(onChange.mock.lastCall?.[0]).toContain("/uploads/gallery-1.png");
    expect(onChange.mock.lastCall?.[0]).toContain("/uploads/gallery-2.png");
    expect(onChange.mock.lastCall?.[0]).toContain('data-fit="contain"');
    await waitFor(() => expect(screen.getAllByAltText("본문 이미지")).toHaveLength(2));
  });

  it("keeps text typed after a two-column gallery outside the gallery block", async () => {
    const onChange = vi.fn();
    const onUploadImage = vi
      .fn()
      .mockResolvedValueOnce({ url: "/uploads/gallery-text-1.png" })
      .mockResolvedValueOnce({ url: "/uploads/gallery-text-2.png" });

    render(
      <NoticeRichEditor
        value=""
        onChange={onChange}
        onUploadImage={onUploadImage}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "2열 이미지" }));
    fireEvent.change(screen.getByLabelText("본문 이미지 선택"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });

    await waitFor(() => expect(onChange).toHaveBeenCalled());

    const editor = screen.getByRole("textbox", { name: "본문 편집창" });
    await waitFor(() => expect(editor.querySelector("[data-notice-gallery]")).not.toBeNull());
    const gallery = editor.querySelector("[data-notice-gallery]");
    expect(gallery).not.toBeNull();
    expect(gallery).toHaveAttribute("contenteditable", "false");

    const textParagraph = gallery?.nextElementSibling as HTMLParagraphElement | null;
    expect(textParagraph?.tagName).toBe("P");
    expect(onChange.mock.lastCall?.[0]).toContain("</div><p></p>");
    expect(gallery?.textContent).not.toContain("갤러리 다음 본문");
  });

  it("uses the featured gallery template when selected", async () => {
    const onChange = vi.fn();
    const onUploadImage = vi
      .fn()
      .mockResolvedValueOnce({ url: "/uploads/featured-1.png" })
      .mockResolvedValueOnce({ url: "/uploads/featured-2.png" });

    render(
      <NoticeRichEditor
        value=""
        onChange={onChange}
        onUploadImage={onUploadImage}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "대표+2열 이미지" }));
    fireEvent.change(screen.getByLabelText("본문 이미지 선택"), {
      target: {
        files: [
          new File(["one"], "one.png", { type: "image/png" }),
          new File(["two"], "two.png", { type: "image/png" }),
        ],
      },
    });

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('data-notice-gallery="featured-grid"')),
    );
  });

  it("keeps single selected body images as standalone images", async () => {
    const onChange = vi.fn();
    const onUploadImage = vi.fn().mockResolvedValueOnce({ url: "/uploads/single.png" });

    render(
      <NoticeRichEditor
        value=""
        onChange={onChange}
        onUploadImage={onUploadImage}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.change(screen.getByLabelText("본문 이미지 선택"), {
      target: { files: [new File(["one"], "one.png", { type: "image/png" })] },
    });

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining("/uploads/single.png")));
    expect(onChange.mock.lastCall?.[0]).not.toContain("data-notice-gallery");
  });

  it("edits selected images through a clean object toolbar and separate image editor", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/editable.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const imageNode = screen.getByRole("group", { name: "이미지 객체" });
    const layoutToolbar = screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" });

    expect(screen.queryByText("이미지 크기")).not.toBeInTheDocument();
    expect(screen.queryByRole("slider", { name: "이미지 노드 크기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("toolbar", { name: "이미지 빠른 도구" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이미지 왼쪽 위 트리밍" })).not.toBeInTheDocument();
    expect(imageNode).toContainElement(layoutToolbar);

    fireEvent.click(screen.getByRole("button", { name: "이미지 텍스트 감싸기" }));

    expect(onChange.mock.lastCall?.[0]).toContain('data-layout="wrap"');

    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));
    const dialog = screen.getByRole("dialog", { name: "이미지 편집" });
    expect(dialog).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("너비(px)"), { target: { value: "415" } });
    fireEvent.change(screen.getByLabelText("높이(px)"), { target: { value: "320" } });
    fireEvent.click(screen.getByRole("button", { name: "이미지 편집 왼쪽 위 트리밍" }));
    fireEvent.click(screen.getByRole("button", { name: "이미지 편집 오른쪽 회전" }));
    fireEvent.click(screen.getByRole("button", { name: "이미지 편집 적용" }));

    expect(onChange.mock.lastCall?.[0]).toContain('data-pixel-width="415"');
    expect(onChange.mock.lastCall?.[0]).toContain('data-pixel-height="320"');
    expect(onChange.mock.lastCall?.[0]).toContain('data-crop-x="left"');
    expect(onChange.mock.lastCall?.[0]).toContain('data-crop-y="top"');
    expect(onChange.mock.lastCall?.[0]).toContain('data-rotate="90"');
    expect(onChange.mock.lastCall?.[0]).toContain('data-layout="wrap"');
    expect(screen.queryByRole("dialog", { name: "이미지 편집" })).not.toBeInTheDocument();
  });

  it("selects image objects on mouse down so image editing activates like text selection", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/mousedown.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.mouseDown(await screen.findByAltText("본문 이미지"));

    expect(screen.getByRole("group", { name: "이미지 객체" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    expect(screen.getByRole("dialog", { name: "이미지 편집" })).toBeInTheDocument();
  });

  it("activates an image object on pointer down before the editor changes text selection", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/pointer.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.pointerDown(await screen.findByAltText("본문 이미지"));

    expect(screen.getByRole("group", { name: "이미지 객체" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" })).toBeInTheDocument();
  });

  it("enters inline crop mode when an image object is double-clicked", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/double-click.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.doubleClick(await screen.findByAltText("본문 이미지"));

    expect(screen.getByRole("group", { name: "이미지 객체" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "이미지 자르기 도구" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "자르기 왼쪽 위" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "자르기 오른쪽 아래" })).toBeInTheDocument();
    expect(document.querySelector("[data-notice-image-crop-overlay]")).not.toBeNull();
    expect(screen.queryByRole("toolbar", { name: "이미지 레이아웃 도구" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "이미지 편집" })).not.toBeInTheDocument();
  });

  it("enters inline crop mode when the image receives two normal clicks", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/two-click-crop.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const image = await screen.findByAltText("본문 이미지");
    fireEvent.pointerDown(image);
    fireEvent.mouseDown(image);
    fireEvent.click(image);
    fireEvent.pointerDown(image);
    fireEvent.mouseDown(image);
    fireEvent.click(image);

    expect(screen.getByRole("toolbar", { name: "이미지 자르기 도구" })).toBeInTheDocument();
    expect(document.querySelector("[data-notice-image-crop-overlay]")).not.toBeNull();
  });

  it("saves an inline crop from internal crop handles", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/crop-save.png" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-zoom="100" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.doubleClick(await screen.findByAltText("본문 이미지"));

    const frame = document.querySelector("[data-notice-image-frame]") as HTMLElement;
    const rectSpy = vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(screen.getByRole("button", { name: "자르기 오른쪽 아래" }), { clientX: 400, clientY: 300 });
    fireEvent.mouseMove(document, { clientX: 280, clientY: 210 });
    fireEvent.mouseUp(document);
    fireEvent.click(screen.getByRole("button", { name: "자르기 저장" }));

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).toContain('src="/uploads/crop-save.png"');
    expect(savedHtml).toContain('data-fit="cover"');
    expect(savedHtml).toContain('data-crop-x="left"');
    expect(savedHtml).toContain('data-crop-y="top"');
    expect(savedHtml).toMatch(/data-zoom="1[1-9]\d"/);
    expect(screen.queryByRole("toolbar", { name: "이미지 자르기 도구" })).not.toBeInTheDocument();
    rectSpy.mockRestore();
  });

  it("does not render an empty image src after image metadata updates", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="" alt="본문 이미지" data-width="100" data-fit="cover" data-crop-x="left" data-crop-y="top" data-zoom="120" style="width:100%;max-width:100%;height:auto;object-fit:cover;object-position:left top;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    await waitFor(() => expect(screen.getByRole("textbox", { name: "본문 편집창" })).toBeInTheDocument());

    expect(document.querySelector('img[src=""]')).toBeNull();
    expect(screen.queryByAltText("본문 이미지")).not.toBeInTheDocument();
  });

  it("cancels inline crop mode without changing the selected image", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/crop-cancel.png" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-zoom="100" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.doubleClick(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "자르기 취소" }));

    expect(screen.queryByRole("toolbar", { name: "이미지 자르기 도구" })).not.toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not change image fit when crop mode is saved without moving a crop handle", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/crop-untouched.png" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-zoom="100" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.doubleClick(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "자르기 저장" }));

    expect(screen.queryByRole("toolbar", { name: "이미지 자르기 도구" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("opens the image editor when the toolbar edit button receives the full pointer click sequence", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/toolbar-edit.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const editButton = screen.getByRole("button", { name: "이미지 고급 설정" });

    fireEvent.pointerDown(editButton);
    fireEvent.mouseDown(editButton);
    fireEvent.pointerUp(editButton);
    fireEvent.mouseUp(editButton);
    fireEvent.click(editButton);

    const dialog = screen.getByRole("dialog", { name: "이미지 편집" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass("z-[220]");
    expect(dialog).toHaveStyle({ zIndex: "220" });
  });

  it("opens detailed image settings as a right side options panel", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/side-options.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    const panel = screen.getByRole("dialog", { name: "이미지 편집" });
    expect(panel).toHaveAttribute("data-notice-image-options-panel", "");
    expect(panel).toHaveClass("right-0");
    expect(panel).toHaveTextContent("크기 및 회전");
    expect(panel).toHaveTextContent("조정");

    fireEvent.click(within(panel).getByRole("button", { name: "글자처럼 처리" }));
    expect(onChange.mock.lastCall?.[0]).toContain('data-layout="inline"');
  });

  it("opens the image editor as soon as the toolbar edit button is pressed", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/toolbar-pointer-open.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    expect(screen.getByRole("dialog", { name: "이미지 편집" })).toBeInTheDocument();
  });

  it("opens toolbar image editing without relying on the editor custom event bridge", async () => {
    const dispatchSpy = vi.spyOn(EventTarget.prototype, "dispatchEvent");

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/local-editor-open.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    expect(screen.getByRole("dialog", { name: "이미지 편집" })).toBeInTheDocument();
    expect(dispatchSpy.mock.calls.some(([event]) => event.type === "notice-rich-editor:image-editor-open")).toBe(false);

    dispatchSpy.mockRestore();
  });

  it("opens the image editor for images inside a two-column gallery", async () => {
    render(
      <NoticeRichEditor
        value='<div data-notice-gallery="two-column" contenteditable="false" class="notice-image-gallery"><img src="/uploads/gallery-edit-1.png" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /><img src="/uploads/gallery-edit-2.png" alt="본문 이미지" data-width="100" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></div><p></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click((await screen.findAllByAltText("본문 이미지"))[0]);
    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    expect(screen.getByRole("dialog", { name: "이미지 편집" })).toBeInTheDocument();
  });

  it("keeps image editor controls out of the document HTML while editing", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/editable.png" alt="본문 이미지" data-width="100" data-fit="contain" style="width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));

    const editor = screen.getByRole("textbox", { name: "본문 편집창" });
    expect(editor.querySelector('[role="dialog"]')).toBeNull();
    expect(editor.textContent).not.toContain("이미지 편집");
    expect(editor.textContent).not.toContain("너비(px)");

    fireEvent.change(screen.getByLabelText("너비(px)"), { target: { value: "415" } });
    fireEvent.change(screen.getByLabelText("높이(px)"), { target: { value: "320" } });

    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining("너비(px)"));
    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining("이미지 편집"));
    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining("취소완료"));

    fireEvent.click(screen.getByRole("button", { name: "이미지 편집 적용" }));

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml.match(/<img/g)).toHaveLength(1);
    expect(savedHtml).not.toContain("너비(px)");
    expect(savedHtml).not.toContain("이미지 편집");
    expect(savedHtml).not.toContain("취소완료");
  });

  it("shows an object resize handle and updates the selected node by dragging", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/drag-node.png" alt="본문 이미지" data-width="50" data-fit="contain" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const resizeHandle = screen.getByRole("button", { name: "이미지 크기 조절 오른쪽 아래" });
    expect(screen.queryByRole("button", { name: "이미지 노드 회전" })).not.toBeInTheDocument();

    fireEvent.mouseDown(resizeHandle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 80, clientY: 0 });
    fireEvent.mouseUp(document);

    expect(onChange.mock.lastCall?.[0]).toContain('data-pixel-width="280"');
    expect(screen.queryByRole("slider", { name: "이미지 노드 크기" })).not.toBeInTheDocument();
  });

  it("does not switch a selected image into crop mode when the image surface is dragged", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/no-implicit-crop.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const image = await screen.findByAltText("본문 이미지");
    fireEvent.click(image);
    fireEvent.mouseDown(image, { clientX: 80, clientY: 80 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(document);

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).not.toContain('data-fit="cover"');
    expect(image).toHaveAttribute("data-fit", "contain");
    expect(image).toHaveAttribute("data-crop-x", "center");
    expect(image).toHaveAttribute("data-crop-y", "center");
  });

  it("uses the top and bottom handles for height resizing without changing crop mode", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/height-resize.png" alt="본문 이미지" data-width="50" data-pixel-height="300" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="width:50%;max-width:100%;height:300px;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    fireEvent.mouseDown(screen.getByRole("button", { name: "이미지 크기 조절 아래" }), { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: 80 });
    fireEvent.mouseUp(document);

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).toContain('data-width="50"');
    expect(savedHtml).toContain('data-pixel-height="380"');
    expect(savedHtml).toContain('data-fit="contain"');
    expect(savedHtml).toContain('data-crop-x="center"');
    expect(savedHtml).toContain('data-crop-y="center"');
  });

  it("uses side handles to stretch image width in pixels without switching crop mode", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/side-stretch.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const frame = document.querySelector("[data-notice-image-frame]") as HTMLElement;
    const rectSpy = vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 120,
      width: 200,
      height: 120,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(screen.getByRole("button", { name: "이미지 크기 조절 오른쪽" }), { clientX: 200, clientY: 60 });
    fireEvent.mouseMove(document, { clientX: 260, clientY: 60 });
    fireEvent.mouseUp(document);

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).toContain('data-pixel-width="260"');
    expect(savedHtml).toContain('data-fit="contain"');
    expect(savedHtml).toContain('data-crop-x="center"');
    expect(savedHtml).toContain('data-crop-y="center"');
    rectSpy.mockRestore();
  });

  it("uses top and bottom handles to stretch image height even when no pixel height exists", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/vertical-stretch.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const frame = document.querySelector("[data-notice-image-frame]") as HTMLElement;
    const rectSpy = vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 120,
      width: 200,
      height: 120,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(screen.getByRole("button", { name: "이미지 크기 조절 아래" }), { clientX: 100, clientY: 120 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 180 });
    fireEvent.mouseUp(document);

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).toContain('data-pixel-height="180"');
    expect(savedHtml).toContain('data-fit="contain"');
    expect(savedHtml).toContain('data-crop-x="center"');
    expect(savedHtml).toContain('data-crop-y="center"');
    rectSpy.mockRestore();
  });

  it("shows a clean Google Docs style image toolbar and keeps advanced controls out of the default selection", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/google-docs-style.png" alt="본문 이미지" data-width="50" data-fit="cover" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;aspect-ratio:1 / 1;object-fit:cover;object-position:center center;display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    expect(screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /이미지 크기 조절/ })).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: /이미지 크기 조절/ })[0]).toHaveClass("size-2");
    expect(screen.getByRole("button", { name: "이미지 회전 핸들" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이미지 회전 핸들" })).toHaveClass("size-3");
    expect(screen.getByRole("button", { name: "이미지 회전 핸들" })).toHaveStyle({ top: "-42px" });
    expect(screen.getByRole("button", { name: "글자처럼 처리" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "텍스트와 함께 이동" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이미지 고급 설정" })).toBeInTheDocument();
    expect(screen.queryByRole("toolbar", { name: "이미지 빠른 도구" })).not.toBeInTheDocument();
    expect(screen.queryByRole("slider", { name: "이미지 확대" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "이미지 오른쪽 아래 트리밍" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "이미지 텍스트 감싸기" }));
    expect(onChange.mock.lastCall?.[0]).toContain('data-layout="wrap"');

    fireEvent.click(screen.getByRole("button", { name: "이미지 고급 설정" }));
    expect(screen.getByRole("dialog", { name: "이미지 편집" })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "이미지 크기 조절 오른쪽 아래" }), { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 80, clientY: 40 });
    fireEvent.mouseUp(document);

    const savedHtml = onChange.mock.lastCall?.[0] || "";
    expect(savedHtml).toContain('data-pixel-width="280"');
    expect(savedHtml).toContain('data-pixel-height="280"');
    expect(savedHtml).toContain("object-fit: fill");
    expect(savedHtml).not.toContain("aspect-ratio:1 / 1");
  });

  it("rotates a selected image from the top rotation handle", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/rotate-handle.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const frame = document.querySelector("[data-notice-image-frame]") as HTMLElement;
    const rectSpy = vi.spyOn(frame, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 200,
      width: 200,
      height: 200,
      toJSON: () => ({}),
    });

    fireEvent.mouseDown(screen.getByRole("button", { name: "이미지 회전 핸들" }), { clientX: 100, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(document);

    expect(onChange.mock.lastCall?.[0]).toContain('data-rotate="90"');
    expect(screen.getByText("90.0°")).toBeInTheDocument();
    rectSpy.mockRestore();
  });

  it("shows rotation angle and keeps the rotated image visible outside the crop frame", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/rotated-visible.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="33" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;transform:rotate(33deg);display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const surface = document.querySelector("[data-notice-image-rotatable-surface]");
    const angleLabel = document.querySelector("[data-notice-image-rotation-angle]");
    const rotateHandle = screen.getByRole("button", { name: "이미지 회전 핸들" });

    expect(angleLabel).toHaveTextContent("33.0°");
    expect(surface).toContainElement(angleLabel as HTMLElement);
    expect(surface).toContainElement(rotateHandle);
    expect(angleLabel).toHaveStyle({ left: "50%", top: "-42px" });
    expect(angleLabel?.getAttribute("style")).toContain("rotate(-33deg)");
    expect(surface).toHaveStyle({
      transform: "rotate(33deg)",
    });
    expect(document.querySelector("[data-notice-image-rotation-outline]")).toHaveStyle({
      transform: "none",
    });
    expect(document.querySelector("[data-notice-image-frame]")).toHaveStyle({
      overflow: "visible",
    });
  });

  it("rotates the selected image, outline, resize handles, and rotate handle as one object", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/rotated-object.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="20" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;transform:rotate(20deg);display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const surface = document.querySelector("[data-notice-image-rotatable-surface]");
    expect(surface).toHaveStyle({ transform: "rotate(20deg)" });
    expect(surface?.querySelector("[data-notice-image-frame]")).not.toBeNull();
    expect(surface?.querySelectorAll("[data-notice-image-resize]")).toHaveLength(8);
    expect(surface?.querySelector("[data-notice-image-rotate]")).not.toBeNull();
    expect(surface?.querySelector("[data-notice-image-rotation-angle]")).not.toBeNull();
    expect(surface?.querySelector("[data-notice-image-rotation-outline]")).not.toBeNull();
    expect(await screen.findByAltText("본문 이미지")).not.toHaveStyle({ transform: "rotate(20deg)" });
    expect(document.querySelector("[data-notice-image-controls]")).not.toHaveStyle({ transform: "rotate(20deg)" });
  });

  it("renders a Google Docs style bottom image layout popup and applies image-as-text placement", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/layout-menu.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const toolbar = screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" });
    expect(toolbar).toHaveClass("rounded-full");
    expect(toolbar.querySelectorAll("[data-notice-image-layout-icon]")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "이미지 배치 방식" })).not.toBeInTheDocument();
    expect(toolbar).not.toHaveTextContent("텍스트와 함께 이동");
    const activeLayoutButton = screen.getByRole("button", { name: "텍스트와 함께 이동" });
    expect(activeLayoutButton.firstElementChild).toHaveClass("rounded-full");
    expect(activeLayoutButton.firstElementChild).toHaveClass("bg-sky-blue/15");

    fireEvent.click(screen.getByRole("button", { name: "글자처럼 처리" }));

    expect(onChange.mock.lastCall?.[0]).toContain('data-layout="inline"');
  });

  it("makes every bottom image layout icon visible and stores its own placement mode", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/layout-actions.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;display:block;margin-left:0;margin-right:auto;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    await waitFor(() => expect(screen.getByAltText("본문 이미지")).toBeInTheDocument());
    fireEvent.click(await screen.findByAltText("본문 이미지"));

    const toolbar = screen.getByRole("toolbar", { name: "이미지 레이아웃 도구" });
    const icons = toolbar.querySelectorAll("[data-notice-image-layout-icon]");
    expect(icons).toHaveLength(5);
    icons.forEach((icon) => {
      expect(icon.tagName.toLowerCase()).toBe("svg");
      expect(icon).toHaveAttribute("stroke", "currentColor");
      expect(icon.querySelectorAll("line,path,rect")).not.toHaveLength(0);
    });

    const layoutCases = [
      ["글자처럼 처리", "inline"],
      ["이미지 텍스트 감싸기", "wrap"],
      ["텍스트와 함께 이동", "block"],
      ["텍스트 뒤에 배치", "behind"],
      ["텍스트 앞에 배치", "front"],
    ] as const;

    for (const [label, layout] of layoutCases) {
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(onChange.mock.lastCall?.[0]).toContain(`data-layout="${layout}"`);
    }
  });

  it("renders behind and front layout choices as movable text layers", async () => {
    render(
      <NoticeRichEditor
        value='<p>앞글</p><p><img src="/uploads/layer-mode.png" alt="본문 이미지" data-width="50" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" data-offset-x="0" data-offset-y="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p><p>뒷글</p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const imageNode = screen.getByRole("group", { name: "이미지 객체" });
    const layerSurface = document.querySelector("[data-notice-image-rotatable-surface]") as HTMLElement;

    fireEvent.click(screen.getByRole("button", { name: "텍스트 뒤에 배치" }));
    expect(imageNode).toHaveAttribute("data-layer-layout", "behind");
    expect(imageNode).toHaveStyle({ width: "0px", height: "0px" });
    expect(layerSurface).toHaveStyle({ position: "absolute", left: "0px", top: "0px", width: "400px", zIndex: "0" });
    expect(layerSurface).not.toHaveClass("max-w-full");
    expect(await screen.findByAltText("본문 이미지")).toHaveStyle({ opacity: "0.45" });

    fireEvent.click(screen.getByRole("button", { name: "텍스트 앞에 배치" }));
    expect(imageNode).toHaveAttribute("data-layer-layout", "front");
    expect(layerSurface).toHaveStyle({ position: "absolute", width: "400px", zIndex: "30" });
    expect(layerSurface).not.toHaveClass("max-w-full");
    expect(await screen.findByAltText("본문 이미지")).toHaveStyle({ opacity: "1" });
  });

  it("moves front and behind layer images by dragging the selected image", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p>본문 <img src="/uploads/layer-drag.png" alt="본문 이미지" data-width="40" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="front" data-offset-x="0" data-offset-y="0" style="width:40%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /> 이어쓰기</p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const image = await screen.findByAltText("본문 이미지");
    fireEvent.mouseDown(image, { clientX: 100, clientY: 80 });
    fireEvent.mouseMove(document, { clientX: 160, clientY: 115 });
    fireEvent.mouseUp(document);

    const savedHtml = String(onChange.mock.lastCall?.[0] || "");
    expect(savedHtml).toContain('data-layout="front"');
    expect(savedHtml).toContain('data-offset-x="60"');
    expect(savedHtml).toContain('data-offset-y="35"');
    expect(document.querySelector("[data-notice-image-rotatable-surface]")).toHaveStyle({
      left: "60px",
      top: "35px",
    });
  });

  it("keeps saved front and behind layer images visible when the editor loads existing content", async () => {
    render(
      <NoticeRichEditor
        value='<p>본문 <img src="/uploads/layer-visible.png" alt="본문 이미지" data-width="40" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="front" data-offset-x="80" data-offset-y="30" style="width:40%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /> 이어쓰기</p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    await screen.findByAltText("본문 이미지");

    const imageNode = document.querySelector("[data-notice-image-node]") as HTMLElement;
    const layerSurface = document.querySelector("[data-notice-image-rotatable-surface]") as HTMLElement;

    expect(imageNode).toHaveStyle({ width: "0px", height: "0px" });
    expect(layerSurface).toHaveStyle({ width: "320px", left: "80px", top: "30px" });
    expect(layerSurface).not.toHaveClass("max-w-full");
  });

  it("keeps image nodes inside text flow and visibly changes placement when each bottom menu item is clicked", async () => {
    render(
      <NoticeRichEditor
        value='<p>앞글 <img src="/uploads/flow-layout.png" alt="본문 이미지" data-width="40" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="inline" style="width:40%;max-width:100%;height:auto;object-fit:contain;object-position:center center;display:inline-block;margin-left:4px;margin-right:4px;vertical-align:middle;" /> 뒷글</p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const editor = screen.getByRole("textbox", { name: "본문 편집창" });
    await waitFor(() => expect(screen.getByAltText("본문 이미지")).toBeInTheDocument());
    const paragraph = editor.querySelector("p");
    expect(paragraph).not.toBeNull();
    expect(paragraph).toHaveTextContent("앞글");
    expect(paragraph).toHaveTextContent("뒷글");
    expect(paragraph?.querySelector("[data-notice-image-node]")).not.toBeNull();

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const imageNode = screen.getByRole("group", { name: "이미지 객체" });

    fireEvent.click(screen.getByRole("button", { name: "글자처럼 처리" }));
    expect(imageNode).toHaveClass("inline-block");

    fireEvent.click(screen.getByRole("button", { name: "이미지 텍스트 감싸기" }));
    expect(imageNode).toHaveClass("float-left");

    fireEvent.click(screen.getByRole("button", { name: "텍스트와 함께 이동" }));
    expect(imageNode).toHaveClass("block");
    expect(imageNode).toHaveClass("ml-0");

    fireEvent.click(screen.getByRole("button", { name: "텍스트 뒤에 배치" }));
    expect(imageNode).toHaveClass("inline-block");
    expect(imageNode).toHaveClass("z-0");

    fireEvent.click(screen.getByRole("button", { name: "텍스트 앞에 배치" }));
    expect(imageNode).toHaveClass("inline-block");
    expect(imageNode).toHaveClass("z-30");
    expect(imageNode).toHaveAttribute("data-layer-layout", "front");
  });

  it("reserves space for the selected image toolbar and keeps selected images draggable", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/movable.png" alt="본문 이미지" data-width="40" data-fit="contain" data-crop-x="center" data-crop-y="center" data-rotate="0" data-align="left" data-layout="block" style="width:40%;max-width:100%;height:auto;object-fit:contain;object-position:center center;display:block;margin-left:0;margin-right:auto;" /></p><p>아래 본문</p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    const image = await screen.findByAltText("본문 이미지");
    fireEvent.click(image);

    const imageNode = screen.getByRole("group", { name: "이미지 객체" });
    expect(imageNode).toHaveAttribute("draggable", "true");
    expect(imageNode).toHaveStyle({ paddingBottom: "56px" });
    expect(image).toHaveAttribute("draggable", "true");
    expect(image.closest("[data-notice-image-move-surface]")).not.toBeNull();

    const mouseDown = new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 40, clientY: 40 });
    image.dispatchEvent(mouseDown);

    expect(mouseDown.defaultPrevented).toBe(false);
  });

  it("keeps the rich body editor writable after image node controls are shown", async () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/editable.png" alt="본문 이미지" data-width="50" data-fit="contain" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    const editor = screen.getByRole("textbox", { name: "본문 편집창" });

    expect(editor).toHaveAttribute("contenteditable", "true");
    fireEvent.click(editor);

    expect(screen.queryByRole("group", { name: "이미지 편집 노드" })).not.toBeInTheDocument();
  });

  it("returns to normal text editing mode when the editor body is clicked after selecting an image", async () => {
    render(
      <NoticeRichEditor
        value='<p><img src="/uploads/editable.png" alt="본문 이미지" data-width="50" data-fit="contain" data-rotate="0" style="width:50%;max-width:100%;height:auto;object-fit:contain;object-position:center center;" /></p><p>기존 본문</p>'
        onChange={vi.fn()}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(await screen.findByAltText("본문 이미지"));
    expect(screen.getByRole("group", { name: "이미지 객체" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("textbox", { name: "본문 편집창" }));

    expect(screen.queryByRole("group", { name: "이미지 객체" })).not.toBeInTheDocument();
  });

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

  it("normalizes pasted HTML-escaped query separators before building external links", () => {
    const html = buildNoticeLinkHtml(
      "https://www.law.go.kr/DRF/lawService.do?OC=dl_lawinfosearch&amp;target=law&amp;MST=287347",
      "주택법 시행령",
    );

    expect(html).toContain("OC=dl_lawinfosearch&amp;target=law&amp;MST=287347");
    expect(html).not.toContain("&amp;amp;");
  });

  it("replaces selected URL text through the link dialog without losing typed fields", () => {
    const onChange = vi.fn();

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
    const dialog = screen.getByRole("dialog", { name: "링크 등록" });
    const urlInput = screen.getByLabelText("연결 주소");
    const labelInput = screen.getByLabelText("표시 문구");

    fireEvent.change(urlInput, {
      target: { value: "https://dbapt-site.vercel.app/news?tab=notice&news=notice-1" },
    });
    fireEvent.change(labelInput, { target: { value: "대방동지주택 입장문" } });
    fireEvent.mouseDown(document.body);

    expect(dialog).toBeInTheDocument();
    expect(urlInput).toHaveValue("https://dbapt-site.vercel.app/news?tab=notice&news=notice-1");
    expect(labelInput).toHaveValue("대방동지주택 입장문");

    fireEvent.click(screen.getByRole("button", { name: "링크 삽입" }));

    expect(onChange).toHaveBeenLastCalledWith(
      '<p><a href="/news?tab=notice&amp;news=notice-1">대방동지주택 입장문</a></p>',
    );
    expect(editor.innerHTML).not.toContain("https://dbapt-site.vercel.app");
    expect(editor.innerHTML).toContain("대방동지주택 입장문");
  });

  it("does not render a nested form when the editor is inside a post form", () => {
    render(
      <form aria-label="게시글 작성">
        <NoticeRichEditor
          value="대방동지주택 입장문"
          onChange={vi.fn()}
          onUploadImage={async () => ({ url: "/uploads/image.png" })}
          ariaLabel="본문 편집창"
          placeholder="본문"
        />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "링크" }));

    expect(screen.getByRole("dialog", { name: "링크 등록" })).toBeInTheDocument();
    expect(document.body.querySelector("form form")).toBeNull();
  });

  it("opens clicked editor links in edit mode and updates the same link", () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p>원문 확인: <a href="/news?tab=notice&news=notice-1">주택법 시행령</a></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "주택법 시행령" }));

    expect(screen.getByRole("dialog", { name: "링크 수정" })).toBeInTheDocument();
    expect(screen.getByLabelText("연결 주소")).toHaveValue("/news?tab=notice&news=notice-1");
    expect(screen.getByLabelText("표시 문구")).toHaveValue("주택법 시행령");

    fireEvent.change(screen.getByLabelText("연결 주소"), {
      target: { value: "/news?tab=notice&news=notice-2" },
    });
    fireEvent.change(screen.getByLabelText("표시 문구"), {
      target: { value: "주택법 시행령 개정안" },
    });
    fireEvent.click(screen.getByRole("button", { name: "링크 수정" }));

    expect(onChange).toHaveBeenLastCalledWith(
      '<p>원문 확인: <a href="/news?tab=notice&amp;news=notice-2">주택법 시행령 개정안</a></p>',
    );
    expect(screen.queryByRole("link", { name: "주택법 시행령" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "주택법 시행령 개정안" })).toHaveAttribute(
      "href",
      "/news?tab=notice&news=notice-2",
    );
  });

  it("keeps external query separators usable after editing an HTML-escaped link", () => {
    const onChange = vi.fn();

    render(
      <NoticeRichEditor
        value='<p><a href="https://www.law.go.kr/DRF/lawService.do?OC=dl_lawinfosearch&amp;amp;target=law&amp;amp;MST=287347">주택법 시행령</a></p>'
        onChange={onChange}
        onUploadImage={async () => ({ url: "/uploads/image.png" })}
        ariaLabel="본문 편집창"
        placeholder="본문"
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "주택법 시행령" }));
    expect(screen.getByLabelText("연결 주소")).toHaveValue(
      "https://www.law.go.kr/DRF/lawService.do?OC=dl_lawinfosearch&target=law&MST=287347",
    );

    fireEvent.click(screen.getByRole("button", { name: "링크 수정" }));

    expect(onChange).toHaveBeenLastCalledWith(
      '<p><a href="https://www.law.go.kr/DRF/lawService.do?OC=dl_lawinfosearch&amp;target=law&amp;MST=287347">주택법 시행령</a></p>',
    );
    expect(onChange.mock.lastCall?.[0]).not.toContain("&amp;amp;");
  });

  it("renders custom free-board links with the chosen text", () => {
    render(
      <NoticeRichContent content='<p><a href="/news?tab=free&post=free-2">동작구청 방문 결과 보기</a></p>' />,
    );

    const link = screen.getByRole("link", { name: "동작구청 방문 결과 보기" });
    expect(link).toHaveAttribute("href", "/news?tab=free&post=free-2");
  });
});
