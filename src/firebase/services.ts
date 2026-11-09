import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Product, Category, Order, OrderStatus, PaymentStatus, StoreSettings, AdminUser, AdminRole } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, DEFAULT_SETTINGS, INITIAL_STAFF, INITIAL_ORDERS } from '../data/initialCatalog';

// Collection references
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';
const ADMINS_COLLECTION = 'admins';

// Local storage keys for instant, resilient offline/online dual persistence
const STORAGE_KEY_PRODUCTS = 'boricart_catalog_products';
const STORAGE_KEY_CATEGORIES = 'boricart_catalog_categories';
const STORAGE_KEY_SETTINGS = 'boricart_store_settings';
const STORAGE_KEY_STAFF = 'boricart_staff_members';
const STORAGE_KEY_ORDERS = 'boricart_customer_orders';

// Cache to prevent duplicate auto-seeding
let isSeedingInProgress = false;

// Format Nigerian Naira currency
export function formatNaira(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

// Generate unique order number
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BC-${dateStr}-${randomSuffix}`;
}

// Generate slug
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

// Strip undefined fields recursively to prevent Firestore errors
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = typeof value === 'object' && value !== null ? stripUndefined(value) : value;
    }
  }
  return clean as T;
}

// LocalStorage helpers
function getLocalCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not cache to ${key}:`, e);
  }
}

// =================== PRODUCTS SERVICES ===================

export async function getProducts(onlyPublished = true): Promise<Product[]> {
  try {
    let q;
    if (onlyPublished) {
      q = query(collection(db, PRODUCTS_COLLECTION), where('status', '==', 'published'));
    } else {
      q = collection(db, PRODUCTS_COLLECTION);
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty && !isSeedingInProgress) {
      // Check local storage cache before seeding
      const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS);
      if (cached && cached.length > 0) {
        return onlyPublished ? cached.filter((p) => p.status === 'published') : cached;
      }

      await seedInitialDatabase();
      return onlyPublished
        ? INITIAL_PRODUCTS.filter((p) => p.status === 'published')
        : INITIAL_PRODUCTS;
    }

    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
    });

    // Update local cache
    if (!onlyPublished) {
      setLocalCache(STORAGE_KEY_PRODUCTS, products);
    }

    return products;
  } catch (error) {
    console.warn('Network notice when loading products from Firestore, using local cache:', error);
    const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || INITIAL_PRODUCTS;
    return onlyPublished ? cached.filter((p) => p.status === 'published') : cached;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) };
    }
    const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || INITIAL_PRODUCTS;
    return cached.find((p) => p.id === id || p.slug === id) || null;
  } catch (error) {
    console.warn('Error fetching product by id, using cache:', error);
    const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || INITIAL_PRODUCTS;
    return cached.find((p) => p.id === id || p.slug === id) || null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) };
    }
    const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || INITIAL_PRODUCTS;
    return cached.find((p) => p.slug === slug || p.id === slug) || null;
  } catch (error) {
    console.warn('Error fetching product by slug, using cache:', error);
    const cached = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || INITIAL_PRODUCTS;
    return cached.find((p) => p.slug === slug || p.id === slug) || null;
  }
}

export async function saveProduct(productData: Partial<Product> & { name: string }): Promise<Product> {
  const id = productData.id || `bc-${Date.now()}`;
  const slug = productData.slug || slugify(productData.name);
  const now = new Date().toISOString();

  const productToSave: Product = {
    id,
    name: productData.name.trim(),
    slug,
    sku: productData.sku || `BC-SKU-${Math.floor(100 + Math.random() * 900)}`,
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    regularPrice: Number(productData.regularPrice) || 0,
    promotionalPrice: productData.promotionalPrice ? Number(productData.promotionalPrice) : undefined,
    costPrice: productData.costPrice !== undefined && productData.costPrice !== null ? Number(productData.costPrice) : 0,
    adSpend: productData.adSpend !== undefined && productData.adSpend !== null ? Number(productData.adSpend) : 0,
    offlinePrice: productData.offlinePrice ? Number(productData.offlinePrice) : undefined,
    productType: productData.productType || 'physical',
    categoryId: productData.categoryId || 'cat-lifestyle',
    categoryName: productData.categoryName || 'Lifestyle',
    tags: productData.tags || [],
    mainImage: productData.mainImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: productData.images && productData.images.length > 0 ? productData.images : [productData.mainImage || ''],
    stockQuantity: Number(productData.stockQuantity) || 0,
    stockStatus: productData.stockStatus || (Number(productData.stockQuantity) > 5 ? 'in_stock' : Number(productData.stockQuantity) > 0 ? 'low_stock' : 'out_of_stock'),
    specifications: productData.specifications || '',
    usageInstructions: productData.usageInstructions || '',
    status: productData.status || 'published',
    isFeatured: Boolean(productData.isFeatured),
    isBestSeller: Boolean(productData.isBestSeller),
    showInHeroAds: Boolean(productData.showInHeroAds),
    heroAdBadge: productData.heroAdBadge || '',
    heroAdHeadline: productData.heroAdHeadline || '',
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
    createdAt: productData.createdAt || now,
    updatedAt: now,
  };

  // 1. Optimistic Local Cache Update
  const cachedProducts = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || [...INITIAL_PRODUCTS];
  const existingIdx = cachedProducts.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    cachedProducts[existingIdx] = productToSave;
  } else {
    cachedProducts.unshift(productToSave);
  }
  setLocalCache(STORAGE_KEY_PRODUCTS, cachedProducts);

  // 2. Persist to Firestore
  try {
    const cleanPayload = stripUndefined(productToSave);
    await setDoc(doc(db, PRODUCTS_COLLECTION, id), cleanPayload);
  } catch (error) {
    console.warn('Firestore write warning (persisted locally):', error);
  }

  return productToSave;
}

