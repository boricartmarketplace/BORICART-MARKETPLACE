import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { Product, StoreSettings, HeroAdSlide } from '../../types';
import { formatNaira } from '../../firebase/services';
import { useCart } from '../../context/CartContext';

interface HeroAdsSliderProps {
  products: Product[];
  settings?: StoreSettings;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const HeroAdsSlider: React.FC<HeroAdsSliderProps> = ({
  products,
  settings,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Compute slides to display based on admin settings and catalog
  const slides = useMemo(() => {
    const list: HeroAdSlide[] = [];

    // 1. Check custom slides saved by admin in store settings
    if (settings?.heroAdsSlides && settings.heroAdsSlides.length > 0) {
      const activeCustomSlides = settings.heroAdsSlides.filter((s) => s.isActive !== false);
      if (activeCustomSlides.length > 0) {
        list.push(...activeCustomSlides);
      }
    }

    // 2. Check if admin selected specific product IDs for the Hero Ads
    const selectedIds = settings?.heroSelectedProductIds || [];
    const heroProducts = products.filter(
      (p) =>
        p.status === 'published' &&
        (selectedIds.includes(p.id) || p.showInHeroAds || p.isBestSeller)
    );

    // If no custom slides were added, generate slides for selected products
    if (list.length === 0) {
      // Default Brand slide first
      list.push({
        id: 'brand-hero-slide',
        badge: settings?.heroTagline || 'Everyday Solutions. Better Living.',
        headline: settings?.heroHeadline || 'Everyday Solutions.',
        subhead: settings?.heroSubhead || 'Better Living.',
        description:
          settings?.heroDescription ||
          'Discover practical products designed to make everyday life easier, smarter and more convenient across Nigeria.',
        buttonText: settings?.heroButtonText || 'Shop All Products',
        image: settings?.heroImage || '/assets/aistudio/image_11326346.png',
        isActive: true,
      });

      // Add product slides
      heroProducts.slice(0, 5).forEach((p, idx) => {
        const discount =
          p.promotionalPrice && p.regularPrice > p.promotionalPrice
            ? Math.round(((p.regularPrice - p.promotionalPrice) / p.regularPrice) * 100)
            : undefined;

        list.push({
          id: `product-slide-${p.id}`,
          productId: p.id,
          badge:
            p.heroAdBadge ||
            (discount ? `SPECIAL DEAL • ${discount}% OFF` : p.isBestSeller ? 'HOT BEST SELLER' : 'POPULAR PICK'),
          headline: p.heroAdHeadline || p.name,
          subhead: p.headline || p.categoryName,
          description: p.shortDescription || p.description.slice(0, 120) + '...',
          buttonText: 'Order Now',
          image: p.mainImage,
          price: p.promotionalPrice || p.regularPrice,
          originalPrice: p.promotionalPrice ? p.regularPrice : undefined,
          discountPercentage: discount,
          isActive: true,
          sortOrder: idx + 2,
        });
      });
    }

    return list.length > 0
      ? list
      : [
          {
            id: 'fallback-slide',
            badge: 'Everyday Solutions. Better Living.',
            headline: 'Smart Solutions.',
            subhead: 'Better Living.',
            description:
              'Practical daily problem-solving innovations directly from Boricart Nigeria.',
            buttonText: 'Shop Now',
            image: '/assets/aistudio/image_11326346.png',
            isActive: true,
          },
        ];
  }, [settings?.heroAdsSlides, settings?.heroSelectedProductIds, settings?.heroImage, settings?.heroHeadline, settings?.heroSubhead, settings?.heroDescription, settings?.heroTagline, settings?.heroButtonText, products]);

  const totalSlides = slides.length;
  const autoScrollInterval = (settings?.heroAutoScrollInterval || 5) * 1000;

  // Auto-scroll effect
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, autoScrollInterval]);

  // Safe slide index
  const safeIndex = currentSlideIndex < totalSlides ? currentSlideIndex : 0;
  const currentSlide = slides[safeIndex] || slides[0];

