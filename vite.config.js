import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  const manifestIcons = [
    {
      "src": "/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/manifest-icon-192.maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/manifest-icon-512.maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ];

  const publicIcons = [
    { src: '/samarthNursuryLogo.ico' },
    { src: '/favicon.svg' },
    { src: '/apple-touch-icon-180.png' }
  ];

  const additionalImages = [];

  return {
    base: './',
    // build: {
    //   outDir: 'build',
    // },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /react\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [
      laravel({
        input: ['resources/react/index.js'],
        refresh: true,
      }),
      react(),
      VitePWA({
        // Make the PWA plugin build to the same place as laravel/vite-plugin
        buildBase: '/build/',

        // Define the scope and the base so that the PWA can run from the
        // root of the domain, even though the files live in /build.
        // This requires the service worker to be served with
        // a header `Service-Worker-Allowed: /` to authorise it.
        // @see server.php
        scope: '/build/',
        base: '/',

        // Use 'prompt' for new versions of the PWA. 'autoUpdate' is
        // simpler but may as well dmeo how this works.
        registerType: 'prompt',

        // Do not use the PWA with dev builds.
        devOptions: {
            enabled: false
        },

        // The Vite PWA docs suggest you should use includeAssets for
        // icons that are not in the manifest. But laravel/vite-plugin
        // does not use a public dir in the build - it relies on
        // Laravel's. If we add this as a publicDir to vite's config
        // then vite-plugin-pwa finds everything in public (eg if you are
        // using telescope then all its assets get cached). It then adds
        // these assets to the service worker with the `/build` prefix,
        // which doesn't work. I found it easiest to leave this empty
        // and use `additionalManifestEntries` below.
        includeAssets: [],

        workbox: {
            // Add all the assets built by Vite into the public/build/assets
            // folder to the SW cache.
            globPatterns: ['**/*.{js,css,html,ico,jpg,png,svg,woff,woff2,ttf,eot}'],

            // Define the root URL as the entrypoint for the offline app.
            // vue-router can then takes over and shows the correct page
            // if you are using it.
            navigateFallback: '/',

            // Stops various paths being intercepted by the service worker
            // if they're not available offline. Telescope is a good
            // example, if you are using that.
            navigateFallbackDenylist: [/^\/telescope/],

            // Add some explicit URLs to the SW precache. This helps us
            // work with the laravel/vite-plugin setup.
            additionalManifestEntries: [
                // Cache the root URL to get hold of the PWA HTML entrypoint
                // defined in welcome.blade.php. Ref:
                // https://github.com/vite-pwa/vite-plugin-pwa/issues/431#issuecomment-1703151065
                { url: '/', revision: `${Date.now()}` },

                // Cache the icons defined above for the manifest
                ...manifestIcons.map((i) => {
                    return { url: i.src, revision: `${Date.now()}` }
                }),

                // Cache the other offline icons defined above
                ...publicIcons.map((i) => {
                    return { url: i.src, revision: `${Date.now()}` }
                }),

                // Cache any additional images defined above
                ...additionalImages.map((i) => {
                    return { url: i.src, revision: `${Date.now()}` }
                })
            ],

            // Ensure the JS build does not get dropped from the cache.
            // This allows it to be as big as 3MB
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        // Manifest settings - these will appear in the generated manifest.webmanifest
        manifest: {
          name: "Samarth Nursery",
          short_name: "Samarth Nursery",
          description: "An app to Samarth Nursery.",
          theme_color: "#171717",
          background_color: "#e8ebf2",
          display: "standalone",
          scope: "/",
          start_url: "/",
          orientation: "portrait",
          icons: [...manifestIcons]
        }
      })
    ],
    resolve: {
      alias: [
        {
          find: 'resources/react/',
          replacement: `${path.resolve(__dirname, 'resources/react')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})
