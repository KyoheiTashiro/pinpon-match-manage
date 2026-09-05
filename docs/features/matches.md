親: [README.md](../README.md)

ルート: 対戦表タブ (`/#/tournaments/:id/matches`・HashRouter) + 試合詳細モーダル + スコアボード（ポータル） — 総当たり組合せの表示・試合詳細入力・スコアボードを統合する画面群。

実装: 対戦表本体は `src/features/tournament/matches/`（`index.tsx` が形式に応じ `singles/SinglesList.tsx` の `SinglesList` / `doubles/DoublesList.tsx` の `DoublesList` を出し分け）。試合詳細モーダル・サーブ選択は `matches/components/`（`MatchModal.tsx` / `FirstServerSelect.tsx`）。カード枠と大会名・日付ヘッダは `matches/components/MatchesCard.tsx`（シングルス/マトリクス/ダブルス共有）。スコアボードは `src/features/tournament/scoreboard/`。

## 対戦表示

### シングルス (`SinglesList` — `matches/singles/SinglesList.tsx`。行の表示データ導出は `singles/hooks.ts` の `buildSinglesRows`)

- 参加者が2人未満の場合は「参加者を2人以上 登録してください。」を表示（リスト／マトリクスに共通。判定・文言は `matches/index.tsx` の `MatchesView` の1箇所。最小人数は `matches/constants.ts` の `MIN_PLAYERS`）
- 2人以上の場合は全ペアをリスト形式（`<ul>`）で表示する。大会名・日付を上部に表示
- 各行の構成（`i < j` の全組合せ順）。状態→バッジ・背景の対応は `matches/matchState.ts` の `STATE_BADGE` に集約（マトリクス表示と共通）:
  - 未対戦: Badge「対戦」（`tone="primary"` `appearance="solid"`）を右端に表示。タップで試合を新規作成しモーダルを開く
  - 対戦済（進行中）: ゲーム取得数（例 `1-0`）+ Badge「途中」（`tone="warning"`）。行背景 `bg-warning/10`
  - 対戦済（終了）: ゲーム取得数 + Badge「終了」（`tone="neutral"`）。行背景 `bg-winBg`。勝者名の左に金色トロフィーアイコンを表示
  - 終了時は勝者を上・敗者を下に並べ替えて表示する
- 行右端に `ChevronDownIcon`（`-rotate-90`）を配置

### ダブルス (`DoublesList` — `matches/doubles/DoublesList.tsx`)

- 見出し: 「対戦表（ダブルス）」（`matches/index.tsx` の `MatchesView` が出す）
- 参加者が4人未満の場合は「参加者を4人以上 登録してください。」を表示（見出しのみ残り、試合追加フォーム・試合一覧カードは表示しない）
- 4人以上の場合は試合追加フォーム（`matches/doubles/PairSelectForm.tsx`。zod スキーマは `matches/doubles/schema.ts`）を上部に表示
- 試合一覧はリスト形式（`<ul>`）で表示。各行は上下2段（上段=ペア1 / 下段=ペア2）で、段ごとに左にペア名・右にゲーム取得数を置く。状態→バッジ・背景の対応はシングルスと同じ `matches/matchState.ts` の `STATE_BADGE`:
  - ゲーム未入力: Badge「対戦」（`tone="primary"`）。ゲーム取得数は表示しない
  - 対戦済（進行中）: ゲーム取得数 + Badge「途中」（`tone="warning"`）。行背景 `bg-warning/10`
  - 対戦済（終了）: ゲーム取得数 + Badge「終了」（`tone="neutral"`）。行背景 `bg-winBg`。勝者を上段へ並べ替え、勝者ペア名の左に金色トロフィーアイコンを表示
- ペア名は参加者名ごとに `whitespace-nowrap` で包み、狭い画面では1人1行に積む。`sm` 以上では「A / B」の横1行に戻す
- 行右端に `ChevronDownIcon`（`-rotate-90`）を配置
- 試合がない場合は「まだ試合がありません。」を表示
- 対戦表タブに画像保存はない（画像保存は結果タブのみ）

## 組合せ生成

