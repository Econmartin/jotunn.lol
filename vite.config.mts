import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/testnet-graphql": {
        target: "https://graphql.testnet.sui.io",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/testnet-graphql/, "/graphql"),
      },
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});
