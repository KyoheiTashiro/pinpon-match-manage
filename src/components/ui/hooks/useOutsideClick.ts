import { useEffect, useRef, type RefObject } from "react";

// 外部イベント購読は本質的に effect が必要なため、ここに集約して
// 利用側コンポーネント本体からは effect を排除する。
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled: boolean,
): void => {
  // onOutside を毎レンダー張り替えず最新参照を保つ。
  const callbackRef = useRef(onOutside);
  callbackRef.current = onOutside;

  useEffect(() => {
    if (!enabled) return () => {};
    const handlePointerDown = (event: PointerEvent) => {
      const element = ref.current;
      if (element && event.target instanceof Node && !element.contains(event.target)) {
        callbackRef.current();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, enabled]);
};
