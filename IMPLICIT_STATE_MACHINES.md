# 暗黙の状態機械の洗い出し

調査日: 2026-11-11（コミット `9df9f18` 時点）。コードは変更していない。

フラグ・nullable・状態文字列の組み合わせで状態を表している箇所は 11 件あり、リスクは高 2 件、中 4 件、低 5 件に分かれた。高の 2 件はどちらも試合スコアの永続データに矛盾を書き込める。UI の一時状態は直近の整理でかなり片付いており、残っているものは到達しにくいか、到達しても害が小さい。

| #   | 対象                                 | リスク |
| --- | ------------------------------------ | ------ |
| 1   | ゲームのスコアと `pointLog`          | 高     |
| 2   | 試合の進行順と入力ロック             | 高     |
| 3   | 未対戦・途中・終了の判定基準         | 中     |
| 4   | 試合の side と大会形式               | 中     |
| 5   | インストールボタン                   | 中     |
| 6   | 試合モーダルの `games` コピー        | 中     |
| 7   | 参加者画面の編集・削除・履歴ピッカー | 低     |
| 8   | スコアボード画面の表示状態           | 低     |
| 9   | `currentTournamentId`                | 低     |
| 10  | Select の開閉とフォーカス位置        | 低     |
| 11  | 大会設定の編集とダイアログ           | 低     |

行番号はすべて `src/` 配下のファイルを指す。「到達手順」を書いた項目は、UI 操作だけで矛盾した状態を作れる。書いていない項目は、型とストアの API が許しているだけで、現在の UI からは到達しない。

## 高

### 1. ゲームのスコアと `pointLog`

- ファイル: `domain/match.ts`、`store/schema.ts`、`features/tournament/result/hooks.ts`、`test/seed.ts`
- 状態を構成する値: `Game.leftScore`、`Game.rightScore`、`Game.pointLog?: Side[]`（`domain/match.ts:9`）

同じ得点を、スコアの数値と得点履歴の二通りで持っている。想定されている状態は次の三つである。

- 空: 0-0、`pointLog` なし
- 履歴あり: スコアが `pointLog` の集計と一致する
- 履歴なし: スコアだけがある（`pointLog` 導入前のデータと、シードの直書きスコア）

加点は `addPointToGame` が履歴からスコアを再計算し、減点は `removePointFromGame` がスコアを直接 1 減らして履歴から該当要素を抜く。二つの関数で、どちらを正とするかが逆になっている。

許されている矛盾は `leftScore: 7, rightScore: 5, pointLog: undefined` への加点である。`domain/match.ts:72` が履歴を `[]` として扱い、73 行目が履歴の長さでスコアを上書きするため、7-5 が 1-0 になる。この形のゲームは `test/seed.ts:88` にあり、migrate は `pointLog` を補完しないので、導入前から残っている進行中の試合も同じ形をしている。

減点側にも穴がある。`domain/match.ts:79` はスコアを先に減らし、83 行目は履歴に該当 side があるときだけ履歴を縮める。履歴にない side を減点するとスコアだけが減り、次の加点で元の値に戻る。`store/schema.ts:14-18` は両者の一致を検証しないので、不一致のまま保存と復元を通過する。

- リスク: 高。履歴なしの進行中ゲームに限られるが、入力済みのスコアが 1 タップで消える
- 修正案: `Game` を `{ kind: "logged"; pointLog }` と `{ kind: "manual"; leftScore; rightScore }` の判別ユニオンにし、logged のスコアは履歴から派生させる

### 2. 試合の進行順と入力ロック

- ファイル: `features/tournament/scoreboard/hooks.ts`、`features/tournament/scoreboard/components/ScoreboardHeader.tsx`、`domain/matchGames.ts`、`domain/match.ts`、`store/slices/matchSlice.ts`
- 状態を構成する値: `Match.games` の並び、`gameIndex`、`lockedFromIndex`、`matchSummary().winner`

