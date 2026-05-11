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

### 3.1 大会管理
- 新規大会作成（名称・形式・開催日）
- 形式選択: `singles` | `doubles`
- 大会切替（複数大会保持）
- 大会削除
- 全データリセット（確認ダイアログ）

### 3.2 参加者管理
- 個人単位で登録（名前のみ必須、所属任意）
- 追加・編集・削除
- ダブルスでも個人登録 → 対戦時にペア指定

### 3.3 組合せ生成
- 参加者確定後「総当たり生成」ボタン
- シングルス: 全参加者ペア生成（n人 → nC2試合）
- ダブルス: 対戦時に左右ペア（各2名）を選択。事前のペア固定なし
  - 注: ダブルスは試合数が爆発するため、ユーザーが対戦を手動で追加する方式とする
  - シングルスは自動全生成、ダブルスは手動追加（または「ペアテンプレート」を作成しテンプレ間総当たり）
- 組合せはマトリクス表のセルとして表示

### 3.4 試合詳細入力
1試合あたりの記録項目:

| 項目 | 型 | 必須 |
|------|-----|------|
| 対戦者 (左/右) | participantId or pairIds[2] | 必須 |
| ゲーム1〜5 点数 | { left: int, right: int } × 最大5 | 1ゲーム以上 |
| メモ | string | 任意 |

ゲーム勝敗判定: 11点先取・2点差デュース。`>=11 かつ 差>=2`で勝者確定。  
試合勝敗判定: 3ゲーム先取で確定（最大5ゲーム）。3-0/3-1/3-2のみ有効。

入力UI: ゲームごとに点数2フィールド。3ゲーム先取になった時点で残ゲーム入力ロック。

モーダル内の点数加減UI（ゲーム1, ゲーム2...の±ボタン）は**スコアボード画面**（3.8）に切り出す。モーダルからは「スコアボードを開く」ボタンで遷移。モーダル右上の閉じる操作は**×ボタンではなく「青背景の保存ボタン」**で行う（タップで保存 → モーダル閉じる）。

### 3.8 スコアボード画面（試合進行中表示）

試合進行中、選手・観客から視認しやすい大型スコア表示専用画面。

- 起動: 試合詳細モーダル内の「スコアボードを開く」ボタン
- 戻る: 画面内「もどる」ボタンで試合詳細モーダルへ復帰
- 表示要素:
  - 参加者の名前（左/右）
  - 現在のゲームの点数（大型表示）
    - 操作: 上下スワイプで加減、または既存と同様の **+/−ボタン**
  - 全体のゲーム取得数（例: `2 - 1`）
  - もどるボタン
- 配色: **黒背景・白文字**。勝利側（現在ゲーム勝者・試合勝者）は**緑**で強調
- 向き: **スマホサイズ時は横向き（landscape）前提**のレイアウト
  - CSS Media `(orientation: portrait) and (max-width: 768px)` 時は「横向きにしてください」誘導表示、または `screen.orientation.lock('landscape')` 試行
  - 横向き時: 左右に選手スコア、中央に全体ゲーム数を大きく配置
- 入力はLocalStorageへ即時反映（モーダル復帰時に同期不要）

### 3.5 マトリクス表示
- 縦軸・横軸に参加者名（ダブルスはペア名）
- セル内容:
  - 未対戦: 空
  - 対戦済: ゲームスコア（例 `3-1`）+ クリックで詳細
  - 自セル: 黒塗り
- 対称セル（B vs A）には逆スコアを自動反映

### 3.6 順位表
ソート基準（上から順に適用）:
1. 勝数（多い順）
2. ゲーム得失差（取ゲーム − 失ゲーム）
3. 点得失差（取点 − 失点）

表示列: 順位・名前・試合数・勝・敗・ゲーム得失・点得失

