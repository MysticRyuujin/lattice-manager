import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    ENV: JSON.stringify(process.env.ENV),
    BTC_DEFAULT_FEE_RATE: JSON.stringify(process.env.VITE_BTC_DEFAULT_FEE_RATE),
    BTC_TX_BASE_URL: JSON.stringify(process.env.VITE_BTC_TX_BASE_URL),
    BTC_TESTNET: JSON.stringify(process.env.VITE_BTC_TESTNET),
    "process.env": {},
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    exclude: ["**/node_modules/**", "test/e2e/**"],
    // gridplus-sdk's ESM build imports a directory, which Node's loader rejects.
    server: { deps: { inline: ["gridplus-sdk"] } },
  },
  plugins: [react(), nodePolyfills()],
  optimizeDeps: {
    rolldownOptions: {
      transform: {
        define: {
          global: "globalThis",
        },
      },
    },
  },
  build: {
    outDir: "build",
  },
}));