卓球の試合は「第 1 ゲーム進行中 → 第 1 ゲーム終了 → 第 2 ゲーム進行中 → … → 勝敗確定」と一方向に進む。コードはこの順序をどこにも持たず、ゲーム配列の中身から毎回導出している。しかも導出が二系統ある。`lockedGameStartIndex` は先頭から数えて規定勝数に届いた位置で止まり、`matchSummary` は全ゲームを数える。

到達手順（5 ゲームマッチ、3 勝で確定）:

1. スコアボードのヘッダで G4 を選び、左が 11-0 で取る。G5 も同様に取る
2. G1 を左が取る。ここで左 3 勝となり勝敗が確定する。ロック開始位置は 5 のままなので、G2 と G3 はまだ入力できる
3. G2 を左が取る。ロック開始位置が 4 に下がり、G5 は 11-0 を抱えたままロックされる

結果は、G3 が空のまま左 4 勝 0 敗である。順位表はこの 4 ゲームと G5 の得点を集計に含める（`domain/ranking.ts:58-61`）。

これを許している行は三つある。

- `ScoreboardHeader.tsx:62` — ゲーム切替の無効条件が `isLocked && empty` だけで、前のゲームが終わっているかを見ない
- `scoreboard/hooks.ts:134` — 加点のガードが `locked` だけで、勝敗確定後も非ロックのゲームに加点できる
- `domain/matchGames.ts:14` — ロック開始位置より前の空ゲームを残して保存する

終了済みゲームへの加点も止まらない。`scoreboard/hooks.ts:163` の `disableAdd: winner === side` は勝者側しか無効にしないので、11-5 で終わったゲームの敗者側に加点でき、11-10 まで進めると終了判定が外れる。後続ゲームに得点が入ったあとでも同じ操作ができ、G1 と G2 が同時に進行中になる。

ストア側には防波堤がない。`store/slices/matchSlice.ts:67` の `Object.assign(state.matches[id], patch)` は `Partial<Match>` を無検証で受け取り、`games` の形だけでなく `id` や `tournamentId` の書き換えも通す。

- リスク: 高。誤タップで順位表の勝数と得失点が狂い、画面上は正常な試合結果に見える
- 修正案: 進行を `phase(games, winsNeeded)` の純関数 1 本にまとめて `{ kind: "playing"; gameIndex } | { kind: "decided"; winner }` を返し、加点・ゲーム切替・保存をその結果で制限する。`updateMatch` は `setGames` と `setFirstServer` に分ける

## 中

### 3. 未対戦・途中・終了の判定基準

- ファイル: `features/tournament/matches/matchState.ts`、`features/tournament/matches/singles/hooks.ts`、`features/tournament/matches/doubles/DoublesList.tsx`、`features/tournament/matches/components/MatchMatrix.tsx`、`features/tournament/result/hooks.ts`、`domain/matchGames.ts`
- 状態を構成する値: `MATCH_STATE`（`unplayed` / `inProgress` / `won` / `lost`）を決める `hasScore`・`finished`・`match.games.length`

状態は「未対戦 → 途中 → 終了」の三つで、永続化せず毎回導出している。問題は「途中」の入口の基準が画面ごとに違うことである。

- リスト（シングルス）: `match.games.length > 0`（`singles/hooks.ts:85`）
- マトリクス: `match.games.length === 0` なら未対戦（`singles/hooks.ts:160`）
- リスト（ダブルス）: `match.games.length > 0`（`DoublesList.tsx:51`）
- 結果タブ: `realGames(match.games).length > 0`（`result/hooks.ts:85`）

到達手順: スコアボードで 1 点入れて、その 1 点を取り消す。`domain/matchGames.ts:14` はロック前の空ゲームを残すので、全ゲーム 0-0 の配列が長さ 5 で保存される。対戦表は「途中 0-0」を表示し、結果タブはこの試合を対戦なしとして扱う。

空ゲームの判定そのものも 4 か所に書かれている（`domain/match.ts:14`、`domain/matchGames.ts:4`、`ScoreboardHeader.tsx:54`、`MatchModal.tsx:111`）。

- リスク: 中。集計は壊れないが、同じ試合の状態が画面によって食い違う
- 修正案: `matchState(games, winsNeeded)` を `domain/` に 1 本置いて全画面で使い、空判定は `isGameEmpty` に寄せる

