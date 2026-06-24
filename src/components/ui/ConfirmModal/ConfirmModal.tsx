import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/hooks/useDialog";
import { useId, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "はい",
  cancelLabel = "いいえ",
  destructive,
  onConfirm,
  onCancel,
}: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const dialogRef = useDialog({ open, initialFocusRef: cancelRef });

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
          {title}
        </h2>
        <p className="mb-6 text-base leading-relaxed">{message}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
