/// <reference types="vite/client" />

declare const APP_VERSION: string;

interface ImportMetaEnv {
  readonly VITE_BASE_SIGNING_URL?: string;
}
