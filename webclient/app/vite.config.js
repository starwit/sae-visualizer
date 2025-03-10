import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({command}) => {
  if (command === "serve") {
    return {
      plugins: [
        react(),
      ],
      base: "/",
      server: {
        watch: {
          usePolling: true
        },
        proxy: {
          "/api": "http://localhost:8080"
        }
      },
    };
  } else {
    return {
      plugins: [react()],
      base: "./"
    };
  }
});
