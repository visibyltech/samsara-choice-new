import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CreditCard, Lock, ShieldCheck, Tag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address, InstalmentFrequency, PaymentGateway, PaymentMode } from '../types';
import {
  calculatePaySmallSmall,
  formatMoney,
  formatShortDate,
  getProductPrice,
} from '../utils/currency';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
  onOrderComplete: () => void;
  initialPaymentMode?: PaymentMode;
  initialDailyPaymentAmount?: number;
  initialDepositPercent?: number;
}

export function CheckoutModal({
  open,
  onClose,
  onRequireAuth,
  onOrderComplete,
  initialPaymentMode = 'buy_now',
  initialDailyPaymentAmount,
  initialDepositPercent,
}: CheckoutModalProps) {
  const {
    user,
    userProfile,
    cart,
    market,
    currency,
    settings,
    gatewayStatus,
    validateCoupon,
    placeOrder,
    resendVerification,
    showToast,
  } = useStore();

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + getProductPrice(item, market, settings) * item.quantity,
        0
      ),
    [cart, market, settings]
  );

  const allPssEligible = cart.length > 0 && cart.every((c) => c.pssEligible);
  const canUsePaySmallSmall = settings.pssEnabled && allPssEligible;

  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    canUsePaySmallSmall ? 'pay_small_small' : 'buy_now'
  );
  const [pssFrequency, setPssFrequency] = useState<InstalmentFrequency>('weekly');
  const [pssDailyPaymentAmount, setPssDailyPaymentAmount] = useState<number>(market === 'NG' ? 500 : 5);
  const [pssPeriods, setPssPeriods] = useState<number>(3);
  const [pssDepositPct, setPssDepositPct] = useState<number>(settings.pssDefaultDepositPercent);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>(
    market === 'NG' ? 'korapay' : 'stripe'
  );

  useEffect(() => {
    setPaymentMethod(market === 'NG' ? 'korapay' : 'stripe');
    setPssDailyPaymentAmount(market === 'NG' ? 500 : 5);
  }, [market]);

  useEffect(() => {
    if (!open) return;
    setPaymentMode(initialPaymentMode === 'pay_small_small' && canUsePaySmallSmall ? 'pay_small_small' : initialPaymentMode);
    setPssDepositPct(initialDepositPercent || settings.pssDefaultDepositPercent);
    if (initialDailyPaymentAmount) {
      setPssFrequency('daily');
      setPssDailyPaymentAmount(initialDailyPaymentAmount);
    } else {
      setPssFrequency('weekly');
    }
  }, [open, initialPaymentMode, initialDailyPaymentAmount, initialDepositPercent, canUsePaySmallSmall, settings.pssDefaultDepositPercent]);

  const [manualRef, setManualRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const savedAddresses = (userProfile?.addresses || []).filter((a) => a.market === market);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0]?.id || 'new');

  const [addrForm, setAddrForm] = useState<Address>({
    id: `addr-${Date.now()}`,
    label: 'Primary Delivery',
    fullName: user?.displayName || '',
    phone: userProfile?.phone || '',
    street: '',
    city: market === 'NG' ? 'Lagos' : 'Sydney',
    state: market === 'NG' ? 'Lagos' : 'NSW',
    postalCode: '',
    country: market === 'NG' ? 'Nigeria' : 'Australia',
    market,
  });

  if (!open) return null;

  const discountAmount = appliedCoupon?.discount || 0;
  const freeThreshold =
    market === 'NG' ? settings.ngFreeDeliveryThreshold : settings.auFreeDeliveryThreshold;
  const baseDeliveryFee = market === 'NG' ? settings.ngDeliveryFee : settings.auDeliveryFee;
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseDeliveryFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const effectiveMode: PaymentMode =
    paymentMode === 'pay_small_small' && canUsePaySmallSmall ? 'pay_small_small' : 'buy_now';

  const estimatedDeposit = currency === 'NGN' ? Math.round((grandTotal * pssDepositPct) / 100) : Math.round((grandTotal * pssDepositPct / 100) * 100) / 100;
  const effectivePssPeriods = pssFrequency === 'daily' ? Math.max(1, Math.ceil(Math.max(0, grandTotal - estimatedDeposit) / Math.max(1, pssDailyPaymentAmount))) : pssPeriods;
  const pssBreakdown = calculatePaySmallSmall(grandTotal, pssDepositPct, pssFrequency, effectivePssPeriods, currency, new Date(), pssFrequency === 'daily' ? pssDailyPaymentAmount : undefined);

  const amountDueNow =
    effectiveMode === 'pay_small_small' ? pssBreakdown.depositAmount : grandTotal;

  const activeShippingAddress: Address =
    selectedAddressId !== 'new'
      ? savedAddresses.find((a) => a.id === selectedAddressId) || addrForm
      : {
          ...addrForm,
          country: market === 'NG' ? 'Nigeria' : 'Australia',
          market,
        };

  const handleApplyCoupon = async () => {
    const res = await validateCoupon(couponInput, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon({ code: res.coupon.code, discount: res.discount });
      setCouponMsg(`Applied ${res.coupon.code} (-${formatMoney(res.discount, currency)})`);
    } else {
      setAppliedCoupon(null);
      setCouponMsg(res.error || 'Coupon not valid');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!user.emailVerified) {
      showToast('Please verify your email address before completing checkout.', 'error');
      return;
    }
    if (
      !activeShippingAddress.fullName ||
      !activeShippingAddress.phone ||
      !activeShippingAddress.street ||
      !activeShippingAddress.city
    ) {
      showToast('Please enter a complete delivery address.', 'error');
      return;
    }
    if (
      (paymentMethod === 'bank_transfer' || paymentMethod === 'payid') &&
      manualRef.trim().length < 4
    ) {
      showToast('Please enter your bank transfer / PayID reference ID.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrder({
        paymentMode: effectiveMode,
        paymentMethod,
        shippingAddress: activeShippingAddress,
        couponCode: appliedCoupon?.code,
        discountAmount,
        deliveryFee,
        pssDepositPercent: pssDepositPct,
        pssFrequency,
        pssPeriods: effectivePssPeriods,
        ...(pssFrequency === 'daily' ? { pssDailyPaymentAmount } : {}),
        manualTransferRef: manualRef,
      });
      onClose();
      if (result.redirectUrl) {
        window.location.assign(result.redirectUrl);
      } else {
        onOrderComplete();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Checkout failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 overflow-y-auto p-3 sm:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl my-2 sm:my-4">
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B2D71]">
              Samsara Choice Checkout · {market === 'NG' ? 'Nigeria (NGN ₦)' : 'Australia (AUD A$)'}
            </p>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Choose Payment Plan &amp; Complete Order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 text-[10px] sm:text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#0B2D71]"><span className="w-5 h-5 rounded-full bg-[#0B2D71] text-white inline-flex items-center justify-center text-[10px]">1</span> Bag</div>
          <div className="flex items-center gap-1.5 text-[#0B2D71]"><span className="w-5 h-5 rounded-full bg-[#0B2D71] text-white inline-flex items-center justify-center text-[10px]">2</span> Delivery</div>
          <div className="flex items-center gap-1.5 text-[#0B2D71]"><span className="w-5 h-5 rounded-full bg-[#0B2D71] text-white inline-flex items-center justify-center text-[10px]">3</span> Payment</div>
        </div>
        {!user ? (
          <div className="p-8 text-center space-y-4">
            <p className="text-base font-semibold text-slate-900">
              Sign in to link your order, payment receipts, and Pay Small Small progress
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Every customer account keeps orders, instalment plans, subscriptions, and delivery
              tracking securely separated.
            </p>
            <button
              type="button"
              onClick={onRequireAuth}
              className="px-6 py-3 bg-[#0B2D71] text-white text-sm font-semibold rounded-lg"
            >
              Sign In / Create Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 grid lg:grid-cols-12 gap-5 sm:gap-7">
            <div className="lg:col-span-7 space-y-6">
              {!user.emailVerified && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <span>
                    Email verification required before checkout. Check your inbox or sign in with
                    Google.
                  </span>
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="px-3 py-1.5 bg-amber-900 text-white rounded font-semibold shrink-0"
                  >
                    Resend Link
                  </button>
                </div>
              )}

              {/* 1. Payment Option Selector: Pay Small Small vs Buy & Pay Now */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  1. Select Purchase Mode
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!canUsePaySmallSmall}
                    onClick={() => setPaymentMode('pay_small_small')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      effectiveMode === 'pay_small_small'
                        ? 'border-[#D61A1E] bg-red-50/50 ring-1 ring-[#D61A1E]'
                        : 'border-slate-200 hover:border-slate-300 disabled:opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#D61A1E] mb-1">
                      <CalendarClock className="w-4 h-4" />
                      <span>Pay Small Small</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {canUsePaySmallSmall
                        ? `Pay ${pssDepositPct}% deposit today (${formatMoney(
                            pssBreakdown.depositAmount,
                            currency
                          )}) & spread the balance.`
                        : !allPssEligible
                        ? 'Unavailable: cart contains Buy-Now-only items.'
                        : 'Pay Small Small is currently unavailable for this order.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('buy_now')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      effectiveMode === 'buy_now'
                        ? 'border-[#0B2D71] bg-blue-50/50 ring-1 ring-[#0B2D71]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#0B2D71] mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Buy &amp; Pay Now</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pay {formatMoney(grandTotal, currency)} in full today for immediate dispatch
                      processing.
                    </p>
                  </button>
                </div>

                {effectiveMode === 'pay_small_small' && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Initial Deposit %
                        </label>
                        <select
                          value={pssDepositPct}
                          onChange={(e) => setPssDepositPct(Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          {[settings.pssDefaultDepositPercent, 40, 50, 60]
                            .filter((v, i, arr) => v >= settings.pssDefaultDepositPercent && arr.indexOf(v) === i)
                            .map((pct) => (
                              <option key={pct} value={pct}>
                                {pct}% Deposit
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Frequency
                        </label>
                        <select
                          value={pssFrequency}
                          onChange={(e) => setPssFrequency(e.target.value as InstalmentFrequency)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold capitalize"
                        >
                          <option value="daily">Daily</option>
                          {settings.pssAllowedFrequencies.filter((f) => f !== 'daily').map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      {pssFrequency === 'daily' ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Daily Amount</label>
                          <select value={pssDailyPaymentAmount} onChange={(e) => setPssDailyPaymentAmount(Number(e.target.value))} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold">
                            {(market === 'NG' ? [500, 1000] : [5, 10]).map((amount) => <option key={amount} value={amount}>{formatMoney(amount, currency)} / day</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instalments</label>
                          <select value={pssPeriods} onChange={(e) => setPssPeriods(Number(e.target.value))} className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold">
                            {Array.from({ length: settings.pssMaxPeriods }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} payment{n > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                      <Lock className="w-3.5 h-3.5 text-[#0B2D71] shrink-0" />
                      <span>
                        Fulfilment Policy: Dispatch unlocks automatically once{' '}
                        {settings.pssReleaseThresholdPercent}% of order value is paid. Next payment{' '}
                        {formatMoney(pssBreakdown.instalmentAmount, currency)} due{' '}
                        {formatShortDate(pssBreakdown.nextPaymentDate)}.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  2. Delivery Address ({market === 'NG' ? 'Nigeria' : 'Australia'})
                </h3>

                {savedAddresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                  >
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label}: {addr.street}, {addr.city}, {addr.state}
                      </option>
                    ))}
                    <option value="new">+ Enter a new delivery address</option>
                  </select>
                )}

                {selectedAddressId === 'new' && (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Recipient Full Name"
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm((p) => ({ ...p, fullName: e.target.value }))}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                      />
                      <input
                        type="tel"
                        required
                        placeholder={market === 'NG' ? '+234 800 000 0000' : '+61 400 000 000'}
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm((p) => ({ ...p, phone: e.target.value }))}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address, House/Apt No."
                      value={addrForm.street}
                      onChange={(e) => setAddrForm((p) => ({ ...p, street: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={addrForm.city}
                        onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={addrForm.state}
                        onChange={(e) => setAddrForm((p) => ({ ...p, state: e.target.value }))}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Postcode"
                        value={addrForm.postalCode}
                        onChange={(e) => setAddrForm((p) => ({ ...p, postalCode: e.target.value }))}
                        className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Payment Gateway Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  3. Select Payment Gateway ({currency})
                </h3>
                <div className="space-y-2">
                  {market === 'NG' ? (
                    <>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#0B2D71]/30 bg-blue-50/50 cursor-pointer hover:bg-blue-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'korapay'}
                            onChange={() => setPaymentMethod('korapay')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Kora (Korapay) · Card &amp; Bank</p>
                            <p className="text-xs text-slate-500">
                              {gatewayStatus.korapayConfigured
                                ? 'Korapay secure checkout is ready'
                                : 'Korapay integration added · awaiting KORAPAY_SECRET_KEY'}
                            </p>
                          </div>
                          <span className="ml-auto rounded-full bg-[#0B2D71] px-2 py-1 text-[10px] font-bold text-white">Recommended</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'paystack'}
                            onChange={() => setPaymentMethod('paystack')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Paystack (Card, Bank, USSD)
                            </p>
                            <p className="text-xs text-slate-500">
                              {gatewayStatus.paystackConfigured
                                ? 'Live Paystack checkout ready'
                                : 'Requires PAYSTACK_SECRET_KEY in Secrets (creates pending order if unset)'}
                            </p>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'flutterwave'}
                            onChange={() => setPaymentMethod('flutterwave')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Flutterwave NGN Checkout
                            </p>
                            <p className="text-xs text-slate-500">
                              {gatewayStatus.flutterwaveConfigured
                                ? 'Live Flutterwave checkout ready'
                                : 'Requires FLUTTERWAVE_SECRET_KEY in Secrets'}
                            </p>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'bank_transfer'}
                            onChange={() => setPaymentMethod('bank_transfer')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Direct Nigerian Bank Transfer (NGN)
                            </p>
                            <p className="text-xs text-slate-500">
                              Transfer to Zenith Bank &amp; submit reference for Admin verification
                            </p>
                          </div>
                        </div>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'stripe'}
                            onChange={() => setPaymentMethod('stripe')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Stripe (Visa, Mastercard, Apple Pay)
                            </p>
                            <p className="text-xs text-slate-500">
                              {gatewayStatus.stripeConfigured
                                ? 'Live Stripe Checkout ready'
                                : 'Requires STRIPE_SECRET_KEY in Secrets'}
                            </p>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="gw"
                            checked={paymentMethod === 'payid'}
                            onChange={() => setPaymentMethod('payid')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Australian PayID Instant Bank Transfer (AUD)
                            </p>
                            <p className="text-xs text-slate-500">
                              Transfer via Osko/PayID &amp; submit receipt reference for Admin verification
                            </p>
                          </div>
                        </div>
                      </label>
                    </>
                  )}
                </div>

                {(paymentMethod === 'bank_transfer' || paymentMethod === 'payid') && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2.5 text-xs">
                    <p className="font-bold text-[#0B2D71]">
                      {market === 'NG'
                        ? 'Samsara Choice Ltd · Zenith Bank · 1228407810 (NGN)'
                        : 'Samsara Choice Australia · PayID: pay@samsarachoice.com.au (AUD)'}
                    </p>
                    <p className="text-slate-600">
                      Transfer exact amount due now (
                      <strong className="font-mono">{formatMoney(amountDueNow, currency)}</strong>)
                      and enter your bank transaction reference below:
                    </p>
                    <input
                      type="text"
                      required
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      placeholder="e.g. NIP-20261123-8821 or OSKO-99124"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-6">
                <h3 className="font-display text-base font-bold text-slate-900">Order Summary</h3>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                  {cart.map((c) => (
                    <div key={c.id} className="flex justify-between gap-2 text-slate-700">
                      <span className="truncate">
                        {c.quantity}x {c.name}
                      </span>
                      <span className="font-mono font-semibold shrink-0 tabular-nums">
                        {formatMoney(getProductPrice(c, market, settings) * c.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon (e.g. SAMSARA10)"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && <p className="text-[11px] text-[#0B2D71] mt-1">{couponMsg}</p>}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatMoney(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-mono tabular-nums">
                        -{formatMoney(discountAmount, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery ({market === 'NG' ? 'Nigeria' : 'Australia'})</span>
                    <span className="font-mono tabular-nums">
                      {deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Order Total</span>
                    <span className="font-mono tabular-nums">{formatMoney(grandTotal, currency)}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {effectiveMode === 'pay_small_small'
                      ? `Due Today (${pssBreakdown.depositPercent}% Deposit)`
                      : 'Total Due Today (Buy & Pay Now)'}
                  </p>
                  <p className="font-mono text-2xl font-bold text-[#D61A1E] tabular-nums">
                    {formatMoney(amountDueNow, currency)}
                  </p>
                  {effectiveMode === 'pay_small_small' && (
                    <p className="text-[11px] text-slate-500">
                      Remaining {formatMoney(pssBreakdown.remainingBalance, currency)} split into{' '}
                      {pssFrequency === 'daily' ? `${effectivePssPeriods} daily payments of ${formatMoney(pssDailyPaymentAmount, currency)}` : `${effectivePssPeriods} ${pssFrequency} payments`}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-[#D61A1E] hover:bg-[#B51418] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? 'Processing Order...'
                    : effectiveMode === 'pay_small_small'
                    ? `Confirm Pay Small Small (${formatMoney(amountDueNow, currency)})`
                    : `Complete Buy & Pay Now (${formatMoney(amountDueNow, currency)})`}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B2D71]" />
                  <span>Verified order confirmation &amp; account receipt tracking</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
