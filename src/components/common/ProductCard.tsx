import React from 'react';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../firebase/services';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const currentPrice = product.promotionalPrice || product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-300/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Left: Discount Badge (Exact match from screenshot: orange pill) */}
      <div className="absolute top-2.5 left-2.5 z-10">
        {isDiscounted && (
          <span className="bg-[#F5A623] text-black text-[11px] font-black px-2 py-0.5 rounded-full shadow-2xs">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Top Right: Wishlist Icon (Exact match from screenshot) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#F5A623] flex items-center justify-center shadow-xs transition-transform active:scale-90"
        aria-label="Save to Wishlist"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-600'
          }`}
        />
      </button>

      {/* Product Image Area */}
      <div
        onClick={() => onNavigate('product', { slug: product.slug, id: product.id })}
        className="w-full aspect-square bg-white flex items-center justify-center p-3 overflow-hidden cursor-pointer relative"
      >
        <img
          src={product.mainImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between border-t border-gray-50">
        <div>
          {/* Title */}
          <h3
            onClick={() => onNavigate('product', { slug: product.slug, id: product.id })}
            className="font-bold text-[#222222] text-xs sm:text-sm line-clamp-1 hover:text-[#F5A623] cursor-pointer transition-colors leading-snug mb-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing (Bold orange, exactly as in screenshot: ₦4,500) */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-base sm:text-lg font-black text-[#F5A623]">
              {formatNaira(currentPrice)}
            </span>
            {isDiscounted && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatNaira(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Customer Rating: Yellow Stars + Count e.g. ★★★★★ (245) */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-gray-400">
              ({product.reviewCount || 120})
            </span>
          </div>
        </div>

        {/* Buttons: Full width solid orange Add to Cart button */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-1.5 font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#F5A623] hover:bg-[#D98200] text-black hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
