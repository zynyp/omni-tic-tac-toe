import { defineConfig } from "vite";

import solidjsPlugin from "vite-plugin-solid";
import tailwindcssPlugin from "@tailwindcss/vite";

export default defineConfig({ plugins: [solidjsPlugin(), tailwindcssPlugin()] });