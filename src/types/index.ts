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
  collectionId?: string;
  tags: string[];
  mainImage: string;
  images: string[];
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: string;
  usageInstructions: string;
  headline?: string;
  problem?: string;
  solution?: string;
  benefits?: string[];
  videoUrl?: string;
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
  iconName?: string;
  productCount: number;
  sortOrder: number;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productThumbnails: string[];
  badge?: string;
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
  whatsappNumber?: string;
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

export type AdminRole = 'overall_admin' | 'store_keeper' | 'order_dispatcher';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  phone?: string;
  createdAt: string;
  lastActive?: string;
}

export interface SiteFaq {
  q: string;
  a: string;
}

export interface SitePagesContent {
  // About Page
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStory: string;
  aboutMission: string;
  aboutPromise: string;
  aboutValues: string[];
  aboutImage?: string;

  // Contact Page
  contactHeading: string;
  contactSubheading: string;
  officeAddress: string;
  businessHours: string;
  contactFaqs: SiteFaq[];

  // Delivery & Returns
  deliveryHeadline: string;
  deliveryLagosInfo: string;
  deliveryNationwideInfo: string;
  returnsPolicyText: string;
  warrantyPeriodDays: number;
  warrantyText: string;

  // Legal Policies
  termsConditionsText: string;
  privacyPolicyText: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  officeAddress?: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  lagosDeliveryFee?: number;
  nationwideDeliveryFee?: number;
  deliveryEstimatedDays?: string;
  announcementMessages?: string[];
  heroImage?: string;
  heroTagline?: string;
  heroHeadline?: string;
  heroSubhead?: string;
  heroDescription?: string;
  heroButtonText?: string;
  pagesContent?: Partial<SitePagesContent>;
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

