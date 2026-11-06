import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
  Phone,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Category, Product, StoreSettings } from '../../types';
import { formatNaira } from '../../firebase/services';

interface HeaderProps {
  categories: Category[];
  products: Product[];
  currentRoute: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  settings?: StoreSettings;
  onOpenSearchModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  products,
  currentRoute,
  onNavigate,
  whatsappNumber = '+2348140008921',
  settings,
  onOpenSearchModal,
}) => {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Rotating Announcement Bar Messages from backend settings
  const announcements = settings?.announcementMessages && settings.announcementMessages.length > 0
    ? settings.announcementMessages
    : [
        'Everyday Solutions. Better Living.',
        'Shop Smart. Save More.',
        'Convenient Cash on Delivery Across Nigeria.',
      ];
  const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Filtered live search suggestions
  const liveSuggestions =
    searchQuery.trim().length > 1
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
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
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
    <header className="sticky top-0 z-40 bg-white shadow-2xs">
      {/* 1. Top Announcement Bar (Exact layout from reference screenshot) */}
      <div className="bg-[#121212] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
            <div className="flex items-center gap-1.5 text-gray-200">
              <Truck className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="font-medium whitespace-nowrap">
                Free Delivery on Orders Above {formatNaira(settings?.freeDeliveryThreshold ?? 15000)}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="font-medium whitespace-nowrap">Secure & Trusted Store</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-gray-200">
              <Headphones className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="font-medium whitespace-nowrap">24/7 Customer Support</span>
            </div>
          </div>

          {/* Center Rotating Tagline in pill (Section 2) */}
          <div className="hidden xl:flex items-center">
            <div className="bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] px-3 py-0.5 rounded-full text-[11px] font-bold animate-pulse">
              {announcements[currentAnnouncementIdx]}
            </div>
          </div>

          {/* Social Icons & WhatsApp */}
          <div className="flex items-center gap-3 text-gray-400">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#25D366] transition-colors"
              title="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.668-.699c.969.54 1.77.785 2.792.786 3.183 0 5.77-2.587 5.77-5.768.001-3.18-2.586-5.77-5.77-5.77zm0 10.457c-.887 0-1.637-.253-2.348-.682l-.168-.102-1.745.457.466-1.701-.112-.178c-.469-.747-.732-1.493-.732-2.485 0-2.617 2.129-4.747 4.748-4.747 2.617 0 4.746 2.129 4.747 4.748 0 2.617-2.13 4.747-4.748 4.747z" />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Logo, Search, Account, Wishlist, Cart) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu hamburger toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1.5 text-gray-700 hover:text-[#F5A623] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Official BORICART Logo (Prominent & Clear) */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0 py-1"
          >
            <img
              src="/assets/aistudio/boricart_logo.png"
              alt="BORICART — Everyday Solutions. Better Living."
              className="h-11 sm:h-13 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Center Search Field (Exact wide pill with orange search button) */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl mx-4 relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center bg-[#F1F3F5] rounded-full p-1 border border-transparent focus-within:border-[#F5A623] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#F5A623]/20 transition-all">
                <input
                  type="text"
                  placeholder="Search products, brands and essentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-500 pl-4 pr-12 py-1.5 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="w-9 h-9 rounded-full bg-[#F5A623] hover:bg-[#D98200] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Suggestions</span>
                  <span>{liveSuggestions.length} found</span>
                </div>
                {liveSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
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
                        className="p-2 hover:bg-amber-50/60 rounded-xl flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                          <p className="text-[10px] text-gray-500">{prod.categoryName}</p>
                        </div>
                        <span className="text-xs font-black text-[#F5A623]">
                          {formatNaira(prod.promotionalPrice || prod.regularPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Icons (My Account, Wishlist, Cart) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* My Account */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-[#F5A623] transition-colors"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="hidden lg:inline">My Account</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-gray-800 hover:text-[#F5A623] transition-colors flex items-center justify-between"
                  >
                    <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
                    <span className="text-[10px] bg-amber-100 text-[#D98200] px-1.5 py-0.5 rounded font-bold">
                      Staff
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onNavigate('delivery-policy');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-gray-800 hover:text-[#F5A623] transition-colors"
                  >
                    Track My Order
                  </button>
                  <button
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onNavigate('contact');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-gray-800 hover:text-[#F5A623] transition-colors"
                  >
                    Help & Support
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('shop')}
              className="relative flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-[#F5A623] transition-colors"
              title="View Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-gray-700 hover:fill-[#F5A623] hover:text-[#F5A623]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F5A623] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">Wishlist</span>
            </button>

            {/* Shopping Cart (with exact icon and badge) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-gray-800 hover:text-[#F5A623] transition-colors relative"
              aria-label="View shopping cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                <span className="absolute -top-1.5 -right-2 bg-[#F5A623] text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>
              <div className="hidden lg:flex flex-col text-left -space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Cart</span>
                <span className="text-xs font-extrabold text-[#111111]">{formatNaira(subtotal)}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, brands and essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F1F3F5] text-xs pl-3.5 pr-10 py-2.5 rounded-full border border-transparent focus:outline-none focus:border-[#F5A623] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-[#F5A623] text-white flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Subheader Navigation Menu (Exact layout from reference screenshot) */}
      <div className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            <div className="flex items-center gap-8">
              {/* All Categories Pill Button (Solid Orange from reference image) */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-[#F5A623] hover:bg-[#D98200] text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs shadow-2xs transition-all cursor-pointer"
                >
                  <Menu className="w-4 h-4 stroke-[2.5]" />
                  <span>All Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {categoriesDropdownOpen && (
                  <div className="absolute left-0 top-full pt-1.5 w-60 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategoriesDropdownOpen(false);
                            onNavigate('category', { categoryId: cat.id, slug: cat.slug });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-[#F5A623] flex items-center justify-between transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {products.filter((p) => p.categoryId === cat.id && p.status === 'published').length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links (Home, Shop, Deals, About Us, Contact) */}
              <nav className="flex items-center space-x-7 text-xs font-bold text-gray-700">
                <button
                  onClick={() => onNavigate('home')}
                  className={`hover:text-[#F5A623] transition-colors py-2 ${
                    currentRoute === 'home' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : ''
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={() => onNavigate('shop')}
                  className={`hover:text-[#F5A623] transition-colors py-2 ${
                    currentRoute === 'shop' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : ''
                  }`}
                >
                  Shop
                </button>

                <button
                  onClick={() => onNavigate('shop', { filter: 'deals' })}
                  className="hover:text-[#F5A623] transition-colors py-2 flex items-center gap-1 text-[#D98200]"
                >
                  <Flame className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" />
                  <span>Deals</span>
                </button>

                <button
                  onClick={() => onNavigate('about')}
                  className={`hover:text-[#F5A623] transition-colors py-2 ${
                    currentRoute === 'about' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : ''
                  }`}
                >
                  About Us
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className={`hover:text-[#F5A623] transition-colors py-2 ${
                    currentRoute === 'contact' ? 'text-[#F5A623] border-b-2 border-[#F5A623]' : ''
                  }`}
                >
                  Contact
                </button>
              </nav>
            </div>

            {/* Right: Cash on Delivery & Direct WhatsApp Notice */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-xl font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                >
                  <img
                    src="/assets/aistudio/boricart_logo.png"
                    alt="BORICART"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm font-bold text-gray-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left py-2 hover:text-[#F5A623]"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop');
                  }}
                  className="w-full text-left py-2 hover:text-[#F5A623]"
                >
                  Shop All Products
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('shop', { filter: 'deals' });
                  }}
                  className="w-full text-left py-2 hover:text-[#F5A623] text-[#D98200]"
                >
                  Deals & Special Offers
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('about');
                  }}
                  className="w-full text-left py-2 hover:text-[#F5A623]"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('contact');
                  }}
                  className="w-full text-left py-2 hover:text-[#F5A623]"
                >
                  Contact
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                    Categories
                  </span>
                  <div className="mt-2 space-y-1.5 pl-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigate('category', { categoryId: c.id, slug: c.slug });
                        }}
                        className="w-full text-left text-xs font-semibold text-gray-600 hover:text-[#F5A623] py-1"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
                }}
                className="w-full text-center text-xs font-bold text-gray-600 hover:text-black py-2"
              >
                {isAdmin ? 'Admin Dashboard' : 'Admin Portal Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
