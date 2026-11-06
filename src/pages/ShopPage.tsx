import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronDown, Check, Flame } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { formatNaira } from '../firebase/services';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  initialCollection?: string;
  initialFilter?: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch = '',
  initialCollection,
  initialFilter,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [dealsOnly, setDealsOnly] = useState<boolean>(initialFilter === 'deals');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(initialCollection);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCollection) setSelectedCollection(initialCollection);
    if (initialFilter === 'deals') setDealsOnly(true);
  }, [initialCategory, initialSearch, initialCollection, initialFilter]);

  // Filter published products only
  const publishedProducts = useMemo(
    () => products.filter((p) => p.status === 'published'),
    [products]
  );

  // Active Category details
  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory),
    [categories, selectedCategory]
  );

  // Apply filters
  const filteredProducts = useMemo(() => {
    return publishedProducts
      .filter((p) => {
        // Category
        if (selectedCategory !== 'all') {
          if (p.categoryId !== selectedCategory && p.categoryId !== activeCategoryObj?.id) {
            return false;
          }
        }
        // Collection
        if (selectedCollection) {
          if (p.collectionId !== selectedCollection) return false;
        }
        // Deals only
        if (dealsOnly) {
          if (!p.promotionalPrice || p.promotionalPrice >= p.regularPrice) return false;
        }
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }
        // Stock
        if (inStockOnly) {
          if (p.stockStatus === 'out_of_stock' || p.stockQuantity <= 0) return false;
        }
        // Price
        const effectivePrice = p.promotionalPrice || p.regularPrice;
        if (effectivePrice > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.promotionalPrice || a.regularPrice;
        const priceB = b.promotionalPrice || b.regularPrice;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    publishedProducts,
    selectedCategory,
    activeCategoryObj,
    selectedCollection,
    dealsOnly,
    searchQuery,
    inStockOnly,
    maxPrice,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCollection(undefined);
    setDealsOnly(false);
    setSearchQuery('');
    setSortBy('popular');
    setInStockOnly(false);
    setMaxPrice(60000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Category or Deals Banner */}
      {dealsOnly ? (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-[#F5A623] to-amber-600 text-white p-6 sm:p-10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-black bg-white/90 px-3 py-1 rounded-full">
              Special Offers
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Boricart Deals & Discounts</h1>
            <p className="text-xs sm:text-sm text-amber-50">
              Limited-time discounts on our practical solutions. Pay on delivery nationwide.
            </p>
          </div>
          <Flame className="w-12 h-12 text-white/30 hidden sm:block" />
        </div>
      ) : activeCategoryObj ? (
        <div className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] text-white p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl relative z-10 space-y-1">
            <span className="text-xs uppercase font-extrabold text-[#F5A623] tracking-widest">
              Category Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">{activeCategoryObj.name}</h1>
            <p className="text-xs sm:text-sm text-gray-300">{activeCategoryObj.description}</p>
          </div>
        </div>
      ) : (
        <div>
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            All Boricart Products
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight mt-1">
            Everyday Solutions Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Authentic, single-brand essentials engineered for better living. 100% Cash on Delivery.
          </p>
        </div>
      )}

      {/* Horizontal Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setSelectedCollection(undefined);
            setDealsOnly(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all' && !dealsOnly && !selectedCollection
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products ({publishedProducts.length})
        </button>

        <button
          onClick={() => {
            setDealsOnly(!dealsOnly);
            setSelectedCategory('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            dealsOnly
              ? 'bg-[#F5A623] text-black shadow-xs font-black'
              : 'bg-amber-50 text-[#D98200] hover:bg-amber-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Deals & Discounts</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedCollection(undefined);
              setDealsOnly(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id && !dealsOnly
                ? 'bg-[#F5A623] text-black shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Grid with Sidebar Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filter Box */}
        <div className="hidden md:block space-y-6 bg-white p-5 rounded-2xl border border-gray-100 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-xs text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Filter Products</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-[#F5A623] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-gray-700">Max Price</span>
              <span className="font-black text-[#F5A623]">{formatNaira(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="60000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#F5A623] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₦2,000</span>
              <span>₦60,000</span>
            </div>
          </div>

          {/* In Stock Toggle */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-[#F5A623] w-4 h-4"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing <strong>{filteredProducts.length}</strong> products
            </span>
            <div className="flex items-center gap-2">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-gray-100 p-8 space-y-3">
              <Search className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No products match your filters</h3>
              <p className="text-xs text-gray-500">
                Try resetting your filters to explore our full Boricart range.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#F5A623] text-black font-bold text-xs rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
