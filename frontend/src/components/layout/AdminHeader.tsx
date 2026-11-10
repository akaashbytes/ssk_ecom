import React from 'react';
import { SearchIcon, UserIcon } from '../common/Icons';

export interface AdminHeaderProps {
  adminName?: string;
  role?: string;
  millStatusText?: string;
  onSearch?: (query: string) => void;
  notificationCount?: number;
  isSticky?: boolean;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminName = 'Admin Desk',
  role = 'Tenkasi Mill HQ',
  millStatusText = 'Live Tenkasi Mill Desk',
  onSearch,
  notificationCount = 2,
  isSticky = true,
  onToggleMobileMenu,
}) => {
  return (
    <header
      className={`h-16 bg-white/95 backdrop-blur-md border-b border-surface-border shadow-subtle flex items-center justify-between px-3 sm:px-6 z-30 ${
        isSticky ? 'sticky top-0' : 'relative'
      }`}
    >
      {/* Left Mobile Menu Toggle + Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search orders, SKU batches..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-slate-50 pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 rounded-lg text-xs text-brand-slate placeholder:text-slate-400 border border-surface-border focus:outline-none focus:bg-white focus:border-brand-amber transition-all"
          />
          <span className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none">
            <SearchIcon size={16} />
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Live Mill Desk Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-brand-green">
          <span className="w-2 h-2 rounded-full bg-functional-success animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight">{millStatusText}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-amber" />
          )}
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-surface-border">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block leading-tight">
              {adminName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block leading-tight">
              {role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-slate text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <UserIcon size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};
