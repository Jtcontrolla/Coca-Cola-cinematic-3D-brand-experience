import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Split the heavy 3D and animation libraries into their own long-cached chunks.
const CHUNKS = [
  ['three', /node_modules[\\/]three[\\/]/],
  ['r3f', /node_modules[\\/](@react-three|three-stdlib|troika|maath|zustand|its-fine)/],
  ['motion', /node_modules[\\/](gsap|@gsap|lenis|framer-motion|motion-dom|motion-utils)/],
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [name, re] of CHUNKS) if (re.test(id)) return name
        },
      },
    },
  },
})
