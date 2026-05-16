import { useEffect, useState } from 'react';

export const usePortrait = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait) and (max-width: 900px)');
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isPortrait;
};
