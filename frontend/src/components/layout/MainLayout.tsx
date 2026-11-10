import React from 'react';
import { Outlet } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-lg tracking-wide text-amber-700">
            SSK Natural Gold
          </div>
          <nav className="flex space-x-6 text-sm font-medium text-stone-600">
            <span className="hover:text-amber-700 cursor-pointer">Catalog</span>
            <span className="hover:text-amber-700 cursor-pointer">About</span>
            <span className="hover:text-amber-700 cursor-pointer">Contact</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} SSK Natural Gold. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
