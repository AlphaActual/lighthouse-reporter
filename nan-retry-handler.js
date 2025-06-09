#!/usr/bin/env node

/**
 * NaN Values Retry Utility
 * 
 * This script handles retrying lighthouse tests that resulted in NaN values
 * by implementing a robust retry mechanism with different configurations.
 */

const LighthouseTestRunner = require('./LighthouseTestRunner');
const fs = require('fs');
const path = require('path');

class NaNRetryHandler {
  constructor() {
    this.runner = new LighthouseTestRunner();
    this.outputDir = './output';
  }

  /**
   * Analyze a CSV file and identify tests with NaN values
   */
  analyzeCsvForNaN(csvPath) {
    try {
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content.trim().split('\n');
      
      if (lines.length < 2) {
        return { hasNaN: false, failedRows: [] };
      }

      const headers = lines[0].split(',');
      const failedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('NaN')) {
          // Parse the row to extract test information
          const values = this.parseCSVLine(line);
          if (values.length > 0) {
            failedRows.push({
              rowIndex: i,
              appName: values[0]?.replace(/"/g, '') || '',
              framework: values[1] || '',
              strategy: values[2]?.replace(/"/g, '') || '',
              originalLine: line
            });
          }
        }
      }

      return {
        hasNaN: failedRows.length > 0,
        failedRows,
        totalRows: lines.length - 1
      };
    } catch (error) {
      console.error(`Error analyzing CSV ${csvPath}:`, error.message);
      return { hasNaN: false, failedRows: [], error: error.message };
    }
  }

  /**
   * Parse a CSV line handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Map application names to configuration keys
   */
  getAppConfig(appName) {
    const appMappings = {
      'Next.js CSR': { appKey: 'nextjs-csr', strategyKey: 'csr' },
      'Nuxt.js CSR': { appKey: 'nuxtjs-csr', strategyKey: 'csr' },
      'SvelteKit CSR': { appKey: 'sveltekit-csr', strategyKey: 'csr' },
      'Next.js SSR': { appKey: 'nextjs-ssr', strategyKey: 'ssr' },
      'Nuxt.js SSR': { appKey: 'nuxtjs-ssr', strategyKey: 'ssr' },
      'SvelteKit SSR': { appKey: 'sveltekit-ssr', strategyKey: 'ssr' },
      'Next.js SSG': { appKey: 'nextjs-ssg', strategyKey: 'ssg' },
      'Nuxt.js SSG': { appKey: 'nuxtjs-ssg', strategyKey: 'ssg' },
      'SvelteKit SSG': { appKey: 'sveltekit-ssg', strategyKey: 'ssg' },
      'Next.js ISR': { appKey: 'nextjs-isr', strategyKey: 'isr' },
      'Nuxt.js ISR': { appKey: 'nuxtjs-isr', strategyKey: 'isr' },
      'SvelteKit ISR': { appKey: 'sveltekit-isr', strategyKey: 'isr' }
    };

    return appMappings[appName] || null;
  }

  /**
   * Retry tests that failed with NaN values
   */
  async retryNaNTests() {
    console.log('🔍 Scanning for CSV files with NaN values...\n');

    // Find the most recent master comparison file
    const masterFiles = fs.readdirSync(this.outputDir)
      .filter(file => file.startsWith('master_') && file.endsWith('.csv'))
      .sort()
      .reverse();

    if (masterFiles.length === 0) {
      console.log('❌ No master comparison files found');
      return;
    }

    const masterFile = path.join(this.outputDir, masterFiles[0]);
    console.log(`📄 Analyzing: ${masterFiles[0]}`);

    const analysis = this.analyzeCsvForNaN(masterFile);

    if (!analysis.hasNaN) {
      console.log('✅ No NaN values found in the master comparison file');
      return;
    }

    console.log(`\n🚨 Found ${analysis.failedRows.length} tests with NaN values:`);
    analysis.failedRows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.appName} (${row.framework})`);
    });

    console.log('\n🔄 Starting retry process...\n');

    const retryResults = [];
    
    for (const [index, failedRow] of analysis.failedRows.entries()) {
      const appConfig = this.getAppConfig(failedRow.appName);
      
      if (!appConfig) {
        console.log(`⚠️  Skipping ${failedRow.appName} - unknown app configuration`);
        continue;
      }

      try {
        console.log(`\n📊 Retrying ${index + 1}/${analysis.failedRows.length}: ${failedRow.appName}`);
        console.log(`🔗 App: ${appConfig.appKey}, Strategy: ${appConfig.strategyKey}`);

        const result = await this.runner.runTest(
          appConfig.appKey,
          appConfig.strategyKey,
          'mobile',
          'blog'
        );

        if (result && result.length > 0) {
          console.log(`  ✅ Success! Completed ${result.length} runs`);
          retryResults.push({
            appName: failedRow.appName,
            success: true,
            runs: result.length
          });
        } else {
          console.log(`  ❌ Still failed - no valid results`);
          retryResults.push({
            appName: failedRow.appName,
            success: false,
            runs: 0
          });
        }

      } catch (error) {
        console.error(`  ❌ Error retrying ${failedRow.appName}:`, error.message);
        retryResults.push({
          appName: failedRow.appName,
          success: false,
          error: error.message
        });
      }

      // Wait between retries to avoid overwhelming servers
      if (index < analysis.failedRows.length - 1) {
        console.log('  ⏱️  Waiting 5 seconds before next retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Summary
    const successful = retryResults.filter(r => r.success).length;
    const failed = retryResults.length - successful;

    console.log(`\n📋 Retry Summary:`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Still failing: ${failed}`);

    if (successful > 0) {
      console.log(`\n🔄 Some tests succeeded! Consider regenerating the master comparison report.`);
      console.log(`Run: npm run test:all:blog`);
    }

    return retryResults;
  }

  /**
   * Check specific URLs for accessibility
   */
  async checkUrls() {
    const config = require('./config');
    const problematicUrls = [
      'https://render-strategy-demo-next-app-ssg.vercel.app/blog/',
      'https://render-strategy-demo-sveltekit-app-nine.vercel.app/blog'
    ];

    console.log('🌐 Checking problematic URLs...\n');

    for (const url of problematicUrls) {
      try {
        console.log(`🔗 Checking: ${url}`);
        
        // Simple fetch test
        const response = await fetch(url, { 
          method: 'HEAD',
          timeout: 10000
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`  ✅ URL is accessible`);
        } else {
          console.log(`  ❌ URL returned error status`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }
}

// CLI Interface
async function main() {
  const handler = new NaNRetryHandler();
  const args = process.argv.slice(2);

  console.log('🔄 NaN Values Retry Handler\n');

  if (args.includes('--check-urls')) {
    await handler.checkUrls();
  } else if (args.includes('--analyze-only')) {
    const masterFiles = fs.readdirSync('./output')
      .filter(file => file.startsWith('master_') && file.endsWith('.csv'))
      .sort()
      .reverse();
    
    if (masterFiles.length > 0) {
      const analysis = handler.analyzeCsvForNaN(path.join('./output', masterFiles[0]));
      console.log('Analysis result:', analysis);
    }
  } else {
    await handler.retryNaNTests();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NaNRetryHandler;
