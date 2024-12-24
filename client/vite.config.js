import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/uploads": {
        target: "http://server:8888", // Backend container'ına erişim
        changeOrigin: true,
      }
    },
    host: "0.0.0.0",
    watch: {
      // https://vitejs.dev/config/server-options.html#server-watch
      usePolling: true,
    },
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
