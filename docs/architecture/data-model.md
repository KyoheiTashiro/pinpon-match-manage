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

type Game = {
  leftScore: number; // 0 を未入力センチネルとして扱う（永続化時は trim）
  rightScore: number;
  pointLog?: Side[]; // 1ラリーごとの得点側記録（点数進行グラフ用）
  // optional: スコアボードを使わず手入力した試合には無い。undefined = グラフ描画不可
};

type MatchSide =
  { kind: "single"; participantId: string } | { kind: "pair"; memberIds: [string, string] };

type Match = {
  id: string;
  tournamentId: string;
  leftSide: MatchSide;
  rightSide: MatchSide;
  games: Game[]; // 永続化は実プレイ分のみ・最大 bestOf ゲーム
  note?: string;
  firstServer: Side; // 試合初手サーブ
};

type FontSize = "normal" | "large" | "xlarge";

type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
  fontSize: FontSize;
};
```

- `Tournament` は試合IDの配列を持たない。所属試合は `Match.tournamentId`（FK）から導出する（`src/store/selectors.ts` の `matchesOf(matches, tournamentId)`）。挿入順 = `matches` レコードのキー順
- 試合進行状態は `matchSummary(games, winsNeeded)` から派生（永続化しない）
- ダブルスのペアはエンティティ化せず `memberIds[2]` のみ。同ペアの再結成は識別不可
- `pointLog` は `Side[]`。例: `['R','R','L','R',...]` — 1本目R得点、2本目R、3本目L。点数進行グラフの真実源（[result-graph.md](../features/result-graph.md) 参照）

### 永続化

データは zustand persist で LocalStorage へ保存。

- ストアキー: `pinpon-match-manage:v1` ／ スキーマ `version`: `2`
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

実装: `src/domain/match.ts` の `winsNeededForBestOf(bestOf)` と `matchSummary(games, winsNeeded)`。

### 順位算出

詳細は [features/ranking-overall.md](../features/ranking-overall.md) 参照。
