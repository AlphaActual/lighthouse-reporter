const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const config = require('./config');

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
  }

  async runTest(appKey, strategyKey, profileKey = 'mobile') {
    const app = this.config.applications[strategyKey].apps[appKey];
    const profile = this.config.testProfiles[profileKey];
    
    if (!app) {
      throw new Error(`App ${appKey} not found in strategy ${strategyKey}`);
    }
    
    if (!profile) {
      throw new Error(`Profile ${profileKey} not found`);
    }

    console.log(`\n🚀 Starting Lighthouse test for ${app.name}`);
    console.log(`📊 Profile: ${profileKey.toUpperCase()}`);
    console.log(`🔗 URL: ${app.url}`);
    console.log(`🔄 Runs: ${this.config.numberOfRuns}`);
    
    const allResults = [];
    
    for (let run = 1; run <= this.config.numberOfRuns; run++) {
      const chrome = await chromeLauncher.launch({ 
        chromeFlags: this.config.chromeFlags 
      });
      
      const options = {
        ...this.config.lighthouseOptions,
        port: chrome.port,
        throttling: profile.throttling,
        emulatedFormFactor: profile.emulatedFormFactor,
        disableDeviceEmulation: profile.disableDeviceEmulation,
        disableStorageReset: profile.disableStorageReset
      };

      try {
        console.log(`  📈 Running audit ${run}/${this.config.numberOfRuns}...`);
        
        const runnerResult = await lighthouse(app.url, options);
        const report = runnerResult.report;
        const results = JSON.parse(report);
        const performanceMetrics = results.audits;
        
        allResults.push({
          run: run,
          url: results.finalUrl,
          metrics: performanceMetrics,
          timestamp: new Date().toISOString(),
          appName: app.name,
          framework: app.framework,
          strategy: this.config.applications[strategyKey].name,
          profile: profileKey
        });
        
      } catch (error) {
        console.error(`❌ Lighthouse audit ${run} failed:`, error.message);
      } finally {
        await chrome.kill();
      }
    }

    if (allResults.length > 0) {
      await this.saveResults(allResults, appKey, strategyKey, profileKey);
      console.log(`✅ Test completed for ${app.name} (${allResults.length}/${this.config.numberOfRuns} successful runs)`);
    } else {
      console.log(`❌ All tests failed for ${app.name}`);
    }

    return allResults;
  }

  async runStrategyTests(strategyKey, profileKey = 'mobile') {
    const strategy = this.config.applications[strategyKey];
    if (!strategy) {
      throw new Error(`Strategy ${strategyKey} not found`);
    }

    console.log(`\n🎯 Testing ${strategy.name} Applications`);
    console.log(`📱 Profile: ${profileKey.toUpperCase()}`);
    
    const allStrategyResults = [];
    
    for (const [appKey, app] of Object.entries(strategy.apps)) {
      try {
        const results = await this.runTest(appKey, strategyKey, profileKey);
        allStrategyResults.push(...results);
      } catch (error) {
        console.error(`❌ Failed to test ${app.name}:`, error.message);
      }
    }

    // Generate comparison report for the strategy
    if (allStrategyResults.length > 0) {
      await this.generateComparisonReport(allStrategyResults, strategyKey, profileKey);
    }

    return allStrategyResults;
  }

  async runAllTests(profileKey = 'mobile') {
    console.log(`\n🌟 Starting comprehensive Lighthouse testing`);
    console.log(`📱 Profile: ${profileKey.toUpperCase()}`);
    console.log(`📊 Total applications: ${this.getTotalAppsCount()}`);
    
    const allResults = [];
    
    for (const strategyKey of Object.keys(this.config.applications)) {
      try {
        const results = await this.runStrategyTests(strategyKey, profileKey);
        allResults.push(...results);
      } catch (error) {
        console.error(`❌ Failed to test strategy ${strategyKey}:`, error.message);
      }
    }

    // Generate master comparison report
    if (allResults.length > 0) {
      await this.generateMasterComparisonReport(allResults, profileKey);
    }

    console.log(`\n🎉 All tests completed! Results saved to ${this.config.outputDirectory}`);
    return allResults;
  }

  getTotalAppsCount() {
    return Object.values(this.config.applications)
      .reduce((total, strategy) => total + Object.keys(strategy.apps).length, 0);
  }

  async saveResults(results, appKey, strategyKey, profileKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${appKey}_${profileKey}_${this.config.numberOfRuns}runs_${timestamp}.csv`;
    const filepath = path.join(this.config.outputDirectory, strategyKey, filename);
    
    const csvData = this.convertToTransposedCSV(results);
    fs.writeFileSync(filepath, csvData);
    
    console.log(`  💾 Saved: ${filename}`);
  }

  async generateComparisonReport(results, strategyKey, profileKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${strategyKey}_comparison_${profileKey}_${timestamp}.csv`;
    const filepath = path.join(this.config.outputDirectory, strategyKey, filename);
    
    const csvData = this.convertToComparisonCSV(results);
    fs.writeFileSync(filepath, csvData);
    
    console.log(`  📊 Comparison report saved: ${filename}`);
  }

  async generateMasterComparisonReport(results, profileKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `master_comparison_${profileKey}_${timestamp}.csv`;
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
      'Run', 'App_Name', 'Framework', 'Strategy', 'Profile', 'URL', 'Timestamp'
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
        result.url,
        result.timestamp
      ];
      
      keyMetrics.forEach(metricKey => {
        const metric = result.metrics[metricKey];
        
        if (metric) {
          let value = metric.numericValue || 'N/A';
          if (value !== 'N/A') {
            if (metricKey === 'cumulative-layout-shift') {
              value = Math.round(value * 1000) / 1000;
            } else if (metricKey === 'total-blocking-time') {
              value = Math.round(value);
            } else {
              value = Math.round(value / 10) / 100;
            }
          }
          
          const scorePercentage = metric.score !== null ? Math.round(metric.score * 100) : 'N/A';
          
          row.push(value);
          row.push(scorePercentage);
        } else {
          row.push('N/A');
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
      const key = `${result.appName}_${result.framework}_${result.strategy}`;
      if (!groupedResults[key]) {
        groupedResults[key] = {
          appName: result.appName,
          framework: result.framework,
          strategy: result.strategy,
          profile: result.profile,
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
    ];

    const headers = [
      'App_Name', 'Framework', 'Strategy', 'Profile', 'URL', 'Total_Runs'
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
        group.url,
        group.runs.length
      ];
      
      keyMetrics.forEach(metricKey => {
        const values = [];
        const scores = [];
        
        group.runs.forEach(result => {
          const metric = result.metrics[metricKey];
          if (metric && metric.numericValue !== null) {
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
          
          if (metric && metric.score !== null) {
            scores.push(Math.round(metric.score * 100));
          }
        });
        
        const avgValue = values.length > 0 ? 
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 'N/A';
        const avgScore = scores.length > 0 ? 
          Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 'N/A';
        const minValue = values.length > 0 ? Math.min(...values) : 'N/A';
        const maxValue = values.length > 0 ? Math.max(...values) : 'N/A';
        
        row.push(avgValue);
        row.push(avgScore);
        row.push(minValue);
        row.push(maxValue);
      });
      
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }
}

module.exports = LighthouseTestRunner;
