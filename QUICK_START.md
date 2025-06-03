# Lighthouse Render Strategy Tester - Quick Start Guide

## 🚀 Quick Test Commands

### Individual Framework Tests
```bash
# Test Next.js applications
npm run test:nextjs-csr    # Next.js CSR
npm run test:nextjs-ssr    # Next.js SSR  
npm run test:nextjs-ssg    # Next.js SSG
npm run test:nextjs-isr    # Next.js ISR

# Test Nuxt.js applications
npm run test:nuxtjs-csr    # Nuxt.js CSR
npm run test:nuxtjs-ssr    # Nuxt.js SSR
npm run test:nuxtjs-ssg    # Nuxt.js SSG
npm run test:nuxtjs-isr    # Nuxt.js ISR

# Test SvelteKit applications
npm run test:sveltekit-csr # SvelteKit CSR
npm run test:sveltekit-ssr # SvelteKit SSR
npm run test:sveltekit-ssg # SvelteKit SSG
npm run test:sveltekit-isr # SvelteKit ISR
```

### Strategy Comparison Tests
```bash
# Compare all CSR implementations
npm run test:csr

# Compare all SSR implementations  
npm run test:ssr

# Compare all SSG implementations
npm run test:ssg

# Compare all ISR implementations
npm run test:isr
```

### Device Profile Tests
```bash
# Mobile testing (default)
npm run test:all:mobile

# Desktop testing
npm run test:all:desktop

# Slow 3G network simulation
npm run test:all:slow3g
```

### Quick Demo
```bash
# Run a quick demo (2 runs instead of 5)
node demo.js
```

## 📊 Understanding Output Files

### Individual Test Results
Files like `nextjs-csr_mobile_5runs_2025-06-03T10-15-30-456Z.csv` contain:
- Each test run as a separate row
- All performance metrics with values and scores
- Timestamps and configuration details

### Comparison Reports
Files like `csr_comparison_mobile_2025-06-03T10-30-45-345Z.csv` contain:
- Average performance across all runs
- Minimum and maximum values
- Side-by-side framework comparison

### Master Report
File like `master_comparison_mobile_2025-06-03T10-30-45-123Z.csv` contains:
- All applications and strategies combined
- Perfect for analyzing rendering strategy effectiveness

## 🎯 Common Testing Scenarios

### Performance Regression Testing
```bash
# Test before deployment
npm run test:csr:mobile

# Deploy changes
# ...

# Test after deployment
npm run test:csr:mobile

# Compare CSV files to identify regressions
```

### Framework Selection
```bash
# Test all SSR frameworks for comparison
npm run test:ssr:desktop

# Check the comparison report to see which performs best
```

### Network Performance Analysis
```bash
# Test same app across different network conditions
node cli.js app csr nextjs-csr mobile
node cli.js app csr nextjs-csr desktop  
node cli.js app csr nextjs-csr slow3g

# Compare results to understand network impact
```

## 🔧 Customization

### Quick Configuration Changes

Edit `config.js` for common adjustments:

```javascript
// Change number of test runs (line 4)
numberOfRuns: 3, // Faster testing

// Change output directory (line 5)  
outputDirectory: './my-results',

// Add custom throttling profile
testProfiles: {
  // ... existing profiles ...
  fast4g: {
    emulatedFormFactor: 'mobile',
    throttling: {
      rttMs: 50,
      throughputKbps: 20480, // 20 Mbps
      cpuSlowdownMultiplier: 1
    }
  }
}
```

### Testing Your Own Applications

Add your applications to `config.js`:

```javascript
applications: {
  csr: {
    name: 'Client-Side Rendering',
    apps: {
      // ... existing apps ...
      'my-react-app': {
        name: 'My React App',
        url: 'https://my-app.vercel.app',
        framework: 'React'
      }
    }
  }
}
```

Then test with:
```bash
node cli.js app csr my-react-app mobile
```