### 4. 試合の side と大会形式

- ファイル: `store/types.ts`、`store/schema.ts`、`store/slices/matchSlice.ts`、`features/tournament/matches/singles/hooks.ts`、`features/tournament/matches/doubles/schema.ts`、`domain/ranking.ts`
- 状態を構成する値: `Tournament.format`（`singles` / `doubles`）、`Match.leftSide.kind`、`Match.rightSide.kind`（`single` / `pair`）、各 side の参加者 ID

正しい組み合わせは、シングルス大会で両側 `single`、ダブルス大会で両側 `pair` の二つだけで、どちらも登場する参加者が全員異なり、大会の `participantIds` に含まれる。この不変条件を守っているのは画面側だけである。シングルスは `singles/hooks.ts:42-43` が常に `single` を渡し、ダブルスは `doubles/schema.ts:10` が 4 人の重複を弾く。

ストアは次の組み合わせをすべて受け入れる。

- 左が `single` で右が `pair`
- シングルス大会に `pair` 同士の試合
- 左右に同じ参加者
- 大会に所属しない参加者 ID

`store/slices/matchSlice.ts:47-54` は渡された side をそのまま試合に入れる。28 行目の重複検出も両側 `single` のときにしか働かない。読み込み時も同じで、`store/schema.ts:35-36` は左右を別々に検証し、`sanitizeAppState`（`schema.ts:83-123`）は side が指す参加者の存在を確認しない。

形式の合わない試合が混ざると、対戦表には出ず（`singles/hooks.ts:18` が読み飛ばす）、順位表には加算される（`domain/ranking.ts:49-50`）。

`addManualMatch` にはもう一つ穴がある。大会が存在しないとき、57 行目で保存をやめるのに 60 行目で ID を返す。呼び出し側はその ID でモーダルを開こうとし、`openMatchId` が存在しない試合を指したまま残る。

- リスク: 中。UI からは到達しないが、防いでいるのが画面側だけなので、インポート機能や新しい追加導線を足した時点で破れる
- 修正案: `Match` を `{ kind: "singles"; left: string; right: string } | { kind: "doubles"; left: [string, string]; right: [string, string] }` にし、`addManualMatch` で大会形式・重複・所属を検証する

### 5. インストールボタン

- ファイル: `features/home/components/InstallAppButton.tsx`
- 状態を構成する値: `deferred: BeforeInstallPromptEvent | null`（26 行目）、`installed: boolean`（28 行目）、`showGuide: boolean`（29 行目）、UA 判定の `isMobile()`

実際の状態は五つある。

- インストール済み: 何も描画しない
- プロンプト可: `deferred` あり。押すとブラウザのインストール確認が出る
- プロンプト表示中: `prompt()` の結果待ち
- 手順ガイド可: `deferred` なしのモバイル。押すと動画モーダルが開く
- 手段なし: `deferred` なしの PC

「手段なし」のときもボタンは描画される。52 行目は `installed` しか見ておらず、64 行目はモバイル以外で何もしない。`beforeinstallprompt` を発火しないデスクトップブラウザでは、押しても反応しないボタンが出続ける。

「プロンプト表示中」は値として存在しない。56-57 行目の `await` の間も `deferred` は残るので、もう一度押すと同じイベントの `prompt()` が二度呼ばれる。`prompt()` は 1 回しか呼べず、72 行目が `void` で結果を捨てているため、例外は未処理の Promise 拒否になる。

40-43 行目の `onInstalled` は `showGuide` を戻さないので、`installed: true` かつ `showGuide: true` も型の上では成立する。52 行目で描画が止まるため害はない。

- リスク: 中。データは壊れないが、反応しないボタンが利用者に見える
- 修正案: `status: "installed" | "promptable" | "prompting" | "guide" | "unavailable"` の単一ユニオンにし、`unavailable` ではボタンを描画しない

### 6. 試合モーダルの `games` コピー

