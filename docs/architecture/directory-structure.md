# ディレクトリ構成

親: [README.md](../README.md)

```
src/
├── App.tsx, main.tsx
├── components/
│   ├── icons/index.tsx
│   └── ui/                         // 共通UIコンポーネント
│       ├── BigButton.tsx            // 56px高 共通ボタン
│       ├── ConfirmDialog.tsx
│       ├── FontSizeToggle.tsx       // 大/特大切替
│       └── InstallAppButton.tsx
├── domain/                         // ビジネスロジック（純粋関数）
│   ├── match.ts                    // 勝敗判定・pointLog操作
│   ├── match.test.ts
│   ├── ranking.ts                  // 順位算出
│   ├── ranking.test.ts
│   ├── scoreProgress.ts            // 点数進行グラフ導出ロジック
│   └── scoreProgress.test.ts
├── features/
│   ├── home/                       // 大会一覧・新規作成
│   │   ├── index.tsx
│   │   └── hooks.ts
│   └── tournament/
│       ├── layout.tsx              // タブ共通レイアウト
│       ├── participants/           // 参加者管理タブ
│       │   ├── index.tsx
│       │   └── hooks.ts
│       ├── ranking/                // 結果タブ（ルート: result）
│       │   ├── index.tsx           // 点数表/グラフ サブタブ2つを含む
│       │   └── hooks.ts
│       ├── settings/               // 大会設定・リセットタブ
│       │   └── index.tsx
│       └── matrix/                 // 対戦表タブ・試合詳細・スコアボード
│           ├── index.tsx
│           ├── hooks.ts
│           ├── SinglesMatrix.tsx
│           ├── DoublesMatrix.tsx
│           └── components/
│               ├── MatchModal.tsx           // 試合詳細・点数加減UIはScoreboardへ
│               ├── PairSelect.tsx           // ダブルス用ペア選択
│               ├── ScoreboardScreen.tsx     // 横向き専用・青背景・上下半分タップで±
│               └── scoreboard/
│                   ├── MatchResultView.tsx
│                   ├── ScoreColumn.tsx
│                   ├── ScoreInputView.tsx
│                   ├── ScoreboardHeader.tsx
│                   ├── ScoreProgressChart.tsx  // 点数進行グラフ（SVG）
│                   ├── useDisplayMapping.ts
│                   └── useOrientation.ts
├── store/
│   ├── useAppStore.ts              // Zustand + persist
│   ├── types.ts
│   └── slices/                     // Zustand スライス
│       ├── matchSlice.ts
│       ├── participantSlice.ts
│       ├── tournamentSlice.ts
│       └── uiSlice.ts
├── lib/                            // 汎用ユーティリティ
│   ├── id.ts                       // uuid生成
│   ├── time.ts
│   ├── saveAsImage.ts
│   └── useImageCapture.ts
└── styles/index.css
```

## 補足

- `features/tournament/ranking/` は App.tsx のルート `result` に対応（「結果」タブ）。点数表・グラフのサブタブを内包する。
- `domain/scoreProgress.ts` は点数進行グラフ用の純粋関数を提供（[features/result-graph.md](../features/result-graph.md) 参照）。
- `scoreboard/ScoreProgressChart.tsx` は SVG ベースのグラフコンポーネント（結果タブのグラフモードで使用）。