  // Associated product if slide is linked to a catalog product
  const associatedProduct = currentSlide.productId
    ? products.find((p) => p.id === currentSlide.productId)
    : null;

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleSlideAction = () => {
    if (associatedProduct) {
      onNavigate('product', { id: associatedProduct.id, slug: associatedProduct.slug });
    } else {
      onNavigate('shop');
    }
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (associatedProduct) {
      addToCart(associatedProduct, 1);
      onNavigate('checkout');
    } else {
      onNavigate('shop');
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative bg-gradient-to-b from-[#FFF8EE] via-[#FFFBF6] to-[#FFF4E0] border-b border-amber-100/70 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Ads and Featured Products Carousel"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pt-10 sm:pb-16 relative z-10">
        {/* Top Header Tag: ADS & PROMOTIONAL SPOTLIGHT */}
        <div className="flex items-center justify-between pb-4 sm:pb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#D98200]">
              Featured Solutions & Special Offers
            </span>
          </div>

          {/* Slide counter & pause indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-semibold bg-white/70 px-3 py-1 rounded-full border border-amber-200/50">
            <span>
              {safeIndex + 1} / {totalSlides}
            </span>
            {isPaused && <span className="text-[10px] text-[#D98200] font-bold">• Paused</span>}
          </div>
        </div>

        {/* Main Slide Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[380px] sm:min-h-[440px]">
          {/* Left Text & Commercial Pitch */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            {/* Promotional Badge */}
            {currentSlide.badge && (
              <div className="inline-flex items-center gap-1.5 bg-[#FDE8C5] text-[#D98200] px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-tight shadow-2xs border border-amber-300/40">
                <Flame className="w-3.5 h-3.5 fill-[#D98200]" />
                <span>{currentSlide.badge}</span>
              </div>
            )}

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-[#1F1F1F] tracking-tight leading-[1.08] transition-all duration-300">
                {currentSlide.headline}
              </h1>
              {currentSlide.subhead && (
                <p className="text-xl sm:text-3xl lg:text-3xl font-extrabold text-[#F5A623] tracking-tight">
                  {currentSlide.subhead}
                </p>
              )}
            </div>

            {/* Description Body */}
            <p className="text-sm sm:text-base text-gray-700 max-w-xl leading-relaxed font-medium">
              {currentSlide.description}
            </p>

            {/* Product Price & Discount Display (If present) */}
            {(currentSlide.price || associatedProduct) && (
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-4xl font-black text-[#1F1F1F]">
                  {formatNaira(currentSlide.price || associatedProduct?.promotionalPrice || associatedProduct?.regularPrice || 0)}
                </span>
                {(currentSlide.originalPrice || (associatedProduct?.promotionalPrice && associatedProduct.regularPrice)) && (
                  <span className="text-base sm:text-xl text-gray-400 line-through font-bold">
                    {formatNaira(currentSlide.originalPrice || associatedProduct?.regularPrice || 0)}
                  </span>
                )}
                {currentSlide.discountPercentage && (
                  <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Save {currentSlide.discountPercentage}%
                  </span>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSlideAction}
                className="bg-[#F5A623] hover:bg-[#D98200] text-black hover:text-white font-black px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm sm:text-base cursor-pointer group"
              >
                <span>{currentSlide.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>

              {associatedProduct && (
                <button
                  onClick={handleQuickOrder}
                  className="bg-black hover:bg-gray-800 text-white font-extrabold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 text-sm cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#F5A623]" />
                  <span>Order on Delivery</span>
                </button>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-gray-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pay on Delivery Nationwide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#F5A623]" />
                <span>Fast 24–48h Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>7-Day Replacement Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Image Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div
              onClick={handleSlideAction}
              className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white cursor-pointer group"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.headline}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/image_11326346.png';
                }}
              />

              {/* Bottom overlay with quick details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-wider block">
                      Direct from Boricart
                    </span>
                    <h3 className="text-base font-black truncate max-w-[220px]">
                      {currentSlide.headline}
                    </h3>
                  </div>
                  <span className="bg-white/20 hover:bg-[#F5A623] hover:text-black backdrop-blur-md p-2.5 rounded-full transition-colors text-white">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Top rating or tag pill */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-black text-gray-900">
                <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                <span>4.9 / 5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Bar (Arrows & Interactive Dots) */}
        {totalSlides > 1 && (
          <div className="mt-8 pt-4 border-t border-amber-200/60 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    safeIndex === idx
                      ? 'w-8 h-2.5 bg-[#F5A623]'
                      : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  title={slide.headline}
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#F5A623] hover:text-[#F5A623] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#F5A623] hover:text-[#F5A623] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
