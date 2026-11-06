import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  DollarSign,
  Receipt,
  CheckCircle2,
  Printer,
  Share2,
  User,
  Phone,
  Store,
  CreditCard,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { Product, Order, OrderItem } from '../../types';
import { formatNaira, createOrder, saveProduct } from '../../firebase/services';
import confetti from 'canvas-confetti';

interface OfflinePosModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOrderCreated: () => Promise<void>;
  cashierName?: string;
}

export const OfflinePosModal: React.FC<OfflinePosModalProps> = ({
  isOpen,
  onClose,
  products,
  onOrderCreated,
  cashierName = 'Boricart Storekeeper',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<{
      product: Product;
      quantity: number;
      price: number;
      costPrice: number;
      adSpend: number;
    }>
  >([]);

  // Customer & Payment state
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [salesChannel, setSalesChannel] = useState<'walk_in' | 'offline_pos' | 'direct_whatsapp' | 'exhibition'>('walk_in');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos_terminal' | 'bank_transfer' | 'split'>('cash');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Filter products for POS quick search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Add product to POS cart
  const handleAddItem = (product: Product) => {
    setSelectedItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      const defaultPrice = product.offlinePrice || product.promotionalPrice || product.regularPrice;
      const cogs = product.costPrice || 0;
      const ads = product.adSpend || 0;

      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          price: defaultPrice,
          costPrice: cogs,
          adSpend: ads,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, price: Math.max(0, newPrice) } : i))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Calculations
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCogs = selectedItems.reduce((sum, i) => sum + i.costPrice * i.quantity, 0);
  const totalAds = selectedItems.reduce((sum, i) => sum + i.adSpend * i.quantity, 0);
  const grossProfit = subtotal - totalCogs;
  const netProfit = subtotal - totalCogs - totalAds;
  const profitMarginPercent = subtotal > 0 ? Math.round((netProfit / subtotal) * 100) : 0;

  // Process Offline Sale
  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    try {
      setIsSubmitting(true);
      const orderNumber = `BC-POS-${Date.now().toString().slice(-6)}`;
      const orderItems: OrderItem[] = selectedItems.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: i.product.mainImage,
        price: i.price,
        costPrice: i.costPrice,
        adSpend: i.adSpend,
        quantity: i.quantity,
        sku: i.product.sku,
      }));

      // Create Order
      const newOrder = await createOrder({
        customerName: customerName.trim() || 'Walk-in Customer',
        phone: customerPhone.trim() || '+234-Walk-In',
        state: 'Lagos',
        city: salesChannel === 'walk_in' ? 'Store Counter' : salesChannel,
        deliveryAddress: 'Walk-in Store Pickup / Direct Sale',
        items: orderItems,
        subtotal,
        deliveryFee: 0,
        totalAmount: subtotal,
        costAmount: totalCogs,
        adSpendAmount: totalAds,
        netProfit,
        paymentMethod,
        paymentStatus: 'paid',
        status: 'delivered',
        channel: 'offline',
        salesChannel,
        cashierName,
        notes: notes.trim() || 'Direct In-store Walk-in Sale',
      });

      // Deduct inventory stock for sold items
      for (const item of selectedItems) {
        const remainingStock = Math.max(0, (item.product.stockQuantity || 0) - item.quantity);
        await saveProduct({
          ...item.product,
          stockQuantity: remainingStock,
          stockStatus: remainingStock === 0 ? 'out_of_stock' : remainingStock <= 5 ? 'low_stock' : 'in_stock',
        });
      }

      await onOrderCreated();
      setCompletedOrder(newOrder);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#25D366', '#333333'],
        });
      } catch (err) {
        // ignore
      }
    } catch (err) {
      console.error('Error recording offline sale:', err);
      alert('Failed to record offline sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setNotes('');
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#333333]">Offline POS & Walk-in Sale</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Counter Sales
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Sell products in-store, deduct inventory, and record real-time cost, selling price, and net profit.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          // RECEIPT VIEW
          <div className="py-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-gray-900">Offline Sale Recorded Successfully!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Receipt #{completedOrder.orderNumber} • Inventory stock levels automatically updated.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left space-y-3 font-mono text-xs">
              <div className="text-center pb-3 border-b border-gray-200 font-sans">
                <span className="font-black text-sm text-gray-900 block">BORICART RETAIL STORE</span>
                <span className="text-[11px] text-gray-500">Everyday Solutions. Better Living.</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Receipt #:</span>
                <span className="font-bold text-gray-900">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Customer:</span>
                <span className="font-bold text-gray-900">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Method:</span>
                <span className="font-bold uppercase text-gray-900">{completedOrder.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cashier:</span>
                <span className="font-bold text-gray-900">{completedOrder.cashierName || cashierName}</span>
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-1.5">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="font-bold">{formatNaira(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-300 flex justify-between text-sm font-sans font-black text-gray-900">
                <span>Total Amount Paid:</span>
                <span className="text-[#F5A623]">{formatNaira(completedOrder.totalAmount)}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between text-[11px] text-emerald-700 font-bold">
                <span>Net Profit Recorded:</span>
                <span>{formatNaira(completedOrder.netProfit || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={resetForm}
                className="bg-[#F5A623] hover:bg-[#D98200] text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Record Another Sale</span>
              </button>
            </div>
          </div>
        ) : (
          // POS SALE FORM
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pt-4">
            {/* Left Column: Product Selection & Catalog Search */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search product name, SKU, or category to add to POS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>

              {/* Quick Products Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                {filteredProducts.map((p) => {
                  const defaultPrice = p.offlinePrice || p.promotionalPrice || p.regularPrice;
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOut}
                      onClick={() => handleAddItem(p)}
                      className={`p-2.5 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                        isOut
                          ? 'opacity-40 border-gray-200 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-[#F5A623] hover:shadow-xs bg-white cursor-pointer group'
                      }`}
                    >
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2">
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-800 line-clamp-1 block">
                          {p.name}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-gray-900">
                            {formatNaira(defaultPrice)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              p.stockQuantity <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p.stockQuantity} left
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected POS Items Cart Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-800">
                    Items in Offline Sale ({selectedItems.length})
                  </span>
                  <span className="text-[10px] text-gray-400">Custom prices and quantities allowed</span>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No items selected yet. Click any product above to add to this offline sale.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item.product.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span>Cost: ₦{item.costPrice.toLocaleString()}</span>
                            <span>•</span>
                            <span>Ads: ₦{item.adSpend.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Custom Price input */}
                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdatePrice(item.product.id, Number(e.target.value))
                            }
                            className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:border-[#F5A623]"
                            title="Edit selling price if offering discount"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Customer Details, Payment & Profit Calculation */}
            <form onSubmit={handleCompleteSale} className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer / Business Name"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Customer Phone (Optional for WhatsApp Receipt)
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+234 814..."
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Sales Channel
                    </label>
                    <select
                      value={salesChannel}
                      onChange={(e) => setSalesChannel(e.target.value as any)}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                    >
                      <option value="walk_in">Store Walk-in (Counter)</option>
                      <option value="offline_pos">POS Terminal Sale</option>
                      <option value="direct_whatsapp">WhatsApp Direct Order</option>
                      <option value="exhibition">Exhibition / Trade Fair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                    >
                      <option value="cash">Cash on Hand</option>
                      <option value="pos_terminal">POS Terminal / Card</option>
                      <option value="bank_transfer">Instant Bank Transfer</option>
                      <option value="split">Split Payment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Notes / Cashier Reference
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid in full via Moniepoint POS"
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 focus:bg-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Real-time Profit Calculation Card */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Sales Total:</span>
                    <span className="font-extrabold text-gray-900">{formatNaira(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Cost of Goods (COGS):</span>
                    <span className="font-semibold text-gray-800">- {formatNaira(totalCogs)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Allocated Ads Cost:</span>
                    <span className="font-semibold text-gray-800">- {formatNaira(totalAds)}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between font-black text-sm">
                    <span className="text-[#333333]">Net Profit:</span>
                    <span className={netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {formatNaira(netProfit)} ({profitMarginPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <span className="text-sm font-black text-gray-900">
                  {formatNaira(subtotal)}
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="bg-[#F5A623] hover:bg-[#D98200] text-white font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Sale...</span>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      <span>Confirm & Record Sale</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
