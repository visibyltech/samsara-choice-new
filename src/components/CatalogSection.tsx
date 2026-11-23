import React, { useMemo, useState } from 'react';
import { ArrowRight, Heart, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatMoney, getComparePrice, getProductPrice } from '../utils/currency';
import { ProductImage } from './ProductImage';

interface CatalogSectionProps {
  onSelectProduct: (product: Product) => void;
  featuredOnly?: boolean;
  initialCategory?: string;
  onOpenShop?: (categoryId?: string) => void;
}

type SortOption = 'featured' | 'bestsellers' | 'price_asc' | 'price_desc';

export function CatalogSection({ onSelectProduct, featuredOnly = false, initialCategory = 'all', onOpenShop }: CatalogSectionProps) {
  const {
    categories,
    products,
    market,
    currency,
    settings,
    userProfile,
    addToCart,
    toggleWishlist,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pssOnly, setPssOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (p.markets && !p.markets.includes(market)) return false;
      if (featuredOnly && !p.featured) return false;
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) return false;
      if (pssOnly && !p.pssEligible) return false;
      if (q) {
        const hay = `${p.name} ${p.description} ${p.subcategory} ${p.sku || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'bestsellers') return Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller));
      if (sortBy === 'price_asc')
        return getProductPrice(a, market, settings) - getProductPrice(b, market, settings);
      if (sortBy === 'price_desc')
        return getProductPrice(b, market, settings) - getProductPrice(a, market, settings);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [products, market, selectedCategory, selectedSubcategory, pssOnly, searchQuery, sortBy, settings, featuredOnly]);

  const wishlistSet = new Set(userProfile?.wishlist || []);

  return (
    <section id="catalog" className="py-8 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0B2D71] mb-1">
              Samsara Choice Storefront · Nigeria &amp; Australia
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {featuredOnly ? 'Featured Products' : 'Shop All Products'}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-xs sm:text-sm text-slate-600 tabular-nums">
              {filteredProducts.length} {featuredOnly ? 'featured products' : 'products'} · {currency} ({market === 'NG' ? 'Nigeria' : 'Australia'})
            </p>
            {featuredOnly && (
              <button type="button" onClick={() => onOpenShop?.()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2D71] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#082257] whitespace-nowrap">
                View All Products <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Department browsing belongs in the full shop, not the homepage. */}
        {!featuredOnly && (
        {/* Real product photography for each department */}
        <div className="mb-7 sm:mb-9">
          <div className="flex items-end justify-between gap-3 mb-3.5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Shop by Category</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Explore our departments and discover what you need</p>
            </div>
            {!featuredOnly && <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{categories.length} categories</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const representative = products.find((product) =>
                product.categoryId === cat.id &&
                product.images?.[0] &&
                product.images[0] !== 'MANUAL_UPLOAD_REQUIRED'
              );
              const image = representative?.images?.[0] || cat.image || '';
              const count = products.filter((product) =>
                product.categoryId === cat.id && (!product.markets || product.markets.includes(market))
              ).length;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (featuredOnly) onOpenShop?.(cat.id);
                    else { setSelectedCategory(cat.id); setSelectedSubcategory('all'); }
                  }}
                  aria-pressed={!featuredOnly && active}
                  className={`group relative isolate h-[132px] sm:h-[164px] overflow-hidden rounded-2xl bg-slate-900 text-left shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2D71] ${!featuredOnly && active ? 'ring-2 ring-[#D61A1E]' : ''}`}
                >
                  {image && <img src={image} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/5" />
                  <span className="absolute inset-0 -z-10 bg-[#0B2D71]/10" />
                  <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <span className="block text-sm sm:text-base font-bold leading-tight text-white drop-shadow-sm">{cat.name}</span>
                    <span className="mt-1 block text-[10px] sm:text-xs font-medium text-white/80">{count} {count === 1 ? 'item' : 'items'} <span aria-hidden="true">→</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        )}

        {/* Subcategories (when a category is active) */}
        {!featuredOnly && activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3">
            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 border ${
                selectedSubcategory === 'all'
                  ? 'border-[#D61A1E] text-[#D61A1E] bg-red-50/50'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              All {activeCategoryObj.name}
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 border ${
                  selectedSubcategory === sub
                    ? 'border-[#D61A1E] text-[#D61A1E] bg-red-50/50'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Search, Pay Small Small Filter & Sort Toolbar */}
        {!featuredOnly && <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mb-6">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rice, beans, palm oil, titus fish, chicken, hampers, wigs..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0B2D71] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setPssOnly((v) => !v)}
              className={`w-full h-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                pssOnly
                  ? 'bg-[#D61A1E] border-[#D61A1E] text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{pssOnly ? 'Pay Small Small Only' : 'Pay Small Small Eligible'}</span>
            </button>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:border-[#0B2D71] focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="bestsellers">Sort: Best Sellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>}

        {/* Product Grid: 2 Columns on Mobile, 3-4 Columns on Desktop */}
        {filteredProducts.length === 0 ? (
          <div className="border border-slate-200 rounded-xl p-10 text-center bg-slate-50">
            <p className="text-sm font-semibold text-slate-800 mb-1.5">
              No matching products found
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {featuredOnly ? 'Check back soon for new featured items.' : 'Try clearing your search filter or switching categories.'}
            </p>
            {!featuredOnly && <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
                setSearchQuery('');
                setPssOnly(false);
              }}
              className="px-4 py-2 bg-[#0B2D71] text-white text-xs font-semibold rounded-lg"
            >
              Reset All Filters
            </button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const price = getProductPrice(product, market, settings);
              const comparePrice = getComparePrice(product, market);
              const depositPct = product.pssMinDepositPercent || settings.pssDefaultDepositPercent;
              const depositAmt =
                currency === 'NGN'
                  ? Math.round((price * depositPct) / 100)
                  : Math.round(((price * depositPct) / 100) * 100) / 100;
              const isWishlisted = wishlistSet.has(product.id);

              return (
                <article
                  key={product.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
                >
                  <div>
                    {/* Uniform Individual Product Image Container */}
                    <div className="relative aspect-square bg-white border-b border-slate-100 p-2 sm:p-3 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <ProductImage
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Toggle wishlist"
                        className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#D61A1E] transition-colors"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#D61A1E] text-[#D61A1E]' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-2.5 sm:p-3.5">
                      <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate mb-0.5">
                        {product.subcategory}
                      </p>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="text-left block w-full"
                      >
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#0B2D71] transition-colors line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-snug">
                          {product.name}
                        </h3>
                      </button>

                      <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                          {formatMoney(price, currency)}
                        </span>
                        {comparePrice && comparePrice > price && (
                          <span className="font-mono text-[11px] text-slate-400 line-through tabular-nums">
                            {formatMoney(comparePrice, currency)}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] sm:text-[11px] mt-1 font-medium truncate">
                        {product.pssEligible ? (
                          <span className="text-[#D61A1E]">
                            Pay Small Small: {formatMoney(depositAmt, currency)} ({depositPct}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">Buy &amp; Pay Now · In Stock</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Shopping Button */}
                  <div className="px-2.5 pb-2.5 sm:px-3.5 sm:pb-3.5 pt-0">
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product, 1)}
                      className="w-full py-2 px-2.5 bg-[#0B2D71] hover:bg-[#082257] disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>{product.stock > 0 ? 'Add to Bag' : 'Sold Out'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
