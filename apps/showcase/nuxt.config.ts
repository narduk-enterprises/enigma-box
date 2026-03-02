let hmrPort = 24610

export default defineNuxtConfig({
  extends: ['@loganrenz/narduk-nuxt-template-layer'],

  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 3010,
  },

  // Unique HMR WebSocket port — avoids collisions when running all apps concurrently.
  // Must be set via hook because Nuxt's DevServerPlugin overwrites static vite.server.hmr.
  $development: {
    runtimeConfig: {
      public: {
        appUrl: 'http://localhost:3010',
        exampleAuthUrl: 'http://localhost:3011',
        exampleBlogUrl: 'http://localhost:3012',
        exampleMarketingUrl: 'http://localhost:3013',
        exampleOgImageUrl: 'http://localhost:3015',
        exampleAppleMapsUrl: 'http://localhost:3016',
      },
    },
    hooks: {
      'vite:extendConfig'(config) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        ;(config as any).server ??= {}
        ;(config as any).server.hmr = { port: hmrPort++ }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      },
    },
  },

  runtimeConfig: {
    public: {
      appUrl: 'https://showcase.narduk-nuxt-template.workers.dev',
      appName: 'Nuxt 4 Showcase',
      exampleAuthUrl: 'https://example-auth.narduk-nuxt-template.workers.dev',
      exampleBlogUrl: 'https://example-blog.narduk-nuxt-template.workers.dev',
      exampleMarketingUrl: 'https://example-marketing.narduk-nuxt-template.workers.dev',
      exampleOgImageUrl: 'https://example-og-image.narduk-nuxt-template.workers.dev',
      exampleAppleMapsUrl: 'https://example-apple-maps.narduk-nuxt-template.workers.dev',
    },
  },

  site: {
    url: process.env.SITE_URL || 'https://showcase.narduk-nuxt-template.workers.dev',
    name: 'Nuxt 4 Showcase',
    description: 'Interactive examples showcasing Nuxt 4 + Nuxt UI 4 + Cloudflare Workers patterns.',
    defaultLocale: 'en',
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Nuxt 4 Showcase',
      url: process.env.SITE_URL || 'https://showcase.narduk-nuxt-template.workers.dev',
      logo: '/favicon.svg',
    },
  },
})
