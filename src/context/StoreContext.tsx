import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  DEFAULT_STORE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_PRODUCTS,
  INITIAL_SUBSCRIPTION_PACKAGES,
} from '../data/catalog';
import {
  Address,
  AppNotification,
  CartItem,
  Category,
  Coupon,
  CustomerSubscription,
  GatewayConfigStatus,
  InstalmentFrequency,
  Market,
  Order,
  OrderItem,
  PaymentGateway,
  PaymentMode,
  PaymentPlan,
  Product,
  StoreSettings,
  SubscriptionItemEntry,
  SubscriptionPackage,
  Transaction,
  UserProfile,
} from '../types';
import {
  addDaysISO,
  calculatePaySmallSmall,
  frequencyToDays,
  getCurrencyForMarket,
  getProductPrice,
} from '../utils/currency';

const PRIMARY_ADMIN_EMAIL = 'usitakatelvin@gmail.com';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
}

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

interface CheckoutPayload {
  paymentMode: PaymentMode;
  paymentMethod: PaymentGateway;
  shippingAddress: Address;
  couponCode?: string;
  discountAmount: number;
  deliveryFee: number;
  pssDepositPercent?: number;
  pssFrequency?: InstalmentFrequency;
  pssPeriods?: number;
  manualTransferRef?: string;
}

interface SubscriptionCheckoutPayload {
  packageId?: string;
  planName: string;
  isCustom: boolean;
  frequency: InstalmentFrequency;
  items: SubscriptionItemEntry[];
  pricePerCycle: number;
  autoRenew: boolean;
  paymentMethod: PaymentGateway;
  shippingAddress: Address;
  manualTransferRef?: string;
}

