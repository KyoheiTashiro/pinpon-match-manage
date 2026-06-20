import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  // VitePWA を除去（Storybook に Service Worker 不要・ビルド汚染防止）。
  // mergeConfig は配列を連結してしまうため、plugins は置換で上書きする。
  // PWA プラグインは複数の Plugin を入れ子配列で返すため flat してから除外。
  viteFinal: (cfg) => ({
    ...cfg,
    plugins: (cfg.plugins ?? []).flat(Infinity).filter((p) => {
      const plugin: unknown = p;
      const name =
        plugin && typeof plugin === "object" && "name" in plugin
          ? String((plugin as { name: unknown }).name)
          : "";
      return !name.includes("pwa");
    }),
  }),
};

export default config;
