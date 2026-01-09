/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob: <T>(
    pattern: string,
    options?: { eager?: boolean }
  ) => Record<string, T>;
}