### 3.7 リセット
- 「現在の大会のみリセット」と「全データリセット」を分離
- いずれも確認ダイアログ必須

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
type Tournament = {
  id: string;            // uuid
  name: string;
  format: 'singles' | 'doubles';
  createdAt: string;     // ISO
  participantIds: string[];
  pairIds?: string[];    // doubles時のテンプレペア
  matchIds: string[];
};

type Participant = {
  id: string;
  name: string;
  affiliation?: string;
};

type Pair = {           // doubles テンプレペア
  id: string;
  name: string;         // 表示名 任意
  memberIds: [string, string];
};

type Game = {
  leftScore: number;
  rightScore: number;
};

type Match = {
  id: string;
  tournamentId: string;
  // singles: participantId / doubles: pairId or memberIds[2]
  leftSide: { kind: 'single'; participantId: string }
          | { kind: 'pair'; memberIds: [string, string] };
  rightSide: same as leftSide;
  games: Game[];        // 最大5
  note?: string;
  status: 'scheduled' | 'in_progress' | 'finished';
};

type AppState = {
  tournaments: Record<string, Tournament>;
  participants: Record<string, Participant>;
  pairs: Record<string, Pair>;
  matches: Record<string, Match>;
  currentTournamentId: string | null;
};
```

LocalStorageキー: `pinpon-match-manage:v1`。スキーマ変更時は `:v2` 等にバンプし旧キーから移行関数で吸収。

## 6. UI/UX設計（高齢者向け視認性）

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

### 6.6 マトリクス表の視認性

- セル内スコア 24〜32px
- 勝者側に薄い緑背景 + 太枠、敗者側に薄い赤背景
- 自セル（黒塗り）は斜線パターン併用（色のみに頼らない）
- スマホ縦持ち時は 横スクロール + **1列目（自分の行名）固定**
- 行・列ホバー/タップで該当行・列をハイライト（読み迷い防止）

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
| 1 | `/#/` | 大会一覧・新規作成 |
| 2 | `/#/t/:id` | 大会ダッシュボード（タブ切替） |
| 2-a | タブ: 参加者 | 参加者管理 |
| 2-b | タブ: 対戦表 | マトリクス表 |
| 2-c | タブ: 順位 | 順位表 |
| 2-d | タブ: 設定 | 大会設定・リセット |
| 3 | モーダル | 試合詳細入力 |
| 4 | `/#/t/:id/m/:matchId/scoreboard` | スコアボード（試合進行中・横向き前提） |

### 7.2 主要画面ワイヤー

UIは大型化前提。下記ワイヤーは縮尺イメージ（実機ではボタン高56px・本文18px以上）。

**大会一覧**
```
┌──────────────────────────────────────┐
│  卓ログ                              │
│  文字サイズ: [大] [特大]              │
├──────────────────────────────────────┤
│                                      │
│  ┃ ＋ あたらしい大会をつくる ┃       │ ← 64px高 青
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│  春季リーグ                          │
│  2026年4月12日 ・ 8人              ▶ │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│  部内戦                              │
│  2026年3月1日 ・ 4人               ▶ │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━           │
│                                      │
│         [ ぜんぶ消す ]                │ ← 赤・確認2段
└──────────────────────────────────────┘
```

**マトリクス表（シングルス例・大型セル）**
```
┌──────────────────────────────────┐
│ ← もどる   春季リーグ            │
│ [参加者][対戦表][順位][設定]     │ ← タブ大型
├──────────────────────────────────┤
│        田中    佐藤    鈴木      │
│ 田中  ████   ３−１   −        │
│        ████  (勝)              │
│ 佐藤  １−３   ████   ２−３     │
│       (負)   ████   (負)       │
│ 鈴木   −    ３−２   ████       │
│              (勝)   ████       │
└──────────────────────────────────┘
```
セルは64px以上・勝者セル淡緑+太枠・敗者セル淡赤・自セル斜線。タップで試合詳細。

