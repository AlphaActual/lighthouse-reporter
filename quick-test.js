const LighthouseTestRunner = require('./LighthouseTestRunner');

async function quickTest() {
  try {
    console.log('🧪 Quick test of retry mechanism...');
    const runner = new LighthouseTestRunner();
    
    // Test with a working URL first
    console.log('Testing with working URL (Next.js CSR)...');
    const result = await runner.runTest('nextjs-csr', 'csr', 'mobile', 'blog');
    console.log('Result:', result ? `${result.length} runs completed` : 'Failed');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickTest();
