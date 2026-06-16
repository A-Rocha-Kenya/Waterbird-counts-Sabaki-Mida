import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  base: "./",
  publicDir: resolve(__dirname, "../data/derived/dashboard"),
  build: {
    outDir: resolve(__dirname, "../docs/dashboard"),
    emptyOutDir: true
  }
});
