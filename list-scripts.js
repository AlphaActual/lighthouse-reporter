#!/usr/bin/env node

/**
 * Utility script to list all available npm scripts
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('🚀 Available NPM Scripts:\n');

const scripts = packageJson.scripts;
const categories = {
  'All Tests': ['test:all', 'test:all:mobile', 'test:all:desktop', 'test:all:slow3g'],
  'CSR Tests': ['test:csr', 'test:csr:mobile', 'test:csr:desktop', 'test:csr:slow3g'],
  'SSR Tests': ['test:ssr', 'test:ssr:mobile', 'test:ssr:desktop', 'test:ssr:slow3g'],
  'SSG Tests': ['test:ssg', 'test:ssg:mobile', 'test:ssg:desktop', 'test:ssg:slow3g'],
  'ISR Tests': ['test:isr', 'test:isr:mobile', 'test:isr:desktop', 'test:isr:slow3g'],
  'Next.js Tests': ['test:nextjs-csr', 'test:nextjs-ssr', 'test:nextjs-ssg', 'test:nextjs-isr'],
  'Nuxt.js Tests': ['test:nuxtjs-csr', 'test:nuxtjs-ssr', 'test:nuxtjs-ssg', 'test:nuxtjs-isr'],
  'SvelteKit Tests': ['test:sveltekit-csr', 'test:sveltekit-ssr', 'test:sveltekit-ssg', 'test:sveltekit-isr'],
  'Utilities': ['help']
};

for (const [category, scriptNames] of Object.entries(categories)) {
  console.log(`📂 ${category}:`);
  scriptNames.forEach(name => {
    if (scripts[name]) {
      console.log(`   npm run ${name.padEnd(20)} # ${scripts[name]}`);
    }
  });
  console.log('');
}

console.log('💡 Quick Commands:');
console.log('   node demo.js                    # Quick demo (2 runs)');
console.log('   node cli.js help               # CLI help');
console.log('   node list-scripts.js           # This script');
console.log('');

console.log('📁 Output Location: ./output/');
console.log('📊 Results are saved as CSV files organized by rendering strategy');
