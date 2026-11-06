import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product, Order, CartItem } from '../../types';
import { formatNaira } from '../../firebase/services';

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  product?: Product;
  order?: Order;
  cartItems?: CartItem[];
  subtotal?: number;
  label?: string;
  variant?: 'floating' | 'primary' | 'outline' | 'compact';
  className?: string;
}

export function generateWhatsAppUrl({
  phone = '+2348140008921',
  message,
  product,
  order,
  cartItems,
  subtotal,
}: {
  phone?: string;
  message?: string;
  product?: Product;
  order?: Order;
  cartItems?: CartItem[];
  subtotal?: number;
}): string {
  // Clean phone number: remove non-digits
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  let text = message;

  if (!text) {
    if (order) {
      text = `Hello Boricart! 👋 I just placed an order:\n\n📦 *Order Number:* ${order.orderNumber}\n👤 *Name:* ${order.customerName}\n💰 *Total:* ${formatNaira(order.totalAmount)} (Cash on Delivery)\n📍 *Delivery:* ${order.city}, ${order.state}\n\nPlease confirm my order shipment details. Thank you!`;
    } else if (product) {
      const price = product.promotionalPrice || product.regularPrice;
      text = `Hello Boricart! 👋 I am interested in:\n\n*${product.name}*\nPrice: ${formatNaira(price)}\nSKU: ${product.sku}\n\nIs this product currently in stock for delivery to my location?`;
    } else if (cartItems && cartItems.length > 0) {
      const itemList = cartItems
        .map((item) => `• ${item.quantity}x ${item.product.name} (${formatNaira(item.product.promotionalPrice || item.product.regularPrice)})`)
        .join('\n');
      text = `Hello Boricart! 👋 I have a question about my cart:\n\n${itemList}\n\n*Estimated Subtotal:* ${formatNaira(subtotal || 0)}\n\nCan I pay Cash on Delivery for this order?`;
    } else {
      text = `Hello Boricart! 👋 I have an inquiry about your products and Cash on Delivery options.`;
    }
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = '+2348140008921',
  message,
  product,
  order,
  cartItems,
  subtotal,
  label = 'Chat on WhatsApp',
  variant = 'primary',
  className = '',
}) => {
  const url = generateWhatsAppUrl({
    phone,
    message,
    product,
    order,
    cartItems,
    subtotal,
  });

  if (variant === 'floating') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Boricart on WhatsApp"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${className}`}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="font-semibold text-sm hidden sm:inline-block">WhatsApp Support</span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm ${className}`}
      >
        <MessageCircle className="w-4 h-4 fill-[#25D366]" />
        <span>{label}</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Inquire on WhatsApp"
        className={`inline-flex items-center justify-center p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors ${className}`}
      >
        <MessageCircle className="w-5 h-5 fill-current" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm hover:shadow text-sm ${className}`}
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span>{label}</span>
    </a>
  );
};
