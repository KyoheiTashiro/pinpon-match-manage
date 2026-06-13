import { useEffect, useId, useRef } from "react";
import { BigButton } from "@/components/ui/BigButton";

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

export const ConfirmDialog = ({
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

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="閉じる"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") onCancel();
      }}
    >
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="dialog" はランドマークだがstopPropagationが必要 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white text-ink rounded-2xl p-6 max-w-md w-full border-4 border-line"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl font-extrabold mb-4">
          {title}
        </h2>
        <p className="text-base mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-4 justify-end flex-wrap">
          <BigButton ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </BigButton>
          <BigButton variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </BigButton>
        </div>
      </div>
    </div>
  );
};
