# Styles and Helpers for SSK Natural Gold Documentation
import html
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer, HRFlowable
from reportlab.pdfgen import canvas

# Palette constants
NAVY = colors.HexColor('#1E293B')
SLATE_DARK = colors.HexColor('#0F172A')
AMBER = colors.HexColor('#D48817')
AMBER_LIGHT = colors.HexColor('#FEF3C7')
GREEN = colors.HexColor('#166534')
GREEN_LIGHT = colors.HexColor('#DCFCE7')
RED = colors.HexColor('#DC2626')
RED_LIGHT = colors.HexColor('#FEE2E2')
BG_SUBTLE = colors.HexColor('#F8FAFC')
BORDER = colors.HexColor('#CBD5E1')
BORDER_LIGHT = colors.HexColor('#E2E8F0')
TEXT_PRIMARY = colors.HexColor('#1E293B')
TEXT_MUTED = colors.HexColor('#64748B')
WHITE = colors.HexColor('#FFFFFF')

PAGE_CONTENT_WIDTH = 528

def get_doc_styles():
    base = getSampleStyleSheet()

    styles = {
        'CoverTitle': ParagraphStyle(
            'CoverTitle',
            parent=base['Title'],
            fontName='Helvetica-Bold',
            fontSize=26,
            leading=32,
            textColor=NAVY,
            alignment=0,
            spaceAfter=10
        ),
        'CoverSubtitle': ParagraphStyle(
            'CoverSubtitle',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=12,
            leading=17,
            textColor=AMBER,
            spaceAfter=25
        ),
        'CoverMeta': ParagraphStyle(
            'CoverMeta',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=14.5,
            textColor=TEXT_MUTED
        ),
        'ChapterBanner': ParagraphStyle(
            'ChapterBanner',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=WHITE,
            spaceAfter=0
        ),
        'ChapterSubtitle': ParagraphStyle(
            'ChapterSubtitle',
            parent=base['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#E2E8F0'),
            spaceAfter=0
        ),
        'H1': ParagraphStyle(
            'H1',
            parent=base['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=NAVY,
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        ),
        'H2': ParagraphStyle(
            'H2',
            parent=base['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14.5,
            textColor=colors.HexColor('#334155'),
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True
        ),
        'H3': ParagraphStyle(
            'H3',
            parent=base['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            textColor=AMBER,
            spaceBefore=8,
            spaceAfter=3,
            keepWithNext=True
        ),
        'Body': ParagraphStyle(
            'Body',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=TEXT_PRIMARY,
            spaceAfter=5
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13,
            textColor=TEXT_PRIMARY,
            spaceAfter=5
        ),
        'Bullet': ParagraphStyle(
            'Bullet',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=TEXT_PRIMARY,
            leftIndent=14,
            spaceAfter=3
        ),
        'Code': ParagraphStyle(
            'Code',
            parent=base['Normal'],
            fontName='Courier',
            fontSize=7.5,
            leading=10.5,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=0
        ),
        'TableHead': ParagraphStyle(
            'TableHead',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10.5,
            textColor=WHITE,
            alignment=1
        ),
        'TableCell': ParagraphStyle(
            'TableCell',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=7.5,
            leading=10.5,
            textColor=TEXT_PRIMARY
        ),
        'TableCellBold': ParagraphStyle(
            'TableCellBold',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=10.5,
            textColor=TEXT_PRIMARY
        ),
        'TableCellSmall': ParagraphStyle(
            'TableCellSmall',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=7,
            leading=9.5,
            textColor=TEXT_MUTED
        ),
        'TableCellTagGreen': ParagraphStyle(
            'TableCellTagGreen',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7,
            leading=9.5,
            textColor=GREEN,
            alignment=1
        ),
        'TableCellTagAmber': ParagraphStyle(
            'TableCellTagAmber',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7,
            leading=9.5,
            textColor=AMBER,
            alignment=1
        ),
        'TableCellTagRed': ParagraphStyle(
            'TableCellTagRed',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7,
            leading=9.5,
            textColor=RED,
            alignment=1
        ),
        'CalloutText': ParagraphStyle(
            'CalloutText',
            parent=base['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=TEXT_PRIMARY
        ),
        'CalloutTitle': ParagraphStyle(
            'CalloutTitle',
            parent=base['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=NAVY
        ),
    }
    return styles

def safe_text(txt):
    if txt is None:
        return ''
    return html.escape(str(txt))

def create_chapter_header(part_num, title, subtitle):
    styles = get_doc_styles()
    title_p = Paragraph(f"<b>PART {part_num} — {title.upper()}</b>", styles['ChapterBanner'])
    sub_p = Paragraph(subtitle, styles['ChapterSubtitle'])
    
    t = Table([[title_p], [sub_p]], colWidths=[PAGE_CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), NAVY),
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,1), (-1,1), 2),
        ('BOTTOMPADDING', (0,1), (-1,1), 8),
        ('LINEBELOW', (0,1), (-1,1), 2.5, AMBER),
    ]))
    return t

def create_callout(title, text, callout_type='info'):
    styles = get_doc_styles()
    bg_color = BG_SUBTLE
    border_color = NAVY
    if callout_type == 'tip':
        bg_color = GREEN_LIGHT
        border_color = GREEN
    elif callout_type == 'warning':
        bg_color = AMBER_LIGHT
        border_color = AMBER
    elif callout_type == 'danger':
        bg_color = RED_LIGHT
        border_color = RED

    content = [
        Paragraph(f"<b>{title}</b>", styles['CalloutTitle']),
        Spacer(1, 3),
        Paragraph(text, styles['CalloutText'])
    ]
    t = Table([[content]], colWidths=[PAGE_CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('LINELEFT', (0,0), (-1,-1), 3.5, border_color),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def create_code_block(code_text):
    styles = get_doc_styles()
    lines = code_text.strip().split('\n')
    chunk_size = 14
    rows = []
    for i in range(0, len(lines), chunk_size):
        chunk = lines[i:i + chunk_size]
        escaped_chunk = '<br/>'.join(safe_text(line).replace(' ', '&nbsp;') for line in chunk)
        p = Paragraph(f"<font face='Courier' size=7>{escaped_chunk}</font>", styles['Code'])
        rows.append([p])
    
    t = Table(rows, colWidths=[PAGE_CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('LINELEFT', (0,0), (-1,-1), 3, AMBER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber > 1:
            self.saveState()
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(NAVY)
            self.drawString(42, 756, "SSK NATURAL GOLD")
            self.setFont("Helvetica", 8)
            self.setFillColor(TEXT_MUTED)
            self.drawString(140, 756, "|   Complete Project Learning & Technical Documentation")
            self.drawRightString(570, 756, "November 2026  •  v1.0.0-PROD-REF")
            
            self.setStrokeColor(BORDER)
            self.setLineWidth(0.75)
            self.line(42, 748, 570, 748)

            # Footer
            self.line(42, 45, 570, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(TEXT_MUTED)
            self.drawString(42, 32, "CONFIDENTIAL — STRICTLY FOR DEVELOPER REFERENCE & ONBOARDING")
            self.drawRightString(570, 32, f"Page {self._pageNumber} of {page_count}")
            self.restoreState()
