import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useEffect, useId, useRef } from "react";

type Candidate = {
  name: string;
  alreadyAdded: boolean;
};

type Props = {
  open: boolean;
  candidates: Candidate[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const PastParticipantModal = ({
  open,
  candidates,
  selected,
  onToggle,
  onConfirm,
  onCancel,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    // backdrop クリックで閉じる。Esc は onCancel で担保済み。
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      className="border-line text-ink m-auto w-full max-w-md rounded-2xl border-4 bg-white backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id={titleId} className="mb-4 text-xl font-extrabold">
          履歴から追加
        </h2>
        {candidates.length === 0 ? (
          <p className="text-sub mb-6 text-base">過去の参加者がいません。</p>
        ) : (
          <ul className="divide-line border-line mb-6 max-h-64 divide-y-2 overflow-y-auto rounded-xl border-2">
            {candidates.map((candidate) => (
              <li key={candidate.name} className="flex items-center gap-3 px-3 py-2">
                <input
                  type="checkbox"
                  id={`past-${candidate.name}`}
                  checked={candidate.alreadyAdded || selected.has(candidate.name)}
                  disabled={candidate.alreadyAdded}
                  onChange={() => onToggle(candidate.name)}
                  className="accent-primary h-5 w-5 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`past-${candidate.name}`}
                  className={`flex flex-1 items-center gap-2 text-base font-bold ${candidate.alreadyAdded ? "text-sub cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {candidate.name}
                  {candidate.alreadyAdded && (
                    <Badge size="sm" tone="primary" appearance="solid">
                      追加済
                    </Badge>
                  )}
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            やめる
          </Button>
          <Button onClick={onConfirm} disabled={selected.size === 0}>
            追加
          </Button>
        </div>
      </div>
    </dialog>
  );
};
