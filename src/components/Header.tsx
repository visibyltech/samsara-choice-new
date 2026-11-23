import React, { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { BRAND_LOGO_URL } from '../data/catalog';
import { useStore } from '../context/StoreContext';

export type ActiveView = 'storefront' | 'shop' | 'account' | 'admin';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, sectionId?: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export function Header({ activeView, onNavigate, onOpenCart, onOpenAuth }: HeaderProps) {
  const { user, isAdmin, market, setMarket, cart, notifications } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleLink = (view: ActiveView, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Slim Market & Currency Switcher Utility Bar */}
      <div className="bg-[#0B2D71] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between gap-4">
          <p className="truncate text-white/90 font-medium text-[11px]">
            Serving Nigeria &amp; Australia · Pay Small Small · Foodstuff Subscriptions
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-white/75 text-[11px]">Market:</span>
            <div className="inline-flex items-center bg-white/10 rounded p-0.5">
              <button
                type="button"
                onClick={() => setMarket('NG')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  market === 'NG' ? 'bg-[#D61A1E] text-white' : 'text-white/85 hover:text-white'
                }`}
              >
                Nigeria (NGN ₦)
              </button>
              <button
                type="button"
                onClick={() => setMarket('AU')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  market === 'AU' ? 'bg-[#D61A1E] text-white' : 'text-white/85 hover:text-white'
                }`}
              >
                Australia (AUD A$)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Mark */}
        <button
          type="button"
          onClick={() => handleLink('storefront')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0B2D71] rounded"
        >
          <img
            src={BRAND_LOGO_URL}
            alt="Samsara Choice Ltd Official Logo"
            className="h-9 w-auto object-contain rounded"
          />
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#0B2D71]">
            SAMSARA <span className="text-[#D61A1E]">CHOICE</span>
          </span>
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          <button
            type="button"
            onClick={() => handleLink('shop')}
            className={`hover:text-[#D61A1E] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeView === 'shop' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Shop All Products
          </button>
          <button
            type="button"
            onClick={() => handleLink('storefront', 'pay-small-small')}
            className="hover:text-[#D61A1E] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Pay Small Small
          </button>
          <button
            type="button"
            onClick={() => handleLink('storefront', 'subscriptions')}
            className="hover:text-[#D61A1E] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Subscriptions
          </button>
          <button
            type="button"
            onClick={() => (user ? handleLink('account') : onOpenAuth())}
            className={`hover:text-[#D61A1E] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeView === 'account' ? 'text-[#D61A1E] font-semibold' : ''
            }`}
          >
            {user ? `Account${unreadNotifs > 0 && !isAdmin ? ` (${unreadNotifs})` : ''}` : 'Sign In'}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleLink('admin')}
              className={`hover:text-[#D61A1E] transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeView === 'admin' ? 'text-[#D61A1E] font-semibold' : 'text-[#0B2D71] font-semibold'
              }`}
            >
              Admin Console{unreadNotifs > 0 ? ` (${unreadNotifs})` : ''}
            </button>
          )}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D61A1E] hover:bg-[#B51418] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle Menu"
            className="md:hidden p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleLink('shop')}
            className="block w-full text-left px-3 py-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Shop All Products
          </button>
          <button
            type="button"
            onClick={() => handleLink('storefront', 'pay-small-small')}
            className="block w-full text-left px-3 py-3 rounded-lg text-sm font-semibold text-[#D61A1E] hover:bg-red-50"
          >
            Pay Small Small Instalments
          </button>
          <button
            type="button"
            onClick={() => handleLink('storefront', 'subscriptions')}
            className="block w-full text-left px-3 py-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Weekly &amp; Monthly Subscriptions
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) handleLink('account');
              else onOpenAuth();
            }}
            className="block w-full text-left px-3 py-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {user ? 'My Account & Instalments' : 'Customer Sign In / Register'}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleLink('admin')}
              className="block w-full text-left px-3 py-3 rounded-lg text-sm font-semibold text-[#0B2D71] bg-blue-50/70"
            >
              Admin Dashboard ({unreadNotifs} alerts)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
