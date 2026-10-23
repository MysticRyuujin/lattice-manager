/// <reference types="vite/client" />

declare const APP_VERSION: string;
declare const SENTRY_DSN: string;
declare const SENTRY_ENVIRONMENT: string;

interface ImportMetaEnv {
  readonly VITE_BASE_SIGNING_URL?: string;
}
