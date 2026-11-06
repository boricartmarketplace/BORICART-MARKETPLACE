import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, RotateCcw, FileText, ArrowLeft } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

interface PolicyPagesProps {
  initialPolicy?: 'delivery' | 'privacy' | 'terms';
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({
  initialPolicy = 'delivery',
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  const [activePolicy, setActivePolicy] = useState<'delivery' | 'privacy' | 'terms'>(initialPolicy);

  useEffect(() => {
    setActivePolicy(initialPolicy);
  }, [initialPolicy]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#F5A623] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 overflow-x-auto">
        <button
          onClick={() => setActivePolicy('delivery')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activePolicy === 'delivery'
              ? 'bg-[#333333] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Truck className="w-4 h-4 text-[#F5A623]" />
          <span>Delivery & Returns Policy</span>
        </button>

        <button
          onClick={() => setActivePolicy('terms')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activePolicy === 'terms'
              ? 'bg-[#333333] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 text-[#F5A623]" />
          <span>Terms & Conditions</span>
        </button>

        <button
          onClick={() => setActivePolicy('privacy')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activePolicy === 'privacy'
              ? 'bg-[#333333] text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
          <span>Privacy Policy</span>
        </button>
      </div>

      {/* Policy Content */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-12 shadow-xs space-y-8 text-gray-700 leading-relaxed text-sm">
        {activePolicy === 'delivery' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
                Logistics & Returns
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#333333] mt-1">
                Boricart Delivery & Returns Policy
              </h1>
              <p className="text-xs text-gray-400 mt-1">Last revised: November 2026</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#333333]">1. Cash on Delivery (COD) Inspection</h3>
              <p>
                At Boricart, customer satisfaction and trust are paramount. When your order arrives:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>You have the full right to inspect the external packaging and confirm the contents before paying.</li>
                <li>Payment can be made to the dispatch rider in cash or via mobile transfer / handheld POS machine.</li>
                <li>Never pay until the package has been handed to you at your delivery address.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#333333]">2. Delivery Timelines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Lagos State Express</h4>
                  <p className="text-gray-600">
                    24 to 48 hours delivery time. Direct riders dispatched from our Lagos central fulfillment hub.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Nationwide (All Other States & FCT)</h4>
                  <p className="text-gray-600">
                    2 to 4 business days to Abuja, Port Harcourt, Ibadan, Kano, Enugu, and all 36 Nigerian states.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#333333]">3. Delivery Fees & Free Delivery</h3>
              <p>
                Standard nationwide delivery is ₦2,500. Orders totaling ₦50,000 or above automatically qualify
                for <strong>Free Nationwide Delivery</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#333333]">4. 7-Day Hassle-Free Replacement Policy</h3>
              <p>
                If any product purchased from Boricart develops a manufacturer fault within 7 days of delivery,
                we will replace it free of charge. Simply contact our support team on WhatsApp with a short video or photo
                demonstrating the issue.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Need immediate delivery assistance?</span>
              <WhatsAppButton phone={whatsappNumber} label="Chat on WhatsApp" variant="outline" />
            </div>
          </div>
        )}

        {activePolicy === 'terms' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">Legal Terms</span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#333333] mt-1">
                Terms and Conditions of Service
              </h1>
              <p className="text-xs text-gray-400 mt-1">Last revised: November 2026</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">1. Single-Brand Operation</h3>
              <p>
                Boricart operates as a single-brand, direct-to-consumer store. We do not host third-party vendors
                or multi-vendor sellers. All products displayed are curated, branded, and guaranteed directly by Boricart.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">2. Order Placement & Cancellation</h3>
              <p>
                By placing an order using Cash on Delivery, you enter into a good-faith agreement to receive and pay for the items
                when our dispatch rider arrives at your specified address. If you need to reschedule or cancel an order, please do so
                promptly via our WhatsApp customer line before dispatch.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">3. Pricing & Currency</h3>
              <p>
                All prices are explicitly listed in Nigerian Naira (NGN / ₦) inclusive of all applicable duties and taxes. We reserve
                the right to update prices or promotional discounts at any time without prior notice.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">4. Intellectual Property</h3>
              <p>
                All trademarks, logos, product names, photography, and text content belong exclusively to Boricart.
                Unauthorized duplication or re-hosting of brand assets is strictly prohibited.
              </p>
            </div>
          </div>
        )}

        {activePolicy === 'privacy' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">Data Protection</span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#333333] mt-1">
                Boricart Privacy Policy
              </h1>
              <p className="text-xs text-gray-400 mt-1">Last revised: November 2026</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">1. Information We Collect</h3>
              <p>
                We only collect information essential for fulfilling your orders: your full name, phone number,
                delivery address, state, city, and optional email address. We do NOT collect or store credit card numbers
                or bank PINs.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">2. How We Use Your Data</h3>
              <p>
                Your phone number and address are used strictly by our logistics department and authorized dispatch couriers
                to deliver your orders and contact you via phone or WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#333333]">3. Data Security</h3>
              <p>
                All customer orders and inquiries are stored in secure Google Cloud Firestore databases adhering to zero-trust
                attribute-based security rules. We never sell, rent, or share your private data with advertising brokers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