interface StoreContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  authReady: boolean;
  isAdmin: boolean;
  market: Market;
  setMarket: (m: Market) => void;
  currency: 'NGN' | 'AUD';
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  subscriptionPackages: SubscriptionPackage[];
  coupons: Coupon[];
  cart: CartItem[];
  orders: Order[];
  paymentPlans: PaymentPlan[];
  subscriptions: CustomerSubscription[];
  transactions: Transaction[];
  notifications: AppNotification[];
  gatewayStatus: GatewayConfigStatus;
  toast: { type: 'success' | 'error' | 'info'; text: string } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;

  // Auth
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;

  // Cart & Wishlist
  addToCart: (product: Product, quantity?: number, variant?: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  saveAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;

  // Checkout & Payments
  validateCoupon: (code: string, subtotal: number) => Promise<{ valid: boolean; coupon?: Coupon; discount: number; error?: string }>;
  placeOrder: (payload: CheckoutPayload) => Promise<{ order: Order; paymentPlan?: PaymentPlan; redirectUrl?: string }>;
  payInstalment: (plan: PaymentPlan, payFullRemaining: boolean, gateway: PaymentGateway, manualRef?: string) => Promise<{ redirectUrl?: string }>;
  createSubscription: (payload: SubscriptionCheckoutPayload) => Promise<{ subscription: CustomerSubscription; redirectUrl?: string }>;
  updateSubscriptionStatus: (subId: string, status: CustomerSubscription['status']) => Promise<void>;
  renewSubscriptionNow: (sub: CustomerSubscription, gateway: PaymentGateway, manualRef?: string) => Promise<{ redirectUrl?: string }>;
  updateSubscriptionItems: (subId: string, items: SubscriptionItemEntry[], pricePerCycle: number) => Promise<void>;
  sendReminder: (targetEmail: string, userId: string, type: AppNotification['type'], title: string, message: string, relatedId: string) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => Promise<void>;

  // Admin Operations
  syncDefaultCatalogToFirestore: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  saveStoreSettings: (next: StoreSettings) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  saveSubscriptionPackage: (pkg: SubscriptionPackage) => Promise<void>;
  adminVerifyTransaction: (tx: Transaction, approve: boolean) => Promise<void>;
  adminUpdateOrder: (orderId: string, updates: Partial<Pick<Order, 'status' | 'fulfilmentStatus' | 'trackingCode'>>) => Promise<void>;
  adminUpdatePaymentPlanStatus: (planId: string, status: PaymentPlan['status']) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [market, setMarketState] = useState<Market>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('samsara_market') : null;
    return saved === 'AU' ? 'AU' : 'NG';
  });

  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [subscriptionPackages, setSubscriptionPackages] = useState<SubscriptionPackage[]>(INITIAL_SUBSCRIPTION_PACKAGES);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayConfigStatus>({
    paystackConfigured: false,
    paystackPublicKey: '',
    flutterwaveConfigured: false,
    stripeConfigured: false,
    stripePublishableKey: '',
    cloudinaryConfigured: false,
    emailConfigured: false,
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [seededChecked, setSeededChecked] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
  };
  const clearToast = () => setToast(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const currency = getCurrencyForMarket(market);
  const isAdmin = Boolean(
    user?.emailVerified &&
      (user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL || isAdminDoc)
  );

  // Fetch public gateway status from Express backend
  useEffect(() => {
    fetch('/api/config/gateways')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setGatewayStatus(data);
      })
      .catch(() => {});
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setAuthReady(true);
      if (!fbUser) {
        setUserProfile(null);
        setIsAdminDoc(false);
        setOrders([]);
        setPaymentPlans([]);
        setSubscriptions([]);
        setTransactions([]);
        setNotifications([]);
        return;
      }

      // Check admin collection
      try {
        const admSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        setIsAdminDoc(admSnap.exists());
      } catch {
        setIsAdminDoc(false);
      }
    });
    return unsub;
  }, []);

  // Public Firestore listeners (settings, categories, products, subscriptionPackages)
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'storeConfig'),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_STORE_SETTINGS, ...(snap.data() as StoreSettings) });
        }
      },
      () => {}
    );

    const unsubCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('sortOrder', 'asc')),
      () => {
        // Keep the Samsara Choice storefront departments canonical. Old Firestore
        // records from another store must never replace this store's categories.
        setCategories(INITIAL_CATEGORIES);
      },
      () => setCategories(INITIAL_CATEGORIES)
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        // Keep the imported Samsara catalog as the base. Only accept matching
        // imported IDs or products created through this app's admin dashboard.
        const importedIds = new Set(INITIAL_PRODUCTS.map((product) => product.id));
        const remoteProducts = snap.docs
          .map((d) => ({ ...(d.data() as Product), id: d.id }))
          .filter((product) => importedIds.has(product.id) || product.id.startsWith('prod-'));
        const remoteById = new Map(remoteProducts.map((product) => [product.id, product]));
        const importedCatalog = INITIAL_PRODUCTS.map((product) => ({
          ...product,
          ...(remoteById.get(product.id) || {}),
        }));
        const adminProducts = remoteProducts.filter((product) => !importedIds.has(product.id));
        setProducts([...importedCatalog, ...adminProducts]);
      },
      () => setProducts(INITIAL_PRODUCTS)
    );

    const unsubPackages = onSnapshot(
      collection(db, 'subscriptionPlans'),
      (snap) => {
        if (!snap.empty) {
          setSubscriptionPackages(snap.docs.map((d) => d.data() as SubscriptionPackage));
        }
      },
      () => {}
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
      unsubPackages();
    };
  }, []);

  // Auto-create user profile & sync guest cart when signed in
  useEffect(() => {
    if (!authReady || !user) return;
    const uid = user.uid;
    const userRef = doc(db, 'users', uid);

    const ensureProfile = async () => {
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
            phone: '',
            preferredMarket: market,
            addresses: [],
            wishlist: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    };
    ensureProfile();

    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setUserProfile(data);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubCart = onSnapshot(
      collection(db, 'users', uid, 'cart'),
      (snap) => {
        setCart(snap.docs.map((d) => d.data() as CartItem));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/cart`)
    );

    return () => {
      unsubUser();
      unsubCart();
    };
  }, [authReady, user]);

  // Account-isolated or Admin listeners for orders, paymentPlans, subscriptions, transactions, notifications, coupons
  useEffect(() => {
    if (!authReady || !user) return;

    const ordersQuery = isAdmin
      ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'orders'), where('userId', '==', user.uid));

    const plansQuery = isAdmin
      ? query(collection(db, 'paymentPlans'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'paymentPlans'), where('userId', '==', user.uid));

    const subsQuery = isAdmin
      ? query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'subscriptions'), where('userId', '==', user.uid));

    const txQuery = isAdmin
      ? query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'transactions'), where('userId', '==', user.uid));

    const notifQuery = isAdmin
      ? query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'notifications'), where('userId', '==', user.uid));

    const sortDesc = <T extends { createdAt?: unknown }>(arr: T[]): T[] => {
      return [...arr].sort((a, b) => {
        const ta = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
        const tb = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
        return tb - ta;
      });
    };

    const u1 = onSnapshot(
      ordersQuery,
      (s) => setOrders(sortDesc(s.docs.map((d) => d.data() as Order))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'orders')
    );
    const u2 = onSnapshot(
      plansQuery,
      (s) => setPaymentPlans(sortDesc(s.docs.map((d) => d.data() as PaymentPlan))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'paymentPlans')
    );
    const u3 = onSnapshot(
      subsQuery,
      (s) => setSubscriptions(sortDesc(s.docs.map((d) => d.data() as CustomerSubscription))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'subscriptions')
    );
    const u4 = onSnapshot(
      txQuery,
      (s) => setTransactions(sortDesc(s.docs.map((d) => d.data() as Transaction))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'transactions')
    );
    const u5 = onSnapshot(
      notifQuery,
      (s) => setNotifications(sortDesc(s.docs.map((d) => d.data() as AppNotification))),
      (e) => handleFirestoreError(e, OperationType.LIST, 'notifications')
    );

    let u6 = () => {};
    if (isAdmin) {
      u6 = onSnapshot(
        collection(db, 'coupons'),
        (s) => {
          if (!s.empty) setCoupons(s.docs.map((d) => d.data() as Coupon));
        },
        (e) => handleFirestoreError(e, OperationType.LIST, 'coupons')
      );
    }

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
    };
  }, [authReady, user, isAdmin]);

  // Auto-seed or full-sync Firestore catalog & settings on admin trigger
  const syncDefaultCatalogToFirestore = async () => {
    if (!isAdmin) return;
    const validCatIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
    const validProdIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));

    const batch = writeBatch(db);
    try {
      const [existingCats, existingProds] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'products')),
      ]);
      for (const d of existingCats.docs) {
        if (!validCatIds.has(d.id)) {
          batch.delete(d.ref);
        }
      }
      for (const d of existingProds.docs) {
        if (!validProdIds.has(d.id) && !d.id.startsWith('prod-')) {
          batch.delete(d.ref);
        }
      }
    } catch {
      // proceed with upserts if list read skipped
    }

    batch.set(doc(db, 'settings', 'storeConfig'), {
      ...DEFAULT_STORE_SETTINGS,
      updatedAt: serverTimestamp(),
    });
    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), cat);
    }
    for (const prod of INITIAL_PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), {
        ...prod,
        updatedAt: serverTimestamp(),
      });
    }
    for (const pkg of INITIAL_SUBSCRIPTION_PACKAGES) {
      batch.set(doc(db, 'subscriptionPlans', pkg.id), pkg);
    }
    for (const cpn of INITIAL_COUPONS) {
      batch.set(doc(db, 'coupons', cpn.code), cpn);
    }
    try {
      await batch.commit();
      showToast('Supermart catalog, categories, Pay Small Small settings & subscriptions synced to Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'catalog_seed');
    }
  };

  useEffect(() => {
    if (!isAdmin || seededChecked) return;
    setSeededChecked(true);
    getDocs(collection(db, 'products'))
      .then((snap) => {
        if (snap.empty) {
          syncDefaultCatalogToFirestore();
        }
      })
      .catch(() => {});
  }, [isAdmin, seededChecked]);

  const setMarket = async (next: Market) => {
    setMarketState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('samsara_market', next);
    }
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          preferredMarket: next,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // non-fatal if profile doc not yet created
      }
    }
  };

  // Auth handlers
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    showToast('Signed in to Samsara Choice Ltd.', 'success');
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    showToast('Welcome back to Samsara Choice Ltd.', 'success');
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await sendEmailVerification(cred.user);
    showToast('Account created! Please check your inbox to verify your email before checkout.', 'info');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
    showToast('Password reset link sent to your email address.', 'success');
  };

  const resendVerification = async () => {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser);
    showToast('Verification email resent. Check your inbox or spam folder.', 'info');
  };

  const logout = async () => {
    await signOut(auth);
    setCart([]);
    showToast('You have been signed out.', 'info');
  };

  // Cart & Wishlist
  const addToCart = async (product: Product, quantity = 1, variant?: string) => {
    const chosenVariant = variant || product.variants?.[0] || product.unit || 'Standard';
    const itemId = sanitizeId(`${product.id}-${chosenVariant}`);
    if (!user) {
      setCart((prev) => {
        const existingItem = prev.find((i) => i.id === itemId);
        if (existingItem) {
          return prev.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            name: product.name,
            image: product.images[0],
            variant: chosenVariant,
            quantity,
            priceNGN: product.priceNGN,
            priceAUD: product.priceAUD,
            pssEligible: product.pssEligible,
          },
        ];
      });
      showToast(`Added ${product.name} to bag.`, 'success');
      return;
    }

    const existingItem = cart.find((i) => i.id === itemId);
    const nextQty = (existingItem?.quantity || 0) + quantity;
    const itemRef = doc(db, 'users', user.uid, 'cart', itemId);
    try {
      await setDoc(itemRef, {
        id: itemId,
        productId: product.id,
        name: product.name,
        image: product.images[0] || '',
        variant: chosenVariant,
        quantity: Math.min(999, nextQty),
        priceNGN: product.priceNGN,
        priceAUD: product.priceAUD,
        pssEligible: product.pssEligible,
        updatedAt: serverTimestamp(),
      });
      showToast(`Added ${product.name} to bag.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/cart/${itemId}`);
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    if (!user) {
      setCart((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)));
      return;
    }
    const item = cart.find((i) => i.id === cartItemId);
    if (!item) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'cart', cartItemId), {
        ...item,
        quantity: Math.min(999, quantity),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/cart/${cartItemId}`);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) {
      setCart((prev) => prev.filter((i) => i.id !== cartItemId));
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', cartItemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/cart/${cartItemId}`);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const batch = writeBatch(db);
      for (const item of cart) {
        batch.delete(doc(db, 'users', user.uid, 'cart', item.id));
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/cart`);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !userProfile) {
      showToast('Please sign in to save items to your wishlist.', 'info');
      return;
    }
    const current = userProfile.wishlist || [];
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId].slice(0, 100);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        wishlist: next,
        updatedAt: serverTimestamp(),
      });
      showToast(
        current.includes(productId) ? 'Removed from wishlist.' : 'Saved to wishlist.',
        'success'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const saveAddress = async (address: Address) => {
    if (!user || !userProfile) return;
    const list = userProfile.addresses || [];
    const exists = list.some((a) => a.id === address.id);
    const next = (exists
      ? list.map((a) => (a.id === address.id ? address : a))
      : [...list, address]
    ).slice(0, 10);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: next,
        updatedAt: serverTimestamp(),
      });
      showToast('Delivery address saved.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user || !userProfile) return;
    const next = (userProfile.addresses || []).filter((a) => a.id !== addressId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: next,
        updatedAt: serverTimestamp(),
      });
      showToast('Address removed.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Coupon validation
  const validateCoupon = async (code: string, subtotal: number) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { valid: false, discount: 0, error: 'Enter a coupon code.' };
    let found: Coupon | undefined;
    try {
      const snap = await getDoc(doc(db, 'coupons', clean));
      if (snap.exists()) {
        found = snap.data() as Coupon;
      }
    } catch {
      // fallback to local default list if rules/network fallback
    }
    if (!found) {
      found = coupons.find((c) => c.code === clean);
    }
    if (!found || !found.active) {
      return { valid: false, discount: 0, error: 'Invalid or expired coupon code.' };
    }
    const minSpend = market === 'NG' ? found.minSpendNGN || 0 : found.minSpendAUD || 0;
    if (subtotal < minSpend) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum spend of ${currency === 'NGN' ? '₦' : 'A$'}${minSpend.toLocaleString()} required.`,
      };
    }
    const discount =
      found.discountType === 'percent'
        ? Math.round(((subtotal * found.discountValue) / 100) * 100) / 100
        : Math.min(subtotal, found.discountValue);
    return { valid: true, coupon: found, discount };
  };

  // Helper: Initialize gateway via Express backend
  const callPaymentGatewayInit = async (
    gateway: PaymentGateway,
    amount: number,
    reference: string,
    orderNumber: string
  ): Promise<{ configured: boolean; authorizationUrl?: string; message?: string }> => {
    if (gateway === 'bank_transfer' || gateway === 'payid') {
      return { configured: true };
    }
    if (!user) throw new Error('Authentication required.');
    const token = await user.getIdToken();
    const resp = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gateway,
        market,
        currency,
        amount,
        reference,
        orderNumber,
        callbackUrl: window.location.origin,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || 'Payment initialization failed.');
    }
    return data;
  };

  // Place Order (Buy & Pay Now OR Pay Small Small)
  const placeOrder = async (payload: CheckoutPayload) => {
    if (!user || !user.emailVerified) {
      throw new Error('Please sign in with a verified email (or Google) to place an order.');
    }
    if (cart.length === 0) throw new Error('Your shopping bag is empty.');

    const items: OrderItem[] = cart.map((c) => {
      const unitPrice = getProductPrice(c, market, settings);
      return {
        productId: c.productId,
        name: c.name,
        image: c.image || '',
        variant: c.variant || 'Standard',
        quantity: c.quantity,
        unitPrice,
        pssEligible: c.pssEligible,
      };
    });

    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const totalAmount = Math.max(0, subtotal - payload.discountAmount + payload.deliveryFee);

    const orderId = makeId('ord');
    const orderNumber = `SC-${Date.now().toString().slice(-6)}`;
    const txId = makeId('tx');
    const reference =
      payload.manualTransferRef?.trim() ||
      `SAMSARA-${orderNumber}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const isPss = payload.paymentMode === 'pay_small_small';
    const depositPct = payload.pssDepositPercent || settings.pssDefaultDepositPercent;
    const pssFreq = payload.pssFrequency || 'weekly';
    const pssPeriods = payload.pssPeriods || 3;

    const pssCalc = isPss
      ? calculatePaySmallSmall(totalAmount, depositPct, pssFreq, pssPeriods, currency)
      : null;

    const amountDueNow = isPss && pssCalc ? pssCalc.depositAmount : totalAmount;

    // Attempt gateway initialization if online card gateway selected
    const gwResult = await callPaymentGatewayInit(
      payload.paymentMethod,
      amountDueNow,
      reference,
      orderNumber
    );

    const isManualOrPending =
      payload.paymentMethod === 'bank_transfer' ||
      payload.paymentMethod === 'payid' ||
      !gwResult.configured ||
      Boolean(gwResult.authorizationUrl);

    const planId = isPss ? makeId('pss') : undefined;

    const orderDoc: Order = {
      id: orderId,
      orderNumber,
      userId: user.uid,
      customerEmail: user.email || '',
      customerName: payload.shippingAddress.fullName || user.displayName || 'Customer',
      market,
      currency,
      paymentMode: payload.paymentMode,
      paymentMethod: payload.paymentMethod,
      items,
      subtotal,
      discount: payload.discountAmount,
      deliveryFee: payload.deliveryFee,
      totalAmount,
      amountPaid: 0,
      balanceRemaining: totalAmount,
      ...(payload.couponCode ? { couponCode: payload.couponCode } : {}),
      shippingAddress: payload.shippingAddress,
      status: 'pending_verification',
      fulfilmentStatus: isPss ? 'locked_until_paid' : 'eligible_for_dispatch',
      ...(planId ? { paymentPlanId: planId } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const txDoc: Transaction = {
      id: txId,
      userId: user.uid,
      customerEmail: user.email || '',
      orderId,
      ...(planId ? { paymentPlanId: planId } : {}),
      type: isPss ? 'pss_deposit' : 'buy_now',
      market,
      currency,
      amount: amountDueNow,
      gateway: payload.paymentMethod,
      reference,
      status: 'pending_verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', orderId), orderDoc);
    batch.set(doc(db, 'transactions', txId), txDoc);

    let planDoc: PaymentPlan | undefined;
    if (isPss && pssCalc && planId) {
      planDoc = {
        id: planId,
        userId: user.uid,
        customerEmail: user.email || '',
        customerName: orderDoc.customerName,
        orderId,
        orderNumber,
        market,
        currency,
        totalAmount,
        depositPercent: pssCalc.depositPercent,
        depositAmount: pssCalc.depositAmount,
        amountPaid: 0,
        balanceRemaining: totalAmount,
        frequency: pssFreq,
        totalInstalments: pssCalc.instalmentCount,
        paidInstalments: 0,
        instalmentAmount: pssCalc.instalmentAmount,
        nextPaymentDate: pssCalc.nextPaymentDate,
        releaseThresholdPercent: settings.pssReleaseThresholdPercent,
        status: 'pending_deposit',
        schedule: pssCalc.schedule,
        remindersSent: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(doc(db, 'paymentPlans', planId), planDoc);
    }

    // Create admin notification
    const notifId = makeId('ntf');
    batch.set(doc(db, 'notifications', notifId), {
      id: notifId,
      targetRole: 'admin',
      userId: user.uid,
      type: 'new_order',
      title: `New ${isPss ? 'Pay Small Small' : 'Buy Now'} Order ${orderNumber}`,
      message: `${orderDoc.customerName} placed ${orderNumber} (${currency} ${totalAmount.toLocaleString()}) via ${payload.paymentMethod}. Payment verification pending (${reference}).`,
      relatedId: orderId,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Clear cart
    for (const cItem of cart) {
      batch.delete(doc(db, 'users', user.uid, 'cart', cItem.id));
    }

    try {
      await batch.commit();
      if (gwResult.authorizationUrl) {
        showToast('Redirecting to payment gateway checkout...', 'info');
      } else if (isManualOrPending) {
        showToast(
          `Order ${orderNumber} created with reference ${reference}. Payment verification is queued.`,
          'success'
        );
      }
      return { order: orderDoc, paymentPlan: planDoc, redirectUrl: gwResult.authorizationUrl };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  // Pay Small Small Instalment
  const payInstalment = async (
    plan: PaymentPlan,
    payFullRemaining: boolean,
    gateway: PaymentGateway,
    manualRef?: string
  ) => {
    if (!user || !user.emailVerified) {
      throw new Error('Verified sign-in required.');
    }
    const nextItem = plan.schedule.find((s) => s.status !== 'paid');
    const amount = payFullRemaining
      ? plan.balanceRemaining
      : Math.min(plan.balanceRemaining, nextItem?.amount || plan.instalmentAmount);

    if (amount <= 0) throw new Error('No balance remaining on this plan.');

    const txId = makeId('tx');
    const reference =
      manualRef?.trim() ||
      `PSS-${plan.orderNumber || plan.id}-${Date.now().toString().slice(-5)}`;

    const gwResult = await callPaymentGatewayInit(
      gateway,
      amount,
      reference,
      plan.orderNumber || plan.orderId
    );

    const txDoc: Transaction = {
      id: txId,
      userId: user.uid,
      customerEmail: user.email || '',
      orderId: plan.orderId,
      paymentPlanId: plan.id,
      type: 'pss_instalment',
      market: plan.market,
      currency: plan.currency,
      amount,
      gateway,
      reference,
      status: 'pending_verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const notifId = makeId('ntf');
    const batch = writeBatch(db);
    batch.set(doc(db, 'transactions', txId), txDoc);
    batch.set(doc(db, 'notifications', notifId), {
      id: notifId,
      targetRole: 'admin',
      userId: user.uid,
      type: 'payment_verification',
      title: `Pay Small Small Instalment Submitted (${plan.orderNumber || plan.id})`,
      message: `${user.email} submitted ${plan.currency} ${amount.toLocaleString()} via ${gateway} (Ref: ${reference}).`,
      relatedId: txId,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(
        `Instalment payment submitted (Ref: ${reference}). Pending verification & balance update.`,
        'success'
      );
      return { redirectUrl: gwResult.authorizationUrl };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${txId}`);
    }
  };

  // Foodstuff Subscriptions
  const createSubscription = async (payload: SubscriptionCheckoutPayload) => {
    if (!user || !user.emailVerified) {
      throw new Error('Verified sign-in required to start a subscription.');
    }

    const subId = makeId('sub');
    const orderId = makeId('ord');
    const orderNumber = `SUB-${Date.now().toString().slice(-6)}`;
    const txId = makeId('tx');
    const reference =
      payload.manualTransferRef?.trim() ||
      `SAMSARA-${orderNumber}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const gwResult = await callPaymentGatewayInit(
      payload.paymentMethod,
      payload.pricePerCycle,
      reference,
      orderNumber
    );

    const cycleDays = frequencyToDays(payload.frequency);
    const now = new Date();

    const subDoc: CustomerSubscription = {
      id: subId,
      userId: user.uid,
      customerEmail: user.email || '',
      customerName: payload.shippingAddress.fullName || user.displayName || 'Subscriber',
      ...(payload.packageId ? { packageId: payload.packageId } : {}),
      planName: payload.planName,
      isCustom: payload.isCustom,
      frequency: payload.frequency,
      market,
      currency,
      items: payload.items,
      pricePerCycle: payload.pricePerCycle,
      autoRenew: payload.autoRenew,
      status: 'active',
      nextDeliveryDate: addDaysISO(now, 2),
      nextRenewalDate: addDaysISO(now, cycleDays),
      renewalCount: 1,
      shippingAddress: payload.shippingAddress,
      remindersSent: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderDoc: Order = {
      id: orderId,
      orderNumber,
      userId: user.uid,
      customerEmail: user.email || '',
      customerName: subDoc.customerName,
      market,
      currency,
      paymentMode: 'subscription',
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        unitPrice: market === 'NG' ? it.unitPriceNGN : it.unitPriceAUD,
        pssEligible: false,
      })),
      subtotal: payload.pricePerCycle,
      discount: 0,
      deliveryFee: 0,
      totalAmount: payload.pricePerCycle,
      amountPaid: 0,
      balanceRemaining: payload.pricePerCycle,
      shippingAddress: payload.shippingAddress,
      status: 'pending_verification',
      fulfilmentStatus: 'eligible_for_dispatch',
      subscriptionId: subId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const txDoc: Transaction = {
      id: txId,
      userId: user.uid,
      customerEmail: user.email || '',
      orderId,
      subscriptionId: subId,
      type: 'subscription_cycle',
      market,
      currency,
      amount: payload.pricePerCycle,
      gateway: payload.paymentMethod,
      reference,
      status: 'pending_verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const notifId = makeId('ntf');
    const batch = writeBatch(db);
    batch.set(doc(db, 'subscriptions', subId), subDoc);
    batch.set(doc(db, 'orders', orderId), orderDoc);
    batch.set(doc(db, 'transactions', txId), txDoc);
    batch.set(doc(db, 'notifications', notifId), {
      id: notifId,
      targetRole: 'admin',
      userId: user.uid,
      type: 'subscription_renewal',
      title: `New ${payload.frequency} Subscription: ${payload.planName}`,
      message: `${subDoc.customerName} started ${payload.planName} (${currency} ${payload.pricePerCycle.toLocaleString()}). Ref: ${reference}.`,
      relatedId: subId,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Subscription "${payload.planName}" activated!`, 'success');
      return { subscription: subDoc, redirectUrl: gwResult.authorizationUrl };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscriptions/${subId}`);
    }
  };

  const updateSubscriptionStatus = async (subId: string, status: CustomerSubscription['status']) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast(`Subscription status updated to ${status}.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  const renewSubscriptionNow = async (
    sub: CustomerSubscription,
    gateway: PaymentGateway,
    manualRef?: string
  ) => {
    if (!user || !user.emailVerified) throw new Error('Verified sign-in required.');
    const orderId = makeId('ord');
    const orderNumber = `REN-${Date.now().toString().slice(-6)}`;
    const txId = makeId('tx');
    const reference = manualRef?.trim() || `REN-${Date.now().toString().slice(-6)}`;
    const gwResult = await callPaymentGatewayInit(gateway, sub.pricePerCycle, reference, orderNumber);

    const cycleDays = frequencyToDays(sub.frequency);
    const now = new Date();

    const batch = writeBatch(db);
    batch.update(doc(db, 'subscriptions', sub.id), {
      status: 'active',
      renewalCount: (sub.renewalCount || 1) + 1,
      nextDeliveryDate: addDaysISO(now, 2),
      nextRenewalDate: addDaysISO(now, cycleDays),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'orders', orderId), {
      id: orderId,
      orderNumber,
      userId: user.uid,
      customerEmail: user.email || '',
      customerName: sub.customerName || 'Subscriber',
      market: sub.market,
      currency: sub.currency,
      paymentMode: 'subscription',
      paymentMethod: gateway,
      items: sub.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        unitPrice: sub.market === 'NG' ? it.unitPriceNGN : it.unitPriceAUD,
        pssEligible: false,
      })),
      subtotal: sub.pricePerCycle,
      discount: 0,
      deliveryFee: 0,
      totalAmount: sub.pricePerCycle,
      amountPaid: 0,
      balanceRemaining: sub.pricePerCycle,
      shippingAddress: sub.shippingAddress,
      status: 'pending_verification',
      fulfilmentStatus: 'eligible_for_dispatch',
      subscriptionId: sub.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'transactions', txId), {
      id: txId,
      userId: user.uid,
      customerEmail: user.email || '',
      orderId,
      subscriptionId: sub.id,
      type: 'subscription_cycle',
      market: sub.market,
      currency: sub.currency,
      amount: sub.pricePerCycle,
      gateway,
      reference,
      status: 'pending_verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      showToast(`Subscription renewed for another ${sub.frequency} cycle.`, 'success');
      return { redirectUrl: gwResult.authorizationUrl };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscriptions/${sub.id}`);
    }
  };

  const updateSubscriptionItems = async (
    subId: string,
    items: SubscriptionItemEntry[],
    pricePerCycle: number
  ) => {
    try {
      await updateDoc(doc(db, 'subscriptions', subId), {
        items,
        pricePerCycle,
        updatedAt: serverTimestamp(),
      });
      showToast('Subscription bundle items updated.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscriptions/${subId}`);
    }
  };

  // Automatic Reminders
  const sendReminder = async (
    targetEmail: string,
    targetUserId: string,
    type: AppNotification['type'],
    title: string,
    message: string,
    relatedId: string
  ): Promise<boolean> => {
    if (!user) return false;
    const notifId = makeId('ntf');
    try {
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        targetRole: 'customer',
        userId: targetUserId,
        type,
        title: title.slice(0, 160),
        message: message.slice(0, 600),
        relatedId,
        read: false,
        createdAt: serverTimestamp(),
      });

      const token = await user.getIdToken();
      const resp = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toEmail: targetEmail, subject: title, body: message }),
      });
      const resData = await resp.json();
      if (resData.sent) {
        showToast(`Email & in-app reminder sent to ${targetEmail}.`, 'success');
      } else {
        showToast('In-app reminder created (configure RESEND_API_KEY in Secrets for email delivery).', 'info');
      }
      return Boolean(resData.sent);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  // Admin Operations
  const saveProduct = async (product: Product) => {
    const id = sanitizeId(product.id || makeId('prod'));
    try {
      await setDoc(doc(db, 'products', id), {
        ...product,
        id,
        updatedAt: serverTimestamp(),
      });
      showToast(`Product "${product.name}" saved.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      showToast('Product deleted.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  const saveCategory = async (category: Category) => {
    const id = sanitizeId(category.id);
    try {
      await setDoc(doc(db, 'categories', id), { ...category, id });
      showToast(`Category "${category.name}" saved.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${id}`);
    }
  };

  const saveStoreSettings = async (next: StoreSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'storeConfig'), {
        ...next,
        updatedAt: serverTimestamp(),
      });
      showToast('Market pricing & Pay Small Small rules saved.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/storeConfig');
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    const code = coupon.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    try {
      await setDoc(doc(db, 'coupons', code), { ...coupon, code });
      showToast(`Coupon ${code} saved.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coupons/${code}`);
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', code));
      showToast(`Coupon ${code} deleted.`, 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${code}`);
    }
  };

  const saveSubscriptionPackage = async (pkg: SubscriptionPackage) => {
    const id = sanitizeId(pkg.id || makeId('subpkg'));
    try {
      await setDoc(doc(db, 'subscriptionPlans', id), { ...pkg, id });
      showToast(`Subscription package "${pkg.name}" saved.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscriptionPlans/${id}`);
    }
  };

  const adminVerifyTransaction = async (tx: Transaction, approve: boolean) => {
    if (!user || !isAdmin) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'transactions', tx.id), {
      status: approve ? 'verified' : 'failed',
      verifiedBy: user.uid,
      updatedAt: serverTimestamp(),
    });

    if (approve) {
      // Update linked Order
      const orderSnap = await getDoc(doc(db, 'orders', tx.orderId));
      if (orderSnap.exists()) {
        const ord = orderSnap.data() as Order;
        const newPaid = Math.min(ord.totalAmount, (ord.amountPaid || 0) + tx.amount);
        const newBal = Math.max(0, ord.totalAmount - newPaid);
        const pctPaid = ord.totalAmount > 0 ? (newPaid / ord.totalAmount) * 100 : 100;
        const releasePct = ord.paymentMode === 'pay_small_small' ? settings.pssReleaseThresholdPercent : 100;
        const canDispatch = pctPaid >= releasePct || newBal <= 0.01;

        batch.update(doc(db, 'orders', ord.id), {
          amountPaid: newPaid,
          balanceRemaining: newBal,
          status: newBal <= 0.01 ? 'paid' : 'deposit_paid',
          fulfilmentStatus: canDispatch ? 'eligible_for_dispatch' : 'locked_until_paid',
          updatedAt: serverTimestamp(),
        });
      }

      // Update linked PaymentPlan if Pay Small Small
      if (tx.paymentPlanId) {
        const planSnap = await getDoc(doc(db, 'paymentPlans', tx.paymentPlanId));
        if (planSnap.exists()) {
          const plan = planSnap.data() as PaymentPlan;
          const newPaid = Math.min(plan.totalAmount, (plan.amountPaid || 0) + tx.amount);
          const newBal = Math.max(0, plan.totalAmount - newPaid);
          let remainingToMark = tx.type === 'pss_deposit' ? 0 : tx.amount;
          const updatedSchedule = (plan.schedule || []).map((item) => {
            if (item.status === 'paid' || remainingToMark <= 0) return item;
            if (remainingToMark + 0.05 >= item.amount) {
              remainingToMark -= item.amount;
              return { ...item, status: 'paid' as const, paidAt: new Date().toISOString() };
            }
            return item;
          });
          const paidInstCount = updatedSchedule.filter((s) => s.status === 'paid').length;
          const nextDue = updatedSchedule.find((s) => s.status !== 'paid');
          batch.update(doc(db, 'paymentPlans', plan.id), {
            amountPaid: newPaid,
            balanceRemaining: newBal,
            paidInstalments: paidInstCount,
            schedule: updatedSchedule,
            nextPaymentDate: nextDue?.dueDate || plan.nextPaymentDate,
            status: newBal <= 0.01 ? 'completed' : 'active',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    try {
      await batch.commit();
      showToast(
        approve
          ? `Payment ${tx.reference} verified and credited.`
          : `Payment ${tx.reference} marked failed.`,
        approve ? 'success' : 'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${tx.id}`);
    }
  };

  const adminUpdateOrder = async (
    orderId: string,
    updates: Partial<Pick<Order, 'status' | 'fulfilmentStatus' | 'trackingCode'>>
  ) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      showToast('Order & fulfilment status updated.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const adminUpdatePaymentPlanStatus = async (planId: string, status: PaymentPlan['status']) => {
    try {
      await updateDoc(doc(db, 'paymentPlans', planId), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast(`Payment plan marked ${status}.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `paymentPlans/${planId}`);
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Admin sign-in required.');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
    const token = await user.getIdToken();
    const resp = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageDataUrl: dataUrl, folder: 'samsara-choice/products' }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.url) {
      throw new Error(data.error || 'Cloudinary upload failed.');
    }
    showToast('Image uploaded to Cloudinary.', 'success');
    return data.url;
  };

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      userProfile,
      authReady,
      isAdmin,
      market,
      setMarket,
      currency,
      settings,
      categories,
      products,
      subscriptionPackages,
      coupons,
      cart,
      orders,
      paymentPlans,
      subscriptions,
      transactions,
      notifications,
      gatewayStatus,
      toast,
      showToast,
      clearToast,
      signInWithGoogle,
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      resendVerification,
      logout,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      saveAddress,
      deleteAddress,
      validateCoupon,
      placeOrder,
      payInstalment,
      createSubscription,
      updateSubscriptionStatus,
      renewSubscriptionNow,
      updateSubscriptionItems,
      sendReminder,
      markNotificationRead,
      syncDefaultCatalogToFirestore,
      saveProduct,
      deleteProduct,
      saveCategory,
      saveStoreSettings,
      saveCoupon,
      deleteCoupon,
      saveSubscriptionPackage,
      adminVerifyTransaction,
      adminUpdateOrder,
      adminUpdatePaymentPlanStatus,
      uploadProductImage,
    }),
    [
      user,
      userProfile,
      authReady,
      isAdmin,
      market,
      currency,
      settings,
      categories,
      products,
      subscriptionPackages,
      coupons,
      cart,
      orders,
      paymentPlans,
      subscriptions,
      transactions,
      notifications,
      gatewayStatus,
      toast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
