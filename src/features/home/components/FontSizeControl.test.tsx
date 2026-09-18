import { FontSizeControl } from "@/features/home/components/FontSizeControl";
import { FONT_SIZE } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { renderWithStore, setupStoreIsolation } from "@/test/renderWithStore";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, vi } from "vitest";

// jsdom は scrollIntoView を実装していないため polyfill
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn<() => void>();
});

setupStoreIsolation();

describe("FontSizeControl", () => {
  it("プルダウンから選ぶと fontSize が保存され dataset.fs に反映される", async () => {
    const user = userEvent.setup();
    renderWithStore(<FontSizeControl />);

    const trigger = screen.getByRole("button", { name: "文字サイズ" });
    // 初期値は「標準」
    expect(trigger).toHaveTextContent("標準");

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "特大" }));

    await waitFor(() => {
      expect(useAppStore.getState().fontSize).toBe(FONT_SIZE.XLARGE);
    });
    expect(document.documentElement.dataset.fs).toBe(FONT_SIZE.XLARGE);
    expect(trigger).toHaveTextContent("特大");
  });

  it("標準を選ぶと dataset.fs が外れる", async () => {
    const user = userEvent.setup();
    renderWithStore(<FontSizeControl />);

    const trigger = screen.getByRole("button", { name: "文字サイズ" });
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "小" }));
    await waitFor(() => {
      expect(document.documentElement.dataset.fs).toBe(FONT_SIZE.SMALL);
    });

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "標準" }));

    await waitFor(() => {
      expect(document.documentElement.dataset.fs).toBeUndefined();
    });
  });
});
