import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Phone,
  User,
  Mail,
  MapPin,
  Building,
  FileText,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { formatNaira, createOrder } from '../firebase/services';
import { NIGERIAN_STATES } from '../data/initialCatalog';
import { Order } from '../types';
import { trackInitiateCheckout, trackPurchase } from '../services/pixelService';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  deliveryFee = 2500,
  freeDeliveryThreshold = 50000,
}) => {
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    state: 'Lagos',
    city: '',
    address: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const effectiveDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = subtotal + effectiveDeliveryFee;

  // Track InitiateCheckout on mount if cart has items
  React.useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(items.length, grandTotal);
    }
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your cart is currently empty</h2>
        <p className="text-sm text-gray-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid Nigerian phone number for our delivery rider.');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city, town, or local government area.');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 8) {
      setErrorMessage('Please enter your complete delivery street address and prominent landmarks.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        state: formData.state,
        city: formData.city.trim(),
        deliveryAddress: formData.address.trim(),
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.mainImage,
          price: item.product.promotionalPrice || item.product.regularPrice,
          quantity: item.quantity,
          sku: item.product.sku,
        })),
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        totalAmount: grandTotal,
        notes: formData.notes.trim() || undefined,
      };

      const savedOrder = await createOrder(orderPayload);

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#25D366', '#333333'],
        });
      } catch (confettiErr) {
        console.warn('Confetti effect ignored:', confettiErr);
      }

      // Clear shopping cart
      clearCart();

      // Trigger Pixel Purchase Event across Facebook, Google, TikTok, Pinterest
      trackPurchase(savedOrder);

      // Navigate to order confirmation
      onNavigate('order-confirmation', { order: savedOrder, orderId: savedOrder.id });
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(
        'Unable to process your order at this moment. Please check your internet connection or contact us on WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#F5A623] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shopping Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Customer & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#F5A623] uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery Checkout</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#333333] mt-1">
                Where should we deliver?
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Enter your exact details so our dispatch riders can reach you seamlessly.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} id="checkout-form" className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adebayo Babatunde"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Active Phone Number <span className="text-red-500">*</span> (For delivery call / WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678 or +234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(Optional for digital receipt)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. adebayo@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* State & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Delivery State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] font-medium"
                  >
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City / Town / LGA <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ikeja, Lekki, Wuse 2"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                    />
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Street Address & Landmark */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Detailed Delivery Street Address & Landmark <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Flat 4B, 15 Admiralty Way, opposite Hubmart Supermarket, Lekki Phase 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Special Delivery Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Call my security guard at the gate or deliver after 2 PM"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:border-[#F5A623] transition-all"
                  />
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Selector (Locked to Cash on Delivery) */}
          <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
                Payment Option
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Guaranteed Safe
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-[#F5A623] flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#F5A623] text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#333333]">
                  Cash on Delivery (Pay on Arrival)
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pay cash or make an instant POS / bank transfer directly to the delivery rider
                  when they hand your package to you. Zero advance payment required!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-extrabold text-base text-[#333333] pb-3 border-b border-gray-100">
              Your Order Review
            </h3>

            {/* Item list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1">
              {items.map((item) => {
                const price = item.product.promotionalPrice || item.product.regularPrice;
                return (
                  <div key={item.product.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.quantity} × {formatNaira(price)}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-800">
                      {formatNaira(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee ({formData.state})</span>
                <span className="font-bold text-gray-800">
                  {isFreeDelivery ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatNaira(effectiveDeliveryFee)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-sm">
                <div>
                  <span className="font-black text-[#333333]">Total Due on Delivery</span>
                  <span className="block text-[10px] text-gray-400">No hidden fees</span>
                </div>
                <span className="text-2xl font-black text-[#F5A623]">{formatNaira(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-300 text-white font-black py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <span>Confirm Order — Pay on Delivery</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Encrypted • Powered by Boricart Direct Logistics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
