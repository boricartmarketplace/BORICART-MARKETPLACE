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
import { Product, Category, CollectionItem } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { BORICART_COLLECTIONS } from '../data/initialCatalog';
import { formatNaira } from '../firebase/services';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const publishedProducts = products.filter((p) => p.status === 'published');

  // Filter top sellers and featured
  const bestSellers = publishedProducts.filter((p) => p.isBestSeller);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : publishedProducts.slice(0, 8);

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

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 sm:pb-24">
      {/* =========================================================================
          1. HERO SECTION (Exact visual reproduction of reference screenshot)
         ========================================================================= */}
      <section className="relative bg-[#FFF9F2] overflow-hidden border-b border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Headline & Content */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left z-10">
              {/* "Welcome to Boricart" badge pill */}
              <div className="inline-flex items-center gap-1.5 bg-[#FDE8C5] text-[#D98200] px-3.5 py-1 rounded-full text-xs font-bold tracking-tight">
                <span>Welcome to Boricart</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.08]">
                Everyday Solutions. <br />
                <span className="text-[#F5A623]">Better Living.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-gray-700 max-w-md leading-relaxed font-medium">
                Discover practical products designed to make everyday life easier, smarter and more
                convenient.
              </p>

              {/* Orange Shop Now Pill Button */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-[#F5A623] hover:bg-[#D98200] text-black hover:text-white font-extrabold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm sm:text-base group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </button>
              </div>

              {/* Slider Dots (from reference screenshot) */}
              <div className="flex items-center gap-2 pt-4">
                <span className="w-6 h-2 rounded-full bg-[#F5A623]" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Right Hero Image (Couple pointing, exact composition from screenshot) */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                  alt="Everyday Solutions. Better Living with Boricart"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl shadow-sm text-xs font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Nationwide Pay on Delivery • Inspect before payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SHOP BY CATEGORY SHORTCUTS (Horizontal row with soft cream cards)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('category', { categoryId: cat.id, slug: cat.slug })}
              className="flex-1 min-w-[105px] sm:min-w-[125px] bg-[#FFF9F2] hover:bg-[#FDE8C5]/80 border border-amber-200/50 hover:border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 transition-all group shadow-2xs hover:shadow-xs shrink-0 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.slug, cat.name)}
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-[#F5A623] transition-colors leading-tight line-clamp-2">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. BORICART COLLECTIONS (Section 7: In place of multi-vendor marketplace)
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

        {/* 4 Collection Cards (Matching the 4-card structure from the reference screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BORICART_COLLECTIONS.map((col) => (
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

                {/* 4 Preview Product Thumbnails (Exact replica of screenshot card layout!) */}
                <div className="grid grid-cols-4 gap-2 my-3.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  {col.productThumbnails.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200/80 p-0.5"
                    >
                      <img src={thumb} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Like / Details and Orange Explore Collection button */}
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
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. TOP SELLING PRODUCTS (OUR BEST SELLERS)
             Exact 4-column layout with discount pills, stars, orange price, Add to Cart
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
            onClick={() => onNavigate('shop')}
            className="text-xs sm:text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-column product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayBestSellers.slice(0, 8).map((product) => (
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
