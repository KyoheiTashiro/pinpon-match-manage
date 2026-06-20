import { SIDE, type Side } from "@/domain/match";
import { gameProgress } from "@/domain/scoreProgress";
import { sideArb } from "@/test/arbitraries";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("gameProgress プロパティテスト", () => {
  it("出力の長さは pointLog の長さと一致する", () => {
    // ログの各点に対して ProgressPoint が 1 つ生成される
    fc.assert(
      fc.property(
        fc.array(sideArb, { minLength: 0, maxLength: 30 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          expect(progress.length).toBe(log.length);
        },
      ),
    );
  });

  it("各 ProgressPoint の left + right === point.index（1始まりの累計得点）", () => {
    // index は 1 始まりであり left+right はその時点の累計得点に等しい
    fc.assert(
      fc.property(
        fc.array(sideArb, { minLength: 1, maxLength: 30 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          for (const point of progress) {
            expect(point.left + point.right).toBe(point.index);
          }
        },
      ),
    );
  });

  it("server は常に 'L' または 'R'", () => {
    // サーバーは必ずどちらかのサイドが担当する
    fc.assert(
      fc.property(
        fc.array(sideArb, { minLength: 1, maxLength: 30 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          for (const point of progress) {
            expect([SIDE.LEFT, SIDE.RIGHT] as Side[]).toContain(point.server);
          }
        },
      ),
    );
  });

  it("各 ProgressPoint の scorer は pointLog[i] と一致する", () => {
    // gameProgress の i 番目 ProgressPoint.scorer は pointLog[i] そのものである
    fc.assert(
      fc.property(
        fc.array(sideArb, { minLength: 1, maxLength: 30 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          for (let i = 0; i < log.length; i++) {
            expect(progress[i].scorer).toBe(log[i]);
          }
        },
      ),
    );
  });

  it("left/right の累計は scorer に応じてそれぞれ +1 される整合性", () => {
    // 各ステップで left か right のどちらかが前ステップより 1 増え、反対側は変わらない
    fc.assert(
      fc.property(
        fc.array(sideArb, { minLength: 2, maxLength: 30 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          for (let i = 1; i < progress.length; i++) {
            const prev = progress[i - 1];
            const curr = progress[i];
            if (curr.scorer === SIDE.LEFT) {
              expect(curr.left).toBe(prev.left + 1);
              expect(curr.right).toBe(prev.right);
            } else {
              expect(curr.right).toBe(prev.right + 1);
              expect(curr.left).toBe(prev.left);
            }
          }
        },
      ),
    );
  });

  it("デュース域(左右合計>=20)では 1 点ごとにサーバーが切り替わる", () => {
    // 合計20点以降は1点得点するたびにサーバーが交代する
    fc.assert(
      fc.property(
        // 合計20点以降のポイントを少なくとも2点含むログを生成
        fc.array(sideArb, { minLength: 22, maxLength: 40 }),
        sideArb,
        (log, firstServer) => {
          const progress = gameProgress(log, firstServer);
          // 合計21点以降のステップ: 隣接する2点のサーバーが必ず異なる
          for (let i = 0; i < progress.length; i++) {
            const curr = progress[i];
            if (curr.index > 20 && i > 0) {
              const prev = progress[i - 1];
              // デュース域では毎点交代
              expect(curr.server).toBe(prev.server === SIDE.LEFT ? SIDE.RIGHT : SIDE.LEFT);
            }
          }
        },
      ),
    );
  });
});
