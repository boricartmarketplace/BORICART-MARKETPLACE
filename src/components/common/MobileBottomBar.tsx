import React from 'react';
import { Home, Grid, Search, Heart, User } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomBarProps {
  currentRoute: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenSearch?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { wishlistCount } = useWishlist();
  const { isAdmin } = useAuth();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-gray-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center text-[10px] font-bold">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            currentRoute === 'home' ? 'text-[#F5A623]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span>Home</span>
          {currentRoute === 'home' && (
            <span className="w-4 h-0.5 bg-[#F5A623] rounded-full mt-0.5" />
          )}
        </button>

        {/* 2. Shop */}
        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            currentRoute === 'shop' || currentRoute === 'category'
              ? 'text-[#F5A623]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Grid className="w-5 h-5 stroke-[2.2]" />
          <span>Shop</span>
          {(currentRoute === 'shop' || currentRoute === 'category') && (
            <span className="w-4 h-0.5 bg-[#F5A623] rounded-full mt-0.5" />
          )}
        </button>

        {/* 3. Center Elevated Search Button (Exact style from screenshot) */}
        <button
          onClick={() => {
            if (onOpenSearch) onOpenSearch();
            else onNavigate('shop');
          }}
          className="-mt-5 w-12 h-12 rounded-full bg-[#F5A623] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Search Catalog"
        >
          <Search className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 4. Wishlist */}
        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center gap-0.5 py-1 relative transition-colors ${
            currentRoute === 'wishlist' ? 'text-[#F5A623]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5 stroke-[2.2]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F5A623] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </button>

        {/* 5. Account */}
        <button
          onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
          className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
            currentRoute === 'admin-dashboard' || currentRoute === 'admin-login'
              ? 'text-[#F5A623]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span>Account</span>
        </button>
      </div>
    </div>
  );
};