export async function deleteProduct(id: string): Promise<void> {
  // Update local cache
  const cachedProducts = getLocalCache<Product[]>(STORAGE_KEY_PRODUCTS) || [...INITIAL_PRODUCTS];
  const updated = cachedProducts.filter((p) => p.id !== id && p.slug !== id);
  setLocalCache(STORAGE_KEY_PRODUCTS, updated);

  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.warn('Firestore delete warning:', error);
  }
}

// =================== CATEGORIES SERVICES ===================

export async function getCategories(): Promise<Category[]> {
  try {
    const q = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(q);

    if (snapshot.empty && !isSeedingInProgress) {
      const cached = getLocalCache<Category[]>(STORAGE_KEY_CATEGORIES);
      if (cached && cached.length > 0) return cached;

      await seedInitialDatabase();
      return INITIAL_CATEGORIES;
    }

    const categories: Category[] = [];
    snapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...(docSnap.data() as Omit<Category, 'id'>) });
    });

    categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    setLocalCache(STORAGE_KEY_CATEGORIES, categories);
    return categories;
  } catch (error) {
    console.warn('Error loading categories from Firestore, using cache:', error);
    return getLocalCache<Category[]>(STORAGE_KEY_CATEGORIES) || INITIAL_CATEGORIES;
  }
}

export async function saveCategory(categoryData: Partial<Category> & { name: string }): Promise<Category> {
  const id = categoryData.id || `cat-${slugify(categoryData.name)}`;
  const slug = categoryData.slug || slugify(categoryData.name);
  const now = new Date().toISOString();

  const categoryToSave: Category = {
    id,
    name: categoryData.name.trim(),
    slug,
    description: categoryData.description || '',
    image: categoryData.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    productCount: categoryData.productCount || 0,
    sortOrder: categoryData.sortOrder || 1,
    createdAt: categoryData.createdAt || now,
  };

  // Update local cache
  const cached = getLocalCache<Category[]>(STORAGE_KEY_CATEGORIES) || [...INITIAL_CATEGORIES];
  const existingIdx = cached.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    cached[existingIdx] = categoryToSave;
  } else {
    cached.push(categoryToSave);
  }
  setLocalCache(STORAGE_KEY_CATEGORIES, cached);

  try {
    const cleanPayload = stripUndefined(categoryToSave);
    await setDoc(doc(db, CATEGORIES_COLLECTION, id), cleanPayload);
  } catch (error) {
    console.warn('Firestore category write notice:', error);
  }

  return categoryToSave;
}

export async function deleteCategory(id: string): Promise<void> {
  const cached = getLocalCache<Category[]>(STORAGE_KEY_CATEGORIES) || [...INITIAL_CATEGORIES];
  setLocalCache(STORAGE_KEY_CATEGORIES, cached.filter((c) => c.id !== id && c.slug !== id));

  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    console.warn('Firestore category delete notice:', error);
  }
}

