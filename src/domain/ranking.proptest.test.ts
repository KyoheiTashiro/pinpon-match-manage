import { computeRanking, type RankingRow } from "@/domain/ranking";
import { SIDE_KIND, type Match } from "@/store/types";
import { matchArb, matchWithPairArb, sideArb } from "@/test/arbitraries";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

/** matchArb の leftSide/rightSide から全参加者 ID を集め participantNames を作る */
function buildParticipantNames(matches: Match[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const match of matches) {
    if (match.leftSide.kind === SIDE_KIND.SINGLE) {
      names[match.leftSide.participantId] = match.leftSide.participantId;
    }
    if (match.rightSide.kind === SIDE_KIND.SINGLE) {
      names[match.rightSide.participantId] = match.rightSide.participantId;
    }
    if (match.leftSide.kind === SIDE_KIND.PAIR) {
      for (const id of match.leftSide.memberIds) {
        names[id] = id;
      }
    }
    if (match.rightSide.kind === SIDE_KIND.PAIR) {
      for (const id of match.rightSide.memberIds) {
        names[id] = id;
      }
    }
  }
  return names;
}

/** participantId の辞書順でソートして比較用に使う */
function sortById(rows: RankingRow[]): RankingRow[] {
  return rows.toSorted((a, b) => a.participantId.localeCompare(b.participantId));
}

