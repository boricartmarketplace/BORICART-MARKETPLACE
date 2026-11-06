import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Phone,
  ShieldCheck,
  ArrowRight,
  Printer,
  MessageCircle,
} from 'lucide-react';
import { Order } from '../types';
import { formatNaira } from '../firebase/services';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

interface OrderConfirmationPageProps {
  order: Order | null;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  whatsappNumber?: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
  whatsappNumber = '+2348140008921',
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">No active order found</h2>
        <p className="text-sm text-gray-500">
          You may have already completed this session or navigated away.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase font-extrabold text-[#F5A623] tracking-widest block">
          Order Received Successfully
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#333333]">
          Thank You, {order.customerName.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          Your Boricart order has been registered. Our dispatch team is preparing your package.
          Remember: <strong>You only pay when you receive and inspect your items!</strong>
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header with Order ID & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Order Number</span>
            <div className="text-2xl font-black text-[#333333] tracking-tight">
              {order.orderNumber}
            </div>
            <span className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
              Status: Pending Dispatch
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
              Payment: Cash on Delivery
            </span>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              title="Print Order Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer & Delivery Address details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">
              Delivery Destination
            </h4>
            <p className="font-bold text-[#333333]">{order.customerName}</p>
            <p className="text-gray-600">{order.deliveryAddress}</p>
            <p className="text-gray-600">
              {order.city}, {order.state} State, Nigeria
            </p>
            {order.notes && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
                <strong>Delivery Note:</strong> {order.notes}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">
              Contact Information
            </h4>
            <p className="text-gray-700">
              <strong>Phone:</strong> {order.phone}
            </p>
            {order.email && (
              <p className="text-gray-700">
                <strong>Email:</strong> {order.email}
              </p>
            )}
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>Our rider will call your phone prior to arrival.</span>
            </p>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="pt-6 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 text-sm mb-4">Ordered Items</h4>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#333333]">{item.productName}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × {formatNaira(item.price)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#333333]">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800">{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Nationwide Delivery Fee</span>
            <span className="font-bold text-gray-800">
              {order.deliveryFee === 0 ? 'FREE' : formatNaira(order.deliveryFee)}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
            <span className="text-base font-black text-[#333333]">Total Amount to Pay on Delivery</span>
            <span className="text-2xl font-black text-[#F5A623]">
              {formatNaira(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* COD Reassurance Box */}
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#D98200] shrink-0 mt-0.5" />
          <div className="text-xs text-gray-700 leading-relaxed">
            <strong>Payment due upon delivery:</strong> Please keep {formatNaira(order.totalAmount)}{' '}
            ready in cash or via mobile transfer / POS when the dispatch rider arrives at your
            doorstep.
          </div>
        </div>
      </div>

      {/* Next Actions & WhatsApp Sync */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <WhatsAppButton
          phone={whatsappNumber}
          order={order}
          label="Track Order via WhatsApp"
          variant="primary"
          className="w-full sm:w-auto text-sm py-3.5 px-6 font-bold"
        />

        <button
          onClick={() => onNavigate('shop')}
          className="w-full sm:w-auto text-sm font-bold text-gray-700 hover:text-[#F5A623] px-6 py-3 rounded-xl border border-gray-200 hover:border-[#F5A623] transition-all flex items-center justify-center gap-1.5"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
