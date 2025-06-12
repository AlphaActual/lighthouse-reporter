#!/usr/bin/env node

const LighthouseTestRunner = require('./LighthouseTestRunner');

const runner = new LighthouseTestRunner();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

let strategy, app, profile, page;

switch (command) {
  case 'all':
    profile = args[1] || 'mobile';
    page = args[2] || 'home';
    break;
  case 'strategy':
    strategy = args[1];
    profile = args[2] || 'mobile';
    page = args[3] || 'home';
    break;
  case 'app':
    strategy = args[1];
    app = args[2];
    profile = args[3] || 'mobile';
    page = args[4] || 'home';
    break;
  default:
    // For help and unknown commands
    break;
}

const showHelp = () => {
  console.log(`
🚀 Lighthouse Testing CLI

Usage:
  node cli.js <command> [options]

Commands:
  all [profile] [page]                    - Run tests on all applications
  strategy <strategy> [profile] [page]   - Run tests on all apps in a strategy
  app <strategy> <app> [profile] [page]  - Run test on a specific app

Strategies:
  csr  - Client-Side Rendering
  ssr  - Server-Side Rendering  
  ssg  - Static Site Generation
  isr  - Incremental Static Regeneration

Profiles:
  mobile   - Mobile device simulation (default)
  desktop  - Desktop simulation
  slow3g   - Slow 3G network simulation
  slow4g   - Slow 4G network simulation

Pages:
  home     - Homepage / landing page (default)
  about    - About page (/about)
  blog     - Blog listing page (/blog)
  blogPost - Blog post page (/blog/1)

Examples:
  node cli.js all mobile home
  node cli.js strategy csr desktop about
  node cli.js app csr nextjs-csr slow3g blog
  node cli.js app ssr nuxtjs-ssr mobile blogPost
  node cli.js help

Available Apps:
  CSR: nextjs-csr, nuxtjs-csr, sveltekit-csr
  SSR: nextjs-ssr, nuxtjs-ssr, sveltekit-ssr
  SSG: nextjs-ssg, nuxtjs-ssg, sveltekit-ssg
  ISR: nextjs-isr, nuxtjs-isr, sveltekit-isr
`);
};

const main = async () => {
  try {
    switch (command) {
      case 'all':
        await runner.runAllTests(profile, page);
        break;
        
      case 'strategy':
        if (!strategy) {
          console.error('❌ Strategy required. Use: node cli.js strategy <strategy> [profile] [page]');
          process.exit(1);
        }
        await runner.runStrategyTests(strategy, profile, page);
        break;
        
      case 'app':
        if (!strategy || !app) {
          console.error('❌ Strategy and app required. Use: node cli.js app <strategy> <app> [profile] [page]');
          process.exit(1);
        }
        await runner.runTest(app, strategy, profile, page);
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        console.error('❌ Unknown command. Use "node cli.js help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
