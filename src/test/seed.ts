import {
  addPointToGame,
  opposite,
  SIDE,
  winsNeededForBestOf,
  type Game,
  type Side,
} from "@/domain/match";
import { sanitizeAppState } from "@/store/schema";
import {
  FONT_SIZE,
  FORMAT,
  SIDE_KIND,
  type AppState,
  type BestOf,
  type Format,
  type Match,
  type MatchSide,
  type Participant,
  type Tournament,
} from "@/store/types";
import { makeMatch, makeParticipant, makeTournament } from "@/test/factories";

// seedデータ生成 — dev:seed 用。VITE_SEED 時のみ seedInject.ts から呼ばれる。
// シングルス・ダブルス各 bestOf 3/5/7 を網羅(計6大会)。各大会: 完了2件・進行中1件・未着手1件。

// pointLog の配列から addPointToGame を逐次適用して Game を組む
const buildGameFromLog = (log: Side[]): Game =>
  log.reduce<Game>((built, side) => addPointToGame(built, side), { leftScore: 0, rightScore: 0 });

// 11点先取(loserScore は 0〜9)。winner/loser を交互に加点した自然なログ。
const finishedLog = (winner: Side, loserScore: number): Side[] => {
  const loser = opposite(winner);
  const log: Side[] = [];
  let w = 0;
  let l = 0;
  while (w < 11 || l < loserScore) {
    if (l < loserScore && l <= w) {
      log.push(loser);
      l++;
    } else if (w < 11) {
      log.push(winner);
      w++;
    } else {
      log.push(loser);
      l++;
    }
  }
  return log;
};

// デュースゲーム(12-10): 10-10 まで交互 → winner 2点連取
const deuceLog = (winner: Side): Side[] => {
  const loser = opposite(winner);
  return [...Array.from<Side>({ length: 10 }).flatMap(() => [winner, loser]), winner, winner];
};
// 完了ゲームのスコア(pointLog なし)。winner が 11、loser が loserScore。
const scoreGame = (winner: Side, loserScore: number): Game =>
  winner === SIDE.LEFT
    ? { leftScore: 11, rightScore: loserScore }
    : { leftScore: loserScore, rightScore: 11 };

// 完了試合のゲーム勝者パターン。winner が winsNeeded 勝ち / loser が loserWins 勝ち。
// 最終ゲームは必ず winner(そこで試合決着)。loser の勝ちは前半に分散。
const winPattern = (winsNeeded: number, loserWins: number): Array<"W" | "L"> => {
  const total = winsNeeded + loserWins;
  const results: Array<"W" | "L"> = Array.from({ length: total }, () => "W");
  let placed = 0;
  for (let index = 1; index < total - 1 && placed < loserWins; index += 2) {
    results[index] = "L";
    placed++;
  }
  for (let index = 0; index < total - 1 && placed < loserWins; index++) {
    if (results[index] === "W") {
      results[index] = "L";
      placed++;
    }
  }
  return results;
};

const LOSER_SCORES = [7, 9, 5, 8, 6];

// 完了試合のゲーム列を生成。
// withLog=true で pointLog 付き。deuceLast=true で最終ゲームをデュース(12-10)に。
const completedGames = (
  winner: Side,
  winsNeeded: number,
  loserWins: number,
  withLog: boolean,
  deuceLast = false,
): Game[] => {
  const pattern = winPattern(winsNeeded, loserWins);
  return pattern.map((result, index) => {
    const side = result === "W" ? winner : opposite(winner);
    const isLast = index === pattern.length - 1;
    if (deuceLast && isLast) return buildGameFromLog(deuceLog(side));
    const loserScore = LOSER_SCORES[index % LOSER_SCORES.length];
    return withLog ? buildGameFromLog(finishedLog(side, loserScore)) : scoreGame(side, loserScore);
  });
};

