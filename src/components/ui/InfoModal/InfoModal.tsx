import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/hooks/useDialog";
import { useId, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children: ReactNode;
};

export const InfoModal = ({ open, title, onClose, closeLabel = "閉じる", children }: Props) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const dialogRef = useDialog({ open, initialFocusRef: closeRef });

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
      className="border-line text-ink m-auto w-full max-w-md rounded-2xl border-4 bg-white backdrop:bg-black/40"
    >
      <div className="p-6">
        <h2 id={titleId} className="mb-4 text-xl font-extrabold">
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