- ファイル: `features/tournament/matches/components/MatchModal.tsx`、`features/tournament/matches/hooks.ts`
- 状態を構成する値: ローカルの `games`（33 行目）、ストアの `match.games`、`confirmDelete`（34 行目）、`scoreboardOpen`（35 行目）、親の `openMatchId`

モーダルは開いた時点で `match.games` を `bestOf` 長に引き伸ばしてローカルに持ち、以後は `persistGames`（45-49 行目）がローカルとストアへ別々の形で書く。ローカルは常に `bestOf` 個、ストアは末尾の空ゲームを落とした配列である。画面の状態は「一覧表示」「スコアボード表示」「削除確認」の三つを想定している。

33 行目の `useState` 初期化は一度しか走らないので、ストアの `match.games` が別経路で変わってもローカルは古いままになる。次の加点でローカルの内容がストアを上書きする。先攻（`firstServer`）は 42 行目でストアから直接読んでおり、同じ試合の二つの属性で正とする場所が違う。現在は試合を書き換える経路がこのモーダルしかないため、実害は出ていない。

`confirmDelete` と `scoreboardOpen` は独立した boolean で、両方 `true` を型が許す。スコアボードが全画面で削除ボタンを覆い、確認ダイアログは `showModal()` で最前面に出るので、UI からは同時に立たない。

`openMatchId` は試合の存在と連動していない。38 行目の `if (!match) return null` は描画をやめるだけで、親の `openMatchId` は消えた試合を指し続ける。

- リスク: 中。現状は無害だが、同期や取り消し機能を足すと古いコピーでストアを上書きする
- 修正案: ローカルの `games` をやめて `padGames(match.games, bestOf)` を描画時に導出し、画面の状態は `view: "list" | "scoreboard" | "confirmDelete"` にまとめる

## 低

### 7. 参加者画面の編集・削除・履歴ピッカー

- ファイル: `features/tournament/participants/hooks.ts`、`features/tournament/participants/index.tsx`
- 状態を構成する値: `editingId: string | null`（27 行目）、`removeTarget: string | null`（28 行目）、`pastSelected: Set<string> | null`（30 行目）

想定されている状態は「待機」「ある行を編集中」「ある行の削除確認中」「履歴から選択中」の四つで、同時には一つしか成り立たない。三つの nullable は独立しているので、型の上では 8 通りになる。

`askRemove`（59 行目）と `openPastPicker`（66 行目）は `editingId` を見ないため、A を編集中に B の削除確認を開く操作と、編集中に履歴ピッカーを開く操作は UI から実行できる。どちらも編集フォームが裏に残るだけで、データは壊れない。

`startEdit`（48-52 行目）は編集中でも別の行へ切り替え、入力途中の名前を確認なしで捨てる。編集フォームが 1 個を共有しているためである。

`doRemove`（60-63 行目）は `editingId` を戻さないので、削除した ID が `editingId` に残る組み合わせも型は許す。編集中の行には削除ボタンが出ないため（`index.tsx:75`）、UI からは到達しない。

- リスク: 低
- 修正案: `mode: { kind: "idle" } | { kind: "editing"; id } | { kind: "removing"; id } | { kind: "picking"; selected }` の単一ユニオンにする

### 8. スコアボード画面の表示状態

- ファイル: `features/tournament/scoreboard/hooks.ts`、`features/tournament/scoreboard/components/ScoreboardScreen.tsx`、`features/tournament/scoreboard/components/ScoreboardHeader.tsx`
- 状態を構成する値: `gameIndex`（96 行目）、`showResult`（98 行目）、派生の `showNextGameBtn`・`showResultBtn`・`showBackBtn`（124-126 行目）

画面は「入力中 → ゲーム終了（次へ進める） → 勝敗確定（結果を見られる） → 結果表示」と進む。右上のボタンは三つの boolean で出し分けており、同時に出るのは一つという前提で書かれている。

`showResult: true` かつ勝者なしの組み合わせでは、三つとも `false` になり右上に何も出ない。203 行目の `setShowResult(true)` は呼び出し側の状態を確認せず、`false` に戻す経路もない。結果表示中は入力欄とゲーム切替が描画されないので（`ScoreboardScreen.tsx:59`、`ScoreboardHeader.tsx:52`）、UI からは到達しない。