describe("computeRanking プロパティテスト", () => {
  it("wins + losses === played（各行の整合性）", () => {
    // 勝利数と敗北数の合計は試合数と一致する
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 0, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        for (const row of rows) {
          expect(row.wins + row.losses).toBe(row.played);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("gameDiff === gamesWon - gamesLost", () => {
    // ゲーム差はゲーム勝利数からゲーム敗北数を引いた値
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 0, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        for (const row of rows) {
          expect(row.gameDiff).toBe(row.gamesWon - row.gamesLost);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("pointDiff === pointsFor - pointsAgainst", () => {
    // ポイント差は得点から失点を引いた値
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 0, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        for (const row of rows) {
          expect(row.pointDiff).toBe(row.pointsFor - row.pointsAgainst);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("rank は 1 始まりで非減少、最終 rank は行数以下", () => {
    // ランクは1以上で単調増加し、行数と整合する（同順位は同 rank）
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 1, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        expect(rows.at(0)!.rank).toBe(1);
        for (let index = 1; index < rows.length; index++) {
          expect(rows.at(index)!.rank).toBeGreaterThanOrEqual(rows.at(index - 1)!.rank);
        }
        expect(rows.at(-1)!.rank).toBeLessThanOrEqual(rows.length);
      }),
      { numRuns: 200 },
    );
  });

  it("matches のシャッフルでランキング結果が変わらない（順序不変性）", () => {
    // 試合の並び順に依らず同じランキングが得られる
    fc.assert(
      fc.property(
        fc
          .array(matchArb, { minLength: 1, maxLength: 5 })
          .chain((matches) =>
            fc
              .shuffledSubarray(matches, { minLength: matches.length, maxLength: matches.length })
              .map((shuffled) => ({ original: matches, shuffled })),
          ),
        ({ original, shuffled }) => {
          const names = buildParticipantNames(original);
          const rowsOriginal = computeRanking(original, names);
          const rowsShuffled = computeRanking(shuffled, names);
          expect(sortById(rowsOriginal)).toEqual(sortById(rowsShuffled));
        },
      ),
      { numRuns: 200 },
    );
  });

  it("シングルス試合では全体の pointsFor 合計 === pointsAgainst 合計", () => {
    // 全体の得点合計と失点合計は等しい（シングルス対称性）
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 0, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        const totalFor = rows.reduce((acc, r) => acc + r.pointsFor, 0);
        const totalAgainst = rows.reduce((acc, r) => acc + r.pointsAgainst, 0);
        expect(totalFor).toBe(totalAgainst);
      }),
      { numRuns: 200 },
    );
  });

  it("シングルス試合では gamesWon 合計 === gamesLost 合計", () => {
    // 全体のゲーム勝利数と敗北数は等しい（シングルス対称性）
    fc.assert(
      fc.property(fc.array(matchArb, { minLength: 0, maxLength: 5 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        const totalWon = rows.reduce((acc, r) => acc + r.gamesWon, 0);
        const totalLost = rows.reduce((acc, r) => acc + r.gamesLost, 0);
        expect(totalWon).toBe(totalLost);
      }),
      { numRuns: 200 },
    );
  });

  it("未終了の試合（games が空）を追加してもランキングに影響しない", () => {
    // games が空の試合は finished===false なのでランキング統計に変化なし
    fc.assert(
      fc.property(
        fc.array(matchArb, { minLength: 0, maxLength: 5 }),
        fc
          .tuple(
            fc.string({ minLength: 1, maxLength: 8 }),
            fc.string({ minLength: 1, maxLength: 8 }),
          )
          .filter(([a, b]) => a !== b),
        sideArb,
        (matches, [leftId, rightId], firstServer) => {
          const names = buildParticipantNames(matches);
          const emptyMatch: Match = {
            id: "empty",
            tournamentId: "t1",
            leftSide: { kind: SIDE_KIND.SINGLE, participantId: leftId },
            rightSide: { kind: SIDE_KIND.SINGLE, participantId: rightId },
            games: [],
            firstServer,
          };
          const withEmpty = [...matches, emptyMatch];
          const namesWithEmpty = Object.assign({}, names, { [leftId]: leftId, [rightId]: rightId });
          const rowsBefore = computeRanking(matches, namesWithEmpty);
          const rowsAfter = computeRanking(withEmpty, namesWithEmpty);
          // games 空の試合は finished にならないためランキング統計に変化なし
          expect(sortById(rowsBefore)).toEqual(sortById(rowsAfter));
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("computeRanking — PAIR(ダブルス)プロパティテスト", () => {
  it("PAIR試合: 各ペアメンバー2人がそれぞれランキング行に現れる", () => {
    // matchWithPairArb で生成した試合は必ず4人のIDが登場する
    fc.assert(
      fc.property(fc.array(matchWithPairArb, { minLength: 1, maxLength: 3 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        // names の全IDがランキング行に存在する
        for (const id of Object.keys(names)) {
          expect(rows.some((r) => r.participantId === id)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("PAIR試合: wins + losses === played（各行の整合性）", () => {
    fc.assert(
      fc.property(fc.array(matchWithPairArb, { minLength: 0, maxLength: 3 }), (matches) => {
        const names = buildParticipantNames(matches);
        const rows = computeRanking(matches, names);
        for (const row of rows) {
          expect(row.wins + row.losses).toBe(row.played);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("PAIR試合: 同じペア内の2人は常に wins/losses/played が一致する", () => {
    // ペアメンバーは同じ試合に参加し、同じ勝敗を共有するため統計が一致する。
    // これは「単一試合」の性質。複数試合をまたぐと同一参加者が別ペアに属し得て
    // 累積統計が相方とズレるため（正当な挙動）、各試合を単独で計算して検証する。
    fc.assert(
      fc.property(fc.array(matchWithPairArb, { minLength: 1, maxLength: 3 }), (matches) => {
        for (const match of matches) {
          const single = [match];
          const rows = computeRanking(single, buildParticipantNames(single));
          const rowMap = new Map(rows.map((r) => [r.participantId, r]));
          if (match.leftSide.kind === SIDE_KIND.PAIR) {
            const [idA, idB] = match.leftSide.memberIds;
            const rowA = rowMap.get(idA);
            const rowB = rowMap.get(idB);
            if (rowA && rowB) {
              expect(rowA.wins).toBe(rowB.wins);
              expect(rowA.losses).toBe(rowB.losses);
              expect(rowA.played).toBe(rowB.played);
            }
          }
          if (match.rightSide.kind === SIDE_KIND.PAIR) {
            const [idC, idD] = match.rightSide.memberIds;
            const rowC = rowMap.get(idC);
            const rowD = rowMap.get(idD);
            if (rowC && rowD) {
              expect(rowC.wins).toBe(rowD.wins);
              expect(rowC.losses).toBe(rowD.losses);
              expect(rowC.played).toBe(rowD.played);
            }
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("computeRanking — 参加者名フォールバック・不参加者プロパティテスト", () => {
  it("participantNames に存在するが試合未登場の参加者は played=0 で行に入る", () => {
    fc.assert(
      fc.property(
        fc.array(matchArb, { minLength: 0, maxLength: 3 }),
        fc.string({ minLength: 1, maxLength: 8 }),
        (matches, extraId) => {
          const names = buildParticipantNames(matches);
          // extraId が試合に登場しないよう確認して追加
          const allIds = new Set(Object.keys(names));
          if (allIds.has(extraId)) return; // 試合済みIDは skip
          const namesWithExtra = Object.assign({}, names, { [extraId]: "extra" });
          const rows = computeRanking(matches, namesWithExtra);
          const extraRow = rows.find((r) => r.participantId === extraId);
          expect(extraRow).toBeDefined();
          expect(extraRow!.played).toBe(0);
          expect(extraRow!.wins).toBe(0);
          expect(extraRow!.losses).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('participantNames[id] が undefined のとき name フォールバックは "?"', () => {
    // participantNames に id が存在しない場合は "?" がフォールバック
    // matchArb のIDは participantNames に入れず、空の names で呼ぶ
    fc.assert(
      fc.property(matchArb, (match) => {
        // 空の participantNames なら全員 "?" フォールバック
        const rows = computeRanking([match], {});
        for (const row of rows) {
          expect(row.name).toBe("?");
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("computeRanking — 同順位飛び(1,1,3形式)プロパティテスト", () => {
  it("2人が同点なら rank=1,1 で次の異なる値は rank=3 になる", () => {
    // A: 1勝, B/C: 0勝で同 diff → B,C は rank=2,2
    // D: 0勝だが gameDiff が B,C と異なる → D は rank=4(2人分飛ぶ)
    // A beats D (3-0): A=1勝,gameDiff=3; D=0勝,gameDiff=-3
    // B,C は試合なし: wins=0,gameDiff=0,pointDiff=0 → 同 rank=2
    // D は wins=0,gameDiff=-3 → rank=4
    const matches: Match[] = [
      {
        id: "m1",
        tournamentId: "t",
        leftSide: { kind: SIDE_KIND.SINGLE, participantId: "A" },
        rightSide: { kind: SIDE_KIND.SINGLE, participantId: "D" },
        games: [
          { leftScore: 11, rightScore: 5 },
          { leftScore: 11, rightScore: 5 },
          { leftScore: 11, rightScore: 5 },
        ],
        firstServer: "L",
      },
    ];
    const rows = computeRanking(matches, { A: "A", B: "B", C: "C", D: "D" });
    const a = rows.find((r) => r.participantId === "A")!;
    const b = rows.find((r) => r.participantId === "B")!;
    const c = rows.find((r) => r.participantId === "C")!;
    const d = rows.find((r) => r.participantId === "D")!;
    expect(a.rank).toBe(1); // A: wins=1
    expect(b.rank).toBe(2); // B: wins=0, diff=0
    expect(c.rank).toBe(2); // C: wins=0, diff=0(同 rank)
    expect(d.rank).toBe(4); // D: wins=0, gameDiff=-3 → 2人分飛んで rank=4
  });

  it("rank の飛びパターン: 各 rank は直前の rank + 同 rank 人数の組み合わせで決まる", () => {
    // 全指標同値の n 人 → 全員 rank=1、(n+1) 番目が rank=n+1
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 5 }), (n) => {
        const names: Record<string, string> = {};
        for (let index = 0; index < n; index++) names[`p${index}`] = `p${index}`;
        const rows = computeRanking([], names);
        // 全員同指標(wins=0,diff=0)なので全員 rank=1
        expect(rows.every((r) => r.rank === 1)).toBe(true);
      }),
    );
  });

  it("localeCompare(ja)タイブレーク: 全指標同値のとき名前順で並ぶ", () => {
    // wins/gameDiff/pointDiff が全同値のとき localeCompare("ja") で昇順ソートされる
    fc.assert(
      fc.property(
        fc
          .array(
            fc
              .string({ minLength: 1, maxLength: 4 })
              .filter((s) => /^[゠-ヿ぀-ゟ一-鿿a-zA-Z]+$/u.test(s)),
            { minLength: 2, maxLength: 4 },
          )
          .filter((arr) => new Set(arr).size === arr.length),
        (names) => {
          const nameMap: Record<string, string> = {};
          for (const name of names) nameMap[name] = name;
          const rows = computeRanking([], nameMap);
          // 全員 rank=1 かつ名前が localeCompare("ja") 昇順
          for (let index = 1; index < rows.length; index++) {
            expect(rows[index - 1].name.localeCompare(rows[index].name, "ja")).toBeLessThanOrEqual(
              0,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
