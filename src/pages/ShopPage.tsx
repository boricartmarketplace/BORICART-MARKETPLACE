import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { formatNaira } from '../firebase/services';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch = '',
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('popular');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

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
  }, [publishedProducts, selectedCategory, activeCategoryObj, searchQuery, inStockOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setInStockOnly(false);
    setMaxPrice(50000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Banner if specific category selected */}
      {activeCategoryObj ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-[#333333] text-white p-8 sm:p-12 mb-8 shadow-sm">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="text-xs uppercase font-extrabold text-[#F5A623] tracking-widest">
              Category Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">{activeCategoryObj.name}</h1>
            <p className="text-sm text-gray-300">{activeCategoryObj.description}</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden md:block">
            <img
              src={activeCategoryObj.image}
              alt={activeCategoryObj.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            All Boricart Products
          </span>
          <h1 className="text-3xl font-black text-[#333333] tracking-tight mt-1">
            Shop Everyday Solutions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse our full range of smart, practical essentials. All products backed by Pay on
            Delivery.
          </p>
        </div>
      )}

      {/* Main Filter & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        {/* Category Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#333333] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Products ({publishedProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#F5A623] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
          >
            <Filter className="w-4 h-4 text-[#F5A623]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 text-xs sm:text-sm font-semibold text-gray-800 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid with Left Filter Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block space-y-6 bg-white p-5 rounded-2xl border border-gray-100 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#333333] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#F5A623]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-[#F5A623] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search inside catalog */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Search Catalog</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#F5A623]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Maximum Price Filter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-gray-700">Max Price</span>
              <span className="font-black text-[#F5A623]">{formatNaira(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="60000"
              step="2500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#F5A623] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₦10,000</span>
              <span>₦60,000</span>
            </div>
          </div>

          {/* Availability Filter */}
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
        <div className="md:col-span-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>
              Showing <strong>{filteredProducts.length}</strong> products
            </span>
            {searchQuery && (
              <span>
                Keyword: "<strong>{searchQuery}</strong>"
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-gray-100 p-8">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F5A623]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#333333] mb-1">No products match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                Try widening your price range, choosing another category, or clearing your search.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#F5A623] hover:bg-[#D98200] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
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
