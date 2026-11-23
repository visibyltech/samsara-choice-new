import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ActiveView, Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PaySmallSmallShowcase } from './components/PaySmallSmallShowcase';
import { SubscriptionsShowcase } from './components/SubscriptionsShowcase';
import { CatalogSection } from './components/CatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Product } from './types';

function StorefrontApp() {
  const { toast, clearToast, user, showToast } = useStore();
  const [activeView, setActiveView] = useState<ActiveView>('storefront');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPreset, setCheckoutPreset] = useState<{ mode: 'buy_now' | 'pay_small_small'; dailyAmount?: number; depositPercent?: number } | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState('all');

  // Handle gateway callback query params (e.g. Stripe / Paystack return URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('payment_ref') || params.get('reference') || params.get('trxref');
    const sessionId = params.get('session_id');
    const gw = params.get('gateway') || (sessionId ? 'stripe' : 'paystack');
    if (ref && user) {
      user.getIdToken().then((token) => {
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gateway: gw, reference: ref, sessionId }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.verified) {
              showToast(`Payment ${ref} verified! Check your account dashboard.`, 'success');
              setActiveView('account');
            }
          })
          .catch(() => {});
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // Keep in-app navigation in the browser history so Android/browser Back
  // returns to the previous Samsara page instead of leaving the website.
  useEffect(() => {
    const initialState = window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {};
    window.history.replaceState(
      { ...initialState, samsaraView: 'storefront', samsaraCategory: 'all' },
      document.title
    );

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state || {};
      const nextView: ActiveView = ['storefront', 'shop', 'account', 'admin'].includes(state.samsaraView)
        ? state.samsaraView
        : 'storefront';
      setActiveView(nextView);
      setShopCategory(typeof state.samsaraCategory === 'string' ? state.samsaraCategory : 'all');
      setSelectedProduct(null);
      setCartOpen(false);
      setCheckoutOpen(false);
      setAuthOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenShop = (categoryId = 'all') => {
    window.history.pushState(
      { ...(window.history.state || {}), samsaraView: 'shop', samsaraCategory: categoryId },
      document.title,
      window.location.href
    );
    setShopCategory(categoryId);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ActiveView, sectionId?: string) => {
    window.history.pushState(
      { ...(window.history.state || {}), samsaraView: view, samsaraCategory: 'all' },
      document.title,
      window.location.href
    );
    setActiveView(view);
    if (view === 'storefront' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'storefront' && (
          <>
            <HeroSection
              onExplorePaySmallSmall={() => handleNavigate('storefront', 'pay-small-small')}
              onExploreCatalog={() => handleOpenShop()}
              onExploreSubscriptions={() => handleNavigate('storefront', 'subscriptions')}
            />
            <CatalogSection featuredOnly onOpenShop={handleOpenShop} onSelectProduct={(p) => setSelectedProduct(p)} />
            <PaySmallSmallShowcase onSelectProduct={(p) => setSelectedProduct(p)} />
            <SubscriptionsShowcase
              onRequireAuth={() => setAuthOpen(true)}
              onSuccessNavigateAccount={() => handleNavigate('account')}
            />
          </>
        )}

        {activeView === 'shop' && (
          <CatalogSection key={shopCategory} initialCategory={shopCategory} onOpenShop={handleOpenShop} onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {activeView === 'account' && (
          <CustomerDashboard onBackToStore={() => handleNavigate('storefront')} />
        )}

        {activeView === 'admin' && (
          <AdminDashboard onBackToStore={() => handleNavigate('storefront')} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenAuth={() => setAuthOpen(true)}
        onCheckout={(mode, dailyAmount, depositPercent) => {
          setCheckoutPreset({ mode, dailyAmount, depositPercent });
          setCheckoutOpen(true);
        }}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => {
          setCheckoutPreset({ mode: 'buy_now' });
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onRequireAuth={() => {
          setAuthOpen(true);
        }}
        onOrderComplete={() => { setCheckoutPreset(null); handleNavigate('account'); }}
        initialPaymentMode={checkoutPreset?.mode || 'buy_now'}
        initialDailyPaymentAmount={checkoutPreset?.dailyAmount}
        initialDepositPercent={checkoutPreset?.depositPercent}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-start gap-3 text-xs">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
          <span className="flex-1 leading-relaxed">{toast.text}</span>
          <button
            type="button"
            onClick={clearToast}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <StorefrontApp />
      </StoreProvider>
    </ErrorBoundary>
  );
}
