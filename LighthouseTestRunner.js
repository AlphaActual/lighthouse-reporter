const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const fetch = require('node-fetch');

class LighthouseTestRunner {
  constructor() {
    this.config = config;
    this.ensureOutputDirectories();
  }

  ensureOutputDirectories() {
    // Create main output directory
    if (!fs.existsSync(this.config.outputDirectory)) {
      fs.mkdirSync(this.config.outputDirectory, { recursive: true });
    }

    // Create subdirectories for each rendering strategy
    Object.keys(this.config.applications).forEach(strategy => {
      const strategyDir = path.join(this.config.outputDirectory, strategy);
      if (!fs.existsSync(strategyDir)) {
        fs.mkdirSync(strategyDir, { recursive: true });
      }
    });
  }  async runTest(appKey, strategyKey, profileKey = 'mobile', pageKey = 'home') {
    const app = this.config.applications[strategyKey].apps[appKey];
    const profile = this.config.testProfiles[profileKey];
    const page = this.config.pages[pageKey];
    
    if (!app) {
      throw new Error(`App ${appKey} not found in strategy ${strategyKey}`);
    }
    
    if (!profile) {
      throw new Error(`Profile ${profileKey} not found`);
    }

    if (!page) {
      throw new Error(`Page ${pageKey} not found`);
    }

    const testUrl = app.baseUrl + page.path;

    console.log(`\n🚀 Starting Lighthouse test for ${app.name}`);
    console.log(`📊 Profile: ${profileKey.toUpperCase()}`);
    console.log(`📄 Page: ${page.name} (${page.path})`);
    console.log(`🔗 URL: ${testUrl}`);
    console.log(`🔄 Runs: ${this.config.numberOfRuns}`);
      const allResults = [];
    
    for (let run = 1; run <= this.config.numberOfRuns; run++) {
      // Add a small delay between runs to avoid overwhelming the server
      if (run > 1) {
        console.log(`  ⏱️  Waiting 2 seconds before next run...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const result = await this.runSingleTestWithRetry(testUrl, profile, page, app, strategyKey, profileKey, run);
      if (result) {
        allResults.push(result);
      }
    }if (allResults.length > 0) {
      await this.saveResults(allResults, appKey, strategyKey, profileKey, pageKey);
      console.log(`✅ Test completed for ${app.name} - ${page.name} (${allResults.length}/${this.config.numberOfRuns} successful runs)`);
    } else {
      console.log(`❌ All tests failed for ${app.name} - ${page.name}`);
    }

    return allResults;
  }
  async runStrategyTests(strategyKey, profileKey = 'mobile', pageKey = 'home') {
    const strategy = this.config.applications[strategyKey];
    const page = this.config.pages[pageKey];
    
    if (!strategy) {
      throw new Error(`Strategy ${strategyKey} not found`);
    }

    if (!page) {
      throw new Error(`Page ${pageKey} not found`);
    }

    console.log(`\n🎯 Testing ${strategy.name} Applications`);
    console.log(`📱 Profile: ${profileKey.toUpperCase()}`);
    console.log(`📄 Page: ${page.name} (${page.path})`);
    
    const allStrategyResults = [];
    
    for (const [appKey, app] of Object.entries(strategy.apps)) {
      try {
        const results = await this.runTest(appKey, strategyKey, profileKey, pageKey);
        allStrategyResults.push(...results);
      } catch (error) {
        console.error(`❌ Failed to test ${app.name}:`, error.message);
      }
    }

    // Generate comparison report for the strategy
    if (allStrategyResults.length > 0) {
      await this.generateComparisonReport(allStrategyResults, strategyKey, profileKey, pageKey);
    }

    return allStrategyResults;
  }
  async runAllTests(profileKey = 'mobile', pageKey = 'home') {
    const page = this.config.pages[pageKey];
    
    if (!page) {
      throw new Error(`Page ${pageKey} not found`);
    }

    console.log(`\n🌟 Starting comprehensive Lighthouse testing`);
    console.log(`📱 Profile: ${profileKey.toUpperCase()}`);
    console.log(`📄 Page: ${page.name} (${page.path})`);
    console.log(`📊 Total applications: ${this.getTotalAppsCount()}`);
    
    const allResults = [];
    
    for (const strategyKey of Object.keys(this.config.applications)) {
      try {
        const results = await this.runStrategyTests(strategyKey, profileKey, pageKey);
        allResults.push(...results);
      } catch (error) {
        console.error(`❌ Failed to test strategy ${strategyKey}:`, error.message);
      }
    }

    // Generate master comparison report
    if (allResults.length > 0) {
      await this.generateMasterComparisonReport(allResults, profileKey, pageKey);
    }

    console.log(`\n🎉 All tests completed! Results saved to ${this.config.outputDirectory}`);
    return allResults;
  }

  getTotalAppsCount() {
    return Object.values(this.config.applications)
      .reduce((total, strategy) => total + Object.keys(strategy.apps).length, 0);
  }
  async saveResults(results, appKey, strategyKey, profileKey, pageKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const page = this.config.pages[pageKey];
    const pageSlug = pageKey === 'home' ? 'homepage' : pageKey;
    const filename = `${appKey}_${pageSlug}_${profileKey}_${this.config.numberOfRuns}runs_${timestamp}.csv`;
    const filepath = path.join(this.config.outputDirectory, strategyKey, filename);
    
    const csvData = this.convertToTransposedCSV(results);
    fs.writeFileSync(filepath, csvData);
    
    console.log(`  💾 Saved: ${filename}`);
  }

  async generateComparisonReport(results, strategyKey, profileKey, pageKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pageSlug = pageKey === 'home' ? 'homepage' : pageKey;
    const filename = `${strategyKey}_${pageSlug}_comparison_${profileKey}_${timestamp}.csv`;
    const filepath = path.join(this.config.outputDirectory, strategyKey, filename);
    
    const csvData = this.convertToComparisonCSV(results);
    fs.writeFileSync(filepath, csvData);
    
    console.log(`  📊 Comparison report saved: ${filename}`);
  }

  async generateMasterComparisonReport(results, profileKey, pageKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pageSlug = pageKey === 'home' ? 'homepage' : pageKey;
    const filename = `master_${pageSlug}_comparison_${profileKey}_${timestamp}.csv`;
    const filepath = path.join(this.config.outputDirectory, filename);
    
    const csvData = this.convertToComparisonCSV(results);
    fs.writeFileSync(filepath, csvData);
    
    console.log(`  🏆 Master comparison report saved: ${filename}`);
  }

  convertToTransposedCSV(allResults) {
    const keyMetrics = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'interactive',
      'total-blocking-time',
      'cumulative-layout-shift'
    ];
      // Create enhanced headers
    const headers = [
      'Run', 'App_Name', 'Framework', 'Strategy', 'Profile', 'Page_Name', 'Page_Path', 'Tested_URL', 'Final_URL', 'Timestamp'
    ];
    
    keyMetrics.forEach(metricKey => {
      const metricName = metricKey.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      headers.push(`${metricName}_Value`);
      headers.push(`${metricName}_Score_%`);
    });
    
    const rows = [headers.join(',')];
      allResults.forEach(result => {
      const row = [
        result.run,
        `"${result.appName}"`,
        result.framework,
        `"${result.strategy}"`,
        result.profile.toUpperCase(),
        `"${result.pageName || 'Homepage'}"`,
        result.pagePath || '/',
        result.testedUrl || result.url,
        result.url,
        result.timestamp
      ];
        keyMetrics.forEach(metricKey => {
        const metric = result.metrics[metricKey];
        
        if (metric && metric.numericValue !== null && metric.numericValue !== undefined && !isNaN(metric.numericValue)) {
          let value = metric.numericValue;
          if (metricKey === 'cumulative-layout-shift') {
            value = Math.round(value * 1000) / 1000;
          } else if (metricKey === 'total-blocking-time') {
            value = Math.round(value);
          } else {
            value = Math.round(value / 10) / 100;
          }
          
          const scorePercentage = (metric.score !== null && metric.score !== undefined && !isNaN(metric.score)) ? 
            Math.round(metric.score * 100) : 'N/A';
          
          row.push(value);
          row.push(scorePercentage);
        } else {
          row.push('NaN');
          row.push('N/A');
        }
      });
      
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  convertToComparisonCSV(allResults) {
    // Group results by app and calculate averages
    const groupedResults = {};
      allResults.forEach(result => {
      const key = `${result.appName}_${result.framework}_${result.strategy}_${result.pageName || 'Homepage'}`;
      if (!groupedResults[key]) {
        groupedResults[key] = {
          appName: result.appName,
          framework: result.framework,
          strategy: result.strategy,
          profile: result.profile,
          pageName: result.pageName,
          pagePath: result.pagePath,
          testedUrl: result.testedUrl,
          runs: [],
          url: result.url
        };
      }
      groupedResults[key].runs.push(result);
    });

    const keyMetrics = [
      'first-contentful-paint',
      'largest-contentful-paint', 
      'speed-index',
      'interactive',
      'total-blocking-time',
      'cumulative-layout-shift'
    ];    const headers = [
      'App_Name', 'Framework', 'Strategy', 'Profile', 'Page_Name', 'Page_Path', 'Tested_URL', 'Final_URL', 'Total_Runs'
    ];
    
    keyMetrics.forEach(metricKey => {
      const metricName = metricKey.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      headers.push(`${metricName}_Avg_Value`);
      headers.push(`${metricName}_Avg_Score_%`);
      headers.push(`${metricName}_Min_Value`);
      headers.push(`${metricName}_Max_Value`);
    });

    const rows = [headers.join(',')];
      Object.values(groupedResults).forEach(group => {
      const row = [
        `"${group.appName}"`,
        group.framework,
        `"${group.strategy}"`,
        group.profile.toUpperCase(),
        `"${group.pageName || 'Homepage'}"`,
        group.pagePath || '/',
        group.testedUrl || group.url,
        group.url,
        group.runs.length
      ];
      
      keyMetrics.forEach(metricKey => {
        const values = [];
        const scores = [];
          group.runs.forEach(result => {
          const metric = result.metrics[metricKey];
          if (metric && metric.numericValue !== null && metric.numericValue !== undefined && !isNaN(metric.numericValue)) {
            let value = metric.numericValue;
            if (metricKey === 'cumulative-layout-shift') {
              value = Math.round(value * 1000) / 1000;
            } else if (metricKey === 'total-blocking-time') {
              value = Math.round(value);
            } else {
              value = Math.round(value / 10) / 100;
            }
            values.push(value);
          }
          
          if (metric && metric.score !== null && metric.score !== undefined && !isNaN(metric.score)) {
            scores.push(Math.round(metric.score * 100));
          }
        });
        
        const avgValue = values.length > 0 ? 
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 'NaN';
        const avgScore = scores.length > 0 ? 
          Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 'N/A';
        const minValue = values.length > 0 ? Math.min(...values) : 'NaN';
        const maxValue = values.length > 0 ? Math.max(...values) : 'NaN';
        
        row.push(avgValue);
        row.push(avgScore);
        row.push(minValue);
        row.push(maxValue);
      });
      
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }
  async runSingleTestWithRetry(testUrl, profile, page, app, strategyKey, profileKey, run) {
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    const requiredMetrics = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'interactive',
      'total-blocking-time',
      'cumulative-layout-shift'
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let chrome = null;
      
      try {
        console.log(`  📈 Running audit ${run}/${this.config.numberOfRuns} (attempt ${attempt}/${maxRetries})...`);
        
        // Pre-test URL validation
        await this.validateUrl(testUrl);
        
        chrome = await chromeLauncher.launch({ 
          chromeFlags: this.config.chromeFlags 
        });
        
        const options = this.buildLighthouseOptions(profile, chrome.port, attempt);
        
        const runnerResult = await lighthouse(testUrl, options);
        const report = runnerResult.report;
        const results = JSON.parse(report);
        const performanceMetrics = results.audits;
        
        // Validate that all required metrics have valid values
        const validationResult = this.validateMetrics(performanceMetrics, requiredMetrics);
        
        if (validationResult.isValid) {
          console.log(`  ✅ Audit ${run} completed successfully on attempt ${attempt}`);
          
          return {
            run: run,
            url: results.finalUrl,
            testedUrl: testUrl,
            pageName: page.name,
            pagePath: page.path,
            metrics: performanceMetrics,
            timestamp: new Date().toISOString(),
            appName: app.name,
            framework: app.framework,
            strategy: this.config.applications[strategyKey].name,
            profile: profileKey,
            ...(attempt > 1 && { note: `Success on attempt ${attempt}` })
          };
        } else {
          console.warn(`  ⚠️  Audit ${run} attempt ${attempt} has invalid metrics: ${validationResult.invalidMetrics.join(', ')}`);
          
          if (attempt === maxRetries) {
            console.error(`  ❌ All ${maxRetries} attempts failed for audit ${run} due to invalid metrics`);
            return null;
          }
        }
        
      } catch (error) {
        console.error(`  ❌ Audit ${run} attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          console.error(`  ❌ All ${maxRetries} attempts failed for audit ${run}`);
          return null;
        }
        
        // Log specific error types for debugging
        if (error.message.includes('LanternError')) {
          console.log(`  🔄 LanternError detected, will retry with modified options...`);
        } else if (error.message.includes('Navigation timeout')) {
          console.log(`  🔄 Navigation timeout detected, will retry...`);
        } else if (error.message.includes('net::ERR_')) {
          console.log(`  🔄 Network error detected, will retry...`);
        }
        
      } finally {
        if (chrome) {
          try {
            await chrome.kill();
          } catch (killError) {
            console.warn(`  ⚠️  Failed to kill Chrome process:`, killError.message);
          }
        }
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        console.log(`  ⏱️  Waiting ${retryDelay/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return null;
  }

  async validateUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD', timeout: 10000 });
      if (!response.ok) {
        throw new Error(`URL returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`URL validation timeout: ${url}`);
      }
      throw new Error(`URL validation failed: ${error.message}`);
    }
  }

