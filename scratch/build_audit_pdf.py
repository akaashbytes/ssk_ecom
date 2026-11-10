# Build Architecture Audit & Workflow Migration Plan PDF
import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, KeepTogether, HRFlowable
from pdf_styles import NumberedCanvas, PAGE_CONTENT_WIDTH, NAVY, AMBER, GREEN, BG_SUBTLE, BORDER, TEXT_PRIMARY, TEXT_MUTED, WHITE

def generate_audit_pdf():
    pdf_filename = "R:\\SSG\\website\\docs\\SSK_Natural_Gold_Architecture_Audit_and_Migration_Plan.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=42,
        rightMargin=42,
        topMargin=54,
        bottomMargin=54
    )

    base = getSampleStyleSheet()
    
    styles = {
        'Title': ParagraphStyle('DocTitle', parent=base['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=NAVY, alignment=0, spaceAfter=6),
        'Subtitle': ParagraphStyle('DocSubtitle', parent=base['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=AMBER, spaceAfter=14),
        'Meta': ParagraphStyle('DocMeta', parent=base['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=TEXT_MUTED, spaceAfter=18),
        'H1': ParagraphStyle('DocH1', parent=base['Heading1'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=NAVY, spaceBefore=14, spaceAfter=8, keepWithNext=True),
        'H2': ParagraphStyle('DocH2', parent=base['Heading2'], fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=AMBER, spaceBefore=10, spaceAfter=6, keepWithNext=True),
        'Body': ParagraphStyle('DocBody', parent=base['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=TEXT_PRIMARY, spaceAfter=6),
        'Bullet': ParagraphStyle('DocBullet', parent=base['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=TEXT_PRIMARY, leftIndent=12, firstLineIndent=-8, spaceAfter=4),
        'Callout': ParagraphStyle('DocCallout', parent=base['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, leading=12, textColor=NAVY),
        'TableHeader': ParagraphStyle('DocTH', parent=base['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=WHITE, alignment=1),
        'TableCell': ParagraphStyle('DocTC', parent=base['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=TEXT_PRIMARY),
        'TableCellBold': ParagraphStyle('DocTCB', parent=base['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=TEXT_PRIMARY),
        'Code': ParagraphStyle('DocCode', parent=base['Code'], fontName='Courier', fontSize=7.5, leading=9.5, textColor=colors.HexColor('#0F172A')),
    }

    story = []

    # Title & Metadata
    story.append(Paragraph("SSK Natural Gold — Architecture Audit & Migration Plan", styles['Title']))
    story.append(Paragraph("System Architecture Audit, Codebase Inventory & Workflow Migration Specification", styles['Subtitle']))
    story.append(Paragraph("<b>Role:</b> Senior Full-Stack Software Architect & Technical Lead &nbsp;|&nbsp; <b>Date:</b> November 10, 2026 &nbsp;|&nbsp; <b>Status:</b> Read-Only Audit Completed", styles['Meta']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=AMBER, spaceAfter=12))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", styles['H1']))
    story.append(Paragraph("<b>SSK Natural Gold</b> is an enterprise e-commerce platform built for a startup retail edible oil enterprise in Tenkasi, Tamil Nadu. The company extracts and bottles 3 traditional cold-pressed (<i>Vaagai Marachekku</i>) oils: Traditional Groundnut Oil, Pure Sesame Oil with authentic Palm Jaggery (Karupatti), and Unrefined Coconut Oil.", styles['Body']))
    story.append(Paragraph("<b>The Simplified Workflow:</b><br/>Homepage &rarr; Product Catalogue &rarr; Product Details &rarr; Cart &rarr; Customer Details &rarr; Submit Order Request &rarr; Admin Reviews Request &rarr; Admin Confirms Availability & Final Amount &rarr; Customer Pays via UPI QR &rarr; Admin Verifies Payment &rarr; Order Confirmation &rarr; Dispatch &rarr; Delivery.", styles['Body']))
    
    # Exec Summary Table
    exec_data = [
        [Paragraph("Architectural Layer", styles['TableHeader']), Paragraph("Verified State", styles['TableHeader']), Paragraph("Audit Finding", styles['TableHeader']), Paragraph("Recommendation", styles['TableHeader'])],
        [Paragraph("Frontend SPA", styles['TableCellBold']), Paragraph("React 18, Vite 6, Tailwind CSS", styles['TableCell']), Paragraph("100% buildable; 27 views, 43 routes", styles['TableCell']), Paragraph("Retain & simplify. Unhook auth & account views.", styles['TableCell'])],
        [Paragraph("Global Stores", styles['TableCellBold']), Paragraph("4 Zustand stores", styles['TableCell']), Paragraph("useAppStore & useCartStore persist mock items", styles['TableCell']), Paragraph("Clear pre-seeded cart items; support guest details.", styles['TableCell'])],
        [Paragraph("Backend API", styles['TableCellBold']), Paragraph("Node.js, Express, TS", styles['TableCell']), Paragraph("Only GET /api/health implemented; 0 controllers", styles['TableCell']), Paragraph("Implement request & notification endpoints.", styles['TableCell'])],
        [Paragraph("Database / ORM", styles['TableCellBold']), Paragraph("PostgreSQL, Prisma ORM 6.3.1", styles['TableCell']), Paragraph("schema.prisma has 0 models; 0 migrations", styles['TableCell']), Paragraph("Pristine slate. Define OrderRequest & Product models.", styles['TableCell'])],
    ]
    t_exec = Table(exec_data, colWidths=[90, 120, 150, 168])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_exec)
    story.append(Spacer(1, 10))

    # 2. Verified Frontend Structure
    story.append(Paragraph("2. Verified Frontend Structure", styles['H1']))
    story.append(Paragraph("The frontend is organized under <code>frontend/src/</code> with modular feature folders: <code>components/common</code> (17 primitives), <code>components/product</code> (6 domain components), <code>components/layout</code> (10 shell layouts), <code>stores</code> (4 Zustand stores), <code>mock</code> (products, addresses, orders), and <code>pages</code> (27 view components).", styles['Body']))
    
    # Classification table summary
    story.append(Paragraph("<b>Route Inventory & Target Classification:</b>", styles['H2']))
    routes_summary = [
        [Paragraph("Category / Route", styles['TableHeader']), Paragraph("Component", styles['TableHeader']), Paragraph("Target Classification", styles['TableHeader']), Paragraph("Action Description", styles['TableHeader'])],
        [Paragraph("/, /home", styles['TableCellBold']), Paragraph("HomePage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Connect add-to-cart directly to useCartStore", styles['TableCell'])],
        [Paragraph("/shop, /products", styles['TableCellBold']), Paragraph("ShopAllPage.tsx", styles['TableCell']), Paragraph("Keep unchanged", styles['TableCell']), Paragraph("Full catalog filtering and price sorting", styles['TableCell'])],
        [Paragraph("/products/:slug", styles['TableCellBold']), Paragraph("ProductDetailPage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Direct 'Buy Now' to guest checkout form", styles['TableCell'])],
        [Paragraph("/cart", styles['TableCellBold']), Paragraph("CartPage.tsx", styles['TableCell']), Paragraph("Simplify", styles['TableCell']), Paragraph("Estimated subtotal; courier confirmed by admin", styles['TableCell'])],
        [Paragraph("/checkout", styles['TableCellBold']), Paragraph("CheckoutAddressPage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Convert to Guest Customer Details & Address Form", styles['TableCell'])],
        [Paragraph("/checkout/payment", styles['TableCellBold']), Paragraph("CheckoutPaymentPage.tsx", styles['TableCell']), Paragraph("Remove / Transform", styles['TableCell']), Paragraph("Transform into Order Request Review & Submit", styles['TableCell'])],
        [Paragraph("/checkout/success", styles['TableCellBold']), Paragraph("CheckoutSuccessPage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Order Request Received with Reference #", styles['TableCell'])],
        [Paragraph("/track, /orders/:id", styles['TableCellBold']), Paragraph("OrderTrackingPage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Guest lookup + dynamic UPI QR display", styles['TableCell'])],
        [Paragraph("/login, /register, /account", styles['TableCellBold']), Paragraph("Auth & Account views", styles['TableCell']), Paragraph("Defer for future dev", styles['TableCell']), Paragraph("Unhook from navigation; guest checkout model", styles['TableCell'])],
        [Paragraph("/admin/orders", styles['TableCellBold']), Paragraph("AdminOrdersPage.tsx", styles['TableCell']), Paragraph("Keep with modifications", styles['TableCell']), Paragraph("Central Admin Order Request & Fulfillment Desk", styles['TableCell'])],
    ]
    t_routes = Table(routes_summary, colWidths=[95, 125, 115, 193])
    t_routes.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_routes)
    story.append(Spacer(1, 10))

    # 3. Verified Backend Structure
    story.append(Paragraph("3. Verified Backend Structure", styles['H1']))
    story.append(Paragraph("The backend under <code>backend/src/</code> is currently a clean initial scaffold. Express is configured with CORS and JSON parsing. <b>Only 1 active endpoint exists:</b> <code>GET /api/health</code>. Prisma schema has zero models defined, and no database migrations have been executed. Controllers, services, and route definitions for orders and products are ready to be built directly for the simplified workflow.", styles['Body']))
    story.append(Spacer(1, 8))

    # 4. Existing Functionality Reused
    story.append(Paragraph("4. Existing Functionality That Can Be Reused", styles['H1']))
    story.append(Paragraph("&bull; <b>Rich Product Specs:</b> Groundnut, Sesame (Karupatti), and Coconut oil datasets with Tamil names, FSSAI numbers, and pack sizes (500ml, 1L, 5L, 15L).<br/>&bull; <b>Bilingual Engine:</b> Instant EN/TA language toggling across headers, cards, and footers.<br/>&bull; <b>UI Design System:</b> 17 common components and 6 product components built with Tailwind CSS.<br/>&bull; <b>Cart State Machine:</b> Zustand-based cart state management with reactive item counts and subtotals.<br/>&bull; <b>Admin Layout Shell:</b> Responsive sidebar and header navigation for the operations console.", styles['Bullet']))
    story.append(Spacer(1, 8))

    # 5. Modifications & Deferrals
    story.append(Paragraph("5. Screens That Need Modification & Deferrals", styles['H1']))
    story.append(Paragraph("<b>Modifications:</b><br/>1. <code>HomePage.tsx</code>: Wire product cards directly to <code>useCartStore.addItem()</code>.<br/>2. <code>CartPage.tsx</code>: Remove pre-seeded items; display estimated subtotal; change CTA to 'Proceed to Customer Details'.<br/>3. <code>CheckoutAddressPage.tsx</code>: Convert to Guest Customer Form (Name, WhatsApp, Address, Pincode).<br/>4. <code>CheckoutPaymentPage.tsx</code>: Transform to Order Request Review & Submit view.<br/>5. <code>CheckoutSuccessPage.tsx</code>: Display Unique Request Reference (e.g. SSK-REQ-XXXX) and timeline.<br/>6. <code>OrderTrackingPage.tsx</code>: Public guest lookup by Reference # + Phone; display dynamic UPI QR when payment is pending.<br/>7. <code>AdminOrdersPage.tsx</code>: Order review modal, shipping fee input, UPI verification, and AWB docket entry.<br/><br/><b>Deferred Features:</b> Customer login/register suite, SMS OTP verification, customer account dashboard, automated payment gateway integration, and margin formula simulators.", styles['Body']))
    story.append(Spacer(1, 8))

    # 6. Database Readiness & Prisma Schema
    story.append(Paragraph("6. Database Readiness & Proposed Schema", styles['H1']))
    story.append(Paragraph("The proposed database schema for PostgreSQL via Prisma ORM establishes clean relational models with zero migration debt:", styles['Body']))
    
    schema_summary = [
        [Paragraph("Model Name", styles['TableHeader']), Paragraph("Primary Fields", styles['TableHeader']), Paragraph("Purpose in Request Workflow", styles['TableHeader'])],
        [Paragraph("Product", styles['TableCellBold']), Paragraph("id, slug, category, name, nameTa, fssaiLicense, primaryImage", styles['TableCell']), Paragraph("Core oil variety metadata & storytelling", styles['TableCell'])],
        [Paragraph("ProductVariant", styles['TableCellBold']), Paragraph("id, productId, sku, volume, volumeMl, mrp, price, stock", styles['TableCell']), Paragraph("Pack SKU inventory & server-side price truth", styles['TableCell'])],
        [Paragraph("OrderRequest", styles['TableCellBold']), Paragraph("id, orderReference, status, customerName, customerPhone, customerEmail, addressLine1, city, pincode, estimatedSubtotal, courierFee, finalPayableAmount, upiVpa, customerUtrNumber, courierPartner, awbNumber", styles['TableCell']), Paragraph("Complete lifecycle record of the customer order request from submission to delivery", styles['TableCell'])],
        [Paragraph("OrderItem", styles['TableCellBold']), Paragraph("id, orderRequestId, variantId, productName, volumeLabel, unitPrice, quantity, totalPrice", styles['TableCell']), Paragraph("Snapshot of ordered items and unit prices", styles['TableCell'])],
        [Paragraph("OrderStatusLog", styles['TableCellBold']), Paragraph("id, orderRequestId, status, note, createdByName, createdAt", styles['TableCell']), Paragraph("Audit trail of status updates", styles['TableCell'])],
        [Paragraph("AdminUser", styles['TableCellBold']), Paragraph("id, email, name, passwordHash, isActive", styles['TableCell']), Paragraph("Admin console authentication", styles['TableCell'])],
    ]
    t_schema = Table(schema_summary, colWidths=[85, 230, 213])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 10))

    # 7. Security & Business Logic Concerns
    story.append(Paragraph("7. Security & Business Logic Concerns", styles['H1']))
    story.append(Paragraph("&bull; <b>Server-Side Price Validation:</b> Subtotals must be calculated exclusively using database variant prices, completely ignoring client-submitted figures.<br/>&bull; <b>Database Persistence Prerequisite:</b> Every order request must be committed to PostgreSQL before WhatsApp/Email notifications are triggered.<br/>&bull; <b>Guest Order Privacy:</b> Public tracking queries require matching the phone number to return delivery addresses.<br/>&bull; <b>Duplicate UTR Checks:</b> Customer-submitted UPI transaction reference numbers must be checked for uniqueness across confirmed orders.<br/>&bull; <b>Admin Security:</b> Operations routes protected with secure session tokens; passwords hashed with bcrypt.", styles['Bullet']))
    story.append(Spacer(1, 8))

    # 8. Implementation Sequence & Overall Readiness
    story.append(Paragraph("8. Recommended Implementation Sequence & Readiness", styles['H1']))
    story.append(Paragraph("<b>8-Phase Execution Blueprint:</b><br/><b>Phase 1:</b> Database Schema & Prisma Migration &rarr; <b>Phase 2:</b> Storefront Product & Order Request APIs &rarr; <b>Phase 3:</b> Admin Review & Payment APIs &rarr; <b>Phase 4:</b> Notification Services (WhatsApp & Email) &rarr; <b>Phase 5:</b> Frontend Guest Checkout Realignment &rarr; <b>Phase 6:</b> Frontend Admin Console Adaptation &rarr; <b>Phase 7:</b> Navigation & Route Streamlining &rarr; <b>Phase 8:</b> End-to-End Verification.", styles['Body']))
    
    # Readiness Scorecard
    story.append(Paragraph("<b>Overall Readiness Scorecard:</b>", styles['H2']))
    score_data = [
        [Paragraph("Pillar", styles['TableHeader']), Paragraph("Score", styles['TableHeader']), Paragraph("Technical Status", styles['TableHeader'])],
        [Paragraph("Frontend UI / UX", styles['TableCellBold']), Paragraph("9.5 / 10", styles['TableCellBold']), Paragraph("Production-ready Tailwind components, authentic branding, full bilingual support.", styles['TableCell'])],
        [Paragraph("Domain Fit", styles['TableCellBold']), Paragraph("9.0 / 10", styles['TableCellBold']), Paragraph("Accurate cold-pressed oil specifications, Tamil names, and pack sizes.", styles['TableCell'])],
        [Paragraph("State Management", styles['TableCellBold']), Paragraph("8.5 / 10", styles['TableCellBold']), Paragraph("Clean Zustand stores; ready to switch to guest session handling.", styles['TableCell'])],
        [Paragraph("Backend Scaffold", styles['TableCellBold']), Paragraph("7.0 / 10", styles['TableCellBold']), Paragraph("Solid Express/TS base; needs domain routes and controllers.", styles['TableCell'])],
        [Paragraph("Database Readiness", styles['TableCellBold']), Paragraph("6.0 / 10", styles['TableCellBold']), Paragraph("Clean slate with zero legacy migrations; ready for direct schema implementation.", styles['TableCell'])],
        [Paragraph("Workflow Realignment", styles['TableCellBold']), Paragraph("9.5 / 10", styles['TableCellBold']), Paragraph("Request-based purchasing eliminates payment gateway friction and accelerates launch.", styles['TableCell'])],
        [Paragraph("Overall Project Health", styles['TableCellBold']), Paragraph("8.5 / 10", styles['TableCellBold']), Paragraph("Ready for execution. Zero compile errors on frontend and backend.", styles['TableCell'])],
    ]
    t_score = Table(score_data, colWidths=[120, 60, 348])
    t_score.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_score)
    story.append(Spacer(1, 14))

    # Final Notice Box
    callout_data = [[
        Paragraph("<b>Audit Status: Completed & Ready for Execution</b><br/>This audit was conducted in strictly read-only mode. No source code was modified or deleted. The complete markdown specification is available in <code>docs/SSK_Natural_Gold_Architecture_Audit_and_Migration_Plan.md</code>. Standing by for user instruction to begin Phase 1: Database Schema & Prisma Migration.", styles['Callout'])
    ]]
    t_callout = Table(callout_data, colWidths=[PAGE_CONTENT_WIDTH])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_SUBTLE),
        ('BOX', (0,0), (-1,-1), 1, AMBER),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_callout)

    print(f"Compiling PDF document to {pdf_filename}...")
    doc.build(story, canvasmaker=NumberedCanvas)
    
    file_size = os.path.getsize(pdf_filename)
    print(f"PDF generated successfully: {file_size / 1024:.2f} KB ({file_size} bytes)")

if __name__ == "__main__":
    generate_audit_pdf()
