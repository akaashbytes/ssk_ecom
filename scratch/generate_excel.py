import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_status_matrix():
    wb = openpyxl.Workbook()
    # Remove default sheet
    default_sheet = wb.active
    wb.remove(default_sheet)

    # Styles
    navy_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    amber_fill = PatternFill(start_color="D48817", end_color="D48817", fill_type="solid")
    green_fill = PatternFill(start_color="166534", end_color="166534", fill_type="solid")
    slate_header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
    soft_slate_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    zebra_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    green_tag_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
    amber_tag_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    red_tag_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")

    white_bold = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    white_title = Font(name="Segoe UI", size=16, bold=True, color="FFFFFF")
    white_sub = Font(name="Segoe UI", size=10, italic=True, color="E2E8F0")
    header_font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    bold_font = Font(name="Segoe UI", size=10, bold=True, color="1E293B")
    regular_font = Font(name="Segoe UI", size=10, color="1E293B")
    small_font = Font(name="Segoe UI", size=9, color="64748B")
    tag_green_font = Font(name="Segoe UI", size=9, bold=True, color="15803D")
    tag_amber_font = Font(name="Segoe UI", size=9, bold=True, color="D97706")
    tag_red_font = Font(name="Segoe UI", size=9, bold=True, color="DC2626")

    thin_border_side = Side(border_style="thin", color="CBD5E1")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    thick_bottom = Border(bottom=Side(border_style="medium", color="1E293B"))

    center_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
    left_align = Alignment(horizontal="left", vertical="center", wrap_text=True)
    right_align = Alignment(horizontal="right", vertical="center", wrap_text=True)

    # =========================================================================
    # TAB 1: EXECUTIVE SUMMARY
    # =========================================================================
    ws1 = wb.create_sheet(title="Executive Summary")
    ws1.views.sheetView[0].showGridLines = True

    # Title Banner
    ws1.merge_cells("A1:G2")
    ws1["A1"] = "SSK NATURAL GOLD — PROJECT STATUS & READINESS SUMMARY"
    ws1["A1"].font = white_title
    ws1["A1"].fill = navy_fill
    ws1["A1"].alignment = Alignment(horizontal="left", vertical="center", indent=1)

    ws1.merge_cells("A3:G3")
    ws1["A3"] = "Enterprise E-Commerce Platform for Wood-Pressed Edible Oils | Production Assessment Matrix (Date: 04 Nov 2026)"
    ws1["A3"].font = bold_font
    ws1["A3"].fill = soft_slate_fill
    ws1["A3"].alignment = Alignment(horizontal="left", vertical="center", indent=1)

    # Key Metrics Cards Table
    kpis = [
        ("Total Frontend Routes Defined", "28 Routes (26 distinct functional views + aliases)", "100% Implemented (React Router v7)"),
        ("Customer Storefront Screens", "19 Pages", "100% Implemented with Interactive Mock State"),
        ("Admin Management Screens", "7 Complete Consoles", "100% Implemented with Simulated Workflows"),
        ("Shared & Showcase Views", "2 Routes (/design-system, /showcase)", "Active Reference Component Gallery"),
        ("Reusable UI Primitive Components", "17 Common Components", "Standardized in /src/components/common/"),
        ("Domain & Product Components", "6 Product Components", "Standardized in /src/components/product/"),
        ("Layout Wrappers", "10 Shell Layouts", "Bilingual Customer & Admin Responsive Shells"),
        ("Global State Stores (Zustand)", "4 Reactive Stores", "Cart (Persisted), App (Persisted), Lang, Toast"),
        ("Simulated Data Services", "4 Service Modules", "Auth, Products, Orders, Admin Services"),
        ("Google Stitch Design Screens", "35 Approved Screen Specs", "100% Mapped to Component Tree"),
        ("Backend Status", "PostgreSQL + Prisma Scaffold", "INTENTIONALLY POSTPONED (Express /api/health live)"),
        ("Live Backend Endpoints", "1 Working (GET /api/health)", "Database models & feature APIs to be implemented"),
    ]

    ws1.cell(row=5, column=1, value="Project Metric / Dimension").font = header_font
    ws1.cell(row=5, column=1).fill = slate_header_fill
    ws1.cell(row=5, column=1).alignment = left_align

    ws1.cell(row=5, column=2, value="Current Inspected State").font = header_font
    ws1.cell(row=5, column=2).fill = slate_header_fill
    ws1.cell(row=5, column=2).alignment = left_align

    ws1.cell(row=5, column=3, value="Operational Status & Architectural Role").font = header_font
    ws1.cell(row=5, column=3).fill = slate_header_fill
    ws1.cell(row=5, column=3).alignment = left_align

    for r_idx, (m, val, stat) in enumerate(kpis, start=6):
        c1 = ws1.cell(row=r_idx, column=1, value=m)
        c2 = ws1.cell(row=r_idx, column=2, value=val)
        c3 = ws1.cell(row=r_idx, column=3, value=stat)

        c1.font = bold_font
        c2.font = regular_font
        c3.font = small_font

        c1.border = cell_border
        c2.border = cell_border
        c3.border = cell_border

        if r_idx % 2 == 0:
            c1.fill = zebra_fill
            c2.fill = zebra_fill
            c3.fill = zebra_fill

    # Architectural Readiness Summary Box
    ws1.merge_cells("A19:G19")
    ws1["A19"] = "ARCHITECTURAL READINESS & STRATEGIC HIGHLIGHTS"
    ws1["A19"].font = white_bold
    ws1["A19"].fill = navy_fill
    ws1["A19"].alignment = left_align

    notes = [
        "1. Priority Alignment: The frontend is 100% developed across all 10 planned feature batches. It operates standalone in high fidelity.",
        "2. Client Modification Ready: UI copy, oil varieties, pack volumes, prices, and banners can be modified directly in mock datasets and tokens.",
        "3. Zero Backend Mock Leakage: Frontend services (authService, orderService, adminService) isolate mock delays, mimicking REST API contracts.",
        "4. Seamless Backend Transition: When backend development commences, services will simply replace local mocks with apiClient (Axios) calls.",
        "5. Dual Language Completeness: Instant zero-latency switching between English and Tamil (தமிழ்) implemented across all core customer journeys."
    ]

    for idx, note in enumerate(notes, start=20):
        ws1.merge_cells(f"A{idx}:G{idx}")
        ws1[f"A{idx}"] = note
        ws1[f"A{idx}"].font = regular_font
        ws1[f"A{idx}"].alignment = left_align

    # =========================================================================
    # TAB 2: COMPLETE MODULES & SCREENS MATRIX
    # =========================================================================
    ws2 = wb.create_sheet(title="Screens & Modules Matrix")
    ws2.views.sheetView[0].showGridLines = True

    headers2 = [
        "Module Name",
        "Screen Name",
        "Route(s)",
        "Source File",
        "Accessible Roles",
        "Frontend Status",
        "Data Source",
        "Backend Requirement",
        "Key Interactive Features",
        "Production Risk Level"
    ]

    for col_idx, h in enumerate(headers2, start=1):
        cell = ws2.cell(row=1, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = navy_fill
        cell.alignment = center_align
        cell.border = cell_border

    screens_data = [
        # Customer Storefront
        ("Storefront", "Homepage", "/, /home", "frontend/src/pages/HomePage.tsx", "Guest, Customer", "Complete", "Mock Products, Assets", "GET /api/products/featured, GET /api/banners", "Hero banners, Quick add-to-cart, Pack selector, FAQ accordion, Video mill showcase, Wholesale modal", "Low"),
        ("Storefront", "Shop All / Catalogue", "/shop, /products", "frontend/src/pages/ShopAllPage.tsx", "Guest, Customer", "Complete", "productService.getAllProducts()", "GET /api/products?category=&sort=&q=", "Search bar, Category tabs (Groundnut, Sesame, Coconut), Stock filter, Price sorting, Mobile filter drawer, Quick add", "Low"),
        ("Storefront", "Product Details Page", "/products/:slug, /product/:slug", "frontend/src/pages/ProductDetailPage.tsx", "Guest, Customer", "Complete", "productService.getProductBySlug()", "GET /api/products/:slug, POST /api/shipping/check-pincode", "Multi-pack pills (500ml, 1L, 5L, 15L), Pincode delivery lookup, Nutritional facts table, Vaagai extraction story, Gallery zoom", "Low"),
        ("Checkout", "Shopping Cart", "/cart", "frontend/src/pages/CartPage.tsx", "Guest, Customer", "Complete", "useCartStore (localStorage)", "GET /api/cart, POST /api/cart/validate-coupon", "Quantity stepper, Trash remove, Promo code engine (NATURAL50, WELCOME100), Free delivery progress bar (₹500 threshold), 5% GST preview", "Medium (Pricing rules)"),
        ("Checkout", "Delivery Address", "/checkout, /checkout/address", "frontend/src/pages/CheckoutAddressPage.tsx", "Guest, Customer", "Complete", "useAppStore (localStorage)", "GET /api/customer/addresses, POST /api/customer/addresses", "Address radio selector, Default badge, Modal for adding new Tamil Nadu / Pan-India address, Order summary card", "Low"),
        ("Checkout", "Payment Selection", "/checkout/payment", "frontend/src/pages/CheckoutPaymentPage.tsx", "Guest, Customer", "Complete", "orderService.placeOrder(), useCartStore", "POST /api/orders/checkout, POST /api/payments/razorpay/order", "Payment method tabs (UPI, Card, NetBanking, COD), UPI ID input, Simulated payment failure toggle, Safe SSL security badge", "High (Payment Gateway integration)"),
        ("Checkout", "Order Success & Confirmation", "/checkout/success", "frontend/src/pages/CheckoutSuccessPage.tsx", "Guest, Customer", "Complete", "orderService.getOrderById()", "GET /api/orders/:orderNumber, POST /api/notifications/sms", "Bouncing success checkmark, Order reference #SSK-2026-XXXX, Mill batch allocation, Delivery estimate, Direct tracking link", "Low"),
        ("Auth", "Customer Login", "/login", "frontend/src/pages/LoginPage.tsx", "Guest", "Complete", "authService.loginWithPassword()", "POST /api/auth/login, POST /api/auth/send-otp", "Password login tab, OTP login tab, Quick Demo Customer button, Remember me checkbox, Forgot password link", "High (JWT / OAuth2 / SMS OTP backend)"),
        ("Auth", "Customer Registration", "/register", "frontend/src/pages/RegisterPage.tsx", "Guest", "Complete", "authService.registerUser()", "POST /api/auth/register", "Name, mobile, email fields, Terms agreement checkbox, Quick Demo Customer fill, Redirect to verification", "Medium (SMS Gateway)"),
        ("Auth", "OTP Verification", "/verify-otp", "frontend/src/pages/OtpVerificationPage.tsx", "Guest", "Complete", "authService.loginWithOtp()", "POST /api/auth/verify-otp, POST /api/auth/resend-otp", "6-box auto-focus OTP inputs, 29s countdown resend timer, Demo OTP 123456 autofill, Dynamic redirect to previous page", "High (SMS Gateway integration)"),
        ("Auth", "Forgot Password", "/forgot-password", "frontend/src/pages/ForgotPasswordPage.tsx", "Guest", "Complete", "Simulated timer & redirect", "POST /api/auth/forgot-password", "Registered mobile / email input, Simulated SMS recovery link dispatch, Back to sign in", "Medium"),
        ("Auth", "Reset Password", "/reset-password", "frontend/src/pages/ResetPasswordPage.tsx", "Guest", "Complete", "Simulated password reset", "POST /api/auth/reset-password", "New password, confirm password, password strength indicator, Success toast & redirect to login", "Medium"),
        ("Account", "Customer Account Dashboard", "/account", "frontend/src/pages/AccountDashboardPage.tsx", "Customer", "Complete", "useAppStore (currentUser), orderService", "GET /api/customer/profile, GET /api/customer/active-order", "Profile card, Member since tag, Live active order status widget, Address cards, Quick reorder, Logout modal", "Low"),
        ("Account", "Order History", "/account/orders", "frontend/src/pages/OrderHistoryPage.tsx", "Customer", "Complete", "orderService.getCustomerOrders()", "GET /api/customer/orders", "Filter tabs (All, Active, Delivered), Order item cards, Total price, Courier AWB pill, Link to tracking", "Low"),
        ("Account", "Live Order Tracking", "/orders/:orderId, /track", "frontend/src/pages/OrderTrackingPage.tsx", "Guest, Customer", "Complete", "orderService.getOrderById()", "GET /api/orders/:orderId/track, GET /api/logistics/tpc-awb", "5-step vertical mill-to-doorstep timeline, Courier partner pill (TPC), Copy AWB button, Delivery address snapshot", "Medium (Courier API integration)"),
        ("Content", "About Us & Mill Heritage", "/about", "frontend/src/pages/AboutUsPage.tsx", "Guest, Customer", "Complete", "Static verified content", "None (Static CMS optional)", "Vaagai wood cold press explanation, Karupatti palm jaggery medicinal tradition, Chekkurani mill story, FSSAI badge", "Low"),
        ("Content", "FAQ Hub", "/faq", "frontend/src/pages/AboutUsPage.tsx?tab=faq", "Guest, Customer", "Complete", "Static verified FAQ data", "None (Static CMS optional)", "6 bilingual expandable accordions (shelf life, sedimentation, bulk delivery, cold press vs refined oil)", "Low"),
        ("Content", "Contact & Wholesale B2B", "/contact, /wholesale", "frontend/src/pages/ContactWholesalePage.tsx", "Guest, Customer", "Complete", "adminService.submitWholesaleLead()", "POST /api/leads/wholesale, POST /api/contact", "B2B wholesale quote form (GSTIN, monthly volume tins, category selection), Mill contact details, WhatsApp direct link", "Low"),
        ("Content", "Policies & Legal Hub", "/policies, /terms, /privacy, /returns, /shipping", "frontend/src/pages/PoliciesLegalPage.tsx", "Guest, Customer", "Complete", "Static legal policies", "None (Static legal text)", "Tabbed interface for Shipping & Delivery, Return & Refund, Terms of Service, Privacy Policy, Central FSSAI license", "Low"),
        ("Design", "Component Showcase", "/design-system, /showcase", "frontend/src/components/showcase/ComponentShowcase.tsx", "Developer, Admin", "Complete", "Design tokens (/tokens/)", "None (Internal Developer Hub)", "Interactive gallery of buttons, badges, typography, product cards, modals, form controls, and color swatches", "Low"),
        # Admin Operations Console
        ("Admin", "Admin Login Console", "/admin/login", "frontend/src/pages/AdminLoginPage.tsx", "Admin (Unauthenticated)", "Complete", "authService.loginWithPassword()", "POST /api/admin/auth/login", "Tenkasi Mill credentials form, One-Click Demo Admin autofill, Mill security badge, Redirect to /admin/dashboard", "High (Role-based JWT backend)"),
        ("Admin", "Admin Dashboard Overview", "/admin, /admin/dashboard", "frontend/src/pages/AdminDashboardPage.tsx", "Admin", "Complete", "adminService.getDashboardMetrics(), orderService", "GET /api/admin/metrics/overview, GET /api/admin/orders/recent", "4 KPI cards (Today Revenue ₹38,450, 18 Orders, 6 Dispatches, 1 Low Stock), 7-day revenue trend chart, Quick counter order modal", "Medium"),
        ("Admin", "Product & Stock Inventory", "/admin/products", "frontend/src/pages/AdminProductsPage.tsx", "Admin", "Complete", "productService.getAllProducts()", "GET /api/admin/products, PUT /api/admin/products/:id/stock", "Oil SKU table, Pack sizes, Live stock in litres, Category badges, Stock adjustment modal, Export inventory sheet trigger", "Medium"),
        ("Admin", "Product Studio (Add/Edit)", "/admin/products/new, /admin/products/:id", "frontend/src/pages/AdminProductStudioPage.tsx", "Admin", "Complete", "Local state & toast confirmation", "POST /api/admin/products, PUT /api/admin/products/:id", "3-tab editor (General metadata, Variant pricing/SKUs, FSSAI compliance), Botanical names, Tamil descriptions, Save trigger", "Medium"),
        ("Admin", "Dynamic Price Management", "/admin/pricing", "frontend/src/pages/AdminPricingPage.tsx", "Admin", "Complete", "adminService.getPriceMatrix(), updatePriceItem()", "GET /api/admin/pricing, POST /api/admin/pricing/update", "Tenkasi seed cost formula simulator, Interactive margin slider, Quick price updater, Bulk tier discount percentages", "Medium"),
        ("Admin", "Price Audit History Ledger", "/admin/pricing/audit", "frontend/src/pages/AdminPriceAuditPage.tsx", "Admin", "Complete", "adminService.getPriceAuditLogs()", "GET /api/admin/pricing/audit-logs", "Cryptographic audit trail table, Timestamp IST, Product variant, Previous MRP vs New Price, Variance %, Modifier memo", "Low"),
        ("Admin", "Order Fulfillment & Dispatches", "/admin/orders", "frontend/src/pages/AdminOrdersPage.tsx", "Admin", "Complete", "orderService.getCustomerOrders(), updateOrderStatus()", "GET /api/admin/orders, PUT /api/admin/orders/:id/status", "Order fulfillment table, Status dropdown (Placed, Packing, Dispatched, Delivered), Courier AWB assigner, Pick list print", "Medium"),
        ("Admin", "Safety Safeguards & Alerts", "/admin/safeguards", "frontend/src/pages/AdminSafeguardsPage.tsx", "Admin", "Complete", "Local safeguard guardrails", "GET /api/admin/safeguards/audit", "Destructive deletion lock (2-step check), Inventory reconciliation tool, Out-of-stock emergency toggle, Safety logs", "Low"),
        ("System", "404 Not Found Page", "*", "frontend/src/pages/NotFoundPage.tsx", "All Users", "Complete", "Static layout", "None", "Compass illustration, Warm explanatory message, One-click return to homepage", "Low")
    ]

    for r_idx, row in enumerate(screens_data, start=2):
        for c_idx, val in enumerate(row, start=1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=val)
            cell.font = regular_font
            cell.border = cell_border
            cell.alignment = left_align

            # Special column alignments and tags
            if c_idx in [5, 6, 10]:
                cell.alignment = center_align

            if c_idx == 6:  # Frontend Status
                cell.fill = green_tag_fill
                cell.font = tag_green_font
            elif c_idx == 10:  # Risk Level
                if val == "High (Payment Gateway integration)" or "High" in val:
                    cell.fill = red_tag_fill
                    cell.font = tag_red_font
                elif "Medium" in val:
                    cell.fill = amber_tag_fill
                    cell.font = tag_amber_font
                else:
                    cell.fill = green_tag_fill
                    cell.font = tag_green_font

        if r_idx % 2 == 1:
            for c_idx in range(1, len(row) + 1):
                if c_idx not in [6, 10]:
                    ws2.cell(row=r_idx, column=c_idx).fill = zebra_fill

    # =========================================================================
    # TAB 3: REUSABLE UI COMPONENTS INVENTORY
    # =========================================================================
    ws3 = wb.create_sheet(title="UI Components Inventory")
    ws3.views.sheetView[0].showGridLines = True

    headers3 = [
        "Category",
        "Component Name",
        "File Path",
        "Variants / Props",
        "Key Capabilities & Visual Specifications",
        "Usage Across Pages"
    ]

    for col_idx, h in enumerate(headers3, start=1):
        cell = ws3.cell(row=1, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = slate_header_fill
        cell.alignment = center_align
        cell.border = cell_border

    components_data = [
        ("Common Primitive", "Button", "frontend/src/components/common/Button.tsx", "variant: primary, amber, green, secondary, ghost, danger | size: sm, md, lg", "Interactive tap states (scale 0.98), Loading spinner state, Full-width option, Disabled states", "Universal (Header, Cards, Modals, Forms)"),
        ("Common Primitive", "Badge", "frontend/src/components/common/Badge.tsx", "variant: amber, green, green-solid, slate, success, warning, error, info | pill, dot", "Floating pack badges, Bestseller ribbons, Pulsing availability indicator, Tamil labels", "HomePage, ProductCard, ShopAllPage, Admin"),
        ("Common Primitive", "Card", "frontend/src/components/common/Card.tsx", "hoverable, elevated, padding: none, sm, md, lg", "Standard 1px slate border (#E2E8F0), 8px or 16px radius, subtle diffused shadows", "ShopAllPage, AccountDashboard, AdminDashboard"),
        ("Common Primitive", "Input", "frontend/src/components/common/Input.tsx", "label, hint, error, leftIcon, rightIcon, fullWidth", "Amber focus ring, Small-caps persistent labels, Inline validation error microcopy", "Login, Register, Checkout, ProductStudio"),
        ("Common Primitive", "Select", "frontend/src/components/common/Select.tsx", "label, options: [{value, label}], error", "Custom SVG chevron, Native select fallback for touch accessibility", "CheckoutAddress, ContactWholesale, ProductStudio"),
        ("Common Primitive", "Checkbox", "frontend/src/components/common/Checkbox.tsx", "label, checked, onChange, disabled", "Custom square checkbox, Slate active fill, Accessibility aria states", "CheckoutPayment, AdminSafeguards, Login"),
        ("Common Primitive", "Radio", "frontend/src/components/common/Radio.tsx", "label, name, value, checked, onChange", "Custom circular radio, Brand amber/slate active dot, Address card selector", "CheckoutAddress, CheckoutPayment"),
        ("Common Primitive", "Modal", "frontend/src/components/common/Modal.tsx", "isOpen, onClose, title, size: sm, md, lg, xl", "Backdrop blur scrim (rgba(30,41,59,0.45)), Escape key trap, Smooth fade/scale animation", "Wholesale modal, Safeguards modal, Address modal"),
        ("Common Primitive", "Dialog / ConfirmationDialog", "frontend/src/components/common/ConfirmationDialog.tsx", "isOpen, title, message, confirmText, isDestructive", "Administrative guardrails for dangerous actions, Two-step confirmation", "AdminSafeguardsPage, AdminProductsPage"),
        ("Common Primitive", "Toast & ToastContainer", "frontend/src/components/common/Toast.tsx", "type: success, error, warning, info | autoDismiss", "Floating top-right notification stack, SVG icons, Auto-dismiss after 4000ms", "Universal across all interactive triggers"),
        ("Common Primitive", "LoadingSpinner & SkeletonLoader", "frontend/src/components/common/LoadingSpinner.tsx", "size: sm, md, lg | lines, cards, table skeletons", "Amber spinner ring, Shimmer gradient across #F1F5F9 to #E2E8F0 for image & text slots", "ShopAllPage, ProductDetailPage, Admin"),
        ("Common Primitive", "EmptyState & ErrorState", "frontend/src/components/common/EmptyState.tsx", "title, description, icon, actionButton", "Zero cart items art, No orders found, Search query not found fallback", "CartPage, OrderHistoryPage, ShopAllPage"),
        ("Common Primitive", "LanguageSwitcher", "frontend/src/components/common/LanguageSwitcher.tsx", "variant: segmented, pill | size: sm, md", "Instant EN / தமிழ் switcher, zero reload, triggers Zustand useLanguageStore", "CustomerHeader, MobileBottomNav, Footer"),
        ("Common Primitive", "Icons", "frontend/src/components/common/Icons.tsx", "24+ hand-crafted SVG icon components", "ShoppingBag, Search, Menu, X, CheckCircle, Truck, Trash, Sparkles, Chevron, Shield, etc.", "Universal across frontend"),
        ("Product Component", "ProductCard", "frontend/src/components/product/ProductCard.tsx", "packSizes, badgeText, onAddToCart, onWishlistToggle", "1:1 bottle media, Inline pack size pills (500ml, 1L, 5L), Live price update, Quantity stepper", "HomePage, ShopAllPage"),
        ("Product Component", "PriceDisplay", "frontend/src/components/product/PriceDisplay.tsx", "price, originalPrice, size: sm, card, lg, hero", "Tabular numerals (tnum), Indian Rupee format (₹), Strikethrough MRP, Discount % pill", "ProductCard, ProductDetail, Cart, Checkout"),
        ("Product Component", "ProductImage", "frontend/src/components/product/ProductImage.tsx", "src, alt, aspectRatio, fallbackImage", "Handles bottle JPEG loads, Soft neutral background (#F8FAFC), Skeleton shimmer fallback", "ProductCard, CartRow, OrderTracking"),
        ("Product Component", "QuantitySelector", "frontend/src/components/product/QuantitySelector.tsx", "value, onChange, min, max, size: sm, md", "Unified minus/count/plus pill, Minimum tap targets 44x44px, Disabled limits", "ProductCard, CartPage, ProductDetailPage"),
        ("Product Component", "RatingDisplay", "frontend/src/components/product/RatingDisplay.tsx", "rating, reviewCount, size: sm, md", "Golden star SVGs, Tabular numeric rating (e.g. 4.95), Review count in parentheses", "ProductDetailPage, ShopAllPage"),
        ("Product Component", "StockStatus", "frontend/src/components/product/StockStatus.tsx", "inStock, stockQuantity, threshold", "Pulsing green dot (In Stock), Amber warning (Low Stock), Red badge (Out of Stock)", "ProductDetailPage, AdminProductsPage"),
        ("Layout Shell", "CustomerHeader", "frontend/src/components/layout/CustomerHeader.tsx", "isSticky, onSearch, cartItemCount", "Desktop utility banner, Brand logo, Nav links, Predictive search input, Cart pill with count badge", "MainLayout, HomePage, CustomerLayout"),
        ("Layout Shell", "CustomerFooter", "frontend/src/components/layout/CustomerFooter.tsx", "language", "Brand heritage summary, Central FSSAI license, Quick links, Tenkasi mill address, Copyright", "CustomerLayout, HomePage"),
        ("Layout Shell", "CustomerLayout", "frontend/src/components/layout/CustomerLayout.tsx", "children", "Full customer page wrapper with Header, MobileBottomNav, Main Content, and Footer", "ShopAll, ProductDetail, Cart, Checkout, Account"),
        ("Layout Shell", "AdminSidebar", "frontend/src/components/layout/AdminSidebar.tsx", "activeId, onLogout", "Desktop fixed 64px width sidebar, Brand seal, Mill nav items, Active route highlighting", "AdminLayout"),
        ("Layout Shell", "AdminHeader", "frontend/src/components/layout/AdminHeader.tsx", "user, onLogout", "Admin console top bar, Tenkasi operations badge, Live mill clock, Admin profile avatar", "AdminLayout"),
        ("Layout Shell", "AdminLayout", "frontend/src/components/layout/AdminLayout.tsx", "children", "Desktop two-column layout with fixed sidebar and scrollable main workspace", "All Admin Pages"),
        ("Layout Shell", "MobileBottomNavigation", "frontend/src/components/layout/MobileBottomNavigation.tsx", "activeTab, onTabChange", "Sticky bottom 5-pill bar on mobile (< 768px): Home, Shop, Cart, Account, Language", "CustomerLayout, HomePage")
    ]

    for r_idx, row in enumerate(components_data, start=2):
        for c_idx, val in enumerate(row, start=1):
            cell = ws3.cell(row=r_idx, column=c_idx, value=val)
            cell.font = regular_font
            cell.border = cell_border
            cell.alignment = left_align

            if c_idx == 1:
                cell.font = bold_font
            elif c_idx == 2:
                cell.font = bold_font
                cell.fill = soft_slate_fill

        if r_idx % 2 == 1:
            for c_idx in range(1, len(row) + 1):
                if c_idx != 2:
                    ws3.cell(row=r_idx, column=c_idx).fill = zebra_fill

    # =========================================================================
    # TAB 4: BUSINESS CALCULATIONS & LOGIC MATRIX
    # =========================================================================
    ws4 = wb.create_sheet(title="Calculations & Business Logic")
    ws4.views.sheetView[0].showGridLines = True

    headers4 = [
        "Calculation Name",
        "Mathematical Formula / Business Rule",
        "Source File & Function",
        "Execution Scope",
        "Example Input & Output",
        "Future Backend Enforcement"
    ]

    for col_idx, h in enumerate(headers4, start=1):
        cell = ws4.cell(row=1, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = green_fill
        cell.alignment = center_align
        cell.border = cell_border

    calc_data = [
        ("Cart Subtotal", "Subtotal = Σ (item.price × item.quantity)", "frontend/src/stores/useCartStore.ts -> getSubtotal()", "Client Zustand Store", "1 × Groundnut (₹249) + 1 × Sesame (₹249) = ₹498", "Recomputed on server inside POST /api/orders/checkout"),
        ("Free Shipping Threshold", "DeliveryFee = Subtotal >= ₹500 ? ₹0 : ₹50 (₹0 if cart empty)", "frontend/src/stores/useCartStore.ts -> getDeliveryFee()", "Client Zustand Store", "Subtotal ₹498 -> Fee ₹50; Subtotal ₹500 -> Fee ₹0 (FREE)", "Verified server-side based on shipping pincode rule"),
        ("Free Shipping Progress", "Progress % = Min(100, Round((Subtotal / 500) × 100))", "frontend/src/pages/CartPage.tsx -> freeShippingProgress", "Client UI State", "Subtotal ₹448 -> Progress 90% (₹52 away from free delivery)", "UI progress indicator only"),
        ("Coupon Validation & Discount", "Discount = (Subtotal >= Coupon.minOrder) ? Coupon.discount : 0", "frontend/src/stores/useCartStore.ts -> applyCoupon()", "Client Zustand Store", "NATURAL50 on ₹498 -> Saves ₹50 (Min ₹400 met)", "Server must check coupon expiry, usage limit, user eligibility"),
        ("GST Edible Oil Tax (5%)", "Tax = Round(Max(0, Subtotal - Discount) × 0.05)", "frontend/src/stores/useCartStore.ts -> getTax()", "Client Zustand Store", "Taxable ₹448 × 0.05 = ₹22 GST (Informational line item)", "Server must generate official GST tax invoice with HSN code 1508"),
        ("Final Order Total", "Total = Max(0, Subtotal - Discount + DeliveryFee)", "frontend/src/stores/useCartStore.ts -> getTotal()", "Client Zustand Store", "Subtotal ₹498 - Discount ₹50 + Delivery ₹0 = ₹448 Final Payable", "Server recalculates and signs total sent to Razorpay"),
        ("Dynamic Price Recommendation", "BaseCost = Seed + Extraction + Packaging + Shipping; Price = Round(BaseCost × (1 + Margin / 100))", "frontend/src/pages/AdminPricingPage.tsx", "Admin Client Simulator", "Seed ₹115 + Ext ₹38 + Pack ₹22 + Ship ₹25 = ₹200; Margin 30% -> Recommended ₹260", "Automated batch price calculation in backend DB service"),
        ("Price Variance Percentage", "Variance % = ((NewPrice - PrevPrice) / PrevPrice) × 100", "frontend/src/services/adminService.ts -> updatePriceItem()", "Admin Service", "Prev ₹249, New ₹269 -> Variance = +8.03%", "Immutable log saved in PostgreSQL price_audit_logs table"),
        ("Pincode Serviceability Lookup", "Regex: /^\\d{6}$/; 627xxx = 1-2 Days Direct Mill; 60xxxx-64xxxx = 2-3 Days TN; Other = 4-6 Days Pan-India", "frontend/src/services/productService.ts -> checkPincode()", "Product Service", "Pin 627811 -> Tenkasi / Tirunelveli (1-2 Days Direct Mill Dispatch)", "Integrate with India Post / The Professional Couriers API")
    ]

    for r_idx, row in enumerate(calc_data, start=2):
        for c_idx, val in enumerate(row, start=1):
            cell = ws4.cell(row=r_idx, column=c_idx, value=val)
            cell.font = regular_font
            cell.border = cell_border
            cell.alignment = left_align

            if c_idx == 1:
                cell.font = bold_font

        if r_idx % 2 == 1:
            for c_idx in range(1, len(row) + 1):
                ws4.cell(row=r_idx, column=c_idx).fill = zebra_fill

    # =========================================================================
    # TAB 5: FUTURE BACKEND ROADMAP
    # =========================================================================
    ws5 = wb.create_sheet(title="Backend Implementation Roadmap")
    ws5.views.sheetView[0].showGridLines = True

    headers5 = [
        "Phase",
        "API Endpoint",
        "HTTP Method",
        "Prisma Database Model",
        "Authentication / Role",
        "Implementation Priority",
        "Description & Functional Role"
    ]

    for col_idx, h in enumerate(headers5, start=1):
        cell = ws5.cell(row=1, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = amber_fill
        cell.alignment = center_align
        cell.border = cell_border

    backend_roadmap = [
        ("Phase 1: DB & Health", "/api/health", "GET", "System Health Check", "Public", "CURRENTLY WORKING", "Returns operational uptime, server status, and timestamp. (Already implemented)."),
        ("Phase 1: DB & Health", "Prisma Migration", "CLI", "User, Product, Variant, Order, Address", "Database Admin", "Priority 1", "Define comprehensive PostgreSQL schema with enums (Role, OrderStatus, Category)."),
        ("Phase 2: Auth Service", "/api/auth/register", "POST", "User", "Public", "Priority 1", "Create customer record, hash password (bcrypt), generate session JWT."),
        ("Phase 2: Auth Service", "/api/auth/login", "POST", "User", "Public", "Priority 1", "Authenticate customer or admin credentials, return HTTP-only auth cookie."),
        ("Phase 2: Auth Service", "/api/auth/send-otp", "POST", "OtpToken", "Public", "Priority 2", "Generate 6-digit cryptographic OTP, dispatch SMS via Twilio/Fast2SMS."),
        ("Phase 2: Auth Service", "/api/auth/verify-otp", "POST", "User, OtpToken", "Public", "Priority 2", "Verify SMS OTP, authenticate session, return user profile."),
        ("Phase 3: Catalog API", "/api/products", "GET", "Product, ProductVariant", "Public", "Priority 1", "Retrieve all active oil products, nested variants, nutrition facts, and purity highlights."),
        ("Phase 3: Catalog API", "/api/products/:slug", "GET", "Product, ProductVariant", "Public", "Priority 1", "Retrieve specific product details with full gallery and default variant."),
        ("Phase 3: Catalog API", "/api/shipping/check-pincode", "POST", "PincodeLookup", "Public", "Priority 2", "Validate 6-digit postal code, compute estimated delivery window and COD availability."),
        ("Phase 4: Order Pipeline", "/api/orders/checkout", "POST", "Order, OrderItem, Address", "Customer (JWT)", "Priority 1", "Validate inventory stock, recalculate prices server-side, create pending order."),
        ("Phase 4: Order Pipeline", "/api/payments/razorpay/create-order", "POST", "PaymentTransaction", "Customer (JWT)", "Priority 1", "Initialize Razorpay order entity with signed amount and currency INR."),
        ("Phase 4: Order Pipeline", "/api/payments/razorpay/verify-webhook", "POST", "PaymentTransaction, Order", "Public (Signature)", "Priority 1", "Verify HMAC-SHA256 signature, mark order as PAID, allocate mill batch."),
        ("Phase 5: Customer Account", "/api/customer/orders", "GET", "Order, OrderItem", "Customer (JWT)", "Priority 2", "Retrieve past order history for the logged-in customer."),
        ("Phase 5: Customer Account", "/api/customer/orders/:id", "GET", "Order, TrackingHistory", "Customer (JWT)", "Priority 2", "Retrieve full timeline and courier tracking checkpoints."),
        ("Phase 5: Customer Account", "/api/customer/addresses", "GET / POST", "CustomerAddress", "Customer (JWT)", "Priority 2", "Manage saved customer delivery addresses with default selection."),
        ("Phase 6: Admin Operations", "/api/admin/metrics/overview", "GET", "Aggregated Orders", "Admin (Role Check)", "Priority 2", "Calculate today revenue, order count, active dispatches, low stock count."),
        ("Phase 6: Admin Operations", "/api/admin/products", "POST / PUT", "Product, ProductVariant", "Admin (Role Check)", "Priority 2", "Create or edit product specifications, bilingual text, and variant prices."),
        ("Phase 6: Admin Operations", "/api/admin/pricing/update", "POST", "PriceMatrix, PriceAuditLog", "Admin (Role Check)", "Priority 2", "Update variant selling price, log cryptographic audit trail with modifier memo."),
        ("Phase 6: Admin Operations", "/api/admin/orders/:id/status", "PUT", "Order, TrackingHistory", "Admin (Role Check)", "Priority 2", "Update order fulfillment state (Extraction, Packing, Dispatched, Delivered), assign AWB.")
    ]

    for r_idx, row in enumerate(backend_roadmap, start=2):
        for c_idx, val in enumerate(row, start=1):
            cell = ws5.cell(row=r_idx, column=c_idx, value=val)
            cell.font = regular_font
            cell.border = cell_border
            cell.alignment = left_align

            if c_idx == 1:
                cell.font = bold_font
            elif c_idx == 3:
                cell.alignment = center_align
                cell.font = bold_font
            elif c_idx == 6:
                cell.alignment = center_align
                if val == "CURRENTLY WORKING":
                    cell.fill = green_tag_fill
                    cell.font = tag_green_font
                elif val == "Priority 1":
                    cell.fill = red_tag_fill
                    cell.font = tag_red_font
                else:
                    cell.fill = amber_tag_fill
                    cell.font = tag_amber_font

        if r_idx % 2 == 1:
            for c_idx in range(1, len(row) + 1):
                if c_idx != 6:
                    ws5.cell(row=r_idx, column=c_idx).fill = zebra_fill

    # Auto-adjust column widths across all sheets
    for sheet in wb.worksheets:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or "")
                # Skip merged banner row in calculation
                if cell.row in [1, 2, 3] and sheet.title == "Executive Summary":
                    continue
                if len(val_str) > max_len:
                    max_len = len(val_str)
            sheet.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 48)

    output_path = "R:\\SSG\\website\\SSK_Natural_Gold_Project_Status_Matrix.xlsx"
    wb.save(output_path)
    print(f"Successfully generated Excel status matrix at: {output_path}")

if __name__ == "__main__":
    build_status_matrix()
