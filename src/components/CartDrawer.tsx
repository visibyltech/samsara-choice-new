import React from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatMoney, getProductPrice } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({ open, onClose, onProceedToCheckout }: CartDrawerProps) {
  const {
    cart,
    market,
    currency,
    settings,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  if (!open) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + getProductPrice(item, market, settings) * item.quantity,
    0
  );
  const allPssEligible = cart.length > 0 && cart.every((i) => i.pssEligible);
  const minPss = market === 'NG' ? settings.pssMinOrderNGN : settings.pssMinOrderAUD;
  const qualifiesPss = settings.pssEnabled && allPssEligible && subtotal >= minPss;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/55">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0B2D71]" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 mb-1">Your bag is empty</p>
              <p className="text-xs text-slate-500">
                Add rice, palm oil, foodstuff bundles, wigs, or native attire to continue.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const unitPrice = getProductPrice(item, market, settings);
              return (
                <div
                  key={item.id}
                  className="flex gap-3.5 pb-4 border-b border-slate-100 last:border-0"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                        className="text-slate-400 hover:text-[#D61A1E] p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.variant} · {item.pssEligible ? 'Pay Small Small eligible' : 'Buy Now only'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-slate-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatMoney(unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3">
              {qualifiesPss ? (
                <p className="text-[#0B2D71] font-medium">
                  Eligible for <strong>Pay Small Small</strong> ({settings.pssDefaultDepositPercent}% deposit) or <strong>Buy &amp; Pay Now</strong> at checkout.
                </p>
              ) : (
                <p>
                  Checkout via <strong>Buy &amp; Pay Now</strong>.{' '}
                  {!allPssEligible
                    ? 'Cart contains items marked Buy Now only.'
                    : `Minimum order for Pay Small Small is ${formatMoney(minPss, currency)}.`}
                </p>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">
                Subtotal ({currency})
              </span>
              <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {formatMoney(subtotal, currency)}
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-5 bg-[#D61A1E] hover:bg-[#B51418] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
