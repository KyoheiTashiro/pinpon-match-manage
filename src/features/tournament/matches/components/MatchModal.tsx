import { ChevronDownIcon } from "@/components/icons";
import { Button, ConfirmModal } from "@/components/ui";
import type { Game } from "@/domain/match";
import {
  MATCH_PHASE,
  SIDE,
  gameScore,
  gameWinner,
  isGameEmpty,
  matchPhase,
  winsNeededForBestOf,
} from "@/domain/match";
import { padGames, trimTrailingEmptyGames } from "@/domain/matchGames";
import { sideName } from "@/domain/side";
import { FirstServerSelect } from "@/features/tournament/matches/components/FirstServerSelect";
import { ScoreboardScreen } from "@/features/tournament/scoreboard";
import type { Participant } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useId, useState } from "react";
import { createPortal } from "react-dom";

const VIEW = { LIST: "list", SCOREBOARD: "scoreboard", CONFIRM_DELETE: "confirmDelete" } as const;
type View = (typeof VIEW)[keyof typeof VIEW];

type Props = {
  matchId: string;
  participants: Record<string, Participant>;
  onClose: () => void;
};

export const MatchModal = ({ matchId, participants, onClose }: Props) => {
  const match = useAppStore((state) => state.matches[matchId]);
  const setGames = useAppStore((state) => state.setGames);
  const setFirstServer = useAppStore((state) => state.setFirstServer);
  const deleteMatch = useAppStore((state) => state.deleteMatch);
  const bestOf = useAppStore((state) =>
    match ? (state.tournaments[match.tournamentId]?.bestOf ?? 5) : 5,
  );
  const [view, setView] = useState<View>(VIEW.LIST);
  const titleId = useId();

  if (!match) return null;

  const wins = winsNeededForBestOf(bestOf);
  // ストアの値から毎回導出する（ローカルコピーを持つと別経路の更新で食い違う）
  const games = padGames(match.games, bestOf);
  const phase = matchPhase(games, wins);
  const leftName = sideName(match.left, participants);
  const rightName = sideName(match.right, participants);

  const persistGames = (next: Game[]) => setGames(match.id, trimTrailingEmptyGames(next));

  return createPortal(
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- オーバーレイ背景。内部にdialogを内包するためbutton要素にできない
      role="button"
      tabIndex={-1}
      aria-label="閉じる"
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-2 pb-28 sm:p-4 sm:pb-28"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") onClose();
      }}
    >
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="dialog" はランドマークだがstopPropagationが必要 */}
      <div
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ネイティブ<dialog>のshowModal挙動を避けcreatePortalで手動制御
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="border-line my-4 w-full max-w-2xl rounded-2xl border-4 bg-white p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-extrabold">
            試合の入力
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="border-line hover:bg-bg flex h-10 w-10 items-center justify-center rounded-lg border-2 bg-white text-2xl leading-none font-extrabold transition active:scale-95"
          >
            ×
          </button>
        </div>

        <FirstServerSelect
          leftName={leftName}
          rightName={rightName}
          value={match.firstServer}
          onChange={(side) => setFirstServer(match.id, side)}
        />

        <div className="mb-4">
          <Button variant="primary" className="w-full" onClick={() => setView(VIEW.SCOREBOARD)}>
            <span className="inline-flex items-center justify-center gap-2">
              <ChevronDownIcon className="-rotate-90" />
              スコアボードを開く
            </span>
          </Button>
        </div>

        <ul className="divide-line border-line mb-4 space-y-2 divide-y-2 overflow-hidden rounded-xl border-2">
          {games.map((game, gameIndex) => {
            const locked = phase.kind === MATCH_PHASE.DECIDED && gameIndex > phase.gameIndex;
            const empty = isGameEmpty(game);
            const winner = gameWinner(game);
            const { leftScore, rightScore } = gameScore(game);
            return (
              <li
                // oxlint-disable-next-line react/no-array-index-key -- ゲーム配列はbestOf固定長・順序不変
                key={gameIndex}
                className={`flex items-center justify-between px-3 py-2 ${
                  locked ? "bg-bg opacity-60" : "bg-white"
                }`}
              >
                <span className="px-3 py-1 text-base font-extrabold">ゲーム{gameIndex + 1}</span>
                <span className="text-xl font-extrabold tabular-nums">
                  {locked && empty ? (
                    <span className="text-sub text-base font-bold">入力不可</span>
                  ) : empty ? (
                    <span className="text-sub text-base font-bold">未入力</span>
                  ) : (
                    <>
                      <span className={winner === SIDE.LEFT ? "text-success" : ""}>
                        {leftScore}
                      </span>
                      <span className="text-sub mx-2">-</span>
                      <span className={winner === SIDE.RIGHT ? "text-success" : ""}>
                        {rightScore}
                      </span>
                      {!winner && <span className="text-sub ml-2 text-sm font-bold">(進行中)</span>}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="danger" onClick={() => setView(VIEW.CONFIRM_DELETE)}>
            試合結果を削除
          </Button>
        </div>
      </div>

      {view === VIEW.SCOREBOARD && (
        <ScoreboardScreen
          leftName={leftName}
          rightName={rightName}
          games={games}
          setGames={persistGames}
          winsNeeded={wins}
          matchFirstServer={match.firstServer}
          onBack={() => setView(VIEW.LIST)}
          onCloseAll={onClose}
        />
      )}

      <ConfirmModal
        open={view === VIEW.CONFIRM_DELETE}
        title="試合結果を削除"
        message="この試合結果を削除します。取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          // onClose を先に呼ぶ。deleteMatch で match が消えると本コンポーネントが
          // return null でアンマウントされ、以降の onClose 到達が保証されないため。
          onClose();
          deleteMatch(match.id);
        }}
        onCancel={() => setView(VIEW.LIST)}
      />
    </div>,
    document.body,
  );
};