`gameIndex` は範囲を検証していない。193 行目が `setGameIndex` をそのまま公開し、103 行目の `games[gameIndex]` は `undefined` を許容する。150-151 行目が 0-0 にフォールバックするため、範囲外でも落ちずに空のゲームを表示する。

- リスク: 低
- 修正案: 右上のボタンを `action: "next" | "showResult" | "close" | null` の 1 値で導出し、`showResult` は勝者がいるときだけ立てる

### 9. `currentTournamentId`

- ファイル: `store/slices/tournamentSlice.ts`、`store/schema.ts`、`features/tournament/layout.tsx`
- 状態を構成する値: ストアの `currentTournamentId: string | null`、URL の `:tournamentId`

「いま開いている大会」をストアと URL の両方が持っている。画面は URL しか読まない（`layout.tsx:23-27`）。ストア側を読む画面はなく、書くのは作成時（`tournamentSlice.ts:45`）と削除時（67 行目）だけである。

大会 A を作り、続けて B を作ってから A を開くと、URL は A、`currentTournamentId` は B になる。大会を開く操作がストアを更新しないので、二つの値は最初の画面遷移で食い違う。`setCurrentTournament`（71-74 行目）は存在しない ID も受け取る。

- リスク: 低。読む側がいないので実害はない。ただし永続化されており、後から参照するコードを足すと古い値を掴む
- 修正案: フィールドと `setCurrentTournament` を削除する（スキーマ変更なので migrate の追加と `STORAGE_VERSION` の更新が要る）

### 10. Select の開閉とフォーカス位置

- ファイル: `components/ui/Select/Select.tsx`
- 状態を構成する値: `isOpen: boolean`（33 行目）、`focusedIndex: number`（34 行目、-1 はフォーカスなし）

状態は「閉」と「開（n 番目にフォーカス）」の二つである。`focusedIndex` は開いているときにしか意味を持たないのに、独立した値として生き続ける。

`close`（58-63 行目）は `focusedIndex` を戻さないので、`isOpen: false` かつ `focusedIndex: 3` が残る。開くたびに 54 行目が上書きするため、表示には影響しない。開いている間に `options` が減ると `focusedIndex` が範囲外を指すが、65-71 行目が選択肢の有無を確認して閉じるだけなので、誤った値は選ばれない。

- リスク: 低
- 修正案: Calendar と同じく reducer にし、`{ open: false } | { open: true; focused: number }` で持つ（`components/ui/Calendar/calendarReducer.ts` が前例）

### 11. 大会設定の編集とダイアログ

- ファイル: `features/tournament/settings/hooks.ts`、`features/tournament/settings/index.tsx`
- 状態を構成する値: `editing: boolean`（16 行目）、`dialog: "reset" | "delete" | null`（17 行目）

ダイアログ側はすでに排他的なユニオンになっている。残っているのは `editing` との組み合わせで、編集フォームを開いたまま削除ダイアログを出せる（`index.tsx:107`・`114` のボタンは `editing` を見ない）。そのまま削除すると、入力途中の大会名は確認なしで消える。削除後は画面ごとアンマウントされるので、矛盾した状態は残らない。

- リスク: 低
- 修正案: `mode: "view" | "editing" | "confirmReset" | "confirmDelete"` の 1 値にまとめる

## 対象外にしたもの

次の値は調べたうえで外した。

- 独立した boolean 1 個で完結するもの: ホームの `settingsOpen` と `creating`、`keepScreenOn`、画像保存の `saving`、`swapped`
- 親子で連動が取れているもの: 設定モーダルの `confirmReset`（閉じるときに必ず戻す、`SettingsModal.tsx:22-25`）
- すでに矛盾できない形になっているもの: Calendar（reducer 化済み）、結果タブの `resolvedParticipantId`（無効な ID を先頭の参加者へ読み替える、`result/hooks.ts:102-106`）、`ErrorBoundary` の `hasError` と `error`（常に同時に設定される）
- 永続化せず純関数で導出しているもの: 順位、勝敗、サーブ権
