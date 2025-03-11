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
          "/api": "http://localhost:8080",
          "/sae-visualizer/location-websocket": {
            target: "http://localhost:8080",
            ws: true
          }
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
