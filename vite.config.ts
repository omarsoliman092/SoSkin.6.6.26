import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// TanStack Start configuration for Vercel
export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "src/server.ts",
      },
    }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});
