const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/MobileBottomNavigation.tsx', 'utf-8');

// Replace tabs
code = code.replace(
  /id: 'home',[\s\S]*?isActive: currentPath === '\/' \|\| currentPath === '\/home'/,
  "id: 'home' as MobileTab,\n      label: 'Home',\n      tamil: 'முகப்பு',\n      path: '/',\n      isActive: propActiveTab ? propActiveTab === 'home' : (currentPath === '/' || currentPath === '/home')"
);

code = code.replace(
  /id: 'catalog',[\s\S]*?isActive: currentPath\.startsWith\('\/shop'\) \|\| currentPath\.startsWith\('\/products'\)/,
  "id: 'catalog' as MobileTab,\n      label: 'Shop',\n      tamil: 'அங்காடி',\n      path: '/shop',\n      isActive: propActiveTab ? propActiveTab === 'catalog' : (currentPath.startsWith('/shop') || currentPath.startsWith('/products'))"
);

code = code.replace(
  /id: 'cart',[\s\S]*?isActive: currentPath\.startsWith\('\/cart'\)/,
  "id: 'cart' as MobileTab,\n      label: 'Cart',\n      tamil: 'கூடை',\n      path: '/cart',\n      isActive: propActiveTab ? propActiveTab === 'cart' : currentPath.startsWith('/cart')"
);

code = code.replace(
  /id: 'account',[\s\S]*?isActive: currentPath\.startsWith\('\/account'\) \|\| currentPath\.startsWith\('\/login'\) \|\| currentPath\.startsWith\('\/orders'\)/,
  "id: 'account' as MobileTab,\n      label: 'Account',\n      tamil: 'கணக்கு',\n      path: '/account',\n      isActive: propActiveTab ? propActiveTab === 'account' : (currentPath.startsWith('/account') || currentPath.startsWith('/login') || currentPath.startsWith('/orders'))"
);

code = code.replace(
  'onClick={() => navigate(tab.path)}',
  'onClick={() => { if (onTabChange) onTabChange(tab.id); navigate(tab.path); }}'
);

fs.writeFileSync('frontend/src/components/layout/MobileBottomNavigation.tsx', code, 'utf-8');
console.log('Successfully updated MobileBottomNavigation.tsx');
