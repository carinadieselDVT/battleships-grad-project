import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page build: emits index.html, lobby.html, and history.html
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lobby: resolve(__dirname, 'lobby.html'),
        history: resolve(__dirname, 'history.html'),
      },
    },
  },
})
