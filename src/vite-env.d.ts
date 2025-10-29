/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENERGY_API_URL?: string;
  readonly VITE_ENERGY_CREATE_ENTRY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
