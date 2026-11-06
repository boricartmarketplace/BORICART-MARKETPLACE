import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { StoreSettings } from '../types';

interface ContactPageProps {
  whatsappNumber?: string;
  supportEmail?: string;
  settings?: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  whatsappNumber: propWhatsapp,
  supportEmail: propEmail,
  settings,
}) => {
  const whatsappNumber = settings?.whatsappNumber || propWhatsapp || '+2348140008921';
  const supportEmail = settings?.supportEmail || propEmail || 'support@boricart.com';
  const supportPhone = settings?.supportPhone || '+234 814 000 8921';
  const officeAddress = settings?.officeAddress || settings?.pagesContent?.officeAddress || '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria';
  const businessHours = settings?.pagesContent?.businessHours || 'Monday – Saturday: 8:00 AM – 7:00 PM | Sunday: 10:00 AM – 4:00 PM';
  const heading = settings?.pagesContent?.contactHeading || 'We Are Here to Assist You';
  const subheading = settings?.pagesContent?.contactSubheading || 'Have a question about a product, your delivery, or bulk orders? Connect with our dedicated team in Lagos.';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = settings?.pagesContent?.contactFaqs && settings.pagesContent.contactFaqs.length > 0
    ? settings.pagesContent.contactFaqs
    : [
    {
      q: 'How does Cash on Delivery (COD) work with Boricart?',
      a: 'You simply place your order on our website without making any upfront payment. Once our dispatch rider brings your package to your doorstep, you open and inspect your items, and only pay using Cash or POS / Bank Transfer.',
    },
    {
      q: 'How fast is delivery to Lagos and other Nigerian states?',
      a: 'Deliveries within Lagos are typically completed within 24 to 48 hours. Deliveries to Abuja, Port Harcourt, Ibadan, and other nationwide locations take 2 to 4 business days via express interstate couriers.',
    },
    {
      q: 'Are Boricart products covered by a warranty?',
      a: 'Yes! All Boricart products include our standard 7-day replacement guarantee against any factory or electronic defects. If you encounter any issue, contact us directly on WhatsApp for an immediate swap.',
    },
    {
      q: 'Can I place my order directly over WhatsApp?',
      a: 'Absolutely! If you prefer chatting with a real representative, click our WhatsApp button. Our team will take your delivery address and dispatch your order immediately.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#333333]">
          {heading}
        </h1>
        <p className="text-sm text-gray-500">
          {subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Contact Info & WhatsApp Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* WhatsApp Direct Card */}
          <div className="bg-gradient-to-br from-[#25D366]/10 to-emerald-100/50 border border-emerald-200 p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Instant WhatsApp Support</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Skip the wait! Chat directly with our support team on WhatsApp for real-time order tracking,
                recommendations, or inquiries.
              </p>
            </div>
            <WhatsAppButton
              phone={whatsappNumber}
              label="Chat on WhatsApp Now"
              variant="primary"
              className="w-full justify-center"
            />
          </div>

          {/* Details list */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#333333]">Headquarters</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {officeAddress}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#333333]">Customer Care Line</h4>
                <p className="text-xs text-gray-500 mt-0.5">{supportPhone || whatsappNumber}</p>
                <p className="text-[11px] text-gray-400">Available on phone calls & WhatsApp</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#333333]">Email Support</h4>
                <p className="text-xs text-gray-500 mt-0.5">{supportEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F5A623] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#333333]">Business Hours</h4>
                <p className="text-xs text-gray-500 mt-0.5">{businessHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Message Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#333333]">Send Us a Message</h2>
            <p className="text-xs text-gray-500 mt-1">
              Fill out the form below and we will respond within 2 to 4 business hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Message Received!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Thank you for contacting Boricart. Our team will review your message and reach out to
                you via your provided phone number or email shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                }}
                className="text-xs font-bold text-[#F5A623] hover:underline pt-2 block mx-auto"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinelo Okon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. chinelo@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery status in Abuja"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3.5 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-gray-50/70 rounded-3xl p-6 sm:p-10 border border-gray-100 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#F5A623] uppercase tracking-wider">
            Quick Answers
          </span>
          <h2 className="text-2xl font-black text-[#333333] mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-sm text-[#333333] hover:text-[#F5A623] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F5A623] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