- シングルス: 対戦一覧の行をタップすると試合を作成。同一組合せが既に存在する場合は既存の試合モーダルを開く（重複追加なし）
- ダブルス: `DoublesList` 内の試合追加フォームから手動追加。事前のペア固定なし
  - フォームラベル: 「試合を追加」（見出し）、「ペア1」「ペア2」（ペア区分ラベル）。`sm` 以上では2つのペア区分を横2列に並べる
  - 各 `Select` に表示ラベルはなく、アクセシブル名（`ariaLabel`）で「ペア1 選手1」「ペア1 選手2」「ペア2 選手1」「ペア2 選手2」を与える
  - ドロップダウンのプレースホルダー: 「選んでください」。すでに選択済みの参加者は他フィールドの選択肢から除外される
  - 4人全員が異なる参加者でなければならない（`doublesPairSchema` のバリデーション: 「4人とも異なる選手を選んでください」）
  - 送信ボタンラベル: 「試合を追加」。バリデーションが通っていない間は disabled
  - 追加成功時はフォームをリセットし、作成した試合のモーダルをすぐに開く

## 試合詳細モーダル (`MatchModal`)

`createPortal` で `document.body` 直下に描画するダイアログ。

### ヘッダー

- 見出し: 「試合の入力」
- 右上に `×` ボタン（白地・`border-line`・`text-2xl`）。タップでモーダルを閉じる
- モーダル外領域タップ・`Escape` キーでも閉じる

### 対戦者表示

- 「左名前 対 右名前」を `text-2xl font-extrabold` で中央揃え表示
- ダブルスの場合はペアの名前を「/」区切りで表示

### 最初のサーブ選択

- `<fieldset>` 見出し: 「最初のサーブ」
- 左右それぞれのラジオボタンをカード型で表示。選択中は `border-orange-500 bg-orange-50`、非選択は `border-line bg-white`
- 選択は即時 `updateMatch` で永続化される

### スコアボードへの誘導

- 「スコアボードを開く」ボタン（`variant="primary" w-full`）でスコアボード画面を起動

### ゲームスコア一覧

- ゲーム1〜N（`bestOf` の本数分）をリスト表示
- 各行: 「ゲーム{N}」ラベル + 点数
  - ロック済かつ未入力: 「入力不可」（`text-sub text-base font-bold`）
  - 未入力（ロックなし）: 「未入力」（`text-sub text-base font-bold`）
  - 入力済（進行中）: `leftScore - rightScore (進行中)`（`(進行中)` は `text-sm text-sub`）
  - 入力済（ゲーム終了）: `leftScore - rightScore`（勝者側を `text-success` で強調）
- ロック済行は `bg-bg opacity-60`

### フッターボタン

- 「試合結果を削除」ボタン（`variant="danger"`）。タップで確認ダイアログを表示
  - 確認ダイアログ: タイトル「試合結果を削除」、本文「この試合結果を削除します。取り消せません。」、確認ラベル「削除する」、キャンセルラベル「やめる」
  - 削除後はモーダルを閉じる

> **ワイヤー:**
>
> ```
> ┌──────────────────────────────────┐
> │ 試合の入力              [×]      │ ← 右上 × ボタン
> │                                  │
> │ ┌─────────────────────────────┐  │
> │ │ 最初のサーブ                 │  │
> │ │ [○ 田中] [  佐藤]           │  │ ← 選択中オレンジ
> │ └─────────────────────────────┘  │
> │                                  │
> │   田中          対          佐藤  │ ← 2xl
> │                                  │
> │ [  ▶ スコアボードを開く        ] │ ← primary ボタン
> │                                  │
> │ ゲーム1   11 - 5                 │ ← 勝者側 text-success
> │ ゲーム2   8 - 11                 │
> │ ゲーム3   未入力                 │
> │ ゲーム4   入力不可               │ ← ロック済
> │ ゲーム5   入力不可               │
> │                                  │
> │                [ 試合結果を削除] │ ← danger
> └──────────────────────────────────┘
> ```

## スコアボード (`ScoreboardScreen`)

実装: `src/features/tournament/scoreboard/`（`index.tsx` が `components/ScoreboardScreen.tsx` を re-export。`ScoreboardHeader` / `ScoreInputView` / `ScoreColumn` も `scoreboard/components/`）。結果画面は共有コンポーネント `MatchResultBoard`（`src/components/domain/`）を再利用する。

試合進行中に選手・観客から視認しやすい大型スコア表示専用画面。`createPortal` で `document.body` 直下に描画するフルスクリーンモーダル（独立ルートなし、`z-[60]`）。

