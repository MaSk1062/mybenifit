import path from "path"
import { defineConfig } from 'vite'
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter(),
     tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
