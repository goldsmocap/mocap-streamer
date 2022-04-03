import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  base: path.resolve(__dirname, "./dist/"),
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ["../shared/dist/messages", "../shared/dist/clients"],
  },
  build: {
    commonjsOptions: {
      include: ["../shared/dist/messages", "../shared/dist/clients"],
    },
  },
});
