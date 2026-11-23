import React from 'react';
import { BRAND_LOGO_URL } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ActiveView } from './Header';

interface FooterProps {
  onNavigate: (view: ActiveView, sectionId?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { market, setMarket } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_LOGO_URL}
                alt="Samsara Choice Ltd Logo"
                className="h-12 w-auto rounded bg-white p-1 object-contain"
              />
              <div>
                <p className="font-display text-lg font-bold text-white">SAMSARA CHOICE LTD</p>
                <p className="text-xs text-slate-400">RC NO: 8240781 · Nigeria &amp; Australia</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Trusted general retail &amp; foodstuff supply serving households and diaspora
              families across Nigeria (NGN ₦) and Australia (AUD A$) with Pay Small Small
              instalments and recurring foodstuff subscriptions.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <p className="font-semibold text-white">Shop &amp; Plans</p>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('storefront', 'pay-small-small')}
                  className="hover:text-white transition-colors"
                >
                  Pay Small Small Plans
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('storefront', 'subscriptions')}
                  className="hover:text-white transition-colors"
                >
                  Weekly &amp; Monthly Subscriptions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:text-white transition-colors"
                >
                  Foodstuffs, Hair &amp; Native Attire
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('account')}
                  className="hover:text-white transition-colors"
                >
                  Customer Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-sm">
            <p className="font-semibold text-white">Fulfilment Hubs &amp; Active Currency</p>
            <div className="text-xs text-slate-400 space-y-1.5">
              <p>Nigeria Hub: Lagos &amp; Abuja Nationwide Cold-Chain Dispatch</p>
              <p>Australia Hub: Sydney, Melbourne &amp; Brisbane Express Delivery</p>
              <p>Support: orders@samsarachoice.com</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMarket('NG')}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  market === 'NG'
                    ? 'bg-[#D61A1E] border-[#D61A1E] text-white'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                Nigeria · NGN (₦)
              </button>
              <button
                type="button"
                onClick={() => setMarket('AU')}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  market === 'AU'
                    ? 'bg-[#D61A1E] border-[#D61A1E] text-white'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                Australia · AUD (A$)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Samsara Choice Ltd (RC NO: 8240781). All rights reserved.</p>
          <p>Payments supported: Korapay, Bank Transfer (NGN) · Stripe, PayID (AUD)</p>
        </div>
      </div>
    </footer>
  );
}
