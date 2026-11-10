const fs = require('fs');

// 1. AdminSidebar.tsx
let sidebar = fs.readFileSync('frontend/src/components/layout/AdminSidebar.tsx', 'utf-8');
sidebar = sidebar.replace(
  'const isActive =',
  'const isActive = activeId ? item.path.includes(activeId) :'
);
fs.writeFileSync('frontend/src/components/layout/AdminSidebar.tsx', sidebar, 'utf-8');
console.log('Fixed AdminSidebar');

// 2. AboutUsPage.tsx
let about = fs.readFileSync('frontend/src/pages/AboutUsPage.tsx', 'utf-8');
about = about.replace("import { CheckCircleIcon, SparklesIcon, ShieldCheckIcon } from '../components/common/Icons';\n", "");
fs.writeFileSync('frontend/src/pages/AboutUsPage.tsx', about, 'utf-8');
console.log('Fixed AboutUsPage');

// 3. AccountDashboardPage.tsx
let account = fs.readFileSync('frontend/src/pages/AccountDashboardPage.tsx', 'utf-8');
account = account.replace("import { UserIcon, ShoppingBagIcon, MapPinIcon } from '../components/common/Icons';\n", "");
fs.writeFileSync('frontend/src/pages/AccountDashboardPage.tsx', account, 'utf-8');
console.log('Fixed AccountDashboardPage');

// 4. AdminDashboardPage.tsx
let admDash = fs.readFileSync('frontend/src/pages/AdminDashboardPage.tsx', 'utf-8');
admDash = admDash.replace("import { TruckIcon, CheckCircleIcon, SparklesIcon } from '../components/common/Icons';\n", "");
fs.writeFileSync('frontend/src/pages/AdminDashboardPage.tsx', admDash, 'utf-8');
console.log('Fixed AdminDashboardPage');

// 5. AdminOrdersPage.tsx
let admOrders = fs.readFileSync('frontend/src/pages/AdminOrdersPage.tsx', 'utf-8');
admOrders = admOrders.replace("const [loading, setLoading] = useState(true);", "// loading state\n  const [, setLoading] = useState(true);");
fs.writeFileSync('frontend/src/pages/AdminOrdersPage.tsx', admOrders, 'utf-8');
console.log('Fixed AdminOrdersPage');

// 6. AdminPriceAuditPage.tsx
let admAudit = fs.readFileSync('frontend/src/pages/AdminPriceAuditPage.tsx', 'utf-8');
admAudit = admAudit.replace("const [loading, setLoading] = useState(true);", "// loading state\n  const [, setLoading] = useState(true);");
fs.writeFileSync('frontend/src/pages/AdminPriceAuditPage.tsx', admAudit, 'utf-8');
console.log('Fixed AdminPriceAuditPage');

// 7. AdminPricingPage.tsx
let admPricing = fs.readFileSync('frontend/src/pages/AdminPricingPage.tsx', 'utf-8');
admPricing = admPricing.replace("const [loading, setLoading] = useState(true);", "// loading state\n  const [, setLoading] = useState(true);");
fs.writeFileSync('frontend/src/pages/AdminPricingPage.tsx', admPricing, 'utf-8');
console.log('Fixed AdminPricingPage');

// 8. AdminProductsPage.tsx
let admProd = fs.readFileSync('frontend/src/pages/AdminProductsPage.tsx', 'utf-8');
admProd = admProd.replace("import { CheckCircleIcon, SparklesIcon } from '../components/common/Icons';\n", "");
admProd = admProd.replace("const [loading, setLoading] = useState(true);", "// loading state\n  const [, setLoading] = useState(true);");
fs.writeFileSync('frontend/src/pages/AdminProductsPage.tsx', admProd, 'utf-8');
console.log('Fixed AdminProductsPage');

// 9. CheckoutAddressPage.tsx
let chkAddr = fs.readFileSync('frontend/src/pages/CheckoutAddressPage.tsx', 'utf-8');
chkAddr = chkAddr.replace("import { CheckCircleIcon, MapPinIcon } from '../components/common/Icons';\n", "");
fs.writeFileSync('frontend/src/pages/CheckoutAddressPage.tsx', chkAddr, 'utf-8');
console.log('Fixed CheckoutAddressPage');

// 10. CheckoutPaymentPage.tsx
let chkPay = fs.readFileSync('frontend/src/pages/CheckoutPaymentPage.tsx', 'utf-8');
chkPay = chkPay.replace("import { LockIcon, CheckCircleIcon, ShieldCheckIcon, TruckIcon } from '../components/common/Icons';", "import { LockIcon, ShieldCheckIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/CheckoutPaymentPage.tsx', chkPay, 'utf-8');
console.log('Fixed CheckoutPaymentPage');

// 11. CheckoutSuccessPage.tsx
let chkSucc = fs.readFileSync('frontend/src/pages/CheckoutSuccessPage.tsx', 'utf-8');
chkSucc = chkSucc.replace("import { CheckCircleIcon, ShoppingBagIcon } from '../components/common/Icons';", "import { ShoppingBagIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/CheckoutSuccessPage.tsx', chkSucc, 'utf-8');
console.log('Fixed CheckoutSuccessPage');

// 12. ContactWholesalePage.tsx
let contact = fs.readFileSync('frontend/src/pages/ContactWholesalePage.tsx', 'utf-8');
contact = contact.replace("import { CheckCircleIcon, SparklesIcon, ShieldCheckIcon } from '../components/common/Icons';\n", "");
contact = contact.replace("const { language } = useLanguageStore();", "const { language: _lang } = useLanguageStore(); void _lang;");
fs.writeFileSync('frontend/src/pages/ContactWholesalePage.tsx', contact, 'utf-8');
console.log('Fixed ContactWholesalePage');

// 13. OrderTrackingPage.tsx
let ordTrack = fs.readFileSync('frontend/src/pages/OrderTrackingPage.tsx', 'utf-8');
ordTrack = ordTrack.replace("import { TruckIcon, CheckCircleIcon, PackageIcon, MapPinIcon } from '../components/common/Icons';", "import { TruckIcon, PackageIcon } from '../components/common/Icons';");
fs.writeFileSync('frontend/src/pages/OrderTrackingPage.tsx', ordTrack, 'utf-8');
console.log('Fixed OrderTrackingPage');

// 14. PoliciesLegalPage.tsx
let policies = fs.readFileSync('frontend/src/pages/PoliciesLegalPage.tsx', 'utf-8');
policies = policies.replace("import { ShieldCheckIcon, TruckIcon } from '../components/common/Icons';\n", "");
policies = policies.replace("const { language } = useLanguageStore();", "const { language: _lang } = useLanguageStore(); void _lang;");
fs.writeFileSync('frontend/src/pages/PoliciesLegalPage.tsx', policies, 'utf-8');
console.log('Fixed PoliciesLegalPage');

// 15. ProductDetailPage.tsx
let prodDetail = fs.readFileSync('frontend/src/pages/ProductDetailPage.tsx', 'utf-8');
prodDetail = prodDetail.replace("  ShieldCheckIcon,\n", "");
prodDetail = prodDetail.replace("  SparklesIcon,\n", "");
fs.writeFileSync('frontend/src/pages/ProductDetailPage.tsx', prodDetail, 'utf-8');
console.log('Fixed ProductDetailPage');
