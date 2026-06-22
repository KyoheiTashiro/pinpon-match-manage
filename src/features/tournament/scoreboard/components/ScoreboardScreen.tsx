import { MatchResultView } from "@/features/tournament/scoreboard/components/MatchResultView";
import { ScoreboardHeader } from "@/features/tournament/scoreboard/components/ScoreboardHeader";
import { ScoreInputView } from "@/features/tournament/scoreboard/components/ScoreInputView";
import { useScoreboard, type UseScoreboardProps } from "@/features/tournament/scoreboard/hooks";
import { createPortal } from "react-dom";

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
        <MatchResultView {...matchResultProps} games={props.games} />
      ) : (
        <ScoreInputView {...scoreInputProps} />
      )}
    </div>,
    document.body,
  );
};
