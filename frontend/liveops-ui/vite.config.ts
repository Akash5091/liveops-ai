import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api -> your backend gateway OR whichever service exposes a unified API.
// If you don't have a gateway yet, point this to incident-service and have it proxy internally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8082", // change if needed
        changeOrigin: true
      }
    }
  }
});
