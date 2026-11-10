import React from 'react';
import { CustomerHeader } from './CustomerHeader';
import { CustomerFooter } from './CustomerFooter';
import { MobileBottomNavigation } from './MobileBottomNavigation';

export interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle text-slate-800 antialiased">
      <CustomerHeader />
      <main className="flex-1 flex flex-col w-full">{children}</main>
      <CustomerFooter />
      <MobileBottomNavigation />
    </div>
  );
};
