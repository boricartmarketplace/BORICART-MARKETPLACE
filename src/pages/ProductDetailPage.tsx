import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Heart,
  MessageCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  UserCheck,
  MapPin,
  Eye,
  Share2,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ProductReview, ProductFaq, StoreSettings } from '../types';
import { formatNaira, createOrder, calculateDeliveryFee } from '../firebase/services';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { NIGERIAN_STATES } from '../data/initialCatalog';
import { trackViewContent, trackPurchase, getAdAttribution, generateShareUrl } from '../services/pixelService';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  deliveryFee?: number;
  settings?: StoreSettings;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  whatsappNumber = '+2348140008921',
  deliveryFee = 2500,
  settings,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<string>(product.mainImage);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Countdown Timer state
  const timerHoursInitial = product.timerHours || 24;
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: timerHoursInitial,
    minutes: 43,
    seconds: 28,
  });

  // Live Viewers Counter (Conversion Social Proof)
  const [activeViewers, setActiveViewers] = useState<number>(18);

  // Live Recent Buyer Notification Corner
  const [recentBuyer, setRecentBuyer] = useState<{ name: string; city: string; timeAgo: string } | null>(null);

  // In-page Instant Order Form state
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    state: 'Lagos',
    city: '',
    address: '',
    notes: '',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Trigger pixel ViewContent on mount / product change
  useEffect(() => {
    trackViewContent(product);
    setSelectedImage(product.mainImage);
  }, [product.id]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Randomized Live Shoppers Counter
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setActiveViewers((v) => Math.max(12, Math.min(34, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 4500);

    return () => clearInterval(viewerInterval);
  }, []);

  // Subtle social proof notification ticker (Nigerian buyers)
  useEffect(() => {
    const buyers = [
      { name: 'Chidinma O.', city: 'Lekki, Lagos', timeAgo: '2 minutes ago' },
      { name: 'Engr. Babatunde A.', city: 'Ikeja, Lagos', timeAgo: '5 minutes ago' },
      { name: 'Dr. Musa I.', city: 'Gwarinpa, Abuja', timeAgo: '7 minutes ago' },
      { name: 'Blessing K.', city: 'Port Harcourt, Rivers', timeAgo: '9 minutes ago' },
      { name: 'Mrs. Funke A.', city: 'Bodija, Ibadan', timeAgo: '12 minutes ago' },
      { name: 'Emeka U.', city: 'Enugu', timeAgo: '15 minutes ago' },
    ];

    let bIdx = 0;
    const ticker = setInterval(() => {
      setRecentBuyer(buyers[bIdx]);
      bIdx = (bIdx + 1) % buyers.length;
      setTimeout(() => setRecentBuyer(null), 5000);
    }, 14000);

    return () => clearInterval(ticker);
  }, []);

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];

  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const currentPrice = product.promotionalPrice || product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;

  const itemSubtotal = currentPrice * quantity;
  const currentDeliveryFee = calculateDeliveryFee(
    orderForm.state,
    settings,
    itemSubtotal,
    product
  );
  const isFreeDelivery = currentDeliveryFee === 0;
  const totalAmountDue = itemSubtotal + currentDeliveryFee;

  // Fallback reviews if not provided by admin
  const defaultReviews: ProductReview[] = [
    {
      id: 'rev-def-1',
      author: 'Mrs. Funke Akindele',
      location: 'Ikeja GRA, Lagos',
      rating: 5,
      comment: `I received mine within 24 hours of ordering. The dispatch rider let me inspect the parcel before I paid him. This ${product.name} works exactly as advertised! 100% satisfied.`,
      date: 'Yesterday',
      verifiedBuyer: true,
    },
    {
      id: 'rev-def-2',
      author: 'Dr. Chinedu Okafor',
      location: 'Gwarinpa, Abuja',
      rating: 5,
      comment: 'Very solid build and super easy to use. No more wasting money on low quality products. The Cash on Delivery made me very comfortable to buy.',
      date: '3 days ago',
      verifiedBuyer: true,
    },
    {
      id: 'rev-def-3',
      author: 'Blessing Adebayo',
      location: 'Bodija, Ibadan',
      rating: 5,
      comment: 'My family loves this! Excellent customer service on WhatsApp too when I asked about delivery tracking.',
      date: '5 days ago',
      verifiedBuyer: true,
    },
    {
      id: 'rev-def-4',
      author: 'Engr. Ibrahim Danladi',
      location: 'GRA Phase 2, Port Harcourt',
      rating: 5,
      comment: 'One of my best online purchases this year. Delivered quickly and securely packaged. Highly recommended for every Nigerian home.',
      date: '1 week ago',
      verifiedBuyer: true,
    },
  ];

  const activeReviews = product.reviewsList && product.reviewsList.length > 0 ? product.reviewsList : defaultReviews;

  // Fallback FAQs if not provided by admin
  const defaultFaqs: ProductFaq[] = [
    {
      id: 'faq-def-1',
      question: 'How does Cash on Delivery work?',
      answer: 'You do not pay a single Naira online! When our courier arrives at your doorstep, you open the parcel to confirm everything is complete and in perfect condition before handing over the cash or making an instant bank transfer.',
    },
    {
      id: 'faq-def-2',
      question: 'How fast will my order arrive?',
      answer: 'Orders within Lagos and Abuja arrive in 24 to 48 hours. Orders to all other Nigerian states arrive in 2 to 4 business days.',
    },
    {
      id: 'faq-def-3',
      question: 'What if it arrives damaged or does not work?',
      answer: 'Every purchase is covered by the Boricart 7-Day Replacement Warranty. If anything is amiss, contact our WhatsApp support team (+2348140008921) and a brand-new unit will be dispatched immediately.',
    },
    {
      id: 'faq-def-4',
      question: 'How do I use this product?',
      answer: 'Every package contains a clear illustrated user guide. If you have any questions, our customer support team is always available on WhatsApp to guide you.',
    },
  ];

  const activeFaqs = product.faqsList && product.faqsList.length > 0 ? product.faqsList : defaultFaqs;

  // Smooth scroll to in-page order form
  const scrollToOrderForm = () => {
    const el = document.getElementById('order-now-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!orderForm.fullName.trim() || orderForm.fullName.trim().length < 3) {
      setOrderError('Please enter your full name.');
      return;
    }
    if (!orderForm.phone.trim() || orderForm.phone.trim().length < 10) {
      setOrderError('Please enter a valid phone number for the rider to reach you.');
      return;
    }
    if (!orderForm.city.trim()) {
      setOrderError('Please enter your city / LGA.');
      return;
    }
    if (!orderForm.address.trim() || orderForm.address.trim().length < 8) {
      setOrderError('Please enter your complete street delivery address.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const attribution = getAdAttribution();

      const orderPayload = {
        customerName: orderForm.fullName.trim(),
        phone: orderForm.phone.trim(),
        whatsappNumber: orderForm.whatsapp.trim() || orderForm.phone.trim(),
        state: orderForm.state,
        city: orderForm.city.trim(),
        deliveryAddress: orderForm.address.trim(),
        items: [
          {
            productId: product.id,
            productName: product.name,
            productImage: product.mainImage,
            price: currentPrice,
            quantity,
            sku: product.sku,
          },
        ],
        subtotal: itemSubtotal,
        deliveryFee: currentDeliveryFee,
        totalAmount: totalAmountDue,
        notes: orderForm.notes.trim() || undefined,
        utmSource: attribution?.utmSource,
        utmMedium: attribution?.utmMedium,
        utmCampaign: attribution?.utmCampaign,
        utmContent: attribution?.utmContent,
        utmTerm: attribution?.utmTerm,
        fbclid: attribution?.fbclid,
        ttclid: attribution?.ttclid,
        gclid: attribution?.gclid,
      };

      const savedOrder = await createOrder(orderPayload);

      // Trigger Pixel Purchase Event across Facebook, Google, TikTok, and Pinterest
      trackPurchase(savedOrder);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#25D366', '#111111'],
        });
      } catch (err) {
        console.warn(err);
      }

      onNavigate('order-confirmation', { order: savedOrder, orderId: savedOrder.id });
    } catch (err: any) {
      setOrderError('Failed to place order. Please try again or order directly via WhatsApp.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 sm:pb-32 font-sans selection:bg-[#F5A623] selection:text-black">
      {/* =========================================================================
          1. URGENCY TOP COUNTDOWN BANNER (Zero Distraction / High Scarcity)
         ========================================================================= */}
      {product.enableTimer !== false && (
        <div className="bg-[#111111] text-white border-b border-gray-800 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="font-black text-[#F5A623] uppercase tracking-wider text-[11px] sm:text-xs">
                {product.timerHeadline || '🔥 LIMITED FLASH SALE ENDS IN:'}
              </span>
            </div>

            {/* Countdown Clock Display */}
            <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm">
              <div className="bg-[#222222] border border-gray-700 px-2 py-1 rounded-lg text-white">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span>:</span>
              <div className="bg-[#222222] border border-gray-700 px-2 py-1 rounded-lg text-white">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span>:</span>
              <div className="bg-[#222222] border border-gray-700 px-2 py-1 rounded-lg text-[#F5A623]">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-gray-300 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Cash on Delivery Available Nationwide</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb / Back button */}
      <div className="bg-gray-50 border-b border-gray-200/60 py-2.5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 hover:text-[#F5A623] font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Category:</span>
              <button
                onClick={() => onNavigate('category', { categoryId: product.categoryId, slug: product.categoryId })}
                className="font-extrabold text-gray-900 hover:text-[#F5A623] hover:underline cursor-pointer"
              >
                {product.categoryName}
              </button>
            </div>

            <button
              onClick={() => {
                const url = generateShareUrl(`/product/${product.slug}`);
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }
              }}
              title="Copy official shareable link"
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 border border-gray-200 hover:border-[#F5A623] text-gray-700 hover:text-[#D98200] rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        {/* =========================================================================
            2. SALES HEADLINE & SOCIAL PROOF BADGE
           ========================================================================= */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="text-[11px] font-black uppercase bg-amber-100 text-[#D98200] px-3 py-1 rounded-full tracking-wider border border-amber-200">
              Verified Everyday Solution
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              In Stock & Ready for Same-Day Dispatch
            </span>
            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              {activeViewers} people viewing this offer right now
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#111111] leading-tight tracking-tight">
            {product.headline || product.name}
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-black text-gray-900">{product.rating || 4.9} / 5.0</span>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || activeReviews.length * 45} Verified Nigerian Customer Reviews)
            </span>
          </div>
        </div>

        {/* =========================================================================
            3. HERO OFFER STACK (Product Visuals + Price + Fast Order)
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Product Images with Guarantee Badges */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-center relative overflow-hidden group">
                {isDiscounted && (
                  <span className="absolute top-3 left-3 bg-[#F5A623] text-black text-xs font-black px-3.5 py-1 rounded-full shadow-sm">
                    SAVE {discountPercent}% TODAY
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-xs text-gray-700 hover:text-[#F5A623] transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'fill-[#F5A623] text-[#F5A623]' : ''
                    }`}
                  />
                </button>
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all cursor-pointer ${
                        selectedImage === img ? 'border-[#F5A623] shadow-xs' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* 3 Pillars of Trust */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-700 font-bold text-center">
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  <ShieldCheck className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>Inspect & Pay on Delivery</span>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  <Truck className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>Speedy Dispatch Nationwide</span>
                </div>
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  <RotateCcw className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>7-Day Replacement Warranty</span>
                </div>
              </div>
            </div>

            {/* Right: Compelling Pricing, Short Summary & Primary CTA */}
            <div className="lg:col-span-6 space-y-5">
              {/* Urgency Alert Bar */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-bold">
                <Flame className="w-4 h-4 text-red-600 shrink-0 animate-bounce" />
                <span>
                  {product.urgencyNotice ||
                    `⚠️ High Demand: Only ${product.stockQuantity || 7} units remaining at today's promotional price!`}
                </span>
              </div>

              {/* Price Banner */}
              <div className="p-5 bg-linear-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#F5A623]">
                    {formatNaira(currentPrice)}
                  </span>
                  {isDiscounted && (
                    <span className="text-base text-gray-400 line-through">
                      {formatNaira(product.regularPrice)}
                    </span>
                  )}
                  {isDiscounted && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md ml-auto">
                      Save {formatNaira(product.regularPrice - currentPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 font-semibold">
                  Zero Upfront Payment Required. Pay with cash or bank transfer to the delivery rider upon arrival.
                </p>
              </div>

              {/* Short Summary */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                {product.shortDescription}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-black text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
                    disabled={isOutOfStock}
                    className="p-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  Total: <strong className="text-gray-900 font-bold">{formatNaira(currentPrice * quantity)}</strong>
                </span>
              </div>

              {/* Primary Call-to-Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={scrollToOrderForm}
                  disabled={isOutOfStock}
                  className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-black font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer group"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                  <span>{isOutOfStock ? 'Sold Out' : 'ORDER NOW — PAY ON DELIVERY'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={isOutOfStock}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>

                  <WhatsAppButton
                    phone={whatsappNumber}
                    product={product}
                    variant="outline"
                    label="Order via WhatsApp"
                    className="w-full justify-center text-xs font-bold py-3"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 flex items-start gap-2 border border-gray-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Our Promise:</strong> You don't risk a kobo. Open the delivery package and inspect the item with the courier before parting with your money.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. THE RELATABLE REAL-LIFE STORY (Conversion Copywriting)
           ========================================================================= */}
        {(product.storyText || product.storyHeadline) && (
          <div className="bg-linear-to-b from-amber-50/40 via-white to-gray-50/40 rounded-3xl p-6 sm:p-10 border border-amber-200/80 shadow-xs space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#D98200] tracking-widest block">
                The Story Behind This Solution
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
                {product.storyHeadline || `How Nigerian Families Are Finally Putting An End to Everyday Hassles`}
              </h2>
            </div>

            <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-4 font-normal whitespace-pre-line border-l-4 border-[#F5A623] pl-4 sm:pl-6 italic">
              {product.storyText}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-black text-gray-900">
                — Verified Boricart Customer Experience
              </span>
              <button
                onClick={scrollToOrderForm}
                className="text-xs font-black text-[#D98200] hover:underline cursor-pointer"
              >
                Claim Your Discount Now →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. PROBLEM VS. SOLUTION COMPARISON
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Problem */}
          <div className="bg-red-50/70 border border-red-200 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-base">
              ✕
            </div>
            <h3 className="font-black text-lg text-red-950">The Everyday Struggle</h3>
            <p className="text-xs sm:text-sm text-red-900/90 leading-relaxed">
              {product.problem ||
                'Traditional methods are slow, exhausting, and often fail to produce long-lasting clean results, costing you precious weekend hours and wasted money on bad alternatives.'}
            </p>
          </div>

          {/* The Solution */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base">
              ✓
            </div>
            <h3 className="font-black text-lg text-emerald-950">The Boricart Solution</h3>
            <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
              {product.solution ||
                'Engineered with modern materials and ergonomic durability, Boricart delivers reliable efficiency to get the job done right the first time without fatigue.'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            6. KEY ADVANTAGES & BULLET BENEFITS
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-black text-[#F5A623] uppercase tracking-wider">
              Proven Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
              Why You Need {product.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              product.benefits || [
                'Fast, reliable performance designed specifically for Nigerian homes',
                'Durable high-grade materials tested to withstand rigorous daily use',
                'Saves valuable weekend time and eliminates daily physical exhaustion',
                '100% Cash on Delivery protection with 7-day hassle-free replacement warranty',
              ]
            ).map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#F5A623] transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* Technical Specifications & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div>
              <h3 className="font-black text-sm text-gray-900 mb-3">Specifications</h3>
              <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2 text-gray-700 border border-gray-200">
                {product.specifications ? (
                  product.specifications.split('|').map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b border-gray-200/80 pb-1.5 last:border-0"
                    >
                      <span className="font-bold text-gray-900">{spec.split(':')[0]}</span>
                      <span className="text-gray-600">{spec.split(':')[1]}</span>
                    </div>
                  ))
                ) : (
                  <p>Standard Boricart commercial quality specifications.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-black text-sm text-gray-900 mb-3">How to Use</h3>
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs text-gray-800 whitespace-pre-line leading-relaxed">
                {product.usageInstructions ||
                  '1. Unbox your item and check all components.\n2. Follow the quick diagram in the user guide.\n3. Enjoy effortless everyday results!'}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. AUTHENTIC VERIFIED CUSTOMER REVIEWS
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-black text-[#F5A623] uppercase tracking-wider">
                Real Customer Feedback
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
                What Verified Buyers Are Saying
              </h2>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-black text-gray-900">{product.rating || 4.9} out of 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <div>
                    <span className="font-black text-gray-900 block">{rev.author}</span>
                    {rev.location && (
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {rev.location}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            8. OBJECTION HANDLING FREQUENTLY ASKED QUESTIONS (FAQS)
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-black text-[#F5A623] uppercase tracking-wider">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {activeFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="rounded-2xl border border-gray-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-black text-xs sm:text-sm text-gray-900 flex items-center justify-between bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-gray-700 leading-relaxed bg-white border-t border-gray-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            9. IN-PAGE CASH ON DELIVERY INSTANT ORDER FORM (No Distraction Checkout)
           ========================================================================= */}
        <div
          id="order-now-section"
          className="bg-[#111111] text-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-gray-800 space-y-8 scroll-mt-20"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase text-[#F5A623] tracking-wider bg-[#222222] px-3.5 py-1 rounded-full border border-gray-700 inline-block">
                Zero Upfront Risk • Pay on Delivery
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Claim {product.name} Now
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Fill out the 60-second delivery form below. Pay cash or bank transfer only after you inspect your parcel at your doorstep!
              </p>
            </div>

            {orderError && (
              <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{orderError}</span>
              </div>
            )}

            <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Johnson"
                    value={orderForm.fullName}
                    onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08012345678"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    WhatsApp Number (for delivery rider updates)
                  </label>
                  <input
                    type="tel"
                    placeholder="Optional if same as phone"
                    value={orderForm.whatsapp}
                    onChange={(e) => setOrderForm({ ...orderForm, whatsapp: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Delivery State *</label>
                  <select
                    value={orderForm.state}
                    onChange={(e) => setOrderForm({ ...orderForm, state: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">City / Town / LGA *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ikeja, Lekki, Gwarinpa, Port Harcourt"
                  value={orderForm.city}
                  onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Complete Street Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House/Plot number, street name, nearest landmark"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              {/* Order Calculation Review */}
              <div className="bg-[#1C1C1C] p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Selected Product:</span>
                  <span className="text-white font-bold">{product.name} (x{quantity})</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Unit Price:</span>
                  <span>{formatNaira(currentPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee ({orderForm.state}):</span>
                  <span className={isFreeDelivery ? 'text-emerald-400 font-bold' : 'text-white'}>
                    {isFreeDelivery ? 'FREE DELIVERY' : formatNaira(currentDeliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-base text-white pt-2 border-t border-gray-700">
                  <span>Total Amount Due on Delivery:</span>
                  <span className="text-[#F5A623]">{formatNaira(totalAmountDue)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder || isOutOfStock}
                className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-700 text-black font-black py-4 px-6 rounded-2xl shadow-xl transition-all text-base uppercase tracking-wider cursor-pointer"
              >
                {isSubmittingOrder ? 'Submitting Order to Dispatch...' : 'CONFIRM ORDER — PAY ON DELIVERY'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* =========================================================================
          10. SUBTLE RECENT BUYER NOTIFICATION TOAST
         ========================================================================= */}
      {recentBuyer && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 bg-[#111111]/95 text-white p-3.5 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 text-xs max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-200">
              {recentBuyer.name} from {recentBuyer.city}
            </p>
            <p className="text-[10px] text-gray-400">
              Just ordered {product.name} ({recentBuyer.timeAgo})
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. STICKY MOBILE CALL-TO-ACTION BAR
         ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 z-40 flex items-center justify-between gap-3 shadow-xl">
        <div>
          <span className="text-[10px] text-gray-500 font-bold block">Pay on Delivery</span>
          <span className="text-base font-black text-[#F5A623]">{formatNaira(currentPrice)}</span>
        </div>

        <button
          onClick={scrollToOrderForm}
          disabled={isOutOfStock}
          className="flex-1 bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md text-center cursor-pointer"
        >
          {isOutOfStock ? 'Sold Out' : 'ORDER NOW — PAY ON DELIVERY'}
        </button>
      </div>
    </div>
  );
};
