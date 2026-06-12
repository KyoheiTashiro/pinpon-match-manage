# 卓球対戦結果管理システム 要件定義書 兼 設計書

## 1. 概要

卓球の総当たり戦（リーグ戦）の対戦結果を管理するWebアプリ。シングルス/ダブルス両対応。データはブラウザのLocalStorageに保存。GitHub Pagesで無料ホスティング。

- 対象: 小規模大会・部活・サークル・社内交流戦・**シニア層中心の卓球サークル想定**
- 利用形態: 単一端末ローカル運用（マルチユーザー同期なし）
- オフライン動作: PWA対応・インストール可・完全オフライン動作
- UI方針: **高齢者向け視認性最優先**。大きな文字・高コントラスト・大きなタップ領域

## 2. 技術スタック

| 項目 | 採用 |
|------|------|
| フロント | React 18 + TypeScript |
| ビルド | Vite |
| ルーティング | React Router (HashRouter — GH Pages対応) |
| 状態管理 | Zustand（軽量・LocalStorage永続化ミドルウェア利用） |
| スタイル | Tailwind CSS |
| 永続化 | LocalStorage（zustand persist） |
| ホスティング | GitHub Pages |
| CI | GitHub Actions（push時 build → gh-pages branch deploy） |
| PWA | `vite-plugin-pwa`（Workbox ベース・自動SW生成・manifest生成） |
| Lint/Format | ESLint + Prettier |
| テスト | Vitest（ユニット）+ Testing Library（任意） |

HashRouter採用理由: GH Pagesは任意パスへのフォールバック設定不可 → SPAルーティングはhashベースが安全。

## 3. 機能要件

各画面の詳細仕様は docs/features/ 配下を参照。

- 大会管理（作成/切替/削除/全リセット） → [docs/features/home.md](docs/features/home.md)、[docs/features/settings.md](docs/features/settings.md)
- 参加者管理 → [docs/features/participants.md](docs/features/participants.md)
- 組合せ生成・試合詳細・マトリクス・スコアボード → [docs/features/matrix.md](docs/features/matrix.md)
- 順位表 → [docs/features/ranking.md](docs/features/ranking.md)
- リセット → [docs/features/settings.md](docs/features/settings.md)

## 4. 非機能要件

- 対応ブラウザ: 最新Chrome/Edge/Safari/Firefox
- レスポンシブ: スマホ縦持ち〜PC
- ストレージ上限: LocalStorage 5MB想定。1大会1MB未満を目標
- パフォーマンス: 参加者30名・全総当たり435試合まで動作
- アクセシビリティ: キーボード入力可・WCAG 2.1 **AAA準拠目標**（最低AA）
- PWA: ホーム画面追加可・初回ロード後オフライン全機能動作・更新時 自動再取得
- 視認性: 高齢者前提。本文最低18px・主要操作ボタン最低56px高・コントラスト比7:1以上

## 5. データモデル

```ts
type Side = 'L' | 'R';

type Tournament = {
  id: string;            // uuid
  name: string;
  format: 'singles' | 'doubles';
  date: string;          // 開催日 YYYY-MM-DD
  createdAt: string;     // ISO
  participantIds: string[];
  matchIds: string[];
};

type Participant = {
  id: string;
  tournamentId: string;  // 専属大会
  name: string;
  affiliation?: string;
};

type Game = {
  leftScore: number;     // 0 を未入力センチネルとして扱う（永続化時は trim）
  rightScore: number;
};

type Match = {
  id: string;
  tournamentId: string;
  leftSide: { kind: 'single'; participantId: string }
          | { kind: 'pair'; memberIds: [string, string] };
  rightSide: same as leftSide;
  games: Game[];         // 永続化は実プレイ分のみ・最大5
  note?: string;
  firstServer: Side;     // 試合初手サーブ
};

type FontSize = 'normal' | 'large' | 'xlarge';

type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
  fontSize: FontSize;
};
```

