#!/usr/bin/env node

const LighthouseTestRunner = require('./LighthouseTestRunner');

const runner = new LighthouseTestRunner();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const strategy = args[1];
const app = args[2];
const profile = args[3] || 'mobile';

const showHelp = () => {
  console.log(`
🚀 Lighthouse Testing CLI

Usage:
  node cli.js <command> [options]

Commands:
  all [profile]                    - Run tests on all applications
  strategy <strategy> [profile]   - Run tests on all apps in a strategy
  app <strategy> <app> [profile]  - Run test on a specific app

Strategies:
  csr  - Client-Side Rendering
  ssr  - Server-Side Rendering  
  ssg  - Static Site Generation
  isr  - Incremental Static Regeneration

Profiles:
  mobile   - Mobile device simulation (default)
  desktop  - Desktop simulation
  slow3g   - Slow 3G network simulation

Examples:
  node cli.js all mobile
  node cli.js strategy csr desktop
  node cli.js app csr nextjs-csr slow3g
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
        await runner.runAllTests(profile);
        break;
        
      case 'strategy':
        if (!strategy) {
          console.error('❌ Strategy required. Use: node cli.js strategy <strategy> [profile]');
          process.exit(1);
        }
        await runner.runStrategyTests(strategy, profile);
        break;
        
      case 'app':
        if (!strategy || !app) {
          console.error('❌ Strategy and app required. Use: node cli.js app <strategy> <app> [profile]');
          process.exit(1);
        }
        await runner.runTest(app, strategy, profile);
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
