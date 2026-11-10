import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBagIcon, TruckIcon } from '../common/Icons';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useCartStore } from '../../stores/useCartStore';

export type MobileTab = 'home' | 'catalog' | 'cart' | 'account' | 'track';

export interface MobileBottomNavigationProps {
  isFixed?: boolean;
  activeTab?: MobileTab;
  onTabChange?: (tab: MobileTab) => void;
  cartCount?: number;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  isFixed = true,
  activeTab: propActiveTab,
  onTabChange,
  cartCount: propCartCount,
}) => {
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const storeCartCount = useCartStore((state) => state.getItemCount());
  const cartCount = propCartCount !== undefined ? propCartCount : storeCartCount;

  const currentPath = location.pathname;

  const tabs = [
    {
      id: 'home' as MobileTab,
      label: 'Home',
      tamil: 'முகப்பு',
      path: '/',
      isActive: propActiveTab ? propActiveTab === 'home' : (currentPath === '/' || currentPath === '/home'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'catalog' as MobileTab,
      label: 'Shop',
      tamil: 'அங்காடி',
      path: '/shop',
      isActive: propActiveTab ? propActiveTab === 'catalog' : (currentPath.startsWith('/shop') || currentPath.startsWith('/products')),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'cart' as MobileTab,
      label: 'Cart',
      tamil: 'கூடை',
      path: '/cart',
      isActive: propActiveTab ? propActiveTab === 'cart' : currentPath.startsWith('/cart') || currentPath.startsWith('/checkout'),
      icon: <ShoppingBagIcon size={20} />,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'track' as MobileTab,
      label: 'Track',
      tamil: 'கண்காணிப்பு',
      path: '/track',
      isActive: propActiveTab
        ? propActiveTab === 'track'
        : (currentPath.startsWith('/track') || currentPath.startsWith('/orders') || currentPath.startsWith('/account')),
      icon: <TruckIcon size={20} />,
    },
  ];

  const positionStyles = isFixed
    ? 'fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border md:hidden shadow-lg pb-safe'
    : 'relative w-full bg-white border-t border-surface-border shadow-xs';

  return (
    <nav aria-label="Mobile navigation" className={positionStyles}>
      <div className="grid grid-cols-4 h-16 items-center">
        {tabs.map((tab) => {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { if (onTabChange) onTabChange(tab.id); navigate(tab.path); }}
              className={`flex flex-col items-center justify-center gap-1 h-full py-1 text-center transition-colors cursor-pointer relative ${
                tab.isActive ? 'text-brand-amber font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-amber text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center tnum">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none tracking-tight ${language === 'ta' ? 'font-tamil' : ''}`}>
                {language === 'ta' ? tab.tamil : tab.label}
              </span>
              {tab.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-amber absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
