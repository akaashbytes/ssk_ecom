# PDF Documentation Generator - Parts 7 to 12
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from pdf_styles import (
    get_doc_styles, safe_text, create_chapter_header, create_callout,
    create_code_block, NAVY, AMBER, GREEN, RED, BG_SUBTLE, BORDER, BORDER_LIGHT,
    WHITE, TEXT_PRIMARY, TEXT_MUTED
)

def build_part7_to_12():
    styles = get_doc_styles()
    story = []

    # =========================================================================
    # PART 7: STATE MANAGEMENT AND DATA FLOW
    # =========================================================================
    story.append(create_chapter_header(7, "State Management & Data Flow", "Zustand Stores, Reactivity, Persistence & Communication Patterns"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("7.1 What is Application State?", styles['H1']))
    story.append(Paragraph(
        "In a modern single-page application like SSK Natural Gold, <b>Application State</b> represents the dynamic, in-memory representation of everything the user is currently doing, seeing, and modifying. "
        "This includes items in the shopping cart, applied coupons, the logged-in customer's profile, chosen delivery address, current language (English vs Tamil), and active modal dialogues. "
        "State ensures that when a user selects a 1-Litre bottle on the Homepage and navigates to the Cart page, the application remembers their selection without data loss.",
        styles['Body']
    ))

    story.append(Paragraph("7.2 State Taxonomy: The 4 Tiers of State in SSK Natural Gold", styles['H1']))
    state_taxonomy = [
        [Paragraph("<b>State Tier</b>", styles['TableHead']), Paragraph("<b>Definition &amp; Scope</b>", styles['TableHead']), Paragraph("<b>Technology in Project</b>", styles['TableHead']), Paragraph("<b>Project Examples</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Local Component State</b>", styles['TableCellBold']),
            Paragraph("Data scoped strictly to a single UI component. Destroyed when the component unmounts from the DOM.", styles['TableCell']),
            Paragraph("React <code>useState</code>, <code>useRef</code>", styles['TableCell']),
            Paragraph("Selected pack pill in ProductCard, FAQ accordion open/close, OTP input digits in OtpVerificationPage.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Global Application State</b>", styles['TableCellBold']),
            Paragraph("Shared data accessible by any component in the application tree without prop-drilling.", styles['TableCell']),
            Paragraph("Zustand (<code>create()</code>)", styles['TableCell']),
            Paragraph("<code>useLanguageStore</code> (en/ta), <code>useToastStore</code> (toast notification queue).", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Persistent Browser State</b>", styles['TableCellBold']),
            Paragraph("State synchronized with browser storage so data survives page refreshes and browser restarts.", styles['TableCell']),
            Paragraph("Zustand <code>persist</code> middleware + <code>localStorage</code>", styles['TableCell']),
            Paragraph("<code>useCartStore</code> ('ssk_cart_storage'), <code>useAppStore</code> ('ssk_app_storage').", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Server State (Async)</b>", styles['TableCellBold']),
            Paragraph("Data owned, persisted, and validated by the backend server; cached on the client.", styles['TableCell']),
            Paragraph("TanStack Query v5 + Axios (Configured for future backend)", styles['TableCell']),
            Paragraph("Product catalog queries, order history queries, stock level checks.", styles['TableCell'])
        ]
    ]
    t_tax = Table(state_taxonomy, colWidths=[110, 160, 130, 140])
    t_tax.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_tax)

    story.append(Spacer(1, 8))
    story.append(Paragraph("7.3 Deep Dive into the 4 Zustand Stores", styles['H1']))
    story.append(Paragraph(
        "The application utilizes 4 specialized Zustand stores located in <code>frontend/src/stores/</code>:",
        styles['Body']
    ))

    stores_info = [
        "<b>useCartStore (useCartStore.ts):</b> Manages <code>items: CartItem[]</code>, <code>appliedCoupon: Coupon | null</code>. Exposes actions: <code>addItem()</code>, <code>removeItem()</code>, <code>updateQuantity()</code>, <code>clearCart()</code>, <code>applyCoupon()</code>, and getters: <code>getSubtotal()</code>, <code>getDiscount()</code>, <code>getDeliveryFee()</code>, <code>getTax()</code>, <code>getTotal()</code>. Automatically writes to <code>localStorage['ssk_cart_storage']</code>.",
        "<b>useAppStore (useAppStore.ts):</b> Manages session state: <code>currentUser: User | null</code> (initialized with Muthuraj K.), <code>addresses: CustomerAddress[]</code>, <code>selectedAddressId: string</code>, <code>theme: 'light'</code>, and <code>isSearchOpen: boolean</code>. Automatically writes to <code>localStorage['ssk_app_storage']</code>.",
        "<b>useLanguageStore (useLanguageStore.ts):</b> Holds <code>language: 'en' | 'ta'</code>. Exposes <code>setLanguage()</code> and <code>toggleLanguage()</code>. Provides instantaneous, re-render-free bilingual switching across the UI.",
        "<b>useToastStore (useToastStore.ts):</b> Ephemeral notification queue: <code>toasts: ToastItem[]</code>. Exposes <code>addToast({ type, title, message, duration })</code> and <code>removeToast(id)</code>. Auto-dismisses toasts after 4000ms."
    ]
    for s in stores_info:
        story.append(Paragraph(f"• {s}", styles['Bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("7.4 Data Flow Diagram: Cart & Order Placement", styles['H2']))
    flow_diagram = """
    [ ProductCard / PDP ] ──( addItem )──> [ useCartStore (Zustand) ]
                                                    │
                                                    ├──> localStorage ('ssk_cart_storage')
                                                    │
    [ CartPage ] <──( reactive subscription )───────┤
          │                                         │
          └──( applyCoupon ) ───────────────────────┤
          │                                         │
    [ CheckoutAddressPage ]                         v
          │                                  [ Subtotal / Tax / Total ]
    [ CheckoutPaymentPage ] ──( placeOrder )──> [ orderService ]
                                                        │
                                                        ├──> localStorage ('ssk_mock_orders')
                                                        v
                                              [ CheckoutSuccessPage ]
    """
    story.append(create_code_block(flow_diagram))
    story.append(PageBreak())

    # =========================================================================
    # PART 8: MOCK DATA AND SIMULATED FUNCTIONALITY
    # =========================================================================
    story.append(create_chapter_header(8, "Mock Data & Simulated Functionality", "Comprehensive Inventory of Mock Datasets vs Real Backend Requirements"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "A critical responsibility in reviewing this codebase is distinguishing between <b>implemented frontend user interfaces</b>, "
        "<b>simulated frontend services</b>, and <b>real backend capabilities</b>. "
        "Because backend development was intentionally postponed, all data persistence currently operates via browser storage and mock datasets in <code>frontend/src/mock/</code>.",
        styles['Body']
    ))

    story.append(Paragraph("8.1 Mock Datasets Overview", styles['H1']))
    mock_datasets = [
        "<b>products.ts (309 lines):</b> 3 flagship products: Traditional Groundnut Oil, Pure Wood-Pressed Sesame Oil (with Karupatti), and Unrefined Cold-Pressed Coconut Oil (from Pollachi). Defines 12 total SKUs (500ml, 1L, 5L, 15L), detailed Tamil descriptors, nutritional breakdown per 100g, and Vaagai wood extraction stories.",
        "<b>users.ts (19 lines):</b> Defines <code>MOCK_CUSTOMER</code> (Muthuraj K., muthuraj.k@gmail.com, +91 98401 23456) and <code>MOCK_ADMIN</code> (Tenkasi Mill Operations Admin, admin@ssknaturalgold.com, +91 99940 72837).",
        "<b>addresses.ts (30 lines):</b> Defines two customer delivery addresses: Default residential in Tenkasi (Pincode: 627811) and secondary office in Anna Nagar, Chennai (Pincode: 600040).",
        "<b>orders.ts (203 lines):</b> 3 historical orders with realistic order numbers (SSK-2026-8942, SSK-2026-7810, SSK-2026-6523), delivery dates, AWB tracking codes (The Professional Couriers, ST Courier), and multi-step mill-to-doorstep tracking histories.",
        "<b>adminData.ts (270 lines):</b> Contains <code>MOCK_COUPONS</code> (NATURAL50, WELCOME100, TENKASIGOLD), <code>MOCK_ADMIN_METRICS</code> (todayRevenue: ₹38,450, 18 orders, 7-day revenue chart array), <code>MOCK_PRICE_MATRIX</code> (seed costs, extraction fees, margins across 9 SKUs), <code>MOCK_PRICE_AUDIT_LOGS</code>, and <code>MOCK_WHOLESALE_LEADS</code>."
    ]
    for m in mock_datasets:
        story.append(Paragraph(f"• {m}", styles['Bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("8.2 Feature Implementation vs Backend Requirement Matrix", styles['H1']))

    matrix_data = [
        [Paragraph("<b>Feature / Module</b>", styles['TableHead']), Paragraph("<b>Current Implementation Status</b>", styles['TableHead']), Paragraph("<b>Real Backend Required?</b>", styles['TableHead']), Paragraph("<b>Future Architecture Role</b>", styles['TableHead'])],
        [
            Paragraph("<b>Catalog Browsing</b>", styles['TableCellBold']),
            Paragraph("100% Implemented (Reads MOCK_PRODUCTS via productService)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagAmber']),
            Paragraph("Fetch from PostgreSQL <code>products</code> table with caching", styles['TableCell'])
        ],
        [
            Paragraph("<b>Shopping Cart</b>", styles['TableCellBold']),
            Paragraph("100% Implemented (Zustand + localStorage persistence)", styles['TableCell']),
            Paragraph("Optional / Yes", styles['TableCellTagAmber']),
            Paragraph("Client cart works standalone; sync with backend cart for cross-device persistence", styles['TableCell'])
        ],
        [
            Paragraph("<b>Customer Login</b>", styles['TableCellBold']),
            Paragraph("Simulated (Checks identifier, sets mock customer in localStorage)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("JWT / HTTP-only cookies + bcrypt password hash verification", styles['TableCell'])
        ],
        [
            Paragraph("<b>OTP Verification</b>", styles['TableCellBold']),
            Paragraph("Simulated UI (Accepts '123456', 29s timer, autofill)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("SMS Gateway integration (Twilio / Fast2SMS) + Redis OTP cache", styles['TableCell'])
        ],
        [
            Paragraph("<b>Payment Processing</b>", styles['TableCellBold']),
            Paragraph("Simulated (Interactive tabs, simulated failure toggle, 800ms timer)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("Razorpay / Cashfree SDK + Server Webhook Signature Verification", styles['TableCell'])
        ],
        [
            Paragraph("<b>Order Placement</b>", styles['TableCellBold']),
            Paragraph("Simulated (Generates #SSK-2026-XXXX, saves in localStorage)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("ACID PostgreSQL transaction: reserve stock, record order & payment", styles['TableCell'])
        ],
        [
            Paragraph("<b>Order Tracking</b>", styles['TableCellBold']),
            Paragraph("Simulated (Renders 5 checkpoints from order record)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagAmber']),
            Paragraph("Live Courier API integration (The Professional Couriers / Delhivery API)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Admin Pricing Matrix</b>", styles['TableCellBold']),
            Paragraph("Interactive Simulation (Local formulas, updates mock matrix & audit log)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("Admin API updating <code>price_matrix</code> and appending to immutable audit log", styles['TableCell'])
        ],
        [
            Paragraph("<b>Inventory Stock</b>", styles['TableCellBold']),
            Paragraph("Simulated (Local modal updates stock, triggers toasts)", styles['TableCell']),
            Paragraph("Yes", styles['TableCellTagRed']),
            Paragraph("PostgreSQL concurrency locks on <code>stock</code> column during checkout", styles['TableCell'])
        ]
    ]

    t_mat = Table(matrix_data, colWidths=[110, 160, 80, 190])
    t_mat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_mat)
    story.append(PageBreak())

    # =========================================================================
    # PART 9: USER JOURNEYS
    # =========================================================================
    story.append(create_chapter_header(9, "User Journeys & Workflow Diagrams", "Customer Purchase, Customer Authentication & Admin Fulfillment Workflows"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("9.1 Customer Purchasing Journey", styles['H1']))
    story.append(Paragraph(
        "The primary revenue-generating pathway traces a customer from discovery to home delivery.",
        styles['Body']
    ))

    cust_journey = """
    [ 1. Homepage ] ──────> [ 2. Shop All Catalogue ] ──────> [ 3. Product Details Page ]
    - Discovers cold press    - Filters by seed (Groundnut)   - Selects 1 Litre bottle pill
    - Reads Vaagai story      - Toggles in-stock only         - Checks Tenkasi PIN code (627811)
    - Toggles Tamil (தமிழ்)   - Sorts by price                - Reads 100g nutritional facts
                                                                       │
                                                                       v (Add to Basket)
    [ 6. Checkout Payment ] <──── [ 5. Delivery Address ] <──── [ 4. Shopping Cart ]
    - Chooses UPI payment         - Selects Tenkasi home address - Verifies 2 items in cart
    - Enters UPI VPA ID           - Or adds new Tamil Nadu addr  - Applies coupon NATURAL50 (-₹50)
    - Clicks 'Pay & Confirm'      - Confirms phone & PIN code    - Reaches ₹500 free shipping bar
            │
            v (Simulated Gateway Success)
    [ 7. Order Confirmation ] ───────────────────────────────> [ 8. Live Order Tracking ]
    - Bouncing checkmark                                       - Step 1: Placed (Tenkasi Mill)
    - Receives #SSK-2026-8942                                  - Step 2: Fresh Milling & Bottling
    - Views mill batch allocation                              - Step 3: Courier Handover (TPC AWB)
    - Clicks 'Track Live Order'                                - Step 4 & 5: Delivery to Doorstep
    """
    story.append(create_code_block(cust_journey))

    story.append(Spacer(1, 6))
    story.append(Paragraph("9.2 Customer Authentication Journey", styles['H1']))
    auth_journey = """
    [ Unauthenticated Visitor ] ──> Clicks 'Account' or Checkout Prompt ──> [ Login Page (/login) ]
                                                                                   │
             ┌─────────────────────────────────────────────────────────────────────┴────────────┐
             │ (Method A: Password)                                                             │ (Method B: SMS OTP)
             v                                                                                  v
    [ Enters Mobile & Password ]                                                      [ Enters Mobile Number ]
             │                                                                                  │
             v                                                                                  v
    [ Authenticates Credentials ]                                                     [ OtpVerificationPage (/verify-otp) ]
             │                                                                        - 6 auto-focus digit inputs
             │                                                                        - 29s countdown timer
             │                                                                        - Demo OTP: 123456
             │                                                                                  │
             └─────────────────────────────────┬────────────────────────────────────────────────┘
                                               │
                                               v (Authentication Success)
                                  [ Sets ssk_mock_auth_user ]
                                  [ Updates useAppStore.currentUser ]
                                               │
                                               v (Redirect to Destination)
                      [ Account Dashboard (/account) ]  OR  [ Checkout Pipeline (/checkout) ]
    """
    story.append(create_code_block(auth_journey))

    story.append(Spacer(1, 6))
    story.append(Paragraph("9.3 Admin Operations & Fulfillment Journey", styles['H1']))
    admin_journey = """
    [ Mill Manager ] ──> [ Admin Login (/admin/login) ] ──> Authenticates ──> [ Admin Dashboard (/admin/dashboard) ]
                                                                                   │
         ┌─────────────────────────┬──────────────────────────┬────────────────────┴────────────────────┐
         │                         │                          │                                         │
         v                         v                          v                                         v
    [ Products & Stock ]     [ Pricing Matrix ]        [ Price Audit Ledger ]                   [ Order Fulfillment ]
    - Reviews live litres    - Raw seed cost slider    - Reviews historical changes             - Inspects placed orders
    - Adjusts batch count    - Margin % simulator      - Timestamp IST, variance %              - Updates: Placed -> Milling
    - Opens Product Studio   - Deploys new rates       - Modifier audit hash                    - Assigns Courier AWB #
    """
    story.append(create_code_block(admin_journey))
    story.append(PageBreak())

    # =========================================================================
    # PART 10: DESIGN SYSTEM AND RESPONSIVENESS
    # =========================================================================
    story.append(create_chapter_header(10, "Design System & Responsiveness", "Color Architecture, Typography, 8px Grid & Tested Mobile Breakpoints"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("10.1 Color Architecture", styles['H1']))
    story.append(Paragraph(
        "The SSK Natural Gold visual system is grounded in agrarian authenticity, clinical purity, and culinary warmth. "
        "Every color token is codified in <code>frontend/src/tokens/index.ts</code> and mirrored in <code>frontend/tailwind.config.js</code>:",
        styles['Body']
    ))

    colors_data = [
        [Paragraph("<b>Color Token</b>", styles['TableHead']), Paragraph("<b>Hex Code</b>", styles['TableHead']), Paragraph("<b>Design Meaning &amp; Usage</b>", styles['TableHead'])],
        [
            Paragraph("<b>Primary Slate Base</b>", styles['TableCellBold']),
            Paragraph("<code>#1E293B</code>", styles['TableCell']),
            Paragraph("Institutional foundation, dominant headers, primary buttons, high-emphasis text. Replaces harsh true black with stone-tempered depth.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Harvest Amber Accent</b>", styles['TableCellBold']),
            Paragraph("<code>#D48817</code>", styles['TableCell']),
            Paragraph("Warm golden tone derived from cold-pressed sesame and groundnut extractions. Used for primary CTAs, ratings, bestseller tags, free shipping progress.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Forest Green Purity</b>", styles['TableCellBold']),
            Paragraph("<code>#166534</code>", styles['TableCell']),
            Paragraph("Botanical leaf green representing certified organic coconut copra, Vaagai wood extraction, and 100% natural certifications.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Surface Canvas</b>", styles['TableCellBold']),
            Paragraph("<code>#FFFFFF</code>", styles['TableCell']),
            Paragraph("Pristine white container surface ensuring sanitary, food-grade presentation for edible oil bottles.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Master Background</b>", styles['TableCellBold']),
            Paragraph("<code>#F8F9FF</code>", styles['TableCell']),
            Paragraph("Subtle tinted canvas softening screen glare and providing contrast against white cards.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Structural Border</b>", styles['TableCellBold']),
            Paragraph("<code>#E2E8F0</code>", styles['TableCell']),
            Paragraph("Low-contrast outlines for cards, pack size pills, input fields, and division rules.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Functional Semantics</b>", styles['TableCellBold']),
            Paragraph("Success: <code>#15803D</code><br/>Warning: <code>#D97706</code><br/>Error: <code>#DC2626</code>", styles['TableCell']),
            Paragraph("Verified order status, low stock warnings ('Only 3 left in stock'), payment failure alerts, and validation errors.", styles['TableCell'])
        ]
    ]
    t_col = Table(colors_data, colWidths=[130, 90, 320])
    t_col.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_col)

    story.append(Spacer(1, 8))
    story.append(Paragraph("10.2 Typography Rules & Bilingual Integration", styles['H1']))
    story.append(Paragraph(
        "• <b>Primary Typeface:</b> <code>Inter</code> handles all Latin strings, numerals, and transaction totals with clean geometric precision.<br/>"
        "• <b>Regional Typeface:</b> <code>Noto Sans Tamil</code> is paired alongside Inter for seamless bilingual rendering. Tamil glyphs inherit equivalent font weights with slightly increased vertical padding (+2px) on button and pill wrappers to prevent descender clipping.<br/>"
        "• <b>Tabular Numerals (<code>tnum</code>):</b> Enforced via <code>font-variant-numeric: tabular-nums</code> across all currency displays (₹), volume calculations (500ml, 1L, 5L, 15L), cart matrices, and invoice line items to guarantee absolute vertical baseline alignment.",
        styles['Body']
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("10.3 8px Grid System & Responsive Viewport Matrix", styles['H1']))
    story.append(Paragraph(
        "All component margins, paddings, and heights align strictly with an 8px grid cadence:<br/>"
        "<code>space-xs</code> (4px), <code>space-sm</code> (8px), <code>space-md</code> (16px), <code>space-lg</code> (24px), <code>space-xl</code> (32px), <code>space-2xl</code> (48px), <code>space-3xl</code> (64px).<br/>"
        "The frontend has been verified across 7 responsive viewport widths:",
        styles['Body']
    ))

    viewports = [
        ("360px", "Small Mobile (Android Entry)", "Single-column product grid, sticky bottom nav, 16px margins, compact 36px touch targets."),
        ("375px", "Standard Mobile (iPhone SE)", "Full fluid cards, optimized single-tap quantity selector, full-width checkout CTAs."),
        ("390px", "Modern Flagship Mobile (iPhone 14/15/16)", "Reference Google Stitch target resolution (390px fluid container). Flawless layout."),
        ("430px", "Large Mobile (Pro Max / Plus)", "Expanded card gutters (20px), multi-pack pill wrapping without horizontal overflow."),
        ("768px", "Tablet Portrait (iPad Mini/Air)", "2-column product grid, sidebar filter drawer, full customer header, hidden bottom nav."),
        ("1024px", "Tablet Landscape / Laptop", "3-column product grid, sticky checkout order summary sidebar, full admin sidebar."),
        ("1440px", "Desktop Monitor (Max Container)", "4-column product grid, 1440px centered page boundary, 12-column grid layout.")
    ]
    for vp, name, desc in viewports:
        story.append(Paragraph(f"• <b>{vp} — {name}:</b> {desc}", styles['Bullet']))

    story.append(PageBreak())

    # =========================================================================
    # PART 11: GOOGLE STITCH AND ANTIGRAVITY WORKFLOW
    # =========================================================================
    story.append(create_chapter_header(11, "Google Stitch & Antigravity Workflow", "35 Approved UI Screens, Stitch MCP Tools & AI Pair Programming Synthesis"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("11.1 The Role of Google Stitch in SSK Natural Gold", styles['H1']))
    story.append(Paragraph(
        "<b>Google Stitch</b> served as the foundational visual design studio for the SSK Natural Gold e-commerce platform. "
        "Stitch project <code>projects/14506723155971501244</code> contains <b>35 approved design screens</b> establishing the brand identity, typography, color palettes, and component states. "
        "Rather than relying on vague wireframes or generic templates, every single screen in the application corresponds to an approved high-fidelity Stitch design specification.",
        styles['Body']
    ))

    story.append(Paragraph("11.2 Mapping of 35 Stitch Screen Specifications to Implemented Pages", styles['H1']))
    stitch_map = [
        ("Screen bf8b3d77... / 0061c288...", "SSK Natural Gold Design System Board", "/design-system, /showcase", "ComponentShowcase.tsx"),
        ("Screen e037354b... / 7d58728b...", "Desktop Homepage & Mobile Homepage", "/, /home", "HomePage.tsx"),
        ("Screen 78e73458...", "Mobile Shop All (Product Listing)", "/shop, /products", "ShopAllPage.tsx"),
        ("Screen f54b5181...", "Mobile Product Details Page (PDP)", "/products/:slug", "ProductDetailPage.tsx"),
        ("Screen 3e9aeab2...", "Mobile Shopping Cart", "/cart", "CartPage.tsx"),
        ("Screen 45be21d9...", "Checkout Delivery Address", "/checkout, /checkout/address", "CheckoutAddressPage.tsx"),
        ("Screen 9454b0a9...", "Checkout Payment Selection", "/checkout/payment", "CheckoutPaymentPage.tsx"),
        ("Screen fc017281...", "Order Confirmation & Success", "/checkout/success", "CheckoutSuccessPage.tsx"),
        ("Screen 36d46fe1... / ac071745...", "Customer Login (Desktop & Mobile)", "/login", "LoginPage.tsx"),
        ("Screen 103d36c5... / 1b08bec0...", "Customer Registration (Desktop & Mobile)", "/register", "RegisterPage.tsx"),
        ("Screen a33cadd1... / a8944b7e...", "OTP Verification (Desktop & Mobile)", "/verify-otp", "OtpVerificationPage.tsx"),
        ("Screen 4e03f8a7... / f8f00077...", "Forgot Password & Reset Password", "/forgot-password, /reset-password", "ForgotPasswordPage, ResetPasswordPage"),
        ("Screen b7d7405b...", "Mobile Customer Account Dashboard", "/account", "AccountDashboardPage.tsx"),
        ("Screen d80dd30e...", "Mobile My Orders History", "/account/orders", "OrderHistoryPage.tsx"),
        ("Screen e045a79f...", "Mobile Order Tracking & Details", "/orders/:orderId, /track", "OrderTrackingPage.tsx"),
        ("Screen fbbae8fdf...", "About Us & FAQ Hub", "/about, /faq", "AboutUsPage.tsx"),
        ("Screen d9575b01...", "Contact & Wholesale Enquiries", "/contact, /wholesale", "ContactWholesalePage.tsx"),
        ("Screen 00bf3e40...", "Policies & Legal Hub", "/policies, /terms, /privacy", "PoliciesLegalPage.tsx"),
        ("Screen 1e77593f... / 84e1b83c...", "Admin Dashboard & Admin Login", "/admin, /admin/login", "AdminDashboardPage, AdminLoginPage"),
        ("Screen 76922615... / efed7c82...", "Admin Product & Inventory Management", "/admin/products", "AdminProductsPage.tsx"),
        ("Screen 8a18a0af...", "Add / Edit Product Studio", "/admin/products/new", "AdminProductStudioPage.tsx"),
        ("Screen 76437859...", "Dynamic Price Management & Rate Matrix", "/admin/pricing", "AdminPricingPage.tsx"),
        ("Screen e70f2322...", "Price Audit History Ledger", "/admin/pricing/audit", "AdminPriceAuditPage.tsx"),
        ("Screen 7f7c55cb...", "Admin Order Fulfillment & Courier Dispatch", "/admin/orders", "AdminOrdersPage.tsx"),
        ("Screen 0da938cb... / 2fd51df4...", "Admin Safeguards & Mobile Edge States", "/admin/safeguards", "AdminSafeguardsPage.tsx")
    ]

    t_sm_data = [
        [Paragraph("<b>Google Stitch Screen ID</b>", styles['TableHead']), Paragraph("<b>Design Screen Title</b>", styles['TableHead']), Paragraph("<b>Application Route</b>", styles['TableHead']), Paragraph("<b>React Source File</b>", styles['TableHead'])]
    ]
    for sid, stitle, sroute, sfile in stitch_map:
        t_sm_data.append([
            Paragraph(f"<code>{sid}</code>", styles['TableCellSmall']),
            Paragraph(stitle, styles['TableCellBold']),
            Paragraph(f"<code>{sroute}</code>", styles['TableCell']),
            Paragraph(f"<code>{sfile}</code>", styles['TableCell'])
        ])

    t_sm = Table(t_sm_data, colWidths=[120, 160, 120, 140])
    t_sm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_sm)
    story.append(PageBreak())

    # =========================================================================
    # PART 12: BACKEND READINESS
    # =========================================================================
    story.append(create_chapter_header(12, "Backend Readiness & Future Roadmap", "Postponed Architecture, PostgreSQL, Prisma ORM Scaffold & 6-Phase API Plan"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("12.1 Backend Readiness Assessment", styles['H1']))
    story.append(Paragraph(
        "As established in strategic project decisions, <b>backend development was intentionally postponed</b> to prioritize a flawless, client-reviewable frontend. "
        "A strict inspection of <code>R:\\SSG\\website\\backend</code> confirms the current architectural status:",
        styles['Body']
    ))

    backend_checks = [
        "<b>PostgreSQL Database:</b> Service <code>postgresql-x64-18</code> is currently running locally on port 5432. Connection URL: <code>postgresql://postgres:password@localhost:5432/ssk_natural_gold?schema=public</code>.",
        "<b>Prisma ORM Scaffold:</b> <code>backend/prisma/schema.prisma</code> is configured with the PostgreSQL client generator. However, <b>zero data models</b> have been defined yet (line 13: <i>'Schemas and models will be defined during subsequent feature implementation phases'</i>).",
        "<b>Express.js Server:</b> Server is initialized in <code>backend/src/app.ts</code> and listens on port 5000 via <code>tsx watch src/server.ts</code>. Includes CORS middleware restricted to <code>http://localhost:3000</code> and JSON body parsing.",
        "<b>Operational Health Endpoint:</b> <code>GET /api/health</code> is live and verified operating normally (returns JSON with <code>success: true, uptime, timestamp</code>).",
        "<b>Missing Services:</b> Authentication JWT verification, customer password hashing, SMS OTP dispatch, Razorpay payment webhooks, database transaction models, and AWB logistics API connectors are entirely missing and must be developed in the backend phase."
    ]
    for b in backend_checks:
        story.append(Paragraph(f"• {b}", styles['Bullet']))

    story.append(Spacer(1, 8))
    story.append(Paragraph("12.2 Proposed PostgreSQL Prisma Database Models", styles['H1']))
    story.append(Paragraph(
        "When backend implementation commences, the following core schema models must be declared in <code>schema.prisma</code>:",
        styles['Body']
    ))

    prisma_schema_preview = """
    enum Role { CUSTOMER, ADMIN }
    enum OrderStatus { ORDER_PLACED, EXTRACTION_PACKING, DISPATCHED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED }
    enum PaymentMethod { UPI, CARD, NET_BANKING, COD }
    enum PaymentStatus { PENDING, PAID, FAILED }

    model User {
      id        String    @id @default(uuid())
      name      String
      email     String    @unique
      phone     String    @unique
      password  String    // bcrypt hashed
      role      Role      @default(CUSTOMER)
      addresses Address[]
      orders    Order[]
      createdAt DateTime  @default(now())
    }

    model Product {
      id          String           @id @default(uuid())
      slug        String           @unique
      category    String           // groundnut, sesame, coconut
      name        String
      nameTa      String
      tagline     String
      fssaiLic    String
      featured    Boolean          @default(false)
      inStock     Boolean          @default(true)
      variants    ProductVariant[]
      createdAt   DateTime         @default(now())
    }

    model ProductVariant {
      id        String   @id @default(uuid())
      productId String
      product   Product  @relation(fields: [productId], references: [id])
      sku       String   @unique
      volume    String   // 500 ml, 1 Litre, 5 L Tin, 15 L Tin
      volumeMl  Int
      mrp       Float
      price     Float
      stock     Int
    }

    model Order {
      id            String        @id @default(uuid())
      orderNumber   String        @unique // SSK-2026-XXXX
      userId        String?
      user          User?         @relation(fields: [userId], references: [id])
      status        OrderStatus   @default(ORDER_PLACED)
      paymentMethod PaymentMethod
      paymentStatus PaymentStatus @default(PENDING)
      subtotal      Float
      discount      Float         @default(0)
      deliveryFee   Float         @default(0)
      tax           Float
      total         Float
      shippingAddr  Json
      courier       String?
      awbNumber     String?
      createdAt     DateTime      @default(now())
    }
    """
    story.append(create_code_block(prisma_schema_preview))

    story.append(Spacer(1, 8))
    story.append(Paragraph("12.3 6-Phase Future Backend Implementation Roadmap", styles['H1']))
    roadmap_phases = [
        ("Phase 1: Database Setup & Migration", "Apply Prisma migrations against PostgreSQL, establish database seeds for products, variants, and admin accounts."),
        ("Phase 2: Authentication & SMS Service", "Implement JWT session generation, bcrypt password hashing, Fast2SMS / Twilio OTP API connectors."),
        ("Phase 3: Catalog & Pincode REST Endpoints", "Build GET /api/products, GET /api/products/:slug, POST /api/shipping/check-pincode with Redis caching."),
        ("Phase 4: Checkout & Razorpay Integration", "Implement ACID checkout transactions, Razorpay order creation, and HMAC-SHA256 webhook listeners."),
        ("Phase 5: Customer Account & Tracking", "Expose customer order histories, address CRUD operations, and live courier tracking webhooks."),
        ("Phase 6: Admin Operations & Audit Ledger", "Build role-guarded endpoints for stock adjustments, dynamic rate matrix updates, and immutable audit logs.")
    ]
    for p_title, p_desc in roadmap_phases:
        story.append(Paragraph(f"• <b>{p_title}:</b> {p_desc}", styles['Bullet']))

    story.append(PageBreak())
    return story
