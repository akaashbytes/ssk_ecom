import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { adminService } from '../services/adminService';
import { DynamicPriceItem } from '../types';
import { useToastStore } from '../stores/useToastStore';

export const AdminPricingPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [items, setItems] = useState<DynamicPriceItem[]>([]);
  // loading state
  const [, setLoading] = useState(true);

  // Margin Simulator State
  const [simSeedCost, setSimSeedCost] = useState(115);
  const [simMargin, setSimMargin] = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await adminService.getPriceMatrix();
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  // Simulator formula
  const simExtractionCost = 38;
  const simPackaging = 22;
  const simShipping = 25;
  const simBaseCost = simSeedCost + simExtractionCost + simPackaging + simShipping;
  const simRecommendedPrice = Math.round(simBaseCost * (1 + simMargin / 100));

  const handleQuickPriceUpdate = async (item: DynamicPriceItem, newPrice: number) => {
    const memo = `Market raw seed adjustment revision to ₹${newPrice}`;
    await adminService.updatePriceItem(item.id, { sellingPrice: newPrice, mrp: newPrice }, memo);
    const updated = await adminService.getPriceMatrix();
    setItems(updated);
    addToast({
      type: 'success',
      title: 'Rate Matrix Deployed',
      message: `${item.productName} (${item.variantName}) updated to ₹${newPrice}. Price audit log logged.`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Dynamic Price Management & Margin Calculator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tenkasi seed cost formulas, packaging allowances, and live retail/wholesale margin controls.
            </p>
          </div>

          <Link
            to="/admin/pricing/audit"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span>📜 View Cryptographic Audit Ledger</span>
          </Link>
        </div>

        {/* Live Interactive Margin Simulator (Stitch Screen 76437859... Feature) */}
        <div className="p-6 rounded-3xl bg-brand-slate text-white shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                Live Milling Margin & Retail Price Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Test seed procurement fluctuations to simulate optimal consumer MRP.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              Formula: (Seed + Extraction + Pack + Freight) × (1 + Margin%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <label className="font-bold text-slate-300 block">Raw Seed Procurement (₹/kg)</label>
              <input
                type="number"
                value={simSeedCost}
                onChange={(e) => setSimSeedCost(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <label className="font-bold text-slate-300 block">Target Net Margin (%)</label>
              <input
                type="number"
                value={simMargin}
                onChange={(e) => setSimMargin(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
              <span className="text-slate-400 font-bold block">Base Extraction Cost</span>
              <p className="font-mono text-xl font-bold text-slate-200">₹{simBaseCost}</p>
              <p className="text-[10px] text-slate-400">Incl. Bottle ₹22 + Courier ₹25</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-amber-400 font-bold block">Recommended Consumer MRP</span>
              <p className="font-mono text-2xl font-black text-amber-300">₹{simRecommendedPrice}</p>
              <p className="text-[10px] text-amber-200">Estimated Net Margin: +{simMargin}%</p>
            </div>
          </div>
        </div>

        {/* Dynamic Live Price Matrix Table */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">Dynamic Active Rate Matrix (Tenkasi Mill)</h2>
            <span className="text-xs font-mono font-bold text-brand-green">● All Rates Synced With Storefront</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/60">
                  <th className="py-3 px-4">Product & Pack</th>
                  <th className="py-3 px-3">Seed Cost</th>
                  <th className="py-3 px-3">Extraction</th>
                  <th className="py-3 px-3">Packaging</th>
                  <th className="py-3 px-3">Freight</th>
                  <th className="py-3 px-3">Margin %</th>
                  <th className="py-3 px-3">Current MRP</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-4 text-right">Quick Rate Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-sans">
                      <p className="font-bold text-slate-800 text-xs">{it.productName}</p>
                      <span className="text-[11px] font-mono text-amber-700 font-semibold">{it.variantName}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">₹{it.seedCost}</td>
                    <td className="py-3.5 px-3 text-slate-600">₹{it.extractionCost}</td>
                    <td className="py-3.5 px-3 text-slate-600">₹{it.bottlePackagingCost}</td>
                    <td className="py-3.5 px-3 text-slate-600">₹{it.shippingAllowance}</td>
                    <td className="py-3.5 px-3 font-bold text-brand-green">+{it.marginPct}%</td>
                    <td className="py-3.5 px-3 font-bold text-slate-500">₹{it.mrp}</td>
                    <td className="py-3.5 px-3 font-black text-brand-slate text-sm">₹{it.sellingPrice}</td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPriceUpdate(it, it.sellingPrice + 10)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          +₹10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPriceUpdate(it, Math.max(100, it.sellingPrice - 10))}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          -₹10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