- 試合進行状態は `matchSummary(games)` から派生（永続化しない）
- ダブルスのペアはエンティティ化せず `memberIds[2]` のみ。同ペアの再結成は識別不可

LocalStorageキー: `pinpon-match-manage:v1`。スキーマ変更時は `:v2` 等にバンプし旧キーから移行関数で吸収。

## 6. UI/UX設計（高齢者向け視認性）

各画面固有の視認性は docs/features/ 参照。

### 6.1 設計原則
- **大きく**: 文字・ボタン・タップ領域を一般的なWebの1.3〜1.5倍
- **はっきり**: 高コントラスト・原色寄り・グレー文字の禁止
- **シンプル**: 1画面1目的・選択肢4つ以下・階層浅く
- **誤操作許容**: 破壊的操作は確認ダイアログ + 取消可能 表示
- **読みやすさ**: 行間広め・等幅でスコア整列・濁点判別容易な書体

### 6.2 タイポグラフィ

| 要素 | サイズ | 太さ | 行間 |
|------|--------|------|------|
| 本文 | 18px (1.125rem) | 500 | 1.7 |
| ボタンラベル | 22px (1.375rem) | 700 | 1.3 |
| 見出しh2 | 28px (1.75rem) | 700 | 1.3 |
| 見出しh1 | 32px (2rem) | 800 | 1.2 |
| スコア表示 | 40px (2.5rem) | 800 | 1.0 |
| マトリクスセル | 24px (1.5rem) | 700 | 1.2 |

書体: `"Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Noto Sans JP", system-ui, sans-serif`。  
明朝・細字 不使用。数字は等幅（`font-variant-numeric: tabular-nums`）でスコア桁ズレ防止。

ユーザー設定で **文字サイズ +大/+特大** 切替（ルート `font-size` を `18px → 20px → 22px` に変更）。

### 6.3 カラーパレット

WCAG AAA基準（白背景でコントラスト比7:1以上）。

| 用途 | 色 | コントラスト比(対白) |
|------|-----|------|
| 本文テキスト | `#0F172A` (slate-900) | 17.9:1 |
| 副次テキスト | `#1E293B` (slate-800) | 14.4:1 |
| プライマリ（保存・確定） | `#1D4ED8` (blue-700) | 8.6:1 |
| 成功（勝ち） | `#15803D` (green-700) | 5.9:1 → 太字+枠で補強 |
| 危険（削除・リセット） | `#B91C1C` (red-700) | 6.6:1 |
| 警告 | `#B45309` (amber-700) | 5.9:1 |
| 背景 | `#FFFFFF` |  |
| サブ背景 | `#F1F5F9` (slate-100) |  |
| 罫線 | `#475569` (slate-600) | 7.5:1 |

色のみで意味伝達しない: 勝敗は色 + 「勝/負」アイコン + テキスト併記。  
ダークモード: 反転版を用意（背景 `#0F172A` + 文字 `#F8FAFC`）。OS連動 + 手動切替。

### 6.4 タップ領域・余白

| 要素 | 最小サイズ |
|------|-----------|
| 主要ボタン | 高さ 56px・横 144px以上 |
| 二次ボタン | 高さ 48px |
| マトリクスセル | 64px × 64px 以上 |
| 入力フィールド | 高さ 56px・フォント 22px |
| アイコンのみボタン | 56px × 56px |
| 隣接ボタンの間隔 | 16px以上 |

指が太くても押せる前提。ボタン間に十分な余白を取り誤タップ回避。

### 6.5 入力UI

- ゲーム点数: テンキー風 `<input type="number" inputmode="numeric">` + **大型 +/− ボタン**併設（タップ操作優先）
- 11点先取なので 0〜13 の選択ボタンを並べる方式も用意（ピル型ボタン群）

### 6.7 操作フィードバック

- ボタン押下: 200ms以内に視覚反応（背景色変化 + 軽い触覚振動 `navigator.vibrate(20)` 任意）
- 保存完了: 大型トースト「保存しました ✓」を画面下部に3秒表示
- エラー: 赤背景 + 警告アイコン + 平易な日本語（「数字を入れてください」等）
- 確認ダイアログ: 「はい」「いいえ」のみ・両方56px高・既定フォーカスは安全側

