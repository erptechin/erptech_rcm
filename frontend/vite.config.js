import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  // Load env variables based on `mode` (dev/build)
  const env = loadEnv(mode, process.cwd(), '');

  // Set base path dynamically
  const base = command === 'serve' ? '/' : '/assets/product_ui/dist/';

  return {
    base,
    plugins: [react(), jsconfigPaths(), svgr(),
    eslint(), tailwindcss(),
    ]
  };
});