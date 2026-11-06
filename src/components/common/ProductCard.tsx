import React from 'react';
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { formatNaira } from '../../firebase/services';
import { useCart } from '../../context/CartContext';
import { WhatsAppButton } from './WhatsAppButton';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const { addToCart } = useCart();

  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const currentPrice = product.promotionalPrice || product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;
  const isLowStock = product.stockStatus === 'low_stock' || (product.stockQuantity > 0 && product.stockQuantity <= 5);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {isDiscounted && (
          <span className="bg-[#F5A623] text-black text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-[#333333] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Best Seller
          </span>
        )}
      </div>

      {/* Stock Status Badge Overlay */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Only {product.stockQuantity} left
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In Stock
          </span>
        )}
      </div>

      {/* Image Container */}
      <div
        onClick={() => onNavigate('product', { slug: product.slug, id: product.id })}
        className="w-full aspect-square bg-gray-50 overflow-hidden cursor-pointer relative"
      >
        <img
          src={product.mainImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="hover:text-[#F5A623] cursor-pointer" onClick={() => onNavigate('category', { categoryId: product.categoryId })}>
              {product.categoryName}
            </span>
            <span className="text-[11px] text-gray-400">SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onNavigate('product', { slug: product.slug, id: product.id })}
            className="font-bold text-[#333333] text-sm sm:text-base line-clamp-2 hover:text-[#F5A623] cursor-pointer transition-colors leading-snug mb-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-gray-700">{product.rating || 4.9}</span>
            <span className="text-gray-400">({product.reviewCount || 48} reviews)</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg sm:text-xl font-extrabold text-[#333333]">
              {formatNaira(currentPrice)}
            </span>
            {isDiscounted && (
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatNaira(product.regularPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`col-span-4 flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5A623] hover:bg-[#D98200] text-white hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            <div className="col-span-1">
              <WhatsAppButton
                phone={whatsappNumber}
                product={product}
                variant="compact"
                className="w-full h-full flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
