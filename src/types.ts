export type Market = 'NG' | 'AU';
export type Currency = 'NGN' | 'AUD';
export type InstalmentFrequency = 'weekly' | 'biweekly' | 'monthly';
export type PaymentMode = 'buy_now' | 'pay_small_small' | 'subscription';
export type PaymentGateway = 'korapay' | 'paystack' | 'stripe' | 'flutterwave' | 'bank_transfer' | 'payid';

export interface StoreSettings {
  ngnPerAud: number;
  ngDeliveryFee: number;
  auDeliveryFee: number;
  ngFreeDeliveryThreshold: number;
  auFreeDeliveryThreshold: number;
  pssEnabled: boolean;
  pssDefaultDepositPercent: number;
  pssMinOrderNGN: number;
  pssMinOrderAUD: number;
  pssReleaseThresholdPercent: number;
  pssMaxPeriods: number;
  pssAllowedFrequencies: InstalmentFrequency[];
  subscriptionDiscountPercent: number;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: string[];
  sortOrder: number;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  categoryId: string;
  subcategory: string;
  description: string;
  priceNGN: number;
  priceAUD: number;
  comparePriceNGN?: number;
  comparePriceAUD?: number;
  images: string[];
  unit?: string;
  variants?: string[];
  stock: number;
  pssEligible: boolean;
  pssMinDepositPercent?: number;
  subscriptionEligible: boolean;
  isBundle?: boolean;
  bundleItems?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  markets?: Market[];
  ratingAvg?: number;
  reviewCount?: number;
  updatedAt?: unknown;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  image?: string;
  frequencyOptions: InstalmentFrequency[];
  priceNGN: number;
  priceAUD: number;
  items: string[];
  active: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minSpendNGN?: number;
  minSpendAUD?: number;
  active: boolean;
  expiresAt?: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: 'Nigeria' | 'Australia';
  market: Market;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  preferredMarket: Market;
  addresses?: Address[];
  wishlist?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  variant?: string;
  quantity: number;
  priceNGN: number;
  priceAUD: number;
  pssEligible: boolean;
  updatedAt?: unknown;
}

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  pssEligible: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail?: string;
  customerName?: string;
  market: Market;
  currency: Currency;
  paymentMode: PaymentMode;
  paymentMethod?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  amountPaid: number;
  balanceRemaining: number;
  couponCode?: string;
  shippingAddress?: Address;
  status: 'pending_verification' | 'deposit_paid' | 'paid' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';
  fulfilmentStatus: 'locked_until_paid' | 'eligible_for_dispatch' | 'dispatched' | 'delivered';
  trackingCode?: string;
  paymentPlanId?: string;
  subscriptionId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InstalmentScheduleItem {
  index: number;
  dueDate: string;
  amount: number;
  status: 'paid' | 'due' | 'upcoming' | 'overdue';
  paidAt?: string;
}

export interface PaymentPlan {
  id: string;
  userId: string;
  customerEmail?: string;
  customerName?: string;
  orderId: string;
  orderNumber?: string;
  market: Market;
  currency: Currency;
  totalAmount: number;
  depositPercent: number;
  depositAmount: number;
  amountPaid: number;
  balanceRemaining: number;
  frequency: InstalmentFrequency;
  totalInstalments: number;
  paidInstalments: number;
  instalmentAmount: number;
  nextPaymentDate: string;
  releaseThresholdPercent: number;
  status: 'pending_deposit' | 'active' | 'overdue' | 'completed' | 'cancelled';
  schedule: InstalmentScheduleItem[];
  remindersSent?: number;
  lastReminderAt?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SubscriptionItemEntry {
  productId: string;
  name: string;
  quantity: number;
  unitPriceNGN: number;
  unitPriceAUD: number;
}

export interface CustomerSubscription {
  id: string;
  userId: string;
  customerEmail?: string;
  customerName?: string;
  packageId?: string;
  planName: string;
  isCustom?: boolean;
  frequency: InstalmentFrequency;
  market: Market;
  currency: Currency;
  items: SubscriptionItemEntry[];
  pricePerCycle: number;
  autoRenew: boolean;
  status: 'active' | 'paused' | 'renewal_due' | 'cancelled';
  nextDeliveryDate: string;
  nextRenewalDate: string;
  renewalCount: number;
  shippingAddress?: Address;
  remindersSent?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Transaction {
  id: string;
  userId: string;
  customerEmail?: string;
  orderId: string;
  paymentPlanId?: string;
  subscriptionId?: string;
  type: 'buy_now' | 'pss_deposit' | 'pss_instalment' | 'subscription_cycle';
  market: Market;
  currency: Currency;
  amount: number;
  gateway: PaymentGateway;
  reference: string;
  status: 'pending_verification' | 'verified' | 'failed';
  verifiedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppNotification {
  id: string;
  targetRole: 'admin' | 'customer';
  userId: string;
  type: 'new_order' | 'payment_verification' | 'pss_reminder' | 'pss_overdue' | 'subscription_renewal';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt?: unknown;
}

export interface GatewayConfigStatus {
  korapayConfigured: boolean;
  paystackConfigured: boolean;
  paystackPublicKey: string;
  flutterwaveConfigured: boolean;
  stripeConfigured: boolean;
  stripePublishableKey: string;
  cloudinaryConfigured: boolean;
  emailConfigured: boolean;
}
