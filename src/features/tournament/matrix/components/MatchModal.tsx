import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Game, Side } from "@/domain/match";
import { SIDE, isGameFinished, gameWinner, winsNeededForBestOf } from "@/domain/match";
import {
  padGames,
  trimTrailingEmptyGames,
  lockedGameStartIndex,
  firstPlayableGameIndex,
} from "@/domain/matchGames";
import { ScoreboardScreen } from "@/features/tournament/matrix/components/scoreboard/ScoreboardScreen";
import type { Match, Participant } from "@/store/types";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  matchId: string;
  participants: Record<string, Participant>;
  onClose: () => void;
};

const sideLabel = (side: Match["leftSide"], participants: Record<string, Participant>) => {
  if (side.kind === SIDE_KIND.SINGLE) return participants[side.participantId]?.name ?? "?";
  return side.memberIds.map((id) => participants[id]?.name ?? "?").join(" / ");
};

export const MatchModal = ({ matchId, participants, onClose }: Props) => {
  const match = useAppStore((state) => state.matches[matchId]);
  const updateMatch = useAppStore((state) => state.updateMatch);
  const deleteMatch = useAppStore((state) => state.deleteMatch);
  const bestOf = useAppStore((state) => (match ? state.tournaments[match.tournamentId].bestOf : 5));
  const wins = winsNeededForBestOf(bestOf);
  const [games, setGames] = useState<Game[]>(() => padGames(match?.games ?? [], bestOf));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!match) onClose();
  }, [match, onClose]);

  if (!match) return null;

  const firstServer: Side = match.firstServer;
  const lockedFromIndex = lockedGameStartIndex(games, wins, bestOf);

  const persistGames = (next: Game[]) => {
    setGames(next);
    const lockedStartIndex = lockedGameStartIndex(next, wins, bestOf);
    updateMatch(match.id, { games: trimTrailingEmptyGames(next, lockedStartIndex) });
  };

  const setFirstServer = (side: Side) => {
    updateMatch(match.id, { firstServer: side });
  };

  return createPortal(
    <div
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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="my-4 w-full max-w-2xl rounded-2xl border-4 border-line bg-white p-4 sm:p-6"
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
            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-line bg-white text-2xl font-extrabold leading-none transition hover:bg-bg active:scale-95"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-center text-2xl font-extrabold">
          {sideLabel(match.leftSide, participants)}
          <span className="mx-3 text-line">対</span>
          {sideLabel(match.rightSide, participants)}
        </div>

        <fieldset className="mb-4 rounded-xl border-2 border-line p-3">
          <legend className="px-2 font-bold">最初のサーブ</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {([SIDE.LEFT, SIDE.RIGHT] as Side[]).map((side) => {
              const name = sideLabel(
                side === SIDE.LEFT ? match.leftSide : match.rightSide,
                participants,
              );
              return (
                <label
                  key={side}
                  className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 ${
                    firstServer === side ? "border-orange-500 bg-orange-50" : "border-line bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="first-server"
                    value={side}
                    checked={firstServer === side}
                    onChange={() => setFirstServer(side)}
                    aria-label={`最初のサーブ: ${name}`}
                    className="h-5 w-5 accent-orange-500"
                  />
                  <span className="font-bold">{name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mb-4">
          <Button variant="primary" className="w-full" onClick={() => setScoreboardOpen(true)}>
            <span className="inline-flex items-center justify-center gap-2">
              <ChevronDownIcon className="-rotate-90" />
              スコアボードを開く
            </span>
          </Button>
        </div>

        <ul className="mb-4 space-y-2 divide-y-2 divide-line overflow-hidden rounded-xl border-2 border-line">
          {games.map((game, gameIndex) => {
            const locked = gameIndex >= lockedFromIndex;
            const empty = game.leftScore === 0 && game.rightScore === 0;
            const winner = gameWinner(game);
            return (
              <li
                key={gameIndex}
                className={`flex items-center justify-between px-3 py-2 ${
                  locked ? "bg-bg opacity-60" : "bg-white"
                }`}
              >
                <span className="px-3 py-1 text-base font-extrabold">ゲーム{gameIndex + 1}</span>
                <span className="text-xl font-extrabold tabular-nums">
                  {locked && empty ? (
                    <span className="text-base font-bold text-sub">入力不可</span>
                  ) : empty ? (
                    <span className="text-base font-bold text-sub">未入力</span>
                  ) : (
                    <>
                      <span className={winner === SIDE.LEFT ? "text-success" : ""}>
                        {game.leftScore}
                      </span>
                      <span className="mx-2 text-sub">-</span>
                      <span className={winner === SIDE.RIGHT ? "text-success" : ""}>
                        {game.rightScore}
                      </span>
                      {!winner && !empty && !isGameFinished(game) && (
                        <span className="ml-2 text-sm font-bold text-sub">(進行中)</span>
                      )}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            試合結果を削除
          </Button>
        </div>
      </div>

      {scoreboardOpen && (
        <ScoreboardScreen
          leftName={sideLabel(match.leftSide, participants)}
          rightName={sideLabel(match.rightSide, participants)}
          games={games}
          setGames={persistGames}
          lockedFromIndex={lockedFromIndex}
          winsNeeded={wins}
          matchFirstServer={firstServer}
          initialGameIndex={firstPlayableGameIndex(games, lockedFromIndex, bestOf)}
          onBack={() => setScoreboardOpen(false)}
          onCloseAll={onClose}
        />
      )}

      <ConfirmModal
        open={confirmDelete}
        title="試合結果を削除"
        message="この試合結果を削除します。取り消せません。"
        confirmLabel="削除する"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          deleteMatch(match.id);
          setConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>,
    document.body,
  );
};
