import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { fileURLToPath } from "url";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
        "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
        "@repositories": fileURLToPath(new URL("./src/repositories", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/layouts", import.meta.url)),
        "@middleware": fileURLToPath(new URL("./src/middleware", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
        "@db": fileURLToPath(new URL("./src/db", import.meta.url)),
        "@auth": fileURLToPath(new URL("./src/auth", import.meta.url)),
      },
    },
  },
  output: "server",
  adapter: node({ mode: "standalone" }),
});
