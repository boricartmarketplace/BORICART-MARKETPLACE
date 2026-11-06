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
    <footer className="bg-[#1F1F1F] text-gray-300 pt-16 pb-12 border-t border-gray-800">
      {/* 1. Value Proposition Guarantees */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#F5A623]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Pay on Delivery</h4>
              <p className="text-xs text-gray-400 mt-1">
                Zero advance risk. Inspect your package thoroughly before making payment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#F5A623]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Nationwide Dispatch</h4>
              <p className="text-xs text-gray-400 mt-1">
                Fast delivery across all 36 Nigerian states and the FCT within 24-96 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-[#F5A623]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">7-Day Guarantee</h4>
              <p className="text-xs text-gray-400 mt-1">
                Defect-free guarantee with immediate hassle-free replacements.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#F5A623]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Instant WhatsApp Care</h4>
              <p className="text-xs text-gray-400 mt-1">
                Direct customer assistance from real team members 7 days a week.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-[#F5A623] flex items-center justify-center text-white font-black text-xl">
              B
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              BORI<span className="text-[#F5A623]">CART</span>
            </span>
          </div>

          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Everyday Solutions. Better Living. Boricart is a premium Nigerian consumer brand dedicated
            to smart home, cleaning, personal care, and lifestyle innovations that simplify daily life.
          </p>

          <div className="pt-2">
            <WhatsAppButton
              phone={whatsappNumber}
              label="Chat with Boricart on WhatsApp"
              variant="primary"
            />
          </div>
        </div>

        {/* Shop Categories */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onNavigate('category', { categoryId: cat.id, slug: cat.slug })}
                  className="text-gray-400 hover:text-[#F5A623] transition-colors"
                >
                  {cat.name}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => onNavigate('shop')}
                className="text-[#F5A623] hover:underline font-semibold"
              >
                View All Products →
              </button>
            </li>
          </ul>
        </div>

        {/* Quick Links & Info */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-400 hover:text-[#F5A623] transition-colors"
              >
                About Boricart
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="text-gray-400 hover:text-[#F5A623] transition-colors"
              >
                Contact Support
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('delivery-policy')}
                className="text-gray-400 hover:text-[#F5A623] transition-colors"
              >
                Delivery & Returns
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('terms')}
                className="text-gray-400 hover:text-[#F5A623] transition-colors"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('privacy')}
                className="text-gray-400 hover:text-[#F5A623] transition-colors"
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Contact details */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Get in Touch</h4>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <span>Lekki Phase 1, Lagos State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#F5A623] shrink-0" />
              <span>{whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
              <span>{supportEmail}</span>
            </div>
            <div className="pt-2 text-xs text-gray-500">
              Hours: Mon - Sat: 8:00 AM - 7:00 PM (WAT)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div>
          © {new Date().getFullYear()} BORICART Nigeria. All rights reserved. Single-Brand Authentic Store.
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('privacy')} className="hover:text-gray-300">
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('terms')} className="hover:text-gray-300">
            Terms & Conditions
          </button>
          <button onClick={() => onNavigate('delivery-policy')} className="hover:text-gray-300">
            Cash on Delivery Terms
          </button>
        </div>
      </div>
    </footer>
  );
};
