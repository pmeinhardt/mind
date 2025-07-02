/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tla from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), tla()],
  test: {},
});
