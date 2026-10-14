import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { isWakeLockSupported, useWakeLock } from "./useWakeLock";

const installWakeLockMock = () => {
  const release = vi.fn<() => Promise<void>>(() => Promise.resolve());
  const request = vi.fn<(type: "screen") => Promise<{ release: typeof release }>>(() =>
    Promise.resolve({ release }),
  );
  Object.defineProperty(navigator, "wakeLock", { value: { request }, configurable: true });
  return { request, release };
};

afterEach(() => {
  Reflect.deleteProperty(navigator, "wakeLock");
});

describe("useWakeLock", () => {
  it("非対応端末では何もしない", () => {
    expect(isWakeLockSupported()).toBe(false);
    expect(() => renderHook(() => useWakeLock(true))).not.toThrow();
  });

  it("enabled=true で request し、unmount で release する", async () => {
    const { request, release } = installWakeLockMock();
    const { unmount } = renderHook(() => useWakeLock(true));

    await vi.waitFor(() => expect(request).toHaveBeenCalledWith("screen"));
    unmount();
    await vi.waitFor(() => expect(release).toHaveBeenCalledOnce());
  });

  it("enabled=false では request しない", () => {
    const { request } = installWakeLockMock();
    renderHook(() => useWakeLock(false));
    expect(request).not.toHaveBeenCalled();
  });

  it("タブが再表示されたら再取得する", async () => {
    const { request } = installWakeLockMock();
    renderHook(() => useWakeLock(true));
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());

    document.dispatchEvent(new Event("visibilitychange"));
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });
});
