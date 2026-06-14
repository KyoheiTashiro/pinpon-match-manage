import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children: ReactNode;
};

export const InfoModal = ({ open, title, onClose, closeLabel = "閉じる", children }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      closeRef.current?.focus();
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
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-w-md w-full bg-white text-ink rounded-2xl border-4 border-line backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-xl font-extrabold mb-4">
          {title}
        </h2>
        {children}
        <div className="mt-6 flex justify-end">
          <Button ref={closeRef} variant="primary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
