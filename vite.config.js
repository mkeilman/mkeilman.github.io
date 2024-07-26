import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                headsUp: resolve(__dirname, 'heads-up/index.html'),
            },
        },
    },
    plugins: [react()],
})
