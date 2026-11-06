import React from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../firebase/services';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigate,
  whatsappNumber = '+2348140008921',
  deliveryFee = 2500,
  freeDeliveryThreshold = 50000,
}) => {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const effectiveDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const grandTotal = subtotal + effectiveDeliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-[#F5A623]">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#333333]">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our collection of smart, time-saving household solutions, gadgets, and personal care essentials.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <span>Explore Boricart Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#333333]">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs divide-y divide-gray-100">
            {items.map((item) => {
              const price = item.product.promotionalPrice || item.product.regularPrice;
              const lineTotal = price * item.quantity;
              return (
                <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <img
                    src={item.product.mainImage}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-2xl border border-gray-100 shrink-0 cursor-pointer"
                    onClick={() => onNavigate('product', { slug: item.product.slug, id: item.product.id })}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#F5A623] uppercase">
                      {item.product.categoryName}
                    </span>
                    <h3
                      onClick={() => onNavigate('product', { slug: item.product.slug, id: item.product.id })}
                      className="font-bold text-sm sm:text-base text-[#333333] hover:text-[#F5A623] transition-colors truncate cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold text-[#333333]">{formatNaira(price)}</span>
                      {item.product.promotionalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatNaira(item.product.regularPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-gray-500 hover:text-black transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-gray-500 hover:text-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="block text-sm sm:text-base font-black text-[#333333]">
                        {formatNaira(lineTotal)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#F5A623] transition-colors pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping for More Essentials</span>
          </button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-[#333333] pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-[#333333]">{formatNaira(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Nationwide Delivery</span>
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <span className="font-bold text-[#333333]">
                  {isFreeDelivery ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>

              {subtotal < freeDeliveryThreshold && (
                <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-[#D98200] leading-snug">
                  Add <strong>{formatNaira(freeDeliveryThreshold - subtotal)}</strong> more to unlock{' '}
                  <strong>Free Nationwide Delivery</strong>.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
              <div>
                <span className="text-base font-black text-[#333333]">Total Due</span>
                <span className="block text-[11px] text-gray-400">Pay on Delivery</span>
              </div>
              <span className="text-2xl font-black text-[#F5A623]">{formatNaira(grandTotal)}</span>
            </div>

            {/* Cash on Delivery Notice */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100% Cash on Delivery:</strong> No upfront payment required. You only pay
                when you inspect and receive your products.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <WhatsAppButton
                phone={whatsappNumber}
                cartItems={items}
                subtotal={subtotal}
                label="Inquire About Cart on WhatsApp"
                variant="outline"
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