**試合詳細モーダル**
```
┌──────────────────────────────────┐
│ 試合の入力      [ 保存 ]         │ ← 右上 青背景 保存ボタン (×ボタン廃止)
│                                  │
│   田中    対    佐藤             │ ← 28px
│                                  │
│ 終了:  [ 14:25 ]                 │
│                                  │
│ ┃ ゲーム1 ┃ 11 - 5  (勝)         │ ← 表示のみ
│ ┃ ゲーム2 ┃ 11 - 8              │
│ ┃ ゲーム3 ┃ 9 - 11               │
│ ┃ ゲーム4 ┃ 11 - 6               │
│ ┃ ゲーム5 ┃ 終了 ／ 入力不可     │
│                                  │
│ 田中の勝ち  3 - 1                │ ← 32px太字 緑
│                                  │
│ [ ▶ スコアボードを開く ]         │ ← 大型 点数入力は別画面
│                                  │
│ [ 保存 ]               [ 削除 ]  │ ← 保存: 青  削除: 赤
└──────────────────────────────────┘
```

点数加減±UIは本モーダルから削除し、スコアボード画面（下記）に移動。モーダルでは各ゲームのスコア結果のみ表示。

**スコアボード画面（横向き前提）**
```
┌──────────────────────────────────────────────────────┐
│ ← もどる                              ゲーム 1        │ ← 白文字
│──────────────────────────────────────────────────────│
│                                                      │ 黒背景
│   田中            2 - 1            佐藤              │ ← 全体ゲーム数
│  (緑:勝利側)                                          │
│                                                      │
│  ┌─────┐                          ┌─────┐           │
│  │ [+] │                          │ [+] │           │
│  │     │                          │     │           │
│  │ 11  │                          │  5  │           │ ← 巨大数字
│  │     │                          │     │           │   (上下スワイプ可)
│  │ [-] │                          │ [-] │           │
│  └─────┘                          └─────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- 背景: `#000000` / 文字: `#FFFFFF` / 勝利強調: `#22C55E` (green-500)
- スマホ縦持ち時: 「端末を横向きにしてください」案内 + 自動回転ロック試行
- スコア部はタップ（+/−）または上下スワイプで加減
- 戻るボタンで試合詳細モーダルへ復帰（モーダルは裏で開いたまま）

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
各参加者ごとに集計:
```
wins, losses
gamesWon, gamesLost → gameDiff = won - lost
pointsFor, pointsAgainst → pointDiff = for - against
```
ソート: `[-wins, -gameDiff, -pointDiff, name]`

ダブルスでテンプレペア運用時はペア単位で集計。手動ダブルス（ペア未テンプレ）の順位は個人単位で集計（メンバー2人それぞれに勝敗加算）。

## 9. ディレクトリ構成

```
src/
├── main.tsx
├── App.tsx
├── routes/
│   ├── TournamentList.tsx
│   ├── TournamentLayout.tsx
│   ├── ParticipantsTab.tsx
│   ├── MatrixTab.tsx
│   ├── RankingTab.tsx
│   └── SettingsTab.tsx
├── components/
│   ├── MatchModal.tsx        // 右上=青保存ボタン (×なし)・点数加減UIなし
│   ├── ScoreboardScreen.tsx  // 横向き専用・黒背景・スワイプ/±で加減
│   ├── ScoreInput.tsx        // 大型±ボタン+ピル選択 (スコアボード内で使用)
│   ├── BigButton.tsx         // 56px高 共通ボタン
│   ├── FontSizeToggle.tsx    // 大/特大切替
│   └── ConfirmDialog.tsx
├── store/
│   ├── useAppStore.ts       // Zustand + persist
│   └── selectors.ts
├── domain/
│   ├── match.ts             // 勝敗判定
│   ├── ranking.ts           // 順位算出
│   └── matchup.ts           // 総当たり生成
├── lib/
│   ├── id.ts                // uuid
│   └── time.ts
└── styles/
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
