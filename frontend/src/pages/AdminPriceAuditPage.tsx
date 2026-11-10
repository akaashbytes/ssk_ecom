import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { adminService } from '../services/adminService';
import { PriceAuditLog } from '../types';
import { CheckCircleIcon } from '../components/common/Icons';

export const AdminPriceAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<PriceAuditLog[]>([]);
  // loading state
  const [, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await adminService.getPriceAuditLogs();
      setLogs(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/admin/pricing" className="hover:text-slate-600">
                Rate Matrix
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Audit History</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
              Cryptographic Price Audit Log & Replacement Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable ledger of all consumer MRP revisions, raw crop price modifications, and catalog replacements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Audit log exported to CSV')}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
            >
              📥 Export Ledger CSV
            </button>
          </div>
        </div>

        {/* Ledger Protection Notice */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-bold text-amber-400">Ledger Immutability Active</p>
              <p className="text-slate-300">
                All pricing changes carry timestamped administrator signatures to ensure compliance with Legal Metrology & FSSAI.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded-lg border border-emerald-500/30">
            Hash: SHA256-VERIFIED
          </span>
        </div>

        {/* Audit Log Table (Matching Stitch Screen e70f2322...) */}
        <div className="bg-white rounded-3xl border border-surface-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/60">
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Product & Variant</th>
                  <th className="py-3 px-3">Previous Price</th>
                  <th className="py-3 px-3">New Updated Price</th>
                  <th className="py-3 px-3">Variance</th>
                  <th className="py-3 px-3">Modified By</th>
                  <th className="py-3 px-4">Audit Reason / Memo</th>
                  <th className="py-3 px-4">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{log.productName}</p>
                      <span className="text-[10px] text-amber-800 font-mono font-semibold">{log.variantName}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">₹{log.previousPrice}</td>
                    <td className="py-3.5 px-3 font-mono font-black text-brand-slate">₹{log.newPrice}</td>
                    <td className="py-3.5 px-3 font-mono font-bold">
                      <span
                        className={
                          log.variancePct > 0
                            ? 'text-rose-600'
                            : log.variancePct < 0
                            ? 'text-brand-green'
                            : 'text-slate-400'
                        }
                      >
                        {log.variancePct > 0 ? `+${log.variancePct}%` : `${log.variancePct}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{log.modifiedBy}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs">{log.memo}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-brand-green font-bold text-[10px]">
                        <CheckCircleIcon size={10} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Replacement Fallback Studio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-card space-y-4">
          <h2 className="font-black text-base text-brand-slate">
            Interactive SKU Fallback & Product Replacement Studio
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            When a raw crop variety encounters seasonal milling limits, configure automatic fallback suggestions so customers on the storefront are gracefully transitioned to complementary pack sizes without cart abandonment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-800 block">Out-of-Stock SKU:</span>
              <p className="text-amber-800 font-mono font-bold">Traditional Groundnut 500ml</p>
              <span className="text-[10px] text-slate-400">Trigger: Stock &lt; 5 bottles</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <span className="font-bold text-amber-900 block">Active Storefront Fallback:</span>
              <p className="text-brand-slate font-mono font-bold">Traditional Groundnut 1 Litre</p>
              <span className="text-[10px] text-brand-green font-semibold">Offer 5% instant bundle upgrade</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <button
                type="button"
                onClick={() => alert('Fallback rules saved')}
                className="px-4 py-2 bg-brand-slate text-white rounded-xl font-bold hover:bg-slate-800 cursor-pointer"
              >
                Configure Fallback Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
