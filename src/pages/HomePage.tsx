import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Star,
  MessageCircle,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
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
  const featuredProducts = publishedProducts.filter((p) => p.isFeatured).slice(0, 4);
  const bestSellers = publishedProducts.filter((p) => p.isBestSeller).slice(0, 4);

  // Fallback to top products if none marked
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : publishedProducts.slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : publishedProducts.slice(2, 6);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50/50 via-white to-white pt-8 pb-12 sm:pt-14 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200/80 text-[#D98200] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>The Boricart Standard • 100% Authentic Brand</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#333333] tracking-tight leading-tight">
                Everyday Solutions. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] to-[#D98200]">
                  Better Living.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover smart, time-saving domestic essentials, power solutions, and personal care
                innovations engineered for effortless convenience in Nigerian homes.
              </p>

              {/* Guarantees badges row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Nationwide Pay on Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
                  <Truck className="w-4 h-4 text-[#F5A623]" />
                  <span>24-48h Fast Lagos Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inspect Before Payment</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-base"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <WhatsAppButton
                  phone={whatsappNumber}
                  label="Chat with Boricart on WhatsApp"
                  variant="outline"
                  className="w-full sm:w-auto text-base py-3.5 px-6 rounded-xl"
                />
              </div>
            </div>

            {/* Right Hero Product Feature Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-200/40 to-orange-200/40 rounded-3xl blur-2xl transform -rotate-3" />

                <div className="relative bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-50 mb-5">
                    <img
                      src={
                        publishedProducts[0]?.mainImage ||
                        'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Boricart Featured Essential"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#333333] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Spotlight Essential
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-full text-emerald-700 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Cash on Delivery Available</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold text-[#F5A623] tracking-wider">
                      {publishedProducts[0]?.categoryName || 'Cleaning Solutions'}
                    </span>
                    <h3 className="text-xl font-bold text-[#333333]">
                      {publishedProducts[0]?.name || 'Boricart Cordless Electric Spin Scrubber'}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {publishedProducts[0]?.shortDescription ||
                        'Dual-speed high-torque motor for effortless cleaning across bathrooms and kitchens.'}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="text-2xl font-black text-[#333333]">
                          {formatNaira(
                            publishedProducts[0]?.promotionalPrice ||
                              publishedProducts[0]?.regularPrice ||
                              29500
                          )}
                        </span>
                        {publishedProducts[0]?.promotionalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {formatNaira(publishedProducts[0].regularPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          publishedProducts[0] &&
                          onNavigate('product', {
                            slug: publishedProducts[0].slug,
                            id: publishedProducts[0].id,
                          })
                        }
                        className="bg-amber-50 hover:bg-[#F5A623] text-[#D98200] hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                      >
                        View Product →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
              Engineered for Every Corner
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('category', { categoryId: cat.id, slug: cat.slug })}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-amber-300 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="aspect-4/3 overflow-hidden bg-gray-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="font-bold text-sm sm:text-base text-[#333333] group-hover:text-[#F5A623] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-gray-400 mt-0.5 block">{count} Products</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayFeatured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </section>

      {/* 4. Cash on Delivery Explainer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#333333] to-[#1F1F1F] rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#F5A623] text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              100% Risk-Free Shopping
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Pay With Cash or Transfer Only When Your Order Arrives At Your Door
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              We understand trust is earned. At Boricart, we don't ask you for upfront bank transfers
              or card payments. Simply place your order online, wait for our dispatch team, open your
              package, inspect the items, and only then pay using Cash or POS / Bank Transfer on the spot.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-[#F5A623] font-black text-xl mb-1 block">1. Place Order</span>
                <p className="text-xs text-gray-300">
                  Select your products, enter your Nigerian address, and choose Cash on Delivery.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-[#F5A623] font-black text-xl mb-1 block">2. Fast Dispatch</span>
                <p className="text-xs text-gray-300">
                  Our team packages and ships your order immediately with tracking updates.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-[#F5A623] font-black text-xl mb-1 block">3. Inspect & Pay</span>
                <p className="text-xs text-gray-300">
                  Check your items thoroughly in the presence of the rider, then make payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best-Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
              Best-Selling Products
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm font-bold text-[#F5A623] hover:underline flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayBestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>
      </section>

      {/* 6. Why Choose Boricart */}
      <section className="bg-gray-50/70 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              The Boricart Difference
            </span>
            <h2 className="text-3xl font-black text-[#333333] tracking-tight mt-1">
              Why Nigerian Homes Trust Boricart
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Unlike generic marketplaces with untested third-party vendors, Boricart controls every
              aspect of product quality, durability, and customer care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#F5A623] mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">100% Single Brand</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We manufacture and source our own line of curated products. No counterfeit worries or
                third-party merchant risks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#F5A623] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Cash on Delivery</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pay only when the package is delivered to your doorstep. You inspect the product quality
                firsthand.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#F5A623] mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Fast Direct Dispatch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Next-day delivery within Lagos and 2 to 4 business days to Abuja, Port Harcourt, Ibadan,
                and all states.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#F5A623] mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Direct WhatsApp Care</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Have questions before ordering? Chat directly with our Nigerian team on WhatsApp for
                instant guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WhatsApp Customer Support Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50/70 border border-emerald-200/60 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-8 h-8 fill-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Instant WhatsApp Assistance
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#333333] mt-0.5">
                Need Help Choosing or Placing an Order?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg">
                Our support team is online to assist with product inquiries, delivery timelines, or
                taking your order directly over WhatsApp.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <WhatsAppButton
              phone={whatsappNumber}
              label="Chat with Boricart on WhatsApp"
              variant="primary"
              className="text-base py-3.5 px-6 shadow-md hover:shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews / Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            Verified Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
            Loved Across Nigeria
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-sm text-gray-600 italic mb-4">
              "The electric spin scrubber is a game changer for my bathroom tiles. I was skeptical about
              ordering online, but paying Cash on Delivery in Ikeja gave me full confidence."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#D98200] font-bold flex items-center justify-center text-sm">
                TA
              </div>
              <div>
                <p className="font-bold text-sm text-[#333333]">Tolulope A.</p>
                <p className="text-xs text-gray-400">Ikeja, Lagos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-sm text-gray-600 italic mb-4">
              "Ordered the 65W power bank. It charges my MacBook during power cuts effortlessly. Arrived
              in Abuja in 2 days and the rider had a working POS machine for payment."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#D98200] font-bold flex items-center justify-center text-sm">
                EO
              </div>
              <div>
                <p className="font-bold text-sm text-[#333333]">Emeka O.</p>
                <p className="text-xs text-gray-400">Maitama, Abuja</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex items-center text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-sm text-gray-600 italic mb-4">
              "The spray mop is light and doesn't leave floor streaks. Customer service on WhatsApp was
              very polite and helped me track the dispatch rider until he reached my gate."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#D98200] font-bold flex items-center justify-center text-sm">
                BI
              </div>
              <div>
                <p className="font-bold text-sm text-[#333333]">Blessing I.</p>
                <p className="text-xs text-gray-400">GRA, Port Harcourt</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
