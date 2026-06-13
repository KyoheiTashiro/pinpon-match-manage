import { useSyncExternalStore } from "react";

const PORTRAIT_QUERY = "(orientation: portrait) and (max-width: 900px)";

const subscribe = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(PORTRAIT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(PORTRAIT_QUERY).matches;

export const usePortrait = (): boolean => useSyncExternalStore(subscribe, getSnapshot);
