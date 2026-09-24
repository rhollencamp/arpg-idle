import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * The commit this bundle was built from, baked in as `__GIT_SHA__` so the
 * running app can say which build it is. CI checks out shallowly but still
 * has a `.git`, so `rev-parse` works there; `GITHUB_SHA` is the fallback for
 * a build with no repository at all (a tarball, a Docker layer), and
 * 'unknown' the last resort — this must never fail a build.
 */
function gitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return process.env.GITHUB_SHA?.slice(0, 7) ?? 'unknown'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/arpg-idle/',
  define: {
    // Kept in step with the same define in `vitest.config.ts`, which stands
    // in for this one because Vitest does not read this config.
    __GIT_SHA__: JSON.stringify(gitSha()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Guttered',
        short_name: 'Guttered',
        description:
          'An idle game: keep the last lighthouse burning and send your people into the fog.',
        theme_color: '#161d25',
        background_color: '#10161c',
        display: 'standalone',
        start_url: '/arpg-idle/',
        scope: '/arpg-idle/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
