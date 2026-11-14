import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { Product, ExtractionCategory } from '../types';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import { useProducts } from '../hooks';
import {
  SearchIcon,
  XIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '../components/common/Icons';

export const ShopAllPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguageStore();
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  // TanStack Query hook connected to live PostgreSQL backend
  const {
    data: products = [],
    isLoading: loading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts();

  // Filters & State
  const categoryParam = (searchParams.get('category') as ExtractionCategory | 'all') || 'all';
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<ExtractionCategory | 'all'>(categoryParam);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);
  const [selectedVariantMap, setSelectedVariantMap] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Synchronize default selected variants from live backend product records
  useEffect(() => {
    if (products.length > 0) {
      setSelectedVariantMap((prev) => {
        const vMap = { ...prev };
        products.forEach((p) => {
          if (!vMap[p.id]) {
            const def = p.variants.find((v) => v.isDefault) || p.variants[0];
            if (def) vMap[p.id] = def.id;
          }
        });
        return vMap;
      });
    }
  }, [products]);

  const handleCategorySelect = (cat: ExtractionCategory | 'all') => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      searchParams.set('q', q);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setInStockOnly(false);
    searchParams.delete('category');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
    const isFav = !favorites[productId];
    addToast({
      type: 'info',
      title: isFav ? 'Added to Wishlist' : 'Removed from Wishlist',
      message: isFav
        ? 'Saved to your personal harvest favorites.'
        : 'Removed from harvest favorites.',
    });
  };

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (inStockOnly && !p.inStock) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesEn = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
          const matchesTa = p.nameTa.includes(q) || p.descriptionTa.includes(q);
          const matchesBot = p.botanicalName.toLowerCase().includes(q);
          if (!matchesEn && !matchesTa && !matchesBot) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aVariant = a.variants.find((v) => v.id === selectedVariantMap[a.id]) || a.variants[0];
        const bVariant = b.variants.find((v) => v.id === selectedVariantMap[b.id]) || b.variants[0];
        if (sortBy === 'price-low') return aVariant.price - bVariant.price;
        if (sortBy === 'price-high') return bVariant.price - aVariant.price;
        return 0; // featured default
      });
  }, [products, selectedCategory, inStockOnly, searchQuery, sortBy, selectedVariantMap]);

  const handleAddToCart = (product: Product) => {
    const variantId = selectedVariantMap[product.id] || product.variants[0]?.id;
    const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];

    if (!variant || variant.stock <= 0) {
      addToast({
        type: 'warning',
        title: language === 'ta' ? 'இருப்பு இல்லை' : 'Out of Stock',
        message:
          language === 'ta'
            ? 'இந்த அளவு தற்போது இருப்பில் இல்லை.'
            : 'This variant is currently out of stock.',
      });
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      nameTa: product.nameTa,
      category: product.category,
      volume: variant.volume,
      price: variant.price,
      mrp: variant.mrp,
      image: product.primaryImage,
      stock: variant.stock,
      quantity: 1,
    });

    addToast({
      type: 'success',
      title: language === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது' : 'Added to Cart',
      message: `${language === 'ta' ? product.nameTa : product.name} (${variant.volume}) • ₹${variant.price}`,
    });
  };

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <Link to="/" className="hover:text-brand-slate transition">
            Home <span className="text-slate-400 font-tamil">(முகப்பு)</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold">
            Shop <span className="font-tamil">(அங்காடி)</span>
          </span>
        </nav>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-slate tracking-tight">
                {language === 'ta' ? 'எங்கள் தூய மரச்செக்கு எண்ணெய்கள்' : 'Shop Our Pure Oils'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-amber-700 font-tamil mt-0.5">
              பாரம்பரிய முறைப்படி தயாரிக்கப்படும் 100% இயற்கை எண்ணெய்கள்
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Authentic cold-pressed edible oils extracted in Tenkasi, Tamil Nadu using traditional Vaagai wood churns.
            </p>
          </div>
        </div>

        {/* Sticky Search & Category Filter Section */}
        <section className="sticky top-16 sm:top-20 z-20 bg-surface-subtle/95 backdrop-blur-md py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-surface-border mb-6">
          <div className="max-w-page mx-auto space-y-3">
            {/* Search Input Bar */}
            <div className="relative w-full">
              <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'எண்ணெய் பெயர் மூலம் தேடுக (எ.கா. Groundnut, Sesame, தேங்காய்)...'
                    : 'Search by oil name (e.g. Groundnut, Sesame, Coconut)...'
                }
                className="w-full bg-white pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-surface-border shadow-xs focus:outline-none focus:border-brand-slate transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>

            {/* Horizontally Scrollable Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-brand-slate text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-surface-border'
                }`}
              >
                {language === 'ta' ? 'அனைத்தும் (All)' : 'All Products (அனைத்தும்)'}
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('groundnut')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'groundnut'
                    ? 'bg-brand-slate text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-surface-border'
                }`}
              >
                Groundnut Oil (கடலை)
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('sesame')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'sesame'
                    ? 'bg-brand-slate text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-surface-border'
                }`}
              >
                Sesame Oil (நல்லெண்ணெய்)
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('coconut')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'coconut'
                    ? 'bg-brand-slate text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-surface-border'
                }`}
              >
                Coconut Oil (தேங்காய்)
              </button>
            </div>

            {/* Utility Bar: Filter Sheet, Sort Sheet & Certification Badge */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-slate-700 font-semibold shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>⚙️ Filters</span>
                  <span className="w-4 h-4 rounded-full bg-brand-amber text-white text-[10px] flex items-center justify-center font-bold">
                    {inStockOnly ? 1 : 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSortDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-slate-700 font-medium shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>
                    Sort:{' '}
                    {sortBy === 'featured'
                      ? 'Featured'
                      : sortBy === 'price-low'
                      ? 'Price: Low to High'
                      : 'Price: High to Low'}
                  </span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-brand-green font-bold text-xs">
                <CheckCircleIcon size={14} />
                <span>100% Marachekku Tested</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Filter Chips Ribbon */}
        {(inStockOnly || selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap mb-6 text-xs">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Applied:</span>
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs">
                In Stock Only
                <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-rose-600">
                  <XIcon size={12} />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs capitalize">
                {selectedCategory} Oil
                <button type="button" onClick={() => handleCategorySelect('all')} className="hover:text-rose-600">
                  <XIcon size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs">
                "{searchQuery}"
                <button type="button" onClick={() => handleSearchChange('')} className="hover:text-rose-600">
                  <XIcon size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-amber-700 font-bold hover:underline ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Products Grid: High-Impact Cards (Stitch 1-column mobile / 3-column desktop layout) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-surface-border animate-pulse space-y-4">
                <div className="w-full h-56 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : productsError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="font-bold text-rose-900 text-base">
              {language === 'ta' ? 'தயாரிப்புகளை ஏற்றுவதில் பிழை ஏற்பட்டது' : 'Unable to Load Products'}
            </h3>
            <p className="text-xs text-rose-700">
              {language === 'ta'
                ? 'எங்கள் தென்காசி ஆலை சேவையகத்துடன் இணைக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
                : 'Could not connect to the Tenkasi mill database. Please check your network and try again.'}
            </p>
            <button
              type="button"
              onClick={() => refetchProducts()}
              className="mt-2 px-4 py-2 bg-brand-slate text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              {language === 'ta' ? 'மீண்டும் முயற்சி செய்' : 'Retry'}
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-surface-border max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center mx-auto text-2xl mb-4">
              🔍
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Matching Oils Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any pure oils matching your filters or search query.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-brand-slate text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const activeVariantId = selectedVariantMap[product.id] || product.variants[0].id;
              const activeVariant =
                product.variants.find((v) => v.id === activeVariantId) || product.variants[0];
              const isFav = Boolean(favorites[product.id]);

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl p-5 border border-surface-border shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
                >
                  {/* Top Image Canvas */}
                  <div className="relative w-full h-64 sm:h-72 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                    {/* Certified Badges Overlay */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                      <span className="px-2 py-1 rounded bg-brand-green text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <CheckCircleIcon size={12} />
                        Tenkasi Marachekku
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold uppercase tracking-wider">
                        Cold Pressed
                      </span>
                    </div>

                    {/* Wishlist Heart Action */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-90 transition shadow-xs cursor-pointer"
                      aria-label="Save to favorites"
                    >
                      <span className={`text-lg ${isFav ? 'text-rose-500' : ''}`}>{isFav ? '❤️' : '🤍'}</span>
                    </button>

                    {/* Authentic Product Bottle Photo */}
                    <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </div>

                  {/* Body Content */}
                  <div className="pt-4 flex flex-col flex-1">
                    {/* Title & Tamil Botanical Subhead */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/products/${product.slug}`}>
                          <h2 className="text-base sm:text-lg font-black text-brand-slate hover:text-brand-amber transition-colors leading-tight">
                            {language === 'ta' ? product.nameTa : product.name}
                          </h2>
                        </Link>
                        <p className="text-xs font-semibold text-amber-700 font-tamil mt-0.5">
                          {product.nameTa}
                        </p>
                      </div>

                      {/* Stock Status Pulse */}
                      {product.inStock && activeVariant.stock > 0 ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-brand-green font-bold text-[10px] shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-functional-success animate-pulse" />
                          <span>{language === 'ta' ? 'இருப்பில் உள்ளது' : 'In Stock'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold text-[10px] shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{language === 'ta' ? 'இருப்பு இல்லை' : 'Out of Stock'}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Description */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {language === 'ta' ? product.descriptionTa : product.description}
                    </p>

                    {/* Pack Size Selector Pills (500ml, 1L, 5L) */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-2 text-slate-500">
                        <span className="font-semibold uppercase tracking-wider">Select Size:</span>
                        <span className="font-tamil">அளவு தேர்வு</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {product.variants.slice(0, 3).map((variant) => {
                          const isSelected = activeVariant.id === variant.id;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() =>
                                setSelectedVariantMap((prev) => ({
                                  ...prev,
                                  [product.id]: variant.id,
                                }))
                              }
                              className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-slate text-white shadow-xs'
                                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              <div>{variant.volume}</div>
                              <div className={`text-[10px] font-normal ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                                ₹{variant.price}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price & Add to Cart Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl sm:text-2xl font-black text-brand-slate">
                            ₹{activeVariant.price}
                          </span>
                          {activeVariant.mrp > activeVariant.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{activeVariant.mrp}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-green font-semibold flex items-center gap-0.5">
                          <CheckCircleIcon size={10} />
                          Taxes included
                        </span>
                      </div>

                      {/* Add to Cart CTA */}
                      {activeVariant.stock <= 0 || !product.inStock ? (
                        <button
                          type="button"
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed shrink-0 border border-slate-200"
                        >
                          <span>{language === 'ta' ? 'இருப்பு இல்லை' : 'Out of Stock'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="px-4 py-2.5 rounded-xl bg-brand-amber text-white font-bold text-xs shadow-md hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ShoppingBagIcon size={16} />
                          <span>{language === 'ta' ? 'கூடையில் சேர்' : 'Add to Cart'}</span>
                        </button>
                      )}
                    </div>

                    {/* View Details Link */}
                    <div className="mt-3 pt-2 text-[11px] flex items-center justify-between text-slate-400">
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-bold text-brand-slate hover:text-brand-amber transition flex items-center gap-1"
                      >
                        <span>View Details & Lab Report</span>
                        <span>→</span>
                      </Link>
                      <span>Tenkasi Mill Fresh</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Progress & All Products Displayed Footer */}
        <div className="mt-12 pt-8 pb-4 flex flex-col items-center text-center border-t border-surface-border">
          <div className="w-full max-w-xs space-y-2 mb-4">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Showing {filteredProducts.length} of {products.length} items</span>
              <span className="font-bold text-brand-green">100% Loaded</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-amber w-full rounded-full" />
            </div>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center gap-2">
            <span>✓</span>
            <span>All Authentic Oils Displayed (முடிந்தது)</span>
          </div>

          {/* Quality Assurance Strip */}
          <div className="mt-6 w-full max-w-2xl p-4 rounded-xl bg-amber-50/60 border border-amber-200/50 flex items-center gap-3 text-left">
            <SparklesIcon size={24} className="text-brand-amber shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-brand-slate block">Looking for commercial 15L Tins?</span>
              <span className="text-slate-600">
                SSK Natural Gold supplies restaurants, sweet manufacturers, and retail shops at direct mill wholesale rates.
              </span>
              <Link to="/wholesale" className="text-amber-800 font-bold hover:underline ml-2">
                Enquire for Wholesale →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bottom Sheet / Modal (Matching Stitch Mobile Filter Sheet) */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setFilterDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="font-bold text-base text-brand-slate">Filter Pure Oils</h3>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Stock Availability
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-brand-amber focus:ring-brand-amber"
                  />
                  <span>Show In-Stock Oils Only (உடனடி டெலிவரி)</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Extraction Type
                </label>
                <p className="text-xs text-slate-500">
                  All SSK products are 100% Vaagai wood-churn cold pressed. No industrial refined oils exist in our catalog.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-brand-slate text-white text-xs font-bold hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Sheet / Modal */}
      {sortDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSortDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl z-10 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="font-bold text-base text-brand-slate">Sort By</h3>
              <button
                type="button"
                onClick={() => setSortDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="py-4 space-y-2">
              {[
                { id: 'featured', label: 'Featured / Recommended (சிறப்பு)' },
                { id: 'price-low', label: 'Price: Low to High (விலை: குறைவு முதல் அதிகம்)' },
                { id: 'price-high', label: 'Price: High to Low (விலை: அதிகம் முதல் குறைவு)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.id as any);
                    setSortDrawerOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    sortBy === opt.id
                      ? 'bg-amber-50 text-brand-amber font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};
