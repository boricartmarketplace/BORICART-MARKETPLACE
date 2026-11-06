import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Truck, Users, Award, ArrowRight } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

interface AboutPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-amber-50/60 to-white pt-12 pb-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-widest">
            The Boricart Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#333333] tracking-tight">
            Everyday Solutions. Better Living.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Boricart is an authentic Nigerian consumer brand dedicated to solving everyday domestic
            frustrations through smart, reliable, and beautifully engineered essentials.
          </p>
        </div>
      </section>

      {/* 2. Brand Mission & Genesis */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-extrabold text-[#F5A623] tracking-wider">
              Why We Built Boricart
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#333333] leading-snug">
              Eliminating the Guesswork in Nigerian E-Commerce
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              For years, Nigerian shoppers navigating online marketplaces had to gamble on quality:
              unverified third-party vendors, fake reviews, cheap imitations that break down after two
              weeks, and the constant fear of losing hard-earned money to advance online transfers.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>BORICART was built to change that narrative completely.</strong>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We operate as a single-brand, direct-to-consumer company. We curate, test, and brand our
              own products—from cordless power cleaning tools and heavy-duty 65W fast-charging banks to
              hygienic motion-sensor smart bins. Every product in our catalog has been rigorously
              inspected to withstand the practical demands of Nigerian homes and lifestyles.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80"
                alt="Boricart team commitment to quality"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-lg border border-gray-100 max-w-xs hidden sm:block">
              <p className="text-xs font-bold text-[#333333]">
                "Better living starts with tools that actually work when you need them most."
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                — Boricart Brand Promise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Pillars */}
      <section className="bg-gray-50/70 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
              Core Pillars
            </span>
            <h2 className="text-3xl font-black text-[#333333] mt-1">What Defines Boricart</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Single-Brand Accountability</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We never hide behind third-party sellers. Every item carrying the Boricart name is our
                direct responsibility.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">100% Cash on Delivery</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Zero advance payment pressure. You see your items, inspect the quality, and only then
                make payment to the rider.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Nationwide Express Dispatch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Speed matters. Next-day delivery in Lagos and 2 to 4 days across all 36 states with
                active dispatch notifications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold text-lg mb-4">
                04
              </div>
              <h3 className="font-bold text-base text-[#333333] mb-2">Human Customer Care</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No automated bots or endless email tickets. Direct access to our team on WhatsApp for
                instant resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-[#333333]">
          Ready to Upgrade Your Daily Living?
        </h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Explore our complete collection of functional, time-saving solutions with 100% Cash on
          Delivery assurance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('shop')}
            className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Boricart Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <WhatsAppButton
            phone={whatsappNumber}
            label="Inquire on WhatsApp"
            variant="outline"
            className="w-full sm:w-auto py-3.5 px-6"
          />
        </div>
      </section>
    </div>
  );
};
