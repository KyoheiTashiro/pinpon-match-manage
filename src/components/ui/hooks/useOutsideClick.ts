import { useEffect, useEffectEvent, type RefObject } from "react";

// 外部イベント購読は本質的に effect が必要なため、ここに集約して
// 利用側コンポーネント本体からは effect を排除する。
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled: boolean,
): void => {
  // onOutside を deps に含めず最新参照で呼ぶ（毎レンダーのリスナー張り替えを回避）。
  const onOutsideEvent = useEffectEvent(onOutside);

  useEffect(() => {
    if (!enabled) return () => {};
    const handlePointerDown = (event: PointerEvent) => {
      const element = ref.current;
      if (element && event.target instanceof Node && !element.contains(event.target)) {
        onOutsideEvent();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, enabled]);
};