// =================== ORDERS SERVICES ===================

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'paymentMethod' | 'paymentStatus' | 'status'> & {
    paymentMethod?: Order['paymentMethod'];
    paymentStatus?: PaymentStatus;
    status?: OrderStatus;
  }
): Promise<Order> {
  const id = `order-${Date.now()}`;
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const order: Order = {
    id,
    orderNumber,
    customerName: orderData.customerName,
    phone: orderData.phone,
    email: orderData.email || '',
    state: orderData.state,
    city: orderData.city,
    deliveryAddress: orderData.deliveryAddress,
    items: orderData.items,
    subtotal: orderData.subtotal,
    deliveryFee: orderData.deliveryFee,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
    paymentStatus: orderData.paymentStatus || 'unpaid',
    status: orderData.status || 'pending',
    channel: orderData.channel || 'online',
    salesChannel: orderData.salesChannel || (orderData.channel === 'offline' ? 'offline_pos' : 'online_store'),
    cashierName: orderData.cashierName,
    costAmount: orderData.costAmount,
    adSpendAmount: orderData.adSpendAmount,
    netProfit: orderData.netProfit,
    notes: orderData.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Immediately cache in localStorage so order is NEVER lost and displays instantly
  const cachedOrders = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || [...INITIAL_ORDERS];
  cachedOrders.unshift(order);
  setLocalCache(STORAGE_KEY_ORDERS, cachedOrders);

  // 2. Broadcast order creation event across components
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('boricart:order_created', { detail: order }));
    }
  } catch (e) {
    console.warn('Order event dispatch notice:', e);
  }

  // 3. Persist to Firestore
  try {
    const cleanPayload = stripUndefined(order);
    await setDoc(doc(db, ORDERS_COLLECTION, id), cleanPayload);

    // Update stock counts asynchronously
    for (const item of order.items) {
      try {
        const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stockQuantity || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          const newStatus = newStock === 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock';
          await updateDoc(prodRef, {
            stockQuantity: newStock,
            stockStatus: newStatus,
            updatedAt: now,
          });
        }
      } catch (e) {
        console.warn('Could not update stock for item:', item.productId, e);
      }
    }
  } catch (error) {
    console.warn('Order write warning in Firestore (saved locally):', error);
  }

  return order;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const q = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(q);
    const firestoreOrders: Order[] = [];
    snapshot.forEach((docSnap) => {
      firestoreOrders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
    });

    // Merge Firestore orders with cached orders and INITIAL_ORDERS
    const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
    const orderMap = new Map<string, Order>();

    // Initial / cached orders first
    cached.forEach((o) => {
      if (o.id) orderMap.set(o.id, o);
    });

    // Firestore orders take precedence if updated
    firestoreOrders.forEach((o) => {
      if (o.id) orderMap.set(o.id, o);
    });

    const merged = Array.from(orderMap.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Update local cache
    setLocalCache(STORAGE_KEY_ORDERS, merged);
    return merged;
  } catch (error) {
    console.warn('Error fetching orders from Firestore, using cache:', error);
    const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
    return cached.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) };
    }
    const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
    return cached.find((o) => o.id === id || o.orderNumber === id) || null;
  } catch (error) {
    console.warn('Error getting order by id:', error);
    const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
    return cached.find((o) => o.id === id || o.orderNumber === id) || null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  // Update local cache immediately
  const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
  const target = cached.find((o) => o.id === orderId);
  if (target) {
    target.status = status;
    if (paymentStatus) {
      target.paymentStatus = paymentStatus;
    }
    target.updatedAt = new Date().toISOString();
    setLocalCache(STORAGE_KEY_ORDERS, cached);
  }

  // Update in Firestore
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updatePayload.paymentStatus = paymentStatus;
    }
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.warn('Error updating order status in Firestore:', error);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  // Remove from local cache
  const cached = getLocalCache<Order[]>(STORAGE_KEY_ORDERS) || INITIAL_ORDERS;
  const filtered = cached.filter((o) => o.id !== orderId);
  setLocalCache(STORAGE_KEY_ORDERS, filtered);

  // Delete from Firestore
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    console.warn('Error deleting order in Firestore:', error);
  }
}

// =================== SETTINGS SERVICES ===================

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as StoreSettings;
      const merged = { ...DEFAULT_SETTINGS, ...data };
      setLocalCache(STORAGE_KEY_SETTINGS, merged);
      return merged;
    }
    // Check local cache
    const cached = getLocalCache<StoreSettings>(STORAGE_KEY_SETTINGS);
    if (cached) return cached;

    // Save default settings
    await setDoc(docRef, stripUndefined(DEFAULT_SETTINGS));
    setLocalCache(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Error loading store settings from Firestore, using cache:', error);
    return getLocalCache<StoreSettings>(STORAGE_KEY_SETTINGS) || DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = getLocalCache<StoreSettings>(STORAGE_KEY_SETTINGS) || DEFAULT_SETTINGS;
  const updated: StoreSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately
  setLocalCache(STORAGE_KEY_SETTINGS, updated);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const cleanPayload = stripUndefined(updated);
    await setDoc(docRef, cleanPayload);
  } catch (error) {
    console.warn('Firestore store settings write warning:', error);
  }

  return updated;
}

// =================== IMAGE UPLOADER SERVICE ===================

