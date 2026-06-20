import type { Game, Side } from "@/domain/match";
import { MatchResultView } from "@/features/tournament/scoreboard/components/MatchResultView";
import { ScoreboardHeader } from "@/features/tournament/scoreboard/components/ScoreboardHeader";
import { ScoreInputView } from "@/features/tournament/scoreboard/components/ScoreInputView";
import { useScoreboard } from "@/features/tournament/scoreboard/hooks";
import { createPortal } from "react-dom";

type Props = {
  leftName: string;
  rightName: string;
  games: Game[];
  setGames: (games: Game[]) => void;
  lockedFromIndex: number;
  initialGameIndex: number;
  winsNeeded: number;
  matchFirstServer: Side;
  onBack: () => void;
  onCloseAll?: () => void;
};

export const ScoreboardScreen = (props: Props) => {
  const {
    gameIndex,
    setGameIndex,
    swapped,
    isPortrait,
    display,
    locked,
    nextGameIndex,
    showNextGameBtn,
    showResultBtn,
    showBackBtn,
    showResult,
    canSubLeft,
    canSubRight,
    onSwap,
    onShowResult,
    onAddLeft,
    onSubLeft,
    onAddRight,
    onSubRight,
    onBack,
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
        <MatchResultView
          leftName={display.leftName}
          rightName={display.rightName}
          leftWins={display.leftWins}
          rightWins={display.rightWins}
          matchWinner={display.matchWinner}
          games={props.games}
          swapped={swapped}
        />
      ) : (
        <ScoreInputView
          leftName={display.leftName}
          rightName={display.rightName}
          leftScore={display.leftScore}
          rightScore={display.rightScore}
          leftWins={display.leftWins}
          rightWins={display.rightWins}
          winner={display.winner}
          matchWinner={display.matchWinner}
          leftMatchPoint={display.leftMatchPoint}
          rightMatchPoint={display.rightMatchPoint}
          server={display.server}
          locked={locked}
          swapped={swapped}
          onSwap={onSwap}
          onAddLeft={onAddLeft}
          onSubLeft={onSubLeft}
          onAddRight={onAddRight}
          onSubRight={onSubRight}
          canSubLeft={canSubLeft}
          canSubRight={canSubRight}
        />
      )}
    </div>,
    document.body,
  );
};
