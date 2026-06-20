// oxfmt はロックファイル等を内部 ignore で除外する。
// lint-staged が除外対象しか含まないファイル集合を oxfmt に渡すと
// 「Expected at least one target file」でエラー終了するため、
// oxfmt が無視するファイルをここで事前に除外する。
const OXFMT_IGNORED = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock|bun\.lockb)$/;

// oxlint は .oxlintrc.json の ignorePatterns で *.config.{ts,js} を除外している。
// lint-staged が config ファイルのみを渡すと「No files found」でエラー終了するため除外する。
const OXLINT_IGNORED = /(^|\/)([^/]+\.config\.[tj]s|\.lintstagedrc\.mjs)$/;

const stripIgnored = (files) => files.filter((f) => !OXFMT_IGNORED.test(f));
const stripOxlintIgnored = (files) => files.filter((f) => !OXLINT_IGNORED.test(f));

export default {
  "*.{js,jsx,ts,tsx}": (files) => {
    const targets = stripIgnored(files);
    if (targets.length === 0) return [];
    const oxlintTargets = stripOxlintIgnored(targets);
    const list = targets.join(" ");
    const cmds = [];
    if (oxlintTargets.length > 0) cmds.push(`oxlint --fix ${oxlintTargets.join(" ")}`);
    cmds.push(`oxfmt --write ${list}`);
    return cmds;
  },
  "*.{json,jsonc,css,scss,md,mdx,yaml,yml,html}": (files) => {
    const targets = stripIgnored(files);
    if (targets.length === 0) return [];
    return [`oxfmt --write ${targets.join(" ")}`];
  },
};