- 起動: 試合詳細モーダル内の「スコアボードを開く」ボタン
- 戻る: ヘッダー左の「戻る」ボタン（`←` アイコン付き）で試合詳細モーダルへ復帰
- 配色: **入力画面は青背景 `bg-blue-800`・白文字。結果画面は白背景 `bg-white`・`text-ink`（個人結果カードと同スタイル）**
- セーフエリア: `env(safe-area-inset-*)` で四辺をパディング

### ヘッダー (`ScoreboardHeader`)

左から順に:

1. 「戻る」ボタン（`variant="outlineWhite" size="sm"`）
2. ゲーム切替ボタン群（G1〜G{bestOf}）。結果画面表示中は非表示
   - 現在選択中: `bg-white text-black border-white`
   - 完了済: `border-success text-green-500`
   - ロック済かつ未入力（空）: `border-white/20 text-white/30`、disabled（タップ不可）
   - それ以外: `border-white/60 text-white`
3. 右端に状況に応じたアクションボタン（いずれも `border-success bg-success text-white`）:
   - 現在ゲームが決着し次ゲームへ進める場合: 「次に進む」ボタン。タップでゲームインデックスを+1
   - 試合勝者確定かつ結果未表示: 「結果を見る」ボタン。タップで結果画面に切替
   - 試合勝者確定かつ結果表示中: 「対戦表に戻る」ボタン。タップで `onBack()` と `onCloseAll?.()` を呼び出し

### 縦向き案内バー

メディアクエリ `(orientation: portrait) and (max-width: 900px)` に該当する場合（`usePortrait` フック）、ヘッダー直下に `bg-amber-500 text-black` のバーを表示:

```
端末を横向きにしてください
（画面の回転ロックがオンの場合は、解除してください）
```

### 入力画面 (`ScoreInputView` + `ScoreColumn`)

スコア入力状態（結果画面ではない）で表示。`grid-cols-[1fr_auto_1fr]` の3カラムレイアウト。

**左右のスコアカラム（`ScoreColumn`）:**

- 上部: 選手名（`text-base sm:text-2xl font-extrabold`）。ゲーム勝者または試合勝者の場合 `text-green-500`
- 中央: スコア数字（`text-[clamp(6rem,44vh,28rem)]`）。カード内上半分タップで +1、下半分タップで −1
  - 点数色: ゲーム勝者または試合勝者 → `text-green-500`、マッチポイント状態（`isGamePoint` が true）またはスコアが10以上 → `text-yellow-400`、通常 → `text-white`
  - 試合勝者カラムは背景が `bg-success/20 border-success`、それ以外は `bg-neutral-900 border-white/30`
  - スコアカード中央に横線（黒・3px）を挟んで上下半分を視覚的に分割
  - +1 ボタン: `score >= 50`（`MAX_SCORE`）のときも disabled。ゲーム勝者側はすでにゲーム終了しているため disabled（`disableAdd={winner === side}`）
  - −1 ボタン: `score <= 0` の場合のみ disabled。スコアが0より大きければ直前の得点者に関わらず常に減点可能
  - ロック済の場合は全ボタン disabled、「入力不可」テキストを下部に表示（`text-white/50`）
- 下部: サーブ権インジケーター（`h-2 sm:h-3 rounded-full`）。サーブ権あり → `bg-orange-500`、なし → 透明

**中央カラム:**

- ゲーム取得数（例 `2-1`）を大型表示（`text-[clamp(3rem,12vw,9rem)]`）。試合勝者側を `text-green-500`
- ロック済の場合は「入力不可」（`text-amber-300`）を表示
- 「⇄ 入替」ボタン: 左右の表示を反転（`swapped` 状態トグル）。`aria-pressed={swapped}`

### スコアボード操作ロジック

- **+1 操作**: `addPointToGame(game, side)` → `pointLog` に `side` を追記 → `leftScore`/`rightScore` を `pointLog` から再計算
- **−1 操作**: `removePointFromGame(game, side)` を実行。スコアが0より大きければ常に減点可能（直前の得点者との一致は問わない）。`pointLog` から該当 `side` の最後の出現を1つ削除して再計算（`pointLog` に無い場合はスコアのみ減算）
- **swapped 状態**: 表示上の左右を反転する。実際の `leftSide`/`rightSide` への書き込みは常に論理側で行う
- **ゲームのロック**: `lockedGameStartIndex` 以降のゲームはすべて入力不可。`lockedGameStartIndex` は試合勝者が確定した次のゲームインデックス

