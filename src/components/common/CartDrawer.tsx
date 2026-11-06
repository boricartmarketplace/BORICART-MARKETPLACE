import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatNaira } from '../../firebase/services';
import { WhatsAppButton } from './WhatsAppButton';

interface CartDrawerProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  freeDeliveryThreshold?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigate,
  whatsappNumber = '+2348140008921',
  freeDeliveryThreshold = 50000,
}) => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const diffToFree = freeDeliveryThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#F5A623]" />
              <h2 className="text-lg font-bold text-[#333333]">Your Cart</h2>
              <span className="text-xs bg-[#F5A623]/10 text-[#D98200] font-semibold px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery bar */}
          <div className="bg-amber-50/70 border-b border-amber-100/60 p-3.5 px-5">
            <div className="flex items-center gap-2 text-xs text-[#333333] font-medium mb-1.5">
              <Truck className="w-4 h-4 text-[#F5A623]" />
              {subtotal >= freeDeliveryThreshold ? (
                <span className="text-green-700 font-semibold">🎉 You have unlocked Free Nationwide Delivery!</span>
              ) : (
                <span>
                  Add <strong className="text-[#D98200]">{formatNaira(diffToFree)}</strong> more for <strong>Free Delivery</strong>
                </span>
              )}
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#F5A623] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-[#F5A623]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Discover Boricart everyday solutions engineered for better living.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('shop');
                  }}
                  className="bg-[#F5A623] hover:bg-[#D98200] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price = item.product.promotionalPrice || item.product.regularPrice;
                return (
                  <div key={item.product.id} className="py-4 flex gap-4">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100 shrink-0 cursor-pointer"
                      onClick={() => {
                        setIsCartOpen(false);
                        onNavigate('product', { slug: item.product.slug, id: item.product.id });
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-semibold text-[#333333] hover:text-[#F5A623] transition-colors truncate cursor-pointer"
                        onClick={() => {
                          setIsCartOpen(false);
                          onNavigate('product', { slug: item.product.slug, id: item.product.id });
                        }}
                      >
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.product.categoryName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-sm text-[#333333]">{formatNaira(price)}</span>
                        {item.product.promotionalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatNaira(item.product.regularPrice)}
                          </span>
                        )}
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="text-lg font-bold text-[#333333]">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery available nationwide. Pay only when you receive your order.</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('checkout');
                  }}
                  className="w-full bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Checkout with Cash on Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <WhatsAppButton
                  phone={whatsappNumber}
                  cartItems={items}
                  subtotal={subtotal}
                  variant="outline"
                  label="Inquire via WhatsApp"
                  className="w-full justify-center"
                />

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('cart');
                  }}
                  className="text-xs text-center text-gray-500 hover:text-[#F5A623] transition-colors py-1"
                >
                  View Full Cart Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
