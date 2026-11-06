/**
 * Boricart Multi-Platform Pixel Tracking Service
 * Supports: Meta (Facebook) Pixel, Google Tag (GA4/Ads), TikTok Pixel, and Pinterest Tag
 */

import { PixelSettings, Product, Order } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    ttq?: any;
    pintrk?: any;
  }
}

export interface FiredPixelEvent {
  id: string;
  timestamp: string;
  platform: 'facebook' | 'google' | 'tiktok' | 'pinterest';
  eventName: string;
  data?: Record<string, any>;
}

// In-memory event log for Admin verification & test console
const firedEventsLog: FiredPixelEvent[] = [];
type EventListener = (event: FiredPixelEvent) => void;
const eventListeners: EventListener[] = [];

export function subscribeToPixelEvents(listener: EventListener): () => void {
  eventListeners.push(listener);
  return () => {
    const idx = eventListeners.indexOf(listener);
    if (idx !== -1) eventListeners.splice(idx, 1);
  };
}

export function getRecentPixelEvents(): FiredPixelEvent[] {
  return [...firedEventsLog].reverse().slice(0, 30);
}

function recordEvent(platform: FiredPixelEvent['platform'], eventName: string, data?: Record<string, any>) {
  const event: FiredPixelEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toLocaleTimeString('en-GB'),
    platform,
    eventName,
    data,
  };
  firedEventsLog.push(event);
  if (firedEventsLog.length > 50) firedEventsLog.shift();
  eventListeners.forEach((fn) => {
    try {
      fn(event);
    } catch (e) {
      console.warn('Error in pixel event listener:', e);
    }
  });

  if (activeConfig.testMode) {
    console.log(`%c[Boricart Pixel: ${platform.toUpperCase()}] %c${eventName}`, 'color: #F5A623; font-weight: bold;', 'color: #333;', data || '');
  }
}

let isInitialized = false;
let activeConfig: PixelSettings = {
  facebookPixelEnabled: true,
  googleTagEnabled: true,
  tiktokPixelEnabled: true,
  pinterestTagEnabled: true,
  testMode: false,
};

/**
 * Initializes and injects all active pixels into document head
 */
