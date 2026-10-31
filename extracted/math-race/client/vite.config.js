import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies Socket.IO to the Node backend, so phones/tablets on the
// same Wi-Fi only need the Vite URL (http://<your-ip>:5173).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': { target: 'http://localhost:3001', ws: true, changeOrigin: true },
    },
  },
});
