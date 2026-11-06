import React, { useState } from 'react';
import {
  X,
  Phone,
  Printer,
  ShieldCheck,
  Truck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatNaira } from '../../firebase/services';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleSaveStatus = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, currentStatus, currentPaymentStatus);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp customer status update link
  const customerWhatsAppMessage = `Hello ${order.customerName}! 👋 This is Boricart Customer Support.\n\nRegarding your order *#${order.orderNumber}* (${formatNaira(order.totalAmount)}):\nYour order status is currently: *${currentStatus.toUpperCase().replace(/_/g, ' ')}*.\n\nPayment Method: Cash on Delivery.\nIf you have any questions, feel free to reply directly to this message. Thank you!`;
  const cleanPhone = order.phone.replace(/[^0-9]/g, '');
  const customerWhatsAppUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(customerWhatsAppMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#F5A623] tracking-wider">
                Order Details & Fulfillment
              </span>
              <h2 className="text-xl font-black text-[#333333]">{order.orderNumber}</h2>
              <span className="text-xs text-gray-400">
                Created: {new Date(order.createdAt).toLocaleString('en-GB')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
                title="Print Invoice"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Status Management Bar */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Update Order & Payment Status
                </span>
                {updateSuccess && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Status Updated!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fulfillment Status</label>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                    className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                  >
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

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Payment Status (COD)
                  </label>
                  <select
                    value={currentPaymentStatus}
                    onChange={(e) => setCurrentPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="unpaid">Unpaid (Cash/POS Due on Arrival)</option>
                    <option value="paid">Paid (Payment Received by Rider)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleSaveStatus}
                  disabled={isUpdating}
                  className="w-full sm:w-auto bg-[#F5A623] hover:bg-[#D98200] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  {isUpdating ? 'Saving...' : 'Apply Status Change'}
                </button>

                <a
                  href={customerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Notify Customer via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/70 p-5 rounded-2xl border border-gray-100 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-400 uppercase tracking-wider">Customer</h4>
                <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                <p className="text-gray-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span>{order.phone}</span>
                </p>
                {order.email && <p className="text-gray-600">{order.email}</p>}
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-400 uppercase tracking-wider">Delivery Destination</h4>
                <p className="text-gray-900 font-semibold">{order.deliveryAddress}</p>
                <p className="text-gray-700">
                  {order.city}, {order.state} State
                </p>
                {order.notes && (
                  <p className="text-amber-800 bg-amber-100/60 p-2 rounded-lg mt-1">
                    <strong>Note:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h4 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-wider">
                Order Items ({order.items.length})
              </h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{item.productName}</p>
                        <p className="text-gray-400">
                          Qty: {item.quantity} × {formatNaira(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Sales Channel</span>
                <span className="font-bold uppercase text-gray-800">
                  {order.channel === 'offline' ? (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px]">
                      Walk-in / Offline POS {order.cashierName ? `(${order.cashierName})` : ''}
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
                      Online Storefront
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-800">
                  {order.deliveryFee === 0 ? 'FREE' : formatNaira(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100 items-baseline">
                <span className="font-black text-gray-900">Total Collected Amount</span>
                <span className="text-xl font-black text-[#F5A623]">
                  {formatNaira(order.totalAmount)}
                </span>
              </div>

              {/* Profit & Unit Economics breakdown if available */}
              {order.netProfit !== undefined && (
                <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex justify-between text-[11px] text-emerald-900">
                    <span>Total Cost of Goods (COGS):</span>
                    <span className="font-bold text-gray-800">{formatNaira(order.costAmount || 0)}</span>
                  </div>
                  {(order.adSpendAmount || 0) > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-900">
                      <span>Attributed Marketing Ad Spend:</span>
                      <span className="font-bold text-gray-800">{formatNaira(order.adSpendAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-emerald-800 pt-1 border-t border-emerald-200/80">
                    <span>Order Net Profit:</span>
                    <span>{formatNaira(order.netProfit)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
