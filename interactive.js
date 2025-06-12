#!/usr/bin/env node

/**
 * Interactive Testing Script
 * Provides guided testing scenarios for research purposes
 */

const LighthouseTestRunner = require('./LighthouseTestRunner');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class InteractiveTester {
  constructor() {
    this.runner = new LighthouseTestRunner();
  }
  async start() {
    console.log('🚀 Welcome to the Lighthouse Render Strategy Interactive Tester!\n');
    
    const scenarios = {
      '1': { name: 'Quick Framework Comparison (CSR)', action: () => this.runFrameworkComparison('csr') },
      '2': { name: 'Quick Framework Comparison (SSR)', action: () => this.runFrameworkComparison('ssr') },
      '3': { name: 'Network Performance Analysis', action: () => this.runNetworkAnalysis() },
      '4': { name: 'Single App Deep Dive', action: () => this.runSingleAppAnalysis() },
      '5': { name: 'Complete Strategy Comparison', action: () => this.runCompleteAnalysis() },
      '6': { name: 'Page-Specific Testing', action: () => this.runPageSpecificTest() },
      '7': { name: 'Custom Test', action: () => this.runCustomTest() },
      '8': { name: 'Exit', action: () => process.exit(0) }
    };

    this.showMenu(scenarios);
    
    const choice = await this.getInput('Choose a scenario (1-8): ');
    
    if (scenarios[choice]) {
      await scenarios[choice].action();
    } else {
      console.log('❌ Invalid choice. Please try again.');
      await this.start();
    }
  }

  showMenu(scenarios) {
    console.log('📋 Available Testing Scenarios:\n');
    Object.entries(scenarios).forEach(([key, scenario]) => {
      console.log(`${key}. ${scenario.name}`);
    });
    console.log('');
  }  async runFrameworkComparison(strategy) {
    console.log(`\n🏁 Starting ${strategy.toUpperCase()} Framework Comparison`);
    console.log('This will test all frameworks (Next.js, Nuxt.js, SvelteKit) for', strategy.toUpperCase());
    
    const profile = await this.getInput('Choose profile (mobile/desktop/slow3g/slow4g) [mobile]: ') || 'mobile';
    const page = await this.getInput('Choose page (home/about/blog/blogPost) [home]: ') || 'home';
    
    try {
      await this.runner.runStrategyTests(strategy, profile, page);
      console.log(`\n✅ Framework comparison complete! Check output/${strategy}/ for results.`);
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
    
    await this.continueOrExit();
  }
  async runNetworkAnalysis() {
    console.log('\n🌐 Starting Network Performance Analysis');
    
    const strategy = await this.getInput('Choose strategy (csr/ssr/ssg/isr) [csr]: ') || 'csr';
    const app = await this.getInput(`Choose app (nextjs-${strategy}/nuxtjs-${strategy}/sveltekit-${strategy}) [nextjs-${strategy}]: `) || `nextjs-${strategy}`;
    const page = await this.getInput('Choose page (home/about/blog/blogPost) [home]: ') || 'home';
    
    console.log(`\nTesting ${app} ${page} page across all network conditions...`);
    
    try {      // Test across all network profiles
      for (const profile of ['mobile', 'desktop', 'slow3g', 'slow4g']) {
        console.log(`\n📊 Testing with ${profile} profile...`);
        await this.runner.runTest(app, strategy, profile, page);
      }
      
      console.log('\n✅ Network analysis complete! Compare the CSV files to see network impact.');
    } catch (error) {
      console.error('❌ Network analysis failed:', error.message);
    }
    
    await this.continueOrExit();
  }
  async runSingleAppAnalysis() {
    console.log('\n🔍 Single App Deep Dive Analysis');
      const strategy = await this.getInput('Choose strategy (csr/ssr/ssg/isr): ');
    const app = await this.getInput(`Choose app (nextjs-${strategy}/nuxtjs-${strategy}/sveltekit-${strategy}): `);
    const profile = await this.getInput('Choose profile (mobile/desktop/slow3g/slow4g) [mobile]: ') || 'mobile';
    const page = await this.getInput('Choose page (home/about/blog/blogPost) [home]: ') || 'home';
    
    // Increase runs for more detailed analysis
    const originalRuns = this.runner.config.numberOfRuns;
    this.runner.config.numberOfRuns = 10;
    
    console.log(`\n📈 Running detailed analysis of ${app} ${page} page (10 runs for statistical significance)...`);
    
    try {
      await this.runner.runTest(app, strategy, profile, page);
      console.log('\n✅ Deep dive analysis complete! Check the CSV for detailed performance statistics.');
    } catch (error) {
      console.error('❌ Deep dive analysis failed:', error.message);
    } finally {
      this.runner.config.numberOfRuns = originalRuns;
    }
    
    await this.continueOrExit();
  }
  async runCompleteAnalysis() {
    console.log('\n🌟 Complete Strategy Comparison Analysis');
    console.log('⚠️  This will test ALL applications across ALL strategies. This may take 20-30 minutes.');
    
    const confirm = await this.getInput('Continue? (y/N) [N]: ') || 'N';
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Analysis cancelled.');
      await this.continueOrExit();
      return;    }
    
    const profile = await this.getInput('Choose profile (mobile/desktop/slow3g/slow4g) [mobile]: ') || 'mobile';
    const page = await this.getInput('Choose page (home/about/blog/blogPost) [home]: ') || 'home';
    
    console.log(`\n🚀 Starting comprehensive analysis with ${profile} profile on ${page} page...`);
    
    try {
      await this.runner.runAllTests(profile, page);
      console.log('\n🎉 Complete analysis finished! Check the master comparison report for insights.');
    } catch (error) {
      console.error('❌ Complete analysis failed:', error.message);
    }
    
    await this.continueOrExit();
  }

  async runPageSpecificTest() {
    console.log('\n📄 Page-Specific Performance Testing');
    console.log('Compare how different pages perform across frameworks');
      const strategy = await this.getInput('Choose strategy (csr/ssr/ssg/isr) [csr]: ') || 'csr';
    const profile = await this.getInput('Choose profile (mobile/desktop/slow3g/slow4g) [mobile]: ') || 'mobile';
    
    console.log('\nAvailable pages:');
    console.log('  home     - Homepage / landing page');
    console.log('  about    - About page (/about)');
    console.log('  blog     - Blog listing page (/blog)');
    console.log('  blogPost - Blog post page (/blog/1)');
    
    const page = await this.getInput('\nChoose page (home/about/blog/blogPost): ');
    
    if (!['home', 'about', 'blog', 'blogPost'].includes(page)) {
      console.log('❌ Invalid page choice. Please try again.');
      await this.runPageSpecificTest();
      return;
    }
    
    console.log(`\n🎯 Testing ${page} page across all ${strategy.toUpperCase()} frameworks...`);
    
    try {
      await this.runner.runStrategyTests(strategy, profile, page);
      console.log(`\n✅ Page-specific testing complete! Check the comparison report for ${page} page insights.`);
    } catch (error) {
      console.error('❌ Page-specific test failed:', error.message);
    }
    
    await this.continueOrExit();
  }
  async runCustomTest() {
    console.log('\n⚙️  Custom Test Configuration');
      const strategy = await this.getInput('Strategy (csr/ssr/ssg/isr): ');
    const app = await this.getInput(`App (nextjs-${strategy}/nuxtjs-${strategy}/sveltekit-${strategy}): `);
    const profile = await this.getInput('Profile (mobile/desktop/slow3g/slow4g): ');
    const page = await this.getInput('Page (home/about/blog/blogPost) [home]: ') || 'home';
    const runs = await this.getInput('Number of runs [5]: ') || '5';
    
    const originalRuns = this.runner.config.numberOfRuns;
    this.runner.config.numberOfRuns = parseInt(runs);
    
    console.log(`\n🎯 Running custom test: ${app} on ${strategy} with ${profile} profile, ${page} page (${runs} runs)...`);
    
    try {
      await this.runner.runTest(app, strategy, profile, page);
      console.log('\n✅ Custom test complete!');
    } catch (error) {
      console.error('❌ Custom test failed:', error.message);
    } finally {
      this.runner.config.numberOfRuns = originalRuns;
    }
    
    await this.continueOrExit();
  }

  async continueOrExit() {
    console.log('\n' + '='.repeat(50));
    const choice = await this.getInput('Run another test? (y/N) [N]: ') || 'N';
    
    if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
      await this.start();
    } else {
      console.log('\n👋 Thank you for using the Lighthouse Render Strategy Tester!');
      console.log('📁 Your results are saved in the ./output/ directory.');
      rl.close();
    }
  }

  getInput(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }
}

// Start the interactive tester
const tester = new InteractiveTester();
tester.start().catch(console.error);
