import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { productService } from '../services/productService';
import { ExtractionCategory } from '../types';
import { useToastStore } from '../stores/useToastStore';

export const AdminProductStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<'general' | 'variants' | 'compliance'>('general');
  const [formData, setFormData] = useState({
    id: '',
    name: 'Pure Wood-Pressed Sesame Oil',
    nameTa: 'பாரம்பரிய மரச்செக்கு நல்லெண்ணெய்',
    category: 'sesame' as ExtractionCategory,
    botanicalName: 'Sesamum indicum',
    seedOrigin: 'Single-Origin Sun-Dried Black Sesame Seeds',
    woodType: 'Vaagai Wood Churn Mortar',
    tagline: '100% Traditional Cold-Pressed with Pure Palm Jaggery',
    taglineTa: 'பனை வெல்லம் சேர்த்து வாகை மரச்செக்கில் பிழியப்பட்ட சுத்தமான நல்லெண்ணெய்',
    description:
      'Extracted slowly in authentic Vaagai wood mortars at room temperature without chemical refining or heat.',
    descriptionTa:
      'பாரம்பரிய வாகை மரச்செக்கில் மெதுவாக ஆட்டப்பட்டு, எந்தவித ரசாயனங்களும் கலக்காமல் இயற்கை முறையில் வடிக்கப்பட்ட சுத்தமான நல்லெண்ணெய்.',
    variants: [
      { volume: '500 ml', sku: 'SSK-SES-500ML', container: 'Food-Grade PET Bottle', mrp: 249, price: 249, stock: 95 },
      { volume: '1 Litre', sku: 'SSK-SES-1L', container: 'Food-Grade PET Bottle', mrp: 479, price: 479, stock: 70 },
      { volume: '5 L Tin', sku: 'SSK-SES-5L', container: 'Reinforced Food-Grade Tin', mrp: 2390, price: 2390, stock: 30 },
      { volume: '15 L Tin', sku: 'SSK-SES-15L', container: 'Commercial Mill Tin', mrp: 6950, price: 6950, stock: 10 },
    ],
  });

  useEffect(() => {
    if (editId) {
      productService.getProductById(editId).then((existing) => {
        if (existing) {
          setFormData({
            id: existing.id,
            name: existing.name,
            nameTa: existing.nameTa,
            category: existing.category,
            botanicalName: existing.botanicalName,
            seedOrigin: existing.seedOrigin,
            woodType: existing.woodType,
            tagline: existing.tagline,
            taglineTa: existing.taglineTa,
            description: existing.description,
            descriptionTa: existing.descriptionTa,
            variants: existing.variants.map((v) => ({
              volume: v.volume,
              sku: v.sku,
              container: v.containerType,
              mrp: v.mrp,
              price: v.price,
              stock: v.stock,
            })),
          });
        }
      });
    }
  }, [editId]);

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const copy = [...formData.variants];
    copy[index] = { ...copy[index], [field]: value };
    setFormData({ ...formData, variants: copy });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          volume: 'New Size',
          sku: `SSK-${formData.category.slice(0, 3).toUpperCase()}-NEW`,
          container: 'Food-Grade Container',
          mrp: 500,
          price: 500,
          stock: 25,
        },
      ],
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      addToast({ type: 'error', title: 'Cannot Remove', message: 'At least one variant must exist.' });
      return;
    }
    const copy = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: copy });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: 'Required Field', message: 'Product title is required.' });
      return;
    }

    const saved = await productService.saveProduct({
      id: formData.id || undefined,
      name: formData.name,
      nameTa: formData.nameTa,
      category: formData.category,
      botanicalName: formData.botanicalName,
      seedOrigin: formData.seedOrigin,
      woodType: formData.woodType,
      tagline: formData.tagline,
      taglineTa: formData.taglineTa,
      description: formData.description,
      descriptionTa: formData.descriptionTa,
      variants: formData.variants.map((v, i) => ({
        id: `var-${Date.now()}-${i}`,
        sku: v.sku,
        volume: v.volume,
        volumeMl: v.volume.includes('500') ? 500 : v.volume.includes('1') ? 1000 : 5000,
        containerType: v.container,
        mrp: Number(v.mrp),
        price: Number(v.price),
        stock: Number(v.stock),
        isDefault: i === 0,
      })),
    });

    addToast({
      type: 'success',
      title: formData.id ? 'Product Updated' : 'Product Published',
      message: `${saved.name} saved to catalog with ${saved.variants.length} active pack variants.`,
    });
    navigate('/admin/products');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/products" className="hover:text-slate-600">
                Products
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">{formData.id ? 'Edit Product' : 'Add New Product'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              {formData.id ? `Edit Product: ${formData.name}` : 'Add New Oil Variety Studio'}
            </h1>
            <p className="text-xs text-slate-500">
              Configure bilingual descriptors, extraction technicalities, and multi-tier pack sizes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Discard Draft
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-brand-slate hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              ✓ Save & Publish Product
            </button>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex gap-2 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-brand-slate text-brand-slate'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            1. General & Extraction Info (பொது விபரம்)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'variants'
                ? 'border-brand-slate text-brand-slate'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            2. Variant Pricing & Pack Sizes (அளவு & விலை)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'compliance'
                ? 'border-brand-slate text-brand-slate'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            3. FSSAI & Quality Declarations
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-brand-slate"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title (Tamil / தமிழ்) *</label>
                <input
                  type="text"
                  required
                  value={formData.nameTa}
                  onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm font-tamil font-bold focus:outline-none focus:border-brand-slate"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Extraction Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExtractionCategory })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate font-bold"
                >
                  <option value="groundnut">Groundnut Oil (கடலை எண்ணெய்)</option>
                  <option value="sesame">Sesame Oil (நல்லெண்ணெய்)</option>
                  <option value="coconut">Coconut Oil (தேங்காய் எண்ணெய்)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Botanical Latin Name</label>
                <input
                  type="text"
                  value={formData.botanicalName}
                  onChange={(e) => setFormData({ ...formData, botanicalName: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-slate"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Certified Seed Origin</label>
                <input
                  type="text"
                  value={formData.seedOrigin}
                  onChange={(e) => setFormData({ ...formData, seedOrigin: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wood Mortar Churn Type</label>
                <input
                  type="text"
                  value={formData.woodType}
                  onChange={(e) => setFormData({ ...formData, woodType: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline (English)</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline (Tamil / தமிழ்)</label>
                <input
                  type="text"
                  value={formData.taglineTa}
                  onChange={(e) => setFormData({ ...formData, taglineTa: e.target.value })}
                  className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-tamil focus:outline-none focus:border-brand-slate"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-slate"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Variant Pricing Matrix */}
        {activeTab === 'variants' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Configured Pack Sizes & Pricing</h3>
                <p className="text-slate-500">Edit package sizes, container specifications, and selling prices.</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 bg-brand-amber hover:bg-amber-600 text-white font-bold rounded-lg transition cursor-pointer"
              >
                + Add Pack Size
              </button>
            </div>

            <div className="space-y-3">
              {formData.variants.map((v, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="text-sm">Pack Variant #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-rose-600 hover:text-rose-700 text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Volume</label>
                      <input
                        type="text"
                        value={v.volume}
                        onChange={(e) => handleVariantChange(idx, 'volume', e.target.value)}
                        placeholder="e.g. 1 Litre"
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">SKU Code</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        placeholder="SSK-001"
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Container Type</label>
                      <input
                        type="text"
                        value={v.container}
                        onChange={(e) => handleVariantChange(idx, 'container', e.target.value)}
                        placeholder="Food-Grade PET Bottle"
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Selling (₹)</label>
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Stock</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Compliance & FSSAI */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Central FSSAI License: 22426293000431 (Sivasakthi Enterprises, Tenkasi)</span>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                DEMO / NOT VERIFIED
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every extraction batch undergoes acid value and saponification purity test verification prior to dispatch.
              Tamper-evident shrink film wraps on bottle necks and heavy-gauge corrugated cartons ensure zero in-transit spillage.
            </p>
            <p className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-100">
              * Note: Quality standards, laboratory purity tests, and FSSAI license numbers represent illustrative demonstration data.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
