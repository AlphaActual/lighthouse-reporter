# Lighthouse Render Strategy Tester

A comprehensive Lighthouse testing suite for comparing performance across different rendering strategies (CSR, SSR, SSG, ISR) and frameworks (Next.js, Nuxt.js, SvelteKit).

## 📋 Features

- **Multiple Rendering Strategies**: Test CSR, SSR, SSG, and ISR applications
- **Framework Comparison**: Compare Next.js, Nuxt.js, and SvelteKit implementations
- **Device Profiles**: Mobile, desktop, and slow 3G testing scenarios
- **Organized Output**: Results automatically saved to strategy-specific folders
- **Comprehensive Reports**: Individual test results and comparison reports
- **CLI Interface**: Easy-to-use command line interface
- **NPM Scripts**: Predefined scripts for common testing scenarios

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Basic Usage

Run all tests with mobile profile:
```bash
npm run test:all
```

Test a specific rendering strategy:
```bash
npm run test:csr
npm run test:ssr
npm run test:ssg
npm run test:isr
```

Test with different device profiles:
```bash
npm run test:all:desktop
npm run test:all:slow3g
npm run test:all:slow4g
```

Test individual applications:
```bash
npm run test:nextjs-csr
npm run test:nuxtjs-ssr
npm run test:sveltekit-ssg
```

## 📊 Testing Profiles

### Mobile (Default)
- Form Factor: Mobile
- Network: 10 Mbps, 40ms RTT
- CPU: 1x slowdown

### Desktop
- Form Factor: Desktop  
- Network: 40 Mbps, 40ms RTT
- CPU: 1x slowdown

### Slow 3G
- Form Factor: Mobile
- Network: 1.6 Mbps, 300ms RTT  
- CPU: 4x slowdown

### Slow 4G
- Form Factor: Mobile
- Network: 3 Mbps, 150ms RTT
- CPU: 2x slowdown

## 🎯 Test Applications

### 🔄 CSR (Client-Side Rendering)
- Next.js CSR: https://render-strategy-demo-csr-next-app-c.vercel.app/
- Nuxt.js CSR: https://render-strategy-demo-csr-nuxt-app-c.vercel.app/
- SvelteKit CSR: https://render-strategy-demo-csr-sveltekit.vercel.app/

### 🚀 SSR (Server-Side Rendering)  
- Next.js SSR: https://render-strategy-demo-next-app-ssr.vercel.app/
- Nuxt.js SSR: https://render-strategy-demo-nuxt-app-ssr.vercel.app/
- SvelteKit SSR: https://render-strategy-demo-sveltekit-app.vercel.app/

### ⚡ SSG (Static Site Generation)
- Next.js SSG: https://render-strategy-demo-next-app-ssg.vercel.app/
- Nuxt.js SSG: https://render-strategy-demo-nuxt-app-ssg.vercel.app/
- SvelteKit SSG: https://render-strategy-demo-sveltekit-app-nine.vercel.app/

### 🔁 ISR (Incremental Static Regeneration)
- Next.js ISR: https://render-strategy-demo-next-app-isr.vercel.app/
- Nuxt.js ISR: https://render-strategy-demo-nuxt-app-isr.vercel.app/
- SvelteKit ISR: https://render-strategy-demo-sveltekit-app-rho.vercel.app/

## 📁 Output Structure

```
output/
├── master_comparison_mobile_2025-06-03T10-30-45-123Z.csv
├── csr/
│   ├── nextjs-csr_mobile_5runs_2025-06-03T10-15-30-456Z.csv
│   ├── nuxtjs-csr_mobile_5runs_2025-06-03T10-20-15-789Z.csv
│   ├── sveltekit-csr_mobile_5runs_2025-06-03T10-25-00-012Z.csv
│   └── csr_comparison_mobile_2025-06-03T10-30-45-345Z.csv
├── ssr/
│   ├── nextjs-ssr_mobile_5runs_2025-06-03T10-35-30-678Z.csv
│   └── ssr_comparison_mobile_2025-06-03T10-45-15-901Z.csv
├── ssg/
│   └── ssg_comparison_mobile_2025-06-03T10-55-00-234Z.csv
└── isr/
    └── isr_comparison_mobile_2025-06-03T11-05-45-567Z.csv
```

## 🛠 CLI Usage

```bash
# Run all tests
node cli.js all [profile]

# Test specific strategy
node cli.js strategy <strategy> [profile]

# Test specific app
node cli.js app <strategy> <app> [profile]

# Show help
node cli.js help
```

### Examples:

```bash
# Test all CSR apps with desktop profile
node cli.js strategy csr desktop

# Test specific Next.js CSR app with slow 3G
node cli.js app csr nextjs-csr slow3g

# Test specific app with slow 4G
node cli.js app ssr nuxtjs-ssr slow4g

# Run comprehensive test on all apps
node cli.js all mobile
```

## 📊 Metrics Captured

- **First Contentful Paint (FCP)**: Time to first content render
- **Largest Contentful Paint (LCP)**: Time to largest element render  
- **Speed Index**: Visual completeness over time
- **Time to Interactive (TTI)**: Time until page is fully interactive
- **Total Blocking Time (TBT)**: Total time tasks block main thread
- **Cumulative Layout Shift (CLS)**: Visual stability metric

## ⚙️ Configuration

Edit `config.js` to customize:

- Number of test runs per application
- Output directory structure
- Lighthouse testing profiles
- Application URLs
- Chrome launcher flags
- Lighthouse options

## 📈 Report Types

### Individual Test Reports
- Detailed results for each test run
- All metrics with values and scores
- Timestamps and configuration details

### Comparison Reports  
- Average, minimum, and maximum values
- Strategy-level comparisons
- Framework performance analysis

### Master Report
- Cross-strategy performance comparison
- Complete overview of all applications
- Framework ranking by rendering strategy

## 🔧 Advanced Usage

### Custom Test Profiles

Add new profiles in `config.js`:

```javascript
testProfiles: {
  custom: {
    emulatedFormFactor: 'mobile',
    throttling: {
      rttMs: 100,
      throughputKbps: 5000,
      cpuSlowdownMultiplier: 2
    }
  }
}
```

### Adding New Applications

Extend the applications configuration:

```javascript
applications: {
  csr: {
    apps: {
      'my-app': {
        name: 'My Custom App',
        url: 'https://my-app.example.com',
        framework: 'Custom'
      }
    }
  }
}
```

## 🔍 Interactive Testing

For guided testing scenarios, use the interactive interface:

```bash
npm run interactive
```

This provides step-by-step guidance for:
- Testing specific rendering strategies
- Comparing framework performance
- Running comprehensive analysis
- Generating detailed reports

## 📚 Additional Resources

- [Quick Start Guide](QUICK_START.md) - Get up and running in minutes
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive testing scenarios
- [Setup Complete](SETUP_COMPLETE.md) - Post-setup verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use and modify for your testing needs.

## 🆘 Support

For issues and questions, please create an issue in the repository or contact the maintainer.