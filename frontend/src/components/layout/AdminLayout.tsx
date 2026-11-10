import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAppStore } from '../../stores/useAppStore';
import { MOCK_ADMIN } from '../../mock';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  // Client-Side Session Check (Demonstration Mock Guard)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl text-brand-amber">
            🔒
          </div>
          <h2 className="text-xl font-black text-white">Admin Authentication Required</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Tenkasi mill operations desk is restricted to authorized personnel. Please sign in to access order fulfillment, pricing controls, and dispatch tools.
          </p>

          <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-[11px] text-slate-400 text-left space-y-1">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
              Prototype Security Notice:
            </span>
            <p>
              This is a development client-side session boundary. Frontend-only route guards provide prototype workflow evaluation and do not provide production server-level security.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-amber hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Go to Admin Login →
            </Link>
            <button
              type="button"
              onClick={() => setCurrentUser(MOCK_ADMIN)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Quick Demo Authenticate
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/60">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Desktop Sidebar */}
      <AdminSidebar className="hidden lg:flex" />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex">
            <AdminSidebar onClose={() => setMobileMenuOpen(false)} className="flex shadow-2xl" />
          </div>
        </div>
      )}

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
