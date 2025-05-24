const lighthouse = require('lighthouse').default;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

const siteUrl = 'https://www.hcl.hr/';

// Configuration for Lighthouse conditions
const lighthouseConfig = {
  // Network throttling options
  throttling: {
    rttMs: 40,        // Round trip time in milliseconds
    throughputKbps: 10240, // Download throughput in Kbps (10 Mbps)
    cpuSlowdownMultiplier: 1, // CPU slowdown multiplier
    requestLatencyMs: 0,
    downloadThroughputKbps: 10240,
    uploadThroughputKbps: 1024
  },
  // Device emulation
  emulatedFormFactor: 'mobile', // 'mobile' or 'desktop'
  // Additional settings
  disableDeviceEmulation: false,
  disableStorageReset: false
};

const runLighthouse = async () => {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    // Apply throttling and performance conditions
    throttling: lighthouseConfig.throttling,
    emulatedFormFactor: lighthouseConfig.emulatedFormFactor,
    disableDeviceEmulation: lighthouseConfig.disableDeviceEmulation,
    disableStorageReset: lighthouseConfig.disableStorageReset,
    // Additional flags for performance testing
    extraHeaders: {},
    blockedUrlPatterns: [], // Block specific URLs if needed
    onlyAudits: null, // Run specific audits only
  };

  try {
    console.log(`Running Lighthouse audit with ${lighthouseConfig.emulatedFormFactor} emulation...`);
    console.log(`Network throttling: ${lighthouseConfig.throttling.throughputKbps} Kbps, ${lighthouseConfig.throttling.rttMs}ms RTT`);
    console.log(`CPU slowdown: ${lighthouseConfig.throttling.cpuSlowdownMultiplier}x`);
    
    const runnerResult = await lighthouse(siteUrl, options);
    
    // Extract performance metrics
    const report = runnerResult.report;
    const results = JSON.parse(report);
    const performanceMetrics = results.audits;
    
    // Convert to CSV format
    const csvData = convertToCSV(performanceMetrics, results.finalUrl, lighthouseConfig);
    
    // Save CSV file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lighthouse_performance_report_${timestamp}.csv`;
    fs.writeFileSync(`./${filename}`, csvData);
    console.log(`Lighthouse performance data saved to ${filename}`);
    
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
  } finally {
    await chrome.kill();
  }
};

const convertToCSV = (metrics, url, config) => {
  const headers = ['URL', 'Metric', 'Score_Percentage', 'Value', 'Unit', 'Throttling_Config', 'Form_Factor', 'Timestamp'];
  const rows = [headers.join(',')];
  
  const throttlingInfo = `${config.throttling.throughputKbps}Kbps_${config.throttling.rttMs}ms_${config.throttling.cpuSlowdownMultiplier}x`;
  const timestamp = new Date().toISOString();
  
  // Add key performance metrics (removed deprecated first-meaningful-paint)
  const keyMetrics = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'speed-index',
    'interactive',
    'total-blocking-time',
    'cumulative-layout-shift'
  ];
  
  keyMetrics.forEach(metricKey => {
    if (metrics[metricKey]) {
      const metric = metrics[metricKey];
      
      // Standardize units and values
      let value = metric.numericValue || 'N/A';
      let unit = '';
      
      if (value !== 'N/A') {
        if (metricKey === 'cumulative-layout-shift') {
          // CLS is unitless
          unit = 'unitless';
          value = Math.round(value * 1000) / 1000; // Round to 3 decimal places
        } else if (metricKey === 'total-blocking-time') {
          // TBT is in milliseconds
          unit = 'ms';
          value = Math.round(value);
        } else {
          // Time-based metrics: convert to seconds
          unit = 's';
          value = Math.round(value / 10) / 100; // Convert ms to s with 2 decimal places
        }
      }
      
      const scorePercentage = metric.score !== null ? Math.round(metric.score * 100) + '%' : 'N/A';
      
      const row = [
        url,
        metric.title || metricKey,
        scorePercentage,
        value,
        unit,
        throttlingInfo,
        config.emulatedFormFactor,
        timestamp
      ];
      rows.push(row.join(','));
    }
  });
  
  return rows.join('\n');
};

runLighthouse();
