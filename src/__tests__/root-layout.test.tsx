import { describe, expect, it, vi } from "vitest";
import RootLayout from "@/app/layout";

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/landing/global-header", () => ({
  GlobalHeader: () => <header data-testid="global-header" />,
}));

describe("root layout", () => {
  it("declares smooth scroll behavior for Next route transitions", async () => {
    const layout = await RootLayout({ children: <main /> });

    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("ko");
    expect(layout.props["data-scroll-behavior"]).toBe("smooth");
  });
});
