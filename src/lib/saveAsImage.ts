import { toPng } from "html-to-image";

export const saveAsImage = async (node: HTMLElement, filename: string) => {
  const width = Math.max(node.scrollWidth, node.offsetWidth);
  const height = Math.max(node.scrollHeight, node.offsetHeight);
  const dataUrl = await toPng(node, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
    cacheBust: true,
    width,
    height,
    style: { width: `${width}px`, height: `${height}px` },
  });
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });

  const navigatorWithShare = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (navigatorWithShare.canShare?.({ files: [file] })) {
    try {
      await navigatorWithShare.share({ files: [file] } as ShareData);
      return;
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
