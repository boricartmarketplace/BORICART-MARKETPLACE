import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../src/data/initialCatalog';
import { injectProductMeta, injectCategoryMeta } from '../src/utils/seoMetaInjector';

const DIST_DIR = path.resolve('dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const DOMAIN = 'https://www.boricart.com.ng';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeHtml(targetPath: string, content: string) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content, 'utf-8');
}

async function runPrerender() {
  console.log('🚀 Starting Pre-rendering for Social Media Card Previews (WhatsApp, Facebook, Twitter)...');

  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('❌ Error: dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Load catalog products
  const productMap = new Map<string, any>();
  for (const p of INITIAL_PRODUCTS) {
    if (p.slug) productMap.set(p.slug.toLowerCase(), p);
    if (p.id) productMap.set(p.id.toLowerCase(), p);
  }

  // Load any custom products from disk cache if present
  const customProductsPath = path.resolve('custom_products_cache.json');
  try {
    if (fs.existsSync(customProductsPath)) {
      const customList = JSON.parse(fs.readFileSync(customProductsPath, 'utf-8'));
      if (Array.isArray(customList)) {
        for (const p of customList) {
          if (p.slug) productMap.set(p.slug.toLowerCase(), p);
          if (p.id) productMap.set(p.id.toLowerCase(), p);
        }
      }
    }
  } catch (err) {
    console.warn('Notice: Could not read custom_products_cache.json:', err);
  }

  const uniqueProducts = Array.from(new Set(Array.from(productMap.values())));
  console.log(`📦 Pre-rendering ${uniqueProducts.length} products...`);

  let count = 0;
  for (const product of uniqueProducts) {
    const slug = product.slug || product.id;
    if (!slug) continue;

    const html = injectProductMeta(baseTemplate, product, DOMAIN, `/product/${slug}`);

    // Generate physical static files matching every possible URL path
    writeHtml(path.join(DIST_DIR, 'product', slug, 'index.html'), html);
    writeHtml(path.join(DIST_DIR, 'products', slug, 'index.html'), html);
    writeHtml(path.join(DIST_DIR, 'p', slug, 'index.html'), html);

    if (product.id && product.id !== slug) {
      writeHtml(path.join(DIST_DIR, 'product', product.id, 'index.html'), html);
      writeHtml(path.join(DIST_DIR, 'products', product.id, 'index.html'), html);
      writeHtml(path.join(DIST_DIR, 'p', product.id, 'index.html'), html);
    }

    count++;
  }

  console.log(`✅ Pre-rendered ${count} products into dist/product/*, dist/products/*, and dist/p/*`);

  // Pre-render categories
  for (const cat of INITIAL_CATEGORIES) {
    const catHtml = injectCategoryMeta(baseTemplate, cat, DOMAIN);
    if (cat.slug) {
      writeHtml(path.join(DIST_DIR, 'category', cat.slug, 'index.html'), catHtml);
    }
    if (cat.id && cat.id !== cat.slug) {
      writeHtml(path.join(DIST_DIR, 'category', cat.id, 'index.html'), catHtml);
    }
  }
  console.log(`✅ Pre-rendered ${INITIAL_CATEGORIES.length} category landing pages`);

  // Pre-render Shop & Tracking
  writeHtml(path.join(DIST_DIR, 'shop', 'index.html'), baseTemplate);
  writeHtml(path.join(DIST_DIR, 'track-order', 'index.html'), baseTemplate);
  writeHtml(path.join(DIST_DIR, 'admin', 'index.html'), baseTemplate);

  console.log('✨ Pre-rendering complete! Static HTML files created for instant 10ms CDN delivery with WhatsApp & Facebook preview cards.');
}

runPrerender().catch((err) => {
  console.error('Prerender fatal error:', err);
  process.exit(1);
});
