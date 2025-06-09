#!/usr/bin/env node

/**
 * Demo script to test a single CSR application
 * This script demonstrates how to use the Lighthouse Test Runner
 * Run with: node demo.js
 */

const LighthouseTestRunner = require('./LighthouseTestRunner');

const runDemo = async () => {
  console.log('🎬 Starting Lighthouse Demo Test');
  console.log('📝 This will test Next.js CSR homepage with mobile profile (2 runs for demo)');
  
  // Create runner instance
  const runner = new LighthouseTestRunner();
  
  // Override number of runs for demo (faster testing)
  runner.config.numberOfRuns = 2;
  
  try {
    // Test a single CSR application homepage
    const results = await runner.runTest('nextjs-csr', 'csr', 'mobile', 'home');
    
    console.log('\n🎉 Demo completed successfully!');
    console.log(`📊 Generated ${results.length} test results`);
    console.log('📁 Check the ./output/csr/ folder for CSV files');
    
    // Optional: Show available pages for future testing
    console.log('\n💡 Want to test other pages? Available options:');
    console.log('   home     - Homepage (what we just tested)');
    console.log('   about    - About page (/about)');
    console.log('   blog     - Blog listing (/blog)');
    console.log('   blogPost - Blog post (/blog/1)');
    console.log('\nExample: node cli.js app csr nextjs-csr mobile about');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
};

runDemo();
