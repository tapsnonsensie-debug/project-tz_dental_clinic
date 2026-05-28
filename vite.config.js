import { defineConfig } from 'vite'

export default defineConfig({
  base: '/project-tz_dental_clinic/',
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'legal/privacy.html',
        offer: 'legal/offer.html',
        cookies: 'legal/cookies.html',
      },
    },
  },
})
