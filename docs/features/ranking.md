親: [SPEC.md](../../SPEC.md)

ルート: 順位タブ (`/#/t/:id`) — 大会参加者の勝敗集計と順位を表示する画面。

## 順位表

ソート基準（上から順に適用）:
1. 勝数（多い順）
2. ゲーム得失差（取ゲーム − 失ゲーム）
3. 点得失差（取点 − 失点）

表示列: 順位・名前・試合数・勝・敗・ゲーム得失・点得失

## 順位算出

各参加者ごとに集計:
```
wins, losses
gamesWon, gamesLost → gameDiff = won - lost
pointsFor, pointsAgainst → pointDiff = for - against
```
ソート: `[-wins, -gameDiff, -pointDiff, name]`

ダブルスはメンバー個人単位で集計（メンバー2人それぞれに勝敗加算）。
