

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Pulsegaurd/", // 👈 must match the GitHub repo name
});