### サーブ交代ロジック（`domain/match.ts`）

- `gameFirstServer(matchFirstServer, gameIndex)`: 偶数ゲーム（0-indexed）は `matchFirstServer`、奇数ゲームは相手
- `currentServer(game, firstServerOfGame)`: 合計点数 `total = leftScore + rightScore`
  - `total < 20` の場合: `Math.floor(total / 2)` 回交代（2点ごと）
  - `total >= 20` の場合（デュース域）: `10 + (total - 20)` 回交代（1点ごと）
  - 交代回数が偶数 → `firstServerOfGame`、奇数 → 相手

### マッチポイント判定

- `isGamePoint(score, opponent)`: `(score + 1) >= 11 && (score + 1 - opponent) >= 2` のとき true
- `gameOpen`（ゲーム進行中）かつ試合未確定の場合のみ判定。ゲーム勝者または試合勝者が確定した後はマッチポイント表示しない

### ゲーム勝敗・試合勝敗

- ゲーム勝敗: `isGameFinished`: `max(left, right) >= 11 && |left - right| >= 2`
- 試合勝敗: `winsNeededForBestOf(bestOf) = Math.floor(bestOf / 2) + 1` ゲーム先取で確定
  - bestOf=3 → 2先取、bestOf=5 → 3先取、bestOf=7 → 4先取
- `lockedGameStartIndex`: 勝敗確定ゲームの次のインデックスを返す。確定していない場合は `gameCount`

### 結果画面（共有 `MatchResultBoard`）

「結果を見る」ボタンで切替表示。白背景 `bg-white text-ink` の領域に、個人結果と同じ `MatchResultBoard`（明背景カードスタイル）を `border-line rounded-2xl border-2` のカード枠（`max-w-2xl`）で中央表示する。ヘッダーバーは青背景のまま。

- 左右カラム: 勝者バッジ + 選手名 + ゲーム取得数（`text-[3rem]`）。勝者側 `text-success`、敗者側 `text-sub`
- 中央カラム: プレイ済ゲームのスコア一覧（`text-lg`）。`isGameFinished` または点数 > 0 のゲームのみ表示
- `swapped` 状態を反映し、`ScoreboardScreen` 側の `toResultBoardProps` で `MatchResultBoard` の汎用 props に変換する

> 点数進行グラフ（`MatchScoreChart`）の詳細仕様は [result-graph.md](result-graph.md) を参照。スコアボードの結果画面内にグラフを表示する場合は同ドキュメントの導線を確認すること。

### スコアボード入力の永続化

- `addPoint` / `undoPoint` の呼び出しが `persistGames`（`MatchModal`）を通じて `updateMatch` を呼ぶことで LocalStorage へ即時反映
- モーダルに戻った際に追加の同期処理は不要

**ワイヤー（横向き前提）:**

```
┌──────────────────────────────────────────────────────┐
│ [← 戻る]    [G1][G2][G3][G4][G5]        [次に進む]   │ ← 白文字 ゲーム切替
│──────────────────────────────────────────────────────│
│  端末を横向きにしてください（縦持ち時のみ表示）       │ ← bg-amber-500 バー
│──────────────────────────────────────────────────────│
│                                                      │ 青背景
│   田中           2 - 1          佐藤                  │
│                 (ゲーム取得数)                         │
│               [⇄ 入替]                               │
│                                                      │
│  ┌─────┐                          ┌─────┐           │
│  │ tap+│ ← 上半分タップで+1        │ tap+│           │
│  │     │                          │     │           │
│  │ 11  │ ← text-success(ゲーム勝) │  5  │           │
│  │─────│ ← 黒横線                 │─────│           │
│  │ tap-│ ← 下半分タップで-1(undo) │ tap-│           │
│  └─────┘                          └─────┘           │
│  ▬▬▬▬▬ ← サーブ権 (bg-orange-500)                    │
└──────────────────────────────────────────────────────┘
```

関連ロジック: [data-model.md#ロジック仕様](../architecture/data-model.md#ロジック仕様)（ゲーム勝敗、試合勝敗）
