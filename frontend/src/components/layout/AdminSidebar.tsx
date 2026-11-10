import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoImg } from '../../assets';
import { useAppStore } from '../../stores/useAppStore';

export interface AdminSidebarProps {
  activeId?: string;
  onLogout?: () => void;
  onClose?: () => void;
  className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onLogout,
  onClose,
  className = '',
  activeId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const currentPath = location.pathname;

  const coreNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Order Requests & Fulfillment', path: '/admin/orders', icon: '🚚' },
    { label: 'Products & Inventory', path: '/admin/products', icon: '🫙' },
    { label: 'Add New Product', path: '/admin/products/new', icon: '➕' },
    { label: 'Dynamic Rate Matrix', path: '/admin/pricing', icon: '🏷️' },
    { label: 'Price Audit Ledger', path: '/admin/pricing/audit', icon: '📜' },
    { label: 'Safety Safeguards', path: '/admin/safeguards', icon: '🛡️' },
    { label: 'Business Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`w-64 bg-white border-r border-surface-border flex flex-col justify-between py-6 px-4 select-none shrink-0 ${className}`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link to="/admin/dashboard" onClick={handleNavClick} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-slate-900 p-1 border border-amber-500/50 flex items-center justify-center shrink-0">
              <img src={logoImg} alt="SSK Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-brand-slate leading-tight tracking-tight truncate">
                SSK Natural Gold
              </span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-0.5 truncate">
                Tenkasi Operations
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Core Nav Group */}
        <div>
          <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Mill Management
          </span>
          <nav className="flex flex-col gap-1">
            {coreNavItems.map((item) => {
              const isActive = activeId
                ? item.path.includes(activeId)
                : item.path === '/admin/dashboard'
                ? currentPath === '/admin' || currentPath === '/admin/dashboard'
                : currentPath.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-slate text-white shadow-subtle'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Nav Group */}
      <div className="pt-6 border-t border-slate-100 flex flex-col gap-1">
        <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Store & Exit
        </span>
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          <span>🌐</span>
          <span>View Live Storefront</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            setCurrentUser(null);
            if (onLogout) onLogout();
            else navigate('/admin/login');
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer text-left w-full"
        >
          <span>🚪</span>
          <span>Sign Out of Desk</span>
        </button>
      </div>
    </aside>
  );
};
