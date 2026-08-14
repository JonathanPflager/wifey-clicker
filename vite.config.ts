import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the built site works on any static host
// (Netlify, GitHub Pages project sites, or opened from a subfolder).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
