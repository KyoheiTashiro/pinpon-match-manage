親: [README.md](../README.md) / 関連: [ranking.md](./ranking.md)

# 点数進行グラフ（結果画面）

実装: `src/features/tournament/result/components/MatchScoreChart.tsx`（1対戦ブロック）、
`src/features/tournament/result/components/ScoreProgressChart.tsx`（グラフ本体）、
`src/domain/scoreProgress.ts`（導出ロジック）

試合の「結果」タブのグラフモードで、ゲームごとの点数進行を表示する。
1ラリーごとに両者の累計スコアを丸で並べ、得点した側を線で結んでジグザグを描く。
卓球の「流れ（連取・逆転）」を一目で振り返れるようにする。

---

## 1. 前提: PointLog

グラフを描くには **ラリー1本ごとに「どちらが得点したか」の時系列**（`pointLog`）が必要。

```ts
// src/domain/match.ts
export type Game = {
  leftScore: number;
  rightScore: number;
  pointLog?: Side[]; // 得点順。例: ['R','R','L','R', ...]
};
```

- `pointLog` は **optional**。スコアボードを使わず手入力した試合には付かない。
- `pointLog` が `undefined` またはゲーム単位で `pointLog.length === 0` のゲームは **グラフを描画しない**（進行順が不明なため）。
- グラフ表示可否はゲーム単位で判定: `game.pointLog && game.pointLog.length > 0`。

---

## 2. グラフ導出ロジック

`src/domain/scoreProgress.ts`:

```ts
export type ProgressPoint = {
  index: number;  // ラリー番号（1始まり）
  scorer: Side;   // このラリーの得点者
  left: number;   // ラリー後の左側累計スコア
  right: number;  // ラリー後の右側累計スコア
  server: Side;   // このラリー時点のサーバー
};

export const gameProgress = (pointLog: Side[], firstServerOfGame: Side): ProgressPoint[];
```

- `pointLog` の各要素を prefix 集計して `left`/`right` を算出する。
- サーバーは `currentServer({ leftScore: left_before, rightScore: right_before }, firstServerOfGame)` で算出（2本交代・デュース後1本交代ルール）。
- ゲームの先サーバーは `gameFirstServer(match.firstServer, gameIndex)` で算出（偶数ゲームは match 先サーバー、奇数ゲームは逆）。

---

## 3. 配置とデータフロー

**配置先**: 結果タブ（`/#/tournaments/:id/result`）の**グラフモード**。

- `src/features/tournament/result/index.tsx`（`ResultView`）が `useResultRows` から `matchResults` を取得し、`game.pointLog && game.pointLog.length > 0` を持つゲームが1件以上ある試合のみ `graphMatches` としてフィルタリングする。
- セレクトメニューで1対戦を選択し、`GraphView` が選択中の対戦を `MatchScoreChart` で表示する。
- `MatchScoreChart` は `ScoreProgressChart` を `games`, `leftName`, `rightName`, `matchFirstServer` を渡して呼び出す。
- `pointLog` を持つゲームが1本もない試合はグラフモードの選択肢に現れない。

---

## 4. UI仕様（ScoreProgressChart）

### 4.1 全体レイアウト

ゲームごとに1ブロックを縦積みする。各ブロック構成:

```
ゲーム 1
 左選手名  ⓪ ⓪ ① ①  ...  最終スコア
 右選手名  ① ② ② ③  ...  最終スコア
ゲーム 2
 ...
```

- 見出し「ゲーム {N}」（左揃え・太字）。
- 各ブロックは **上下2段**（上段=左選手 / 下段=右選手）。`swapped` の概念はなく、常に `leftName`=上段・`rightName`=下段の固定表示。
- **横軸 = ラリー番号**（1本ごとに1列）。列数 = `pointLog.length`。
- `pointLog` のないゲームはブロックを描画しない（`ScoreProgressChart` が内部でフィルタリング）。

### 4.2 スコアノード（丸）

- 各ラリー列に上下2つの丸を配置。丸の中の数字 = その時点の累計スコア。
- **得点した側の丸**: 青塗り（`bg-blue-500`）/ 白文字（`active` バリアント）。
- **得点しなかった側の丸**: 灰塗り（`bg-neutral-200`）/ 濃灰文字（`text-neutral-700`）（`inactive` バリアント）。
- **最終スコア列（右端）**: 黄背景（`bg-amber-300`）。勝者側は `text-green-800`（`finalWinner`）、敗者側は `text-neutral-700`（`finalLoser`）。

定数:

- 丸の直径: 36px（`CIRCLE_SIZE`）
- 列幅: 44px（`COL_WIDTH`）
- 行高: 56px（`ROW_HEIGHT`）

### 4.3 折れ線

- 連続するラリーの**得点者ノード（青丸）**どうしをSVGの `<line>` で結ぶ。
- 線色: 青（`stroke: #3b82f6`）、線幅: 3px、`strokeLinecap: round`。
- 連取中は同じ段に水平、得点者交代で反対の段へ斜めに移動する。

### 4.4 サーブ表示

- 各ラリー列で**サーブ権を持つ側のノード下**にオレンジの短い下線（`bg-orange-500`、幅20px・高さ4px）を表示する。
- データソース: `ProgressPoint.server`。

### 4.5 選手名

- 各ブロックの左端にプレイヤー名を縦2行で表示（右揃え）。
- スタイル: `text-sm font-bold text-ink`、`whitespace-nowrap`。

### 4.6 描画方式・スクロール

- SVGと絶対配置のdiv要素を組み合わせて描画する。
- チャート本体は全幅描画（横スクロールなし）で画像保存に対応する。
- 列が多い場合（デュース継続など）は親コンテナの `overflow-x-auto` でスクロール可能にする（`ResultView` の `overflow-x-auto` div 内にある）。

---

## 5. 画像保存

- 保存ボタンは `SaveImageButtons`（モード別にボタン構成を切替）が担当する。
- 「表示中の対戦」ボタン: 選択中の対戦グラフを1枚の画像として保存する。ファイル名に `${leftName} vs ${rightName}` を付加する。
- 「全ての対戦」ボタン: `AllMatchesCapture` が画面外（`position: absolute; left: -99999px`）に全対戦を縦積みで off-screen レンダリングし、それを画像化する。各対戦の間には区切り線（`border-t-2 border-line`）が入る。
- `useImageCapture` フックを使用し、`saving` 中は両ボタンとも `disabled`。

---

## 6. 配色

白背景（結果タブ）前提:

| 要素           | スタイル                                                            |
| -------------- | ------------------------------------------------------------------- |
| 得点ノード     | `bg-blue-500` / 白文字                                              |
| 非得点ノード   | `bg-neutral-200` / `text-neutral-700`                               |
| 折れ線         | `stroke: #3b82f6`（blue-500相当）、3px                              |
| サーブ下線     | `bg-orange-500`                                                     |
| 最終スコア背景 | `bg-amber-300`（勝者: `text-green-800` / 敗者: `text-neutral-700`） |
| 選手名・見出し | `text-ink`（黒系）                                                  |
