import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api/xxx  ->  http://localhost:5000/xxx  (pas de problème CORS en dev)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:5000", changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") } },
  },
});
