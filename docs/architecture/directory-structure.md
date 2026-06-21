# ディレクトリ構成

親: [README.md](../README.md)

```
src/
├── App.tsx                          // ルート定義（Routes/Route）
├── main.tsx                         // エントリ。HashRouter + ErrorBoundary + SwUpdatePrompt
├── components/
│   ├── icons/index.tsx             // SVGアイコン群
│   ├── system/                     // アプリ基盤コンポーネント
│   │   ├── ErrorBoundary.tsx       // 例外捕捉境界
│   │   └── SwUpdatePrompt.tsx      // PWA更新プロンプト（virtual:pwa-register/react 使用）
│   └── ui/                         // 共通UIコンポーネント
│       ├── Button.tsx              // 共通ボタン（variant/size 切替）
│       ├── ConfirmModal.tsx        // 確認モーダル
│       ├── InfoModal.tsx           // 案内モーダル
│       ├── RadioGroup.tsx          // カード型ラジオ選択（形式・ゲーム数等）
│       ├── Select.tsx              // ドロップダウン選択（listbox パターン）
│       ├── Tabs.tsx                // セグメント型タブ（点数表/グラフ 切替等）
│       └── Toggle.tsx              // セグメント型トグル（文字サイズ等）
├── constants/
│   ├── routes.ts                   // ルートパス定数（ROUTES / TAB_PATH）
│   └── storage.ts                  // localStorage キー定数
├── domain/                         // ビジネスロジック（純粋関数。各 *.test.ts / 一部 *.proptest.test.ts）
│   ├── constants.ts                // 卓球ルール定数（GAME_POINT / WIN_DIFF 等）
│   ├── match.ts                    // 勝敗判定・サーブ・pointLog操作・opposite/flip
│   ├── matchGames.ts               // ゲーム配列の pad/trim・入力ロック算出
│   ├── ranking.ts                  // 順位算出
│   ├── scoreProgress.ts            // 点数進行グラフ導出ロジック
│   └── side.ts                     // MatchSide → participantId配列/表示名（sideMembers/sideName）
├── features/
│   ├── home/                       // 大会一覧・新規作成
│   │   ├── index.tsx
│   │   ├── hooks.ts                // useHome（一覧ソート・作成フォーム）
│   │   ├── schema.ts               // 大会作成フォームの zod スキーマ
│   │   └── components/
│   │       ├── CreateTournament.tsx    // 大会作成フォームUI
│   │       ├── FontSizeToggle.tsx      // 文字サイズ切替（標準/大/特大）
│   │       └── InstallAppButton.tsx    // PWA「ホーム画面に追加」ボタン
│   └── tournament/
│       ├── layout.tsx              // タブ共通レイアウト
│       ├── participants/           // 参加者管理タブ
│       │   ├── index.tsx
│       │   ├── hooks.ts
│       │   └── schema.ts           // 参加者名の zod スキーマ
│       ├── matches/                 // 対戦表タブ・試合詳細
│       │   ├── index.tsx           // 形式に応じ Singles/Doubles を出し分け
│       │   ├── hooks.ts
│       │   ├── components/
│       │   │   ├── FirstServerSelect.tsx  // 最初のサーブ選択
│       │   │   ├── MatchModal.tsx         // 試合詳細モーダル（点数加減UIはScoreboardへ）
│       │   │   └── SaveImageButton.tsx    // 対戦表の画像保存ボタン
│       │   ├── singles/
│       │   │   ├── index.tsx       // SinglesList（シングルス対戦表）
│       │   │   └── hooks.ts
│       │   └── doubles/
│       │       ├── index.tsx       // DoublesList（ダブルス対戦表＋試合追加フォーム）
│       │       ├── hooks.ts
│       │       └── schema.ts       // ダブルス試合追加フォームの zod スキーマ
│       ├── scoreboard/             // スコアボード（試合進行中・横向き前提）
│       │   ├── index.tsx
│       │   ├── hooks.ts
│       │   └── components/
│       │       ├── MatchResultView.tsx
│       │       ├── ScoreColumn.tsx
│       │       ├── ScoreInputView.tsx
│       │       ├── ScoreboardHeader.tsx
│       │       └── ScoreboardScreen.tsx     // 横向き専用・青背景・上下半分タップで±
│       ├── result/                 // 結果タブ（ルート: result）
│       │   ├── index.tsx           // 点数表/点数グラフ サブタブを束ねるコンテナ（ResultTab/ResultView）
│       │   ├── hooks.ts            // useResult（順位行・対戦結果・グラフ選択の構築）
│       │   └── components/
│       │       ├── AllMatchesCapture.tsx  // 全対戦の off-screen 画像レンダリング
│       │       ├── MatchResultsTable.tsx  // 対戦結果テーブル
│       │       ├── MatchScoreChart.tsx    // 1対戦分の点数進行グラフ本体（SVG）
│       │       ├── RankingTable.tsx       // 順位表テーブル
│       │       └── SaveImageButtons.tsx   // 画像保存ボタン群（モード別）
│       └── settings/               // 大会設定・削除タブ
│           ├── index.tsx
│           ├── hooks.ts            // useSettings（編集・リセット・削除）
│           └── schema.ts           // 大会情報編集の zod スキーマ
├── store/
│   ├── useAppStore.ts              // Zustand + persist + immer（migrate / salvage 含む）
│   ├── selectors.ts                // 導出セレクタ（matchesOf: tournamentId で試合を導出）
│   ├── types.ts
│   └── slices/                     // Zustand スライス
│       ├── matchSlice.ts
│       ├── participantSlice.ts
│       ├── tournamentSlice.ts
│       └── uiSlice.ts
├── utils/                          // 汎用ユーティリティ
│   ├── id.ts                       // UUID生成（crypto.randomUUID ラッパー）
│   ├── time.ts                     // 日付整形（formatDate）
│   └── imageCapture/
│       ├── saveAsImage.ts          // html-to-image による画像保存
│       └── useImageCapture.ts      // 画像保存フック（ref + タイムスタンプファイル名）
└── styles/index.css
```

## 補足

- ルーターは `main.tsx` の `HashRouter`。ルート定義は `App.tsx`（`/` 大会一覧、`/tournaments/:tournamentId` 配下に participants / matches / result / settings タブ）。
- `features/tournament/result/` は App.tsx のルート `result`（「結果」タブ）に対応。点数表・グラフのサブタブを内包する。
- `domain/scoreProgress.ts` は点数進行グラフ用の純粋関数を提供（[features/result-graph.md](../features/result-graph.md) 参照）。
- `result/components/MatchScoreChart.tsx` は SVG ベースのグラフ本体コンポーネント（結果タブのグラフモードで使用）。レイアウト寸法定数（`COL_WIDTH` / `ROW_HEIGHT` / `CIRCLE_SIZE`）は同ファイル内に定義。
- 各 feature の `schema.ts` は React Hook Form + Zod 用のフォームスキーマ。
- Storybook の story はコンポーネント隣に `*.stories.tsx` で配置（colocation・上記ツリーでは省略）。設定は `.storybook/`（`main.ts` / `preview.ts`）。詳細 → [../testing.md](../testing.md)。
