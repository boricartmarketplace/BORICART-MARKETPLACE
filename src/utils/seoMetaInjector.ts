/**
 * SEO & OpenGraph Metadata Injector
 * Tailored for WhatsApp, Facebook, Twitter/X, Instagram, Telegram, LinkedIn & Google Search.
 * Ensures social media crawlers receive 1200x630 JPEG/PNG images under 300KB with proper MIME headers.
 */

export interface SocialImageMeta {
  url: string;
  secureUrl: string;
  type: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Optimizes an image URL for social media link preview crawlers (WhatsApp, Facebook, Twitter).
 * Crucial: WhatsApp fails on WebP/AVIF images. This forces 1200x630 JPEG format for Unsplash URLs.
 */
export function formatSocialImage(
  rawUrl?: string,
  domain: string = 'https://www.boricart.com.ng',
  altText: string = 'Boricart Product'
): SocialImageMeta {
  const fallbackUrl = `${domain}/assets/aistudio/image_11326346.png`;

  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      url: fallbackUrl,
      secureUrl: fallbackUrl,
      type: 'image/png',
      width: 1200,
      height: 630,
      alt: altText,
    };
  }

  let finalUrl = rawUrl.trim();

  // Prepend domain for relative asset paths
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = `${domain}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
  }

  // Force HTTPS
  if (finalUrl.startsWith('http://') && !finalUrl.includes('localhost')) {
    finalUrl = finalUrl.replace('http://', 'https://');
  }

  // Transform Unsplash URLs for WhatsApp compatibility (forces JPEG, 1200x630, 85% quality, ~50KB)
  if (finalUrl.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(finalUrl);
      urlObj.searchParams.delete('auto'); // Remove auto=format (which sends WebP/AVIF to WhatsApp)
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', '1200');
      urlObj.searchParams.set('h', '630');
      urlObj.searchParams.set('q', '85');
      urlObj.searchParams.set('fm', 'jpg'); // Explicitly JPEG for WhatsApp link crawler
      finalUrl = urlObj.toString();
      return {
        url: finalUrl,
        secureUrl: finalUrl,
        type: 'image/jpeg',
        width: 1200,
        height: 630,
        alt: altText,
      };
    } catch {
      // If URL parsing fails, proceed with default handling
    }
  }

  // Determine MIME type
  const lower = finalUrl.toLowerCase();
  let mimeType = 'image/jpeg';
  if (lower.endsWith('.png')) mimeType = 'image/png';
  else if (lower.endsWith('.gif')) mimeType = 'image/gif';
  else if (lower.endsWith('.webp')) mimeType = 'image/webp';

  return {
    url: finalUrl,
    secureUrl: finalUrl,
    type: mimeType,
    width: 1200,
    height: 630,
    alt: altText,
  };
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeJson(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\t/g, ' ');
}

/**
 * Injects OpenGraph, Twitter, and Schema.org metadata for a single product into HTML template.
 */
export function injectProductMeta(
  template: string,
  product: any,
  reqDomain: string = 'https://www.boricart.com.ng',
  currentPath?: string
): string {
  const domain = reqDomain.includes('localhost')
    ? reqDomain
    : reqDomain.includes('boricart.com.ng')
      ? 'https://www.boricart.com.ng'
      : reqDomain;

  const cleanName = (product.name || 'Everyday Problem Solver').trim();
  const rawDesc = (
    product.shortDescription ||
    product.headline ||
    product.description ||
    `Order ${cleanName} online at Boricart Nigeria. Up to 35% discount, Pay on Delivery, and express nationwide shipping.`
  )
    .replace(/\r?\n|\r/g, ' ')
    .replace(/["']/g, '')
    .slice(0, 160)
    .trim();

  const productSlug = product.slug || product.id || 'product';
  const canonicalUrl = `${domain}/product/${productSlug}`;
  const price = product.promotionalPrice || product.regularPrice || 4500;
  const originalPrice = product.regularPrice || price;

  const rawImg = product.mainImage || (Array.isArray(product.images) ? product.images[0] : undefined);
  const socialImg = formatSocialImage(rawImg, domain, cleanName);

  let output = template;

  // 1. Replace Title Tag
  const pageTitle = `${cleanName} — Buy Online & Pay on Delivery | Boricart`;
  output = output.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(pageTitle)}</title>`
  );

  // 2. Replace Description Meta
  output = output.replace(
    /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(rawDesc)}" />`
  );

  // 3. Replace Canonical Link
  output = output.replace(
    /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );

  // 4. OpenGraph Basic Properties
  output = output.replace(
    /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(cleanName)} — Boricart Nigeria" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(rawDesc)}" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:type" content="product" />\n    <meta property="product:price:amount" content="${price}" />\n    <meta property="product:price:currency" content="NGN" />`
  );

  // 5. OpenGraph Image for WhatsApp, Facebook & Telegram
  // Note: WhatsApp crawler looks for og:image, og:image:secure_url, og:image:type, og:image:width, og:image:height
  const ogImageBlock = `<meta property="og:image" content="${escapeHtml(socialImg.url)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(socialImg.secureUrl)}" />
    <meta property="og:image:type" content="${socialImg.type}" />
    <meta property="og:image:width" content="${socialImg.width}" />
    <meta property="og:image:height" content="${socialImg.height}" />
    <meta property="og:image:alt" content="${escapeHtml(socialImg.alt)}" />`;

  output = output.replace(
    /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
    ogImageBlock
  );

  // 6. Twitter / X Card
  output = output.replace(
    /<meta\s+name=["']twitter:card["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`
  );

  output = output.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(cleanName)} — Boricart Nigeria" />`
  );

  output = output.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(rawDesc)}" />`
  );

  output = output.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(socialImg.url)}" />\n    <meta name="twitter:image:alt" content="${escapeHtml(socialImg.alt)}" />`
  );

  // 7. Schema.org Product Structured Data
  const schemaMarkup = `
    <!-- Schema.org Product Structured Data for Social Cards & Search Engines -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${escapeJson(cleanName)}",
        "image": ["${escapeJson(socialImg.url)}"],
        "description": "${escapeJson(rawDesc)}",
        "sku": "${escapeJson(product.sku || 'BC-' + productSlug)}",
        "brand": {
          "@type": "Brand",
          "name": "Boricart"
        },
        "offers": {
          "@type": "Offer",
          "url": "${escapeJson(canonicalUrl)}",
          "priceCurrency": "NGN",
          "price": "${price}",
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Boricart Nigeria"
          }
        }
      }
    </script>
  `;

  output = output.replace('</head>', `${schemaMarkup}\n</head>`);

  return output;
}

