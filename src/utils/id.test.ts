import { generateId } from "@/utils/id";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("generateId", () => {
  // ---------------------------------------------------------------------------
  // 形式検証: UUID v4 フォーマット
  // ---------------------------------------------------------------------------

  it("UUID v4 形式の文字列を返す", () => {
    const id = generateId();
    // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu);
  });

  it("返り値は文字列型である", () => {
    expect(typeof generateId()).toBe("string");
  });

  // ---------------------------------------------------------------------------
  // 一意性検証
  // ---------------------------------------------------------------------------

  it("連続して呼び出すと異なる ID が生成される", () => {
    const ids = Array.from({ length: 10 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(10);
  });

  // ---------------------------------------------------------------------------
  // モック検証: crypto.randomUUID への委譲
  // ---------------------------------------------------------------------------

  describe("crypto.randomUUID への委譲", () => {
    const FIXED_UUID = "11111111-2222-4333-a444-555555555555";
    let randomUUIDSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      randomUUIDSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(FIXED_UUID);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("crypto.randomUUID を1回呼び出す", () => {
      generateId();
      expect(randomUUIDSpy).toHaveBeenCalledTimes(1);
    });

    it("crypto.randomUUID の戻り値をそのまま返す", () => {
      expect(generateId()).toBe(FIXED_UUID);
    });
  });
});
