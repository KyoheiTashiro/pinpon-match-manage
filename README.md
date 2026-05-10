# ピンポン対戦管理 (pinpon-match-manage)

卓球の総当たり戦の対戦結果を管理するWebアプリ。シングルス/ダブルス対応・LocalStorage保存・PWA対応・GitHub Pagesホスティング。

## セットアップ

```bash
npm install
npm run dev          # 開発サーバ
npm run build        # ビルド (dist/)
npm run preview      # ビルド成果物をローカル起動
npm run test         # ドメインユニットテスト
```

## デプロイ (GitHub Pages)

1. リポジトリ名を `pinpon-match-manage` で作成（別名なら `vite.config.ts` の `base` と manifest 内 `start_url`/`scope`、`index.html` の icon パスを変更）
2. GitHub の Settings → Pages → Source を **GitHub Actions** に設定
3. `main` push で自動デプロイ → `https://<user>.github.io/pinpon-match-manage/`

## 仕様

詳細は [`SPEC.md`](./SPEC.md) 参照。

- 11点3ゲーム先取・最大5ゲーム・デュース2点差
- 順位: 勝数 → ゲーム得失 → 点得失
- 高齢者向けUI（本文18px・ボタン56px・コントラスト7:1）
- PWA: ホーム画面追加可・完全オフライン動作
