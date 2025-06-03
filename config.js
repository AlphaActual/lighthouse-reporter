// Configuration for Lighthouse testing of different rendering strategies
const config = {
  // Global test settings
  numberOfRuns: 5,
  outputDirectory: './output',
  
  // Lighthouse configurations for different scenarios
  testProfiles: {
    mobile: {
      emulatedFormFactor: 'mobile',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240, // 10 Mbps
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 10240,
        uploadThroughputKbps: 1024
      },
      disableDeviceEmulation: false,
      disableStorageReset: false
    },
    desktop: {
      emulatedFormFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 40960, // 40 Mbps
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 40960,
        uploadThroughputKbps: 5120
      },
      disableDeviceEmulation: false,
      disableStorageReset: false
    },
    slow3g: {
      emulatedFormFactor: 'mobile',
      throttling: {
        rttMs: 300,
        throughputKbps: 1600, // Slow 3G
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 300,
        downloadThroughputKbps: 1600,
        uploadThroughputKbps: 750
      },
      disableDeviceEmulation: false,
      disableStorageReset: false
    }
  },
  
  // Test applications organized by rendering strategy
  applications: {
    csr: {
      name: 'Client-Side Rendering',
      apps: {
        'nextjs-csr': {
          name: 'Next.js CSR',
          url: 'https://render-strategy-demo-csr-next-app-c.vercel.app/',
          framework: 'Next.js'
        },
        'nuxtjs-csr': {
          name: 'Nuxt.js CSR',
          url: 'https://render-strategy-demo-csr-nuxt-app-c.vercel.app/',
          framework: 'Nuxt.js'
        },
        'sveltekit-csr': {
          name: 'SvelteKit CSR',
          url: 'https://render-strategy-demo-csr-sveltekit.vercel.app/',
          framework: 'SvelteKit'
        }
      }
    },
    ssr: {
      name: 'Server-Side Rendering',
      apps: {
        'nextjs-ssr': {
          name: 'Next.js SSR',
          url: 'https://render-strategy-demo-next-app-ssr.vercel.app/',
          framework: 'Next.js'
        },
        'nuxtjs-ssr': {
          name: 'Nuxt.js SSR',
          url: 'https://render-strategy-demo-nuxt-app-ssr.vercel.app/',
          framework: 'Nuxt.js'
        },
        'sveltekit-ssr': {
          name: 'SvelteKit SSR',
          url: 'https://render-strategy-demo-sveltekit-app.vercel.app/',
          framework: 'SvelteKit'
        }
      }
    },
    ssg: {
      name: 'Static Site Generation',
      apps: {
        'nextjs-ssg': {
          name: 'Next.js SSG',
          url: 'https://render-strategy-demo-next-app-ssg.vercel.app/',
          framework: 'Next.js'
        },
        'nuxtjs-ssg': {
          name: 'Nuxt.js SSG',
          url: 'https://render-strategy-demo-nuxt-app-ssg.vercel.app/',
          framework: 'Nuxt.js'
        },
        'sveltekit-ssg': {
          name: 'SvelteKit SSG',
          url: 'https://render-strategy-demo-sveltekit-app-nine.vercel.app/',
          framework: 'SvelteKit'
        }
      }
    },
    isr: {
      name: 'Incremental Static Regeneration',
      apps: {
        'nextjs-isr': {
          name: 'Next.js ISR',
          url: 'https://render-strategy-demo-next-app-isr.vercel.app/',
          framework: 'Next.js'
        },
        'nuxtjs-isr': {
          name: 'Nuxt.js ISR',
          url: 'https://render-strategy-demo-nuxt-app-isr.vercel.app/',
          framework: 'Nuxt.js'
        },
        'sveltekit-isr': {
          name: 'SvelteKit ISR',
          url: 'https://render-strategy-demo-sveltekit-app-rho.vercel.app/',
          framework: 'SvelteKit'
        }
      }
    }
  },
  
  // Chrome launcher settings
  chromeFlags: [
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-gpu'
  ],
  
  // Lighthouse options
  lighthouseOptions: {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    extraHeaders: {},
    blockedUrlPatterns: [],
    onlyAudits: null
  }
};

module.exports = config;
