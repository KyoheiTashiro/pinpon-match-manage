import { useRef, useState } from 'react';
import { saveAsImage } from './saveAsImage';

export const useImageCapture = (
  filenamePrefix: string,
  tournamentName: string | undefined,
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!ref.current || !tournamentName) return;
    setSaving(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await saveAsImage(
        ref.current,
        `${filenamePrefix}_${tournamentName}_${date}.png`,
      );
    } catch (e) {
      console.error(e);
      alert('画像の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  return { ref, saving, save };
};
