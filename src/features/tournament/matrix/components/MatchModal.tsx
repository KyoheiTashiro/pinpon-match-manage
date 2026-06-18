import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Game, Side } from "@/domain/match";
import { SIDE, gameWinner, isGameFinished, winsNeededForBestOf } from "@/domain/match";
import {
  padGames,
  trimTrailingEmptyGames,
  lockedGameStartIndex,
  firstPlayableGameIndex,
} from "@/domain/matchGames";
import { FirstServerSelect } from "@/features/tournament/matrix/components/FirstServerSelect";
import { sideName } from "@/features/tournament/matrix/hooks";
import { ScoreboardScreen } from "@/features/tournament/scoreboard";
import type { Participant } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  matchId: string;
  participants: Record<string, Participant>;
  onClose: () => void;
};

export const MatchModal = ({ matchId, participants, onClose }: Props) => {
  const match = useAppStore((state) => state.matches[matchId]);
  const updateMatch = useAppStore((state) => state.updateMatch);
  const deleteMatch = useAppStore((state) => state.deleteMatch);
  const bestOf = useAppStore((state) =>
    match ? (state.tournaments[match.tournamentId]?.bestOf ?? 5) : 5,
  );
  const wins = winsNeededForBestOf(bestOf);
  const [games, setGames] = useState<Game[]>(() => padGames(match?.games ?? [], bestOf));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!match) onClose();
  }, [match, onClose]);

  if (!match) return null;

  const leftName = sideName(match.leftSide, participants);
  const rightName = sideName(match.rightSide, participants);
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
          {leftName}
          <span className="mx-3 text-line">対</span>
          {rightName}
        </div>

        <FirstServerSelect
          leftName={leftName}
          rightName={rightName}
          value={firstServer}
          onChange={setFirstServer}
        />

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
                // oxlint-disable-next-line react/no-array-index-key -- ゲーム配列はbestOf固定長・順序不変
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
          leftName={leftName}
          rightName={rightName}
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
