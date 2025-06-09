# NaN Values Retry Implementation Guide

## Overview

This document explains the comprehensive retry mechanism implemented to handle NaN (Not a Number) and missing values in Lighthouse performance tests. The system now includes multiple layers of retry logic to ensure robust testing.

## Problem Analysis

From your CSV data, we identified these issues:
- **Next.js SSG**: All performance metrics showing `NaN`
- **SvelteKit SSG**: All performance metrics showing `NaN` with `N/A` scores

Common causes:
1. **Network/Connection Issues**: URLs unreachable during testing
2. **Deployment Problems**: Applications not properly deployed
3. **Lighthouse Test Failures**: Tool couldn't complete the audit
4. **URL Redirects/Errors**: 404 or redirect issues
5. **Build/Deployment Timing**: Sites being rebuilt during testing

## Implemented Solutions

### 1. Enhanced LighthouseTestRunner with Retry Logic

**Key Features:**
- **3-level retry mechanism** with progressive configuration changes
- **URL validation** before running tests
- **Metrics validation** to detect NaN values
- **Progressive timeout increases** for problematic sites
- **Different Lighthouse configurations** per retry attempt

**Implementation Details:**

```javascript
// New method: runSingleTestWithRetry()
- Attempt 1: Standard configuration
- Attempt 2: Conservative settings (longer timeouts, skip problematic audits)
- Attempt 3: Most conservative (maximum timeouts, minimal audits)
```

### 2. Validation Functions

**URL Validation:**
```javascript
async validateUrl(url) {
  // HEAD request to check accessibility
  // 10-second timeout
  // Error handling for various failure types
}
```

**Metrics Validation:**
```javascript
validateMetrics(metrics, requiredMetrics) {
  // Checks for null, undefined, NaN values
  // Validates both numericValue and score
  // Returns detailed validation report
}
```

### 3. Retry Configuration Strategy

**Attempt 1 (Standard):**
- Default Lighthouse settings
- All categories and audits
- Standard throttling

**Attempt 2 (Conservative):**
- Performance category only
- Skip problematic audits: `uses-rel-preconnect`, `uses-rel-preload`, `critical-request-chains`
- Simulation throttling
- Extended timeouts: FCP 15s, Load 45s

**Attempt 3 (Most Conservative):**
- Performance category only
- Skip additional audits: `render-blocking-resources`, `unused-css-rules`
- Maximum timeouts: FCP 30s, Load 60s
- Disable storage reset

## Usage Instructions

### 1. Run NaN Retry Handler

```bash
# Analyze and retry all failed tests
node nan-retry-handler.js

# Only analyze without retrying
node nan-retry-handler.js --analyze-only

# Check URL accessibility
node nan-retry-handler.js --check-urls
```

### 2. Retry Specific Applications

```bash
# Retry specific problematic apps
node retry-failed.js specific nextjs-ssg ssg
node retry-failed.js specific sveltekit-ssg ssg
```

### 3. Manual Testing

```bash
# Test individual components
node test-retry.js

# Run comprehensive tests with new retry logic
npm run test:all:blog
```

## Error Handling Improvements

### CSV Output Changes

**Before:**
```csv
"Next.js SSG",Next.js,"Static Site Generation",MOBILE,"Blog List",/blog,...,NaN,100,NaN,NaN
```

**After (with retry):**
```csv
"Next.js SSG",Next.js,"Static Site Generation",MOBILE,"Blog List",/blog,...,1.23,98,1.1,1.4
```

### Error Classification

The system now identifies and handles specific error types:

1. **LanternError**: Dependency graph issues → Retry with simplified audits
2. **Navigation Timeout**: Network delays → Retry with extended timeouts
3. **Network Errors** (net::ERR_*): Connection issues → Retry with delay
4. **Invalid Metrics**: NaN/null values → Retry with different configuration

## Monitoring and Logging

### Enhanced Console Output

```
📊 Retrying 1/2: Next.js SSG
🔗 App: nextjs-ssg, Strategy: ssg
  📈 Running audit 1/3 (attempt 1/3)...
  ⚠️  Audit 1 attempt 1 has invalid metrics: first-contentful-paint: invalid numericValue (NaN)
  📈 Running audit 1/3 (attempt 2/3)...
  ✅ Audit 1 completed successfully on attempt 2
```

### Summary Reports

```
📋 Retry Summary:
  ✅ Successful: 2
  ❌ Still failing: 0
```

## Configuration Files

### Updated LighthouseTestRunner.js
- New retry methods added
- Enhanced error handling
- Better metrics validation
- Progressive configuration strategy

### New Utility Scripts
- `nan-retry-handler.js`: Main retry utility
- `retry-failed.js`: Batch retry processor
- `test-retry.js`: Testing tool

## Best Practices

### When to Use Retry

1. **After Initial Test Run**: Check for NaN values in results
2. **Network Issues**: When deployment servers are unstable
3. **Intermittent Failures**: For applications that occasionally fail

### Configuration Recommendations

1. **numberOfRuns**: Keep at 3 for statistical validity
2. **Retry Delays**: 5 seconds between retries to avoid server overload
3. **Timeout Values**: Progressive increase for problematic sites

### Monitoring Strategy

1. **Check CSV Output**: Look for NaN values after each test run
2. **Validate URLs**: Ensure all test URLs are accessible
3. **Review Logs**: Check console output for error patterns

## Expected Outcomes

With this retry implementation:

1. **Reduced NaN Values**: Most missing metrics should now be captured
2. **Better Error Reporting**: Clear identification of failure causes
3. **Automated Recovery**: Automatic retry with different configurations
4. **Improved Reliability**: More consistent test results across runs

## Troubleshooting

### Still Getting NaN Values?

1. **Check URL Accessibility**: Run `node nan-retry-handler.js --check-urls`
2. **Verify Deployment**: Ensure applications are properly deployed
3. **Network Issues**: Check internet connection and firewall settings
4. **Increase Retries**: Modify `maxRetries` in the code if needed

### Performance Impact

- Each retry adds ~30-60 seconds per failed test
- Network delays can extend total testing time
- Consider running during off-peak hours for better reliability

## Next Steps

1. **Run the retry handler** on your current master CSV
2. **Monitor results** for improved success rates
3. **Adjust configurations** based on specific failure patterns
4. **Regular maintenance** to keep URLs and configurations updated
