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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from './config';
import { Product, Category, Order, OrderStatus, PaymentStatus, StoreSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, DEFAULT_SETTINGS } from '../data/initialCatalog';

// Collection references
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const ORDERS_COLLECTION = 'orders';
const SETTINGS_COLLECTION = 'settings';

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
    
    // Auto-seed if database is currently empty
    if (snapshot.empty && !isSeedingInProgress) {
      await seedInitialDatabase();
      return onlyPublished
        ? INITIAL_PRODUCTS.filter((p) => p.status === 'published')
        : INITIAL_PRODUCTS;
    }

    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Graceful fallback to initial catalog if network/firestore initialization is pending
    return onlyPublished
      ? INITIAL_PRODUCTS.filter((p) => p.status === 'published')
      : INITIAL_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) };
    }
    // Check initial fallback
    const fallback = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
    return fallback || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${PRODUCTS_COLLECTION}/${id}`);
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
    const fallback = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return fallback || null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    const fallback = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return fallback || null;
  }
}

export async function saveProduct(productData: Partial<Product> & { name: string }): Promise<Product> {
  const id = productData.id || `bc-${Date.now()}`;
  const slug = productData.slug || slugify(productData.name);
  const now = new Date().toISOString();

  const productToSave: Product = {
    id,
    name: productData.name,
    slug,
    sku: productData.sku || `BC-SKU-${Math.floor(100 + Math.random() * 900)}`,
    shortDescription: productData.shortDescription || '',
    description: productData.description || '',
    regularPrice: Number(productData.regularPrice) || 0,
    promotionalPrice: productData.promotionalPrice ? Number(productData.promotionalPrice) : undefined,
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
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
    createdAt: productData.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, id), productToSave);
    return productToSave;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

// =================== CATEGORIES SERVICES ===================

export async function getCategories(): Promise<Category[]> {
  try {
    const q = collection(db, CATEGORIES_COLLECTION);
    const snapshot = await getDocs(q);

    if (snapshot.empty && !isSeedingInProgress) {
      await seedInitialDatabase();
      return INITIAL_CATEGORIES;
    }

    const categories: Category[] = [];
    snapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...(docSnap.data() as Omit<Category, 'id'>) });
    });

    categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return INITIAL_CATEGORIES;
  }
}

export async function saveCategory(categoryData: Partial<Category> & { name: string }): Promise<Category> {
  const id = categoryData.id || `cat-${slugify(categoryData.name)}`;
  const slug = categoryData.slug || slugify(categoryData.name);
  const now = new Date().toISOString();

  const categoryToSave: Category = {
    id,
    name: categoryData.name,
    slug,
    description: categoryData.description || '',
    image: categoryData.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    productCount: categoryData.productCount || 0,
    sortOrder: categoryData.sortOrder || 1,
    createdAt: categoryData.createdAt || now,
  };

  try {
    await setDoc(doc(db, CATEGORIES_COLLECTION, id), categoryToSave);
    return categoryToSave;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${id}`);
  }
}

// =================== ORDERS SERVICES ===================

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'paymentMethod' | 'paymentStatus' | 'status'>
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
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'unpaid', // Cash on delivery is unpaid until delivery
    status: 'pending',
    notes: orderData.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, id), order);

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

    return order;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COLLECTION}/${id}`);
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
    });
    // Sort descending by date
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ORDERS_COLLECTION}/${id}`);
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
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
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// =================== SETTINGS SERVICES ===================

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StoreSettings;
    }
    // Save default settings
    await setDoc(docRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading store settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const updated = {
      ...DEFAULT_SETTINGS,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, updated);
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/general`);
  }
}

// =================== IMAGE UPLOADER SERVICE ===================

/**
 * Optimizes an image using HTML Canvas, then attempts upload to Firebase Storage.
 * If Firebase Storage is unreachable or bucket not provisioned, falls back to
 * high-fidelity WebP compressed data URL so the product upload ALWAYS succeeds!
 */
export async function uploadProductImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = async () => {
        // Resize canvas to maximum 1200x1200px maintaining aspect ratio
        const maxDim = 1200;
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
          ctx.drawImage(img, 0, 0, width, height);
        }

        const optimizedDataUrl = canvas.toDataURL('image/webp', 0.85);

        // Attempt Firebase Storage upload
        try {
          const blob = await (await fetch(optimizedDataUrl)).blob();
          const filename = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
          const storageRef = ref(storage, filename);
          await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
          const downloadUrl = await getDownloadURL(storageRef);
          resolve(downloadUrl);
        } catch (storageError) {
          console.warn('Firebase Storage direct upload skipped, using optimized inline WebP:', storageError);
          // Seamless fallback
          resolve(optimizedDataUrl);
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
    // 1. Seed categories
    for (const cat of INITIAL_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat);
    }

    // 2. Seed products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
    }

    // 3. Seed settings
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), DEFAULT_SETTINGS);

    console.log('Boricart database successfully seeded with initial catalog.');
  } catch (error) {
    console.warn('Database seeding note (rules or network):', error);
  } finally {
    isSeedingInProgress = false;
  }
}
