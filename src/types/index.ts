export interface ProductReview {
  id: string;
  author: string;
  location?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedBuyer?: boolean;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

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
  productType?: 'physical' | 'digital' | 'bundle' | 'service';
  costPrice?: number; // Cost of Goods Sold (COGS) in NGN
  adSpend?: number; // Marketing / Ad cost per unit in NGN
  offlinePrice?: number; // In-store / Walk-in selling price in NGN
  status: 'draft' | 'published';
  isFeatured: boolean;
  isBestSeller: boolean;
  showInHeroAds?: boolean; // Display this product in the rotating Hero Ads section
  heroAdBadge?: string; // Optional custom promotional badge (e.g., "HOT DEAL • 25% OFF")
  heroAdHeadline?: string; // Optional custom advertising headline for hero banner
  rating?: number;
  reviewCount?: number;

  // AI-Powered Sales Page & Urgency extensions
  storyHeadline?: string; // e.g., "The Story: How Amaka Saved ₦85,000 in Repairs"
  storyText?: string; // Relatable narrative that connects emotionally with buyers
  urgencyNotice?: string; // Urgency banner e.g., "⚡ Special Flash Sale: 35% OFF Today + Pay on Delivery!"
  enableTimer?: boolean; // Show live countdown urgency timer
  timerHeadline?: string; // e.g., "PROMOTIONAL OFFER EXPIRES IN:"
  timerHours?: number; // Rolling duration in hours (default: 24)
  reviewsList?: ProductReview[]; // Custom reviews editable by admin
  faqsList?: ProductFaq[]; // Product FAQs editable by admin
  guaranteeText?: string; // Warranty/Guaranty copy
  freeDeliveryNote?: string; // Delivery incentive copy

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
  costPrice?: number;
  adSpend?: number;
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
  costAmount?: number; // Total Cost of Goods Sold
  adSpendAmount?: number; // Total Ad Spend allocated
  netProfit?: number; // Revenue - COGS - Ad Spend
  paymentMethod: 'cash_on_delivery' | 'cash' | 'pos_terminal' | 'bank_transfer' | 'split';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  channel?: 'online' | 'offline';
  salesChannel?: 'online_store' | 'walk_in' | 'offline_pos' | 'direct_whatsapp' | 'exhibition';
  cashierName?: string;
  notes?: string;

  // Ad Tracking & Attribution (Facebook, TikTok, Google)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;

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
  id?: string;
  question?: string;
  answer?: string;
  category?: 'orders' | 'delivery' | 'payments' | 'products' | string;
  q?: string;
  a?: string;
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
  contactFaqs?: SiteFaq[];
  faqs?: SiteFaq[];

  // Delivery & Returns
  deliveryHeadline?: string;
  deliveryLagosInfo: string;
  deliveryNationwideInfo: string;
  deliveryCodGuarantee?: string;
  returnsPolicyText: string;
  warrantyPeriodDays?: number;
  warrantyText?: string;
  warrantyPolicyText?: string;

  // Legal Policies
  termsConditionsText?: string;
  termsContent?: string;
  privacyPolicyText?: string;
  privacyContent?: string;
}

export interface PixelSettings {
  facebookPixelId?: string;
  facebookPixelEnabled?: boolean;
  googleTagId?: string; // e.g. G-XXXXXXX or AW-XXXXXXXX
  googleTagEnabled?: boolean;
  tiktokPixelId?: string;
  tiktokPixelEnabled?: boolean;
  pinterestTagId?: string;
  pinterestTagEnabled?: boolean;
  testMode?: boolean;
}

export interface HeroAdSlide {
  id: string;
  productId?: string;
  badge?: string;
  headline: string;
  subhead?: string;
  description: string;
  buttonText?: string;
  image: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  backgroundColor?: string;
  isActive: boolean;
  sortOrder?: number;
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
  heroAdsSlides?: HeroAdSlide[]; // Custom or product promotional ad slides
  heroSelectedProductIds?: string[]; // IDs of products explicitly selected by admin to rotate in Hero Ads
  heroAutoScrollInterval?: number; // Auto-scroll interval in seconds (default: 5)
  pagesContent?: Partial<SitePagesContent>;
  pixels?: PixelSettings;
  customDomain?: string; // e.g. "https://www.boricart.com.ng"
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

