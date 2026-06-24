親: [README.md](../README.md) / 関連: [ranking-overall.md](./ranking-overall.md) / [result-graph.md](./result-graph.md)

ルート: 結果タブ「個人」サブタブ (`/#/tournaments/:id/result`・HashRouter) — 選択した参加者の対戦結果一覧を表示する画面。**ダブルスではペアモード**。

結果タブ共通（サブタブUI・参加者選択ドロップダウン・画像保存・データフロー）は [ranking-overall.md](./ranking-overall.md) を参照。

実装: `src/features/tournament/result/components/PersonalMatchResults.tsx`

## 個人モード（ダブルスはペアモード）

`PersonalMatchResults` が選択した参加者の対戦結果を縦に並べる。

- 参加者選択ドロップダウンで選択した参加者（`resolvedParticipantId`）を「自分」として、その参加者が出場した全対戦を表示する。
- 各対戦カードは3カラム構成（自分 / ゲームスコア / 相手）:
  - 自分カラム: 勝者にトロフィーアイコン。ゲーム取得数を大型表示（`text-[3rem]`）。勝ちは `text-success`、それ以外は `text-sub`。
  - 中央カラム: ゲームごとの点数を縦に並べる（自分側スコア / 相手側スコア）。勝った側のスコアは `text-success`。
  - 相手カラム: 同上（相手視点）。
- 対戦がない場合は「データがありません」を表示する。
- 見出しは「{参加者名}さんの対戦結果」。