### 6.8 ナビゲーション

- タブは画面下部固定（モバイル）。最大4タブ・各タブ アイコン+大ラベル
- 戻るは画面左上に **大型「← もどる」ボタン**（ブラウザ戻るに頼らない）
- パンくずなし（階層浅いため不要）

### 6.9 アクセシビリティ実装

- セマンティックHTML（`<button>` `<table>` `<dialog>`）
- `aria-label` を全アイコンボタンに付与
- フォーカスリング: 4px 太の青枠（`outline: 4px solid #2563EB`）
- キーボード操作: Tab順序 論理的・Enterで主要操作
- スクリーンリーダー読上対応（マトリクスは `<th scope>` 適切設定）
- `prefers-reduced-motion` 尊重しアニメ短縮
- ズーム400%まで横スクロール無しでレイアウト保持

### 6.10 Tailwind 設定例

```js
// tailwind.config.js
theme: {
  fontFamily: {
    sans: ['"Hiragino Kaku Gothic ProN"','"Yu Gothic UI"','"Noto Sans JP"','system-ui','sans-serif'],
  },
  fontSize: {
    base: ['1.125rem', { lineHeight: '1.7' }],   // 18px
    lg:   ['1.375rem', { lineHeight: '1.5' }],   // 22px
    xl:   ['1.75rem',  { lineHeight: '1.3' }],   // 28px
    '2xl':['2rem',     { lineHeight: '1.2' }],   // 32px
    score:['2.5rem',   { lineHeight: '1.0' }],   // 40px
  },
  extend: {
    minHeight: { btn: '56px', input: '56px' },
    minWidth:  { btn: '144px' },
    spacing:   { tap: '16px' },
  },
}
```

ベースCSS:
```css
html { font-size: 18px; }              /* 既定大 */
html[data-fs="large"]  { font-size: 20px; }
html[data-fs="xlarge"] { font-size: 22px; }
:focus-visible { outline: 4px solid #2563EB; outline-offset: 2px; }
button { min-height: 56px; min-width: 144px; padding: 0 24px; font-weight: 700; }
table.matrix td, table.matrix th { min-width: 64px; min-height: 64px; }
```

## 7. 画面設計

### 7.1 画面一覧

| # | ルート | 画面 |
|---|--------|------|
| 1 | `/#/` | [大会一覧・新規作成](docs/features/home.md) |
| 2 | `/#/t/:id` | 大会ダッシュボード（タブ切替） |
| 2-a | タブ: 参加者 | [参加者管理](docs/features/participants.md) |
| 2-b | タブ: 対戦表 | [マトリクス表](docs/features/matrix.md) |
| 2-c | タブ: 順位 | [順位表](docs/features/ranking.md) |
| 2-d | タブ: 設定 | [大会設定・リセット](docs/features/settings.md) |
| 3 | モーダル | [試合詳細入力](docs/features/matrix.md) |
| 4 | モーダル（ポータル） | [スコアボード（試合進行中・横向き前提）](docs/features/matrix.md) |

### 7.2 主要画面ワイヤー

各画面のワイヤーは docs/features/ 配下参照。

## 8. ロジック仕様

### 8.1 ゲーム勝敗
```
isGameFinished(g): max(l,r) >= 11 && abs(l-r) >= 2
gameWinner(g): l>r ? 'L' : 'R'
```

### 8.2 試合勝敗
```
leftWins = count(games, gameWinner==='L')
rightWins = count(games, gameWinner==='R')
matchFinished = leftWins===3 || rightWins===3
matchWinner = leftWins===3 ? 'L' : (rightWins===3 ? 'R' : null)
```

### 8.3 順位算出

順位算出は [docs/features/ranking.md](docs/features/ranking.md) 参照。

