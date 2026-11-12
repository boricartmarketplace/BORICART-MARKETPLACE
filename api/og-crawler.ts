import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/data/initialCatalog';
import { injectProductMeta } from '../src/utils/seoMetaInjector';

export default async function handler(req: any, res: any) {
  try {
    const slug = (req.query?.slug as string) || '';
    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

    // Find product in catalog
    let matchedProduct: any = null;

    for (const p of INITIAL_PRODUCTS) {
      if (p.slug && p.slug.toLowerCase() === cleanSlug) {
        matchedProduct = p;
        break;
      }
      if (p.id && p.id.toLowerCase() === cleanSlug) {
        matchedProduct = p;
        break;
      }
      if (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === cleanSlug) {
        matchedProduct = p;
        break;
      }
    }

    // Try custom products disk cache
    if (!matchedProduct) {
      try {
        const cachePath = path.resolve(process.cwd(), 'custom_products_cache.json');
        if (fs.existsSync(cachePath)) {
          const list = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
          if (Array.isArray(list)) {
            matchedProduct = list.find(
              (p: any) =>
                (p.slug && p.slug.toLowerCase() === cleanSlug) ||
                (p.id && p.id.toLowerCase() === cleanSlug)
            );
          }
        }
      } catch {
        // Continue if cache cannot be read
      }
    }

    // If still not matched, synthesize from slug
    if (!matchedProduct) {
      const formattedTitle = cleanSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      matchedProduct = {
        name: formattedTitle || 'Special Offer Product',
        slug: cleanSlug,
        mainImage: 'https://www.boricart.com.ng/assets/aistudio/image_11326346.png',
        shortDescription: `Order ${formattedTitle || 'products'} online at Boricart Nigeria. Up to 35% discount, Pay on Delivery, and express nationwide shipping.`,
        regularPrice: 4500,
        promotionalPrice: 4500,
      };
    }

    // Read index.html template
    let template = '';
    const possiblePaths = [
      path.resolve(process.cwd(), 'dist/index.html'),
      path.resolve(process.cwd(), 'index.html'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        template = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!template) {
      template = `<!doctype html><html><head><title>Boricart Nigeria</title><meta property="og:title" content="Boricart" /></head><body></body></html>`;
    }

    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'www.boricart.com.ng';
    const domain = host.includes('localhost') ? `http://${host}` : `https://${host}`;

    const renderedHtml = injectProductMeta(template, matchedProduct, domain, `/product/${cleanSlug}`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    res.status(200).send(renderedHtml);
  } catch (error: any) {
    res.status(500).send(`Error rendering preview: ${error.message}`);
  }
}
