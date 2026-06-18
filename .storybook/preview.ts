import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css"; // Tailwind + アプリ全体スタイル

const preview: Preview = {
  parameters: {
    layout: "centered",
    // SB9+ の backgrounds は options オブジェクト + initialGlobals 形式。
    // アプリ実背景は白（src/styles/index.css の body background: #ffffff）。
    backgrounds: {
      options: {
        light: { name: "Light", value: "#ffffff" },
        dark: { name: "Dark", value: "#0f172a" },
      },
    },
    controls: { matchers: { color: /(background|color)$/iu, date: /Date$/u } },
    a11y: { test: "todo" },
  },
  initialGlobals: {
    backgrounds: { value: "light" },
  },
};

export default preview;
