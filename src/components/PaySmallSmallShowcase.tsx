import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Lock, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { InstalmentFrequency, Product } from '../types';
import {
  calculatePaySmallSmall,
  formatMoney,
  formatShortDate,
  getProductPrice,
} from '../utils/currency';
import { ProductImage } from './ProductImage';

interface PaySmallSmallShowcaseProps {
  onSelectProduct: (product: Product) => void;
}

export function PaySmallSmallShowcase({ onSelectProduct }: PaySmallSmallShowcaseProps) {
  const { products, market, currency, settings, addToCart } = useStore();

  const eligibleProducts = useMemo(
    () => products.filter((p) => p.pssEligible && (!p.markets || p.markets.includes(market))),
    [products, market]
  );

  const [selectedId, setSelectedId] = useState<string>(
    eligibleProducts[0]?.id || 'sm-royal-stallion-parboiled-rice-50-kg'
  );
  const [frequency, setFrequency] = useState<InstalmentFrequency>('weekly');
  const [periods, setPeriods] = useState<number>(3);

  const activeProduct =
    eligibleProducts.find((p) => p.id === selectedId) || eligibleProducts[0] || products[0];

  const productPrice = activeProduct ? getProductPrice(activeProduct, market, settings) : 0;
  const depositPercent = activeProduct?.pssMinDepositPercent || settings.pssDefaultDepositPercent;
  const breakdown = calculatePaySmallSmall(
    productPrice,
    depositPercent,
    frequency,
    periods,
    currency
  );

  if (!activeProduct) return null;

  return (
    <section id="pay-small-small" className="py-8 sm:py-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#D61A1E] mb-1">
              Flagship Feature · Nigeria &amp; Australia
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
              Pay Small Small — Reserve Foodstuffs &amp; Bundles in Instalments
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Beat price inflation by locking in current market rates with a small deposit. Clear your
            balance on a weekly, biweekly, or monthly schedule with automatic reminders.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Planner Card */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="grid sm:grid-cols-12 gap-5 items-center pb-5 border-b border-slate-200">
              <div className="sm:col-span-5 aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 p-2">
                <ProductImage
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="sm:col-span-7 space-y-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Choose Eligible Item to Simulate
                </label>
                <select
                  value={activeProduct.id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0B2D71]"
                >
                  {eligibleProducts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatMoney(getProductPrice(item, market, settings), currency)})
                    </option>
                  ))}
                </select>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-500">Full Market Price</span>
                  <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {formatMoney(productPrice, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Controls */}
            <div className="grid sm:grid-cols-2 gap-5 py-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Payment Schedule</p>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                  {settings.pssAllowedFrequencies.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2 px-2 rounded-md text-xs font-semibold capitalize transition-colors ${
                        frequency === freq
                          ? 'bg-[#0B2D71] text-white'
                          : 'text-slate-700 hover:bg-white/70'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Balance Split ({periods} Instalments)
                </p>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-200/70 p-1 rounded-lg">
                  {[2, 3, 4, 6]
                    .filter((n) => n <= Math.max(4, settings.pssMaxPeriods))
                    .map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPeriods(n)}
                        className={`py-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                          periods === n
                            ? 'bg-[#D61A1E] text-white'
                            : 'text-slate-700 hover:bg-white/70'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Schedule Breakdown Output */}
            <div className="grid sm:grid-cols-3 gap-4 py-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">
                  Today&apos;s Deposit ({breakdown.depositPercent}%)
                </p>
                <p className="font-mono text-2xl font-bold text-[#D61A1E] tabular-nums">
                  {formatMoney(breakdown.depositAmount, currency)}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">
                  Each {frequency} payment ({periods}x)
                </p>
                <p className="font-mono text-2xl font-bold text-[#0B2D71] tabular-nums">
                  {formatMoney(breakdown.instalmentAmount, currency)}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">First Balance Due</p>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {formatShortDate(breakdown.nextPaymentDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-[#0B2D71] shrink-0" />
                <span>
                  Fulfilment Policy: Orders release for dispatch once{' '}
                  {settings.pssReleaseThresholdPercent}% of balance is paid.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectProduct(activeProduct)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  View Item Details
                </button>
                <button
                  type="button"
                  onClick={() => addToCart(activeProduct, 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D61A1E] hover:bg-[#B51418] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add &amp; Choose Pay Small Small</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: How Pay Small Small Works + Eligible Top Picks */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B2D71] text-white rounded-2xl p-6 sm:p-7">
              <h3 className="font-display text-xl font-bold mb-4">
                How Pay Small Small Protects Your Budget
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-white/15 px-2 py-1 rounded shrink-0">
                    01
                  </span>
                  <div>
                    <p className="font-semibold">Pay Initial Deposit at Checkout</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      Choose &ldquo;Pay Small Small&rdquo; instead of Buy &amp; Pay Now for eligible
                      foodstuffs, rice bags, hampers, wigs &amp; attires.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-white/15 px-2 py-1 rounded shrink-0">
                    02
                  </span>
                  <div>
                    <p className="font-semibold">Track Progress &amp; Receive Reminders</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      View paid vs. remaining balance, next due date, and automatic reminders inside
                      your customer dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold bg-white/15 px-2 py-1 rounded shrink-0">
                    03
                  </span>
                  <div>
                    <p className="font-semibold">Automatic Dispatch Unlock</p>
                    <p className="text-white/80 text-xs mt-0.5">
                      As soon as your plan hits {settings.pssReleaseThresholdPercent}% paid, your
                      order unlocks for immediate dispatch in Nigeria or Australia.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Upcoming Payment Timeline Preview
                </h4>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-2.5">
                {breakdown.schedule.map((step) => (
                  <div
                    key={step.index}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Instalment #{step.index} · {formatShortDate(step.dueDate)}
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatMoney(step.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
