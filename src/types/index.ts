export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  regularPrice: number;
  promotionalPrice?: number;
  categoryId: string;
  categoryName: string;
  tags: string[];
  mainImage: string;
  images: string[];
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: string;
  usageInstructions: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
  isBestSeller: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  sortOrder: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sku?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed_delivery';

export type PaymentStatus = 'unpaid' | 'paid';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  state: string;
  city: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  updatedAt: string;
}

export interface FilterState {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  searchQuery?: string;
}
