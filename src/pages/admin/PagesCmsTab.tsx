import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Truck,
  ShieldCheck,
  Building,
  Save,
  RotateCcw,
} from 'lucide-react';
import { SiteFaq, SitePagesContent, StoreSettings } from '../../types';
import { updateStoreSettings } from '../../firebase/services';
import { DEFAULT_PAGES_CONTENT } from '../../data/initialCatalog';

interface PagesCmsTabProps {
  settings: StoreSettings;
  onRefreshData: () => Promise<void>;
}

export const PagesCmsTab: React.FC<PagesCmsTabProps> = ({ settings, onRefreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'about' | 'contact' | 'delivery' | 'legal'>('about');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // CMS Content State initialized from settings or default
  const [content, setContent] = useState<SitePagesContent>(() => {
    return {
      ...DEFAULT_PAGES_CONTENT,
      ...(settings.pagesContent || {}),
    };
  });

  // FAQs management state
  const [faqs, setFaqs] = useState<SiteFaq[]>(() => {
    const sourceFaqs = (settings.pagesContent?.faqs || settings.pagesContent?.contactFaqs || DEFAULT_PAGES_CONTENT.contactFaqs || []) as any[];
    return sourceFaqs.map((f: any, idx: number) => ({
      id: f.id || `faq-${idx}`,
      question: f.question || f.q || '',
      answer: f.answer || f.a || '',
      category: f.category || 'orders',
      q: f.q || f.question || '',
      a: f.a || f.answer || '',
    }));
  });

  // New FAQ inputs
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<'orders' | 'delivery' | 'payments' | 'products'>('orders');

  // Values list
  const [valuesInput, setValuesInput] = useState<string>(() => {
    return (content.aboutValues || DEFAULT_PAGES_CONTENT.aboutValues).join('\n');
  });

  useEffect(() => {
    if (settings.pagesContent) {
      setContent((prev) => ({
        ...prev,
        ...settings.pagesContent,
      }));
      const sourceFaqs = (settings.pagesContent.faqs || settings.pagesContent.contactFaqs) as any[] | undefined;
      if (sourceFaqs) {
        setFaqs(
          sourceFaqs.map((f: any, idx: number) => ({
            id: f.id || `faq-${idx}`,
            question: f.question || f.q || '',
            answer: f.answer || f.a || '',
            category: f.category || 'orders',
            q: f.q || f.question || '',
            a: f.a || f.answer || '',
          }))
        );
      }
      if (settings.pagesContent.aboutValues) {
        setValuesInput(settings.pagesContent.aboutValues.join('\n'));
      }
    }
  }, [settings]);

  const handleFieldChange = (key: keyof SitePagesContent, val: any) => {
    setContent((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newFaqItem: SiteFaq = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      q: newQuestion.trim(),
      a: newAnswer.trim(),
    };
    setFaqs((prev) => [...prev, newFaqItem]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (identifier: string | undefined, index: number) => {
    setFaqs((prev) => prev.filter((f, idx) => (identifier ? f.id !== identifier : idx !== index)));
  };

  const handleSaveAllPages = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const parsedValues = valuesInput
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      const updatedPagesContent: SitePagesContent = {
        ...content,
        faqs,
        aboutValues: parsedValues,
      };

      await updateStoreSettings({
        pagesContent: updatedPagesContent,
        officeAddress: updatedPagesContent.officeAddress,
      });

      await onRefreshData();
      setSuccessMessage('All website pages content saved to Cloud Firestore successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Error updating pages CMS:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top CMS Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-2xl text-[#333333]">Website Pages Content Management (CMS)</h3>
          <p className="text-xs text-gray-500 mt-1">
            Update copy, company story, contact details, FAQs, delivery terms, and legal policies across your storefront.
          </p>
        </div>

        <button
          onClick={() => handleSaveAllPages()}
          disabled={isSaving}
          className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Page Changes'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* CMS Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('about')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'about'
              ? 'bg-[#333333] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          About Boricart Page
        </button>

        <button
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'contact'
              ? 'bg-[#333333] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Contact & FAQs
        </button>

        <button
          onClick={() => setActiveSubTab('delivery')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'delivery'
              ? 'bg-[#333333] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Delivery & Returns Policy
        </button>

        <button
          onClick={() => setActiveSubTab('legal')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'legal'
              ? 'bg-[#333333] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Terms & Privacy Policy
        </button>
      </div>

      {/* ================= SUB-TAB 1: ABOUT PAGE ================= */}
      {activeSubTab === 'about' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h4 className="font-extrabold text-base text-[#333333]">About Us Page Customizer</h4>
            <p className="text-xs text-gray-500">
              Shape the brand narrative, customer promise, and company heritage presented on the /about page.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Page Title</label>
              <input
                type="text"
                value={content.aboutTitle || ''}
                onChange={(e) => handleFieldChange('aboutTitle', e.target.value)}
                placeholder="Everyday Solutions. Better Living."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mission Subtitle / Lead Paragraph</label>
              <textarea
                rows={2}
                value={content.aboutSubtitle || ''}
                onChange={(e) => handleFieldChange('aboutSubtitle', e.target.value)}
                placeholder="Boricart is an authentic Nigerian consumer brand..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Our Origin Story</label>
              <textarea
                rows={4}
                value={content.aboutStory || ''}
                onChange={(e) => handleFieldChange('aboutStory', e.target.value)}
                placeholder="Detail why Boricart was created to replace unpredictable marketplace vendors..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">The Boricart Mission</label>
                <textarea
                  rows={3}
                  value={content.aboutMission || ''}
                  onChange={(e) => handleFieldChange('aboutMission', e.target.value)}
                  placeholder="We operate as a single-brand, direct-to-consumer company..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Quality Promise</label>
                <textarea
                  rows={3}
                  value={content.aboutPromise || ''}
                  onChange={(e) => handleFieldChange('aboutPromise', e.target.value)}
                  placeholder="We never compromise on utility. If a product does not genuinely save you time..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Core Brand Values (One value per line)
              </label>
              <textarea
                rows={4}
                value={valuesInput}
                onChange={(e) => setValuesInput(e.target.value)}
                placeholder="100% Guaranteed Authenticity&#10;Nationwide Cash on Delivery&#10;Rigorous Real-World Testing&#10;7-Day No-Hassle Swap Guarantee"
                className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">About Page Feature Image URL</label>
              <input
                type="text"
                value={content.aboutImage || ''}
                onChange={(e) => handleFieldChange('aboutImage', e.target.value)}
                placeholder="https://..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: CONTACT & FAQS ================= */}
      {activeSubTab === 'contact' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h4 className="font-extrabold text-base text-[#333333]">Contact Page Details</h4>
              <p className="text-xs text-gray-500">
                Official contact channels, fulfillment hub address, and support hours shown to customers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Page Heading</label>
                <input
                  type="text"
                  value={content.contactHeading || ''}
                  onChange={(e) => handleFieldChange('contactHeading', e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Subheading</label>
                <input
                  type="text"
                  value={content.contactSubheading || ''}
                  onChange={(e) => handleFieldChange('contactSubheading', e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Physical Office / Central Fulfillment Hub Address
                </label>
                <input
                  type="text"
                  value={content.officeAddress || ''}
                  onChange={(e) => handleFieldChange('officeAddress', e.target.value)}
                  placeholder="14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Operating Hours</label>
                <input
                  type="text"
                  value={content.businessHours || ''}
                  onChange={(e) => handleFieldChange('businessHours', e.target.value)}
                  placeholder="Monday – Saturday: 8:00 AM – 7:00 PM | Sunday: 10:00 AM – 4:00 PM"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>
          </div>

          {/* FAQs Manager */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h4 className="font-extrabold text-base text-[#333333]">Store FAQs Manager</h4>
                <p className="text-xs text-gray-500">
                  Manage questions and answers displayed on the Contact and Support page.
                </p>
              </div>
              <span className="text-xs font-bold text-[#F5A623] bg-amber-50 px-3 py-1 rounded-full">
                {faqs.length} FAQs Live
              </span>
            </div>

            {/* Add FAQ form */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">Add New Question & Answer</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Customer Question (e.g. Can I test the product before paying?)"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
                <div>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="payments">Payments & COD</option>
                    <option value="delivery">Delivery & Shipping</option>
                    <option value="orders">Orders & Tracking</option>
                    <option value="products">Quality & Warranties</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Clear answer for the customer..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddFaq}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="bg-[#333333] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Question</span>
                </button>
              </div>
            </div>

            {/* List of current FAQs */}
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id || index}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white shadow-2xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                      <h5 className="font-bold text-xs text-gray-900">{faq.question}</h5>
                    </div>
                    <p className="text-xs text-gray-600 pl-1">{faq.answer}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveFaq(faq.id, index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: DELIVERY & RETURNS POLICY ================= */}
      {activeSubTab === 'delivery' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h4 className="font-extrabold text-base text-[#333333]">Delivery Details & Returns CMS</h4>
            <p className="text-xs text-gray-500">
              Set the delivery timelines, Cash on Delivery doorstep rules, and swap guarantee copy.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Lagos Delivery Timeline & Hub Details
              </label>
              <textarea
                rows={2}
                value={content.deliveryLagosInfo || ''}
                onChange={(e) => handleFieldChange('deliveryLagosInfo', e.target.value)}
                placeholder="24 to 48 hours delivery time. Direct riders dispatched from our Lagos central fulfillment hub."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nationwide Delivery Timeline (All 36 States)
              </label>
              <textarea
                rows={2}
                value={content.deliveryNationwideInfo || ''}
                onChange={(e) => handleFieldChange('deliveryNationwideInfo', e.target.value)}
                placeholder="2 to 4 business days to Abuja, Port Harcourt, Ibadan, Kano, Enugu, and all 36 Nigerian states."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cash on Delivery Doorstep Guarantee
              </label>
              <textarea
                rows={3}
                value={content.deliveryCodGuarantee || ''}
                onChange={(e) => handleFieldChange('deliveryCodGuarantee', e.target.value)}
                placeholder="We respect your peace of mind. Pay cash or via instant POS transfer only when you receive your order at your doorstep."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                7-Day Replacement / Returns Policy
              </label>
              <textarea
                rows={3}
                value={content.returnsPolicyText || ''}
                onChange={(e) => handleFieldChange('returnsPolicyText', e.target.value)}
                placeholder="If a product arrives with any factory defect, notify us within 7 days for a 100% free swap."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Product Warranty & Brand Guarantee
              </label>
              <textarea
                rows={2}
                value={content.warrantyPolicyText || ''}
                onChange={(e) => handleFieldChange('warrantyPolicyText', e.target.value)}
                placeholder="All electronic items and home appliances include our standard 30-day manufacturer guarantee."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: LEGAL (TERMS & PRIVACY) ================= */}
      {activeSubTab === 'legal' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h4 className="font-extrabold text-base text-[#333333]">Terms of Service & Privacy Policy</h4>
            <p className="text-xs text-gray-500">
              Manage the customer legal agreements, data protection disclosures, and store policies.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Terms and Conditions</label>
              <textarea
                rows={6}
                value={content.termsContent || ''}
                onChange={(e) => handleFieldChange('termsContent', e.target.value)}
                placeholder="By using Boricart, you agree to comply with our purchasing policies..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Privacy Policy</label>
              <textarea
                rows={6}
                value={content.privacyContent || ''}
                onChange={(e) => handleFieldChange('privacyContent', e.target.value)}
                placeholder="Boricart respects your privacy. We only use your shipping details for delivery fulfillment..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Action */}
      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={() => handleSaveAllPages()}
          disabled={isSaving}
          className="bg-[#F5A623] hover:bg-[#D98200] text-white font-black py-3.5 px-8 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving All Pages...' : 'Save All Page Changes to Storefront'}</span>
        </button>
      </div>
    </div>
  );
};
