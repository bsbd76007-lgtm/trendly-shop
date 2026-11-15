import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const backend = "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url))
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    fs: { allow: [".."] },
    proxy: { "/api": backend, "/uploads": backend }
  },
  preview: {
    port: 3000,
    proxy: { "/api": backend, "/uploads": backend }
  }
});
