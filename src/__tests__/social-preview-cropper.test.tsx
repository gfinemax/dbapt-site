import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SocialPreviewCropper } from "@/components/social-preview-cropper";

describe("social preview cropper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the Kakao 2:1 frame and inset safe area", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:kakao-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    render(
      <SocialPreviewCropper
        file={new File(["image"], "source.png", { type: "image/png" })}
        open
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(await screen.findByText(/2:1 박스를 움직이고/)).toBeInTheDocument();
    const image = document.querySelector("img");
    expect(image).not.toBeNull();
    Object.defineProperties(image as HTMLImageElement, {
      naturalWidth: { value: 1200 },
      naturalHeight: { value: 628 },
    });
    fireEvent.load(image as HTMLImageElement);

    await waitFor(() => {
      expect(screen.getByText("2:1 · 800×400")).toBeInTheDocument();
      expect(screen.getByText("안전영역")).toBeInTheDocument();
    });
  });
});