// 進行中試合: 1ゲーム完了(右 11-9) + 1ゲーム途中(7-5)
const inProgressGames = (): Game[] => [scoreGame(SIDE.RIGHT, 9), { leftScore: 7, rightScore: 5 }];

// 選手名プール — 大会ごとに offset でずらして割り当てる(重複は許容)。
const NAME_POOL =
  "田中 太郎,鈴木 花子,佐藤 一郎,山田 次郎,伊藤 美穂,渡辺 健太,小林 さくら,中村 剛,青木 拓也,高橋 陽子,松本 慎一,井上 奈々,木村 大輔,林 由美,清水 浩二,山口 恵,斎藤 隆,近藤 真理,石川 亮,森田 楓,藤田 圭,岡田 彩,中島 健,原 千夏".split(
    ",",
  );

const AFFILIATIONS = ["卓球クラブA", "市民体育館", "大学OB会", "卓球クラブB", "卓球クラブC"];

type Player = { name: string; affiliation?: string };

// offset から count 名を取り出す。偶数番目に所属を付与。
const playersFor = (offset: number, count: number): Player[] =>
  Array.from({ length: count }, (_, index) => {
    const poolIndex = (offset + index) % NAME_POOL.length;
    return index % 2 === 0
      ? { name: NAME_POOL[poolIndex], affiliation: AFFILIATIONS[poolIndex % AFFILIATIONS.length] }
      : { name: NAME_POOL[poolIndex] };
  });

// 大会ビルダー — 1大会分の Tournament / Participant[] / Match[] を生成。
type TournamentSpec = {
  id: string;
  prefix: string; // 選手ID/試合IDの接頭辞 (例: "s5" → p-s51, m-s51)
  name: string;
  format: Format;
  bestOf: BestOf;
  date: string;
  createdAt: string;
  players: Player[];
};

type BuiltTournament = {
  tournament: Tournament;
  participants: Participant[];
  matches: Match[];
};

const sideOf = (format: Format, ids: string[]): MatchSide =>
  format === FORMAT.SINGLES
    ? { kind: SIDE_KIND.SINGLE, participantId: ids[0] }
    : { kind: SIDE_KIND.PAIR, memberIds: [ids[0], ids[1]] };

const buildTournament = (spec: TournamentSpec): BuiltTournament => {
  const winsNeeded = winsNeededForBestOf(spec.bestOf);
  const pIds = spec.players.map((_, index) => `p-${spec.prefix}${index + 1}`);

  const participants = spec.players.map((player, index) =>
    makeParticipant({
      id: pIds[index],
      tournamentId: spec.id,
      name: player.name,
      ...(player.affiliation ? { affiliation: player.affiliation } : {}),
    }),
  );

  const tournament = makeTournament({
    id: spec.id,
    name: spec.name,
    format: spec.format,
    bestOf: spec.bestOf,
    date: spec.date,
    createdAt: spec.createdAt,
    participantIds: pIds,
  });

  // チーム = シングルス1名 / ダブルス2名 ずつのID組。各大会4チーム。
  const teamSize = spec.format === FORMAT.SINGLES ? 1 : 2;
  const teams: string[][] = [];
  for (let index = 0; index + teamSize <= pIds.length; index += teamSize) {
    teams.push(pIds.slice(index, index + teamSize));
  }

  const buildMatch = (matchNumber: number, left: string[], right: string[], games: Game[]): Match =>
    makeMatch({
      id: `m-${spec.prefix}${matchNumber}`,
      tournamentId: spec.id,
      leftSide: sideOf(spec.format, left),
      rightSide: sideOf(spec.format, right),
      firstServer: SIDE.LEFT,
      games,
    });

  const matches: Match[] = [
    // 【完了①】pointLog付き。左 winsNeeded-0(ストレート)。最終ゲームはデュース。
    buildMatch(1, teams[0], teams[1], completedGames(SIDE.LEFT, winsNeeded, 0, true, true)),
    // 【完了②】スコア直書き。右 winsNeeded-(winsNeeded-1) のフルゲーム接戦。
    buildMatch(
      2,
      teams[2],
      teams[3],
      completedGames(SIDE.RIGHT, winsNeeded, winsNeeded - 1, false),
    ),
    // 【進行中】1ゲーム完了 + 1ゲーム途中。
    buildMatch(3, teams[0], teams[2], inProgressGames()),
    // 【未着手】
    buildMatch(4, teams[1], teams[3], []),
  ];

  return { tournament, participants, matches };
};

