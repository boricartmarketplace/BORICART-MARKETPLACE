import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { PolicyPages } from './pages/PolicyPages';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Product, Category, Order, StoreSettings } from './types';
import {
  getProducts,
  getCategories,
  getOrders,
  getStoreSettings,
} from './firebase/services';
import { DEFAULT_SETTINGS } from './data/initialCatalog';
import { initPixels, trackPageView, captureAdAttribution } from './services/pixelService';

// Parse initial route from URL path, query, or hash
function parseRouteFromLocation(isAdminUser: boolean): { route: string; params: Record<string, any> } {
  const pathname = window.location.pathname.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();

  // 1. Dedicated Admin Portal Links (/admin, /admin-login, /admin-dashboard, #admin, ?admin=true)
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/admin-login' ||
    pathname === '/admin-dashboard' ||
    hash === '#admin' ||
    hash === '#dashboard' ||
    hash === '#admin-login' ||
    hash === '#admin-dashboard' ||
    search.has('admin')
  ) {
    return { route: isAdminUser ? 'admin-dashboard' : 'admin-login', params: {} };
  }

  // 2. Product Sales Page Links (/product/:slug, #/product/:slug, ?product=:slug)
  if (pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '').split('/')[0].split('?')[0];
    if (slug) return { route: 'product', params: { slug } };
  }
  if (hash.startsWith('#/product/')) {
    const slug = hash.replace('#/product/', '').split('/')[0].split('?')[0];
    if (slug) return { route: 'product', params: { slug } };
  }
  if (search.has('product')) {
    const slug = search.get('product') || '';
    if (slug) return { route: 'product', params: { slug } };
  }

  // 3. Category Links (/category/:slug, #/category/:slug, ?category=:slug)
  if (pathname.startsWith('/category/')) {
    const slug = pathname.replace('/category/', '').split('/')[0].split('?')[0];
    if (slug) return { route: 'category', params: { categoryId: slug, slug } };
  }
  if (hash.startsWith('#/category/')) {
    const slug = hash.replace('#/category/', '').split('/')[0].split('?')[0];
    if (slug) return { route: 'category', params: { categoryId: slug, slug } };
  }
  if (search.has('category')) {
    const slug = search.get('category') || '';
    if (slug) return { route: 'category', params: { categoryId: slug, slug } };
  }

  // 4. Standard Static Pages
  if (pathname === '/shop' || hash === '#/shop') return { route: 'shop', params: {} };
  if (pathname === '/cart' || hash === '#/cart') return { route: 'cart', params: {} };
  if (pathname === '/checkout' || hash === '#/checkout') return { route: 'checkout', params: {} };
  if (pathname === '/order-confirmation' || hash === '#/order-confirmation') return { route: 'order-confirmation', params: {} };
  if (pathname === '/contact' || hash === '#/contact') return { route: 'contact', params: {} };
  if (pathname === '/about' || hash === '#/about') return { route: 'about', params: {} };
  if (pathname === '/delivery-policy' || hash === '#/delivery-policy') return { route: 'delivery-policy', params: {} };
  if (pathname === '/terms' || hash === '#/terms') return { route: 'terms', params: {} };
  if (pathname === '/privacy' || hash === '#/privacy') return { route: 'privacy', params: {} };

  return { route: 'home', params: {} };
}

