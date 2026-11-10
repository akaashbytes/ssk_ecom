# PDF Documentation Generator - Parts 1 to 6
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from pdf_styles import (
    get_doc_styles, safe_text, create_chapter_header, create_callout,
    create_code_block, NAVY, AMBER, GREEN, RED, BG_SUBTLE, BORDER, BORDER_LIGHT,
    WHITE, TEXT_PRIMARY, TEXT_MUTED
)

def build_part1_to_6():
    styles = get_doc_styles()
    story = []

    # =========================================================================
    # COVER / TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    
    # Brand Badge
    badge_table = Table([[Paragraph("<font color='#D48817'><b>SSK NATURAL GOLD</b></font>  •  TENKASI TRADITIONAL COLD PRESSED OILS", styles['CalloutTitle'])]], colWidths=[540])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#FDE68A')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 25))

    story.append(Paragraph("Complete Project Learning &amp;<br/>Technical Documentation", styles['CoverTitle']))
    story.append(Paragraph("Enterprise Frontend Architecture, Operational Reference &amp; Developer Learning Guide", styles['CoverSubtitle']))
    
    story.append(HRFlowable(width="100%", thickness=3, color=NAVY, spaceAfter=20))

    meta_text = """
    <b>Platform Stack:</b> React 18 • TypeScript 5.7 • Vite 6.1 • Tailwind CSS 3.4 • Zustand 5.0 • React Router v7 • TanStack Query v5<br/>
    <b>Design &amp; AI Prototyping:</b> Google Stitch MCP (Project ID: 14506723155971501244) • Antigravity AI Pair Programming<br/>
    <b>Document Version:</b> 1.0.0-PROD-REF (Master Learning Edition)<br/>
    <b>Generation Date:</b> November 2026<br/>
    <b>Author / Engineering Team:</b> Advanced Agentic Coding Pair-Programming Suite (Google DeepMind Antigravity)<br/>
    <b>Target Audience:</b> Primary Project Developer, Solution Architects, Client Technical Evaluators
    """
    story.append(Paragraph(meta_text, styles['CoverMeta']))
    story.append(Spacer(1, 35))

    callout_cover = create_callout(
        "MANDATORY ARCHITECTURAL DIRECTIVE",
        "This document is a comprehensive, read-only architectural inspection of the SSK Natural Gold codebase. "
        "The 10 planned frontend implementation batches are reported 100% complete. Backend development has been intentionally postponed. "
        "All customer storefront workflows, checkout pipelines, and administrative consoles are verified active using high-fidelity local state and mock datasets.",
        "warning"
    )
    story.append(callout_cover)
    story.append(PageBreak())

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    story.append(Paragraph("<b>TABLE OF CONTENTS</b>", styles['H1']))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12))

    toc_items = [
        ("Part 1: Project Overview & Core Mission", "Enterprise Cold-Pressed Oil Commerce, Objectives, Personas, System Architecture"),
        ("Part 2: Complete Technology Stack", "React 18, TypeScript, Vite, Tailwind, Zustand, TanStack Query, Axios, Stitch MCP"),
        ("Part 3: Project Directory Structure", "Comprehensive Folder Tree, File Purpose, Consumption Hierarchy, Implementation Status"),
        ("Part 4: Complete Customer Storefront", "Deep-Dive into 19 Storefront Screens, Routes, Triggers, State, and UI Components"),
        ("Part 5: Complete Admin Dashboard", "7 Management Consoles, Inventory Ledger, Dynamic Pricing Matrix, Order Fulfillment"),
        ("Part 6: Important Application Functionalities", "Step-by-Step Internal Flow of 20 Core Features (Routing, Search, Cart, Coupons, etc.)"),
        ("Part 7: State Management & Data Flow", "Zustand Stores, Local vs Global vs Server State, Reactivity and Persistence"),
        ("Part 8: Mock Data & Simulated Functionality", "Catalog Datasets, Order History, User Auth Simulation vs Future Backend Requirements"),
        ("Part 9: User Journeys & Workflow Diagrams", "Customer Purchase Journey, Customer Auth Journey, and Admin Fulfillment Journey"),
        ("Part 10: Design System & Responsiveness", "Tokens (Slate, Amber, Green), Typography, Elevation, 8px Grid, Breakpoints (360px-1440px)"),
        ("Part 11: Google Stitch & Antigravity Workflow", "35 Approved Screens, Text-to-UI Pro, Design MD System, Antigravity AI Automation"),
        ("Part 12: Backend Readiness & Architecture", "PostgreSQL, Express, Prisma ORM, Health Endpoint, Missing Models, 6-Phase Roadmap"),
        ("Part 13: Security & Business Logic", "Authentication Integrity, RBAC, Payment Webhooks, Price Tamper-Proofing, Safeguards"),
        ("Part 14: Project Status & Remaining Work", "Module Completion Matrix, Technical Risks, Client Confirmations, Missing Services"),
        ("Part 15: Learning Guide for the Developer", "Windows CMD Setup, Development Operations, Finding Components, Adding New Features"),
        ("Part 16: Complete Navigation & Redirect Flow", "Master React Router Map, Protected Routes, Role Restrictions, Fallback Traps"),
        ("Part 17: Role-Based Access & Permissions", "Guest vs Customer vs Admin Matrix, Session Handling, Navigation Gateways"),
        ("Part 18: Complete Customer Operating Manual", "22 Detailed User Operational Scenarios from Catalog Exploration to Live Tracking"),
        ("Part 19: Complete Admin Operating Manual", "Full Operational Manual for Mill Managers: Stock, Pricing Matrix, Dispatches, AWB"),
        ("Part 20: Feature-by-Feature UI Inventory", "Comprehensive Catalog of Every Button, Filter, Modal, Stepper, Toast, and Input"),
        ("Part 21: Business Logic & Calculation Flows", "Formulas for Cart Subtotal, Tiered Free Shipping, 5% GST, Margin Simulator, Pricing"),
        ("Part 22: Application Operating Guide", "Developer Maintenance Cheat Sheet, Modifying Copy, Images, SKUs, and Translations"),
        ("Part 23: End-to-End Operational Test Cases", "20 Full Regression Test Cases with Preconditions, Steps, Expected Results, Status"),
        ("Part 24: Complete Project Knowledge Map", "Master Connection Architecture, Answers to 10 Fundamental Architectural Inquiries"),
        ("Appendix: Technical Glossary", "Definitions of Regional Culinary Concepts, Cold-Press Terms, and Software Terms")
    ]

    toc_table_data = []
    for num, (title, desc) in enumerate(toc_items, start=1):
        c1 = Paragraph(f"<b>{title}</b>", styles['TableCellBold'])
        c2 = Paragraph(desc, styles['TableCellSmall'])
        toc_table_data.append([c1, c2])

    t_toc = Table(toc_table_data, colWidths=[200, 340])
    t_toc.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # =========================================================================
    # PART 1: PROJECT OVERVIEW
    # =========================================================================
    story.append(create_chapter_header(1, "Project Overview", "Core Mission, Business Problem, Personas, Architecture & Decoupled Design"))
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.1 What is SSK Natural Gold?", styles['H1']))
    story.append(Paragraph(
        "<b>SSK Natural Gold</b> is an enterprise-grade direct-to-consumer (D2C) and business-to-business (B2B) e-commerce platform dedicated to authentic traditional cold-pressed edible oils. "
        "Manufactured directly at its agrarian mill located in <b>Tenkasi, Tamil Nadu</b>, the brand specializes in 100% pure, unrefined, and chemical-free edible oils extracted using heritage slow-rotating Vaagai wood mortars (மரச்செக்கு எண்ணெய்). "
        "The digital platform bridges the gap between centuries-old rural Tamil extraction practices and modern digital commerce, delivering verified purity from farm seeds directly to residential kitchens and commercial food manufacturers across India.",
        styles['Body']
    ))

    story.append(Paragraph("1.2 The Problem Solved by the Application", styles['H1']))
    p_problems = [
        "<b>Widespread Commercial Adulteration:</b> Modern retail edible oils are dominated by solvent-extracted, refined, bleached, and deodorized (RBD) oils processed at extreme temperatures (> 200°C) using industrial hexane solvents and acid bleaching clays. This strips natural nutrients, volatile antioxidants, and true culinary flavor.",
        "<b>Loss of Heritage Extraction Standards:</b> Authentic 'Marachekku' (wood-press) extraction preserves temperatures below 42°C, retaining polyphenol antioxidants and plant sterols. Consumers frequently struggle to find verifiable single-origin millers who adhere strictly to this standard.",
        "<b>Bilingual Consumer Accessibility:</b> Many South Indian households and traditional elders prefer Tamil interfaces, while institutional purchasers require English. The application provides an instant zero-latency bilingual toggle across all views.",
        "<b>B2B Wholesale Procurement Friction:</b> Commercial sweet makers, hotels, and caterers require bulk tins (15L / 15kg) with transparent tiered volume pricing, GST invoicing, and reliable freight dispatch tracking, which standard retail stores fail to provide."
    ]
    for p in p_problems:
        story.append(Paragraph(f"• {p}", styles['Bullet']))

    story.append(Spacer(1, 6))
    story.append(Paragraph("1.3 Primary Application Objectives", styles['H1']))
    story.append(Paragraph(
        "The SSK Natural Gold digital system is engineered around four core pillars:<br/>"
        "1. <b>Frictionless D2C Retail:</b> High-speed catalog browsing, pack-size selection (500ml, 1L, 5L, 15L), instant cart calculations, coupon incentives, and seamless checkout.<br/>"
        "2. <b>Authentic Visual Transparency:</b> Clear presentation of FSSAI certifications (Lic. 22426293000431), nutritional profiles per 100g, seed origin declarations (Saurashtra peanuts, Pollachi copra, Tenkasi black sesame), and traditional Vaagai wood extraction methods.<br/>"
        "3. <b>Administrative Operational Control:</b> Dedicated console for Tenkasi mill operators to monitor real-time revenue, manage live inventory in litres, dynamically calculate margins from raw seed costs, log cryptographic price audits, and fulfill shipments with AWB tracking.<br/>"
        "4. <b>Decoupled Architecture:</b> Clean separation between presentation layer and future REST API backend, guaranteeing independent maintainability and scalability.",
        styles['Body']
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("1.4 Intended User Personas", styles['H1']))
    personas_data = [
        [Paragraph("<b>User Persona</b>", styles['TableHead']), Paragraph("<b>Profile &amp; Demographics</b>", styles['TableHead']), Paragraph("<b>Primary Goals &amp; System Usage</b>", styles['TableHead'])],
        [
            Paragraph("<b>Urban Health-Conscious Homemaker</b>", styles['TableCellBold']),
            Paragraph("Age 28-50, residing in Chennai, Bengaluru, Coimbatore. Prioritizes family health, immunity, cold-pressed purity, and sulphur-free cooking.", styles['TableCell']),
            Paragraph("Browses retail pack sizes (500ml / 1L bottles), reviews nutritional facts, applies welcome promo codes, uses UPI / COD checkout, tracks parcel dispatch.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Traditional Culinary Purist</b>", styles['TableCellBold']),
            Paragraph("Age 40-70, regional Tamil speaker. Values traditional Vaagai wood chekku extraction and palm jaggery (Karupatti) sesame oil for idli/dosa and oil baths.", styles['TableCell']),
            Paragraph("Toggles website to Tamil (தமிழ்), reads extraction process details, verifies single-origin sourcing, seeks telephone/WhatsApp mill confirmation.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Commercial Bulk Buyer (B2B)</b>", styles['TableCellBold']),
            Paragraph("Sweet shop owners, caterers, restaurant operators requiring 200L - 1000L monthly edible oil.", styles['TableCell']),
            Paragraph("Submits wholesale inquiry forms with GSTIN, orders 15-Litre commercial tins, negotiates volume discounts, monitors freight logistics.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Tenkasi Mill Operations Admin</b>", styles['TableCellBold']),
            Paragraph("Plant manager and inventory dispatch clerk at the Tenkasi oil mill facility.", styles['TableCell']),
            Paragraph("Logs into admin console, monitors daily revenue KPIs, adjusts product stock in litres, calculates profit margins based on market seed prices, assigns courier AWBs.", styles['TableCell'])
        ]
    ]
    t_pers = Table(personas_data, colWidths=[130, 190, 220])
    t_pers.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_pers)

    story.append(Spacer(1, 8))
    story.append(Paragraph("1.5 Overall Decoupled System Architecture", styles['H1']))
    story.append(Paragraph(
        "The repository is organized into distinct, modular, and decoupled frontend and backend services following modern microservice/monorepo practices. "
        "Frontend and Backend maintain separate <code>package.json</code> files, separate TypeScript build configurations, and independent runtime lifecycles.",
        styles['Body']
    ))

    arch_diagram = """
    +----------------------------------------------------------------------------------------------------+
    |                                   SSK NATURAL GOLD CLIENT LAYER                                    |
    |                                                                                                    |
    |   [ Customer Storefront (19 Pages) ]             [ Admin Operations Console (7 Modules) ]           |
    |   - Homepage, Shop, Product Detail, Cart         - KPI Dashboard, Product Studio, Inventory        |
    |   - Checkout Pipeline (Address, Pay, Success)    - Dynamic Pricing Matrix, Audit Ledger            |
    |   - Customer Account, Orders, Live Tracking      - Order Fulfillment, Courier AWB Dispatch         |
    +-------------------------------------------------+--------------------------------------------------+
                                                      |
                                                      v
    +----------------------------------------------------------------------------------------------------+
    |                             STATE MANAGEMENT & REACTIVE DATA SERVICES                              |
    |                                                                                                    |
    |   - Zustand Global Stores: useCartStore (Persisted), useAppStore (Persisted), useLanguageStore     |
    |   - Simulated API Services: authService, productService, orderService, adminService                |
    |   - Local Storage Caching: 'ssk_cart_storage', 'ssk_app_storage', 'ssk_mock_orders'                |
    +----------------------------------------------------------------------------------------------------+
                                                      |  (Future REST API Boundary via Axios /api/*)
                                                      v
    +----------------------------------------------------------------------------------------------------+
    |                            SERVER API & DATABASE LAYER (INTENTIONALLY POSTPONED)                   |
    |                                                                                                    |
    |   - Runtime: Node.js + Express + TypeScript + tsx watch                                            |
    |   - Operational Endpoint: GET /api/health (Uptime: Active, Status 200 OK)                          |
    |   - Database: PostgreSQL (Port 5432, postgresql-x64-18 running locally)                            |
    |   - ORM Scaffold: Prisma ORM (schema.prisma connected to ssk_natural_gold DB)                     |
    +----------------------------------------------------------------------------------------------------+
    """
    story.append(create_code_block(arch_diagram))
    story.append(PageBreak())

    # =========================================================================
    # PART 2: COMPLETE TECHNOLOGY STACK
    # =========================================================================
    story.append(create_chapter_header(2, "Complete Technology Stack", "Verified Inspection of Frontend & Backend Dependencies and Configurations"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Every technology referenced in this section was verified directly in <code>frontend/package.json</code>, <code>backend/package.json</code>, and workspace configuration files. "
        "No uninstalled or hypothetical frameworks are described.",
        styles['Body']
    ))

    tech_stack = [
        {
            "name": "React (v18.3.1)",
            "what": "Industry-standard declarative UI component library.",
            "why": "Enables component-driven modularity, declarative rendering of cart and catalog matrices, and smooth interactive updates.",
            "where": "Every page in <code>frontend/src/pages/</code> and component in <code>frontend/src/components/</code>.",
            "files": "<code>src/main.tsx</code>, <code>src/App.tsx</code>, <code>src/pages/HomePage.tsx</code>",
            "example": "const [cartCount, setCartCount] = useState(3);\nconst isTamil = language === 'ta';"
        },
        {
            "name": "TypeScript (v5.7.2)",
            "what": "Statically typed superset of JavaScript developed by Microsoft.",
            "why": "Provides strict type contracts for domain models (Product, CartItem, Order, User, PriceAuditLog), eliminating runtime null errors.",
            "where": "Across the entire codebase (frontend and backend <code>.ts</code> and <code>.tsx</code> files).",
            "files": "<code>src/types/index.ts</code>, <code>frontend/tsconfig.json</code>, <code>backend/tsconfig.json</code>",
            "example": "export interface ProductVariant {\n  id: string;\n  volume: string;\n  mrp: number;\n  price: number;\n  stock: number;\n}"
        },
        {
            "name": "Vite (v6.1.0)",
            "what": "Next-generation frontend dev server and Rollup-based production bundler.",
            "why": "Lightning-fast hot module replacement (HMR in ~700ms) and optimized production chunk bundling.",
            "where": "Frontend build system, local development server running at <code>http://localhost:3000</code>.",
            "files": "<code>frontend/vite.config.ts</code>, <code>frontend/index.html</code>",
            "example": "export default defineConfig({\n  plugins: [react()],\n  resolve: { alias: { '@': path.resolve(__dirname, './src') } },\n  server: { port: 3000 }\n});"
        },
        {
            "name": "Tailwind CSS (v3.4.17)",
            "what": "Utility-first CSS framework with JIT (Just-In-Time) compilation.",
            "why": "Translates the Google Stitch design system tokens directly into responsive utility classes without CSS bloat.",
            "where": "Every component markup file and global styling.",
            "files": "<code>frontend/tailwind.config.js</code>, <code>frontend/src/index.css</code>",
            "example": "colors: {\n  brand: { slate: '#1E293B', amber: '#D48817', green: '#166534' },\n  surface: { bg: '#F8F9FF', border: '#E2E8F0' }\n}"
        },
        {
            "name": "React Router (v7.1.5)",
            "what": "Declarative client-side routing library for single-page applications.",
            "why": "Provides seamless URL navigation across 28 routes without full-page browser refreshes.",
            "where": "Root routing container and navigation links across headers and sidebars.",
            "files": "<code>src/routes/AppRoutes.tsx</code>, <code>src/App.tsx</code>",
            "example": "<Routes>\n  <Route path='/' element={<HomePage />} />\n  <Route path='/shop' element={<ShopAllPage />} />\n  <Route path='/checkout/payment' element={<CheckoutPaymentPage />} />\n</Routes>"
        },
        {
            "name": "Zustand (v5.0.3)",
            "what": "Minimalist, hook-based global state management library.",
            "why": "Provides reactive state without Redux boilerplate; built-in <code>persist</code> middleware synchronizes state with <code>localStorage</code>.",
            "where": "Cart management, customer session, address selection, language toggle, and toast notifications.",
            "files": "<code>src/stores/useCartStore.ts</code>, <code>src/stores/useAppStore.ts</code>, <code>src/stores/useLanguageStore.ts</code>",
            "example": "export const useCartStore = create<CartState>()(\n  persist((set, get) => ({\n    items: [...],\n    addItem: (item) => { ... },\n    getTotal: () => { ... }\n  }), { name: 'ssk_cart_storage' })\n);"
        },
        {
            "name": "TanStack Query / React Query (v5.66.0)",
            "what": "Powerful asynchronous state management and caching library.",
            "why": "Designed to manage future server state caching, background refetching, and query invalidation.",
            "where": "Configured as global <code>QueryClientProvider</code> wrapping the entire application.",
            "files": "<code>src/lib/queryClient.ts</code>, <code>src/App.tsx</code>",
            "example": "export const queryClient = new QueryClient({\n  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } }\n});"
        },
        {
            "name": "Axios (v1.7.9)",
            "what": "Promise-based HTTP client for browser and Node.js environments.",
            "why": "Configured with base URL, timeout, and request/response interceptors to communicate with the Express REST API.",
            "where": "API client singleton in <code>src/lib/axios.ts</code>.",
            "files": "<code>src/lib/axios.ts</code>",
            "example": "export const apiClient = axios.create({\n  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',\n  timeout: 10000\n});"
        },
        {
            "name": "Google Stitch MCP",
            "what": "Model Context Protocol interface connecting Antigravity to Google's text-to-UI engine.",
            "why": "Enabled direct generation, retrieval, and validation of 35 approved design system screens and design tokens.",
            "where": "MCP server configuration at <code>C:\\Users\\akaash\\.gemini\\antigravity\\mcp\\StitchMCP</code>.",
            "files": "Stitch Project ID: <code>projects/14506723155971501244</code>",
            "example": "Stitch Screen bf8b3d77... -> E-Commerce Design System Board\nStitch Screen 7d58728b... -> Mobile Homepage"
        },
        {
            "name": "Antigravity Agentic Platform",
            "what": "Google DeepMind's advanced agentic coding assistant.",
            "why": "Automated the complete multi-batch frontend construction, asset mapping, refactoring, and test verification.",
            "where": "Orchestrates workspace commands, file edits, subagents, and server processes.",
            "files": "Workspace root <code>R:\\SSG\\website</code>",
            "example": "Antigravity background daemons managing Vite dev server (:3000) and Express server (:5000)."
        }
    ]

    for t in tech_stack:
        story.append(Paragraph(f"<b>{t['name']}</b>", styles['H2']))
        content_p = (
            f"<b>What it is:</b> {t['what']}<br/>"
            f"<b>Why we use it:</b> {t['why']}<br/>"
            f"<b>Where used:</b> {t['where']}<br/>"
            f"<b>Important files:</b> {t['files']}"
        )
        story.append(Paragraph(content_p, styles['Body']))
        story.append(create_code_block(t['example']))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # PART 3: PROJECT DIRECTORY STRUCTURE
    # =========================================================================
    story.append(create_chapter_header(3, "Project Directory Structure", "Complete File Tree, Purpose, Consumption Hierarchy & Implementation Status"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "A full filesystem traversal of <code>R:\\SSG\\website</code> reveals a disciplined, feature-rich directory architecture. "
        "Below is the complete annotated directory tree followed by an in-depth inventory of every critical folder and file.",
        styles['Body']
    ))

    dir_tree = """
    R:\\SSG\\website\\
    ├── backend/                                   # Server-side REST API & database service
    │   ├── prisma/
    │   │   └── schema.prisma                      # PostgreSQL connection & Prisma ORM definitions
    │   ├── src/
    │   │   ├── config/
    │   │   │   ├── database.ts                    # PrismaClient singleton instance
    │   │   │   └── env.ts                         # Environment variable loader (PORT, CLIENT_URL, DB)
    │   │   ├── middlewares/
    │   │   │   ├── errorHandler.ts                # Global 500 error handler with stack traces in dev
    │   │   │   └── notFound.ts                    # 404 handler for unmatched API routes
    │   │   ├── routes/
    │   │   │   ├── health.routes.ts               # GET /api/health endpoint
    │   │   │   └── index.ts                       # Master Express router aggregator
    │   │   ├── app.ts                             # Express app setup, CORS, JSON body parser
    │   │   └── server.ts                          # HTTP listener on port 5000 & graceful shutdown
    │   ├── .env                                   # Active backend environment configuration
    │   ├── .env.example                           # Backend template environment file
    │   ├── package.json                           # Backend dependencies (Express, Prisma, cors, tsx)
    │   └── tsconfig.json                          # Backend TypeScript configuration
    │
    ├── frontend/                                  # Client-side React 18 single page application
    │   ├── public/                                # Public assets served directly by Vite
    │   ├── src/
    │   │   ├── assets/                            # Original product photography and brand assets
    │   │   │   ├── 0.jpeg - 9.jpeg                # High-res client bottle and copra photographs
    │   │   │   ├── logo.png                       # Official SSK Natural Gold brand logo
    │   │   │   ├── WhatsApp Image 2026-10-29...   # Authentic extraction lifestyle images
    │   │   │   └── index.ts                       # Semantic asset export module
    │   │   ├── components/
    │   │   │   ├── common/                        # 17 Reusable atomic UI primitive components
    │   │   │   │   ├── Button.tsx                 # Multi-variant, loading, and accessible button
    │   │   │   │   ├── Badge.tsx                  # Pills, dots, ribbons, and status chips
    │   │   │   │   ├── Card.tsx                   # Surface cards with subtle borders & shadows
    │   │   │   │   ├── Input.tsx, Select.tsx      # Form controls with label and error states
    │   │   │   │   ├── Checkbox.tsx, Radio.tsx    # Accessible selection inputs
    │   │   │   │   ├── Modal.tsx, Dialog.tsx      # Animated modal overlays with focus trapping
    │   │   │   │   ├── ConfirmationDialog.tsx     # Two-step destructive action guardrails
    │   │   │   │   ├── Toast.tsx                  # Global auto-dismissing toast notifications
    │   │   │   │   ├── LoadingSpinner.tsx         # Circular indicator & skeleton shimmer loaders
    │   │   │   │   ├── EmptyState.tsx, ErrorState.tsx # Fallback art and retry mechanisms
    │   │   │   │   ├── LanguageSwitcher.tsx       # Segmented & pill EN/TA language toggles
    │   │   │   │   ├── Icons.tsx                  # 24+ inline handcrafted SVG icons
    │   │   │   │   └── index.ts                   # Common components barrel export
    │   │   │   ├── layout/                        # 10 Responsive layout shells and wrappers
    │   │   │   │   ├── CustomerHeader.tsx         # Top banner, search, logo, links, mini-cart
    │   │   │   │   ├── CustomerFooter.tsx         # Heritage statement, FSSAI, footer links
    │   │   │   │   ├── CustomerLayout.tsx         # Full customer shell with bottom mobile nav
    │   │   │   │   ├── AdminSidebar.tsx           # Desktop 64px width fixed navigation bar
    │   │   │   │   ├── AdminHeader.tsx            # Operations console top bar with live clock
    │   │   │   │   ├── AdminLayout.tsx            # Desktop admin two-column layout shell
    │   │   │   │   ├── AuthLayout.tsx             # Centered card layout for login / OTP flows
    │   │   │   │   ├── MobileBottomNavigation.tsx # Sticky bottom 5-pill mobile menu (< 768px)
    │   │   │   │   ├── PageContainer.tsx          # Centered 1440px max-width boundary
    │   │   │   │   └── index.ts                   # Layout barrel export
    │   │   │   ├── product/                       # 6 Domain-specific product components
    │   │   │   │   ├── ProductCard.tsx            # Catalog card with inline pack size selector
    │   │   │   │   ├── PriceDisplay.tsx           # Tabular numerals, strikethrough, discount %
    │   │   │   │   ├── ProductImage.tsx           # Bottle media with skeleton placeholder
    │   │   │   │   ├── QuantitySelector.tsx       # Unified pill minus/count/plus control
    │   │   │   │   ├── RatingDisplay.tsx          # Golden stars with numeric score
    │   │   │   │   ├── StockStatus.tsx            # Pulsing green dot, low stock warning
    │   │   │   │   └── index.ts                   # Product components barrel export
    │   │   │   └── showcase/
    │   │   │       └── ComponentShowcase.tsx      # Comprehensive design system gallery view
    │   │   ├── lib/
    │   │   │   ├── axios.ts                       # Pre-configured Axios instance with baseURL
    │   │   │   └── queryClient.ts                 # TanStack QueryClient with 5m cache time
    │   │   ├── mock/                              # High-fidelity mock databases
    │   │   │   ├── products.ts                    # 3 cold-pressed oil varieties & 12 SKUs
    │   │   │   ├── users.ts                       # Mock customer & admin user profiles
    │   │   │   ├── addresses.ts                   # Tenkasi & Chennai customer delivery addresses
    │   │   │   ├── orders.ts                      # Multi-stage orders with full tracking checkpoints
    │   │   │   ├── adminData.ts                   # KPI metrics, price matrix, coupons, wholesale leads
    │   │   │   └── index.ts                       # Mock data barrel export
    │   │   ├── pages/                             # 26 Functional page view components
    │   │   │   ├── HomePage.tsx                   # Master landing page with hero and story
    │   │   │   ├── ShopAllPage.tsx                # Catalog browsing with search and filters
    │   │   │   ├── ProductDetailPage.tsx          # Variant selector, nutrition, pincode checker
    │   │   │   ├── CartPage.tsx                   # Cart item matrix, coupon engine, free shipping bar
    │   │   │   ├── CheckoutAddressPage.tsx        # Address selector and new address form
    │   │   │   ├── CheckoutPaymentPage.tsx        # UPI/Card/COD selector with simulated gateway
    │   │   │   ├── CheckoutSuccessPage.tsx        # Bouncing checkmark order confirmation
    │   │   │   ├── LoginPage.tsx, RegisterPage.tsx# Customer authentication pages
    │   │   │   ├── OtpVerificationPage.tsx        # 6-box auto-advance OTP with countdown
    │   │   │   ├── ForgotPasswordPage.tsx         # Password reset request page
    │   │   │   ├── ResetPasswordPage.tsx          # New password confirmation page
    │   │   │   ├── AccountDashboardPage.tsx       # Customer profile, live active order card
    │   │   │   ├── OrderHistoryPage.tsx           # Customer past orders with filter tabs
    │   │   │   ├── OrderTrackingPage.tsx          # 5-step vertical mill tracking timeline
    │   │   │   ├── AboutUsPage.tsx                # Vaagai wood heritage & FAQ accordion hub
    │   │   │   ├── ContactWholesalePage.tsx       # B2B quotation form & direct mill inquiry
    │   │   │   ├── PoliciesLegalPage.tsx          # Shipping, Return, Privacy, Terms tabbed hub
    │   │   │   ├── NotFoundPage.tsx               # 404 catch-all error view
    │   │   │   ├── AdminLoginPage.tsx             # Mill operations admin sign-in console
    │   │   │   ├── AdminDashboardPage.tsx         # Operations dashboard with 4 KPI cards & chart
    │   │   │   ├── AdminProductsPage.tsx          # SKU inventory table with stock adjustment modal
    │   │   │   ├── AdminProductStudioPage.tsx     # Add/edit product studio (bilingual, variants)
    │   │   │   ├── AdminPricingPage.tsx           # Dynamic price simulator & margin controls
    │   │   │   ├── AdminPriceAuditPage.tsx        # Cryptographic price change audit ledger
    │   │   │   ├── AdminOrdersPage.tsx            # Order fulfillment table & AWB assignment
    │   │   │   ├── AdminSafeguardsPage.tsx        # Destructive deletion locks & safety guardrails
    │   │   │   └── index.ts                       # Pages barrel export
    │   │   ├── routes/
    │   │   │   └── AppRoutes.tsx                  # Complete React Router v7 route definitions
    │   │   ├── services/                          # Simulated API communication layer
    │   │   │   ├── authService.ts                 # Login, OTP verification, register, logout
    │   │   │   ├── productService.ts              # Products fetch, category filter, pincode lookup
    │   │   │   ├── orderService.ts                # Place order, update status, local order cache
    │   │   │   ├── adminService.ts                # Metrics, pricing matrix updates, wholesale leads
    │   │   │   └── index.ts                       # Services barrel export
    │   │   ├── stores/                            # Zustand reactive state stores
    │   │   │   ├── useAppStore.ts                 # User session, address book, search modal
    │   │   │   ├── useCartStore.ts                # Shopping cart items, coupons, totals, tax
    │   │   │   ├── useLanguageStore.ts            # Instant EN/TA language switcher
    │   │   │   └── useToastStore.ts               # Global toast dispatching state
    │   │   ├── tokens/
    │   │   │   └── index.ts                       # Authoritative Stitch design tokens
    │   │   ├── types/
    │   │   │   └── index.ts                       # Master TypeScript domain interfaces
    │   │   ├── App.tsx                            # App root component with Router & QueryClient
    │   │   ├── index.css                          # Tailwind directives & custom CSS scrollbars
    │   │   ├── main.tsx                           # React DOM bootstrap entry point
    │   │   └── vite-env.d.ts                      # Vite environment type declarations
    │   ├── .env                                   # Frontend active environment variables
    │   ├── .env.example                           # Frontend template environment variables
    │   ├── index.html                             # Single page HTML entry with Google Fonts
    │   ├── package.json                           # Frontend dependencies and scripts
    │   ├── postcss.config.js                      # PostCSS Tailwind & Autoprefixer plugins
    │   ├── tailwind.config.js                     # Tailwind theme extensions (brand colors, tnum)
    │   └── tsconfig.json                          # Strict TypeScript compiler options
    │
    ├── docs/
    │   └── architecture.md                        # Architectural specification document
    ├── README.md                                  # Developer installation and startup guide
    └── .gitignore                                 # Git ignore rules for node_modules, dist, .env
    """
    story.append(create_code_block(dir_tree))
    story.append(PageBreak())

    # Detailed Folder Breakdown Table
    story.append(Paragraph("3.1 Detailed Folder Purpose & Implementation Inventory", styles['H1']))
    folders_data = [
        [Paragraph("<b>Directory Path</b>", styles['TableHead']), Paragraph("<b>Purpose &amp; Architectural Role</b>", styles['TableHead']), Paragraph("<b>Primary Consumers</b>", styles['TableHead']), Paragraph("<b>Status</b>", styles['TableHead'])],
        [
            Paragraph("<code>frontend/src/assets/</code>", styles['TableCellBold']),
            Paragraph("Houses original high-resolution product photography (groundnut, sesame, coconut bottles, copra) and the official brand logo.", styles['TableCell']),
            Paragraph("Exported via <code>assets/index.ts</code> to ProductCard, HomePage, Cart, and Admin screens.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/components/common/</code>", styles['TableCellBold']),
            Paragraph("Reusable low-level UI primitives (Button, Input, Select, Badge, Card, Modal, Toast, SkeletonLoader).", styles['TableCell']),
            Paragraph("Consumed universally by every page and layout across customer and admin consoles.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/components/layout/</code>", styles['TableCellBold']),
            Paragraph("Structural layout wrappers providing headers, footers, desktop sidebars, and sticky mobile navigation.", styles['TableCell']),
            Paragraph("Wraps all route views in <code>AppRoutes.tsx</code>.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/components/product/</code>", styles['TableCellBold']),
            Paragraph("Domain-specific product widgets including ProductCard, PriceDisplay, QuantitySelector, RatingDisplay, and StockStatus.", styles['TableCell']),
            Paragraph("Used in HomePage, ShopAllPage, ProductDetailPage, and CartPage.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/pages/</code>", styles['TableCellBold']),
            Paragraph("26 full-page components representing every customer and administrative view in the application.", styles['TableCell']),
            Paragraph("Loaded directly by React Router in <code>AppRoutes.tsx</code>.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/stores/</code>", styles['TableCellBold']),
            Paragraph("4 Zustand global state stores managing shopping cart, user session, language preference, and notification toasts.", styles['TableCell']),
            Paragraph("Imported across components for real-time reactivity without prop drilling.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/services/</code>", styles['TableCellBold']),
            Paragraph("Simulated asynchronous API service layer mimicking REST endpoints with realistic network delays (80ms - 350ms).", styles['TableCell']),
            Paragraph("Consumed by page components; abstracts mock data from UI logic.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/mock/</code>", styles['TableCellBold']),
            Paragraph("High-fidelity static and persistent mock databases for products, variants, orders, coupons, addresses, and KPI metrics.", styles['TableCell']),
            Paragraph("Consumed by the services layer and Zustand stores.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/tokens/</code>", styles['TableCellBold']),
            Paragraph("Authoritative design tokens derived from the Google Stitch design system (P1–P16A) specifying hex colors, shadows, and radii.", styles['TableCell']),
            Paragraph("Mirrored inside <code>tailwind.config.js</code> and <code>ComponentShowcase.tsx</code>.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>frontend/src/types/</code>", styles['TableCellBold']),
            Paragraph("Comprehensive TypeScript domain interfaces for Product, Variant, CartItem, Order, User, Address, and Admin entities.", styles['TableCell']),
            Paragraph("Referenced across every TypeScript file in the frontend.", styles['TableCell']),
            Paragraph("Implemented", styles['TableCellTagGreen'])
        ],
        [
            Paragraph("<code>backend/src/</code>", styles['TableCellBold']),
            Paragraph("Express.js server scaffold with CORS, error middlewares, and an active <code>GET /api/health</code> endpoint.", styles['TableCell']),
            Paragraph("Standby server running on port 5000.", styles['TableCell']),
            Paragraph("Scaffold Only", styles['TableCellTagAmber'])
        ],
        [
            Paragraph("<code>backend/prisma/</code>", styles['TableCellBold']),
            Paragraph("Prisma schema file configured with PostgreSQL connection string. Models are currently pending implementation.", styles['TableCell']),
            Paragraph("Backend database migration pipeline.", styles['TableCell']),
            Paragraph("Scaffold Only", styles['TableCellTagAmber'])
        ]
    ]

    t_folders = Table(folders_data, colWidths=[120, 190, 160, 70])
    t_folders.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, BG_SUBTLE])
    ]))
    story.append(t_folders)
    story.append(PageBreak())

    # =========================================================================
    # PART 4: COMPLETE CUSTOMER STOREFRONT
    # =========================================================================
    story.append(create_chapter_header(4, "Complete Customer Storefront", "Detailed Walkthrough of All 19 Implemented Customer-Facing Screens"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Every customer screen described below is fully implemented, verified interactive, and connected to local state stores and mock data services. "
        "No screen was skipped or assumed.",
        styles['Body']
    ))

    screens_list = [
        {
            "num": "4.1",
            "name": "Homepage",
            "routes": "<code>/</code>, <code>/home</code>",
            "purpose": "Primary landing page communicating brand trust, certified Vaagai wood cold-pressed heritage, product highlights, and direct purchasing.",
            "components": "<code>CustomerHeader</code>, <code>ProductCard</code>, <code>Button</code>, <code>Badge</code>, <code>Modal</code>, <code>CustomerFooter</code>, <code>MobileBottomNavigation</code>",
            "features": "Hero banner with dynamic CTA, Quick add-to-cart with pack selector, Retail vs Bulk category tabs, 3 highlighted cold-pressed varieties, Mill extraction video section, 6-question bilingual FAQ accordion, B2B wholesale modal trigger, FSSAI compliance badge.",
            "state": "Local component state for active tab ('retail' vs 'bulk'), open FAQ accordion index, wholesale modal visibility; Zustand <code>useLanguageStore</code> for EN/TA strings.",
            "data": "<code>MOCK_PRODUCTS</code>, <code>assets/index.ts</code>",
            "file": "<code>frontend/src/pages/HomePage.tsx</code>"
        },
        {
            "num": "4.2",
            "name": "Shop All (Product Catalogue)",
            "routes": "<code>/shop</code>, <code>/products</code>",
            "purpose": "Comprehensive product catalog allowing consumers to search, filter by extraction seed, sort by price, and toggle availability.",
            "components": "<code>CustomerLayout</code>, <code>ProductCard</code>, <code>Input</code>, <code>Badge</code>, <code>LoadingSpinner</code>, <code>EmptyState</code>",
            "features": "Search input with live keyword matching, Category pills (All, Groundnut, Sesame, Coconut), In-Stock Only toggle switch, Sort dropdown (Featured, Price: Low to High, Price: High to Low), Mobile filter slide-over drawer, Active filter chips, Wishlist heart toggle.",
            "state": "URL search parameters (<code>?category=</code>, <code>?q=</code>) synchronized with React state; selected pack variant map per product; favorites dictionary.",
            "data": "<code>productService.getAllProducts()</code>",
            "file": "<code>frontend/src/pages/ShopAllPage.tsx</code>"
        },
        {
            "num": "4.3",
            "name": "Product Details Page (PDP)",
            "routes": "<code>/products/:slug</code>, <code>/product/:slug</code>",
            "purpose": "In-depth product showcase detailing chemical-free extraction standards, nutritional analysis, lab purity highlights, and delivery estimations.",
            "components": "<code>CustomerLayout</code>, <code>PriceDisplay</code>, <code>QuantitySelector</code>, <code>RatingDisplay</code>, <code>Button</code>, <code>Badge</code>",
            "features": "Interactive image gallery switcher (Bottle shot + Mill extraction photo), Multi-pack selection pills (500ml bottle, 1L bottle, 5L tin, 15L commercial tin), Real-time unit price update, Quantity selector stepper, Live Pincode Delivery Checker with transit estimation (Tenkasi mill 1-2 days vs pan-India 4-6 days), Nutritional Facts table per 100g, Vaagai wood mortar heritage explanation, Related products carousel.",
            "state": "Selected variant state, active thumbnail index, quantity state, pincode input and validation response; Zustand <code>addItem</code> trigger.",
            "data": "<code>productService.getProductBySlug(slug)</code>, <code>productService.checkPincode()</code>",
            "file": "<code>frontend/src/pages/ProductDetailPage.tsx</code>"
        },
        {
            "num": "4.4",
            "name": "Shopping Cart",
            "routes": "<code>/cart</code>",
            "purpose": "Interactive shopping bag allowing customers to modify quantities, review order subtotals, apply promo coupons, and track free shipping thresholds.",
            "components": "<code>CustomerLayout</code>, <code>QuantitySelector</code>, <code>PriceDisplay</code>, <code>Button</code>, <code>EmptyState</code>, <code>Icons</code>",
            "features": "Cart item table with bottle thumbnails and volume tags, Quantity stepper connected to stock ceiling, Item trash remover, Free Delivery Progress Bar (₹500 threshold with dynamic percentage indicator), Promo coupon input with validation feedback (NATURAL50, WELCOME100, TENKASIGOLD), 5% GST tax calculation preview, Order summary breakdown, Proceed to Checkout CTA.",
            "state": "Zustand <code>useCartStore</code> (persisted in <code>localStorage</code> under <code>ssk_cart_storage</code>); local coupon code text input.",
            "data": "<code>useCartStore</code>, <code>MOCK_COUPONS</code>",
            "file": "<code>frontend/src/pages/CartPage.tsx</code>"
        },
        {
            "num": "4.5",
            "name": "Checkout Delivery Address",
            "routes": "<code>/checkout</code>, <code>/checkout/address</code>",
            "purpose": "First phase of checkout pipeline enabling address selection or new delivery address creation.",
            "components": "<code>CustomerLayout</code>, <code>Input</code>, <code>Select</code>, <code>Radio</code>, <code>Button</code>, <code>Badge</code>",
            "features": "Saved address radio list (Home, Work, Commercial), Default address badge, 'Add New Delivery Address' expandable form, Full address validation (PIN code, phone, street, landmark), Order subtotal sticky sidebar preview, Continue to Payment CTA.",
            "state": "Zustand <code>useAppStore</code> (selectedAddressId, addresses array); form input state.",
            "data": "<code>MOCK_ADDRESSES</code> in <code>useAppStore</code>",
            "file": "<code>frontend/src/pages/CheckoutAddressPage.tsx</code>"
        },
        {
            "num": "4.6",
            "name": "Checkout Payment Selection",
            "routes": "<code>/checkout/payment</code>",
            "purpose": "Final checkout stage where the customer selects their preferred payment method and executes simulated payment.",
            "components": "<code>CustomerLayout</code>, <code>Radio</code>, <code>Button</code>, <code>Badge</code>, <code>Modal</code>",
            "features": "Payment method tabs (UPI with VPA input, Credit/Debit Card with card formatters, Net Banking bank selector, Cash on Delivery with verification notice), 256-bit SSL Security badge, Edge-case 'Simulate Payment Failure' toggle switch, Payment processing spinner modal, Payment failure retry modal, Order placement dispatcher.",
            "state": "Selected payment method, UPI VPA text, processing spinner boolean, simulated failure toggle, failure modal state; triggers <code>orderService.placeOrder</code> and <code>clearCart</code>.",
            "data": "<code>useCartStore</code>, <code>useAppStore</code>, <code>orderService</code>",
            "file": "<code>frontend/src/pages/CheckoutPaymentPage.tsx</code>"
        },
        {
            "num": "4.7",
            "name": "Checkout Order Success",
            "routes": "<code>/checkout/success</code>",
            "purpose": "Order confirmation screen celebrating successful placement and displaying immediate order references.",
            "components": "<code>CustomerLayout</code>, <code>Button</code>, <code>Badge</code>, <code>Icons</code>",
            "features": "Bouncing green checkmark animation, Generated order reference number (#SSK-2026-XXXX), Tenkasi mill batch allocation tag, Delivery address summary, Estimated delivery timeframe, 'Track Live Order' primary CTA, 'Continue Shopping' secondary CTA.",
            "state": "URL search parameters (<code>?orderId=</code>); fetched order record.",
            "data": "<code>orderService.getOrderById()</code>",
            "file": "<code>frontend/src/pages/CheckoutSuccessPage.tsx</code>"
        },
        {
            "num": "4.8",
            "name": "Customer Login",
            "routes": "<code>/login</code>",
            "purpose": "Authentication portal allowing customers to access their order history and saved delivery addresses.",
            "components": "<code>AuthLayout</code>, <code>Input</code>, <code>Button</code>, <code>Checkbox</code>",
            "features": "Segmented login switcher ('Login with OTP' vs 'Login with Password'), Mobile number / email field, Password field with reveal toggle, 'Remember Me' checkbox, 'Quick Demo Customer' 1-click login button, Forgot Password link, New Customer Register link.",
            "state": "Login method state, identifier input, password input, loading spinner; Zustand <code>setCurrentUser</code> dispatcher.",
            "data": "<code>authService.loginWithPassword()</code>, <code>MOCK_CUSTOMER</code>",
            "file": "<code>frontend/src/pages/LoginPage.tsx</code>"
        },
        {
            "num": "4.9",
            "name": "Customer Registration",
            "routes": "<code>/register</code>",
            "purpose": "Account creation screen for first-time purchasers.",
            "components": "<code>AuthLayout</code>, <code>Input</code>, <code>Button</code>, <code>Checkbox</code>",
            "features": "Full name, 10-digit mobile number, and email address inputs, Terms of Service agreement checkbox, 'Quick Demo Customer' autofill button, Redirect to OTP verification on submission.",
            "state": "Form inputs state, loading state; navigates to <code>/verify-otp</code>.",
            "data": "<code>authService.registerUser()</code>",
            "file": "<code>frontend/src/pages/RegisterPage.tsx</code>"
        },
        {
            "num": "4.10",
            "name": "OTP Verification",
            "routes": "<code>/verify-otp</code>",
            "purpose": "Simulated two-factor SMS OTP authentication screen.",
            "components": "<code>AuthLayout</code>, <code>Button</code>",
            "features": "6 separate auto-advancing digit input boxes, Backspace reverse focus handler, 29-second countdown timer for OTP resend, 'Demo OTP (123456)' 1-click paste button, Dynamic post-login redirect back to originating page (e.g. <code>/checkout</code>).",
            "state": "Array of 6 digit strings, countdown timer integer, error message string; Zustand <code>setCurrentUser</code>.",
            "data": "<code>authService.loginWithOtp()</code> (validates against '123456')",
            "file": "<code>frontend/src/pages/OtpVerificationPage.tsx</code>"
        },
        {
            "num": "4.11",
            "name": "Forgot Password",
            "routes": "<code>/forgot-password</code>",
            "purpose": "Account recovery interface for forgotten passwords.",
            "components": "<code>AuthLayout</code>, <code>Input</code>, <code>Button</code>",
            "features": "Registered mobile number or email input field, Simulated SMS recovery link dispatcher, Return to Login link.",
            "state": "Identifier text input, submitted confirmation boolean.",
            "data": "Simulated client delay (300ms)",
            "file": "<code>frontend/src/pages/ForgotPasswordPage.tsx</code>"
        },
        {
            "num": "4.12",
            "name": "Reset Password",
            "routes": "<code>/reset-password</code>",
            "purpose": "New password creation interface after token validation.",
            "components": "<code>AuthLayout</code>, <code>Input</code>, <code>Button</code>",
            "features": "New password input, Confirm password input, Real-time password strength meter (Weak, Fair, Strong), Toast notification and redirect to <code>/login</code> on save.",
            "state": "Password inputs, strength indicator; validation matching.",
            "data": "Simulated client delay",
            "file": "<code>frontend/src/pages/ResetPasswordPage.tsx</code>"
        },
        {
            "num": "4.13",
            "name": "Customer Account Dashboard",
            "routes": "<code>/account</code>",
            "purpose": "Customer profile overview and active order command center.",
            "components": "<code>CustomerLayout</code>, <code>Button</code>, <code>Badge</code>, <code>Modal</code>",
            "features": "User profile banner with avatar initial and 'Member Since' tag, Active Order Tracker widget (shows live progress of current mill order), Saved address cards snapshot, Quick reorder button, Sign out trigger with confirmation modal.",
            "state": "Active order state; unauthenticated redirect fallback to <code>/login</code>; Zustand <code>setCurrentUser(null)</code> on logout.",
            "data": "<code>useAppStore.currentUser</code>, <code>orderService.getCustomerOrders()</code>",
            "file": "<code>frontend/src/pages/AccountDashboardPage.tsx</code>"
        },
        {
            "num": "4.14",
            "name": "Customer Order History",
            "routes": "<code>/account/orders</code>",
            "purpose": "Detailed historical log of all past customer orders.",
            "components": "<code>CustomerLayout</code>, <code>Badge</code>, <code>Button</code>, <code>EmptyState</code>",
            "features": "Filter tabs (All Orders, Active Orders, Delivered), Order cards displaying order date, item count, total price, payment method, Courier AWB badge, 'Track Package' direct link.",
            "state": "Active filter tab state, orders array.",
            "data": "<code>orderService.getCustomerOrders()</code> (backed by <code>MOCK_ORDERS</code> and <code>localStorage</code>)",
            "file": "<code>frontend/src/pages/OrderHistoryPage.tsx</code>"
        },
        {
            "num": "4.15",
            "name": "Live Order Tracking",
            "routes": "<code>/orders/:orderId</code>, <code>/account/orders/:orderId</code>, <code>/track</code>",
            "purpose": "Real-time timeline tracking of oil fulfillment from extraction to doorstep delivery.",
            "components": "<code>CustomerLayout</code>, <code>Badge</code>, <code>Button</code>, <code>Icons</code>",
            "features": "5-step vertical mill timeline: 1. Order Placed & Confirmed, 2. Fresh Extraction & Quality Check (Vaagai wood milling & FSSAI seal), 3. Dispatched via Courier, 4. Out for Delivery, 5. Delivered safely; Courier partner pill (The Professional Couriers), 1-click Copy AWB button with copied confirmation, Shipping destination address card.",
            "state": "URL parameter <code>orderId</code>, loaded order record, copied clipboard state.",
            "data": "<code>orderService.getOrderById()</code>",
            "file": "<code>frontend/src/pages/OrderTrackingPage.tsx</code>"
        },
        {
            "num": "4.16",
            "name": "About Us & Mill Heritage",
            "routes": "<code>/about</code>",
            "purpose": "Brand storytelling page detailing extraction authenticity, wood mortar advantages, and FSSAI licensing.",
            "components": "<code>CustomerLayout</code>, <code>Badge</code>, <code>Button</code>",
            "features": "Detailed explanation of Vaagai wood (Albizia lebbeck) friction heat absorption, Karupatti (palm jaggery) medicinal pairing with sesame oil, Sulphur-free copra sourcing from Pollachi, Mill photogallery, Central FSSAI License No. 22426293000431 declaration.",
            "state": "Static presentation synchronized with bilingual store.",
            "data": "Static verified content",
            "file": "<code>frontend/src/pages/AboutUsPage.tsx</code>"
        },
        {
            "num": "4.17",
            "name": "FAQ Hub",
            "routes": "<code>/faq</code>",
            "purpose": "Customer education hub answering common questions regarding cold-pressed oils.",
            "components": "<code>CustomerLayout</code>, <code>Icons</code>",
            "features": "6 expandable accordions with English and Tamil answers: 1. What is Marachekku?, 2. Why add Karupatti to Sesame Oil?, 3. Is sedimentation normal?, 4. Shelf life of cold-pressed oil, 5. Bulk supply for commercial caterers, 6. Delivery timelines and FSSAI credentials.",
            "state": "Open accordion index state (allows single-accordion expansion).",
            "data": "Static verified FAQ dictionary in <code>AboutUsPage.tsx</code>",
            "file": "<code>frontend/src/pages/AboutUsPage.tsx</code> (via <code>?tab=faq</code>)"
        },
        {
            "num": "4.18",
            "name": "Contact & Wholesale Inquiries",
            "routes": "<code>/contact</code>, <code>/wholesale</code>",
            "purpose": "Commercial B2B lead generation and customer support hub.",
            "components": "<code>CustomerLayout</code>, <code>Input</code>, <code>Select</code>, <code>Button</code>, <code>Toast</code>",
            "features": "Tabbed interface ('General Inquiries' vs 'Wholesale / B2B Quotes'), Wholesale quotation form (Company name, contact person, phone, email, GSTIN, monthly volume tins, oil categories required), Submission confirmation banner, Direct mill address in Tenkasi, Direct WhatsApp click-to-chat button.",
            "state": "Active tab state, wholesale form fields, submitting spinner, submitted banner; triggers <code>adminService.submitWholesaleLead</code>.",
            "data": "<code>adminService.submitWholesaleLead()</code>, <code>MOCK_WHOLESALE_LEADS</code>",
            "file": "<code>frontend/src/pages/ContactWholesalePage.tsx</code>"
        },
        {
            "num": "4.19",
            "name": "Policies & Legal Hub",
            "routes": "<code>/policies</code>, <code>/terms</code>, <code>/privacy</code>, <code>/returns</code>, <code>/shipping</code>",
            "purpose": "Comprehensive consumer protection and legal terms hub.",
            "components": "<code>CustomerLayout</code>",
            "features": "Tabbed navigation across 5 distinct legal sections: 1. Shipping & Delivery Policy (Tamil Nadu 1-3 days, ₹500 free shipping), 2. Return & Refund Policy (food-grade damage replacement), 3. Terms of Service, 4. Privacy Policy, 5. Central FSSAI License & Compliance statement.",
            "state": "Active tab synchronized with URL pathname.",
            "data": "Static verified policy text",
            "file": "<code>frontend/src/pages/PoliciesLegalPage.tsx</code>"
        }
    ]

    for s in screens_list:
        story.append(Paragraph(f"<b>{s['num']} {s['name']}</b> ({s['routes']})", styles['H2']))
        info_p = (
            f"<b>Purpose:</b> {s['purpose']}<br/>"
            f"<b>Key Components:</b> {s['components']}<br/>"
            f"<b>Core Features:</b> {s['features']}<br/>"
            f"<b>State Management:</b> {s['state']}<br/>"
            f"<b>Data Source:</b> {s['data']}<br/>"
            f"<b>Primary Source File:</b> {s['file']}"
        )
        story.append(Paragraph(info_p, styles['Body']))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # PART 5: COMPLETE ADMIN DASHBOARD
    # =========================================================================
    story.append(create_chapter_header(5, "Complete Admin Dashboard", "7 Operational Consoles, Dynamic Margin Simulator & Fulfillment Desk"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "The administrative console is built exclusively for Tenkasi mill operators, inventory clerks, and management. "
        "It features dedicated navigation, operations KPIs, dynamic price calculation simulators, and fulfillment desks.",
        styles['Body']
    ))

    admin_consoles = [
        {
            "num": "5.1",
            "name": "Admin Login Console",
            "route": "<code>/admin/login</code>",
            "purpose": "Restricted administrative portal for mill operators to authenticate into management desks.",
            "components": "<code>AdminHeader</code>, <code>Input</code>, <code>Button</code>, <code>Badge</code>",
            "functionality": "Email and password authentication form, Security clearance badge ('Authorized Tenkasi Mill Staff Only'), 'One-Click Demo Admin Login' button for instant demonstration access, Automatic redirect to <code>/admin/dashboard</code>.",
            "data_source": "<code>authService.loginWithPassword()</code> (evaluates identifier matching 'admin' to load <code>MOCK_ADMIN</code>).",
            "capabilities": "Operator signs in with credentials, bypasses customer session, stores admin role in session state."
        },
        {
            "num": "5.2",
            "name": "Admin Dashboard Overview",
            "route": "<code>/admin</code>, <code>/admin/dashboard</code>",
            "purpose": "High-level command center displaying real-time financial metrics, volume dispatches, and recent orders.",
            "components": "<code>AdminLayout</code>, <code>Card</code>, <code>Badge</code>, <code>Button</code>, <code>Modal</code>",
            "functionality": "4 Top KPI Cards: 1. Today Revenue (₹38,450, +14.8%), 2. Today Orders (18 placed), 3. Active Dispatches (6 en route), 4. Low Stock Alerts (1 SKU below threshold); 7-day revenue trend bar chart; Recent orders table; 'Create Mill Counter Order' modal (allows direct recording of walk-in sales).",
            "data_source": "<code>adminService.getDashboardMetrics()</code>, <code>orderService.getCustomerOrders()</code>",
            "capabilities": "Review revenue performance, inspect today's order queue, record counter-sale walk-in dispatches."
        },
        {
            "num": "5.3",
            "name": "Product & Stock Inventory Management",
            "route": "<code>/admin/products</code>",
            "purpose": "Comprehensive catalog table displaying live stock in litres across all bottle and tin SKUs.",
            "components": "<code>AdminLayout</code>, <code>Badge</code>, <code>Button</code>, <code>Modal</code>, <code>Input</code>",
            "functionality": "Product table listing oil variety, category, bottle/tin SKU, price, stock in litres, and status (Active vs Draft); 'Adjust Batch Stock' modal allowing operators to update physical warehouse inventory; 'Export Inventory Sheet' button; Quick link to Product Studio.",
            "data_source": "<code>productService.getAllProducts()</code>",
            "capabilities": "Audit physical inventory, adjust remaining litres after milling, filter out-of-stock varieties."
        },
        {
            "num": "5.4",
            "name": "Add / Edit Product Studio",
            "route": "<code>/admin/products/new</code>, <code>/admin/products/:id</code>",
            "purpose": "Authoring studio for introducing new oil varieties or updating botanical specifications.",
            "components": "<code>AdminLayout</code>, <code>Input</code>, <code>Select</code>, <code>Button</code>, <code>Badge</code>",
            "functionality": "3-Tab configuration editor: 1. General Info (Product name in English & Tamil, botanical name, seed origin, Vaagai wood mortar description), 2. Variant Pricing & SKUs (Volumes: 500ml, 1L, 5L, 15L, container types, MRP, selling price, stock units), 3. Compliance & Purity (FSSAI license, nutrition facts per 100g); 'Publish Product to Storefront' trigger.",
            "data_source": "Local studio form state with mock product defaults; toast notification confirmation.",
            "capabilities": "Define new product lines, update Tamil descriptions, configure multiple bottle and tin SKUs."
        },
        {
            "num": "5.5",
            "name": "Dynamic Price Management & Margin Calculator",
            "route": "<code>/admin/pricing</code>",
            "purpose": "Interactive margin simulator that computes selling prices based on live raw seed market rates.",
            "components": "<code>AdminLayout</code>, <code>Input</code>, <code>Button</code>, <code>Badge</code>, <code>PriceDisplay</code>",
            "functionality": "Interactive Margin Simulator: Operator slides raw seed cost (e.g. ₹115/kg) and target margin % (e.g. 30%); system automatically adds fixed extraction cost (₹38), packaging (₹22), and shipping allowance (₹25) to recommend selling price (₹260); Live Rate Matrix table across all 9 SKUs with 1-click Quick Price update triggers; Bulk tier discount configurations.",
            "data_source": "<code>adminService.getPriceMatrix()</code>, <code>adminService.updatePriceItem()</code>",
            "capabilities": "Simulate market price shifts, adjust retail rates in response to seed harvest fluctuations, log changes."
        },
        {
            "num": "5.6",
            "name": "Price Audit History Ledger",
            "route": "<code>/admin/pricing/audit</code>",
            "purpose": "Cryptographic compliance audit log recording every single price modification made in the system.",
            "components": "<code>AdminLayout</code>, <code>Badge</code>, <code>Table</code>",
            "functionality": "Immutable ledger table displaying: Timestamp (IST), Product & Variant, Previous MRP vs New Price, Variance Percentage (+8.03%), Modifier Identity ('Admin (Tenkasi Console)'), Audit Reason Memo (e.g. 'Market raw seed adjustment revision'), Status tag ('COMMITTED').",
            "data_source": "<code>adminService.getPriceAuditLogs()</code> (backed by <code>MOCK_PRICE_AUDIT_LOGS</code>)",
            "capabilities": "Review pricing compliance, audit manager price alterations, prevent unauthorized price tampering."
        },
        {
            "num": "5.7",
            "name": "Order Fulfillment & Courier Dispatch Desk",
            "route": "<code>/admin/orders</code>",
            "purpose": "Fulfillment command center for processing mill extractions, packaging, and courier handovers.",
            "components": "<code>AdminLayout</code>, <code>Select</code>, <code>Badge</code>, <code>Button</code>, <code>Input</code>",
            "functionality": "Fulfillment table listing customer orders; Status update dropdown: 1. Placed, 2. Extraction & Packing, 3. Dispatched, 4. Delivered; Courier AWB input modal for assigning tracking numbers (e.g. TPC-TN-849201); 'Print Warehouse Pick Lists' trigger.",
            "data_source": "<code>orderService.getCustomerOrders()</code>, <code>orderService.updateOrderStatus()</code>",
            "capabilities": "Transition orders through extraction lifecycle, assign courier tracking numbers, print shipping slips."
        },
        {
            "num": "5.8",
            "name": "System Alerts & Administrative Safeguards",
            "route": "<code>/admin/safeguards</code>",
            "purpose": "Security guardrails matching Google Stitch spec (Screen ID: 0da938cb...) protecting against destructive actions.",
            "components": "<code>AdminLayout</code>, <code>ConfirmationDialog</code>, <code>Checkbox</code>, <code>Button</code>",
            "functionality": "4 Operational Safeguards: 1. Destructive Action Verification Lock (requires explicit checkbox confirmation before catalog purging), 2. Inventory Reconcile Tool (checks physical vs digital litre counts), 3. Out-of-Stock Emergency Override Toggle, 4. Security Audit Log Viewer.",
            "data_source": "Local safeguard state and toast verification.",
            "capabilities": "Prevent accidental catalogue deletions, execute safe inventory reconciliations, review security logs."
        }
    ]

    for c in admin_consoles:
        story.append(Paragraph(f"<b>{c['num']} {c['name']}</b> ({c['route']})", styles['H2']))
        c_info = (
            f"<b>Purpose:</b> {c['purpose']}<br/>"
            f"<b>Key Components:</b> {c['components']}<br/>"
            f"<b>Core Functionality:</b> {c['functionality']}<br/>"
            f"<b>Data Source:</b> {c['data_source']}<br/>"
            f"<b>Administrator Actions:</b> {c['capabilities']}"
        )
        story.append(Paragraph(c_info, styles['Body']))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # PART 6: IMPORTANT APPLICATION FUNCTIONALITIES
    # =========================================================================
    story.append(create_chapter_header(6, "Important Application Functionalities", "Step-by-Step Internal Flows for 20 Core Architectural Capabilities"))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "This section documents the step-by-step internal execution flow of the 20 requested core features, "
        "tracing user actions, React state modifications, Zustand dispatchers, and persistence layers.",
        styles['Body']
    ))

    features_data = [
        ("6.1 Navigation & Routing", "React Router v7 in AppRoutes.tsx wraps the entire component tree. Navigation triggers (&lt;Link to='/...'&gt; or useNavigate()) push history states without page reload. Dynamic route matching captures params like :slug or :orderId."),
        ("6.2 EN / தமிழ் Language Switching", "Zustand useLanguageStore holds language: 'en' | 'ta'. Clicking LanguageSwitcher executes setLanguage(). Components read language state to dynamically render Tamil strings (nameTa, taglineTa, subtitleTa) instantly without network roundtrips."),
        ("6.3 Product Filtering", "ShopAllPage listens to categoryParam in URL (?category=groundnut). A useMemo filter evaluates product.category === selectedCategory and inStockOnly boolean, re-rendering matching cards in real time."),
        ("6.4 Search Functionality", "CustomerHeader search input submits to /shop?q=keyword. ShopAllPage filters products by matching name, nameTa, botanicalName, or description using case-insensitive substring search."),
        ("6.5 Product Variant Selection", "ProductCard and ProductDetailPage maintain selectedVariantId state. Clicking a pack pill (e.g. '1 Litre') updates state, recalculates unit price, updates SKU, and recalculates savings against MRP."),
        ("6.6 Dynamic Price Calculation", "In ProductDetailPage, price displays reflect selectedVariant.price. In AdminPricingPage, a live formula calculates BaseCost = Seed + Extraction + Packaging + Shipping; RecommendedPrice = BaseCost × (1 + Margin/100)."),
        ("6.7 Cart Management", "useCartStore.addItem(product) checks if itemId (productId-variantId) exists. If found, it increments quantity up to stock ceiling; if new, it appends a CartItem object. Zustand persist middleware saves to ssk_cart_storage in localStorage."),
        ("6.8 Quantity Updates", "In CartPage, QuantitySelector dispatches updateQuantity(id, qty). If qty <= 0, removeItem(id) is called. The store recomputes item count, subtotal, discount, delivery fee, and final total."),
        ("6.9 Coupon Validation", "useCartStore.applyCoupon(code) cleans string to uppercase, looks up MOCK_COUPONS (NATURAL50, WELCOME100, TENKASIGOLD). Checks subtotal >= minimumOrder. If valid, attaches appliedCoupon and applies flat discount amount."),
        ("6.10 Free Shipping Calculation", "useCartStore.getDeliveryFee() checks subtotal. If subtotal == 0 -> ₹0. If subtotal >= ₹500 -> ₹0 (FREE SHIPPING). If subtotal < ₹500 -> ₹50 flat courier charge. CartPage shows dynamic progress bar."),
        ("6.11 Checkout Workflow", "CartPage 'Proceed to Checkout' navigates to /checkout/address. User confirms address and proceeds to /checkout/payment. User selects payment mode and executes placeOrder(), redirecting to /checkout/success."),
        ("6.12 Address Selection", "CheckoutAddressPage reads useAppStore.addresses. User selects radio button (setSelectedAddressId). Clicking 'Add Address' opens form, appends new CustomerAddress with unique id to store and localStorage."),
        ("6.13 Payment Selection", "CheckoutPaymentPage maintains paymentMethod state ('UPI' | 'CARD' | 'NET_BANKING' | 'COD'). Selecting a tab reveals relevant inputs (UPI VPA, Card fields). Supports simulated gateway failure toggle for edge testing."),
        ("6.14 Authentication Interface", "LoginPage offers Password and OTP tabs. Submitting triggers authService.loginWithPassword(). On success, writes user to localStorage ('ssk_mock_auth_user'), updates useAppStore.currentUser, and navigates to previous page."),
        ("6.15 OTP Interface", "OtpVerificationPage displays 6 auto-focus input fields. Typing digit advances focus to next ref; backspace retreats focus. Validates against demo OTP '123456'. 29-second countdown timer enables resend."),
        ("6.16 Customer Order History", "OrderHistoryPage calls orderService.getCustomerOrders(). Reads from ssk_mock_orders in localStorage (or MOCK_ORDERS fallback). User filters by All, Active, Delivered tabs."),
        ("6.17 Order Tracking", "OrderTrackingPage parses :orderId, calls orderService.getOrderById(). Renders 5-step vertical mill progress bar showing completed, current, and upcoming stages with courier AWB."),
        ("6.18 Admin Product Management", "AdminProductsPage lists products and stock in litres. Adjust Stock modal updates variant stock count. AdminProductStudioPage provides 3-tab editor for bilingual metadata, variants, and FSSAI details."),
        ("6.19 Inventory Management", "Stock counts are tracked in ProductVariant.stock. Adding to cart checks quantity <= stock. In AdminProductsPage, stock changes are saved with immediate UI feedback and out-of-stock badge triggers."),
        ("6.20 Price Audit Functionality", "When admin updates price in AdminPricingPage, adminService.updatePriceItem() generates a PriceAuditLog with timestamp IST, previous price, new price, variance %, and memo. Appends to MOCK_PRICE_AUDIT_LOGS table.")
    ]

    for title, desc in features_data:
        story.append(Paragraph(f"<b>{title}</b>", styles['H2']))
        story.append(Paragraph(desc, styles['Body']))
        story.append(Spacer(1, 3))

    story.append(PageBreak())
    return story
