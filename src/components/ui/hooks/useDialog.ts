import { useEffect, useRef, type RefObject } from "react";

type Options = {
  open: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

// ネイティブ <dialog> の showModal()/close() を open prop に同期する。
// マウント後の命令的 API 呼び出しが必須なため、ここでのみ useEffect を許容する
// （各モーダルコンポーネント本体からは effect を排除する）。
export const useDialog = ({
  open,
  initialFocusRef,
}: Options): RefObject<HTMLDialogElement | null> => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  return dialogRef;
};
