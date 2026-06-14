/** 卓球(ITTF)のスコアルール定数。domain の純粋関数が参照する。 */

/** 1ゲーム取得に必要な最低得点。 */
export const GAME_POINT = 11;

/** ゲーム成立に必要な最小リード差(2点差ルール)。 */
export const WIN_DIFF = 2;

/** デュース(両者の合計得点がこの値以上で2点差まで継続)に入る合計得点の閾値。 */
export const DEUCE_FROM = 20;

/** デュース前のサーブ交代間隔(得点数)。 */
export const SERVE_SWITCH_EVERY = 2;

/** デュース以降は1点ごとにサーブ交代。その基準となる交代回数。 */
export const DEUCE_SERVE_BASE = 10;
