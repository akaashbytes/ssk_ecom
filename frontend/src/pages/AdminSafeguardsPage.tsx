import React, { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useToastStore } from '../stores/useToastStore';

export const AdminSafeguardsPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [destructiveModalOpen, setDestructiveModalOpen] = useState(false);
  const [safetyLockChecked, setSafetyLockChecked] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);

  const handleConfirmDeletion = () => {
    if (!safetyLockChecked) {
      addToast({
        type: 'error',
        title: 'Safety Lock Required',
        message: 'You must check the confirmation lock to proceed with simulated purge.',
      });
      return;
    }
    setDestructiveModalOpen(false);
    setSafetyLockChecked(false);
    addToast({
      type: 'warning',
      title: 'Simulated Safeguard Triggered',
      message: 'Destructive deletion guardrail verified. Action logged with admin audit hash.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-xl sm:text-2xl font-black text-brand-slate tracking-tight">
            System Alerts, Edge States & Administrative Safeguards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified guardrails matching Google Stitch specification (Screen ID: 0da938cb27134eb382be379075d76274).
          </p>
        </div>

        {/* 4 Safeguard Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Safeguard 1: Destructive Action Verification */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Destructive Action Verification Lock</h2>
                <p className="text-xs text-slate-400">Two-step confirmation for product archiving</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents accidental deletion of live catalog items or operational extraction batches. Requires explicit safety checkbox confirmation before execution.
            </p>

            <button
              type="button"
              onClick={() => setDestructiveModalOpen(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
            >
              Simulate Destructive Guardrail Modal
            </button>
          </div>

          {/* Safeguard 2: Inventory Discrepancy Reconciliation */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-brand-amber flex items-center justify-center font-bold text-lg">
                ⚖️
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Inventory Discrepancy Reconciliation</h2>
                <p className="text-xs text-slate-400">Tenkasi physical mill vs system count audit</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When courier packing counts differ from physical wooden mortar bottling yields, this guardrail prevents stock over-selling on the public storefront.
            </p>

            <button
              type="button"
              onClick={() => setReconcileModalOpen(true)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition cursor-pointer"
            >
              Launch Reconcile Audit Dialog
            </button>
          </div>

          {/* Safeguard 3: Financial Suspense & Margin Guardrail */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                🛡️
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Rate Spike Suspense Guardrail</h2>
                <p className="text-xs text-slate-400">&gt; 15% price change security restriction</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If an administrator attempts to modify a consumer MRP by more than 15% in a single edit, the system triggers a regulatory compliance alert to prevent unintended pricing typos.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border">
              STATUS: Active (Max Single-Step Drift: ±15.0%)
            </div>
          </div>

          {/* Safeguard 4: Session Security Lockout */}
          <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-lg">
                🔐
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">Administrative Session Verification</h2>
                <p className="text-xs text-slate-400">Tenkasi IP restriction & token expiration</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ensures administrative actions cannot be performed without an active verified session key.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-brand-green font-bold border">
              SESSION: ADM-TK-01 • Verified (IP: 103.24.89.12)
            </div>
          </div>
        </div>
      </div>

      {/* Destructive Guardrail Modal */}
      {destructiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setDestructiveModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
              ✕
            </div>
            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">Confirm Irreversible Deletion</h3>
              <p className="text-slate-500 mt-1">
                This action will archive the extraction batch and delist it from the live store.
              </p>
            </div>

            <label className="flex items-start gap-2 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 cursor-pointer">
              <input
                type="checkbox"
                checked={safetyLockChecked}
                onChange={(e) => setSafetyLockChecked(e.target.checked)}
                className="mt-0.5 rounded text-rose-600"
              />
              <span className="font-bold">I acknowledge that this change will be logged in the immutable audit ledger.</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDestructiveModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletion}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {reconcileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setReconcileModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl z-10 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900">Reconcile Batch #TK-402</h3>
            <p className="text-slate-500">
              System records show 120 bottles bottled, physical packing bay reports 118 bottles.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold">
              Variance: -2 Bottles (-₹498 Adjustment)
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReconcileModalOpen(false)}
                className="px-4 py-2 border rounded-lg font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setReconcileModalOpen(false);
                  addToast({ type: 'success', title: 'Reconciliation Logged', message: 'Batch variance reconciled.' });
                }}
                className="px-4 py-2 bg-brand-slate text-white rounded-lg font-bold"
              >
                Commit Reconcile
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
