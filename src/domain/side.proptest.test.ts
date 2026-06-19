import { sideMembers, sideName } from "@/domain/side";
import { SIDE_KIND, type Participant } from "@/store/types";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("sideMembers プロパティテスト", () => {
  it("single の場合 sideMembers の長さは 1", () => {
    // シングル参加者は必ず 1 名のみ返される
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 16 }), (participantId) => {
        const side = { kind: SIDE_KIND.SINGLE, participantId };
        expect(sideMembers(side)).toHaveLength(1);
      }),
    );
  });

  it("pair の場合 sideMembers の長さは 2", () => {
    // ペア参加者は必ず 2 名返される
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }),
        fc.string({ minLength: 1, maxLength: 16 }),
        (a, b) => {
          const side = { kind: SIDE_KIND.PAIR, memberIds: [a, b] as [string, string] };
          expect(sideMembers(side)).toHaveLength(2);
        },
      ),
    );
  });

  it("全ての返却要素は string 型", () => {
    // sideMembers が返す全要素は string であることが保証される
    fc.assert(
      fc.property(
        fc.oneof(
          fc
            .string({ minLength: 1, maxLength: 16 })
            .map((id) => ({ kind: SIDE_KIND.SINGLE, participantId: id })),
          fc
            .tuple(
              fc.string({ minLength: 1, maxLength: 16 }),
              fc.string({ minLength: 1, maxLength: 16 }),
            )
            .map(([a, b]) => ({ kind: SIDE_KIND.PAIR, memberIds: [a, b] as [string, string] })),
        ),
        (side) => {
          const members = sideMembers(side);
          for (const member of members) {
            expect(typeof member).toBe("string");
          }
        },
      ),
    );
  });

  it("SINGLE: sideMembers が返す唯一の要素は participantId と一致する", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 16 }), (id) => {
        const side = { kind: SIDE_KIND.SINGLE, participantId: id };
        expect(sideMembers(side)).toEqual([id]);
      }),
    );
  });

  it("PAIR: sideMembers が返す2要素は memberIds と同値・同順", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }),
        fc.string({ minLength: 1, maxLength: 16 }),
        (a, b) => {
          const side = { kind: SIDE_KIND.PAIR, memberIds: [a, b] as [string, string] };
          expect(sideMembers(side)).toEqual([a, b]);
        },
      ),
    );
  });
});

describe("sideName プロパティテスト", () => {
  it("SINGLE: 名前が存在するとき participants[id].name を返す", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }),
        fc.string({ minLength: 1, maxLength: 16 }),
        (id, name) => {
          const side = { kind: SIDE_KIND.SINGLE, participantId: id };
          const participants: Record<string, Participant> = {
            [id]: { id, tournamentId: "t", name },
          };
          expect(sideName(side, participants)).toBe(name);
        },
      ),
    );
  });

  it('SINGLE: participants に id が存在しないとき "?" を返す', () => {
    // Object.prototype のプロパティ名(valueOf, toString 等)はプレーン {} でも truthy になるため除外
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 16 }).filter((id) => !(id in Object.prototype)),
        (id) => {
          const side = { kind: SIDE_KIND.SINGLE, participantId: id };
          expect(sideName(side, {})).toBe("?");
        },
      ),
    );
  });

  it('PAIR: 両メンバーの名前を " / " で結合して返す', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 8 }),
        (idA, nameA, idB, nameB) => {
          const side = { kind: SIDE_KIND.PAIR, memberIds: [idA, idB] as [string, string] };
          const participants: Record<string, Participant> = {
            [idA]: { id: idA, tournamentId: "t", name: nameA },
            [idB]: { id: idB, tournamentId: "t", name: nameB },
          };
          expect(sideName(side, participants)).toBe(`${nameA} / ${nameB}`);
        },
      ),
    );
  });

  it('PAIR: 片方のメンバーが participants に存在しないとき "?" にフォールバック', () => {
    // idB は participants に登録せず、Object.prototype 名も除外
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 8 }).filter((id) => !(id in Object.prototype)),
        fc.string({ minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 8 }).filter((id) => !(id in Object.prototype)),
        (idA, nameA, idB) => {
          const side = { kind: SIDE_KIND.PAIR, memberIds: [idA, idB] as [string, string] };
          const participants: Record<string, Participant> = {
            [idA]: { id: idA, tournamentId: "t", name: nameA },
          };
          expect(sideName(side, participants)).toBe(`${nameA} / ?`);
        },
      ),
    );
  });

  it('PAIR: 両メンバーが participants に存在しないとき "? / ?" を返す', () => {
    // Object.prototype 名と衝突する ID は除外
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 8 }).filter((id) => !(id in Object.prototype)),
        fc.string({ minLength: 1, maxLength: 8 }).filter((id) => !(id in Object.prototype)),
        (idA, idB) => {
          const side = { kind: SIDE_KIND.PAIR, memberIds: [idA, idB] as [string, string] };
          expect(sideName(side, {})).toBe("? / ?");
        },
      ),
    );
  });
});