function MainApp() {
  const { isAdmin } = useAuth();
  const { toastMessage, clearToast } = useCart();

  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize pixels when settings update
  useEffect(() => {
    if (settings.pixels) {
      initPixels(settings.pixels);
    }
  }, [settings.pixels]);

  // Load store data from Firestore
  const loadData = async () => {
    try {
      const [fetchedProducts, fetchedCategories, fetchedSettings, fetchedOrders] = await Promise.all([
        getProducts(!isAdmin),
        getCategories(),
        getStoreSettings(),
        getOrders(),
      ]);

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setSettings(fetchedSettings);
      setOrders(fetchedOrders);

      if (fetchedSettings?.pixels) {
        initPixels(fetchedSettings.pixels);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  // Listen to live customer order creation events across checkout & offline POS
  useEffect(() => {
    const handleOrderCreated = (event: Event) => {
      const customEvent = event as CustomEvent<Order>;
      if (customEvent.detail) {
        setOrders((prev) => [customEvent.detail, ...prev.filter((o) => o.id !== customEvent.detail.id)]);
      }
      loadData();
    };

    window.addEventListener('boricart:order_created', handleOrderCreated);
    return () => window.removeEventListener('boricart:order_created', handleOrderCreated);
  }, []);

  // Parse initial route and capture UTM ad attribution from URL on boot
  useEffect(() => {
    captureAdAttribution();
    const initial = parseRouteFromLocation(isAdmin);
    setCurrentRoute(initial.route);
    setRouteParams(initial.params);

    const handleLocationChange = () => {
      captureAdAttribution();
      const updated = parseRouteFromLocation(isAdmin);
      setCurrentRoute(updated.route);
      setRouteParams(updated.params);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [isAdmin]);

  // Dynamic SEO & Title synchronization
  useEffect(() => {
    const baseTitle = 'BORICART — Everyday Solutions. Better Living.';

    if (currentRoute === 'product') {
      const activeProd = products.find((p) => p.slug === routeParams.slug || p.id === routeParams.id);
      if (activeProd) {
        document.title = `${activeProd.name} — Buy Online & Pay on Delivery | Boricart`;
      }
    } else if (currentRoute === 'category') {
      const activeCat = categories.find((c) => c.slug === routeParams.slug || c.id === routeParams.categoryId);
      if (activeCat) {
        document.title = `${activeCat.name} Solutions — Boricart Nigeria`;
      }
    } else if (currentRoute === 'shop') {
      document.title = 'Shop Everyday Solutions — Boricart Nigeria';
    } else if (currentRoute === 'cart') {
      document.title = 'Shopping Cart — Boricart Nigeria';
    } else if (currentRoute === 'checkout') {
      document.title = 'Cash on Delivery Checkout — Boricart Nigeria';
    } else if (currentRoute === 'admin-dashboard' || currentRoute === 'admin-login') {
      document.title = 'Boricart Portal — Staff & Store Management';
    } else {
      document.title = baseTitle;
    }
  }, [currentRoute, routeParams, products, categories]);

  // Navigate handler that synchronizes clean URLs, history, and pixel tracking
  const handleNavigate = useCallback(
    (page: string, params: Record<string, any> = {}) => {
      setCurrentRoute(page);
      setRouteParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Determine clean URL path
      let path = '/';
      if (page === 'product') {
        const slug = params.slug || params.id || '';
        path = `/product/${slug}`;
      } else if (page === 'category') {
        const slug = params.slug || params.categoryId || '';
        path = `/category/${slug}`;
      } else if (page === 'admin-dashboard' || page === 'admin-login') {
        path = '/admin';
      } else if (page !== 'home') {
        path = `/${page}`;
      }

      // Update browser URL seamlessly preserving UTM parameters
      try {
        const currentUrl = new URL(window.location.href);
        currentUrl.pathname = path;

        // Keep hash in sync for instant #admin access if requested
        if (page === 'admin-dashboard' || page === 'admin-login') {
          currentUrl.hash = '#admin';
        } else if (currentUrl.hash === '#admin') {
          currentUrl.hash = '';
        }

        window.history.pushState(null, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
      } catch {
        window.history.pushState(null, '', path);
      }

      // Pixel PageView
      trackPageView(page.charAt(0).toUpperCase() + page.slice(1), path);
    },
    []
  );

  // Find active product for product detail route
  const activeProduct =
    currentRoute === 'product'
      ? products.find((p) => p.slug === routeParams.slug || p.id === routeParams.id || p.sku === routeParams.slug) ||
        products[0]
      : null;

  // Render Page Content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#F5A623] border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Loading Boricart Everyday Solutions...
          </p>
        </div>
      );
    }

    switch (currentRoute) {
      case 'home':
        return (
          <HomePage
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'shop':
        return (
          <ShopPage
            products={products}
            categories={categories}
            initialSearch={routeParams.search || ''}
            initialCollection={routeParams.collection}
            initialFilter={routeParams.filter}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'category':
        return (
          <ShopPage
            products={products}
            categories={categories}
            initialCategory={routeParams.categoryId || routeParams.slug}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'product':
        if (!activeProduct) {
          return (
            <div className="py-20 text-center space-y-3">
              <p className="text-gray-500 text-sm font-medium">Product not found.</p>
              <button
                onClick={() => handleNavigate('shop')}
                className="px-5 py-2.5 bg-[#F5A623] text-black font-bold rounded-xl text-xs"
              >
                Return to All Products
              </button>
            </div>
          );
        }
        return (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
            deliveryFee={settings.deliveryFee}
            settings={settings}
          />
        );

      case 'cart':
        return (
          <CartPage
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
            deliveryFee={settings.deliveryFee}
            freeDeliveryThreshold={settings.freeDeliveryThreshold}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            onNavigate={handleNavigate}
            deliveryFee={settings.deliveryFee}
            freeDeliveryThreshold={settings.freeDeliveryThreshold}
            settings={settings}
          />
        );

      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            order={routeParams.order || null}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'contact':
        return (
          <ContactPage
            settings={settings}
            whatsappNumber={settings.whatsappNumber}
            supportEmail={settings.supportEmail}
          />
        );

      case 'about':
        return (
          <AboutPage
            settings={settings}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'delivery-policy':
        return (
          <PolicyPages
            settings={settings}
            initialPolicy="delivery"
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'terms':
        return (
          <PolicyPages
            settings={settings}
            initialPolicy="terms"
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'privacy':
        return (
          <PolicyPages
            settings={settings}
            initialPolicy="privacy"
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );

      case 'admin-login':
        return <AdminLogin onNavigate={handleNavigate} />;

      case 'admin-dashboard':
        if (!isAdmin) {
          return <AdminLogin onNavigate={handleNavigate} />;
        }
        return (
          <AdminDashboard
            products={products}
            categories={categories}
            orders={orders}
            settings={settings}
            onRefreshData={loadData}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <HomePage
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={handleNavigate}
            whatsappNumber={settings.whatsappNumber}
          />
        );
    }
  };

  const isAdminView = currentRoute === 'admin-dashboard';
  const isProductSalesPageView = currentRoute === 'product';
  const showStoreHeaderFooter = !isAdminView && !isProductSalesPageView;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Customer Header (Hidden in Admin Dashboard and Product Sales Landing Page) */}
      {showStoreHeaderFooter && (
        <Header
          categories={categories}
          products={products}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          whatsappNumber={settings.whatsappNumber}
          settings={settings}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">{renderContent()}</main>

      {/* Customer Footer (Hidden in Admin Dashboard and Product Sales Landing Page) */}
      {showStoreHeaderFooter && (
        <Footer
          categories={categories}
          onNavigate={handleNavigate}
          whatsappNumber={settings.whatsappNumber}
          supportEmail={settings.supportEmail}
        />
      )}

      {/* Slide-in Shopping Cart Drawer */}
      <CartDrawer
        onNavigate={handleNavigate}
        whatsappNumber={settings.whatsappNumber}
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
      />

      {/* Floating WhatsApp Support Button (Customer facing) */}
      {showStoreHeaderFooter && (
        <WhatsAppButton
          phone={settings.whatsappNumber}
          variant="floating"
        />
      )}

      {/* Fixed Bottom Mobile Navigation Bar */}
      {showStoreHeaderFooter && (
        <MobileBottomBar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenSearch={() => handleNavigate('shop')}
        />
      )}

      {/* Cart Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-6 z-50 bg-[#222222] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
          <button
            onClick={() => {
              clearToast();
              handleNavigate('cart');
            }}
            className="text-[#F5A623] font-bold hover:underline cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
