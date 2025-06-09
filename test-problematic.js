#!/usr/bin/env node

/**
 * Simple test to retry the specific problematic applications
 */

async function testProblematicApps() {
  const LighthouseTestRunner = require('./LighthouseTestRunner');
  
  console.log('🎯 Testing the problematic SSG applications that show NaN values...\n');
  
  const runner = new LighthouseTestRunner();
  
  const problematicApps = [
    {
      name: 'Next.js SSG',
      appKey: 'nextjs-ssg',
      strategyKey: 'ssg',
      url: 'https://render-strategy-demo-next-app-ssg.vercel.app/blog/'
    },
    {
      name: 'SvelteKit SSG', 
      appKey: 'sveltekit-ssg',
      strategyKey: 'ssg',
      url: 'https://render-strategy-demo-sveltekit-app-nine.vercel.app/blog'
    }
  ];
  
  for (const app of problematicApps) {
    console.log(`\n📊 Testing: ${app.name}`);
    console.log(`🔗 URL: ${app.url}`);
    
    try {
      // First, let's test URL accessibility
      console.log('🌐 Checking URL accessibility...');
      
      const fetch = require('node-fetch');
      const response = await fetch(app.url, { 
        method: 'HEAD',
        timeout: 10000
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`  ❌ URL is not accessible, skipping Lighthouse test`);
        continue;
      }
      
      console.log(`  ✅ URL is accessible, proceeding with Lighthouse test`);
      
      // Now run the Lighthouse test with retry logic
      console.log('🚀 Running Lighthouse test with retry logic...');
      
      const result = await runner.runTest(
        app.appKey,
        app.strategyKey,
        'mobile',
        'blog'
      );
      
      if (result && result.length > 0) {
        console.log(`  ✅ Success! Completed ${result.length} runs`);
        
        // Show a sample of the metrics to verify they're not NaN
        const sampleRun = result[0];
        if (sampleRun.metrics) {
          const fcp = sampleRun.metrics['first-contentful-paint'];
          const lcp = sampleRun.metrics['largest-contentful-paint'];
          
          console.log(`  📊 Sample metrics:`);
          console.log(`    FCP: ${fcp?.numericValue || 'N/A'} (score: ${fcp?.score || 'N/A'})`);
          console.log(`    LCP: ${lcp?.numericValue || 'N/A'} (score: ${lcp?.score || 'N/A'})`);
        }
      } else {
        console.log(`  ❌ Test failed - no valid results`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${app.name}:`, error.message);
    }
    
    // Wait between tests
    if (app !== problematicApps[problematicApps.length - 1]) {
      console.log('⏱️  Waiting 5 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n🏁 Testing completed!');
  console.log('\n💡 Next steps:');
  console.log('  1. If tests succeeded, run: npm run test:all:blog');
  console.log('  2. Check the new master comparison file for updated results');
}

testProblematicApps().catch(console.error);
