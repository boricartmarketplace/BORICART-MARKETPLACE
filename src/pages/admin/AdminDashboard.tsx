import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Phone,
  LogOut,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Filter,
  Upload,
  Image as ImageIcon,
  Layout,
  RefreshCw,
  Users,
  FileText,
  ShieldCheck,
  Truck,
  MessageSquare,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category, Order, OrderStatus, PaymentStatus, StoreSettings, AdminRole, PixelSettings } from '../../types';
import {
  formatNaira,
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  updateOrderStatus,
  updateStoreSettings,
  seedInitialDatabase,
  uploadProductImage,
} from '../../firebase/services';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { StaffManagementTab } from './StaffManagementTab';
import { PagesCmsTab } from './PagesCmsTab';
import { PixelSettingsCard } from './PixelSettingsCard';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  onRefreshData: () => Promise<void>;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'pages-cms' | 'staff' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  settings,
  onRefreshData,
  onNavigate,
}) => {
  const { user, logout, adminRole, staffUser, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Role permissions:
  // - overall_admin: all tabs
  // - store_keeper: overview, products, categories
  // - order_dispatcher: overview, orders
  const allowedTabs = useMemo(() => {
    if (adminRole === 'store_keeper') {
      return ['overview', 'products', 'categories'] as TabType[];
    }
    if (adminRole === 'order_dispatcher') {
      return ['overview', 'orders'] as TabType[];
    }
    return ['overview', 'products', 'categories', 'orders', 'pages-cms', 'staff', 'settings'] as TabType[];
  }, [adminRole]);

  // Safety fallback if active tab not allowed
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || 'overview');
    }
  }, [allowedTabs, activeTab]);

  // Product modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productFilterStatus, setProductFilterStatus] = useState<string>('all');

  // Category modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Order modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Settings form state (Delivery Details & Support)
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.deliveryFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(settings.freeDeliveryThreshold);
  const [lagosDeliveryFee, setLagosDeliveryFee] = useState<number>(settings.lagosDeliveryFee ?? 2000);
  const [nationwideDeliveryFee, setNationwideDeliveryFee] = useState<number>(settings.nationwideDeliveryFee ?? 3500);
  const [deliveryEstimatedDays, setDeliveryEstimatedDays] = useState<string>(
    settings.deliveryEstimatedDays || '1–2 Days Lagos, 2–4 Days Nationwide'
  );
  const [officeAddress, setOfficeAddress] = useState<string>(
    settings.officeAddress || '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria'
  );
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);

  // Announcement Bar Messages
  const [announcements, setAnnouncements] = useState<string[]>(
    settings.announcementMessages || [
      'Everyday Solutions. Better Living.',
      'Shop Smart. Save More.',
      'Convenient Shopping Across Nigeria.',
    ]
  );
  const [newAnnouncementInput, setNewAnnouncementInput] = useState('');

  // Hero Section Customizer state
  const [heroImage, setHeroImage] = useState<string>(
    settings.heroImage || '/assets/aistudio/image_11326346.png'
  );
  const [heroTagline, setHeroTagline] = useState<string>(
    settings.heroTagline || 'Welcome to Boricart'
  );
  const [heroHeadline, setHeroHeadline] = useState<string>(
    settings.heroHeadline || 'Everyday Solutions.'
  );
  const [heroSubhead, setHeroSubhead] = useState<string>(
    settings.heroSubhead || 'Better Living.'
  );
  const [heroDescription, setHeroDescription] = useState<string>(
    settings.heroDescription ||
      'Discover practical products designed to make everyday life easier, smarter and more convenient.'
  );
  const [heroButtonText, setHeroButtonText] = useState<string>(
    settings.heroButtonText || 'Shop Now'
  );
  const [isUploadingHero, setIsUploadingHero] = useState<boolean>(false);

  // Marketing & Tracking Pixels state
  const [pixels, setPixels] = useState<PixelSettings>(
    settings.pixels || {
      facebookPixelId: '',
      facebookPixelEnabled: true,
      googleTagId: '',
      googleTagEnabled: true,
      tiktokPixelId: '',
      tiktokPixelEnabled: true,
      pinterestTagId: '',
      pinterestTagEnabled: true,
      testMode: false,
    }
  );

  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sync settings state when prop updates
  useEffect(() => {
    setWhatsappNumber(settings.whatsappNumber);
    setDeliveryFee(settings.deliveryFee);
    setFreeDeliveryThreshold(settings.freeDeliveryThreshold);
    setLagosDeliveryFee(settings.lagosDeliveryFee ?? 2000);
    setNationwideDeliveryFee(settings.nationwideDeliveryFee ?? 3500);
    setDeliveryEstimatedDays(settings.deliveryEstimatedDays || '1–2 Days Lagos, 2–4 Days Nationwide');
    setOfficeAddress(settings.officeAddress || '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria');
    setSupportEmail(settings.supportEmail);
    setSupportPhone(settings.supportPhone);
    if (settings.announcementMessages && settings.announcementMessages.length > 0) {
      setAnnouncements(settings.announcementMessages);
    }
    setHeroImage(settings.heroImage || '/assets/aistudio/image_11326346.png');
    setHeroTagline(settings.heroTagline || 'Welcome to Boricart');
    setHeroHeadline(settings.heroHeadline || 'Everyday Solutions.');
    setHeroSubhead(settings.heroSubhead || 'Better Living.');
    setHeroDescription(
      settings.heroDescription ||
        'Discover practical products designed to make everyday life easier, smarter and more convenient.'
    );
    setHeroButtonText(settings.heroButtonText || 'Shop Now');
    if (settings.pixels) {
      setPixels(settings.pixels);
    }
  }, [settings]);

  // Analytics Metrics
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;
  const lowStockProducts = products.filter((p) => p.stockStatus === 'low_stock' || p.stockQuantity <= 5).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productFilterStatus === 'published' && p.status !== 'published') return false;
      if (productFilterStatus === 'draft' && p.status !== 'draft') return false;
      if (productFilterStatus === 'low_stock' && p.stockQuantity > 5) return false;

      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productFilterStatus, productSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Handle Product Save
  const handleSaveProduct = async (productData: Partial<Product> & { name: string }) => {
    await saveProduct(productData);
    await onRefreshData();
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await deleteProduct(id);
      await onRefreshData();
    }
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    await saveProduct({
      ...product,
      status: newStatus,
    });
    await onRefreshData();
  };

  // Handle Category Save
  const handleSaveCategory = async (catData: Partial<Category> & { name: string }) => {
    await saveCategory(catData);
    await onRefreshData();
  };

  // Handle Category Delete
  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      await deleteCategory(id);
      await onRefreshData();
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => {
    await updateOrderStatus(orderId, status, paymentStatus);
    await onRefreshData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
      });
    }
  };

  // Handle Hero Image File Upload
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingHero(true);
      const url = await uploadProductImage(file);
      setHeroImage(url);
    } catch (err) {
      console.error('Error uploading hero image:', err);
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Handle Add Announcement
  const handleAddAnnouncement = () => {
    if (!newAnnouncementInput.trim()) return;
    setAnnouncements((prev) => [...prev, newAnnouncementInput.trim()]);
    setNewAnnouncementInput('');
  };

  // Handle Remove Announcement
  const handleRemoveAnnouncement = (index: number) => {
    setAnnouncements((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Settings Save (Delivery details, hero, support, announcements)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings({
      whatsappNumber,
      deliveryFee: Number(deliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      lagosDeliveryFee: Number(lagosDeliveryFee),
      nationwideDeliveryFee: Number(nationwideDeliveryFee),
      deliveryEstimatedDays,
      officeAddress,
      announcementMessages: announcements,
      supportEmail,
      supportPhone,
      heroImage,
      heroTagline,
      heroHeadline,
      heroSubhead,
      heroDescription,
      heroButtonText,
      pixels,
    });
    await onRefreshData();
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Handle Database Re-seed
  const handleReseed = async () => {
    if (
      window.confirm(
        'Reload default catalog data? This ensures standard categories and best-selling products exist in Firestore.'
      )
    ) {
      setIsSeeding(true);
      await seedInitialDatabase(true);
      await onRefreshData();
      setIsSeeding(false);
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'overall_admin':
        return (
          <span className="bg-[#F5A623]/20 border border-[#F5A623] text-[#F5A623] text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Overall Super Admin</span>
          </span>
        );
      case 'store_keeper':
        return (
          <span className="bg-blue-900/60 border border-blue-500 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>Store Keeper</span>
          </span>
        );
      case 'order_dispatcher':
        return (
          <span className="bg-purple-900/60 border border-purple-500 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Order Dispatcher</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      {/* Admin Top Navigation */}
      <div className="bg-[#1F1F1F] text-white border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="bg-white px-3 py-1.5 rounded-xl flex items-center shadow-xs">
                <img
                  src="/assets/aistudio/boricart_logo.png"
                  alt="BORICART"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs tracking-tight text-white uppercase block">
                    Admin Portal
                  </span>
                  {getRoleBadge(adminRole)}
                </div>
                <span className="text-[10px] text-gray-400 block -mt-0.5">
                  {staffUser?.name || user?.displayName || user?.email || 'Authenticated Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Switcher for Admin previewing */}
              <div className="hidden md:flex items-center gap-1.5 bg-gray-800/80 px-2 py-1 rounded-xl border border-gray-700">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Role:</span>
                <select
                  value={adminRole}
                  onChange={(e) => switchRole(e.target.value as AdminRole)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                  title="Switch current view role to test access privileges"
                >
                  <option value="overall_admin" className="bg-gray-900 text-white">Overall Admin (All)</option>
                  <option value="store_keeper" className="bg-gray-900 text-white">Store Keeper (Products)</option>
                  <option value="order_dispatcher" className="bg-gray-900 text-white">Order Dispatcher (Orders)</option>
                </select>
              </div>

              <button
                onClick={() => onNavigate('home')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={async () => {
                  await logout();
                  onNavigate('home');
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Sign out of Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 border-t border-gray-800/80 overflow-x-auto">
          {allowedTabs.includes('overview') && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Overview
            </button>
          )}

          {allowedTabs.includes('products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'products'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Products</span>
              <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">{totalProducts}</span>
            </button>
          )}

          {allowedTabs.includes('categories') && (
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'categories'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Categories</span>
              <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">{categories.length}</span>
            </button>
          )}

          {allowedTabs.includes('orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Orders</span>
              {pendingOrders > 0 && (
                <span className="text-[10px] bg-[#F5A623] text-black font-extrabold px-1.5 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </button>
          )}

          {allowedTabs.includes('pages-cms') && (
            <button
              onClick={() => setActiveTab('pages-cms')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'pages-cms'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Pages CMS</span>
            </button>
          )}

          {allowedTabs.includes('staff') && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Staff & Privileges</span>
            </button>
          )}

          {allowedTabs.includes('settings') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Store & Delivery Settings
            </button>
          )}
        </div>
      </div>

      {/* Main Tab View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Total Products
                  </span>
                  <div className="text-2xl font-black text-[#333333] mt-1">{totalProducts}</div>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {publishedProducts} Published • {draftProducts} Drafts
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Low Stock Alerts
                  </span>
                  <div className="text-2xl font-black text-[#333333] mt-1">{lowStockProducts}</div>
                  <span className="text-xs text-amber-700 font-semibold">
                    Requires restocking soon
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="text-2xl font-black text-[#333333] mt-1">{totalOrders}</div>
                  <span className="text-xs text-[#F5A623] font-semibold">
                    {pendingOrders} Pending Action
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Collected Revenue
                  </span>
                  <div className="text-2xl font-black text-[#333333] mt-1">
                    {formatNaira(totalRevenue)}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">
                    From confirmed deliveries
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders List */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-base text-[#333333]">Recent Customer Orders</h3>
                  {allowedTabs.includes('orders') && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#F5A623] hover:underline"
                    >
                      View All Orders →
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    No orders have been submitted yet. Orders placed on the storefront will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsOrderModalOpen(true);
                        }}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/70 p-2 rounded-xl cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#333333]">{ord.orderNumber}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {ord.customerName} • {ord.city}, {ord.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-[#333333]">
                            {formatNaira(ord.totalAmount)}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#333333] pb-3 border-b border-gray-100">
                  Operational Actions
                </h3>

                <div className="space-y-2.5">
                  {allowedTabs.includes('products') && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductModalOpen(true);
                      }}
                      className="w-full bg-[#F5A623] hover:bg-[#D98200] text-white font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  )}

                  {allowedTabs.includes('categories') && (
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setIsCategoryModalOpen(true);
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Category</span>
                    </button>
                  )}

                  {allowedTabs.includes('pages-cms') && (
                    <button
                      onClick={() => setActiveTab('pages-cms')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span>Edit Website Pages & FAQs</span>
                    </button>
                  )}

                  {allowedTabs.includes('staff') && (
                    <button
                      onClick={() => setActiveTab('staff')}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#F5A623]" />
                      <span>Manage Staff & Access Privileges</span>
                    </button>
                  )}

                  {allowedTabs.includes('settings') && (
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span>Delivery Fees & WhatsApp Config</span>
                    </button>
                  )}

                  {adminRole === 'overall_admin' && (
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={handleReseed}
                        disabled={isSeeding}
                        className="w-full text-xs font-semibold text-gray-500 hover:text-[#F5A623] flex items-center justify-center gap-1.5 py-1"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                        <span>{isSeeding ? 'Seeding Catalog...' : 'Sync Standard Catalog'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>

                <select
                  value={productFilterStatus}
                  onChange={(e) => setProductFilterStatus(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623] font-semibold"
                >
                  <option value="all">All Products</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                  <option value="low_stock">Low Stock (≤ 5)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-4">SKU</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Price (NGN)</th>
                      <th className="py-4 px-4">Stock</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          No products found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.mainImage}
                                alt={prod.name}
                                className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-gray-900 line-clamp-1 max-w-xs">
                                  {prod.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {prod.isFeatured && (
                                    <span className="bg-amber-100 text-[#D98200] text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      Featured
                                    </span>
                                  )}
                                  {prod.isBestSeller && (
                                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                      Best Seller
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-gray-500">{prod.sku}</td>

                          <td className="py-3 px-4 text-gray-600 font-medium">{prod.categoryName}</td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block">
                              {formatNaira(prod.promotionalPrice || prod.regularPrice)}
                            </span>
                            {prod.promotionalPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatNaira(prod.regularPrice)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stockQuantity <= 0
                                  ? 'bg-red-100 text-red-700'
                                  : prod.stockQuantity <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {prod.stockQuantity} in stock
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleTogglePublish(prod)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
                                prod.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {prod.status === 'published' ? (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-[#F5A623] hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-[#333333]">Store Categories</h3>
                <p className="text-xs text-gray-500">
                  Organize your Boricart solutions into intuitive customer collections.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-2/1 bg-gray-100 relative">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Sort: #{cat.sortOrder || 1}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-base text-[#333333]">{cat.name}</h4>
                          <span className="text-xs font-bold text-[#F5A623] bg-amber-50 px-2 py-0.5 rounded-full">
                            {count} Products
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {cat.description || 'No description provided.'}
                        </p>
                        <p className="text-[11px] font-mono text-gray-400 mt-2">Slug: {cat.slug}</p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-[#F5A623] hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search order #, customer name, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Filter:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623] font-semibold"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed_delivery">Failed Delivery</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-4">Customer</th>
                      <th className="py-4 px-4">Destination</th>
                      <th className="py-4 px-4">Amount Due</th>
                      <th className="py-4 px-4">Payment</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          No orders found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsOrderModalOpen(true);
                          }}
                          className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-6">
                            <span className="font-black text-gray-900 block">{ord.orderNumber}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900">{ord.customerName}</p>
                            <p className="text-gray-400 font-mono text-[11px]">{ord.phone}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-gray-800 font-medium">{ord.city}</p>
                            <p className="text-gray-400 text-[10px]">{ord.state} State</p>
                          </td>

                          <td className="py-3.5 px-4 font-black text-gray-900">
                            {formatNaira(ord.totalAmount)}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'cancelled' || ord.status === 'failed_delivery'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ord.status.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(ord);
                                setIsOrderModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#F5A623] hover:bg-[#D98200] text-white text-xs font-bold rounded-xl shadow-2xs"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAGES CMS (EDIT ALL PAGES FROM BACKEND) */}
        {activeTab === 'pages-cms' && (
          <PagesCmsTab settings={settings} onRefreshData={onRefreshData} />
        )}

        {/* TAB 6: STAFF MEMBERS & ACCESS PRIVILEGES */}
        {activeTab === 'staff' && (
          <StaffManagementTab currentAdminEmail={user?.email || undefined} />
        )}

        {/* TAB 7: STORE SETTINGS, DELIVERY FEES & HERO CUSTOMIZATION */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h3 className="font-black text-2xl text-[#333333]">Store, Delivery & Hero Configuration</h3>
              <p className="text-xs text-gray-500 mt-1">
                Customize your homepage hero banner image and messaging, WhatsApp click-to-chat, delivery fees, and contact info.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Store & Hero settings successfully saved to Cloud Firestore! Homepage will update immediately.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* CARD 1: HERO SECTION CUSTOMIZATION */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[#333333]">Hero Banner Customization</h4>
                      <p className="text-xs text-gray-500">
                        Update the hero image, headlines, and call-to-action button on the homepage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Live Banner Preview
                  </label>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF8EE] via-[#FFFBF6] to-[#FFF4E0] border border-amber-100/80 p-6 sm:p-8 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-7 space-y-3">
                        <span className="inline-block px-3 py-1 bg-[#F5A623]/15 text-[#D98200] font-bold text-[10px] sm:text-xs rounded-full">
                          {heroTagline || 'Welcome to Boricart'}
                        </span>
                        <h2 className="text-xl sm:text-3xl font-black text-[#333333] tracking-tight leading-tight">
                          {heroHeadline || 'Everyday Solutions.'}
                          <span className="block text-[#F5A623]">{heroSubhead || 'Better Living.'}</span>
                        </h2>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {heroDescription || 'Discover practical products designed to make everyday life easier, smarter and more convenient.'}
                        </p>
                        <div>
                          <button
                            type="button"
                            className="bg-[#F5A623] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs pointer-events-none"
                          >
                            {heroButtonText || 'Shop Now'} →
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-5 flex justify-center">
                        <div className="relative w-40 sm:w-48 aspect-[4/5] rounded-2xl overflow-hidden bg-amber-100/50 shadow-md border-2 border-white">
                          <img
                            src={heroImage || '/assets/aistudio/image_11326346.png'}
                            alt="Hero Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Image Management */}
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Hero Section Image
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-24 h-28 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 shrink-0 relative group">
                      <img
                        src={heroImage}
                        alt="Hero"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer bg-white border border-gray-200 hover:border-[#F5A623] hover:text-[#F5A623] text-gray-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xs transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>{isUploadingHero ? 'Uploading image...' : 'Upload New Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHero}
                            onChange={handleHeroFileUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setHeroImage('/assets/aistudio/image_11326346.png')}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span>Use Boy Portrait (Provided)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHeroImage('/assets/aistudio/image_58c04f55.png')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span>Use Couple Lifestyle</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Or paste an image URL or path (/assets/...)"
                          value={heroImage}
                          onChange={(e) => setHeroImage(e.target.value)}
                          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Supports local asset paths (e.g. <code>/assets/aistudio/image_11326346.png</code>) or any web image URL.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Text Customization Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Welcome Tagline / Pill
                    </label>
                    <input
                      type="text"
                      value={heroTagline}
                      onChange={(e) => setHeroTagline(e.target.value)}
                      placeholder="Welcome to Boricart"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Call to Action Button Text
                    </label>
                    <input
                      type="text"
                      value={heroButtonText}
                      onChange={(e) => setHeroButtonText(e.target.value)}
                      placeholder="Shop Now"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Headline Line 1
                    </label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="Everyday Solutions."
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Headline Line 2 (Orange Accent)
                    </label>
                    <input
                      type="text"
                      value={heroSubhead}
                      onChange={(e) => setHeroSubhead(e.target.value)}
                      placeholder="Better Living."
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Supporting Description
                    </label>
                    <textarea
                      rows={2}
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      placeholder="Discover practical products designed to make everyday life easier, smarter and more convenient."
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: DELIVERY DETAILS & PRICING */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-[#333333]">Delivery Details & Shipping Pricing</h4>
                    <p className="text-xs text-gray-500">
                      Configure standard, Lagos, and Nationwide delivery pricing, timelines, and free shipping threshold.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Standard Delivery Fee (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Free Delivery Threshold (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Orders equal to or above this amount receive 100% Free Shipping.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Lagos State Express Delivery Fee (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={lagosDeliveryFee}
                      onChange={(e) => setLagosDeliveryFee(Number(e.target.value))}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nationwide Interstate Shipping Fee (NGN)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={nationwideDeliveryFee}
                      onChange={(e) => setNationwideDeliveryFee(Number(e.target.value))}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Estimated Delivery Timeline
                    </label>
                    <input
                      type="text"
                      value={deliveryEstimatedDays}
                      onChange={(e) => setDeliveryEstimatedDays(e.target.value)}
                      placeholder="1–2 Days Lagos, 2–4 Days Nationwide"
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: ANNOUNCEMENT BAR MESSAGES */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-[#333333]">Announcement Bar Messages</h4>
                    <p className="text-xs text-gray-500">
                      Manage the rotating banner alerts at the very top of the customer storefront.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="New announcement (e.g. Free Delivery on orders above ₦15,000)"
                      value={newAnnouncementInput}
                      onChange={(e) => setNewAnnouncementInput(e.target.value)}
                      className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAnnouncement}
                      disabled={!newAnnouncementInput.trim()}
                      className="bg-[#333333] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
                    >
                      Add Message
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {announcements.map((msg, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between text-xs text-gray-800"
                      >
                        <span className="font-medium">{msg}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAnnouncement(idx)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 4: WHATSAPP & SUPPORT CHANNELS */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-[#333333]">WhatsApp & Customer Support</h4>
                    <p className="text-xs text-gray-500">
                      Configure customer order routing and support channels.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Boricart WhatsApp Business Number (Click-to-chat)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+2348140008921"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      All customer inquiry and order tracking buttons route directly to this WhatsApp number.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Physical Office / Central Fulfillment Address
                    </label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 5: MARKETING & TRACKING PIXELS (FACEBOOK, GOOGLE, TIKTOK, PINTEREST) */}
              <PixelSettingsCard pixels={pixels} onChange={setPixels} />

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-[#F5A623] hover:bg-[#D98200] text-white font-black py-3.5 px-8 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save All Store & Delivery Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Category Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        order={selectedOrder}
        onClose={() => setIsOrderModalOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
      />
    </div>
  );
};
