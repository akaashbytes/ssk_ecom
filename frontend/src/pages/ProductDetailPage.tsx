import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout';
import { Product, ProductVariant } from '../types';
import { productService } from '../services/productService';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useCartStore } from '../stores/useCartStore';
import { useToastStore } from '../stores/useToastStore';
import {
  CheckCircleIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '../components/common/Icons';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Pincode Checker State
  const [pincode, setPincode] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    serviceable: boolean;
    estimatedDays?: string;
    city?: string;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      if (!slug) return;
      const found = await productService.getProductBySlug(slug);
      if (found) {
        setProduct(found);
        setSelectedImage(found.primaryImage);
        const def = found.variants.find((v) => v.isDefault) || found.variants[0];
        setSelectedVariant(def);

        const all = await productService.getAllProducts();
        setRelatedProducts(all.filter((p) => p.id !== found.id));
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setPincodeChecking(true);
    const res = await productService.checkPincode(pincode);
    setPincodeResult({
      checked: true,
      serviceable: res.serviceable,
      estimatedDays: res.estimatedDays,
      city: res.city,
    });
    setPincodeChecking(false);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      nameTa: product.nameTa,
      category: product.category,
      volume: selectedVariant.volume,
      price: selectedVariant.price,
      mrp: selectedVariant.mrp,
      image: product.primaryImage,
      stock: selectedVariant.stock,
      quantity,
    });

    addToast({
      type: 'success',
      title: language === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது' : 'Added to Basket',
      message: `${quantity} × ${language === 'ta' ? product.nameTa : product.name} (${selectedVariant.volume})`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout/address');
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-brand-amber rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 font-semibold">Loading authentic oil specifications...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-800">Oil Variety Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">
            The product you are looking for may have been rotated or is temporarily unavailable.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block px-5 py-2.5 bg-brand-slate text-white text-xs font-bold rounded-xl"
          >
            Explore Available Oils
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-brand-slate transition">
            Home <span className="text-slate-400 font-tamil">(முகப்பு)</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/shop" className="hover:text-brand-slate transition">
            Shop <span className="text-slate-400 font-tamil">(அங்காடி)</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-brand-slate font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Section (Dual Column) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Canvas & Thumbnails */}
          <div className="space-y-4">
            <div className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-2xl bg-white border border-surface-border shadow-card flex items-center justify-center p-6 overflow-hidden">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                <span className="px-2.5 py-1 rounded bg-brand-green text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                  <CheckCircleIcon size={14} />
                  Tenkasi Marachekku
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                  Cold Pressed (&lt; 42°C)
                </span>
              </div>

              {/* Master Image */}
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl bg-white border p-1.5 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-brand-amber ring-2 ring-amber-200 shadow-sm'
                      : 'border-surface-border hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

            {/* Direct Extraction Proof Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>🌾 Single-Origin Raw Material:</span>
                <span className="text-amber-800 font-normal">{product.seedOrigin}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>🪵 Mortar Churn:</span>
                <span className="text-slate-600 font-normal">{product.woodType}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span>🏛️ FSSAI Central License:</span>
                <span className="text-slate-600 font-mono font-normal">{product.fssaiLicense}</span>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Demo Placeholder
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic pt-2">
              * Note: Product specifications, extraction claims, and license references represent development demonstration data subject to final owner verification.
            </p>
          </div>

          {/* Right Column: Details, Pack Size, Price & Purchase */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700 font-mono">
                  {product.botanicalName}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-brand-green font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-functional-success animate-pulse" />
                  <span>Fresh Tenkasi Batch In Stock</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-brand-slate tracking-tight mt-1">
                {language === 'ta' ? product.nameTa : product.name}
              </h1>
              <p className="text-sm font-semibold text-amber-700 font-tamil mt-0.5">
                {product.nameTa}
              </p>

              {/* Tagline */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                {language === 'ta' ? product.taglineTa : product.tagline}
              </p>
            </div>

            {/* Pack Size Selector (500ml, 1L, 5L, 15L Tin) */}
            <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  Select Pack Size / அளவு:
                </span>
                <span className="text-slate-400 font-medium">Standard packaging</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-slate bg-brand-slate text-white shadow-md'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="font-black text-sm">{variant.volume}</div>
                      <div
                        className={`text-xs font-semibold mt-0.5 ${
                          isSelected ? 'text-amber-300' : 'text-slate-900'
                        }`}
                      >
                        ₹{variant.price}
                      </div>
                      <div
                        className={`text-[9px] mt-1 leading-tight line-clamp-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {variant.containerType}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pricing Display */}
              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brand-slate">
                      ₹{selectedVariant.price}
                    </span>
                    {selectedVariant.mrp > selectedVariant.price && (
                      <span className="text-sm text-slate-400 line-through">
                        MRP ₹{selectedVariant.mrp}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-brand-green font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircleIcon size={12} />
                    Taxes Included • Direct Mill Fresh Pricing
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-800 tnum">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-2xs font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons (Desktop inline) */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBagIcon size={18} />
                  <span>Add to Basket</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded-xl bg-brand-slate hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚡ Buy Now</span>
                </button>
              </div>
            </div>

            {/* Pincode Delivery Estimator (Stitch Screen f54b5181... Section) */}
            <div className="p-4 rounded-xl bg-white border border-surface-border shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <TruckIcon size={16} className="text-amber-600" />
                <span>Check Delivery in Your Area / டெலிவரி வாய்ப்பு</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit PIN code (e.g. 627811)"
                  className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-xs border border-slate-200 focus:outline-none focus:border-brand-slate font-mono"
                />
                <button
                  type="submit"
                  disabled={pincodeChecking}
                  className="px-4 py-2 bg-brand-slate text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
                >
                  {pincodeChecking ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeResult?.checked && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    pincodeResult.serviceable
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <span>{pincodeResult.serviceable ? '✓' : '⚠️'}</span>
                  <div>
                    {pincodeResult.serviceable ? (
                      <>
                        <p className="font-bold">
                          Serviceable in {pincodeResult.city} ({pincodeResult.estimatedDays})
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Cash on Delivery (COD) & Online UPI payment available.
                        </p>
                      </>
                    ) : (
                      <p className="font-medium">
                        PIN code not directly serviceable via standard courier. Contact us on WhatsApp for bulk logistics.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description & Heritage Story */}
            <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Traditional Extraction Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {language === 'ta' ? product.descriptionTa : product.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {product.purityHighlights.map((hl, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-brand-slate">
                      {language === 'ta' ? hl.titleTa : hl.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {language === 'ta' ? hl.descriptionTa : hl.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Facts Table */}
            <div className="p-5 rounded-2xl bg-white border border-surface-border shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nutritional Values (Per 100g)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {product.nutritionFacts.map((nf, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      {language === 'ta' ? nf.labelTa : nf.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{nf.per100g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-surface-border">
            <h2 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight mb-6">
              {language === 'ta' ? 'பிற மரச்செக்கு எண்ணெய்கள்' : 'You May Also Like'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl p-5 border border-surface-border shadow-xs flex items-center gap-4 group"
                >
                  <img
                    src={rel.primaryImage}
                    alt={rel.name}
                    className="w-24 h-24 object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-brand-slate">
                      {language === 'ta' ? rel.nameTa : rel.name}
                    </h3>
                    <p className="text-xs text-amber-700 font-tamil">{rel.nameTa}</p>
                    <p className="text-sm font-black text-slate-900 mt-2">
                      Starts at ₹{rel.variants[0].price}
                    </p>
                    <Link
                      to={`/products/${rel.slug}`}
                      className="inline-block mt-2 text-xs font-bold text-amber-700 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Sticky Bottom Mobile Buy Bar (Matching Stitch Mobile Details Page) */}
      <aside className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-surface-border p-3 md:hidden shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black text-brand-slate leading-none">
            ₹{selectedVariant.price}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {selectedVariant.volume} • Taxes incl.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm active:scale-95 transition"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="px-4 py-2.5 rounded-xl bg-brand-slate text-white font-bold text-xs shadow-sm active:scale-95 transition"
          >
            ⚡ Buy Now
          </button>
        </div>
      </aside>
    </CustomerLayout>
  );
};
