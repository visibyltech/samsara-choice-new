import React, { useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Heart,
  LogOut,
  MapPin,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address, CustomerSubscription, PaymentGateway, PaymentPlan, Transaction } from '../types';
import { formatMoney, formatShortDate, getProductPrice } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface CustomerDashboardProps {
  onBackToStore: () => void;
}

type AccountTab = 'pss' | 'subscriptions' | 'orders' | 'receipts' | 'addresses' | 'wishlist';

export function CustomerDashboard({ onBackToStore }: CustomerDashboardProps) {
  const {
    user,
    userProfile,
    market,
    currency,
    settings,
    products,
    orders,
    paymentPlans,
    subscriptions,
    transactions,
    notifications,
    logout,
    payInstalment,
    updateSubscriptionStatus,
    renewSubscriptionNow,
    sendReminder,
    markNotificationRead,
    saveAddress,
    deleteAddress,
    addToCart,
    toggleWishlist,
    showToast,
  } = useStore();

  const [tab, setTab] = useState<AccountTab>('pss');
  const [payingPlan, setPayingPlan] = useState<{ plan: PaymentPlan; payFull: boolean } | null>(null);
  const [renewingSub, setRenewingSub] = useState<CustomerSubscription | null>(null);
  const [gateway, setGateway] = useState<PaymentGateway>(market === 'NG' ? 'paystack' : 'stripe');
  const [manualRef, setManualRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const [newAddr, setNewAddr] = useState<Address>({
    id: '',
    label: 'Home',
    fullName: user?.displayName || '',
    phone: '',
    street: '',
    city: market === 'NG' ? 'Lagos' : 'Sydney',
    state: market === 'NG' ? 'Lagos' : 'NSW',
    postalCode: '',
    country: market === 'NG' ? 'Nigeria' : 'Australia',
    market,
  });

  if (!user) return null;

  const customerNotifications = notifications.filter((n) => n.userId === user.uid);
  const wishlistProducts = products.filter((p) => userProfile?.wishlist?.includes(p.id));

  const handlePayPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPlan) return;
    setProcessing(true);
    try {
      const res = await payInstalment(payingPlan.plan, payingPlan.payFull, gateway, manualRef);
      setPayingPlan(null);
      setManualRef('');
      if (res.redirectUrl) window.location.assign(res.redirectUrl);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to submit payment.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingSub) return;
    setProcessing(true);
    try {
      const res = await renewSubscriptionNow(renewingSub, gateway, manualRef);
      setRenewingSub(null);
      setManualRef('');
      if (res.redirectUrl) window.location.assign(res.redirectUrl);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to renew subscription.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAddress({
      ...newAddr,
      id: `addr-${Date.now()}`,
      country: newAddr.market === 'NG' ? 'Nigeria' : 'Australia',
    });
    setNewAddr((p) => ({ ...p, street: '', phone: '', postalCode: '' }));
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Account Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B2D71] mb-1">
              Customer Account Portal
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {user.displayName || user.email}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.email} · {user.emailVerified ? 'Verified Account' : 'Email Unverified'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStore}
              className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Automatic Payment & Renewal Reminders Banner */}
        {customerNotifications.filter((n) => !n.read).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#D61A1E]">
              <Bell className="w-4 h-4" />
              <span>Reminders &amp; Account Alerts</span>
            </div>
            {customerNotifications
              .filter((n) => !n.read)
              .slice(0, 4)
              .map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    <p className="text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#0B2D71] hover:underline shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'pss', label: `Pay Small Small (${paymentPlans.length})`, icon: CalendarClock },
            { id: 'subscriptions', label: `Subscriptions (${subscriptions.length})`, icon: RefreshCw },
            { id: 'orders', label: `Orders & Tracking (${orders.length})`, icon: Package },
            { id: 'receipts', label: `Receipts (${transactions.length})`, icon: Receipt },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'wishlist', label: `Wishlist (${wishlistProducts.length})`, icon: Heart },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as AccountTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                  tab === item.id
                    ? 'bg-[#0B2D71] border-[#0B2D71] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Pay Small Small Instalment Plans */}
        {tab === 'pss' && (
          <div className="space-y-4">
            {paymentPlans.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-base font-semibold text-slate-900 mb-1">
                  No Pay Small Small plans yet
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Select Pay Small Small at checkout on eligible rice, foodstuffs, or bundles to
                  spread payments weekly, biweekly, or monthly.
                </p>
                <button
                  type="button"
                  onClick={onBackToStore}
                  className="px-5 py-2.5 bg-[#D61A1E] text-white text-xs font-semibold rounded-lg"
                >
                  Explore Eligible Foodstuffs
                </button>
              </div>
            ) : (
              paymentPlans.map((plan) => {
                const progressPct =
                  plan.totalAmount > 0
                    ? Math.min(100, Math.round((plan.amountPaid / plan.totalAmount) * 100))
                    : 0;
                const isCompleted = plan.status === 'completed' || plan.balanceRemaining <= 0.01;

                return (
                  <div
                    key={plan.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Order {plan.orderNumber} · {plan.frequency} schedule · Status:{' '}
                          <span className="font-bold text-[#0B2D71] uppercase">{plan.status.replace('_', ' ')}</span>
                        </p>
                        <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                          Total Plan Value: {formatMoney(plan.totalAmount, plan.currency)}
                        </h3>
                      </div>

                      {!isCompleted && plan.status !== 'cancelled' && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGateway(plan.market === 'NG' ? 'paystack' : 'stripe');
                              setPayingPlan({ plan, payFull: false });
                            }}
                            className="px-4 py-2 bg-[#D61A1E] hover:bg-[#B51418] text-white text-xs font-semibold rounded-lg"
                          >
                            Pay Next Instalment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setGateway(plan.market === 'NG' ? 'paystack' : 'stripe');
                              setPayingPlan({ plan, payFull: true });
                            }}
                            className="px-4 py-2 bg-[#0B2D71] hover:bg-[#082257] text-white text-xs font-semibold rounded-lg"
                          >
                            Pay Full Balance
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              sendReminder(
                                user.email || '',
                                user.uid,
                                'pss_reminder',
                                `Pay Small Small Reminder (${plan.orderNumber})`,
                                `Next instalment of ${formatMoney(
                                  plan.instalmentAmount,
                                  plan.currency
                                )} is due on ${formatShortDate(
                                  plan.nextPaymentDate
                                )}. Outstanding balance: ${formatMoney(
                                  plan.balanceRemaining,
                                  plan.currency
                                )}.`,
                                plan.id
                              )
                            }
                            className="px-3 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                          >
                            Send Me Reminder
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-700 tabular-nums">
                          Paid: {formatMoney(plan.amountPaid, plan.currency)} ({progressPct}%)
                        </span>
                        <span className="text-[#D61A1E] tabular-nums">
                          Remaining: {formatMoney(plan.balanceRemaining, plan.currency)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isCompleted ? 'bg-emerald-600' : 'bg-[#D61A1E]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Next Payment Date: <strong>{formatShortDate(plan.nextPaymentDate)}</strong>{' '}
                        · Fulfilment releases at {plan.releaseThresholdPercent}% paid
                      </p>
                    </div>

                    {/* Schedule Breakdown */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {(plan.schedule || []).map((step) => (
                        <div
                          key={step.index}
                          className={`p-3 rounded-xl border text-xs ${
                            step.status === 'paid'
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span>Instalment #{step.index}</span>
                            <span className="uppercase text-[10px]">{step.status}</span>
                          </div>
                          <p className="font-mono font-bold text-slate-900 tabular-nums">
                            {formatMoney(step.amount, plan.currency)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Due {formatShortDate(step.dueDate)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Subscriptions */}
        {tab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-base font-semibold text-slate-900 mb-1">
                  No active foodstuff subscriptions
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Subscribe weekly or monthly to preconfigured or custom pantry boxes.
                </p>
                <button
                  type="button"
                  onClick={onBackToStore}
                  className="px-5 py-2.5 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg"
                >
                  Browse Subscription Bundles
                </button>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-medium text-slate-500 capitalize">
                        {sub.frequency} Subscription · {sub.market === 'NG' ? 'Nigeria' : 'Australia'} · Status:{' '}
                        <strong className="text-[#0B2D71] uppercase">{sub.status === 'pending_payment' ? 'AWAITING PAYMENT' : sub.status}</strong>
                      </p>
                      <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                        {sub.planName} —{' '}
                        <span className="font-mono tabular-nums">
                          {formatMoney(sub.pricePerCycle, sub.currency)}
                        </span>
                        /cycle
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {sub.status !== 'cancelled' && sub.status !== 'pending_payment' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setGateway(sub.market === 'NG' ? 'paystack' : 'stripe');
                              setRenewingSub(sub);
                            }}
                            className="px-3.5 py-2 bg-[#D61A1E] text-white text-xs font-semibold rounded-lg"
                          >
                            Renew Cycle Now
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateSubscriptionStatus(
                                sub.id,
                                sub.status === 'paused' ? 'active' : 'paused'
                              )
                            }
                            className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                          >
                            {sub.status === 'paused' ? 'Resume' : 'Pause'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSubscriptionStatus(sub.id, 'cancelled')}
                            className="px-3.5 py-2 border border-red-200 text-[#D61A1E] text-xs font-semibold rounded-lg hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500">Next Delivery Date</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {formatShortDate(sub.nextDeliveryDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Next Renewal Date</p>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {formatShortDate(sub.nextRenewalDate)} ({sub.autoRenew ? 'Auto-Reminder On' : 'Manual'})
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cycles Completed</p>
                      <p className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                        {sub.renewalCount}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700">
                    <p className="font-semibold mb-1">Bundle Items:</p>
                    <p>{sub.items.map((it) => `${it.quantity}x ${it.name}`).join(' · ')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Orders & Delivery Tracking */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
                No orders placed yet.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">
                        {ord.orderNumber} · {formatShortDate(ord.createdAt)} ·{' '}
                        <span className="uppercase font-semibold text-[#0B2D71]">
                          {ord.paymentMode.replace(/_/g, ' ')}
                        </span>
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        Status: {ord.status.replace(/_/g, ' ').toUpperCase()} · Fulfilment:{' '}
                        {ord.fulfilmentStatus.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {formatMoney(ord.totalAmount, ord.currency)}
                      </p>
                      {ord.balanceRemaining > 0 && (
                        <p className="font-mono text-xs text-[#D61A1E] tabular-nums">
                          Balance: {formatMoney(ord.balanceRemaining, ord.currency)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name} ({item.variant})
                        </span>
                        <span className="font-mono tabular-nums">
                          {formatMoney(item.unitPrice * item.quantity, ord.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.trackingCode && (
                    <p className="text-xs text-[#0B2D71] font-semibold">
                      Tracking Number: {ord.trackingCode}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Payment Receipts */}
        {tab === 'receipts' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Reference</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Gateway</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-5 py-3.5 text-slate-600">{formatShortDate(tx.createdAt)}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-900">{tx.reference}</td>
                        <td className="px-5 py-3.5 capitalize">{tx.type.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3.5 uppercase">{tx.gateway}</td>
                        <td className="px-5 py-3.5 font-mono font-bold tabular-nums">
                          {formatMoney(tx.amount, tx.currency)}
                        </td>
                        <td className="px-5 py-3.5 uppercase font-semibold">{tx.status.replace('_', ' ')}</td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setReceiptTx(tx)}
                            className="text-[#0B2D71] font-semibold hover:underline"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Saved Addresses */}
        {tab === 'addresses' && (
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              {(userProfile?.addresses || []).length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-sm text-slate-500">
                  No saved addresses yet. Add a Nigeria or Australia delivery address on the right.
                </div>
              ) : (
                (userProfile?.addresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-900">
                        {addr.label} · {addr.country}
                      </p>
                      <p className="text-slate-700">{addr.fullName} ({addr.phone})</p>
                      <p className="text-slate-600">
                        {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="p-2 text-slate-400 hover:text-[#D61A1E]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleSaveAddress}
              className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
            >
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D61A1E]" />
                <span>Add Delivery Address</span>
              </h3>
              <select
                value={newAddr.market}
                onChange={(e) =>
                  setNewAddr((p) => ({
                    ...p,
                    market: e.target.value as 'NG' | 'AU',
                    country: e.target.value === 'NG' ? 'Nigeria' : 'Australia',
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="NG">Nigeria</option>
                <option value="AU">Australia</option>
              </select>
              <input
                type="text"
                required
                placeholder="Label (e.g. Home, Parents Lagos, Office)"
                value={newAddr.label}
                onChange={(e) => setNewAddr((p) => ({ ...p, label: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                type="text"
                required
                placeholder="Recipient Full Name"
                value={newAddr.fullName}
                onChange={(e) => setNewAddr((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={newAddr.phone}
                onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                type="text"
                required
                placeholder="Street Address"
                value={newAddr.street}
                onChange={(e) => setNewAddr((p) => ({ ...p, street: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={newAddr.state}
                  onChange={(e) => setNewAddr((p) => ({ ...p, state: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg"
              >
                Save Address
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Wishlist */}
        {tab === 'wishlist' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
                Your wishlist is empty. Tap the heart icon on any product to save it here.
              </div>
            ) : (
              wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-4 space-y-3"
                >
                  <ProductImage
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full aspect-[4/3] rounded-xl object-cover"
                  />
                  <h4 className="font-semibold text-sm text-slate-900">{p.name}</h4>
                  <p className="font-mono text-sm font-bold text-[#0B2D71] tabular-nums">
                    {formatMoney(getProductPrice(p, market, settings), currency)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      className="flex-1 py-2 bg-[#D61A1E] text-white text-xs font-semibold rounded-lg"
                    >
                      Move to Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      className="px-3 py-2 border border-slate-200 text-xs rounded-lg text-slate-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal: Pay Next Instalment / Full Balance */}
      {payingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handlePayPlanSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">
              {payingPlan.payFull ? 'Pay Remaining Plan Balance' : 'Pay Next Instalment'}
            </h3>
            <p className="text-xs text-slate-600">
              Order {payingPlan.plan.orderNumber} · Amount:{' '}
              <strong className="font-mono text-[#D61A1E]">
                {formatMoney(
                  payingPlan.payFull
                    ? payingPlan.plan.balanceRemaining
                    : Math.min(payingPlan.plan.balanceRemaining, payingPlan.plan.instalmentAmount),
                  payingPlan.plan.currency
                )}
              </strong>
            </p>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as PaymentGateway)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {payingPlan.plan.market === 'NG' ? (
                <>
                  <option value="paystack">Paystack (NGN)</option>
                  <option value="flutterwave">Flutterwave (NGN)</option>
                  <option value="bank_transfer">Nigerian Bank Transfer</option>
                </>
              ) : (
                <>
                  <option value="stripe">Stripe (AUD)</option>
                  <option value="payid">Australian PayID</option>
                </>
              )}
            </select>
            {(gateway === 'bank_transfer' || gateway === 'payid') && (
              <input
                type="text"
                required
                placeholder="Enter Bank / PayID Transfer Reference"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingPlan(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-[#D61A1E] text-white rounded-lg text-xs font-semibold"
              >
                {processing ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Renew Subscription */}
      {renewingSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleRenewSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">
              Renew Subscription Cycle
            </h3>
            <p className="text-xs text-slate-600">
              {renewingSub.planName} ·{' '}
              <strong className="font-mono">
                {formatMoney(renewingSub.pricePerCycle, renewingSub.currency)}
              </strong>
            </p>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as PaymentGateway)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {renewingSub.market === 'NG' ? (
                <>
                  <option value="paystack">Paystack (NGN)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </>
              ) : (
                <>
                  <option value="stripe">Stripe (AUD)</option>
                  <option value="payid">PayID</option>
                </>
              )}
            </select>
            {(gateway === 'bank_transfer' || gateway === 'payid') && (
              <input
                type="text"
                required
                placeholder="Transfer Reference"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenewingSub(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-[#0B2D71] text-white rounded-lg text-xs font-semibold"
              >
                {processing ? 'Renewing...' : 'Confirm Renewal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Printable Receipt */}
      {receiptTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-bold text-[#D61A1E]">SAMSARA CHOICE LTD</p>
                <p className="text-xs text-slate-500">RC NO: 8240781 · Official Payment Receipt</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-[#0B2D71]" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-semibold">{receiptTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{formatShortDate(receiptTx.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Type</span>
                <span className="capitalize">{receiptTx.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway</span>
                <span className="uppercase">{receiptTx.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Status</span>
                <span className="uppercase font-bold">{receiptTx.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                <span>Amount</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(receiptTx.amount, receiptTx.currency)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="px-4 py-2 bg-[#0B2D71] text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
