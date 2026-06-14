# ディレクトリ構成

親: [README.md](../README.md)

```
src/
├── App.tsx                          // ルート定義（Routes/Route）
├── main.tsx                         // エントリ。HashRouter + PWA registerSW
├── components/
│   ├── icons/index.tsx             // SVGアイコン群
│   └── ui/                         // 共通UIコンポーネント
│       ├── BigButton.tsx           // 大型共通ボタン（variant/size 切替）
│       ├── ConfirmDialog.tsx       // 確認ダイアログ
│       ├── FontSizeToggle.tsx      // 文字サイズ切替（標準/大/特大）
│       ├── InfoDialog.tsx          // 案内ダイアログ
│       ├── RadioCardGroup.tsx      // カード型ラジオ選択（形式・ゲーム数等）
│       └── SelectMenu.tsx          // ドロップダウン選択
├── domain/                         // ビジネスロジック（純粋関数）
│   ├── match.ts                    // 勝敗判定・サーブ・pointLog操作
│   ├── match.test.ts
│   ├── matchGames.ts               // ゲーム配列の pad/trim・入力ロック算出
│   ├── matchGames.test.ts
│   ├── ranking.ts                  // 順位算出
│   ├── ranking.test.ts
│   ├── scoreProgress.ts            // 点数進行グラフ導出ロジック
│   └── scoreProgress.test.ts
├── features/
│   ├── home/                       // 大会一覧・新規作成
│   │   ├── index.tsx
│   │   ├── hooks.ts                // useHome（一覧ソート・作成フォーム）
│   │   ├── schema.ts               // 大会作成フォームの zod スキーマ
│   │   ├── CreateTournamentForm.tsx
│   │   └── InstallAppButton.tsx    // PWA「ホーム画面に追加」ボタン
│   └── tournament/
│       ├── layout.tsx              // タブ共通レイアウト
│       ├── participants/           // 参加者管理タブ
│       │   ├── index.tsx
│       │   ├── hooks.ts
│       │   └── schema.ts           // 参加者名の zod スキーマ
│       ├── result/                 // 結果タブ（ルート: result）
│       │   ├── index.tsx           // 点数表/グラフ サブタブ2つを含む
│       │   ├── hooks.ts            // useResultRows（順位行・対戦結果の構築）
│       │   ├── TableMode.tsx       // 点数表モード（順位表＋対戦結果テーブル）
│       │   └── components.tsx      // MatchGraphBlock 等
│       ├── settings/               // 大会設定・削除タブ
│       │   ├── index.tsx
│       │   └── schema.ts           // 大会情報編集の zod スキーマ
│       └── matrix/                 // 対戦表タブ・試合詳細・スコアボード
│           ├── index.tsx
│           ├── hooks.ts
│           ├── schema.ts           // ダブルス試合追加フォームの zod スキーマ
│           ├── SinglesMatrix.tsx
│           ├── DoublesMatrix.tsx
│           └── components/
│               ├── MatchModal.tsx          // 試合詳細モーダル（点数加減UIはScoreboardへ）
│               ├── DoublesMatchForm.tsx    // ダブルス試合追加フォーム
│               ├── PairSelect.tsx          // ダブルス用ペア選択
│               ├── ScoreboardScreen.tsx    // 横向き専用・青背景・上下半分タップで±
│               └── scoreboard/
│                   ├── MatchResultView.tsx
│                   ├── ScoreColumn.tsx
│                   ├── ScoreInputView.tsx
│                   ├── ScoreboardHeader.tsx
│                   ├── ScoreProgressChart.tsx  // 点数進行グラフ（SVG）
│                   ├── useDisplayMapping.ts
│                   └── useOrientation.ts       // usePortrait（縦向き検出）
├── store/
│   ├── useAppStore.ts              // Zustand + persist + immer（migrate含む）
│   ├── types.ts
│   └── slices/                     // Zustand スライス
│       ├── matchSlice.ts
│       ├── participantSlice.ts
│       ├── tournamentSlice.ts
│       └── uiSlice.ts
├── lib/                            // 汎用ユーティリティ
│   ├── id.ts                       // uuid生成
│   ├── time.ts                     // 日付整形（formatDate）
│   ├── saveAsImage.ts              // html-to-image による画像保存
│   └── useImageCapture.ts         // 画像保存フック
└── styles/index.css
```

## 補足

- ルーターは `main.tsx` の `HashRouter`。ルート定義は `App.tsx`（`/` 大会一覧、`/tournaments/:tournamentId` 配下に participants / matrix / result / settings タブ）。
- `features/tournament/result/` は App.tsx のルート `result`（「結果」タブ）に対応。点数表・グラフのサブタブを内包する。
- `domain/scoreProgress.ts` は点数進行グラフ用の純粋関数を提供（[features/result-graph.md](../features/result-graph.md) 参照）。
- `scoreboard/ScoreProgressChart.tsx` は SVG ベースのグラフコンポーネント（結果タブのグラフモード・スコアボードで使用）。
- 各 feature の `schema.ts` は React Hook Form + Zod 用のフォームスキーマ。
