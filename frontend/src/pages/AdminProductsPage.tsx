import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { productService } from '../services/productService';
import { Product, ProductVariant } from '../types';
import { useToastStore } from '../stores/useToastStore';

export const AdminProductsPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Adjust Stock & Pricing Modal State
  const [adjustModal, setAdjustModal] = useState<{
    open: boolean;
    product: Product | null;
    variants: ProductVariant[];
  }>({ open: false, product: null, variants: [] });

  const loadProducts = async () => {
    setLoading(true);
    const data = await productService.getAllProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStock = async (product: Product) => {
    const updated = await productService.toggleProductInStock(product.id, !product.inStock);
    if (updated) {
      await loadProducts();
      addToast({
        type: 'success',
        title: updated.inStock ? 'Product In Stock' : 'Product Marked Out of Stock',
        message: `${updated.name} availability updated.`,
      });
    }
  };

  const handleOpenAdjustModal = (product: Product) => {
    setAdjustModal({
      open: true,
      product,
      variants: JSON.parse(JSON.stringify(product.variants)),
    });
  };

  const handleVariantChange = (index: number, field: 'stock' | 'price' | 'mrp', val: number) => {
    const copy = [...adjustModal.variants];
    copy[index] = { ...copy[index], [field]: Math.max(0, val) };
    setAdjustModal({ ...adjustModal, variants: copy });
  };

  const handleSaveAdjustments = async () => {
    if (!adjustModal.product) return;
    const prodId = adjustModal.product.id;

    for (const v of adjustModal.variants) {
      await productService.updateProductVariantStock(prodId, v.id, v.stock);
      await productService.updateVariantPricing(prodId, v.id, v.price, v.mrp);
    }

    await loadProducts();
    addToast({
      type: 'success',
      title: 'Variant Stock & Pricing Updated',
      message: `Adjustments saved for ${adjustModal.product.name}.`,
    });
    setAdjustModal({ open: false, product: null, variants: [] });
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.nameTa.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.woodType.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/dashboard" className="hover:text-slate-600">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Products</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Product Catalog & Live Mill Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage traditional cold-pressed oil varieties, multi-tier pack sizes (500ml, 1L, 5L), and real-time stock availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await productService.resetProductsToSeed();
                await loadProducts();
                addToast({
                  type: 'info',
                  title: 'Catalog Restored',
                  message: 'Product stock and pricing reset to standard mill catalog defaults.',
                });
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              🔄 Reset Catalog
            </button>
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>+ Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-surface-border shadow-card flex items-center gap-2">
          <span className="text-slate-400 pl-2">🔍</span>
          <input
            type="text"
            placeholder="Search oil varieties by name, Tamil name, extraction mortar, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-brand-slate placeholder:text-slate-400 focus:outline-none py-1 bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Low Stock Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-xl">🫙</span>
            <div>
              <p className="font-bold text-amber-900">Live Tenkasi Mill Dispatch Warehouse Status</p>
              <p className="text-amber-700">
                Wood-press extraction runs in batches. All inventory counts sync with customer order limits.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg">
            3 Active Mill Oils
          </span>
        </div>

        {/* Products Data Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading product inventory...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No products match your search query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/50">
                    <th className="py-3.5 px-4">Product Detail</th>
                    <th className="py-3.5 px-4">Extraction Type</th>
                    <th className="py-3.5 px-4">Pack Sizes & Live Prices</th>
                    <th className="py-3.5 px-4">Total Stock</th>
                    <th className="py-3.5 px-4">Store Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        {/* Product Detail */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {p.primaryImage && (
                              <img
                                src={p.primaryImage}
                                alt={p.name}
                                className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200"
                              />
                            )}
                            <div>
                              <p className="font-bold text-sm text-brand-slate">{p.name}</p>
                              <p className="text-xs text-amber-700 font-tamil font-semibold">{p.nameTa}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.seedOrigin}</p>
                            </div>
                          </div>
                        </td>

                        {/* Extraction Type */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700 block">{p.woodType}</span>
                          <span className="text-[10px] text-brand-green font-semibold">Cold Pressed (&lt; 42°C)</span>
                        </td>

                        {/* Variants */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {p.variants.map((v) => (
                              <span
                                key={v.id}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold border border-slate-200"
                              >
                                {v.volume}: ₹{v.price} ({v.stock} in stock)
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Total Stock */}
                        <td className="py-4 px-4">
                          <div className="font-mono font-black text-slate-900 text-sm">{totalStock} Units</div>
                          <span className="text-[10px] text-slate-400 font-medium">Bottled in Tenkasi</span>
                        </td>

                        {/* Availability Toggle */}
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] transition cursor-pointer ${
                              p.inStock
                                ? 'bg-emerald-100 text-brand-green hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.inStock ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                            {p.inStock ? 'Listed / In Stock' : 'Out of Stock'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenAdjustModal(p)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer text-xs"
                            >
                              Adjust Stock & Price
                            </button>
                            <Link
                              to={`/admin/products/new?edit=${p.id}`}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition text-xs"
                            >
                              Edit Info
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Stock & Pricing Modal */}
      {adjustModal.open && adjustModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setAdjustModal({ open: false, product: null, variants: [] })}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">{adjustModal.product.name}</h3>
                <p className="text-[11px] text-slate-500 font-tamil">{adjustModal.product.nameTa}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModal({ open: false, product: null, variants: [] })}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Update physical bottled stock counts and selling rates for each package size:
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {adjustModal.variants.map((v, i) => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>
                      {v.volume} ({v.containerType})
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{v.sku}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Stock Units</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold focus:outline-none focus:border-brand-amber text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Selling Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={v.price}
                        onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold focus:outline-none focus:border-brand-amber text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">MRP Print (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={v.mrp}
                        onChange={(e) => handleVariantChange(i, 'mrp', Number(e.target.value))}
                        className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold focus:outline-none focus:border-brand-amber text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustModal({ open: false, product: null, variants: [] })}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustments}
                className="px-5 py-2 bg-brand-slate text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                Save Stock & Rates
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
