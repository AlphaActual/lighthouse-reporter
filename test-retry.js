#!/usr/bin/env node

const LighthouseTestRunner = require('./LighthouseTestRunner');

async function testRetryMechanism() {
  console.log('🧪 Testing retry mechanism for problematic URLs...\n');
  
  const runner = new LighthouseTestRunner();
  
  // Test the problematic SSG applications that were returning NaN
  const problematicApps = [
    { appKey: 'nextjs-ssg', strategyKey: 'ssg', name: 'Next.js SSG' },
    { appKey: 'sveltekit-ssg', strategyKey: 'ssg', name: 'SvelteKit SSG' }
  ];
  
  for (const app of problematicApps) {
    try {
      console.log(`\n🎯 Testing ${app.name}...`);
      const result = await runner.runTest(app.appKey, app.strategyKey, 'mobile', 'blog');
      
      if (result && result.length > 0) {
        console.log(`✅ ${app.name} test completed successfully!`);
        console.log(`📊 Successfully completed ${result.length} runs`);
      } else {
        console.log(`❌ ${app.name} test failed - no valid results`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${app.name}:`, error.message);
    }
    
    // Wait between tests
    console.log('⏱️  Waiting 5 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n🏁 Retry mechanism test completed!');
}

if (require.main === module) {
  testRetryMechanism().catch(console.error);
}

module.exports = testRetryMechanism;
