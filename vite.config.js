import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  base: "./",

  optimizeDeps: {
    // 🔥 IMPORTANT: do NOT prebundle tesseract
    exclude: ["tesseract.js"],
  },

  build: {
    target: "esnext", // 🔥 needed for workers

    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "public/popup.html"),
        sidepanel: path.resolve(__dirname, "public/sidepanel.html"),
      },

      output: {
        entryFileNames: "[name]/assets/index.js",
        chunkFileNames: "[name]/assets/[name].js",
        assetFileNames: "[name]/assets/[name].[ext]",
      },
    },
  },
});