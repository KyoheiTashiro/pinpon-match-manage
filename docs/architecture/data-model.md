# データモデル・ロジック仕様

親: [README.md](../README.md)

## データモデル

```ts
type Side = "L" | "R";

/** 1試合のゲーム数。先取ゲーム数 = floor(bestOf / 2) + 1。 */
type BestOf = 3 | 5 | 7;

type Tournament = {
  id: string; // uuid
  name: string;
  format: "singles" | "doubles";
  bestOf: BestOf; // 1試合のゲーム数（3 / 5 / 7）
  date: string; // 開催日 YYYY-MM-DD
  createdAt: string; // ISO
  participantIds: string[]; // 表示順を保持（順序付きの正規化例外）
};

type Participant = {
  id: string;
  tournamentId: string; // 専属大会
  name: string;
  affiliation?: string;
};

// スコアの出どころは1つだけ持つ（スコアと得点履歴の食い違いを表現不能にする）
type Game =
  | { kind: "logged"; pointLog: Side[] } // スコアボード入力。スコアは pointLog から導出
  | { kind: "manual"; leftScore: number; rightScore: number }; // 得点履歴なし。グラフ描画不可

type MatchBase = {
  id: string;
  tournamentId: string;
  games: Game[]; // 永続化は実プレイ分のみ・最大 bestOf ゲーム
  note?: string;
  firstServer: Side; // 試合初手サーブ
};

// kind が左右両方の形を決める（片側だけペアの試合を表現不能にする）。大会の format と一致させる
type Match =
  | (MatchBase & { kind: "singles"; left: string; right: string })
  | (MatchBase & { kind: "doubles"; left: [string, string]; right: [string, string] });

type FontSize = "normal" | "large" | "xlarge";

type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  fontSize: FontSize;
  defaultBestOf: BestOf; // 新規大会フォームのゲーム数初期値
  keepScreenOn: boolean; // Screen Wake Lock で画面常時オン（初期値 true）
};
```

- `Tournament` は試合IDの配列を持たない。所属試合は `Match.tournamentId`（FK）から導出する（`src/store/selectors.ts` の `matchesOf(matches, tournamentId)`）。挿入順 = `matches` レコードのキー順
- 試合進行状態は `games` と `winsNeeded` から派生（永続化しない）。→「試合の進行状態」節
- `Match.kind` は大会の `format` と一致し、対戦者は全員その大会の `participantIds` に含まれる。作成時は `addManualMatch` が、読込時は `sanitizeAppState` が検証し、満たさない試合は作らない／落とす
- ダブルスのペアはエンティティ化せず `[string, string]` のみ。同ペアの再結成は識別不可
- ゲームのスコアは `gameScore(game)` で読む。`logged` は `pointLog` の集計、`manual` は保持値をそのまま返す
- 新規ゲームは常に `logged` で作られる。`manual` は v5 以前のデータで得点履歴が無かったゲームの移行先
- `pointLog` は `Side[]`。例: `['R','R','L','R',...]` — 1本目R得点、2本目R、3本目L。点数進行グラフの真実源（[result-graph.md](../features/result-graph.md) 参照）

### 永続化

データは zustand persist で LocalStorage へ保存。

- ストアキー: `pinpon-match-manage:v1` ／ スキーマ `version`: `6`
- 読込時に `migrate`（バージョン変換）→ `merge`（検証・サニタイズ・サルベージ）を通す

ストア構成・スライス・アクション・migrate / merge / sanitize の詳細 → **[store.md](store.md)**。

---

## ロジック仕様

### ゲーム勝敗

```
isGameFinished(g): max(l, r) >= 11 && abs(l - r) >= 2
gameWinner(g):     l > r ? 'L' : 'R'
```

### 試合勝敗

先取ゲーム数は `bestOf` から可変（3/5/7 ゲームマッチ対応）。

```
winsNeeded = floor(bestOf / 2) + 1   // bestOf=3 → 2, 5 → 3, 7 → 4
leftWins  = count(games, gameWinner === 'L')
rightWins = count(games, gameWinner === 'R')
finished  = leftWins >= winsNeeded || rightWins >= winsNeeded
winner    = leftWins >= winsNeeded ? 'L' : rightWins >= winsNeeded ? 'R' : null
```

実装: `src/domain/match.ts` の `winsNeededForBestOf(bestOf)` と `matchSummary(games, winsNeeded)`。勝敗が確定したゲームより後ろのゲームは集計しない。

### 試合の進行状態

`games` と `winsNeeded` から導出する。画面ごとに判定式を持たず、この2関数を共有する（`src/domain/match.ts`）。

```
matchPhase(games, winsNeeded):
  勝者あり → { kind: 'decided', gameIndex: 決着ゲーム, winner }
  勝者なし → { kind: 'playing', gameIndex: 最初の未終了ゲーム }   // 全ゲーム終了なら games.length

matchStatus(games, winsNeeded):
  得点が1点も無い → 'unplayed'
  勝者あり        → 'finished'
  それ以外        → 'inProgress'
```

対戦表の「対戦／途中／終了」、順位集計の対象（`finished` のみ）、結果タブの表示対象（`unplayed` 以外）はいずれも `matchStatus` で決まる。

### 得点入力の可否

ゲームは前から順に進める。訂正できるのは最新のゲームだけである（`src/domain/matchGames.ts`）。

```
canAddPoint(games, winsNeeded, gameIndex):
  phase.kind === 'playing' && gameIndex === phase.gameIndex && そのゲームが未終了
canRemovePoint(games, gameIndex):
  gameIndex === 最後に得点が入ったゲーム
```

- 加点できるのは進行中のゲームだけ。前のゲームが終わっていない先のゲーム、終了済みのゲーム、勝敗確定後のゲームには加点できない
- 取り消しは勝敗確定後も、決着ゲームに対してなら可能。取り消すと試合は `playing` に戻る
- `addPoint` / `removePoint` は可否を満たさない入力に対して元の配列をそのまま返す。この不変条件により、有効な操作だけで作った `games` には「勝敗確定後の得点」や「途中に空のゲーム」が現れない

### 順位算出

詳細は [features/ranking-overall.md](../features/ranking-overall.md) 参照。
