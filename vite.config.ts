import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src") } },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: { "vendor-react": ["react", "react-dom", "wouter"], "vendor-icons": ["lucide-react"] } } },
  },
  server: { port: 3000, strictPort: false, host: true },
});
