import { MatchResultBoard } from "@/components/domain";
import { SIDE, isGameFinished } from "@/domain/match";
import type { Game } from "@/domain/match";
import { ScoreboardHeader } from "@/features/tournament/scoreboard/components/ScoreboardHeader";
import { ScoreInputView } from "@/features/tournament/scoreboard/components/ScoreInputView";
import { useScoreboard, type UseScoreboardProps } from "@/features/tournament/scoreboard/hooks";
import type { MatchResultProps } from "@/features/tournament/scoreboard/types";
import { createPortal } from "react-dom";

// 進行中/確定済みのゲームのみを抽出し swap を適用して結果ボード用 props に変換する。
const toResultBoardProps = (
  {
    leftName,
    rightName,
    leftWins,
    rightWins,
    matchWinner,
    swapped,
  }: Omit<MatchResultProps, "games">,
  games: Game[],
) => {
  const scoreGames = games
    .filter((game) => isGameFinished(game) || game.leftScore > 0 || game.rightScore > 0)
    .map((game) => {
      const leftScore = swapped ? game.rightScore : game.leftScore;
      const rightScore = swapped ? game.leftScore : game.rightScore;
      const finished = isGameFinished(game);
      return {
        leftScore,
        rightScore,
        leftWon: finished && leftScore > rightScore,
        rightWon: finished && rightScore > leftScore,
      };
    });
  return {
    left: { name: leftName, wins: leftWins, isWinner: matchWinner === SIDE.LEFT },
    right: { name: rightName, wins: rightWins, isWinner: matchWinner === SIDE.RIGHT },
    games: scoreGames,
  };
};

export const ScoreboardScreen = (props: UseScoreboardProps) => {
  const {
    gameIndex,
    setGameIndex,
    showResult,
    showNextGameBtn,
    showResultBtn,
    showBackBtn,
    nextGameIndex,
    isPortrait,
    scoreInputProps,
    matchResultProps,
    onBack,
    onShowResult,
    onCloseAll,
  } = useScoreboard(props);

  return createPortal(
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- フルスクリーンoverlay。stopPropagation必要
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ネイティブ<dialog>は不使用
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex flex-col overflow-x-hidden bg-blue-800 text-white select-none"
      style={{
        touchAction: "none",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <ScoreboardHeader
        games={props.games}
        gameIndex={gameIndex}
        setGameIndex={setGameIndex}
        lockedFromIndex={props.lockedFromIndex}
        showResult={showResult}
        showNextGameBtn={showNextGameBtn}
        showResultBtn={showResultBtn}
        showBackBtn={showBackBtn}
        nextGameIndex={nextGameIndex}
        onBack={onBack}
        onShowResult={onShowResult}
        onCloseAll={onCloseAll}
      />

      {isPortrait && (
        <div className="bg-amber-500 px-2 py-1 text-center text-sm leading-tight font-extrabold text-black">
          端末を横向きにしてください
          <span className="block text-xs font-bold">
            （画面の回転ロックがオンの場合は、解除してください）
          </span>
        </div>
      )}

      {showResult ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 py-6">
          <MatchResultBoard
            variant="scoreboard"
            {...toResultBoardProps(matchResultProps, props.games)}
          />
        </div>
      ) : (
        <ScoreInputView {...scoreInputProps} />
      )}
    </div>,
    document.body,
  );
};
