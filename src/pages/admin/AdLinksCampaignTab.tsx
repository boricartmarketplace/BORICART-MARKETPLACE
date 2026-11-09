import React, { useState } from 'react';
import {
  Link,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Flame,
  ShoppingBag,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Product, Category, StoreSettings } from '../../types';
import { formatNaira } from '../../firebase/services';
import { generateShareUrl } from '../../services/pixelService';

interface AdLinksCampaignTabProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onUpdateDomain: (newDomain: string) => Promise<void>;
  onShowNotice: (type: 'success' | 'error', message: string) => void;
}

export const AdLinksCampaignTab: React.FC<AdLinksCampaignTabProps> = ({
  products,
  categories,
  settings,
  onUpdateDomain,
  onShowNotice,
}) => {
  const customDomain = settings.customDomain || 'https://www.boricart.com.ng';
  const [domainInput, setDomainInput] = useState(customDomain);
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Link Builder state
  const [builderTargetType, setBuilderTargetType] = useState<'product' | 'category' | 'page'>('product');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(categories[0]?.slug || '');
  const [selectedPagePath, setSelectedPagePath] = useState<string>('/shop');
  const [campaignPlatform, setCampaignPlatform] = useState<
    'facebook' | 'tiktok' | 'google' | 'pinterest' | 'whatsapp' | 'clean'
  >('facebook');
  const [campaignName, setCampaignName] = useState<string>('flash_sale');
  const [adContent, setAdContent] = useState<string>('');

  // Search filter
  const [productSearch, setProductSearch] = useState('');

  const handleCopy = (text: string, label: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onShowNotice('success', `Copied ${label}: ${text}`);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setIsSavingDomain(true);
    try {
      let clean = domainInput.trim().replace(/\/$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      await onUpdateDomain(clean);
      setDomainInput(clean);
      onShowNotice('success', `Custom domain updated to ${clean}`);
    } catch {
      onShowNotice('error', 'Failed to save custom domain.');
    } finally {
      setIsSavingDomain(false);
    }
  };

  // Compute live built link
  let targetPath = '/';
  if (builderTargetType === 'product') {
    const p = products.find((x) => x.id === selectedProductId) || products[0];
    targetPath = p ? `/product/${p.slug}` : '/shop';
  } else if (builderTargetType === 'category') {
    targetPath = `/category/${selectedCategorySlug || categories[0]?.slug || ''}`;
  } else {
    targetPath = selectedPagePath;
  }

  const generatedCampaignUrl = generateShareUrl(targetPath, {
    customDomain,
    campaignPlatform,
    campaignName: campaignName.trim() || undefined,
    adContent: adContent.trim() || undefined,
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const staticPages = [
    { name: 'Homepage (Rotating Hero Ads)', path: '/' },
    { name: 'All Products (Catalog)', path: '/shop' },
    { name: 'Shopping Cart', path: '/cart' },
    { name: 'Cash on Delivery Checkout', path: '/checkout' },
    { name: 'Dedicated Admin Portal', path: '/admin' },
    { name: 'Contact & WhatsApp Support', path: '/contact' },
    { name: 'About Boricart', path: '/about' },
    { name: 'Delivery & Returns Policy', path: '/delivery-policy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. CUSTOM DOMAIN & ADMIN LINK CARD */}
      <div className="bg-linear-to-r from-gray-900 via-[#1C1C1C] to-gray-900 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623]">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">Connected Domain & Links</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active & Pointed
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Official store domain: <strong className="text-white">{customDomain}</strong>
              </p>
            </div>
          </div>

          {/* Admin Portal Quick Copy Button */}
          <div className="bg-[#2A2A2A] border border-gray-700 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#F5A623] block">Dedicated Admin Link</span>
              <span className="text-xs font-mono font-bold text-gray-200">
                {customDomain}/admin
              </span>
            </div>
            <button
              onClick={() => handleCopy(`${customDomain}/admin`, 'Admin Portal Link', 'admin-hero')}
              className="px-3 py-1.5 bg-[#F5A623] hover:bg-[#D98200] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copiedKey === 'admin-hero' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Admin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Domain Configuration Input */}
        <form onSubmit={handleSaveDomain} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              Store Primary Domain URL
            </label>
            <input
              type="text"
              required
              placeholder="https://www.boricart.com.ng"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingDomain}
            className="w-full sm:w-auto sm:self-end px-5 py-2.5 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {isSavingDomain ? 'Saving...' : 'Update Domain'}
          </button>
        </form>
      </div>

      {/* 2. INTERACTIVE UTM CAMPAIGN LINK GENERATOR (FACEBOOK, TIKTOK, GOOGLE, PINTEREST) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#D98200] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Ads Campaign & Tracking Link Builder
            </h3>
            <p className="text-xs text-gray-500">
              Generate pixel-optimized links with UTM parameters for Facebook Ads, TikTok Ads, Google PPC, and WhatsApp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Target Destination</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setBuilderTargetType('product')}
                className={`py-1.5 rounded-lg transition-colors ${
                  builderTargetType === 'product' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => setBuilderTargetType('category')}
                className={`py-1.5 rounded-lg transition-colors ${
                  builderTargetType === 'category' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setBuilderTargetType('page')}
                className={`py-1.5 rounded-lg transition-colors ${
                  builderTargetType === 'page' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Page
              </button>
            </div>
          </div>

          {/* Destination Item Selector */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {builderTargetType === 'product' && 'Choose Product Sales Page'}
              {builderTargetType === 'category' && 'Choose Category Page'}
              {builderTargetType === 'page' && 'Choose Store Page'}
            </label>

            {builderTargetType === 'product' && (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatNaira(p.promotionalPrice || p.regularPrice)}) — /product/{p.slug}
                  </option>
                ))}
              </select>
            )}

            {builderTargetType === 'category' && (
              <select
                value={selectedCategorySlug}
                onChange={(e) => setSelectedCategorySlug(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} — /category/{c.slug}
                  </option>
                ))}
              </select>
            )}

            {builderTargetType === 'page' && (
              <select
                value={selectedPagePath}
                onChange={(e) => setSelectedPagePath(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
              >
                {staticPages.map((pg) => (
                  <option key={pg.path} value={pg.path}>
                    {pg.name} — {pg.path}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Ad Platform & Campaign Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Ad Platform / Channel</label>
            <select
              value={campaignPlatform}
              onChange={(e) => setCampaignPlatform(e.target.value as any)}
              className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
            >
              <option value="facebook">📘 Facebook & Instagram Ads</option>
              <option value="tiktok">🎵 TikTok Ads</option>
              <option value="google">🔍 Google Search / Performance Max</option>
              <option value="pinterest">📌 Pinterest Ads</option>
              <option value="whatsapp">💬 WhatsApp Broadcast / Status</option>
              <option value="clean">🌐 Clean Direct Link (No UTM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Name (utm_campaign)</label>
            <input
              type="text"
              placeholder="e.g. flash_promo, black_friday"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Ad Creative / Tag (Optional)</label>
            <input
              type="text"
              placeholder="e.g. video_v1, carousel_ad"
              value={adContent}
              onChange={(e) => setAdContent(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium"
            />
          </div>
        </div>

        {/* Output Box */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Generated Trackable Link
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
              Ready for Ad Campaigns & Pixel Attribution
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-200 font-mono text-xs text-gray-800 break-all select-all">
            {generatedCampaignUrl}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <a
              href={generatedCampaignUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Link</span>
            </a>

            <button
              onClick={() => handleCopy(generatedCampaignUrl, 'Ad Campaign Link', 'builder')}
              className="px-5 py-2 bg-[#F5A623] hover:bg-[#D98200] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copiedKey === 'builder' ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Trackable Ad Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT SALES PAGES LINKS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Product Sales Pages ({products.length})
            </h3>
            <p className="text-xs text-gray-500">
              Each product has a high-converting, distraction-free landing page with live countdown timer and instant Cash on Delivery order form.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Direct Clean Link</th>
                <th className="py-3 px-4 text-right">Instant Ad Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((prod) => {
                const cleanUrl = generateShareUrl(`/product/${prod.slug}`, { customDomain, campaignPlatform: 'clean' });
                const fbUrl = generateShareUrl(`/product/${prod.slug}`, { customDomain, campaignPlatform: 'facebook' });
                const ttUrl = generateShareUrl(`/product/${prod.slug}`, { customDomain, campaignPlatform: 'tiktok' });
                const gUrl = generateShareUrl(`/product/${prod.slug}`, { customDomain, campaignPlatform: 'google' });

                return (
                  <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                          <span className="text-[10px] text-gray-400">{prod.categoryName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-gray-900">
                      {formatNaira(prod.promotionalPrice || prod.regularPrice)}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-gray-500 truncate max-w-[200px]">
                      /product/{prod.slug}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(cleanUrl, `${prod.name} Clean Link`, `prod-clean-${prod.id}`)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          title="Copy clean direct URL"
                        >
                          {copiedKey === `prod-clean-${prod.id}` ? '✓ Copied' : 'Clean Link'}
                        </button>

                        <button
                          onClick={() => handleCopy(fbUrl, `${prod.name} Facebook Link`, `prod-fb-${prod.id}`)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          title="Copy Facebook / Instagram Ads trackable link"
                        >
                          {copiedKey === `prod-fb-${prod.id}` ? '✓ Copied' : '📘 Facebook'}
                        </button>

                        <button
                          onClick={() => handleCopy(ttUrl, `${prod.name} TikTok Link`, `prod-tt-${prod.id}`)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          title="Copy TikTok Ads trackable link"
                        >
                          {copiedKey === `prod-tt-${prod.id}` ? '✓ Copied' : '🎵 TikTok'}
                        </button>

                        <button
                          onClick={() => handleCopy(gUrl, `${prod.name} Google Link`, `prod-g-${prod.id}`)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          title="Copy Google Ads trackable link"
                        >
                          {copiedKey === `prod-g-${prod.id}` ? '✓ Copied' : '🔍 Google'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. CATEGORIES & PAGES LINKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Links */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Layers className="w-4 h-4 text-[#F5A623]" />
            <h4 className="font-extrabold text-sm text-gray-900">Category Landing Pages</h4>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const catUrl = generateShareUrl(`/category/${cat.slug}`, { customDomain, campaignPlatform: 'clean' });
              return (
                <div
                  key={cat.id}
                  className="p-3 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">/category/{cat.slug}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(catUrl, `${cat.name} Category Link`, `cat-${cat.id}`)}
                    className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === `cat-${cat.id}` ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Static Store Pages */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Globe className="w-4 h-4 text-[#F5A623]" />
            <h4 className="font-extrabold text-sm text-gray-900">Storefront & Policy Pages</h4>
          </div>

          <div className="space-y-2">
            {staticPages.map((pg) => {
              const pgUrl = generateShareUrl(pg.path, { customDomain, campaignPlatform: 'clean' });
              return (
                <div
                  key={pg.path}
                  className="p-3 bg-gray-50 hover:bg-amber-50/50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{pg.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{pg.path}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(pgUrl, `${pg.name} Link`, `pg-${pg.path}`)}
                    className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === `pg-${pg.path}` ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
