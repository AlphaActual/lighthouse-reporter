# 📄 Page-Specific Testing Guide

## 🆕 New Feature: Multi-Page Testing

Your Lighthouse testing suite now supports testing different pages within each application! You can test:

- **Homepage** (`/`) - The landing page (default)
- **About Page** (`/about`) - About us page
- **Blog List** (`/blog`) - Blog listing page  
- **Blog Post** (`/blog/1`) - Individual blog post page

## 🚀 How to Use Page-Specific Testing

### 1. Command Line Interface (CLI)

```bash
# Test a specific page
node cli.js app csr nextjs-csr mobile about
node cli.js app ssr nuxtjs-ssr desktop blog
node cli.js app ssg sveltekit-ssg slow3g blogPost

# Test all frameworks with specific page
node cli.js strategy csr mobile about
node cli.js strategy ssr desktop blog

# Test everything with specific page
node cli.js all mobile about
```

### 2. Interactive Mode

```bash
npm run interactive
```

Then choose option **6 - Page-Specific Testing** for guided page selection.

### 3. NPM Scripts (Quick Commands)

```bash
# Test all apps on different pages
npm run test:all:about     # Test about pages across all apps
npm run test:all:blog      # Test blog pages across all apps
npm run test:all:blogPost  # Test blog post pages across all apps
```

### 4. Custom Test Script

```bash
# Test all 4 pages quickly
node test-pages.js
```

## 📊 Understanding Page-Specific Results

### File Naming Convention
Files now include the page being tested:

```
nextjs-csr_homepage_mobile_3runs_2025-06-09T10-15-30-456Z.csv
nextjs-csr_about_mobile_3runs_2025-06-09T10-20-15-789Z.csv  
nextjs-csr_blog_mobile_3runs_2025-06-09T10-25-00-012Z.csv
nextjs-csr_blogPost_mobile_3runs_2025-06-09T10-30-45-345Z.csv
```

### CSV Headers Include Page Information
- `Page_Name` - Human-readable page name
- `Page_Path` - URL path being tested
- `Tested_URL` - Full URL that was tested
- `Final_URL` - Final URL after redirects

## 🎯 Research Use Cases

### 1. Page Type Performance Analysis
Compare how different page types perform:

```bash
# Test CSR homepage vs about page
node cli.js app csr nextjs-csr mobile home
node cli.js app csr nextjs-csr mobile about

# Compare performance between static vs dynamic content
node cli.js strategy ssg mobile home    # Static homepage
node cli.js strategy ssg mobile blog    # Dynamic blog list
```

### 2. Content-Heavy Page Testing
Test performance impact of different content types:

```bash
# Minimal content (homepage)
node cli.js all mobile home

# List content (blog)  
node cli.js all mobile blog

# Rich content (blog post)
node cli.js all mobile blogPost
```

### 3. Navigation Performance Study
Understand how different pages perform across rendering strategies:

```bash
# Test all strategies for blog functionality
node cli.js strategy csr mobile blog
node cli.js strategy ssr mobile blog  
node cli.js strategy ssg mobile blog
node cli.js strategy isr mobile blog
```

## 📈 Performance Insights by Page Type

### Expected Performance Patterns

**Homepage (`/`)**
- Usually most optimized
- Critical for First Contentful Paint (FCP)
- Often has minimal content for fast loading

**About Page (`/about`)**  
- Typically static content
- Should perform well across all strategies
- Good baseline for comparison

**Blog List (`/blog`)**
- May involve data fetching
- CSR might show slower initial load
- SSG/ISR should excel here

**Blog Post (`/blog/1`)**
- Dynamic content route
- Tests framework routing performance
- SSR should show benefits for SEO content

## 🔧 Configuration Details

### Page Configuration (config.js)
```javascript
pages: {
  home: {
    name: 'Homepage',
    path: '/',
    description: 'Landing page'
  },
  about: {
    name: 'About Page', 
    path: '/about',
    description: 'About us page'
  },
  blog: {
    name: 'Blog List',
    path: '/blog', 
    description: 'Blog listing page'
  },
  blogPost: {
    name: 'Blog Post',
    path: '/blog/1',
    description: 'Individual blog post'
  }
}
```

### Adding Custom Pages
To test additional pages, edit `config.js`:

```javascript
pages: {
  // ...existing pages...
  contact: {
    name: 'Contact Page',
    path: '/contact', 
    description: 'Contact form page'
  },
  pricing: {
    name: 'Pricing Page',
    path: '/pricing',
    description: 'Pricing information page'  
  }
}
```

Then test with:
```bash
node cli.js app csr nextjs-csr mobile contact
```

## 🚀 Quick Start Examples

### Compare Homepage vs About Performance
```bash
# Test both pages quickly
node cli.js app csr nextjs-csr mobile home
node cli.js app csr nextjs-csr mobile about

# Check the CSV files to compare LCP, FCP, and CLS scores
```

### Content Performance Analysis
```bash
# Test content-heavy vs light pages
node cli.js strategy ssr mobile home     # Light content
node cli.js strategy ssr mobile blogPost # Heavy content  

# Compare the results in the strategy comparison report
```

### Cross-Framework Page Comparison  
```bash
# See how all frameworks handle blog functionality
node cli.js strategy csr mobile blog
node cli.js strategy ssr mobile blog
node cli.js strategy ssg mobile blog

# Analyze which rendering strategy + framework combo works best for blog pages
```

## 📋 Migration from Previous Version

If you have existing test scripts, simply add the page parameter:

**Before:**
```bash
node cli.js app csr nextjs-csr mobile
```

**Now (homepage):**
```bash  
node cli.js app csr nextjs-csr mobile home
```

**Or test other pages:**
```bash
node cli.js app csr nextjs-csr mobile about
node cli.js app csr nextjs-csr mobile blog
node cli.js app csr nextjs-csr mobile blogPost
```

The default page is `home`, so existing commands will continue to work without modification.

---

**🎉 Your testing suite now provides comprehensive insights into how different page types perform across rendering strategies and frameworks!**
