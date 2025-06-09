#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const LighthouseTestRunner = require('./LighthouseTestRunner');

class RetryFailedTests {
  constructor() {
    this.runner = new LighthouseTestRunner();
    this.outputDir = './output';
  }

  // Parse CSV and find rows with NaN values
  findFailedTestsInCSV(csvFilePath) {
    try {
      const content = fs.readFileSync(csvFilePath, 'utf8');
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      
      const failedTests = [];
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (!row.trim()) continue;
        
        // Check if row contains NaN values
        if (row.includes('NaN') || row.includes('N/A,N/A,N/A,N/A')) {
          const values = this.parseCSVRow(row);
          const testInfo = {
            appName: values[0]?.replace(/"/g, ''),
            framework: values[1],
            strategy: values[2]?.replace(/"/g, ''),
            profile: values[3],
            pageName: values[4]?.replace(/"/g, ''),
            pagePath: values[5],
            testedUrl: values[6],
            rowIndex: i
          };
          failedTests.push(testInfo);
        }
      }
      
      return failedTests;
    } catch (error) {
      console.error(`Error reading CSV file ${csvFilePath}:`, error.message);
      return [];
    }
  }

  parseCSVRow(row) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    return values;
  }

  // Map test info to runner parameters
  mapToRunnerParams(testInfo) {
    const strategyMap = {
      'Client-Side Rendering': 'csr',
      'Server-Side Rendering': 'ssr',
      'Static Site Generation': 'ssg',
      'Incremental Static Regeneration': 'isr'
    };

    const appMap = {
      'Next.js CSR': 'nextjs-csr',
      'Nuxt.js CSR': 'nuxtjs-csr',
      'SvelteKit CSR': 'sveltekit-csr',
      'Next.js SSR': 'nextjs-ssr',
      'Nuxt.js SSR': 'nuxtjs-ssr',
      'SvelteKit SSR': 'sveltekit-ssr',
      'Next.js SSG': 'nextjs-ssg',
      'Nuxt.js SSG': 'nuxtjs-ssg',
      'SvelteKit SSG': 'sveltekit-ssg',
      'Next.js ISR': 'nextjs-isr',
      'Nuxt.js ISR': 'nuxtjs-isr',
      'SvelteKit ISR': 'sveltekit-isr'
    };

    const pageMap = {
      'Homepage': 'home',
      'Blog List': 'blog',
      'About': 'about'
    };

    return {
      appKey: appMap[testInfo.appName],
      strategyKey: strategyMap[testInfo.strategy],
      profileKey: testInfo.profile.toLowerCase(),
      pageKey: pageMap[testInfo.pageName] || 'home'
    };
  }

  // Retry failed tests from master comparison file
  async retryFailedTestsFromMaster() {
    console.log('🔍 Scanning master comparison file for failed tests...\n');
    
    // Find the most recent master comparison file
    const files = fs.readdirSync(this.outputDir)
      .filter(file => file.startsWith('master_') && file.endsWith('.csv'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('❌ No master comparison files found');
      return;
    }
    
    const masterFile = path.join(this.outputDir, files[0]);
    console.log(`📄 Analyzing: ${files[0]}`);
    
    const failedTests = this.findFailedTestsInCSV(masterFile);
    
    if (failedTests.length === 0) {
      console.log('✅ No failed tests found in master comparison file');
      return;
    }
    
    console.log(`\n🚨 Found ${failedTests.length} failed tests:`);
    failedTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.appName} - ${test.pageName}`);
    });
    
    console.log('\n🔄 Starting retry process...\n');
    
    const results = [];
    
    for (const [index, testInfo] of failedTests.entries()) {
      try {
        console.log(`\n📊 Retrying ${index + 1}/${failedTests.length}: ${testInfo.appName} - ${testInfo.pageName}`);
        
        const params = this.mapToRunnerParams(testInfo);
        
        if (!params.appKey || !params.strategyKey) {
          console.log(`  ⚠️  Skipping - unable to map test parameters`);
          continue;
        }
        
        const result = await this.runner.runTest(
          params.appKey,
          params.strategyKey,
          params.profileKey,
          params.pageKey
        );
        
        if (result && result.length > 0) {
          console.log(`  ✅ Success! Completed ${result.length} runs`);
          results.push({ testInfo, result, success: true });
        } else {
          console.log(`  ❌ Still failed - no valid results`);
          results.push({ testInfo, result: null, success: false });
        }
        
      } catch (error) {
        console.error(`  ❌ Error retrying ${testInfo.appName}:`, error.message);
        results.push({ testInfo, error: error.message, success: false });
      }
      
      // Wait between retries
      if (index < failedTests.length - 1) {
        console.log('  ⏱️  Waiting 3 seconds before next retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\n📋 Retry Summary:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Still failing: ${failed}`);
    
    if (successful > 0) {
      console.log(`\n🔄 Regenerating master comparison report...`);
      await this.runner.runAllTests('mobile', 'blog');
    }
    
    return results;
  }

  // Manual retry for specific app
  async retrySpecificApp(appKey, strategyKey, profileKey = 'mobile', pageKey = 'blog') {
    console.log(`\n🎯 Retrying specific app: ${appKey} (${strategyKey})`);
    
    try {
      const result = await this.runner.runTest(appKey, strategyKey, profileKey, pageKey);
      
      if (result && result.length > 0) {
        console.log(`✅ Success! Completed ${result.length} runs`);
        return result;
      } else {
        console.log(`❌ Failed - no valid results`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error:`, error.message);
      return null;
    }
  }
}

// CLI interface
async function main() {
  const retryTester = new RetryFailedTests();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 Retry Failed Tests Tool

Usage:
  node retry-failed.js                           # Retry all failed tests from master CSV
  node retry-failed.js specific <app> <strategy> # Retry specific app
  
Examples:
  node retry-failed.js
  node retry-failed.js specific nextjs-ssg ssg
  node retry-failed.js specific sveltekit-ssg ssg
    `);
    return;
  }
  
  if (args[0] === 'specific' && args.length >= 3) {
    await retryTester.retrySpecificApp(args[1], args[2]);
  } else {
    await retryTester.retryFailedTestsFromMaster();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RetryFailedTests;
