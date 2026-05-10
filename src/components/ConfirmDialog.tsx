import { useEffect, useRef } from 'react';
import { BigButton } from './BigButton';

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
  confirmLabel = 'はい',
  cancelLabel = 'いいえ',
  destructive,
  onConfirm,
  onCancel,
}: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-line"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-extrabold mb-4">
          {title}
        </h2>
        <p className="text-base mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-4 justify-end flex-wrap">
          <BigButton ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </BigButton>
          <BigButton
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </BigButton>
        </div>
      </div>
    </div>
  );
};
