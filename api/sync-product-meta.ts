import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const product = req.body;
    if (product && (product.slug || product.id)) {
      const cachePath = path.resolve(process.cwd(), 'custom_products_cache.json');
      let customList: any[] = [];
      try {
        if (fs.existsSync(cachePath)) {
          customList = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
          if (!Array.isArray(customList)) customList = [];
        }
      } catch {
        customList = [];
      }

      // Upsert product into cache
      const cleanSlug = (product.slug || product.id).toLowerCase();
      const existingIdx = customList.findIndex(
        (p) => (p.slug && p.slug.toLowerCase() === cleanSlug) || (p.id && p.id.toLowerCase() === cleanSlug)
      );
      if (existingIdx >= 0) {
        customList[existingIdx] = product;
      } else {
        customList.push(product);
      }

      try {
        fs.writeFileSync(cachePath, JSON.stringify(customList, null, 2), 'utf-8');
      } catch {
        // Disk write might be read-only in Vercel lambda, which is normal
      }

      res.status(200).json({ success: true, count: customList.length });
      return;
    }
    res.status(400).json({ error: 'Product data required' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
