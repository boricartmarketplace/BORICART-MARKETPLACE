import React, { useState } from 'react';
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
  Share2,
  Heart,
  MessageCircle,
  HelpCircle,
  Play,
  Clock,
  Sparkles,
  AlertCircle,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { formatNaira, createOrder } from '../firebase/services';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ProductCard } from '../components/common/ProductCard';
import { NIGERIAN_STATES } from '../data/initialCatalog';
import { trackViewContent } from '../services/pixelService';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  deliveryFee?: number;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  whatsappNumber = '+2348140008921',
  deliveryFee = 2500,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<string>(product.mainImage);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger pixel ViewContent on mount / product change
  React.useEffect(() => {
    trackViewContent(product);
  }, [product.id]);

  // In-page Instant Order Form state
  const [showOrderModal, setShowOrderModal] = useState(false);
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

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];

  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const currentPrice = product.promotionalPrice || product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;

  const itemSubtotal = currentPrice * quantity;
  const isFreeDelivery = itemSubtotal >= 15000;
  const currentDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const totalAmountDue = itemSubtotal + currentDeliveryFee;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.status === 'published')
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
      };

      const savedOrder = await createOrder(orderPayload);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#25D366', '#111111'],
        });
      } catch (err) {
        console.warn(err);
      }

      setShowOrderModal(false);
      onNavigate('order-confirmation', { order: savedOrder, orderId: savedOrder.id });
    } catch (err: any) {
      setOrderError('Failed to place order. Please try again or order directly via WhatsApp.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 sm:pb-24">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 hover:text-[#F5A623] font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="cursor-pointer hover:underline" onClick={() => onNavigate('home')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:underline" onClick={() => onNavigate('category', { categoryId: product.categoryId })}>
              {product.categoryName}
            </span>
            <span>/</span>
            <span className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* =========================================================================
            1. SALES LANDING PAGE HERO (Image Gallery + Compelling Offer)
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Product Images */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square bg-white rounded-2xl border border-gray-200/80 p-4 flex items-center justify-center relative overflow-hidden group">
                {isDiscounted && (
                  <span className="absolute top-3 left-3 bg-[#F5A623] text-black text-xs font-black px-3 py-1 rounded-full shadow-2xs">
                    -{discountPercent}% OFF
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-xs text-gray-700 hover:text-[#F5A623]"
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
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl border-2 p-1 bg-white shrink-0 transition-all ${
                        selectedImage === img ? 'border-[#F5A623] shadow-xs' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-600 font-semibold text-center">
                <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <ShieldCheck className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>Pay on Delivery</span>
                </div>
                <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <Truck className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>Nationwide Dispatch</span>
                </div>
                <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <RotateCcw className="w-4 h-4 text-[#F5A623] mx-auto mb-1" />
                  <span>7-Day Warranty</span>
                </div>
              </div>
            </div>

            {/* Right: Compelling Headline, Price & Call to Actions */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-[#D98200] px-2.5 py-0.5 rounded-full tracking-wider">
                    {product.categoryName}
                  </span>
                  <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                </div>

                {/* Compelling Headline */}
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] leading-tight">
                  {product.headline || product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-800">{product.rating || 4.9}</span>
                  <span className="text-xs text-gray-400">
                    ({product.reviewCount || 140} verified Nigerian customers)
                  </span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-amber-200/70 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#F5A623]">
                  {formatNaira(currentPrice)}
                </span>
                {isDiscounted && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    {formatNaira(product.regularPrice)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto">
                  Cash on Delivery Available
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                {product.shortDescription}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-bold text-gray-700">Select Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 text-gray-600 hover:text-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-black text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
                    disabled={isOutOfStock}
                    className="p-2 text-gray-600 hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Total: <strong className="text-gray-900">{formatNaira(currentPrice * quantity)}</strong>
                </span>
              </div>

              {/* Prominent ORDER NOW Button (Primary Action from Section 15 & 16) */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={isOutOfStock}
                  className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-200 text-black font-black py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  <span>{isOutOfStock ? 'Sold Out' : 'ORDER NOW — PAY ON DELIVERY'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={isOutOfStock}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                  >
                    Add to Cart
                  </button>

                  <WhatsAppButton
                    phone={whatsappNumber}
                    product={product}
                    variant="outline"
                    label="Order on WhatsApp"
                    className="w-full justify-center text-xs font-bold py-3"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Inspection Guarantee:</strong> Check your package upon delivery before paying.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. PROBLEM & SOLUTION SECTION (Conversion Copywriting)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem */}
          <div className="bg-red-50/60 border border-red-100 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
              ✕
            </div>
            <h3 className="font-extrabold text-base text-gray-900">The Everyday Problem</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {product.problem ||
                'Traditional methods are slow, exhausting, and often fail to produce long-lasting clean results, costing you time and money.'}
            </p>
          </div>

          {/* Solution */}
          <div className="bg-emerald-50/60 border border-emerald-100 p-6 sm:p-8 rounded-3xl space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">
              ✓
            </div>
            <h3 className="font-extrabold text-base text-gray-900">The Boricart Solution</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {product.solution ||
                'Engineered with modern materials and ergonomic design, Boricart delivers reliable efficiency to get the job done right the first time.'}
            </p>
          </div>
        </div>

        {/* =========================================================================
            3. KEY BENEFITS & SPECIFICATIONS
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs space-y-8">
          <div>
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Product Advantages
            </span>
            <h2 className="text-2xl font-black text-[#111111] mt-1">Why Choose {product.name}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              product.benefits || [
                'Fast, reliable performance designed for Nigerian homes',
                'Durable high-grade materials with extensive testing',
                'Saves valuable time and eliminates daily physical strain',
                '100% Cash on Delivery protection with 7-day replacement warranty',
              ]
            ).map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-semibold text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Technical Specifications & Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-3">Specifications</h3>
              <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2 text-gray-700">
                {product.specifications ? (
                  product.specifications.split('|').map((spec, idx) => (
                    <div key={idx} className="flex justify-between border-b border-gray-200/60 pb-1.5 last:border-0">
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
              <h3 className="font-bold text-sm text-gray-900 mb-3">How to Use</h3>
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/50 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                {product.usageInstructions ||
                  'Refer to the official user manual inside the Boricart retail box.'}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. IN-PAGE CASH ON DELIVERY ORDER FORM (Section 16)
           ========================================================================= */}
        <div id="order-now-section" className="bg-[#1A1A1A] text-white rounded-3xl p-6 sm:p-12 shadow-xl border border-gray-800">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase text-[#F5A623] tracking-wider">
                Instant Order Form
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Order {product.name} Now
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Fill out the quick form below. Pay Cash on Delivery when the courier arrives!
              </p>
            </div>

            {orderError && (
              <div className="p-3 bg-red-900/40 border border-red-500 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
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
                    className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
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
                    className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    WhatsApp Number (if different)
                  </label>
                  <input
                    type="tel"
                    placeholder="Optional for updates"
                    value={orderForm.whatsapp}
                    onChange={(e) => setOrderForm({ ...orderForm, whatsapp: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">State *</label>
                  <select
                    value={orderForm.state}
                    onChange={(e) => setOrderForm({ ...orderForm, state: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
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
                  placeholder="e.g. Ikeja, Lekki, Port Harcourt"
                  value={orderForm.city}
                  onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Complete Street Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House number, street name, nearest landmark"
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-[#2A2A2A] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              {/* Order Calculation Review */}
              <div className="bg-[#2A2A2A] p-4 rounded-2xl border border-gray-700 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Product Price:</span>
                  <span>{formatNaira(currentPrice)} × {quantity}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee:</span>
                  <span>{isFreeDelivery ? 'FREE' : formatNaira(currentDeliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-white pt-2 border-t border-gray-700">
                  <span>Total Due on Delivery:</span>
                  <span className="text-[#F5A623]">{formatNaira(totalAmountDue)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder || isOutOfStock}
                className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-700 text-black font-black py-4 px-6 rounded-2xl shadow-lg transition-all text-base uppercase tracking-wider"
              >
                {isSubmittingOrder ? 'Submitting Order...' : 'CONFIRM ORDER — PAY ON DELIVERY'}
              </button>
            </form>
          </div>
        </div>

        {/* =========================================================================
            5. RELATED PRODUCTS
           ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
              Customers Also Ordered
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pop-up Order Modal Triggered by Prominent ORDER NOW Button */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowOrderModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#F5A623] tracking-wider">
                    Quick Cash on Delivery
                  </span>
                  <h3 className="font-black text-lg text-gray-900">Place Your Order</h3>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="p-1 text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {orderError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl">{orderError}</div>
              )}

              <form onSubmit={handleQuickOrderSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.fullName}
                    onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">State *</label>
                    <select
                      value={orderForm.state}
                      onChange={(e) => setOrderForm({ ...orderForm, state: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / Town / LGA *</label>
                  <input
                    type="text"
                    required
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl font-bold flex justify-between items-center text-sm">
                  <span>Total on Delivery:</span>
                  <span className="text-[#F5A623]">{formatNaira(totalAmountDue)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full bg-[#F5A623] hover:bg-[#D98200] text-black font-black py-3 rounded-xl uppercase text-xs tracking-wider"
                >
                  {isSubmittingOrder ? 'Submitting...' : 'Confirm Order — Pay on Delivery'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
