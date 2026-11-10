const fs = require('fs');

// AccountDashboardPage
let f1 = fs.readFileSync('frontend/src/pages/AccountDashboardPage.tsx', 'utf-8');
f1 = f1.replace(/import\s*\{\s*UserIcon,\s*ShoppingBagIcon,\s*MapPinIcon,\s*TruckIcon\s*\}\s*from\s*'\.\.\/components\/common\/Icons';/, "import { TruckIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/AccountDashboardPage.tsx', f1, 'utf-8');

// CheckoutPaymentPage
let f2 = fs.readFileSync('frontend/src/pages/CheckoutPaymentPage.tsx', 'utf-8');
f2 = f2.replace(/import\s*\{\s*CheckCircleIcon,\s*ShieldCheckIcon,\s*TruckIcon\s*\}\s*from\s*'\.\.\/components\/common\/Icons';/, "import { ShieldCheckIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/CheckoutPaymentPage.tsx', f2, 'utf-8');

// CheckoutSuccessPage
let f3 = fs.readFileSync('frontend/src/pages/CheckoutSuccessPage.tsx', 'utf-8');
f3 = f3.replace(/import\s*\{\s*CheckCircleIcon,\s*TruckIcon\s*\}\s*from\s*'\.\.\/components\/common\/Icons';/, "import { TruckIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/CheckoutSuccessPage.tsx', f3, 'utf-8');

// OrderTrackingPage
let f4 = fs.readFileSync('frontend/src/pages/OrderTrackingPage.tsx', 'utf-8');
f4 = f4.replace(/import\s*\{\s*TruckIcon,\s*CheckCircleIcon,\s*MapPinIcon\s*\}\s*from\s*'\.\.\/components\/common\/Icons';/, "import { TruckIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/OrderTrackingPage.tsx', f4, 'utf-8');

console.log('Fixed all 4 remaining icon imports');
