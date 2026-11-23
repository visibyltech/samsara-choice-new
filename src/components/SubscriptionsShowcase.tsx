import React, { useMemo, useState } from 'react';
import { Check, Minus, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  Address,
  InstalmentFrequency,
  PaymentGateway,
  SubscriptionItemEntry,
  SubscriptionPackage,
} from '../types';
import { formatMoney, getProductPrice } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface SubscriptionsShowcaseProps {
  onRequireAuth: () => void;
  onSuccessNavigateAccount: () => void;
}

export function SubscriptionsShowcase({
  onRequireAuth,
  onSuccessNavigateAccount,
}: SubscriptionsShowcaseProps) {
  const {
    user,
    userProfile,
    products,
    subscriptionPackages,
    market,
    currency,
    settings,
    gatewayStatus,
    createSubscription,
    showToast,
  } = useStore();

  const [mode, setMode] = useState<'packages' | 'custom'>('packages');
  const [selectedFreq, setSelectedFreq] = useState<InstalmentFrequency>('monthly');
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>(() => ({
    'sm-royal-stallion-parboiled-rice-50-kg': 1,
    'sm-beans-oloyin-4-l': 1,
    'sm-palm-oil-5-l': 1,
  }));

  const [checkoutTarget, setCheckoutTarget] = useState<{
    packageId?: string;
    planName: string;
    isCustom: boolean;
    items: SubscriptionItemEntry[];
    pricePerCycle: number;
  } | null>(null);

  const [subFreq, setSubFreq] = useState<InstalmentFrequency>('monthly');
  const [autoRenew, setAutoRenew] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>(
    market === 'NG' ? 'paystack' : 'stripe'
  );
  const [manualRef, setManualRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const defaultAddr = userProfile?.addresses?.find((a) => a.market === market) || userProfile?.addresses?.[0];
  const [addrForm, setAddrForm] = useState<Address>({
    id: 'sub-addr',
    label: 'Home',
    fullName: defaultAddr?.fullName || user?.displayName || '',
    phone: defaultAddr?.phone || '',
    street: defaultAddr?.street || '',
    city: defaultAddr?.city || (market === 'NG' ? 'Lagos' : 'Sydney'),
    state: defaultAddr?.state || (market === 'NG' ? 'Lagos' : 'NSW'),
    postalCode: defaultAddr?.postalCode || '',
    country: market === 'NG' ? 'Nigeria' : 'Australia',
    market,
  });

  const subEligibleProducts = useMemo(
    () => products.filter((p) => p.subscriptionEligible),
    [products]
  );

  const customItemsList: SubscriptionItemEntry[] = useMemo(() => {
    return Object.entries(customQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const prod = products.find((p) => p.id === productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          name: prod.name,
          quantity,
          unitPriceNGN: prod.priceNGN,
          unitPriceAUD: prod.priceAUD,
        };
      })
      .filter(Boolean) as SubscriptionItemEntry[];
  }, [customQuantities, products]);

  const customRawSubtotal = useMemo(() => {
    return customItemsList.reduce((sum, entry) => {
      const unit =
        market === 'NG'
          ? entry.unitPriceNGN
          : entry.unitPriceAUD || Math.round((entry.unitPriceNGN / settings.ngnPerAud) * 100) / 100;
      return sum + unit * entry.quantity;
    }, 0);
  }, [customItemsList, market, settings.ngnPerAud]);

  const discountFactor = 1 - (settings.subscriptionDiscountPercent || 8) / 100;
  const customDiscountedTotal =
    currency === 'NGN'
      ? Math.round(customRawSubtotal * discountFactor)
      : Math.round(customRawSubtotal * discountFactor * 100) / 100;

  const openPackageCheckout = (pkg: SubscriptionPackage) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    const basePrice =
      market === 'NG'
        ? pkg.priceNGN
        : pkg.priceAUD || Math.round((pkg.priceNGN / settings.ngnPerAud) * 100) / 100;
    setSubFreq(pkg.frequencyOptions[0] || 'monthly');
    setPaymentMethod(market === 'NG' ? 'paystack' : 'stripe');
    setCheckoutTarget({
      packageId: pkg.id,
      planName: pkg.name,
      isCustom: false,
      pricePerCycle: basePrice,
      items: pkg.items.map((label, idx) => ({
        productId: `pkg-item-${idx}`,
        name: label,
        quantity: 1,
        unitPriceNGN: Math.round(pkg.priceNGN / pkg.items.length),
        unitPriceAUD: Math.round((pkg.priceAUD / pkg.items.length) * 100) / 100,
      })),
    });
  };

  const openCustomCheckout = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (customItemsList.length === 0) {
      showToast('Select at least one foodstuff item for your custom subscription.', 'error');
      return;
    }
    setSubFreq(selectedFreq);
    setPaymentMethod(market === 'NG' ? 'paystack' : 'stripe');
    setCheckoutTarget({
      planName: `Custom ${selectedFreq.charAt(0).toUpperCase() + selectedFreq.slice(1)} Pantry Box`,
      isCustom: true,
      items: customItemsList,
      pricePerCycle: customDiscountedTotal,
    });
  };

  const handleConfirmSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTarget) return;
    if (!addrForm.fullName || !addrForm.phone || !addrForm.street || !addrForm.city) {
      showToast('Please complete your delivery address details.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createSubscription({
        packageId: checkoutTarget.packageId,
        planName: checkoutTarget.planName,
        isCustom: checkoutTarget.isCustom,
        frequency: subFreq,
        items: checkoutTarget.items,
        pricePerCycle: checkoutTarget.pricePerCycle,
        autoRenew,
        paymentMethod,
        shippingAddress: {
          ...addrForm,
          country: market === 'NG' ? 'Nigeria' : 'Australia',
          market,
        },
        manualTransferRef: manualRef,
      });
      setCheckoutTarget(null);
      if (res.redirectUrl) {
        window.location.assign(res.redirectUrl);
      } else {
        onSuccessNavigateAccount();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to activate subscription.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="subscriptions" className="py-8 sm:py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B2D71] mb-1">
              Automated Pantry Restock · Save {settings.subscriptionDiscountPercent}%
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Weekly &amp; Monthly Foodstuff Subscriptions
            </h2>
          </div>

          <div className="inline-flex items-center bg-slate-200/80 p-1 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setMode('packages')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'packages'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Preconfigured Bundles
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'custom'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Build Custom Box
            </button>
          </div>
        </div>

        {mode === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {subscriptionPackages
              .filter((p) => p.active)
              .map((pkg) => {
                const price =
                  market === 'NG'
                    ? pkg.priceNGN
                    : pkg.priceAUD || Math.round((pkg.priceNGN / settings.ngnPerAud) * 100) / 100;
                return (
                  <article
                    key={pkg.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-white border-b border-slate-100 p-3 overflow-hidden">
                        <ProductImage
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="p-6">
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          {pkg.frequencyOptions.join(' / ')} delivery · {market === 'NG' ? 'Nigeria' : 'Australia'}
                        </p>
                        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                          {pkg.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                        <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-4">
                          {pkg.items.map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#0B2D71] shrink-0 mt-0.5" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <div className="flex items-baseline justify-between py-3 border-t border-slate-100 mb-3">
                        <span className="text-xs text-slate-500">Per Cycle</span>
                        <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                          {formatMoney(price, currency)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPackageCheckout(pkg)}
                        className="w-full py-3 px-4 bg-[#0B2D71] hover:bg-[#082257] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Subscribe Now</span>
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Customise Your Recurring Foodstuff Box
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pick your preferred items and quantities. Automatic {settings.subscriptionDiscountPercent}% discount applied.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    {(['weekly', 'biweekly', 'monthly'] as InstalmentFrequency[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFreq(f)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                          selectedFreq === f
                            ? 'bg-[#0B2D71] text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {subEligibleProducts.map((prod) => {
                    const qty = customQuantities[prod.id] || 0;
                    const price = getProductPrice(prod, market, settings);
                    return (
                      <div
                        key={prod.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                          qty > 0 ? 'border-[#0B2D71] bg-blue-50/30' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductImage
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {prod.name}
                            </p>
                            <p className="font-mono text-xs text-slate-600 tabular-nums">
                              {formatMoney(price, currency)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setCustomQuantities((prev) => ({
                                ...prev,
                                [prod.id]: Math.max(0, (prev[prod.id] || 0) - 1),
                              }))
                            }
                            aria-label="Decrease quantity"
                            className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-bold tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCustomQuantities((prev) => ({
                                ...prev,
                                [prod.id]: (prev[prod.id] || 0) + 1,
                              }))
                            }
                            aria-label="Increase quantity"
                            className="w-8 h-8 rounded-md border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    Custom Box Summary ({selectedFreq})
                  </h4>
                  {customItemsList.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6">
                      Add items on the left to build your recurring foodstuff bundle.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs text-slate-700 mb-4 max-h-52 overflow-y-auto">
                      {customItemsList.map((it) => (
                        <li key={it.productId} className="flex justify-between gap-2">
                          <span className="truncate">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-mono shrink-0 tabular-nums">
                            {formatMoney(
                              (market === 'NG' ? it.unitPriceNGN : it.unitPriceAUD) * it.quantity,
                              currency
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Regular Price</span>
                    <span className="font-mono line-through tabular-nums">
                      {formatMoney(customRawSubtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-800">
                      Subscriber Price (-{settings.subscriptionDiscountPercent}%)
                    </span>
                    <span className="font-mono text-xl font-bold text-[#D61A1E] tabular-nums">
                      {formatMoney(customDiscountedTotal, currency)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={openCustomCheckout}
                    className="w-full mt-2 py-3 px-4 bg-[#D61A1E] hover:bg-[#B51418] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Activate Custom Subscription</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Checkout Modal */}
      {checkoutTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold text-[#0B2D71] uppercase tracking-wider">
                  Activate Foodstuff Subscription
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                  {checkoutTarget.planName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubscription} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Frequency
                  </label>
                  <select
                    value={subFreq}
                    onChange={(e) => setSubFreq(e.target.value as InstalmentFrequency)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="weekly">Weekly (Every 7 days)</option>
                    <option value="biweekly">Biweekly (Every 14 days)</option>
                    <option value="monthly">Monthly (Every 30 days)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cycle Amount
                  </label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {formatMoney(checkoutTarget.pricePerCycle, currency)}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B2D71]"
                />
                <span>
                  Enable automatic renewal reminders &amp; recurring schedule (you can pause or
                  cancel anytime in your Account).
                </span>
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Recipient Full Name"
                  value={addrForm.fullName}
                  onChange={(e) => setAddrForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm((p) => ({ ...p, phone: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Street Address & Landmark"
                value={addrForm.street}
                onChange={(e) => setAddrForm((p) => ({ ...p, street: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={addrForm.city}
                  onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={addrForm.state}
                  onChange={(e) => setAddrForm((p) => ({ ...p, state: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method ({market === 'NG' ? 'Nigeria NGN' : 'Australia AUD'})
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentGateway)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {market === 'NG' ? (
                    <>
                      <option value="paystack">
                        Paystack Card / Bank {gatewayStatus.paystackConfigured ? '' : '(Gateway Setup Pending)'}
                      </option>
                      <option value="flutterwave">Flutterwave NGN</option>
                      <option value="bank_transfer">Direct Nigerian Bank Transfer (Manual Verification)</option>
                    </>
                  ) : (
                    <>
                      <option value="stripe">
                        Stripe Card / Apple Pay {gatewayStatus.stripeConfigured ? '' : '(Gateway Setup Pending)'}
                      </option>
                      <option value="payid">Australian PayID Instant Transfer (Manual Verification)</option>
                    </>
                  )}
                </select>
              </div>

              {(paymentMethod === 'bank_transfer' || paymentMethod === 'payid') && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-slate-700 space-y-2">
                  <p className="font-semibold text-[#0B2D71]">
                    {market === 'NG'
                      ? 'Samsara Choice Ltd · Zenith Bank · Acct: 1228407810 (NGN)'
                      : 'Samsara Choice Pty · PayID: pay@samsarachoice.com.au (AUD)'}
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Enter Transfer Reference / Receipt ID"
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutTarget(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#D61A1E] hover:bg-[#B51418] rounded-lg disabled:opacity-60"
                >
                  {submitting ? 'Activating...' : `Start Subscription (${formatMoney(checkoutTarget.pricePerCycle, currency)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
