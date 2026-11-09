import React, { useState, useEffect } from 'react';
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
import { initPixels, trackPageView } from './services/pixelService';

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
      const [fetchedProducts, fetchedCategories, fetchedSettings] = await Promise.all([
        getProducts(!isAdmin),
        getCategories(),
        getStoreSettings(),
      ]);

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setSettings(fetchedSettings);

      if (fetchedSettings?.pixels) {
        initPixels(fetchedSettings.pixels);
      }

      if (isAdmin) {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    trackPageView('Home', '/');
  }, [isAdmin]);

  // Check URL hash/parameters for direct dedicated link to admin portal (#admin, #dashboard, ?admin=true)
  useEffect(() => {
    const checkAdminUrl = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      if (
        hash === '#admin' ||
        hash === '#dashboard' ||
        hash === '#admin-login' ||
        hash === '#admin-dashboard' ||
        search.includes('admin') ||
        pathname.endsWith('/admin')
      ) {
        setCurrentRoute(isAdmin ? 'admin-dashboard' : 'admin-login');
      }
    };

    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);
    return () => window.removeEventListener('hashchange', checkAdminUrl);
  }, [isAdmin]);

  // Navigate handler
  const handleNavigate = (page: string, params: Record<string, any> = {}) => {
    setCurrentRoute(page);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Keep URL hash in sync for private dashboard link
    if (page === 'admin-dashboard' || page === 'admin-login') {
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else {
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    trackPageView(page.charAt(0).toUpperCase() + page.slice(1), `/${page}`);
  };

  // Find active product for product detail route
  const activeProduct =
    currentRoute === 'product'
      ? products.find((p) => p.slug === routeParams.slug || p.id === routeParams.id) || products[0]
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
            <div className="py-20 text-center">
              <p className="text-gray-500 text-sm">Product not found.</p>
              <button
                onClick={() => handleNavigate('shop')}
                className="mt-4 px-4 py-2 bg-[#F5A623] text-black font-bold rounded-xl text-xs"
              >
                Return to Shop
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Customer Header (Hidden in Admin Dashboard view) */}
      {!isAdminView && (
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

      {/* Customer Footer (Hidden in Admin Dashboard view) */}
      {!isAdminView && (
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
      {!isAdminView && (
        <WhatsAppButton
          phone={settings.whatsappNumber}
          variant="floating"
        />
      )}

      {/* Fixed Bottom Mobile Navigation Bar (Section 14 & Reference Screenshot) */}
      {!isAdminView && (
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
            className="text-[#F5A623] font-bold hover:underline"
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
