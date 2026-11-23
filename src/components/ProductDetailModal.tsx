import React, { useEffect, useState } from 'react';
import { Check, Heart, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useStore } from '../context/StoreContext';
import { Product, ProductReview } from '../types';
import { calculatePaySmallSmall, formatMoney, formatShortDate, getProductPrice } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onOpenAuth: () => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onSelectProduct,
  onOpenAuth,
}: ProductDetailModalProps) {
  const {
    user,
    userProfile,
    products,
    market,
    currency,
    settings,
    addToCart,
    toggleWishlist,
    showToast,
  } = useStore();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveImage(0);
    setSelectedVariant(product.variants?.[0] || product.unit || 'Standard');
    setQuantity(1);

    const q = query(
      collection(db, 'products', product.id, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => setReviews(snap.docs.map((d) => d.data() as ProductReview)),
      () => setReviews([])
    );
    return unsub;
  }, [product?.id]);

  if (!product) return null;

  const unitPrice = getProductPrice(product, market, settings);
  const lineTotal = unitPrice * quantity;
  const depositPct = product.pssMinDepositPercent || settings.pssDefaultDepositPercent;
  const pssPreview = calculatePaySmallSmall(lineTotal, depositPct, 'weekly', 3, currency);
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);
  const isWishlisted = Boolean(userProfile?.wishlist?.includes(product.id));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!user.emailVerified) {
      showToast('Please verify your email to submit a review.', 'info');
      return;
    }
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    const revId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'products', product.id, 'reviews', revId), {
        id: revId,
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Customer',
        rating: reviewRating,
        comment: reviewComment.trim().slice(0, 1000),
        createdAt: serverTimestamp(),
      });
      setReviewComment('');
      showToast('Thank you! Your review has been published.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${product.id}/reviews/${revId}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 overflow-y-auto p-3 sm:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {product.subcategory} {product.sku ? `· SKU: ${product.sku}` : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product detail"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 grid lg:grid-cols-12 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200 p-4">
              <ProductImage
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-20 aspect-square rounded-lg overflow-hidden bg-white p-1 border-2 shrink-0 ${
                      activeImage === i ? 'border-[#D61A1E]' : 'border-slate-200'
                    }`}
                  >
                    <ProductImage src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase Module */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {product.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {(product.ratingAvg || 4.8).toFixed(1)} ({reviews.length || product.reviewCount || 0} reviews)
                </span>
                <span>·</span>
                <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>

              <div className="font-mono text-3xl font-bold text-slate-900 tabular-nums mb-4">
                {formatMoney(unitPrice, currency)}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">{product.description}</p>

              {product.bundleItems && product.bundleItems.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-slate-900 mb-2">Included in This Bundle:</p>
                  <ul className="grid sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                    {product.bundleItems.map((bi, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#0B2D71] shrink-0 mt-0.5" />
                        <span>{bi}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Select Option / Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          selectedVariant === v
                            ? 'border-[#0B2D71] bg-[#0B2D71] text-white'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.pssEligible && (
                <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-[#D61A1E] mb-1">
                    Pay Small Small Eligible ({depositPct}% Initial Deposit)
                  </p>
                  <p className="text-xs text-slate-700">
                    Start today with{' '}
                    <span className="font-mono font-bold tabular-nums">
                      {formatMoney(pssPreview.depositAmount, currency)}
                    </span>{' '}
                    and split the remaining{' '}
                    <span className="font-mono font-semibold tabular-nums">
                      {formatMoney(pssPreview.remainingBalance, currency)}
                    </span>{' '}
                    into 3 weekly payments of{' '}
                    <span className="font-mono font-semibold tabular-nums">
                      {formatMoney(pssPreview.instalmentAmount, currency)}
                    </span>
                    . Choose Pay Small Small or Buy &amp; Pay Now at checkout.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-3 text-slate-700 hover:bg-slate-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    aria-label="Increase quantity"
                    className="p-3 text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={async () => {
                    await addToCart(product, quantity, selectedVariant);
                    onClose();
                  }}
                  className="flex-1 py-3 px-5 bg-[#D61A1E] hover:bg-[#B51418] disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag · {formatMoney(lineTotal, currency)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-[#D61A1E] text-[#D61A1E]' : 'text-slate-600'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Related Products */}
        <div className="px-6 sm:px-8 pb-8 pt-6 border-t border-slate-200 bg-slate-50 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Customer Reviews</h3>
            <form onSubmit={handleSubmitReview} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">Rate this product</span>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-2.5 py-1 border border-slate-300 rounded text-xs font-semibold"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  user ? 'Share your quality or delivery experience...' : 'Sign in to leave a review'
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg hover:bg-[#082257]"
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </form>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500">
                No customer reviews posted yet for this item. Be the first!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-900">{rev.userName}</span>
                      <span className="text-slate-400">{formatShortDate(rev.createdAt)}</span>
                    </div>
                    <p className="text-xs text-amber-500 font-semibold mb-1">
                      {'★'.repeat(rev.rating)}
                    </p>
                    <p className="text-sm text-slate-700">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Related Products</h3>
            <div className="space-y-3">
              {relatedProducts.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectProduct(rel)}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-[#0B2D71] transition-colors"
                >
                  <ProductImage
                    src={rel.images[0]}
                    alt={rel.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-2">{rel.name}</p>
                    <p className="font-mono text-xs font-bold text-[#0B2D71] mt-1 tabular-nums">
                      {formatMoney(getProductPrice(rel, market, settings), currency)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
