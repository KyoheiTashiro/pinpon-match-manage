import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { matchSummary, SIDE } from "@/domain/match";
import { MatchModal } from "@/features/tournament/matrix/components/MatchModal";
import { SaveImageButton } from "@/features/tournament/matrix/components/SaveImageButton";
import { useDoublesMatrix, MIN_PLAYERS_DOUBLES } from "@/features/tournament/matrix/doubles/hooks";
import type { DoublesPairForm } from "@/features/tournament/matrix/doubles/schema";
import { sideName } from "@/features/tournament/matrix/hooks";
import { Controller } from "react-hook-form";

type FieldName = keyof DoublesPairForm;

const FIELD_LABELS: Record<FieldName, string> = { l1: "左1", l2: "左2", r1: "右1", r2: "右2" };
const LEFT_FIELDS: FieldName[] = ["l1", "l2"];
const RIGHT_FIELDS: FieldName[] = ["r1", "r2"];

export const DoublesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const {
    tournament,
    participants,
    matchList,
    players,
    wins,
    openMatchId,
    openMatch,
    closeMatch,
    pairForm,
    submit,
    ref,
    saving,
    save,
  } = useDoublesMatrix(tournamentId);
  const values = pairForm.watch();

  if (!tournament) return null;

  const renderField = (name: FieldName) => {
    const excluded = new Set(
      ([...LEFT_FIELDS, ...RIGHT_FIELDS] satisfies FieldName[])
        .filter((key) => key !== name)
        .map((key) => values[key])
        .filter(Boolean),
    );
    const options = players
      .filter((p) => !excluded.has(p.id))
      .map((p) => ({ value: p.id, label: p.name }));
    return (
      <Controller
        key={name}
        name={name}
        control={pairForm.control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={options}
            label={FIELD_LABELS[name]}
            placeholder="選んでください"
          />
        )}
      />
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>

      {players.length < MIN_PLAYERS_DOUBLES ? (
        <p className="text-sub">参加者を4人以上 登録してください。</p>
      ) : (
        <div className="border-primary space-y-3 rounded-2xl border-4 p-4">
          <h3 className="text-lg font-extrabold">試合を追加</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="font-bold">左ペア</span>
              {LEFT_FIELDS.map((name) => renderField(name))}
            </div>
            <div className="space-y-2">
              <span className="font-bold">右ペア</span>
              {RIGHT_FIELDS.map((name) => renderField(name))}
            </div>
          </div>
          <Button
            disabled={!pairForm.formState.isValid}
            onClick={() => {
              void submit();
            }}
          >
            試合を追加して入力へ
          </Button>
        </div>
      )}

      <div ref={ref} className="space-y-2 bg-white p-3">
        <div className="border-line border-b-2 pb-2">
          <div className="text-xl font-extrabold">{tournament.name}</div>
          <div className="text-sub text-sm">{tournament.date}</div>
        </div>
        <ul className="divide-line border-line divide-y-2 overflow-hidden rounded-2xl border-2">
          {matchList.length === 0 ? (
            <li className="text-sub p-4 text-base">まだ試合がありません。</li>
          ) : (
            matchList.map((match) => {
              const summary = matchSummary(match.games, wins);
              const inProgress = !summary.finished;
              const leftName = sideName(match.leftSide, participants);
              const rightName = sideName(match.rightSide, participants);
              return (
                <li key={match.id} className={inProgress ? "bg-warning/10" : ""}>
                  <button
                    onClick={() => openMatch(match.id)}
                    className="hover:bg-bg flex min-h-[64px] w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <span className="flex-1 text-lg font-bold">
                      {leftName} <span className="text-sub">対</span> {rightName}
                    </span>
                    <span className="flex flex-col items-end text-xl font-extrabold">
                      <span>
                        {summary.leftWins}-{summary.rightWins}
                      </span>
                      {summary.finished ? (
                        <span className="text-success text-sm">
                          {summary.winner === SIDE.LEFT ? leftName : rightName} の勝ち
                        </span>
                      ) : (
                        <span className="text-warning text-sm">途中</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {players.length >= MIN_PLAYERS_DOUBLES && matchList.length > 0 && (
        <SaveImageButton
          saving={saving}
          onSave={() => {
            void save();
          }}
        />
      )}

      {openMatchId && (
        <MatchModal matchId={openMatchId} participants={participants} onClose={closeMatch} />
      )}
    </div>
  );
};
