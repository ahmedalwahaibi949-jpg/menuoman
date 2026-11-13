import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Built files go to ../fikra so GitHub Pages serves them with no build step on the server.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../fikra", emptyOutDir: true, chunkSizeWarningLimit: 900 }
});
