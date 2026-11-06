import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PixelSettings } from '../../types';
import {
  getRecentPixelEvents,
  subscribeToPixelEvents,
  FiredPixelEvent,
  trackPageView,
  trackSearch,
  trackContact,
} from '../../services/pixelService';

interface PixelSettingsCardProps {
  pixels?: PixelSettings;
  onChange: (updatedPixels: PixelSettings) => void;
}

export const PixelSettingsCard: React.FC<PixelSettingsCardProps> = ({ pixels, onChange }) => {
  const [localPixels, setLocalPixels] = useState<PixelSettings>({
    facebookPixelId: pixels?.facebookPixelId || '',
    facebookPixelEnabled: pixels?.facebookPixelEnabled ?? true,
    googleTagId: pixels?.googleTagId || '',
    googleTagEnabled: pixels?.googleTagEnabled ?? true,
    tiktokPixelId: pixels?.tiktokPixelId || '',
    tiktokPixelEnabled: pixels?.tiktokPixelEnabled ?? true,
    pinterestTagId: pixels?.pinterestTagId || '',
    pinterestTagEnabled: pixels?.pinterestTagEnabled ?? true,
    testMode: pixels?.testMode ?? false,
  });

  const [recentEvents, setRecentEvents] = useState<FiredPixelEvent[]>(getRecentPixelEvents());
  const [testFiring, setTestFiring] = useState(false);

  useEffect(() => {
    if (pixels) {
      setLocalPixels({
        facebookPixelId: pixels.facebookPixelId || '',
        facebookPixelEnabled: pixels.facebookPixelEnabled ?? true,
        googleTagId: pixels.googleTagId || '',
        googleTagEnabled: pixels.googleTagEnabled ?? true,
        tiktokPixelId: pixels.tiktokPixelId || '',
        tiktokPixelEnabled: pixels.tiktokPixelEnabled ?? true,
        pinterestTagId: pixels.pinterestTagId || '',
        pinterestTagEnabled: pixels.pinterestTagEnabled ?? true,
        testMode: pixels.testMode ?? false,
      });
    }
  }, [pixels]);

  // Subscribe to live fired events
  useEffect(() => {
    const unsubscribe = subscribeToPixelEvents(() => {
      setRecentEvents(getRecentPixelEvents());
    });
    return () => unsubscribe();
  }, []);

  const updateField = (field: keyof PixelSettings, val: any) => {
    const updated = {
      ...localPixels,
      [field]: val,
    };
    setLocalPixels(updated);
    onChange(updated);
  };

  const handleTestFire = () => {
    setTestFiring(true);
    trackPageView('Admin Test Event', '/admin');
    trackSearch('Boricart Cordless Vacuum');
    trackContact('WhatsApp');
    setTimeout(() => {
      setTestFiring(false);
      setRecentEvents(getRecentPixelEvents());
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-[#333333]">
              Marketing & Conversion Tracking Pixels
            </h4>
            <p className="text-xs text-gray-500">
              Install and configure tracking tags for Meta (Facebook), Google, TikTok, and Pinterest.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestFire}
            disabled={testFiring}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Fire a test PageView and Search event to verify tracking"
          >
            <Play className={`w-3.5 h-3.5 text-[#F5A623] ${testFiring ? 'animate-spin' : ''}`} />
            <span>Test Fire Pixels</span>
          </button>
        </div>
      </div>

      {/* Grid of the 4 Ad Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. FACEBOOK / META PIXEL */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                f
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-gray-900">Meta (Facebook) Pixel</h5>
                <span className="text-[10px] text-gray-400">Instagram & Facebook Ads</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPixels.facebookPixelEnabled}
                onChange={(e) => updateField('facebookPixelEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Meta Pixel ID / Dataset ID
            </label>
            <input
              type="text"
              placeholder="e.g. 148920192837465"
              value={localPixels.facebookPixelId || ''}
              onChange={(e) => updateField('facebookPixelId', e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Found in Meta Events Manager &gt; Data Sources &gt; Pixel ID.
            </span>
          </div>

          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Standard events: ViewContent, AddToCart, Purchase, Contact</span>
            </span>
          </div>
        </div>

        {/* 2. GOOGLE TAG (GA4 / ADS) */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#EA4335] flex items-center justify-center font-black text-sm shadow-2xs">
                G
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-gray-900">Google Tag (GA4 / Ads)</h5>
                <span className="text-[10px] text-gray-400">Google Analytics 4 & Google Ads</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPixels.googleTagEnabled}
                onChange={(e) => updateField('googleTagEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EA4335]"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Google Tag Measurement ID
            </label>
            <input
              type="text"
              placeholder="e.g. G-XXXXXXX or AW-XXXXXXX"
              value={localPixels.googleTagId || ''}
              onChange={(e) => updateField('googleTagId', e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#EA4335] font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Measurement ID from Google Analytics (G-) or Google Ads Conversion ID (AW-).
            </span>
          </div>

          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#EA4335]" />
              <span>Events: page_view, view_item, add_to_cart, begin_checkout, purchase</span>
            </span>
          </div>
        </div>

        {/* 3. TIKTOK PIXEL */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 hover:border-black transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm">
                d
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-gray-900">TikTok Pixel</h5>
                <span className="text-[10px] text-gray-400">TikTok Ads Manager</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPixels.tiktokPixelEnabled}
                onChange={(e) => updateField('tiktokPixelEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              TikTok Pixel ID
            </label>
            <input
              type="text"
              placeholder="e.g. C1234567890ABCDEF"
              value={localPixels.tiktokPixelId || ''}
              onChange={(e) => updateField('tiktokPixelId', e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-black font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Found in TikTok Ads Manager &gt; Assets &gt; Events &gt; Web Events.
            </span>
          </div>

          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              <span>Events: ViewContent, AddToCart, InitiateCheckout, CompletePayment</span>
            </span>
          </div>
        </div>

        {/* 4. PINTEREST TAG */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E60023] text-white flex items-center justify-center font-black text-sm">
                P
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-gray-900">Pinterest Tag</h5>
                <span className="text-[10px] text-gray-400">Pinterest Business Ads</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localPixels.pinterestTagEnabled}
                onChange={(e) => updateField('pinterestTagEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E60023]"></div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Pinterest Tag ID
            </label>
            <input
              type="text"
              placeholder="e.g. 2612345678901"
              value={localPixels.pinterestTagId || ''}
              onChange={(e) => updateField('pinterestTagId', e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E60023] font-mono"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Found in Pinterest Ads Manager &gt; Conversions &gt; Tag Manager.
            </span>
          </div>

          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E60023]" />
              <span>Events: pagevisit, addtocart, checkout, search, lead</span>
            </span>
          </div>
        </div>
      </div>

      {/* Developer / Debug Mode switch */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#F5A623] shrink-0" />
          <div>
            <span className="text-xs font-bold text-gray-900 block">Console Debug Logging</span>
            <span className="text-[11px] text-gray-500">
              When enabled, all pixel events (PageView, AddToCart, Purchase) log clearly to the browser developer console.
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={localPixels.testMode}
            onChange={(e) => updateField('testMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F5A623]"></div>
        </label>
      </div>

      {/* Live Event Firing Log */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h5 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
              Live Pixel Activity Stream
            </h5>
          </div>
          <span className="text-[11px] text-gray-400">
            {recentEvents.length} events logged this session
          </span>
        </div>

        <div className="bg-gray-900 text-gray-200 rounded-2xl p-4 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1.5 shadow-inner">
          {recentEvents.length === 0 ? (
            <div className="py-4 text-center text-gray-500 text-xs">
              No pixel events fired yet. Click "Test Fire Pixels" above or navigate products to see real-time triggers.
            </div>
          ) : (
            recentEvents.map((evt) => {
              const platformColor =
                evt.platform === 'facebook'
                  ? 'text-blue-400'
                  : evt.platform === 'google'
                  ? 'text-red-400'
                  : evt.platform === 'tiktok'
                  ? 'text-cyan-400'
                  : 'text-rose-400';

              return (
                <div key={evt.id} className="flex items-start justify-between gap-2 border-b border-gray-800 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-[10px]">[{evt.timestamp}]</span>
                    <span className={`font-bold uppercase ${platformColor}`}>[{evt.platform}]</span>
                    <span className="text-white font-semibold">{evt.eventName}</span>
                    {evt.data && (
                      <span className="text-gray-400 text-[10px] hidden sm:inline">
                        {JSON.stringify(evt.data)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded">
                    Fired
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
