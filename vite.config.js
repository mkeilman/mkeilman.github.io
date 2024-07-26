import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
//    build: {
//        rollupOptions: {
//            nested: resolve(__dirname, 'index.html'),
//        },
//    },
    plugins: [react()],
})
