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
  const [authOpen, setAuthOpen] = useState(false);

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

  const handleNavigate = (view: ActiveView, sectionId?: string) => {
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
              onExploreCatalog={() => handleNavigate('storefront', 'catalog')}
              onExploreSubscriptions={() => handleNavigate('storefront', 'subscriptions')}
            />
            <CatalogSection onSelectProduct={(p) => setSelectedProduct(p)} />
            <PaySmallSmallShowcase onSelectProduct={(p) => setSelectedProduct(p)} />
            <SubscriptionsShowcase
              onRequireAuth={() => setAuthOpen(true)}
              onSuccessNavigateAccount={() => handleNavigate('account')}
            />
          </>
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
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onRequireAuth={() => {
          setCheckoutOpen(false);
          setAuthOpen(true);
        }}
        onOrderComplete={() => handleNavigate('account')}
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