## 9. ディレクトリ構成

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
│   ├── match.ts                    // 勝敗判定
│   ├── match.test.ts
│   ├── ranking.ts                  // 順位算出
│   └── ranking.test.ts
├── features/
│   ├── home/                       // 大会一覧・新規作成
│   │   ├── index.tsx
│   │   └── hooks.ts
│   └── tournament/
│       ├── layout.tsx              // タブ共通レイアウト
│       ├── participants/           // 参加者管理タブ
│       │   ├── index.tsx
│       │   └── hooks.ts
│       ├── ranking/                // 順位表タブ
│       │   ├── index.tsx
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

## 10. PWA設計

### 10.1 構成
- `vite-plugin-pwa` 使用。`registerType: 'autoUpdate'`
- `dev` 環境でも `devOptions.enabled: true` で SW デバッグ可

### 10.2 manifest
```json
{
  "name": "Pinpon Match Manage",
  "short_name": "Pinpon",
  "description": "卓球対戦結果管理",
  "start_url": "/pinpon-match-manage/",
  "scope": "/pinpon-match-manage/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 10.3 Service Worker キャッシュ戦略
- アプリシェル(JS/CSS/HTML/manifest/icons): **precache**（Workbox `precacheAndRoute`）→ 完全オフライン動作
- フォント等の同一オリジン静的資産: `StaleWhileRevalidate`
- 外部API: 無し（全データLocalStorage）→ ネットワークキャッシュ戦略 不要

### 10.4 更新フロー
- `autoUpdate`: 新SW検出時 自動アクティベート
- 起動中タブには「更新あり」トースト表示し、ユーザー操作で `window.location.reload()`
- 進行中試合データはLocalStorage永続のためリロード安全

### 10.5 オフライン制約
- 全機能オフライン動作（永続層がLocalStorageのみのため）
- 初回アクセスのみオンライン必須

### 10.6 GH Pages との注意点
- `start_url` / `scope` はサブパス `/pinpon-match-manage/` 含める
- `vite.config.ts` の `base` と一致必須
- アイコンパスは相対 (`icons/...`) で manifest 内記述

## 11. デプロイ

GitHub Actions ワークフロー `.github/workflows/deploy.yml`:
- trigger: push to `main`
- step: `npm ci` → `npm run build` → `peaceiris/actions-gh-pages` で `dist/` を `gh-pages` ブランチにpush
- vite.config.ts に `base: '/pinpon-match-manage/'` 設定（リポジトリ名）
- `vite-plugin-pwa` が `dist/sw.js` `dist/manifest.webmanifest` 自動生成
- HashRouter のため SW スコープと干渉なし

## 12. テスト方針

- domain層（match/ranking/matchup）: ユニットテスト必須
  - 11-9はゲーム未確定、12-10は確定、11-10は未確定
  - 3-0/3-1/3-2/2-2途中の判定
  - 順位ソートの同点ケース
- UI: スモークテストのみ（手動確認中心）
- アクセシビリティ: Lighthouse Accessibility 95点以上・axe-core 重大違反0
- 視認性 実機確認: 高齢者層（60代以上）数名にユーザーテスト・室内蛍光灯下での視認性確認

## 13. スコープ外（将来拡張）

- 認証・複数端末同期（Firebase等）
- トーナメント形式（敗者復活・ダブルエリミ）
- バックグラウンド同期・Push通知
- 試合動画リンク・写真添付
- CSV/JSONエクスポート（要望時に追加容易）

## 14. マイルストーン

1. プロジェクト雛形 + Tailwind（高齢者向け設定）+ Zustand persist
2. デザインシステム土台（BigButton・配色・フォントサイズ切替）
3. 参加者・大会CRUD + LocalStorage永続化
4. 総当たり生成 + マトリクス表示（大型セル）
5. 試合詳細モーダル + 勝敗判定（大型±入力）
6. 順位表
7. リセット・確認ダイアログ
8. GitHub Actions デプロイ設定
9. PWA化（vite-plugin-pwa・manifest・アイコン・更新トースト）
10. アクセシビリティ監査（Lighthouse・axe・実機）
11. domainユニットテスト
