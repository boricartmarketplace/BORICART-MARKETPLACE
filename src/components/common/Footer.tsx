import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { Category } from '../../types';
import { WhatsAppButton } from './WhatsAppButton';

interface FooterProps {
  categories: Category[];
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  onNavigate,
  whatsappNumber = '+2348140008921',
  supportEmail = 'support@boricart.com',
}) => {
  return (
    <footer className="bg-[#141414] text-gray-300 pt-14 pb-20 lg:pb-12 border-t border-gray-800">
      {/* 1. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#D98200] flex items-center justify-center text-white font-black text-xl shadow-xs">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white">
                Bori<span className="text-[#F5A623]">cart</span>
              </span>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase -mt-1">
                Everyday Solutions. Better Living.
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed">
            BORICART (boricart.com.ng) is a direct-to-consumer consumer brand. We sell authentic,
            practical products engineered to make everyday life easier, smarter and more convenient
            across Nigerian homes.
          </p>

          <div className="pt-2">
            <WhatsAppButton
              phone={whatsappNumber}
              label="Chat with Boricart on WhatsApp"
              variant="primary"
            />
          </div>

          {/* Social Media Links (Facebook, Instagram, TikTok, Pinterest, YouTube) */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Follow Our Channels
            </span>
            <div className="flex items-center gap-3 text-gray-400">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#F5A623] hover:text-black flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#F5A623] hover:text-black flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#F5A623] hover:text-black flex items-center justify-center transition-colors"
                title="TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.58a8.27 8.27 0 0 0 4.77 1.52v-3.41z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#F5A623] hover:text-black flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#F5A623] hover:text-black flex items-center justify-center transition-colors"
                title="Pinterest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.62-5.373-11.987-12-11.987z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links (Section 13) */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-[#F5A623] transition-colors">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop')} className="hover:text-[#F5A623] transition-colors">
                Shop All Products
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { filter: 'deals' })} className="hover:text-[#F5A623] transition-colors">
                Deals & Specials
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-[#F5A623] transition-colors">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-[#F5A623] transition-colors">
                Contact Customer Care
              </button>
            </li>
          </ul>
        </div>

        {/* Policies (Section 13) */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Store Policies</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('delivery-policy')} className="hover:text-[#F5A623] transition-colors">
                Delivery Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('delivery-policy')} className="hover:text-[#F5A623] transition-colors">
                Return & Warranty Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-[#F5A623] transition-colors">
                Terms and Conditions
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy')} className="hover:text-[#F5A623] transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('delivery-policy')} className="hover:text-[#F5A623] transition-colors">
                Cash on Delivery Terms
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Support Contact Info */}
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Customer Support</h4>
          <div className="space-y-2.5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
              <span>{whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
              <span>{supportEmail}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
              <span>Lagos State, Nigeria</span>
            </div>
            <div className="pt-2 text-[11px] text-gray-500">
              Dispatches active Mon - Sat across all 36 States + FCT.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} BORICART (boricart.com.ng). Everyday Solutions. Better Living. All rights reserved.
      </div>
    </footer>
  );
};
