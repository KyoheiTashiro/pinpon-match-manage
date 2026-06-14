/** ルーティング定数。App.tsx の <Route> と navigate/NavLink/useParams の文字列ズレを防ぐ。 */

/** URL パラメータのキー。 */
export const ROUTE_PARAM = {
  TOURNAMENT_ID: "tournamentId",
} as const;

/** 大会内タブのパス(相対)。 */
export const TAB_PATH = {
  PARTICIPANTS: "participants",
  MATRIX: "matrix",
  RESULT: "result",
  SETTINGS: "settings",
} as const;
export type TabPath = (typeof TAB_PATH)[keyof typeof TAB_PATH];

/** ルートパス定義。 */
export const ROUTES = {
  HOME: "/",
  TOURNAMENT: `/tournaments/:${ROUTE_PARAM.TOURNAMENT_ID}`,
  NOT_FOUND: "*",
} as const;

/** 大会タブへの絶対パスを生成する。 */
export const tournamentPath = (
  tournamentId: string,
  tab: TabPath = TAB_PATH.PARTICIPANTS,
): string => `/tournaments/${tournamentId}/${tab}`;
