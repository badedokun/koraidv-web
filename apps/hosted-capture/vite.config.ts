import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In the monorepo there are multiple react installs (root, this app,
  // packages/react). Without deduping, @koraidv/react and this app can bundle
  // DIFFERENT React copies — React's hook dispatcher is then null and the SDK
  // crashes on mount with "Cannot read properties of null (reading 'useMemo')",
  // blanking the page. Force a single React/React-DOM instance.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
