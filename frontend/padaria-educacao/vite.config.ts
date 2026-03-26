import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { componentTagger } from "lovable-tagger";

const envDir = path.resolve(__dirname, "../..");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");

  const apiBase = env.VITE_API_BASE || "https://ead-api.dcmmarketingdigital.com.br";

  const apiUrlPattern = new RegExp(
    `^${apiBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\/$/, "")}/api/.*`,
    "i",
  );

  return {
    envDir,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        includeAssets: ["favicon.png", "favicon.ico", "robots.txt"],
        manifest: {
          name: "Padaria Educação",
          short_name: "Padaria Edu",
          description: "Sistema educacional para colaboradores de padaria",
          theme_color: "#8B3A3A",
          background_color: "#f5f7fa",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "/pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: apiUrlPattern,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
                cacheableResponse: { statuses: [0, 200] },
                networkTimeoutSeconds: 10,
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
              return "react-vendor";
            }
            if (id.includes("node_modules/@radix-ui/") || id.includes("node_modules/radix-ui")) {
              return "radix-ui";
            }
            if (id.includes("node_modules/recharts")) {
              return "recharts";
            }
            /* react-quill removido de manualChunks - precisa da mesma instância do React que o app */
            if (id.includes("node_modules/@tanstack/react-query")) {
              return "react-query";
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
