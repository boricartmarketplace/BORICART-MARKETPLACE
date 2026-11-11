import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Smile,
  Home,
  Sparkles,
  Headphones as GadgetIcon,
  Smartphone,
  Shirt,
  Activity,
  Grid,
  ChevronRight,
  ShoppingBag,
  Heart,
  MessageCircle,
  Star,
  CheckCircle2,
  Flame,
  Crown,
} from 'lucide-react';
import { Product, Category, CollectionItem, StoreSettings } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { BORICART_COLLECTIONS } from '../data/initialCatalog';
import { formatNaira } from '../firebase/services';
import { HeroAdsSlider } from '../components/home/HeroAdsSlider';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  settings?: StoreSettings;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  settings,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  // Always sort published products newest first so created items appear immediately
  const publishedProducts = React.useMemo(() => {
    return products
      .filter((p) => p.status === 'published')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products]);

  // Filter New Arrivals (items marked as featured or the newest additions)
  const newArrivals = React.useMemo(() => {
    const featured = publishedProducts.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : publishedProducts.slice(0, 8);
  }, [publishedProducts]);

  // Filter top sellers (items marked as best seller or fallback)
  const bestSellers = React.useMemo(() => {
    const sellers = publishedProducts.filter((p) => p.isBestSeller);
    return sellers.length > 0 ? sellers : publishedProducts.slice(0, 8);
  }, [publishedProducts]);

  // Category Icon Resolver matching the screenshot icons
  const getCategoryIcon = (slug: string, name: string) => {
    const s = slug.toLowerCase();
    if (s.includes('home')) return <Home className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('clean')) return <Sparkles className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('gadget')) return <GadgetIcon className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('elect')) return <Smartphone className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('fashion')) return <Shirt className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('beauty')) return <Sparkles className="w-6 h-6 text-[#F5A623]" />;
    if (s.includes('sport')) return <Activity className="w-6 h-6 text-[#F5A623]" />;
    return <Grid className="w-6 h-6 text-[#F5A623]" />;
  };

  // Helper to dynamically get thumbnails for collection cards from real published products
  const getCollectionThumbnails = (col: typeof BORICART_COLLECTIONS[0]) => {
    const matching = publishedProducts.filter(
      (p) =>
        p.collectionId === col.id ||
        (col.id === 'cleaning-mastery' && p.categoryId.toLowerCase().includes('clean')) ||
        (col.id === 'culinary-essentials' && (p.categoryId.toLowerCase().includes('kitchen') || p.categoryId.toLowerCase().includes('cook'))) ||
        (col.id === 'smart-living-tools' && (p.categoryId.toLowerCase().includes('gadget') || p.categoryId.toLowerCase().includes('smart'))) ||
        (col.id === 'lifestyle-wellbeing' && (p.categoryId.toLowerCase().includes('beauty') || p.categoryId.toLowerCase().includes('well')))
    );
    const productImgs = matching.map((p) => p.mainImage).filter(Boolean);
    const combined = [...productImgs, ...col.productThumbnails];
    return Array.from(new Set(combined)).slice(0, 4);
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 sm:pb-24">
      {/* =========================================================================
          1. HERO ADS & PRODUCTS SPOTLIGHT CAROUSEL (Scrolling Different Products & Promotional Deals)
         ========================================================================= */}
      <HeroAdsSlider
        products={publishedProducts}
        settings={settings}
        onNavigate={onNavigate}
      />

      {/* =========================================================================
          2. SHOP BY CATEGORY SHORTCUTS (Horizontal row with soft cream cards)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
          {categories.slice(0, 8).map((cat) => {
            const count = publishedProducts.filter(
              (p) =>
                p.categoryId === cat.id ||
                p.categoryId === cat.slug ||
                (p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase())
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', { categoryId: cat.id, slug: cat.slug })}
                className="flex-1 min-w-[105px] sm:min-w-[125px] bg-[#FFF9F2] hover:bg-[#FDE8C5]/80 border border-amber-200/50 hover:border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-1.5 transition-all group shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.slug, cat.name)}
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-[#F5A623] transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </span>
                {count > 0 && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. NEW ARRIVALS & FRESH INNOVATIONS (Directly pushed from Admin upon creation)
         ========================================================================= */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm">
                ⚡
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
                    New Arrivals & Fresh Innovations
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Just Added
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Practical problem-solvers & direct-response solutions newly in stock
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('shop', { sortBy: 'newest' })}
              className="text-xs sm:text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
            >
              <span>View All New</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4-column product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          4. BORICART COLLECTIONS (Section 7: In place of multi-vendor marketplace)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#F5A623] fill-[#F5A623]" />
            <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
              Shop by Collection
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs sm:text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>View All Collections</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Collection Cards (Populated dynamically from active store products) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BORICART_COLLECTIONS.map((col) => {
            const previewThumbs = getCollectionThumbnails(col);

            return (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#F5A623]/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header with Title and Boricart Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-amber-100 text-[#D98200] px-2 py-0.5 rounded-full uppercase">
                      {col.badge || 'Official'}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">Boricart Line</span>
                  </div>

                  <div className="text-center py-1">
                    <h3 className="font-black text-sm text-[#111111]">{col.name}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{col.description}</p>
                  </div>

                  {/* 4 Preview Product Thumbnails (Dynamic from catalog) */}
                  <div className="grid grid-cols-4 gap-2 my-3.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    {previewThumbs.map((thumb, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200/80 p-0.5"
                      >
                        <img src={thumb} alt="Preview" className="w-full h-full object-cover rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Orange Explore Collection button */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => onNavigate('shop', { collection: col.id })}
                    className="w-full bg-[#F5A623] hover:bg-[#D98200] text-black hover:text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Explore Collection</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. TOP SELLING PRODUCTS (OUR BEST SELLERS & HOTTEST OFFERS)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F5A623] fill-[#F5A623]" />
            <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
              Top Selling Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { filter: 'deals' })}
            className="text-xs sm:text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-column product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. ALL EVERYDAY ESSENTIALS & PRACTICAL SOLUTIONS (Complete Storefront Grid)
         ========================================================================= */}
      {publishedProducts.length > 4 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F5A623]" />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
                  All Everyday Problem Solvers
                </h2>
                <p className="text-xs text-gray-500">
                  Every product delivered with Cash on Delivery & nationwide transit
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs sm:text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
            >
              <span>View All ({publishedProducts.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {publishedProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          5. PROMOTIONAL BANNER (Exact dark textured banner from screenshot)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-lg border border-gray-800 text-white p-6 sm:p-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Brand Badge */}
            <div className="md:col-span-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F5A623] flex items-center justify-center text-black shadow-sm shrink-0">
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  Boricart
                </h3>
                <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider block">
                  Everyday Solutions
                </span>
              </div>
            </div>

            {/* Center Messaging */}
            <div className="md:col-span-5 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#F5A623] tracking-tight">
                Shop Smart. Save More.
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Discover practical everyday products at great prices with nationwide delivery.
              </p>
            </div>

            {/* Right Action */}
            <div className="md:col-span-3 flex justify-start md:justify-end">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-[#F5A623] hover:bg-[#D98200] text-black font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WHY SHOP WITH BORICART? (4 Benefit Cards from screenshot)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Secure Shopping */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[#111111] shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#111111]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111111]">Secure Shopping</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Your data is safe</p>
              </div>
            </div>

            {/* 2. Fast Delivery */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[#111111] shrink-0">
                <Truck className="w-6 h-6 text-[#111111]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111111]">Fast Delivery</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Across Nigeria</p>
              </div>
            </div>

            {/* 3. Dedicated Support */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[#111111] shrink-0">
                <Headphones className="w-6 h-6 text-[#111111]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111111]">Dedicated Support</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">We're here to help</p>
              </div>
            </div>

            {/* 4. Satisfaction Guaranteed */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-[#111111] shrink-0">
                <Smile className="w-6 h-6 text-[#111111]" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#111111]">Satisfaction Guaranteed</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Shop with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. WHATSAPP COMMUNITY & UPDATES (Section 12)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FFF9F2] to-amber-50 rounded-3xl p-6 sm:p-10 border border-amber-200/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Stay Connected With Boricart
            </span>
            <h3 className="text-2xl font-black text-[#111111]">
              Join Our VIP WhatsApp Community
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg">
              Discover new products, practical solutions, and receive special discount offers directly
              on your WhatsApp.
            </p>
          </div>

          <div className="shrink-0">
            <WhatsAppButton
              phone={whatsappNumber}
              label="Join WhatsApp Community"
              variant="primary"
              className="text-xs sm:text-sm font-bold px-6 py-3.5 shadow-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
