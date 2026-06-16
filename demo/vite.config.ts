import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project site lives at https://<user>.github.io/gps-cartrack/
export default defineConfig({
  base: "/gps-cartrack/",
  plugins: [react()],
});
