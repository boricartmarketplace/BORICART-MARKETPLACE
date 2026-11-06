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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product, Category, Order, OrderStatus, PaymentStatus, StoreSettings } from '../../types';
import {
  formatNaira,
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  updateOrderStatus,
  updateStoreSettings,
  seedInitialDatabase,
} from '../../firebase/services';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { OrderDetailsModal } from './OrderDetailsModal';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  onRefreshData: () => Promise<void>;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  settings,
  onRefreshData,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'settings'>('overview');

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

  // Settings form state
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.deliveryFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(settings.freeDeliveryThreshold);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sync settings state when prop updates
  useEffect(() => {
    setWhatsappNumber(settings.whatsappNumber);
    setDeliveryFee(settings.deliveryFee);
    setFreeDeliveryThreshold(settings.freeDeliveryThreshold);
    setSupportEmail(settings.supportEmail);
    setSupportPhone(settings.supportPhone);
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

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings({
      whatsappNumber,
      deliveryFee: Number(deliveryFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      supportEmail,
      supportPhone,
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

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      {/* Admin Top Navigation */}
      <div className="bg-[#1F1F1F] text-white border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center text-black font-black text-base">
                B
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-white">
                  BORICART <span className="text-[#F5A623]">ADMIN</span>
                </span>
                <span className="text-[10px] text-gray-400 block -mt-1">
                  Cloud Management Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>View Storefront</span>
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
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Store Settings
          </button>
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
                  <h3 className="font-extrabold text-base text-[#333333]">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#F5A623] hover:underline"
                  >
                    View All Orders →
                  </button>
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
                  Store Administration
                </h3>

                <div className="space-y-2.5">
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

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold p-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span>Configure WhatsApp & Delivery Fees</span>
                  </button>

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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Action Bar */}
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
            {/* Filter Bar */}
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

        {/* TAB 5: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-[#333333]">Store Configuration</h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage WhatsApp business number, delivery fee calculation, and customer support channels.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Store settings saved successfully to Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
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
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  All customer inquiry and order tracking buttons route to this number.
                </span>
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
                </div>
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

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold py-3 px-6 rounded-xl text-xs shadow-xs transition-all"
                >
                  Save Store Settings
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