  buildLighthouseOptions(profile, port, attempt) {
    const baseOptions = {
      ...this.config.lighthouseOptions,
      port: port,
      throttling: profile.throttling,
      emulatedFormFactor: profile.emulatedFormFactor,
      disableDeviceEmulation: profile.disableDeviceEmulation,
      disableStorageReset: profile.disableStorageReset
    };

    // Modify options based on attempt to handle different failure scenarios
    if (attempt === 2) {
      // Second attempt: Use more conservative settings
      return {
        ...baseOptions,
        onlyCategories: ['performance'],
        skipAudits: ['uses-rel-preconnect', 'uses-rel-preload', 'critical-request-chains'],
        throttlingMethod: 'simulate',
        maxWaitForFcp: 15000,
        maxWaitForLoad: 45000
      };
    } else if (attempt === 3) {
      // Third attempt: Most conservative settings
      return {
        ...baseOptions,
        onlyCategories: ['performance'],
        skipAudits: [
          'uses-rel-preconnect', 
          'uses-rel-preload', 
          'critical-request-chains',
          'render-blocking-resources',
          'unused-css-rules'
        ],
        throttlingMethod: 'simulate',
        maxWaitForFcp: 30000,
        maxWaitForLoad: 60000,
        disableStorageReset: true
      };
    }

    return baseOptions;
  }

  validateMetrics(metrics, requiredMetrics) {
    const invalidMetrics = [];
    
    for (const metricKey of requiredMetrics) {
      const metric = metrics[metricKey];
      
      if (!metric) {
        invalidMetrics.push(`${metricKey}: missing`);
        continue;
      }
      
      if (metric.numericValue === null || 
          metric.numericValue === undefined || 
          isNaN(metric.numericValue)) {
        invalidMetrics.push(`${metricKey}: invalid numericValue (${metric.numericValue})`);
        continue;
      }
      
      if (metric.score === null || metric.score === undefined || isNaN(metric.score)) {
        invalidMetrics.push(`${metricKey}: invalid score (${metric.score})`);
      }
    }
    
    return {
      isValid: invalidMetrics.length === 0,
      invalidMetrics: invalidMetrics
    };
  }
}

module.exports = LighthouseTestRunner;
