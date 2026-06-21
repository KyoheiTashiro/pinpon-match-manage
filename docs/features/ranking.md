親: [README.md](../README.md) / 関連: [result-graph.md](./result-graph.md)

ルート: 結果タブ (`/#/tournaments/:id/result`・HashRouter) — 大会参加者の勝敗集計・順位・対戦結果を表示する画面。

実装: `src/features/tournament/result/`（`index.tsx`, `hooks.ts`, `components/{RankingTable, MatchResultsTable, MatchScoreChart, PersonalMatchResults}.tsx`）

## 画面構成（表示モード切替）

「結果」見出しの直下・画面上部に **サブタブ3つ** を置き、表示モードを切り替える。

| サブタブ                       | 内容                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| **全体**（デフォルト）         | 順位表（`RankingTable`）+ 対戦結果テーブル（`MatchResultsTable`） |
| **個人**（ダブルスは**ペア**） | 選択した参加者の対戦結果一覧（`PersonalMatchResults`）            |
| **グラフ**                     | 点数進行グラフ（[result-graph.md](./result-graph.md)）            |

- サブタブUIは共通 `Tabs` コンポーネント（`ariaLabel="表示モード"`）。切替はタブ内ローカル状態（`mode` ステート・URL・LocalStorage には保持しない）。
- **個人モード・グラフモード**では、画面上部に参加者選択ドロップダウン（`Select` `label="参加者を選択"`）を表示し、選択した参加者のデータを表示する。
- **グラフモード**では、選択した参加者に関わる対戦のうち `pointLog` を持つゲームが1本以上あるものを表示する。`pointLog` を持つ対戦が1件もない場合は「対戦結果がありません。」と表示する。
- サブタブUI・参加者選択ドロップダウンは画像保存の対象外。大会名・日付ヘッダは全モードとも画像に含まれる。

## 画像保存

`useImageCapture` を使用。全モード共通でメインコンテンツ（`ref`が付いたdiv）を画像化する。

- 「画像で保存」ボタン1つ（`DownloadIcon` 付き）。クリックで表示中のコンテンツ全体を画像保存する。
- 保存中は `disabled`、ラベルが「保存中…」に変わる。

## 全体モード

`ResultView`（`index.tsx`）が全体モード時に `RankingTable` と `MatchResultsTable` を縦に並べてレンダリングする。

### 順位表

見出し「順位」の下に表を配置。列構成:

| 列見出し | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 順位     | 同順位は同じ番号（飛び番方式: 1,2,2,4）               |
| 名前     | 参加者名                                              |
| 試合     | 完了試合数（`played`）                                |
| 勝       | 勝ち数（緑太字）                                      |
| 敗       | 負け数（赤太字）                                      |
| G差      | ゲーム得失差（`±N`）と内訳（勝ゲーム/負ゲーム）を表示 |
| 点差     | 点得失差（`±N`）と内訳（取点/失点）を表示             |

### 対戦結果テーブル

見出し「対戦結果」。試合結果が0件の場合は「データがありません」を表示する。

- 列: 「対戦」（`左選手名 vs 右選手名`）、`G1`〜`G{bestOf}` の各ゲームスコア、「セット」（ゲームセット数 `N-N`）。
- 対戦列: 勝者名は通常色（`text-ink`）、敗者名は薄字（`text-sub`）。勝者名の左にトロフィーアイコンを表示。未確定の場合は両者とも薄字。
- 各ゲームのセルに `leftScore-rightScore`（左スコア-右スコア）を表示。該当ゲームが未実施（`match.games[gameIndex]` が存在しない）なら `-`。

## 個人モード（ダブルスはペアモード）

`PersonalMatchResults` が選択した参加者の対戦結果を縦に並べる。

- 参加者選択ドロップダウンで選択した参加者（`resolvedParticipantId`）を「自分」として、その参加者が出場した全対戦を表示する。
- 各対戦カードは3カラム構成（自分 / ゲームスコア / 相手）:
  - 自分カラム: 勝者にトロフィーアイコン。ゲーム取得数を大型表示（`text-[3rem]`）。勝ちは `text-success`、それ以外は `text-sub`。
  - 中央カラム: ゲームごとの点数を縦に並べる（自分側スコア / 相手側スコア）。勝った側のスコアは `text-success`。
  - 相手カラム: 同上（相手視点）。
- 対戦がない場合は「データがありません」を表示する。
- 見出しは「{参加者名}さんの対戦結果」。

---

## 順位算出ロジック

実装: `src/domain/ranking.ts` の `computeRanking`。

### 集計対象

`matchSummary` で `finished === true` となった試合のみ集計する（未確定の試合は除外）。

### 集計内容

各参加者ごとに以下を集計:

```
played        完了した試合数
wins          勝ち数
losses        負け数
gamesWon      勝ったゲーム数（ゲーム取得数）
gamesLost     負けたゲーム数（ゲーム失取数）
gameDiff      gamesWon - gamesLost
pointsFor     取得合計点数
pointsAgainst 失点合計点数
pointDiff     pointsFor - pointsAgainst
```

ダブルスの場合はペアのメンバー2人それぞれに同一の勝敗・ゲーム・得失点を加算する。

参加者として登録されている全員がランキング行に出る（試合未実施でも 0 として表示）。

### ソート順

1. 勝数が多い順（降順）
2. ゲーム得失差が大きい順（降順）
3. 点得失差が大きい順（降順）
4. 名前の日本語ロケール順（`localeCompare` `"ja"`）

### 同順位（飛び番）

勝数・ゲーム得失差・点得失差がすべて同値の参加者には同じ順位を付ける。次の異なる行では順位が飛ぶ（例: 1,2,2,4）。

## データフロー

`src/features/tournament/result/hooks.ts` の `useResult` が Zustand ストアからデータを取得し、`computeRanking` と `buildMatchResult` でビューモデルを構築する。

- **`rows`**: `RankingRow[]`。順位表の各行。
- **`matchResults`**: `MatchResultRow[]`。`realGames(match.games).length > 0`（実プレイ分のゲームがある）試合のみ含む。
- **`tournament`**: 現在の大会オブジェクト（`Tournament`型）。

`MatchResultRow` の主要フィールド:

```ts
id: string;
leftName: string;
rightName: string;
leftMembers: string[];   // 左サイドの参加者ID一覧（個人モード・グラフモードの絞り込みに使用）
rightMembers: string[];  // 右サイドの参加者ID一覧
games: Game[];           // realGames() 適用済み
leftWins: number;
rightWins: number;
winner: Side | null;     // SIDE.LEFT / SIDE.RIGHT / null
firstServer: Side;       // グラフのサーブ算出に使用
```