// 大会定義 — シングルス3 + ダブルス3 (bestOf 3/5/7 を各 format で網羅)
const SPECS: TournamentSpec[] = [
  {
    id: "t-s3",
    prefix: "s3",
    name: "夏季シングルス大会(3ゲーム制)",
    format: FORMAT.SINGLES,
    bestOf: 3,
    date: "2026-07-20",
    createdAt: "2026-06-15T09:00:00.000Z",
    players: playersFor(0, 4),
  },
  {
    id: "t-s5",
    prefix: "s5",
    name: "春季シングルス大会(5ゲーム制)",
    format: FORMAT.SINGLES,
    bestOf: 5,
    date: "2026-04-05",
    createdAt: "2026-03-01T09:00:00.000Z",
    players: playersFor(4, 4),
  },
  {
    id: "t-s7",
    prefix: "s7",
    name: "秋季シングルス大会(7ゲーム制)",
    format: FORMAT.SINGLES,
    bestOf: 7,
    date: "2026-10-12",
    createdAt: "2026-09-01T09:00:00.000Z",
    players: playersFor(8, 4),
  },
  {
    id: "t-d3",
    prefix: "d3",
    name: "春季ダブルス大会(3ゲーム制)",
    format: FORMAT.DOUBLES,
    bestOf: 3,
    date: "2026-04-19",
    createdAt: "2026-03-15T09:00:00.000Z",
    players: playersFor(12, 8),
  },
  {
    id: "t-d5",
    prefix: "d5",
    name: "夏季ダブルス大会(5ゲーム制)",
    format: FORMAT.DOUBLES,
    bestOf: 5,
    date: "2026-08-09",
    createdAt: "2026-07-01T09:00:00.000Z",
    players: playersFor(16, 8),
  },
  {
    id: "t-d7",
    prefix: "d7",
    name: "秋季ダブルス大会(7ゲーム制)",
    format: FORMAT.DOUBLES,
    bestOf: 7,
    date: "2026-11-23",
    createdAt: "2026-10-15T09:00:00.000Z",
    players: playersFor(20, 8),
  },
];

// ---------------------------------------------------------------------------
// AppState 組み立て
// ---------------------------------------------------------------------------

/**
 * テスト・開発用のseedデータを生成する。
 * シングルス・ダブルスそれぞれ bestOf 3/5/7 を網羅した計6大会。
 * 各大会: 選手(シングルス4名 / ダブルス8名)・試合4件(完了2・進行中1・未着手1)。
 * sanitizeAppState を通して参照整合性を保証してから返す。
 */
export const buildSeedState = (): AppState => {
  const built = SPECS.map((spec) => buildTournament(spec));

  const tournaments = built.map((tournament) => tournament.tournament);
  const participants = built.flatMap((tournament) => tournament.participants);
  const matches = built.flatMap((tournament) => tournament.matches);

  const state: AppState = {
    tournaments: Object.fromEntries(tournaments.map((tournament) => [tournament.id, tournament])),
    participants: Object.fromEntries(
      participants.map((participant) => [participant.id, participant]),
    ),
    matches: Object.fromEntries(matches.map((match) => [match.id, match])),
    currentTournamentId: "t-s5",
    fontSize: FONT_SIZE.NORMAL,
  };

  // 参照整合性を最終チェック
  return sanitizeAppState(state);
};
