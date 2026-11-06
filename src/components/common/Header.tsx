import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Category, Product } from '../../types';
import { formatNaira } from '../../firebase/services';

interface HeaderProps {
  categories: Category[];
  products: Product[];
  currentRoute: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  products,
  currentRoute,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, user } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filtered live search suggestions
  const liveSuggestions = searchQuery.trim().length > 1
    ? products
        .filter(
          (p) =>
            p.status === 'published' &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      onNavigate('shop', { search: searchQuery.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* 1. Announcement Bar */}
      <div className="bg-[#333333] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-[#F5A623] text-black font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
              COD
            </span>
            <span className="truncate">
              🇳🇬 <strong>Pay on Delivery</strong> Available Nationwide • Inspect before you pay!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-gray-300 text-xs">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#F5A623]" />
              <span>Lagos: 24-48hrs | Nationwide: 2-4 days</span>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#F5A623] hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>WhatsApp: {whatsappNumber}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-gray-700 hover:text-[#F5A623] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Tagline */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D98200] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl tracking-tighter">B</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-[#333333]">BORI</span>
                <span className="text-2xl font-black tracking-tight text-[#F5A623]">CART</span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 -mt-1 hidden sm:block">
                Everyday Solutions. Better Living.
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="hidden lg:block flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Boricart everyday solutions, gadgets, cleaning essentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm text-gray-800 placeholder-gray-400 pl-11 pr-24 py-2.5 rounded-full border border-gray-200 focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#F5A623] hover:bg-[#D98200] text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 overflow-hidden animate-in fade-in-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Suggestions</span>
                  <span>{liveSuggestions.length} found</span>
                </div>
                {liveSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {liveSuggestions.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery('');
                          onNavigate('product', { slug: prod.slug, id: prod.id });
                        }}
                        className="p-2.5 hover:bg-amber-50/50 rounded-xl flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{prod.name}</p>
                          <p className="text-xs text-gray-500">{prod.categoryName}</p>
                        </div>
                        <span className="text-sm font-bold text-[#F5A623]">
                          {formatNaira(prod.promotionalPrice || prod.regularPrice)}
                        </span>
                      </div>
                    ))}
                    <div
                      onClick={handleSearchSubmit}
                      className="p-2 text-center text-xs font-semibold text-[#F5A623] hover:underline cursor-pointer"
                    >
                      View all results for "{searchQuery}" →
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Dashboard Badge / Access */}
            <button
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isAdmin
                  ? 'bg-amber-100 text-[#D98200] hover:bg-amber-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isAdmin ? 'Go to Admin Dashboard' : 'Admin Login'}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{isAdmin ? 'Admin Portal' : 'Admin'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-700 hover:text-[#F5A623] hover:bg-amber-50/70 rounded-xl transition-all"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F5A623] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-sm pl-10 pr-20 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5A623]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-[#F5A623] text-white text-xs font-bold rounded-lg"
            >
              Search
            </button>
          </form>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 border-t border-gray-100 py-3 text-sm font-semibold text-gray-700">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-[#F5A623] transition-colors ${
              currentRoute === 'home' ? 'text-[#F5A623] font-bold' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className={`hover:text-[#F5A623] transition-colors ${
              currentRoute === 'shop' ? 'text-[#F5A623] font-bold' : ''
            }`}
          >
            Shop All
          </button>

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              onClick={() => onNavigate('shop')}
              className="flex items-center gap-1 hover:text-[#F5A623] transition-colors"
            >
              <span>Categories</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoriesDropdownOpen(false);
                        onNavigate('category', { categoryId: cat.id, slug: cat.slug });
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#F5A623] flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-400 font-normal">
                        {products.filter((p) => p.categoryId === cat.id && p.status === 'published').length} items
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setCategoriesDropdownOpen(false);
                        onNavigate('shop');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-[#F5A623] hover:underline"
                    >
                      Explore All Categories →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-[#F5A623] transition-colors ${
              currentRoute === 'about' ? 'text-[#F5A623] font-bold' : ''
            }`}
          >
            About Boricart
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`hover:text-[#F5A623] transition-colors ${
              currentRoute === 'contact' ? 'text-[#F5A623] font-bold' : ''
            }`}
          >
            Contact
          </button>

          <button
            onClick={() => onNavigate('delivery-policy')}
            className={`hover:text-[#F5A623] transition-colors ${
              currentRoute === 'delivery-policy' ? 'text-[#F5A623] font-bold' : ''
            }`}
          >
            Delivery & COD
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <span className="text-xl font-black text-[#333333]">
                    BORI<span className="text-[#F5A623]">CART</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left font-semibold text-gray-800 hover:text-[#F5A623] py-2"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop');
                  }}
                  className="w-full text-left font-semibold text-gray-800 hover:text-[#F5A623] py-2"
                >
                  Shop All Products
                </button>

                <div className="pt-2 pb-2">
                  <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Categories
                  </span>
                  <div className="mt-2 space-y-2 pl-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigate('category', { categoryId: cat.id, slug: cat.slug });
                        }}
                        className="w-full text-left text-sm text-gray-600 hover:text-[#F5A623] py-1"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('about');
                    }}
                    className="w-full text-left text-sm text-gray-700 hover:text-[#F5A623]"
                  >
                    About Boricart
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('contact');
                    }}
                    className="w-full text-left text-sm text-gray-700 hover:text-[#F5A623]"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('delivery-policy');
                    }}
                    className="w-full text-left text-sm text-gray-700 hover:text-[#F5A623]"
                  >
                    Delivery & Returns Policy
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
                    }}
                    className="w-full text-left text-sm font-bold text-[#D98200] pt-2"
                  >
                    {isAdmin ? 'Admin Dashboard →' : 'Administrator Login →'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
              >
                <span>WhatsApp Customer Support</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