export async function uploadProductImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If not a valid image file, resolve with placeholder immediately
    if (!file || !file.type.startsWith('image/')) {
      resolve('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    };

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.onload = () => {
        try {
          // Limit to max 720px for rapid rendering and optimal document size (~25-40KB)
          const maxDim = 720;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // White background for transparent images
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Generate lightweight WebP/JPEG data URL (resolves in ~30ms with zero network lag)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(optimizedDataUrl);
        } catch (err) {
          console.warn('Canvas optimization fallback to original dataUrl:', err);
          resolve(dataUrl);
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

// =================== SEED DATABASE ===================

export async function seedInitialDatabase(force = false): Promise<void> {
  if (isSeedingInProgress && !force) return;
  isSeedingInProgress = true;

  try {
    // Cache defaults locally
    setLocalCache(STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
    setLocalCache(STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    setLocalCache(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
    setLocalCache(STORAGE_KEY_STAFF, INITIAL_STAFF);

    // 1. Seed categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), stripUndefined(cat));
    }

    // 2. Seed products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), stripUndefined(prod));
    }

    // 3. Seed settings
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), stripUndefined(DEFAULT_SETTINGS));

    // 4. Seed initial staff & roles
    for (const staff of INITIAL_STAFF) {
      await setDoc(doc(db, ADMINS_COLLECTION, staff.id), stripUndefined(staff));
    }

    console.log('Boricart database seeded with initial catalog and staff.');
  } catch (error) {
    console.warn('Database seeding notice (using local defaults):', error);
  } finally {
    isSeedingInProgress = false;
  }
}

// =================== STAFF & ACCESS PRIVILEGES SERVICES ===================

export async function getStaffMembers(): Promise<AdminUser[]> {
  try {
    const snapshot = await getDocs(collection(db, ADMINS_COLLECTION));
    if (snapshot.empty) {
      const cached = getLocalCache<AdminUser[]>(STORAGE_KEY_STAFF);
      if (cached && cached.length > 0) return cached;

      for (const staff of INITIAL_STAFF) {
        await setDoc(doc(db, ADMINS_COLLECTION, staff.id), stripUndefined(staff));
      }
      setLocalCache(STORAGE_KEY_STAFF, INITIAL_STAFF);
      return INITIAL_STAFF;
    }
    const staffList: AdminUser[] = [];
    snapshot.forEach((docSnap) => {
      staffList.push({ id: docSnap.id, ...(docSnap.data() as Omit<AdminUser, 'id'>) });
    });

    setLocalCache(STORAGE_KEY_STAFF, staffList);
    return staffList;
  } catch (error) {
    console.warn('Error loading staff members, using cache:', error);
    return getLocalCache<AdminUser[]>(STORAGE_KEY_STAFF) || INITIAL_STAFF;
  }
}

export async function saveStaffMember(
  memberData: Partial<AdminUser> & { name: string; email: string; role: AdminRole }
): Promise<AdminUser> {
  const id = memberData.id || `staff-${slugify(memberData.name)}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();
  const staffMember: AdminUser = {
    id,
    name: memberData.name.trim(),
    email: memberData.email.trim().toLowerCase(),
    role: memberData.role,
    status: memberData.status || 'active',
    phone: memberData.phone || '',
    createdAt: memberData.createdAt || now,
    lastActive: memberData.lastActive || now,
  };

  // 1. Update local cache
  const cachedStaff = getLocalCache<AdminUser[]>(STORAGE_KEY_STAFF) || [...INITIAL_STAFF];
  const existingIdx = cachedStaff.findIndex((s) => s.id === id || s.email.toLowerCase() === staffMember.email.toLowerCase());
  if (existingIdx >= 0) {
    cachedStaff[existingIdx] = { ...cachedStaff[existingIdx], ...staffMember };
  } else {
    cachedStaff.push(staffMember);
  }
  setLocalCache(STORAGE_KEY_STAFF, cachedStaff);

  // 2. Persist to Firestore
  try {
    const cleanPayload = stripUndefined(staffMember);
    await setDoc(doc(db, ADMINS_COLLECTION, id), cleanPayload);
  } catch (error) {
    console.warn('Firestore staff write warning:', error);
  }

  return staffMember;
}

export async function deleteStaffMember(id: string): Promise<void> {
  const cachedStaff = getLocalCache<AdminUser[]>(STORAGE_KEY_STAFF) || [...INITIAL_STAFF];
  setLocalCache(STORAGE_KEY_STAFF, cachedStaff.filter((s) => s.id !== id));

  try {
    await deleteDoc(doc(db, ADMINS_COLLECTION, id));
  } catch (error) {
    console.warn('Firestore staff delete warning:', error);
  }
}

export async function updateStaffStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
  const cachedStaff = getLocalCache<AdminUser[]>(STORAGE_KEY_STAFF) || [...INITIAL_STAFF];
  const member = cachedStaff.find((s) => s.id === id);
  if (member) {
    member.status = status;
    setLocalCache(STORAGE_KEY_STAFF, cachedStaff);
  }

  try {
    await updateDoc(doc(db, ADMINS_COLLECTION, id), { status });
  } catch (error) {
    console.warn('Firestore staff status update warning:', error);
  }
}