export function initPixels(config?: PixelSettings) {
  if (config) {
    activeConfig = {
      ...activeConfig,
      ...config,
    };
  }

  if (typeof window === 'undefined') return;

  // 1. FACEBOOK / META PIXEL
  const fbId = activeConfig.facebookPixelId?.trim();
  if (fbId && activeConfig.facebookPixelEnabled && !window.fbq) {
    try {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', fbId);
      recordEvent('facebook', 'init', { pixelId: fbId });
    } catch (err) {
      console.warn('Meta Pixel initialization warning:', err);
    }
  }

  // 2. GOOGLE TAG (GA4 / Google Ads)
  const gTagId = activeConfig.googleTagId?.trim();
  if (gTagId && activeConfig.googleTagEnabled && !window.gtag) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gTagId, {
        send_page_view: false, // We trigger SPA page_views manually
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gTagId}`;
      document.head.appendChild(script);

      recordEvent('google', 'init', { tagId: gTagId });
    } catch (err) {
      console.warn('Google Tag initialization warning:', err);
    }
  }

  // 3. TIKTOK PIXEL
  const ttId = activeConfig.tiktokPixelId?.trim();
  if (ttId && activeConfig.tiktokPixelEnabled && !window.ttq) {
    try {
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        const ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.load = function (e: any, n?: any) {
          const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = r;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          const s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = r + '?sdkid=' + e + '&lib=' + t;
          const a = d.getElementsByTagName('script')[0];
          a.parentNode.insertBefore(s, a);
        };
        ttq.load(ttId);
      })(window, document, 'ttq');

      recordEvent('tiktok', 'init', { pixelId: ttId });
    } catch (err) {
      console.warn('TikTok Pixel initialization warning:', err);
    }
  }

  // 4. PINTEREST TAG
  const pinId = activeConfig.pinterestTagId?.trim();
  if (pinId && activeConfig.pinterestTagEnabled && !window.pintrk) {
    try {
      (function (e: any) {
        if (!window.pintrk) {
          window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments));
          };
          const n: any = window.pintrk;
          n.queue = [];
          n.version = '3.0';
          const t = document.createElement('script');
          t.async = true;
          t.src = e;
          const r = document.getElementsByTagName('script')[0];
          if (r && r.parentNode) {
            r.parentNode.insertBefore(t, r);
          } else {
            document.head.appendChild(t);
          }
        }
      })('https://s.pinimg.com/ct/core.js');

      window.pintrk('load', pinId);
      recordEvent('pinterest', 'init', { tagId: pinId });
    } catch (err) {
      console.warn('Pinterest Tag initialization warning:', err);
    }
  }

  isInitialized = true;
}

/**
 * Track PageView across all configured pixels
 */
export function trackPageView(pageName: string, path = window.location.pathname) {
  // Meta
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    recordEvent('facebook', 'PageView', { pageName, path });
  }

  // Google
  if (activeConfig.googleTagEnabled) {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `Boricart - ${pageName}`,
        page_path: path,
      });
    }
    recordEvent('google', 'page_view', { page_title: pageName, page_path: path });
  }

  // TikTok
  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq && typeof window.ttq.page === 'function') {
      window.ttq.page();
    }
    recordEvent('tiktok', 'page', { pageName, path });
  }

  // Pinterest
  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) {
      window.pintrk('page');
    }
    recordEvent('pinterest', 'page', { pageName, path });
  }
}

/**
 * Track ViewContent when customer opens a product page
 */
export function trackViewContent(product: Product) {
  const price = product.promotionalPrice || product.regularPrice;

  // Meta ViewContent
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_category: product.categoryName,
        content_ids: [product.id, product.sku],
        content_type: 'product',
        value: price,
        currency: 'NGN',
      });
    }
    recordEvent('facebook', 'ViewContent', { product: product.name, value: price, currency: 'NGN' });
  }

  // Google view_item
  if (activeConfig.googleTagEnabled) {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'NGN',
        value: price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categoryName,
            price: price,
          },
        ],
      });
    }
    recordEvent('google', 'view_item', { product: product.name, value: price });
  }

  // TikTok ViewContent
  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) {
      window.ttq.track('ViewContent', {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
        value: price,
        currency: 'NGN',
      });
    }
    recordEvent('tiktok', 'ViewContent', { product: product.name, value: price });
  }

  // Pinterest PageVisit
  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) {
      window.pintrk('track', 'pagevisit', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.categoryName,
        value: price,
        currency: 'NGN',
      });
    }
    recordEvent('pinterest', 'pagevisit', { product: product.name, value: price });
  }
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(product: Product, quantity = 1) {
  const price = product.promotionalPrice || product.regularPrice;
  const value = price * quantity;

  // Meta AddToCart
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_category: product.categoryName,
        content_ids: [product.id, product.sku],
        content_type: 'product',
        value: value,
        currency: 'NGN',
      });
    }
    recordEvent('facebook', 'AddToCart', { product: product.name, quantity, value, currency: 'NGN' });
  }

  // Google add_to_cart
  if (activeConfig.googleTagEnabled) {
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'NGN',
        value: value,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.categoryName,
            price: price,
            quantity: quantity,
          },
        ],
      });
    }
    recordEvent('google', 'add_to_cart', { product: product.name, quantity, value });
  }

  // TikTok AddToCart
  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
        quantity: quantity,
        value: value,
        currency: 'NGN',
      });
    }
    recordEvent('tiktok', 'AddToCart', { product: product.name, quantity, value });
  }

  // Pinterest AddToCart
  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) {
      window.pintrk('track', 'addtocart', {
        product_id: product.id,
        product_name: product.name,
        product_quantity: quantity,
        value: value,
        currency: 'NGN',
      });
    }
    recordEvent('pinterest', 'addtocart', { product: product.name, quantity, value });
  }
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(itemsCount: number, totalAmount: number) {
  // Meta InitiateCheckout
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        num_items: itemsCount,
        value: totalAmount,
        currency: 'NGN',
      });
    }
    recordEvent('facebook', 'InitiateCheckout', { itemsCount, totalAmount, currency: 'NGN' });
  }

  // Google begin_checkout
  if (activeConfig.googleTagEnabled) {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'NGN',
        value: totalAmount,
      });
    }
    recordEvent('google', 'begin_checkout', { itemsCount, value: totalAmount });
  }

  // TikTok InitiateCheckout
  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        num_items: itemsCount,
        value: totalAmount,
        currency: 'NGN',
      });
    }
    recordEvent('tiktok', 'InitiateCheckout', { itemsCount, value: totalAmount });
  }

  // Pinterest InitiateCheckout
  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) {
      window.pintrk('track', 'checkout', {
        value: totalAmount,
        currency: 'NGN',
        order_quantity: itemsCount,
      });
    }
    recordEvent('pinterest', 'checkout_initiate', { itemsCount, value: totalAmount });
  }
}

/**
 * Track Purchase event on order completion
 */
export function trackPurchase(order: Order) {
  // Meta Purchase
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: order.totalAmount,
        currency: 'NGN',
        content_type: 'product',
        content_ids: order.items.map((i) => i.productId),
        num_items: order.items.length,
        order_id: order.orderNumber,
      });
    }
    recordEvent('facebook', 'Purchase', {
      orderNumber: order.orderNumber,
      value: order.totalAmount,
      paymentMethod: order.paymentMethod,
    });
  }

  // Google purchase
  if (activeConfig.googleTagEnabled) {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value: order.totalAmount,
        currency: 'NGN',
        shipping: order.deliveryFee,
        items: order.items.map((i) => ({
          item_id: i.productId,
          item_name: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }
    recordEvent('google', 'purchase', {
      transaction_id: order.orderNumber,
      value: order.totalAmount,
    });
  }

  // TikTok CompletePayment
  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) {
      window.ttq.track('CompletePayment', {
        content_type: 'product',
        value: order.totalAmount,
        currency: 'NGN',
        order_id: order.orderNumber,
      });
    }
    recordEvent('tiktok', 'CompletePayment', {
      order_id: order.orderNumber,
      value: order.totalAmount,
    });
  }

  // Pinterest checkout
  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) {
      window.pintrk('track', 'checkout', {
        value: order.totalAmount,
        order_quantity: order.items.length,
        currency: 'NGN',
        order_id: order.orderNumber,
      });
    }
    recordEvent('pinterest', 'checkout', {
      order_id: order.orderNumber,
      value: order.totalAmount,
    });
  }
}

/**
 * Track Search query
 */
export function trackSearch(query: string) {
  if (!query || query.length < 2) return;

  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) window.fbq('track', 'Search', { search_string: query });
    recordEvent('facebook', 'Search', { query });
  }

  if (activeConfig.googleTagEnabled) {
    if (window.gtag) window.gtag('event', 'search', { search_term: query });
    recordEvent('google', 'search', { search_term: query });
  }

  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) window.ttq.track('Search', { query });
    recordEvent('tiktok', 'Search', { query });
  }

  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) window.pintrk('track', 'search', { search_query: query });
    recordEvent('pinterest', 'search', { search_query: query });
  }
}

/**
 * Track Customer Contact (WhatsApp click or Email)
 */
export function trackContact(method: 'WhatsApp' | 'Email' | 'Phone') {
  if (activeConfig.facebookPixelEnabled) {
    if (window.fbq) window.fbq('track', 'Contact');
    recordEvent('facebook', 'Contact', { method });
  }

  if (activeConfig.googleTagEnabled) {
    if (window.gtag) window.gtag('event', 'contact', { method });
    recordEvent('google', 'contact', { method });
  }

  if (activeConfig.tiktokPixelEnabled) {
    if (window.ttq) window.ttq.track('Contact');
    recordEvent('tiktok', 'Contact', { method });
  }

  if (activeConfig.pinterestTagEnabled) {
    if (window.pintrk) window.pintrk('track', 'lead', { lead_type: method });
    recordEvent('pinterest', 'lead', { method });
  }
}