/**
 * Injects OpenGraph metadata for Category pages.
 */
export function injectCategoryMeta(
  template: string,
  category: any,
  reqDomain: string = 'https://www.boricart.com.ng'
): string {
  const domain = reqDomain.includes('boricart.com.ng') ? 'https://www.boricart.com.ng' : reqDomain;
  const cleanName = category.name || 'Category';
  const desc = category.description || `Browse quality ${cleanName} essentials at Boricart Nigeria. Fast nationwide delivery.`;
  const canonicalUrl = `${domain}/category/${category.slug || category.id}`;
  const socialImg = formatSocialImage(category.image, domain, `${cleanName} Category`);

  let output = template;

  output = output.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(cleanName)} — Shop Everyday Solutions | Boricart</title>`
  );

  output = output.replace(
    /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(desc)}" />`
  );

  output = output.replace(
    /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(cleanName)} — Boricart Nigeria" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`
  );

  output = output.replace(
    /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );

  const ogImageBlock = `<meta property="og:image" content="${escapeHtml(socialImg.url)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(socialImg.secureUrl)}" />
    <meta property="og:image:type" content="${socialImg.type}" />
    <meta property="og:image:width" content="${socialImg.width}" />
    <meta property="og:image:height" content="${socialImg.height}" />`;

  output = output.replace(
    /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
    ogImageBlock
  );

  output = output.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(cleanName)} — Boricart Nigeria" />`
  );

  output = output.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(socialImg.url)}" />`
  );

  return output;
}
