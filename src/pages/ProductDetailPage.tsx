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
  Lock,
  Gift,
  HelpCircle,
  ArrowDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ProductReview, ProductFaq, StoreSettings } from '../types';
import { formatNaira, createOrder, calculateDeliveryFee } from '../firebase/services';
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
  const [selectedImage, setSelectedImage] = useState<string>(product.mainImage);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPackage, setSelectedPackage] = useState<number>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Countdown Timer state
  const timerHoursInitial = product.timerHours || 24;
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: timerHoursInitial,
    minutes: 41,
    seconds: 18,
  });

  // Live Viewers Counter (Conversion Social Proof)
  const [activeViewers, setActiveViewers] = useState<number>(31);

  // Live Recent Buyer Notification Corner
  const [recentBuyer, setRecentBuyer] = useState<{ name: string; city: string; timeAgo: string } | null>(null);

  // In-page Instant Order Form state
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    altPhone: '',
    state: 'Lagos',
    city: '',
    address: '',
    deliveryDay: 'As soon as possible (1-2 days)',
    notes: '',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Smooth scroll to in-page order form / #checkout
  const scrollToOrderForm = () => {
    const el = document.getElementById('checkout') || document.getElementById('order-now-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Trigger pixel ViewContent on mount / product change
  useEffect(() => {
    trackViewContent(product);
    setSelectedImage(product.mainImage);
  }, [product.id]);

  // Handle #checkout hash navigation on initial page load
  useEffect(() => {
    if (window.location.hash === '#checkout' || window.location.hash === '#order') {
      setTimeout(() => {
        scrollToOrderForm();
      }, 400);
    }
  }, []);

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
      setActiveViewers((v) => Math.max(19, Math.min(48, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 4500);

    return () => clearInterval(viewerInterval);
  }, []);

  // Subtle social proof notification ticker (Nigerian buyers)
  useEffect(() => {
    const buyers = [
      { name: 'Chidinma O.', city: 'Lekki, Lagos', timeAgo: '2 minutes ago' },
      { name: 'Engr. Babatunde A.', city: 'Ikeja, Lagos', timeAgo: '4 minutes ago' },
      { name: 'Dr. Musa I.', city: 'Gwarinpa, Abuja', timeAgo: '7 minutes ago' },
      { name: 'Blessing K.', city: 'Port Harcourt, Rivers', timeAgo: '9 minutes ago' },
      { name: 'Mrs. Funke A.', city: 'Bodija, Ibadan', timeAgo: '11 minutes ago' },
      { name: 'Emeka U.', city: 'Independence Layout, Enugu', timeAgo: '14 minutes ago' },
      { name: 'Alhaji Sani M.', city: 'Nasarawa GRA, Kano', timeAgo: '16 minutes ago' },
    ];

    let bIdx = 0;
    const ticker = setInterval(() => {
      setRecentBuyer(buyers[bIdx]);
      bIdx = (bIdx + 1) % buyers.length;
      setTimeout(() => setRecentBuyer(null), 5500);
    }, 15000);

    return () => clearInterval(ticker);
  }, []);

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];

  const basePrice = product.promotionalPrice || product.regularPrice;
  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;

  // Package Deals Configuration (Alloh Brands signature offer bundles)
  // Package 1: 1 unit
  // Package 2: 2 units (extra discount + Free Delivery)
  // Package 3: 3 units (maximum discount + Free Delivery)
  const packageDeals = [
    {
      id: 1,
      title: '1 Piece (Single Pack)',
      subtext: 'Standard Personal Pack',
      units: 1,
      pricePerUnit: basePrice,
      totalPrice: basePrice,
      badge: 'Standard Offer',
      popular: false,
      freeDelivery: false,
    },
    {
      id: 2,
      title: '2 Pieces (Double Pack)',
      subtext: '1 for You + 1 for Family / Backup',
      units: 2,
      pricePerUnit: Math.round(basePrice * 0.92),
      totalPrice: Math.round(basePrice * 0.92) * 2,
      badge: `🔥 MOST POPULAR • SAVE EXTRA ₦${(basePrice * 2 - Math.round(basePrice * 0.92) * 2).toLocaleString()}`,
      popular: true,
      freeDelivery: true,
    },
    {
      id: 3,
      title: '3 Pieces (Family / Trio Pack)',
      subtext: 'Complete Household Set + Extra Discount',
      units: 3,
      pricePerUnit: Math.round(basePrice * 0.85),
      totalPrice: Math.round(basePrice * 0.85) * 3,
      badge: `⚡ BEST VALUE • SAVE EXTRA ₦${(basePrice * 3 - Math.round(basePrice * 0.85) * 3).toLocaleString()}`,
      popular: false,
      freeDelivery: true,
    },
  ];

  // Active selected deal
  const currentDeal = packageDeals.find((d) => d.id === selectedPackage) || packageDeals[0];
  const itemSubtotal = currentDeal.totalPrice;

  // Location delivery fee calculation
  const calculatedFee = calculateDeliveryFee(
    orderForm.state,
    settings,
    itemSubtotal,
    product
  );
  // Free delivery if bundle is package 2/3 or calculated fee is 0
  const isFreeDelivery = currentDeal.freeDelivery || calculatedFee === 0;
  const currentDeliveryFee = isFreeDelivery ? 0 : calculatedFee;
  const totalAmountDue = itemSubtotal + currentDeliveryFee;

  // Select package handler
  const handleSelectPackage = (pkgId: number) => {
    setSelectedPackage(pkgId);
    const chosen = packageDeals.find((d) => d.id === pkgId);
    if (chosen) {
      setQuantity(chosen.units);
    }
  };

  // Fallback reviews if not provided by admin
  const defaultReviews: ProductReview[] = [
    {
      id: 'rev-def-1',
      author: 'Mrs. Funke Akindele',
      location: 'Ikeja GRA, Lagos',
      rating: 5,
      comment: `I received mine within 24 hours of ordering. The dispatch rider let me open and inspect the parcel before I paid him. This ${product.name} works exactly as advertised! 100% satisfied.`,
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
      author: 'Hajia Amina Bello',
      location: 'GRA, Port Harcourt',
      rating: 5,
      comment: 'I ordered the 2-pack so my sister and I could share. The package arrived safely and both units work like a charm. Highly recommend Boricart!',
      date: '5 days ago',
      verifiedBuyer: true,
    },
    {
      id: 'rev-def-4',
      author: 'Engr. Taiwo Adeleke',
      location: 'Bodija, Ibadan',
      rating: 5,
      comment: 'Fast dispatch and genuine product. I was skeptical about online ads until this arrived. Paid on delivery with bank transfer without any issue.',
      date: '1 week ago',
      verifiedBuyer: true,
    },
  ];

  const activeReviews = product.reviewsList && product.reviewsList.length > 0 ? product.reviewsList : defaultReviews;

  // Fallback FAQs if not provided by admin
  const defaultFaqs: ProductFaq[] = [
    {
      id: 'faq-def-1',
      question: 'How do I pay? Is payment strictly on delivery?',
      answer:
        'YES! You do NOT pay in advance. You only pay when our dispatch rider delivers the package directly to your doorstep. You can pay with Cash or make an instant Bank Transfer/POS to the rider.',
    },
    {
      id: 'faq-def-2',
      question: 'Can I open and inspect the product before paying?',
      answer:
        'ABSOLUTELY! We operate a 100% transparent delivery policy. You have the right to open the package and inspect the item with the courier before parting with your money.',
    },
    {
      id: 'faq-def-3',
      question: 'How long does delivery take to my state?',
      answer:
        'Orders within Lagos and Abuja arrive in 24 to 48 hours. Orders to all other Nigerian states arrive in 2 to 4 business days via express interstate couriers.',
    },
    {
      id: 'faq-def-4',
      question: 'What if the product has an issue after delivery?',
      answer:
        'Every purchase is covered by the Boricart 7-Day Replacement Warranty. If anything is amiss, contact our WhatsApp support team (+2348140008921) and a brand-new replacement unit will be dispatched immediately.',
    },
  ];

  const activeFaqs = product.faqsList && product.faqsList.length > 0 ? product.faqsList : defaultFaqs;

  // Handle Form Submission
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
      setOrderError('Please enter your city / town / LGA.');
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
            productName: `${product.name} (${currentDeal.title})`,
            productImage: product.mainImage,
            price: currentDeal.pricePerUnit,
            quantity: currentDeal.units,
            sku: product.sku,
          },
        ],
        subtotal: itemSubtotal,
        deliveryFee: currentDeliveryFee,
        totalAmount: totalAmountDue,
        notes: `Package: ${currentDeal.title}. Delivery Preference: ${orderForm.deliveryDay}. ${orderForm.notes ? 'Notes: ' + orderForm.notes.trim() : ''}`,
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
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#25D366', '#111111', '#E63946'],
        });
      } catch (err) {
        console.warn(err);
      }

      onNavigate('order-confirmation', { order: savedOrder, orderId: savedOrder.id });
    } catch (err: any) {
      setOrderError('Failed to submit order. Please check connection or order directly via WhatsApp.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-28 sm:pb-36 font-sans selection:bg-[#F5A623] selection:text-black">
      {/* =========================================================================
          1. TOP URGENCY STRIP (Alloh Brands High Scarcity Announcement)
         ========================================================================= */}
      <div className="bg-[#B91C1C] text-white text-center py-2 px-3 text-xs sm:text-sm font-black tracking-wide shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce shrink-0" />
          <span>
            {product.urgencyNotice ||
              'FLASH SALE: PAYMENT ON DELIVERY AVAILABLE NATIONWIDE • OPEN & INSPECT BEFORE PAYMENT!'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. DISTRACTION-FREE BRANDING HEADER (No Nav, No Menu, No Search, No Cart)
         ========================================================================= */}
      <header className="bg-white border-b border-gray-200 py-3 sm:py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/boricart_logo.png"
              alt="BORICART"
              className="h-9 sm:h-11 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-gray-200 pl-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                Official Direct Store
              </span>
              <span className="text-xs font-bold text-gray-800">
                Nationwide Cash on Delivery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                const url = generateShareUrl(`/product/${product.slug}`);
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={scrollToOrderForm}
              className="bg-[#F5A623] hover:bg-[#D98200] text-black font-black text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl shadow-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. MAIN SALES LETTER & CONVERSION CONTAINER (Centered 880px container)
         ========================================================================= */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-8 sm:space-y-12">
        {/* Main Hook & Attention-Grabbing Headline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-[#B45309] font-black text-[11px] sm:text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-[#D98200]" />
            <span>Problem-Solving Everyday Innovation</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-[#111111] leading-[1.2] tracking-tight">
            {product.headline || product.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="font-black text-gray-900">4.9 / 5.0</span>
            <span className="text-gray-500 font-medium">
              (Over {product.reviewCount ? product.reviewCount * 30 : '350+'} Verified Nigerian Buyers)
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              In Stock & Ready to Dispatch
            </span>
          </div>
        </div>

        {/* Hero Visual Media Showcase */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-gray-200 shadow-md space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative group flex items-center justify-center p-2">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            {isDiscounted && (
              <div className="absolute top-3 left-3 bg-[#B91C1C] text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                SAVE {discountPercent}% TODAY
              </div>
            )}
            <div className="absolute bottom-3 inset-x-3 bg-black/75 backdrop-blur-xs text-white text-center py-2 px-3 rounded-xl text-xs font-bold">
              Pay on Delivery Available Nationwide • Zero Upfront Risk
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 p-1 bg-white shrink-0 transition-all cursor-pointer ${
                    selectedImage === img ? 'border-[#F5A623] shadow-md ring-2 ring-[#F5A623]/30' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* 3 Trust Seals */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] sm:text-xs text-gray-800 font-bold text-center">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <ShieldCheck className="w-5 h-5 text-[#F5A623] mx-auto mb-1" />
              <span>Inspect Before Paying</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <Truck className="w-5 h-5 text-[#F5A623] mx-auto mb-1" />
              <span>Speedy Dispatch</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <RotateCcw className="w-5 h-5 text-[#F5A623] mx-auto mb-1" />
              <span>7-Day Replacement</span>
            </div>
          </div>
        </div>

        {/* Live Urgency Countdown Box */}
        {product.enableTimer !== false && (
          <div className="bg-[#111111] text-white rounded-3xl p-5 sm:p-7 border-2 border-yellow-500 shadow-xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-xs sm:text-sm font-black uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-spin text-[#F5A623]" />
              <span>{product.timerHeadline || '🔥 TODAY\'S PROMOTIONAL DISCOUNT EXPIRES IN:'}</span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3 font-mono font-black text-xl sm:text-3xl">
              <div className="bg-[#222222] border border-gray-700 px-3 sm:px-4 py-2 rounded-xl">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="block text-[9px] sm:text-[10px] font-sans font-bold text-gray-400 uppercase">Hours</span>
              </div>
              <span className="text-yellow-400 font-sans">:</span>
              <div className="bg-[#222222] border border-gray-700 px-3 sm:px-4 py-2 rounded-xl">
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="block text-[9px] sm:text-[10px] font-sans font-bold text-gray-400 uppercase">Mins</span>
              </div>
              <span className="text-yellow-400 font-sans">:</span>
              <div className="bg-[#222222] border border-gray-700 px-3 sm:px-4 py-2 rounded-xl text-[#F5A623]">
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="block text-[9px] sm:text-[10px] font-sans font-bold text-gray-400 uppercase">Secs</span>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              ⚠️ <strong>Warning:</strong> Only <strong>{product.stockQuantity || 7} units</strong> remaining in warehouse at this promotional rate. Once sold out, price reverts to regular retail price.
            </p>
          </div>
        )}

        {/* Pricing Stack & Big Pulse CTA Button */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50/40 rounded-3xl p-6 sm:p-8 border-2 border-[#F5A623] shadow-md text-center space-y-5">
          <span className="text-xs font-black uppercase text-[#D98200] tracking-widest block">
            Special Direct-To-Consumer Deal
          </span>

          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {isDiscounted && (
              <span className="text-lg sm:text-2xl text-gray-400 line-through font-bold">
                {formatNaira(product.regularPrice)}
              </span>
            )}
            <span className="text-3xl sm:text-5xl font-black text-[#B91C1C]">
              {formatNaira(basePrice)}
            </span>
            {isDiscounted && (
              <span className="text-xs sm:text-sm font-black bg-emerald-600 text-white px-3 py-1 rounded-full uppercase">
                Save {formatNaira(product.regularPrice - basePrice)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto font-medium leading-relaxed">
            {product.shortDescription ||
              'Zero advance payment required. Inspect your parcel at your doorstep and pay only when you are 100% satisfied.'}
          </p>

          <button
            onClick={scrollToOrderForm}
            className="w-full max-w-lg mx-auto bg-[#F5A623] hover:bg-[#D98200] text-black font-black text-base sm:text-xl py-4 sm:py-5 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>👉 CLICK HERE TO ORDER NOW — PAY ON DELIVERY</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed Safe Delivery • No Online Card Needed</span>
          </div>
        </div>

        {/* =========================================================================
            4. RELATABLE STORY & PAIN POINTS (Nigerian Direct Response Angle)
           ========================================================================= */}
        {(product.storyText || product.storyHeadline) && (
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase text-[#D98200] tracking-widest block">
                The Relatable Story Behind This Innovation
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-[#111111] leading-snug">
                {product.storyHeadline || 'How This Simple Tool Is Saving Everyday Nigerians Time, Stress & Money'}
              </h2>
            </div>

            <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-4 font-normal whitespace-pre-line border-l-4 border-[#F5A623] pl-4 sm:pl-6 bg-gray-50/70 py-4 rounded-r-2xl">
              {product.storyText}
            </div>

            <div className="text-right">
              <button
                onClick={scrollToOrderForm}
                className="text-xs sm:text-sm font-black text-[#D98200] hover:underline cursor-pointer"
              >
                Claim This Solution Today →
              </button>
            </div>
          </section>
        )}

        {/* Problem vs Solution Contrast */}
        {(product.problem || product.solution) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {product.problem && (
              <div className="bg-red-50/80 rounded-2xl p-5 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase">
                  <AlertCircle className="w-4 h-4" />
                  <span>The Problem You Face</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                  {product.problem}
                </p>
              </div>
            )}

            {product.solution && (
              <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Boricart Solution</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                  {product.solution}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Key Features & Benefits */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 text-center">
              Why You Need {product.name} In Your Home
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {product.benefits.map((benefit, bIdx) => (
                <div
                  key={bIdx}
                  className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Product Description & Specifications */}
        {product.description && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">
              Detailed Product Description & Features
            </h3>
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>

            {product.specifications && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-400">Specifications & Box Contents</h4>
                <div className="text-xs text-gray-600 whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  {product.specifications}
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works in 3 Simple Steps */}
        <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6 text-center">
          <h3 className="text-lg sm:text-2xl font-black text-white">
            How It Works in 3 Easy Steps
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[#222222] rounded-2xl border border-gray-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#F5A623] text-black font-black text-sm flex items-center justify-center mx-auto">
                1
              </span>
              <h4 className="font-bold text-sm text-white">Fill The 60-Sec Form</h4>
              <p className="text-xs text-gray-300">
                Choose your package below and enter your delivery details. You pay ₦0 upfront.
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded-2xl border border-gray-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#F5A623] text-black font-black text-sm flex items-center justify-center mx-auto">
                2
              </span>
              <h4 className="font-bold text-sm text-white">Express Dispatch</h4>
              <p className="text-xs text-gray-300">
                We call to confirm and immediately dispatch to our local rider in your city.
              </p>
            </div>

            <div className="p-4 bg-[#222222] rounded-2xl border border-gray-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#F5A623] text-black font-black text-sm flex items-center justify-center mx-auto">
                3
              </span>
              <h4 className="font-bold text-sm text-white">Inspect & Pay</h4>
              <p className="text-xs text-gray-300">
                Open your parcel at your doorstep, verify the item, then pay with cash or transfer.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. VERIFIED CUSTOMER REVIEWS
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-black uppercase text-[#D98200] tracking-widest block">
              Real Testimonials
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              What Customers Across Nigeria Are Saying
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-xs">
                  <span className="font-bold text-gray-900">{rev.author}</span>
                  <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    {rev.location || 'Verified Buyer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            6. OFFICIAL GUARANTEE SEAL
           ========================================================================= */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-emerald-950">
            Our 100% Iron-Clad Cash on Delivery Guarantee
          </h3>
          <p className="text-xs sm:text-sm text-emerald-900 max-w-xl mx-auto leading-relaxed">
            {product.guaranteeText ||
              "Do not pay a kobo until the delivery courier brings the parcel to your doorstep and you inspect it with your own eyes. Plus, enjoy our 7-Day Replacement Warranty if there's any factory defect!"}
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-gray-900 text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2 pt-2">
            {activeFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-gray-50/50 hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 text-xs sm:text-sm text-gray-700 leading-relaxed bg-white border-t border-gray-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            7. IN-PAGE CASH ON DELIVERY CHECKOUT FORM (#checkout)
           ========================================================================= */}
        <section
          id="checkout"
          className="bg-[#111111] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-[#F5A623] space-y-8 scroll-mt-12"
        >
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase text-[#F5A623] tracking-wider bg-[#222222] px-3.5 py-1 rounded-full border border-gray-700 inline-block">
              Zero Upfront Payment • Pay on Arrival
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Claim Your Order Now
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
              Please fill the 60-second delivery form below accurately. A customer service agent will contact you to dispatch your package.
            </p>
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-red-950/70 border-2 border-red-500 rounded-2xl text-xs text-red-200 space-y-1">
            <div className="flex items-center gap-2 font-black text-red-300 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Important Delivery Instructions:</span>
            </div>
            <p className="leading-relaxed">
              1. Please ONLY place this order if you are ready to receive your parcel within <strong>1 to 4 business days</strong>.
              <br />
              2. Ensure you have the cash or bank transfer ready upon delivery.
              <br />
              3. If you will be traveling or unavailable, please do not order now.
            </p>
          </div>

          {orderError && (
            <div className="p-3 bg-red-900 border border-red-400 text-white text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
              <span>{orderError}</span>
            </div>
          )}

          <form onSubmit={handleQuickOrderSubmit} className="space-y-6">
            {/* Step 1: Package Selection (Alloh Brands Style) */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-[#F5A623] tracking-wider">
                Step 1: Choose Your Preferred Package Deal *
              </label>

              <div className="space-y-2.5">
                {packageDeals.map((deal) => {
                  const isSelected = selectedPackage === deal.id;
                  return (
                    <div
                      key={deal.id}
                      onClick={() => handleSelectPackage(deal.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#222222] border-[#F5A623] shadow-lg ring-2 ring-[#F5A623]/30'
                          : 'bg-[#181818] border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="packageSelection"
                            checked={isSelected}
                            onChange={() => handleSelectPackage(deal.id)}
                            className="w-4 h-4 text-[#F5A623] focus:ring-[#F5A623]"
                          />
                          <div>
                            <span className="font-extrabold text-sm sm:text-base text-white block">
                              {deal.title}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              {deal.subtext}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base sm:text-xl font-black text-[#F5A623] block">
                            {formatNaira(deal.totalPrice)}
                          </span>
                          {deal.freeDelivery && (
                            <span className="text-[10px] font-black text-emerald-400 block uppercase">
                              + Free Shipping
                            </span>
                          )}
                        </div>
                      </div>

                      {deal.badge && (
                        <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full mt-2 uppercase ${
                          deal.popular
                            ? 'bg-amber-500/20 text-[#F5A623] border border-amber-500/50'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        }`}>
                          {deal.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Customer Delivery Information */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-black uppercase text-[#F5A623] tracking-wider">
                Step 2: Enter Your Delivery Details *
              </label>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Johnson"
                  value={orderForm.fullName}
                  onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Phone Number (Active & Reachable) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08012345678"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    WhatsApp Number (for dispatch coordination)
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as phone if left empty"
                    value={orderForm.whatsapp}
                    onChange={(e) => setOrderForm({ ...orderForm, whatsapp: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Delivery State *</label>
                  <select
                    value={orderForm.state}
                    onChange={(e) => setOrderForm({ ...orderForm, state: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">City / Town / LGA *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikeja, Lekki, Gwarinpa, Port Harcourt"
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Complete Street Address (Include House Number & Nearest Landmark) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Block 4, Flat 2, Admiralty Way, Beside Zenith Bank, Lekki Phase 1"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  When Do You Want Delivery?
                </label>
                <select
                  value={orderForm.deliveryDay}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryDay: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#222222] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="As soon as possible (1-2 days)">⚡ As soon as possible (1–2 days)</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="Within 3 to 4 days">Within 3 to 4 business days</option>
                  <option value="This Weekend">This Weekend (Saturday/Sunday)</option>
                </select>
              </div>
            </div>

            {/* Order Review Breakdown */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-gray-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Selected Package:</span>
                <span className="text-white font-bold">{currentDeal.title}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Package Price:</span>
                <span>{formatNaira(itemSubtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Money ({orderForm.state}):</span>
                <span className={isFreeDelivery ? 'text-emerald-400 font-bold' : 'text-white'}>
                  {isFreeDelivery ? 'FREE DELIVERY' : formatNaira(currentDeliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-black text-base sm:text-lg text-white pt-2.5 border-t border-gray-700">
                <span>Total Amount Due on Delivery:</span>
                <span className="text-[#F5A623]">{formatNaira(totalAmountDue)}</span>
              </div>
            </div>

            {/* Big Action Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingOrder || isOutOfStock}
              className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-700 text-black font-black py-4 sm:py-5 px-6 rounded-2xl shadow-2xl transition-all text-base sm:text-xl uppercase tracking-wider cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmittingOrder ? 'Submitting Order to Dispatch...' : '✅ CONFIRM MY ORDER — PAY ON DELIVERY'}
            </button>
          </form>
        </section>

        {/* =========================================================================
            8. MINIMALIST DIRECT-RESPONSE FOOTER (No Header/Footer Leaks)
           ========================================================================= */}
        <footer className="pt-8 border-t border-gray-200 text-center space-y-4 text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/assets/aistudio/boricart_logo.png"
              alt="BORICART"
              className="h-7 w-auto object-contain opacity-80"
            />
          </div>

          <p className="max-w-md mx-auto text-[11px] leading-relaxed text-gray-400">
            © 2026 Boricart. All Rights Reserved. Nationwide Delivery Across Nigeria.
            <br />
            Disclaimer: This site is not a part of Facebook or Meta Inc. Boricart is an independent direct-to-consumer store.
          </p>

          <div className="pt-1">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Boricart,%20I%20have%20a%20question%20about%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Need Help Before Ordering? Chat With Us on WhatsApp</span>
            </a>
          </div>
        </footer>
      </main>

      {/* =========================================================================
          9. SUBTLE RECENT BUYER POPUP (Social Proof Ticker)
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
          10. FIXED STICKY MOBILE ORDER BAR (Smooth jump to #checkout)
         ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 z-40 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Pay on Delivery</span>
          <span className="text-base font-black text-[#B91C1C] leading-none">
            {formatNaira(totalAmountDue)}
          </span>
        </div>

        <button
          onClick={scrollToOrderForm}
          disabled={isOutOfStock}
          className="flex-1 bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-400 text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md text-center cursor-pointer animate-pulse"
        >
          {isOutOfStock ? 'Sold Out' : 'ORDER NOW (PAY ON ARRIVAL)'}
        </button>
      </div>
    </div>
  );
};
