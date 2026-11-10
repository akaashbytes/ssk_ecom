# PDF Documentation Generator - Parts 13 to 18
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from pdf_styles import (
    get_doc_styles, safe_text, create_chapter_header, create_callout,
    create_code_block, NAVY, AMBER, GREEN, RED, BG_SUBTLE, BORDER, BORDER_LIGHT,
    WHITE, TEXT_PRIMARY, TEXT_MUTED
)

def build_part13_to_18():
    styles = get_doc_styles()
    story = []

    # =========================================================================
    # PART 13: SECURITY AND BUSINESS LOGIC
    # =========================================================================
    story.append(create_chapter_header(13, "Security & Business Logic", "Production Security Architecture, Authentication Integrity & Tamper-Proofing"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("13.1 Production Security Architecture Overview", styles['H1']))
    story.append(Paragraph(
        "While the frontend currently simulates authentication and payments to facilitate rapid visual iteration, "
        "an enterprise production e-commerce platform handling food products and monetary transactions must enforce rigorous server-side security safeguards. "
        "The following matrix outlines current implementation versus production security requirements:",
        styles['Body']
    ))

    sec_rules = [
        ("Customer Authentication", "Simulated session stored in localStorage ('ssk_mock_auth_user'). Default customer is pre-loaded for demo.", "Cryptographic JWTs or session tokens stored exclusively in HTTP-only, Secure, SameSite cookies. Passwords hashed using bcrypt (cost factor >= 12)."),
        ("Admin Authentication & RBAC", "Admin credentials evaluated client-side via authService; loads MOCK_ADMIN with role: 'ADMIN'.", "Server-side Role-Based Access Control (RBAC) middleware verifying JWT claims before executing any admin mutations. Multi-Factor Authentication (MFA) recommended."),
        ("SMS OTP Verification", "Client validates against hardcoded demo OTP '123456'. 29-second countdown timer in UI.", "Secure random 6-digit OTP generated on server, cached in Redis with 5-minute TTL, rate-limited to 3 attempts per phone per 15 minutes, dispatched via SMS Gateway."),
        ("Payment Verification", "Simulated checkout with 800ms timer and failure toggle; immediately returns SUCCESS.", "Razorpay / Cashfree order creation on server. Webhook signature verification using HMAC-SHA256 before marking orders as PAID. Never trust client callbacks."),
        ("Price & Total Tamper-Proofing", "Prices and subtotals calculated in useCartStore and passed to placeOrder().", "CRITICAL: The backend must NEVER trust prices, subtotals, or delivery fees submitted by the client browser. The server must fetch live variant prices from the database, recompute tax and totals, and validate coupon limits."),
        ("Inventory Consistency", "Client decrements stock in memory; Admin adjusts stock via local modal.", "ACID database transactions with row-level pessimistic locking (SELECT ... FOR UPDATE) during order placement to prevent negative inventory or overselling."),
        ("Order Record Immutability", "Orders saved in localStorage array; mutable in client.", "Orders stored in append-only database tables. Completed orders must never be deleted; address snapshots and historical prices must be frozen at time of purchase.")
    ]

    sec_table_data = [
        [Paragraph("<b>Security Dimension</b>", styles['TableHead']), Paragraph("<b>Current Frontend Implementation</b>", styles['TableHead']), Paragraph("<b>Production Backend Requirement</b>", styles['TableHead'])]
    ]
    for sdim, scurr, sreq in sec_rules:
        sec_table_data.append([
            Paragraph(f"<b>{sdim}</b>", styles['TableCellBold']),
            Paragraph(scurr, styles['TableCellSmall']),
            Paragraph(sreq, styles['TableCell'])
        ])

    t_sec = Table(sec_table_data, colWidths=[120, 200, 220])
    t_sec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_sec)
    story.append(PageBreak())

    # =========================================================================
    # PART 14: PROJECT STATUS AND REMAINING WORK
    # =========================================================================
    story.append(create_chapter_header(14, "Project Status & Remaining Work", "Comprehensive Module Completion Matrix, Technical Risks & Client Confirmations"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("14.1 Module Status Matrix", styles['H1']))
    story.append(Paragraph(
        "This matrix provides a candid, verified assessment of completion across all functional modules:",
        styles['Body']
    ))

    status_matrix = [
        ("Storefront Presentation", "Complete", "Not Started", "Mock Data", "Awaiting client review of typography, imagery, and Tamil translations.", "Low"),
        ("Catalog & Multi-Pack", "Complete", "Not Started", "productService", "Replace mock products with GET /api/products REST endpoint.", "Low"),
        ("Shopping Cart & Coupons", "Complete", "Not Started", "useCartStore", "Implement server-side coupon validation and discount rules.", "Medium"),
        ("Delivery Address Book", "Complete", "Not Started", "useAppStore", "Connect address CRUD operations to PostgreSQL Address model.", "Low"),
        ("Payment Processing", "Complete (Simulated)", "Not Started", "orderService", "Integrate Razorpay SDK and webhook verification listeners.", "High"),
        ("Order Placement & AWB", "Complete (Simulated)", "Not Started", "orderService", "Connect to PostgreSQL transactions and courier logistics API.", "High"),
        ("Customer Auth (OTP / Pass)", "Complete (Simulated)", "Not Started", "authService", "Deploy SMS Gateway, JWT sessions, and password recovery.", "High"),
        ("Customer Account & History", "Complete", "Not Started", "useAppStore", "Fetch authenticated customer orders from backend database.", "Low"),
        ("Admin Dashboard & KPIs", "Complete", "Not Started", "adminService", "Aggregate real-time daily revenue and order metrics in DB.", "Medium"),
        ("Admin Pricing Simulator", "Complete", "Not Started", "adminService", "Persist price adjustments and cryptographically signed audit logs.", "Medium"),
        ("Admin Order Fulfillment", "Complete", "Not Started", "orderService", "Implement status transition webhooks and AWB label generation.", "Medium"),
        ("System Safeguards & Locks", "Complete", "Not Started", "Local Guardrails", "Enforce role-based database constraints on destructive actions.", "Low")
    ]

    stat_table_data = [
        [Paragraph("<b>Module Name</b>", styles['TableHead']), Paragraph("<b>Frontend</b>", styles['TableHead']), Paragraph("<b>Backend</b>", styles['TableHead']), Paragraph("<b>Integration</b>", styles['TableHead']), Paragraph("<b>Remaining Work &amp; Next Steps</b>", styles['TableHead']), Paragraph("<b>Risk</b>", styles['TableHead'])]
    ]
    for mname, mfront, mback, mint, mrem, mrisk in status_matrix:
        stat_table_data.append([
            Paragraph(f"<b>{mname}</b>", styles['TableCellBold']),
            Paragraph(mfront, styles['TableCellTagGreen']),
            Paragraph(mback, styles['TableCellTagAmber']),
            Paragraph(mint, styles['TableCellSmall']),
            Paragraph(mrem, styles['TableCellSmall']),
            Paragraph(mrisk, styles['TableCellTagRed'] if "High" in mrisk else (styles['TableCellTagAmber'] if "Medium" in mrisk else styles['TableCellTagGreen']))
        ])

    t_stat = Table(stat_table_data, colWidths=[100, 55, 65, 75, 195, 50])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_stat)

    story.append(Spacer(1, 8))
    story.append(Paragraph("14.2 Client Confirmation Requirements & Potential Risks", styles['H1']))
    risks = [
        "<b>Product Pricing & Margin Formulas:</b> The client must verify the current raw seed and packaging cost formulas (Seed: ₹115, Extraction: ₹38, Packaging: ₹22, Shipping: ₹25) and target margin defaults.",
        "<b>Courier Partner Integrations:</b> The client must confirm whether The Professional Couriers (TPC), ST Courier, or Delhivery will be the primary fulfillment partner for automated AWB generation.",
        "<b>Payment Gateway Credentials:</b> Production deployment requires client merchant onboarding with Razorpay (or Cashfree) to obtain live API keys and webhook signing secrets.",
        "<b>Central FSSAI Validation:</b> The current FSSAI license number (22426293000431) must be verified against official client enterprise registration certificates before public launch."
    ]
    for r in risks:
        story.append(Paragraph(f"• {r}", styles['Bullet']))

    story.append(PageBreak())

    # =========================================================================
    # PART 15: LEARNING GUIDE FOR THE DEVELOPER
    # =========================================================================
    story.append(create_chapter_header(15, "Learning Guide for the Developer", "Beginner-Friendly Operational Manual with Actual Windows CMD Commands"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "This section is designed specifically for the developer taking over the codebase. "
        "It explains how to start, navigate, modify, debug, and build the application using standard Windows Command Prompt (CMD) commands.",
        styles['Body']
    ))

    dev_steps = [
        ("15.1 How to Start the Frontend Development Server",
         "The frontend runs on Vite with Hot Module Replacement (HMR). To start the local server on http://localhost:3000:",
         "cd R:\\SSG\\website\\frontend\nnpm run dev"),
        ("15.2 How to Start the Backend Server",
         "The backend runs on Express with TypeScript and tsx file watching on port 5000:",
         "cd R:\\SSG\\website\\backend\nnpm run dev"),
        ("15.3 How to Run TypeScript Verification Checks",
         "To verify that your code has zero type errors without building files:",
         "cd R:\\SSG\\website\\frontend\nnpx tsc --noEmit\n\ncd R:\\SSG\\website\\backend\nnpx tsc --noEmit"),
        ("15.4 How to Create an Optimized Production Build",
         "To compile the frontend into the production-ready 'frontend/dist/' bundle:",
         "cd R:\\SSG\\website\\frontend\nnpm run build"),
        ("15.5 How Routing Works",
         "React Router v7 maps browser URLs to page components inside 'frontend/src/routes/AppRoutes.tsx'. "
         "To add a new route, import your page component and add: &lt;Route path='/my-new-page' element={&lt;MyNewPage /&gt;} /&gt; inside AppRoutes.",
         "// Example inside frontend/src/routes/AppRoutes.tsx\nimport { MyNewPage } from '../pages/MyNewPage';\n<Route path='/my-new-page' element={<MyNewPage />} />"),
        ("15.6 How to Find and Modify a Page or Component",
         "• Page views are located in 'frontend/src/pages/' (e.g. HomePage.tsx, CartPage.tsx).\n"
         "• Reusable UI elements are in 'frontend/src/components/common/' (Buttons, Inputs, Modals).\n"
         "• Domain product components are in 'frontend/src/components/product/' (ProductCard.tsx, PriceDisplay.tsx).\n"
         "• Layout headers and sidebars are in 'frontend/src/components/layout/' (CustomerHeader.tsx, AdminSidebar.tsx).",
         ""),
        ("15.7 How to Change Product Images or Information",
         "• Product text and prices are declared in 'frontend/src/mock/products.ts'. Modify name, price, stock, or descriptionTa.\n"
         "• To replace bottle images: Place your JPEG file in 'frontend/src/assets/', export it from 'frontend/src/assets/index.ts', "
         "and assign it to primaryImage in 'frontend/src/mock/products.ts'.",
         "// Inside frontend/src/assets/index.ts\nimport newBottleImg from './my-new-bottle.jpeg';\nexport { newBottleImg };"),
        ("15.8 How to Modify the Design System (Colors & Typography)",
         "Design tokens are defined in 'frontend/src/tokens/index.ts' and referenced by 'frontend/tailwind.config.js'. "
         "To update brand colors, change primarySlate, harvestAmber, or forestGreen in tokens/index.ts and tailwind.config.js.",
         "// Inside frontend/src/tokens/index.ts\nexport const COLORS = {\n  harvestAmber: '#D48817',\n  forestGreen: '#166534'\n};"),
        ("15.9 How to Debug Common Errors",
         "1. Port 3000 already in use: Run 'netstat -ano | findstr :3000' and 'taskkill /PID &lt;PID&gt; /F'.\n"
         "2. Missing module: Run 'npm install' in the respective frontend or backend folder.\n"
         "3. Cache corruption: Delete 'frontend/node_modules/.vite' and restart 'npm run dev'.\n"
         "4. localStorage desynchronization: Open Browser DevTools -> Application -> Local Storage -> Clear 'ssk_cart_storage'.",
         "")
    ]

    for title, text, code in dev_steps:
        story.append(Paragraph(f"<b>{title}</b>", styles['H2']))
        story.append(Paragraph(text, styles['Body']))
        if code:
            story.append(create_code_block(code))
        story.append(Spacer(1, 3))

    story.append(PageBreak())

    # =========================================================================
    # PART 16: COMPLETE APPLICATION NAVIGATION AND REDIRECT FLOW
    # =========================================================================
    story.append(create_chapter_header(16, "Complete Navigation & Redirect Flow", "Master React Router Map, Protected Routes & Fallback Traps"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "A rigorous inspection of <code>frontend/src/routes/AppRoutes.tsx</code> reveals 28 distinct route mappings. "
        "The following master table documents every route, accessible roles, previous/next states, and redirect triggers:",
        styles['Body']
    ))

    nav_map = [
        ("/", "HomePage", "All Roles", "Browser open / Logo click", "/shop, /products/:slug, /cart", "None", "Public", "None"),
        ("/shop", "ShopAllPage", "All Roles", "Nav 'Shop All' / Search submit", "/products/:slug, /cart", "None", "Public", "None"),
        ("/products/:slug", "ProductDetailPage", "All Roles", "ProductCard click / Shop card", "/cart, /shop", "Slug not found -> 404", "Public", "NotFoundPage"),
        ("/cart", "CartPage", "All Roles", "Header cart pill / Mobile cart icon", "/checkout, /shop", "Empty cart -> Shows empty state", "Public", "None"),
        ("/checkout", "CheckoutAddressPage", "Guest, Customer", "Cart 'Proceed to Checkout'", "/checkout/payment, /cart", "Empty cart -> Redirects to /cart", "Unprotected*", "/cart"),
        ("/checkout/payment", "CheckoutPaymentPage", "Guest, Customer", "CheckoutAddress 'Proceed to Payment'", "/checkout/success, /checkout", "No address -> Redirects to /checkout", "Unprotected*", "/checkout"),
        ("/checkout/success", "CheckoutSuccessPage", "Guest, Customer", "CheckoutPayment order submission", "/orders/:orderId, /shop", "No orderId -> Defaults to mock order", "Public", "None"),
        ("/login", "LoginPage", "Guest (or Switch User)", "Header 'Sign In' / Account prompt", "/account, /register, /forgot-password", "Already logged in -> /account", "Public", "/account"),
        ("/register", "RegisterPage", "Guest", "LoginPage 'Create Account'", "/verify-otp, /login", "Already registered -> /login", "Public", "/login"),
        ("/verify-otp", "OtpVerificationPage", "Guest", "Register submit / Login OTP mode", "/account, /checkout (via ?redirect=)", "Invalid OTP -> Error message", "Public", "/login"),
        ("/forgot-password", "ForgotPasswordPage", "Guest", "LoginPage 'Forgot Password?'", "/login, /reset-password", "None", "Public", "/login"),
        ("/reset-password", "ResetPasswordPage", "Guest", "Password recovery link", "/login", "None", "Public", "/login"),
        ("/account", "AccountDashboardPage", "Customer", "Header 'Account' / Login success", "/account/orders, /orders/:id", "currentUser == null -> /login prompt", "Soft Protected", "/login"),
        ("/account/orders", "OrderHistoryPage", "Customer", "Account 'View All Orders'", "/orders/:orderId, /account", "currentUser == null -> Empty orders", "Soft Protected", "/login"),
        ("/orders/:orderId", "OrderTrackingPage", "Guest, Customer", "Order history 'Track' / Success page", "/account/orders, /shop", "orderId not found -> Order Not Located", "Public", "None"),
        ("/about", "AboutUsPage", "All Roles", "Header 'Our Mill' / Footer link", "/shop, /faq, /contact", "None", "Public", "None"),
        ("/faq", "AboutUsPage (?tab=faq)", "All Roles", "Header 'FAQ' / Footer link", "/contact, /about", "None", "Public", "None"),
        ("/wholesale", "ContactWholesalePage", "All Roles", "Header 'Wholesale B2B' link", "/about, /shop", "None", "Public", "None"),
        ("/policies", "PoliciesLegalPage", "All Roles", "Footer 'Policies' link", "/terms, /privacy, /shipping", "None", "Public", "None"),
        ("/design-system", "ComponentShowcase", "Developer, Admin", "Direct URL / Footer showcase", "/shop, /admin", "None", "Internal", "None"),
        ("/admin/login", "AdminLoginPage", "Admin (Unauth)", "Direct URL navigation", "/admin/dashboard", "Already admin -> /admin/dashboard", "Public", "/admin/dashboard"),
        ("/admin/dashboard", "AdminDashboardPage", "Admin", "Admin login / Sidebar 'Dashboard'", "/admin/products, /admin/orders", "No auth guard yet (simulated)", "Soft Protected", "/admin/login"),
        ("/admin/products", "AdminProductsPage", "Admin", "Admin sidebar 'Products & Stock'", "/admin/products/new, /admin/pricing", "None", "Soft Protected", "/admin/login"),
        ("/admin/products/new", "AdminProductStudioPage", "Admin", "Products 'Add New Product'", "/admin/products", "None", "Soft Protected", "/admin/products"),
        ("/admin/pricing", "AdminPricingPage", "Admin", "Admin sidebar 'Dynamic Rate Matrix'", "/admin/pricing/audit", "None", "Soft Protected", "/admin/login"),
        ("/admin/pricing/audit", "AdminPriceAuditPage", "Admin", "Pricing 'Price Audit Ledger'", "/admin/pricing", "None", "Soft Protected", "/admin/pricing"),
        ("/admin/orders", "AdminOrdersPage", "Admin", "Admin sidebar 'Order Fulfillment'", "/admin/dashboard", "None", "Soft Protected", "/admin/login"),
        ("/admin/safeguards", "AdminSafeguardsPage", "Admin", "Admin sidebar 'Safety Safeguards'", "/admin/dashboard", "None", "Soft Protected", "/admin/login"),
        ("*", "NotFoundPage", "All Roles", "Any invalid or unmatched URL", "/", "None", "Catch-All", "/")
    ]

    nav_table_data = [
        [Paragraph("<b>Route URL</b>", styles['TableHead']), Paragraph("<b>Component</b>", styles['TableHead']), Paragraph("<b>Accessible Roles</b>", styles['TableHead']), Paragraph("<b>Next Navigation</b>", styles['TableHead']), Paragraph("<b>Protection Status</b>", styles['TableHead'])]
    ]
    for rurl, rcomp, rroles, rnext, rprot, _ in [n[:6] for n in nav_map]:
        nav_table_data.append([
            Paragraph(f"<code>{rurl}</code>", styles['TableCellSmall']),
            Paragraph(rcomp, styles['TableCellBold']),
            Paragraph(rroles, styles['TableCellSmall']),
            Paragraph(rnext, styles['TableCellSmall']),
            Paragraph(rprot, styles['TableCellTagGreen'] if rprot == "Public" else (styles['TableCellTagRed'] if "Protected" in rprot else styles['TableCellTagAmber']))
        ])

    t_nav = Table(nav_table_data, colWidths=[90, 110, 85, 175, 80])
    t_nav.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_nav)
    story.append(PageBreak())

    # =========================================================================
    # PART 17: ROLE-BASED ACCESS AND PERMISSIONS
    # =========================================================================
    story.append(create_chapter_header(17, "Role-Based Access & Permissions", "Guest vs Customer vs Administrator Permission Matrix"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("17.1 User Role Definitions", styles['H1']))
    story.append(Paragraph(
        "• <b>Guest / Unauthenticated Visitor:</b> Can freely browse products, read botanical and nutritional stories, switch languages, add items to cart, and test checkout. Cannot view private order histories without an order ID.<br/>"
        "• <b>Registered Customer:</b> Logged-in retail buyer. Holds saved delivery addresses in <code>useAppStore</code>, tracks active orders, and views personal historical orders.<br/>"
        "• <b>Administrator (Mill Manager):</b> Full operational access to live revenue metrics, inventory counts, rate matrices, price audit ledgers, order dispatches, and destructive action safeguards.",
        styles['Body']
    ))

    story.append(Paragraph("17.2 Verified Permission Matrix", styles['H1']))
    perm_data = [
        [Paragraph("<b>Capability / Feature</b>", styles['TableHead']), Paragraph("<b>Guest</b>", styles['TableHead']), Paragraph("<b>Registered Customer</b>", styles['TableHead']), Paragraph("<b>Administrator</b>", styles['TableHead'])],
        [Paragraph("Browse Products & Catalog", styles['TableCellBold']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Add Items to Cart & Use Coupons", styles['TableCellBold']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Place Retail Order", styles['TableCellBold']), Paragraph("Allowed (Guest checkout enabled)", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed (Counter sales)", styles['TableCellTagGreen'])],
        [Paragraph("Save Multiple Delivery Addresses", styles['TableCellBold']), Paragraph("Blocked (Session only)", styles['TableCellTagRed']), Paragraph("Allowed (Persistent)", styles['TableCellTagGreen']), Paragraph("Not Applicable", styles['TableCellSmall'])],
        [Paragraph("View Personal Order History", styles['TableCellBold']), Paragraph("Blocked (Prompted to login)", styles['TableCellTagRed']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed (All orders)", styles['TableCellTagGreen'])],
        [Paragraph("Track Order via AWB Number", styles['TableCellBold']), Paragraph("Allowed (With Order ID)", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Access Admin Dashboard & KPIs", styles['TableCellBold']), Paragraph("Blocked (Redirects to /admin/login)", styles['TableCellTagRed']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Adjust Live Warehouse Stock", styles['TableCellBold']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Modify Selling Prices & MRP", styles['TableCellBold']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Update Order Status & AWB", styles['TableCellBold']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Allowed", styles['TableCellTagGreen'])],
        [Paragraph("Trigger Destructive Safeguards", styles['TableCellBold']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Blocked", styles['TableCellTagRed']), Paragraph("Allowed (Requires 2-step lock)", styles['TableCellTagGreen'])]
    ]
    t_perm = Table(perm_data, colWidths=[180, 110, 120, 130])
    t_perm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_perm)

    story.append(Spacer(1, 8))
    callout_rbac = create_callout(
        "ARCHITECTURAL DISTINCTION: FRONTEND VS BACKEND RBAC",
        "In the current frontend-only architecture, admin route protection is implemented via client-side state checks. "
        "When backend development begins, server-side JWT authentication middlewares must strictly validate the user's role on every REST endpoint. "
        "Client-side route guards provide visual UX protection, but only server-side verification guarantees true data security.",
        "warning"
    )
    story.append(callout_rbac)
    story.append(PageBreak())

    # =========================================================================
    # PART 18: COMPLETE CUSTOMER OPERATING MANUAL
    # =========================================================================
    story.append(create_chapter_header(18, "Complete Customer Operating Manual", "Step-by-Step Instructions for 22 User Operations Across Storefront"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "This section documents how a customer interacts with every storefront feature from initial website access to order delivery:",
        styles['Body']
    ))

    ops = [
        ("1. Opening the Website", "Open browser and navigate to http://localhost:3000/. Homepage loads with hero video/banner, header, and product cards."),
        ("2. Browsing Homepage", "Scroll down to view 'Traditional Cold Pressed Oils' collection, Vaagai wood extraction explanation, and customer reviews."),
        ("3. Switching Language (EN / தமிழ்)", "Click the 'EN | தமிழ்' toggle pill in the top header or mobile bottom bar. All headlines, product names, and descriptions translate instantly."),
        ("4. Searching Products", "Click the search icon in the header, enter 'groundnut' or 'நல்லெண்ணெய்', and press Enter. Redirects to /shop?q=... with matching items."),
        ("5. Filtering by Category", "On /shop, click category tabs: 'Groundnut', 'Sesame', or 'Coconut'. The catalog instantly filters to matching varieties."),
        ("6. Toggling In-Stock Only", "Toggle the 'In Stock Only' switch in the filter bar. Out-of-stock items are hidden immediately."),
        ("7. Opening Product Details", "Click on any product card title or bottle photograph. Navigates to /products/:slug (e.g. /products/traditional-groundnut-oil)."),
        ("8. Selecting Pack Sizes", "On the PDP, click pack pills: '500 ml', '1 Litre', '5 L Tin', or '15 L Tin'. Unit price, container type, and SKU update instantly."),
        ("9. Checking Pincode Delivery", "Enter a 6-digit postal code (e.g. 627811) in the 'Delivery Availability' box and click 'Check'. Displays delivery window (1-2 days)."),
        ("10. Adding Product to Cart", "Select quantity and click 'Add to Cart'. Header cart count increments, and a confirmation toast notification slides in."),
        ("11. Changing Quantity in Cart", "Navigate to /cart. Click the '+' or '-' buttons in the quantity selector pill. Subtotal recalculates in real time."),
        ("12. Removing Product from Cart", "Click the red trash icon next to any cart row. Item is removed and total recalculates."),
        ("13. Applying Coupon Code", "Enter 'NATURAL50' in the promo code box and click 'Apply'. If subtotal >= ₹400, ₹50 discount is applied with green feedback toast."),
        ("14. Checking Free Delivery Threshold", "Inspect the amber progress bar. Orders >= ₹500 get free shipping (₹0); orders < ₹500 incur a ₹50 delivery fee."),
        ("15. Proceeding to Checkout", "Click 'Proceed to Checkout'. Navigates to /checkout/address with delivery summary sidebar."),
        ("16. Selecting Delivery Address", "Select a radio button among saved addresses, or click '+ Add New Address' to enter a new name, phone, PIN code, and street."),
        ("17. Selecting Payment Method", "Click 'Continue to Payment'. Select UPI, Card, Net Banking, or Cash on Delivery (COD)."),
        ("18. Testing Failure Guardrail", "Toggle 'Simulate Gateway Failure' and click 'Pay'. An 800ms spinner displays followed by a simulated error retry modal."),
        ("19. Completing Order Placement", "Ensure simulated failure is off and click 'Pay & Place Order'. Cart clears, order is saved, and navigates to /checkout/success."),
        ("20. Viewing Order Confirmation", "Inspect order reference #SSK-2026-XXXX, mill batch assignment tag, and click 'Track Live Order'."),
        ("21. Tracking Live Order Timeline", "On /orders/:orderId, view 5-step progress bar (Placed -> Milling -> Dispatched -> Out for Delivery -> Delivered) and copy AWB."),
        ("22. Viewing Customer Account", "Click 'Account' in header. View profile initial, active order progress widget, and click 'Order History' to see past purchases.")
    ]

    for title, desc in ops:
        story.append(Paragraph(f"<b>{title}</b>", styles['H2']))
        story.append(Paragraph(desc, styles['Body']))
        story.append(Spacer(1, 2))

    story.append(PageBreak())
    return story
