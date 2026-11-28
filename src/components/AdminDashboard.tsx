import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CreditCard,
  Globe,
  Package,
  Plus,
  RefreshCw,
  ShieldAlert,
  Tag,
  Trash2,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  Coupon,
  InstalmentFrequency,
  Order,
  Product,
  StoreSettings,
} from '../types';
import { formatMoney, formatShortDate } from '../utils/currency';
import { ProductImage } from './ProductImage';

type AdminTab =
  | 'overview'
  | 'products'
  | 'pss'
  | 'subscriptions'
  | 'orders'
  | 'payments'
  | 'coupons'
  | 'settings'
  | 'notifications';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export function AdminDashboard({ onBackToStore }: AdminDashboardProps) {
  const {
    isAdmin,
    products,
    categories,
    orders,
    paymentPlans,
    subscriptions,
    subscriptionPackages,
    transactions,
    coupons,
    settings,
    notifications,
    gatewayStatus,
    syncDefaultCatalogToFirestore,
    migrateCatalogImagesToCloudinary,
    saveProduct,
    deleteProduct,
    saveStoreSettings,
    saveCoupon,
    deleteCoupon,
    adminVerifyTransaction,
    adminUpdateOrder,
    adminUpdatePaymentPlanStatus,
    sendReminder,
    markNotificationRead,
    uploadProductImage,
    showToast,
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [migratingImages, setMigratingImages] = useState(false);
  const [imageMigrationProgress, setImageMigrationProgress] = useState({ completed: 0, total: 0 });

  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    minSpendNGN: 20000,
    minSpendAUD: 40,
    active: true,
  });

  const analytics = useMemo(() => {
    const ngRevenue = transactions
      .filter((t) => t.status === 'verified' && t.currency === 'NGN')
      .reduce((s, t) => s + t.amount, 0);
    const auRevenue = transactions
      .filter((t) => t.status === 'verified' && t.currency === 'AUD')
      .reduce((s, t) => s + t.amount, 0);
    const pssReceivableNGN = paymentPlans
      .filter((p) => p.currency === 'NGN' && p.status !== 'cancelled')
      .reduce((s, p) => s + p.balanceRemaining, 0);
    const pssReceivableAUD = paymentPlans
      .filter((p) => p.currency === 'AUD' && p.status !== 'cancelled')
      .reduce((s, p) => s + p.balanceRemaining, 0);
    const pendingVerifications = transactions.filter((t) => t.status === 'pending_verification').length;
    const activeSubs = subscriptions.filter((s) => s.status === 'active').length;

    const byPaymentMode = {
      pay_small_small: orders.filter((o) => o.paymentMode === 'pay_small_small').length,
      buy_now: orders.filter((o) => o.paymentMode === 'buy_now').length,
      subscription: orders.filter((o) => o.paymentMode === 'subscription').length,
    };

    return {
      ngRevenue,
      auRevenue,
      pssReceivableNGN,
      pssReceivableAUD,
      pendingVerifications,
      activeSubs,
      byPaymentMode,
    };
  }, [transactions, paymentPlans, subscriptions, orders]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-[#D61A1E] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Authorised Administrators Only
        </h1>
        <p className="text-sm text-slate-600">
          This private management console is restricted to verified Samsara Choice Ltd
          administrators.
        </p>
        <button
          type="button"
          onClick={onBackToStore}
          className="px-5 py-2.5 bg-[#0B2D71] text-white text-sm font-semibold rounded-lg"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const unreadAdminAlerts = notifications.filter((n) => n.targetRole === 'admin' && !n.read);

  const openNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      sku: `SC-${Date.now().toString().slice(-4)}`,
      name: '',
      categoryId: categories[0]?.id || 'rice-and-grains',
      subcategory: categories[0]?.subcategories[0] || 'Parboiled Rice',
      description: '',
      priceNGN: 25000,
      priceAUD: 45,
      images: ['MANUAL_UPLOAD_REQUIRED'],
      unit: 'Pack',
      variants: ['Standard'],
      stock: 25,
      pssEligible: true,
      pssMinDepositPercent: settings.pssDefaultDepositPercent,
      subscriptionEligible: true,
      featured: false,
      bestSeller: false,
      markets: ['NG', 'AU'],
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setEditingProduct((prev) =>
        prev
          ? {
              ...prev,
              images: [url, ...prev.images.filter((i) => i !== url && i !== 'MANUAL_UPLOAD_REQUIRED')],
            }
          : null
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cloudinary upload failed.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings(settingsForm);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    await saveCoupon({
      ...newCoupon,
      code: newCoupon.code.trim().toUpperCase(),
    });
    setNewCoupon({
      code: '',
      discountType: 'percent',
      discountValue: 10,
      minSpendNGN: 20000,
      minSpendAUD: 40,
      active: true,
    });
  };

  return (
    <div className="bg-slate-50 min-h-[85vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Admin Header */}
        <div className="bg-[#0B2D71] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
              Samsara Choice Ltd · Private Operations Console
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              Store, Pay Small Small &amp; Fulfilment Administration
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={async () => {
                try {
                  await syncDefaultCatalogToFirestore();
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Catalogue import failed.', 'error');
                }
              }}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg"
            >
              Import 81 Catalogue Products
            </button>
            <button
              type="button"
              disabled={migratingImages || !gatewayStatus.cloudinaryConfigured}
              onClick={async () => {
                setMigratingImages(true);
                setImageMigrationProgress({ completed: 0, total: 0 });
                try {
                  await migrateCatalogImagesToCloudinary((completed, total) => setImageMigrationProgress({ completed, total }));
                } catch (error) {
                  showToast(error instanceof Error ? error.message : 'Cloudinary image migration failed.', 'error');
                } finally {
                  setMigratingImages(false);
                }
              }}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg"
              title={!gatewayStatus.cloudinaryConfigured ? 'Configure Cloudinary credentials in Vercel first' : 'Move imported Supermart images into Cloudinary'}
            >
              {migratingImages
                ? `Migrating Images ${imageMigrationProgress.completed}/${imageMigrationProgress.total}`
                : 'Migrate Images to Cloudinary'}
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="px-4 py-2 bg-[#D61A1E] hover:bg-[#B51418] text-white text-xs font-semibold rounded-lg"
            >
              View Live Storefront
            </button>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Analytics', icon: BarChart3 },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'pss', label: `Pay Small Small (${paymentPlans.length})`, icon: CalendarClock },
            { id: 'subscriptions', label: `Subscriptions (${subscriptions.length})`, icon: RefreshCw },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Truck },
            { id: 'payments', label: `Verify Payments (${analytics.pendingVerifications})`, icon: CreditCard },
            { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { id: 'settings', label: 'Markets & Rules', icon: Globe },
            { id: 'notifications', label: `Alerts (${unreadAdminAlerts.length})`, icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as AdminTab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                  tab === item.id
                    ? 'bg-[#D61A1E] border-[#D61A1E] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Analytics Overview (Computed Strictly from Real Firestore Records) */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Verified NGN Revenue</p>
                <p className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {formatMoney(analytics.ngRevenue, 'NGN')}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PSS Receivable: {formatMoney(analytics.pssReceivableNGN, 'NGN')}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Verified AUD Revenue</p>
                <p className="font-mono text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {formatMoney(analytics.auRevenue, 'AUD')}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PSS Receivable: {formatMoney(analytics.pssReceivableAUD, 'AUD')}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Pending Payment Verifications</p>
                <p className="font-mono text-2xl font-bold text-[#D61A1E] mt-1 tabular-nums">
                  {analytics.pendingVerifications}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total orders in database: {orders.length}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Active Foodstuff Subscriptions</p>
                <p className="font-mono text-2xl font-bold text-[#0B2D71] mt-1 tabular-nums">
                  {analytics.activeSubs}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total instalment plans: {paymentPlans.length}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                Order Volume by Checkout Type
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Pay Small Small Orders', count: analytics.byPaymentMode.pay_small_small, color: 'bg-[#D61A1E]' },
                  { label: 'Buy & Pay Now Orders', count: analytics.byPaymentMode.buy_now, color: 'bg-[#0B2D71]' },
                  { label: 'Subscription Orders', count: analytics.byPaymentMode.subscription, color: 'bg-slate-700' },
                ].map((bar) => {
                  const pct = orders.length > 0 ? Math.round((bar.count / orders.length) * 100) : 0;
                  return (
                    <div key={bar.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span>{bar.label}</span>
                        <span className="font-mono tabular-nums">{bar.count} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Products & Categories */}
        {tab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Catalog &amp; Cloudinary Product Management
              </h2>
              <button
                type="button"
                onClick={openNewProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D61A1E] text-white text-xs font-semibold rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">NGN (₦)</th>
                      <th className="px-4 py-3">AUD (A$)</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Pay Small Small</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <ProductImage
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-900">{prod.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-500">{prod.sku}</span>
                                {(!prod.images[0] || prod.images[0] === 'MANUAL_UPLOAD_REQUIRED') && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                    Needs Manual Image Upload
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{prod.subcategory}</td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                          {formatMoney(prod.priceNGN, 'NGN')}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                          {formatMoney(prod.priceAUD, 'AUD')}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums">{prod.stock}</td>
                        <td className="px-4 py-3">
                          {prod.pssEligible ? `Yes (${prod.pssMinDepositPercent || settings.pssDefaultDepositPercent}%)` : 'No'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(prod)}
                              className="text-[#0B2D71] font-semibold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="text-[#D61A1E] font-semibold hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Pay Small Small Plans & Rules */}
        {tab === 'pss' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Customer Pay Small Small Instalment Plans
                </h2>
                <p className="text-xs text-slate-500">
                  Release threshold: {settings.pssReleaseThresholdPercent}% · Default deposit:{' '}
                  {settings.pssDefaultDepositPercent}% (configure under Markets &amp; Rules)
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3">Order / Customer</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Next Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentPlans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No Pay Small Small plans created yet.
                      </td>
                    </tr>
                  ) : (
                    paymentPlans.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{p.orderNumber}</p>
                          <p className="text-[11px] text-slate-500">{p.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {p.frequency} ({p.paidInstalments}/{p.totalInstalments})
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                          {formatMoney(p.amountPaid, p.currency)}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-[#D61A1E] tabular-nums">
                          {formatMoney(p.balanceRemaining, p.currency)}
                        </td>
                        <td className="px-4 py-3">{formatShortDate(p.nextPaymentDate)}</td>
                        <td className="px-4 py-3 uppercase font-semibold">{p.status}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                sendReminder(
                                  p.customerEmail || '',
                                  p.userId,
                                  'pss_reminder',
                                  `Payment Reminder: ${p.orderNumber}`,
                                  `Your next Pay Small Small instalment of ${formatMoney(
                                    p.instalmentAmount,
                                    p.currency
                                  )} is scheduled for ${formatShortDate(
                                    p.nextPaymentDate
                                  )}. Remaining balance: ${formatMoney(p.balanceRemaining, p.currency)}.`,
                                  p.id
                                )
                              }
                              className="px-2.5 py-1 bg-[#0B2D71] text-white rounded font-semibold"
                            >
                              Send Reminder
                            </button>
                            {p.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => adminUpdatePaymentPlanStatus(p.id, 'overdue')}
                                className="px-2.5 py-1 border border-red-200 text-[#D61A1E] rounded font-semibold"
                              >
                                Flag Overdue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Subscriptions & Renewals */}
        {tab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Customer Foodstuff Subscriptions
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Cycle Price</th>
                      <th className="px-4 py-3">Next Renewal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Reminder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          No customer subscriptions active yet.
                        </td>
                      </tr>
                    ) : (
                      subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{sub.planName}</p>
                            <p className="text-[11px] text-slate-500 capitalize">{sub.frequency}</p>
                          </td>
                          <td className="px-4 py-3">{sub.customerEmail}</td>
                          <td className="px-4 py-3 font-mono font-bold tabular-nums">
                            {formatMoney(sub.pricePerCycle, sub.currency)}
                          </td>
                          <td className="px-4 py-3">{formatShortDate(sub.nextRenewalDate)}</td>
                          <td className="px-4 py-3 uppercase font-semibold">{sub.status}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                sendReminder(
                                  sub.customerEmail || '',
                                  sub.userId,
                                  'subscription_renewal',
                                  `Subscription Renewal Due: ${sub.planName}`,
                                  `Your ${sub.frequency} foodstuff subscription (${formatMoney(
                                    sub.pricePerCycle,
                                    sub.currency
                                  )}) renews on ${formatShortDate(
                                    sub.nextRenewalDate
                                  )}. Log in to renew or customize items.`,
                                  sub.id
                                )
                              }
                              className="px-2.5 py-1 bg-[#0B2D71] text-white rounded font-semibold"
                            >
                              Send Renewal Reminder
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="font-display text-base font-bold text-slate-900 mb-3">
                Preconfigured Subscription Templates ({subscriptionPackages.length})
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                {subscriptionPackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-900">{pkg.name}</p>
                    <p className="font-mono text-slate-700 mt-1 tabular-nums">
                      {formatMoney(pkg.priceNGN, 'NGN')} / {formatMoney(pkg.priceAUD, 'AUD')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Orders & Fulfilment Management */}
        {tab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Total / Paid</th>
                    <th className="px-4 py-3">Order Status</th>
                    <th className="px-4 py-3">Fulfilment Policy</th>
                    <th className="px-4 py-3">Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{ord.orderNumber}</p>
                          <p className="text-[11px] text-slate-500">{ord.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3 uppercase font-semibold text-[#0B2D71]">
                          {ord.paymentMode.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums">
                          <p>{formatMoney(ord.totalAmount, ord.currency)}</p>
                          <p className="text-[11px] text-slate-500">
                            Paid: {formatMoney(ord.amountPaid, ord.currency)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              adminUpdateOrder(ord.id, {
                                status: e.target.value as Order['status'],
                              })
                            }
                            className="px-2 py-1 border border-slate-300 rounded text-xs"
                          >
                            <option value="pending_verification">Pending Verification</option>
                            <option value="deposit_paid">Deposit Paid</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ord.fulfilmentStatus}
                            onChange={(e) =>
                              adminUpdateOrder(ord.id, {
                                fulfilmentStatus: e.target.value as Order['fulfilmentStatus'],
                              })
                            }
                            className="px-2 py-1 border border-slate-300 rounded text-xs"
                          >
                            <option value="locked_until_paid">Locked Until Paid</option>
                            <option value="eligible_for_dispatch">Eligible for Dispatch</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            defaultValue={ord.trackingCode || ''}
                            placeholder="Tracking code"
                            onBlur={(e) => {
                              if (e.target.value !== (ord.trackingCode || '')) {
                                adminUpdateOrder(ord.id, { trackingCode: e.target.value });
                              }
                            }}
                            className="px-2 py-1 border border-slate-300 rounded text-xs w-32"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Payment Verification & Transaction Ledger */}
        {tab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Gateway / Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-3">{formatShortDate(tx.createdAt)}</td>
                        <td className="px-4 py-3">{tx.customerEmail}</td>
                        <td className="px-4 py-3 font-mono">{tx.reference}</td>
                        <td className="px-4 py-3 uppercase">
                          {tx.gateway} · {tx.type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold tabular-nums">
                          {formatMoney(tx.amount, tx.currency)}
                        </td>
                        <td className="px-4 py-3 uppercase font-semibold">{tx.status.replace('_', ' ')}</td>
                        <td className="px-4 py-3">
                          {tx.status === 'pending_verification' ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => adminVerifyTransaction(tx, true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify &amp; Credit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => adminVerifyTransaction(tx, false)}
                                className="px-2.5 py-1 border border-red-200 text-[#D61A1E] rounded font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Coupons & Promotions */}
        {tab === 'coupons' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Active Coupons</h2>
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 text-xs"
                >
                  <div>
                    <p className="font-mono font-bold text-sm text-[#0B2D71]">{c.code}</p>
                    <p className="text-slate-600">
                      {c.discountType === 'percent' ? `${c.discountValue}% off` : `${c.discountValue} flat`} ·
                      Min spend ₦{(c.minSpendNGN || 0).toLocaleString()} / A${c.minSpendAUD || 0}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCoupon(c.code)}
                    className="p-2 text-slate-400 hover:text-[#D61A1E]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSaveCoupon}
              className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
            >
              <h3 className="font-display text-base font-bold text-slate-900">Create Coupon</h3>
              <input
                type="text"
                required
                placeholder="CODE (e.g. FESTIVE15)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newCoupon.discountType}
                  onChange={(e) =>
                    setNewCoupon((p) => ({
                      ...p,
                      discountType: e.target.value as 'percent' | 'fixed',
                    }))
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <input
                  type="number"
                  required
                  min={1}
                  value={newCoupon.discountValue}
                  onChange={(e) =>
                    setNewCoupon((p) => ({ ...p, discountValue: Number(e.target.value) }))
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg"
              >
                Save Coupon
              </button>
            </form>
          </div>
        )}

        {/* 8. Market, Currency & Pay Small Small Policy Settings */}
        {tab === 'settings' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveSettings}
              className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
            >
              <h2 className="font-display text-lg font-bold text-slate-900">
                Two-Market Pricing, Delivery &amp; Pay Small Small Rules
              </h2>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Exchange Rate (NGN per 1 AUD)
                  </label>
                  <input
                    type="number"
                    required
                    value={settingsForm.ngnPerAud}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, ngnPerAud: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nigeria Delivery Fee (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    value={settingsForm.ngDeliveryFee}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, ngDeliveryFee: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Australia Delivery Fee (AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settingsForm.auDeliveryFee}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, auDeliveryFee: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PSS Default Deposit (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={settingsForm.pssDefaultDepositPercent}
                    onChange={(e) =>
                      setSettingsForm((p) => ({
                        ...p,
                        pssDefaultDepositPercent: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PSS Min Order (NGN)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.pssMinOrderNGN}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, pssMinOrderNGN: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PSS Min Order (AUD)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.pssMinOrderAUD}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, pssMinOrderAUD: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dispatch Release Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={settingsForm.pssReleaseThresholdPercent}
                    onChange={(e) =>
                      setSettingsForm((p) => ({
                        ...p,
                        pssReleaseThresholdPercent: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Instalment Periods
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={settingsForm.pssMaxPeriods}
                    onChange={(e) =>
                      setSettingsForm((p) => ({ ...p, pssMaxPeriods: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subscription Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={settingsForm.subscriptionDiscountPercent}
                    onChange={(e) =>
                      setSettingsForm((p) => ({
                        ...p,
                        subscriptionDiscountPercent: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                <span className="font-semibold text-slate-700">Allowed Schedules:</span>
                {(['weekly', 'biweekly', 'monthly'] as InstalmentFrequency[]).map((f) => {
                  const active = settingsForm.pssAllowedFrequencies.includes(f);
                  return (
                    <label key={f} className="inline-flex items-center gap-1.5 capitalize">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          const next = active
                            ? settingsForm.pssAllowedFrequencies.filter((x) => x !== f)
                            : [...settingsForm.pssAllowedFrequencies, f];
                          if (next.length > 0) {
                            setSettingsForm((p) => ({ ...p, pssAllowedFrequencies: next }));
                          }
                        }}
                      />
                      <span>{f}</span>
                    </label>
                  );
                })}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg"
              >
                Save Store Configuration
              </button>
            </form>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-3 text-xs">
              <h3 className="font-display text-base font-bold text-slate-900">
                Gateway &amp; Integration Environment
              </h3>
              <p className="text-slate-500">
                Configure server credentials in Vercel Project Settings -&gt; Environment Variables.
                Secret values stay server-side and are never exposed in the storefront.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  { label: 'Firebase server-side settlement', ok: gatewayStatus.firebaseAdminConfigured },
                  { label: 'Scheduled subscription reminders', ok: gatewayStatus.subscriptionCronConfigured },
                  { label: 'KoraPay (Nigeria NGN)', ok: gatewayStatus.korapayConfigured },
                  { label: 'Paystack (Nigeria NGN)', ok: gatewayStatus.paystackConfigured },
                  { label: 'Flutterwave (Nigeria NGN)', ok: gatewayStatus.flutterwaveConfigured },
                  { label: 'Stripe (Australia AUD)', ok: gatewayStatus.stripeConfigured },
                  { label: 'Cloudinary Product Uploads', ok: gatewayStatus.cloudinaryConfigured },
                  { label: 'Resend Email Reminders', ok: gatewayStatus.emailConfigured },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <span className="font-medium text-slate-700">{row.label}</span>
                    <span
                      className={`font-semibold ${
                        row.ok ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {row.ok ? 'Configured' : 'Env Secret Needed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. Notifications */}
        {tab === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Admin Order, Payment &amp; Overdue Alerts
            </h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 py-6">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 text-xs ${
                    n.read ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatShortDate(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 overflow-y-auto p-4 flex items-center justify-center">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingProduct.name ? `Edit: ${editingProduct.name}` : 'Create Product'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, name: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={editingProduct.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setEditingProduct((p) =>
                      p
                        ? {
                            ...p,
                            categoryId: e.target.value,
                            subcategory: cat?.subcategories[0] || 'General',
                          }
                        : null
                    );
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">NGN Price (₦)</label>
                <input
                  type="number"
                  required
                  value={editingProduct.priceNGN}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, priceNGN: Number(e.target.value) } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">AUD Price (A$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingProduct.priceAUD}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, priceAUD: Number(e.target.value) } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Stock Qty</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, stock: Number(e.target.value) } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct((p) => (p ? { ...p, description: e.target.value } : null))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Cloudinary Upload + Image URL */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold">Product Image (Cloudinary Upload or URL)</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload via Cloudinary'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={editingProduct.images[0] || ''}
                  onChange={(e) =>
                    setEditingProduct((p) =>
                      p ? { ...p, images: [e.target.value, ...p.images.slice(1)] } : null
                    )
                  }
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.pssEligible}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, pssEligible: e.target.checked } : null))
                  }
                />
                <span>Pay Small Small Eligible</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.subscriptionEligible}
                  onChange={(e) =>
                    setEditingProduct((p) =>
                      p ? { ...p, subscriptionEligible: e.target.checked } : null
                    )
                  }
                />
                <span>Subscription Eligible</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.featured)}
                  onChange={(e) =>
                    setEditingProduct((p) => (p ? { ...p, featured: e.target.checked } : null))
                  }
                />
                <span>Featured Product</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#D61A1E] text-white rounded-lg text-xs font-semibold"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
