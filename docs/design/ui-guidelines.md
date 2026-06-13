# UI/UX設計（高齢者向け視認性）

親: [README.md](../README.md)

各画面固有の視認性は `features/` 参照。

## 6.1 設計原則

- **大きく**: 文字・ボタン・タップ領域を一般的なWebの1.3〜1.5倍
- **はっきり**: 高コントラスト・原色寄り・グレー文字の禁止
- **シンプル**: 1画面1目的・選択肢4つ以下・階層浅く
- **誤操作許容**: 破壊的操作は確認ダイアログ + 取消可能 表示
- **読みやすさ**: 行間広め・等幅でスコア整列・濁点判別容易な書体

## 6.2 タイポグラフィ

| 要素           | サイズ          | 太さ | 行間 |
| -------------- | --------------- | ---- | ---- |
| 本文           | 18px (1.125rem) | 500  | 1.7  |
| ボタンラベル   | 22px (1.375rem) | 700  | 1.3  |
| 見出しh2       | 28px (1.75rem)  | 700  | 1.3  |
| 見出しh1       | 32px (2rem)     | 800  | 1.2  |
| スコア表示     | 40px (2.5rem)   | 800  | 1.0  |
| マトリクスセル | 24px (1.5rem)   | 700  | 1.2  |

書体: `"Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Noto Sans JP", system-ui, sans-serif`。  
明朝・細字 不使用。数字は等幅（`font-variant-numeric: tabular-nums`）でスコア桁ズレ防止。

ユーザー設定で **文字サイズ +大/+特大** 切替（ルート `font-size` を `18px → 20px → 22px` に変更）。

## 6.3 カラーパレット

WCAG AAA基準（白背景でコントラスト比7:1以上）。

| 用途                     | 色                    | コントラスト比(対白)  |
| ------------------------ | --------------------- | --------------------- |
| 本文テキスト             | `#0F172A` (slate-900) | 17.9:1                |
| 副次テキスト             | `#1E293B` (slate-800) | 14.4:1                |
| プライマリ（保存・確定） | `#1D4ED8` (blue-700)  | 8.6:1                 |
| 成功（勝ち）             | `#15803D` (green-700) | 5.9:1 → 太字+枠で補強 |
| 危険（削除・リセット）   | `#B91C1C` (red-700)   | 6.6:1                 |
| 警告                     | `#B45309` (amber-700) | 5.9:1                 |
| 背景                     | `#FFFFFF`             |                       |
| サブ背景                 | `#F1F5F9` (slate-100) |                       |
| 罫線                     | `#475569` (slate-600) | 7.5:1                 |

色のみで意味伝達しない: 勝敗は色 + 「勝/負」アイコン + テキスト併記。  
ダークモード: 反転版を用意（背景 `#0F172A` + 文字 `#F8FAFC`）。OS連動 + 手動切替。

## 6.4 タップ領域・余白

| 要素               | 最小サイズ               |
| ------------------ | ------------------------ |
| 主要ボタン         | 高さ 56px・横 144px以上  |
| 二次ボタン         | 高さ 48px                |
| マトリクスセル     | 64px × 64px 以上         |
| 入力フィールド     | 高さ 56px・フォント 22px |
| アイコンのみボタン | 56px × 56px              |
| 隣接ボタンの間隔   | 16px以上                 |

指が太くても押せる前提。ボタン間に十分な余白を取り誤タップ回避。

## 6.5 入力UI

- ゲーム点数: テンキー風 `<input type="number" inputmode="numeric">` + **大型 +/− ボタン**併設（タップ操作優先）
- 11点先取なので 0〜13 の選択ボタンを並べる方式も用意（ピル型ボタン群）

## 6.7 操作フィードバック

- ボタン押下: 200ms以内に視覚反応（背景色変化 + 軽い触覚振動 `navigator.vibrate(20)` 任意）
- 保存完了: 大型トースト「保存しました ✓」を画面下部に3秒表示
- エラー: 赤背景 + 警告アイコン + 平易な日本語（「数字を入れてください」等）
- 確認ダイアログ: 「はい」「いいえ」のみ・両方56px高・既定フォーカスは安全側

## 6.8 ナビゲーション

- タブは画面下部固定（モバイル）。最大4タブ・各タブ アイコン+大ラベル
- 戻るは画面左上に **大型「← もどる」ボタン**（ブラウザ戻るに頼らない）
- パンくずなし（階層浅いため不要）

## 6.9 アクセシビリティ実装

- セマンティックHTML（`<button>` `<table>` `<dialog>`）
- `aria-label` を全アイコンボタンに付与
- フォーカスリング: 4px 太の青枠（`outline: 4px solid #2563EB`）
- キーボード操作: Tab順序 論理的・Enterで主要操作
- スクリーンリーダー読上対応（マトリクスは `<th scope>` 適切設定）
- `prefers-reduced-motion` 尊重しアニメ短縮
- ズーム400%まで横スクロール無しでレイアウト保持

## 6.10 Tailwind 設定

```js
// tailwind.config.js
theme: {
  fontFamily: {
    sans: ['"Hiragino Kaku Gothic ProN"', '"Yu Gothic UI"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    sm:    ['1rem',     { lineHeight: '1.6' }],   // 16px
    base:  ['1.125rem', { lineHeight: '1.7' }],   // 18px
    lg:    ['1.375rem', { lineHeight: '1.5' }],   // 22px
    xl:    ['1.75rem',  { lineHeight: '1.3' }],   // 28px
    '2xl': ['2rem',     { lineHeight: '1.2' }],   // 32px
    score: ['2.5rem',   { lineHeight: '1.0' }],   // 40px
  },
  extend: {
    colors: {
      ink:     '#0F172A',
      sub:     '#1E293B',
      primary: '#1D4ED8',
      success: '#15803D',
      danger:  '#B91C1C',
      warning: '#B45309',
      line:    '#475569',
      bg:      '#F1F5F9',
      winBg:   '#DCFCE7',
      loseBg:  '#FEE2E2',
    },
    minHeight: { btn: '56px', input: '56px', cell: '64px' },
    minWidth:  { btn: '144px', cell: '64px' },
  },
}
```

ベースCSS（`src/styles/index.css`）:

```css
html {
  font-size: 18px;
} /* 既定大 */
html[data-fs="large"] {
  font-size: 20px;
}
html[data-fs="xlarge"] {
  font-size: 22px;
}

body {
  font-family: theme("fontFamily.sans");
  color: theme("colors.ink");
  background: #ffffff;
  font-variant-numeric: tabular-nums;
}

:focus-visible {
  outline: 4px solid #2563eb;
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
