# Lighthouse Data Extractor

A Node.js tool for running multiple Lighthouse performance audits on websites and extracting the results into CSV format for analysis. This tool enables automated performance monitoring with configurable network conditions and device emulation.

## Features

- **Multiple Test Runs**: Execute multiple Lighthouse audits to get reliable performance data
- **Configurable Network Conditions**: Customize throttling settings for different network scenarios
- **Device Emulation**: Test with mobile or desktop emulation
- **CSV Export**: Export performance metrics to CSV format for easy analysis
- **Key Performance Metrics**: Focus on Core Web Vitals and essential performance indicators
- **Headless Testing**: Run tests in headless Chrome for automation

## Performance Metrics Tracked

- **First Contentful Paint (FCP)**: Time when the first text or image is painted
- **Largest Contentful Paint (LCP)**: Time when the largest text or image is painted
- **Speed Index**: How quickly the contents of a page are visibly populated
- **Time to Interactive (TTI)**: Time until the page is fully interactive
- **Total Blocking Time (TBT)**: Sum of all time periods between FCP and TTI
- **Cumulative Layout Shift (CLS)**: Measure of visual stability

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd LightHouseDataExtractor
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage

1. Edit the configuration in `lighthouseTest.js`:
```javascript
const siteUrl = 'https://www.hcl.hr/'; // Change to your target URL
const numberOfRuns = 5; // Configure number of test runs
```

2. Run the performance test:
```bash
node lighthouseTest.js
```

3. View results in the generated CSV file:
```
lighthouse_performance_report_5runs_2025-05-24T17-25-16-287Z.csv
```

### Configuration Options

#### Network Throttling
```javascript
const lighthouseConfig = {
  throttling: {
    rttMs: 40,                    // Round trip time in milliseconds
    throughputKbps: 10240,        // Download throughput in Kbps (10 Mbps)
    cpuSlowdownMultiplier: 1,     // CPU slowdown multiplier
    downloadThroughputKbps: 10240,
    uploadThroughputKbps: 1024
  }
};
```

#### Device Emulation
```javascript
emulatedFormFactor: 'mobile', // 'mobile' or 'desktop'
```

## Output Format

The tool generates a CSV file with the following structure:

| Column | Description |
|--------|-------------|
| Run | Test run number |
| URL | Target URL tested |
| Timestamp | ISO timestamp of the test |
| Form_Factor | Device emulation used (mobile/desktop) |
| Throttling_Config | Network throttling configuration |
| [Metric]_Value | Numeric value for each performance metric |
| [Metric]_Score_% | Lighthouse score percentage (0-100) |

### Sample Output
```csv
Run,URL,Timestamp,Form_Factor,Throttling_Config,First Contentful Paint_Value,First Contentful Paint_Score_%,...
1,https://www.hcl.hr/,2025-05-24T17:21:25.797Z,mobile,10240Kbps_40ms_1x,3.37,38,...
2,https://www.hcl.hr/,2025-05-24T17:22:23.776Z,mobile,10240Kbps_40ms_1x,2.73,59,...
```

## Dependencies

- **lighthouse**: Google's Lighthouse performance auditing tool
- **chrome-launcher**: Programmatic Chrome browser launching
- **lighthouse-batch**: Batch processing utilities for Lighthouse

## Use Cases

- **Performance Monitoring**: Regular performance checks for websites
- **A/B Testing**: Compare performance between different versions
- **Performance Regression Testing**: Ensure performance doesn't degrade over time
- **Optimization Validation**: Measure impact of performance improvements
- **Reporting**: Generate performance reports for stakeholders

## Best Practices

1. **Multiple Runs**: Always run multiple tests (3-5 runs minimum) to account for variability
2. **Consistent Environment**: Use the same network and device settings for comparable results
3. **Regular Testing**: Set up automated testing to catch performance regressions early
4. **Baseline Comparison**: Establish performance baselines and track changes over time

## Troubleshooting

### Common Issues

1. **Chrome Not Found**: Ensure Chrome is installed and accessible
2. **Network Errors**: Check network connectivity and URL accessibility
3. **Permission Errors**: Ensure write permissions for CSV output directory

### Error Handling

The tool includes error handling for:
- Failed Lighthouse audits
- Chrome launch failures
- Network connectivity issues
- File system errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please refer to the LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository or contact the maintainer.