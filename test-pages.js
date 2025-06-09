#!/usr/bin/env node

/**
 * Test script to verify page-specific functionality
 * Run with: node test-pages.js
 */

const LighthouseTestRunner = require('./LighthouseTestRunner');

const testPages = async () => {
  console.log('🧪 Testing Page-Specific Functionality');
  console.log('📝 This will test different pages to verify the new functionality');
  
  const runner = new LighthouseTestRunner();
  
  // Override number of runs for quick testing
  runner.config.numberOfRuns = 1;
  
  try {
    console.log('\n1️⃣ Testing homepage...');
    await runner.runTest('nextjs-csr', 'csr', 'mobile', 'home');
    
    console.log('\n2️⃣ Testing about page...');
    await runner.runTest('nextjs-csr', 'csr', 'mobile', 'about');
    
    console.log('\n3️⃣ Testing blog page...');
    await runner.runTest('nextjs-csr', 'csr', 'mobile', 'blog');
    
    console.log('\n4️⃣ Testing blog post page...');
    await runner.runTest('nextjs-csr', 'csr', 'mobile', 'blogPost');
    
    console.log('\n🎉 All page tests completed successfully!');
    console.log('📁 Check the ./output/csr/ folder for page-specific CSV files');
    console.log('\n📊 You should see files like:');
    console.log('   - nextjs-csr_homepage_mobile_1runs_[timestamp].csv');
    console.log('   - nextjs-csr_about_mobile_1runs_[timestamp].csv');
    console.log('   - nextjs-csr_blog_mobile_1runs_[timestamp].csv');
    console.log('   - nextjs-csr_blogPost_mobile_1runs_[timestamp].csv');
    
  } catch (error) {
    console.error('❌ Page test failed:', error.message);
    process.exit(1);
  }
};

testPages();
