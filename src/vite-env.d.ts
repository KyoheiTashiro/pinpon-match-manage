/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SEED?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
