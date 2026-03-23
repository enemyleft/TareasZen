import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig(async () => ({
  plugins: [
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    lingui()
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
