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
  Package,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../firebase/services';
import { useCart } from '../context/CartContext';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product.mainImage);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'usage'>('details');
  const [copiedLink, setCopiedLink] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];

  const isDiscounted =
    product.promotionalPrice && product.promotionalPrice < product.regularPrice;
  const currentPrice = product.promotionalPrice || product.regularPrice;
  const discountPercent = isDiscounted
    ? Math.round(((product.regularPrice - product.promotionalPrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity === 0;

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.status === 'published')
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center gap-1.5 hover:text-[#F5A623] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="hover:text-gray-800 cursor-pointer" onClick={() => onNavigate('home')}>Home</span>
          <span>/</span>
          <span className="hover:text-gray-800 cursor-pointer" onClick={() => onNavigate('category', { categoryId: product.categoryId })}>
            {product.categoryName}
          </span>
          <span>/</span>
          <span className="text-gray-800 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery (Thumbnails + Main) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
            />
            {isDiscounted && (
              <span className="absolute top-4 left-4 bg-[#F5A623] text-black text-xs font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs p-2.5 rounded-full text-gray-700 hover:text-[#F5A623] hover:bg-white shadow-sm transition-all"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="absolute top-16 right-4 bg-black/80 text-white text-xs px-2.5 py-1 rounded-md">
                Link copied!
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-[#F5A623] scale-102 shadow-xs'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100/60 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#F5A623] shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Pay on Delivery</p>
                <p className="text-[11px] text-gray-500">Inspect before payment</p>
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Direct Dispatch</p>
                <p className="text-[11px] text-gray-500">All 36 Nigerian States</p>
              </div>
            </div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">7-Day Warranty</p>
                <p className="text-[11px] text-gray-500">Free replacement support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-bold text-[#F5A623] uppercase tracking-wider">
                {product.categoryName}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#333333] leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{product.rating || 4.9}</span>
              <span className="text-xs text-gray-400">({product.reviewCount || 120} verified customer reviews)</span>
            </div>
          </div>

          {/* Pricing in Naira */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#333333]">
              {formatNaira(currentPrice)}
            </span>
            {isDiscounted && (
              <span className="text-base text-gray-400 line-through">
                {formatNaira(product.regularPrice)}
              </span>
            )}
            {isDiscounted && (
              <span className="text-xs font-bold bg-amber-100 text-[#D98200] px-2 py-0.5 rounded-full">
                Save {formatNaira(product.regularPrice - product.promotionalPrice!)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div>
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                Currently Out of Stock
              </span>
            ) : product.stockQuantity <= 5 ? (
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                Hurry! Only {product.stockQuantity} units left in stock
              </span>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>In Stock & Ready for Immediate Dispatch</span>
              </div>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 text-gray-500 hover:text-black transition-colors disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 99, q + 1))}
                  disabled={isOutOfStock || quantity >= product.stockQuantity}
                  className="p-2.5 text-gray-500 hover:text-black transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                Total: <strong>{formatNaira(currentPrice * quantity)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-[#F5A623] hover:bg-[#D98200] disabled:bg-gray-200 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full bg-[#333333] hover:bg-black disabled:bg-gray-200 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Buy with Cash on Delivery</span>
              </button>
            </div>

            {/* Direct WhatsApp Inquiry */}
            <div className="pt-2">
              <WhatsAppButton
                phone={whatsappNumber}
                product={product}
                variant="outline"
                label="Inquire or Order on WhatsApp"
                className="w-full justify-center py-3 text-sm font-bold"
              />
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-gray-400 font-semibold mr-1">Tags:</span>
              {product.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Full Description, Specifications, Usage Instructions */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 text-sm sm:text-base font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'details'
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 text-sm sm:text-base font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-2 text-sm sm:text-base font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'usage'
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Usage Instructions
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'details' && (
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {product.description || product.shortDescription}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Technical Specifications</h4>
              {product.specifications ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {product.specifications.split('|').map((spec, i) => {
                    const parts = spec.split(':');
                    return (
                      <div
                        key={i}
                        className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col"
                      >
                        <span className="font-bold text-gray-800">
                          {parts[0]?.trim() || 'Detail'}
                        </span>
                        <span className="text-gray-600 mt-0.5">{parts[1]?.trim() || ''}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Standard Boricart commercial specifications apply.</p>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900">How to Use & Care</h4>
              {product.usageInstructions ? (
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.usageInstructions}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Refer to the user manual included inside the Boricart retail box.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#333333]">
              More Everyday Solutions You Might Like
            </h2>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-bold text-[#F5A623] hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                onNavigate={onNavigate}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
