# Modular PDF Generation Script for SSK Natural Gold Documentation
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ----------------------------------------------------------------------
# 1. Numbered Canvas with Running Header and Footer
# ----------------------------------------------------------------------
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
            self.setFillColor(colors.HexColor("#1E293B"))
            # Header
            self.drawString(36, 756, "SSK NATURAL GOLD")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(135, 756, "|   Complete Project Learning & Technical Documentation")
            self.drawRightString(576, 756, "November 2026  •  v1.0.0-PROD-REF")
            
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(36, 748, 576, 748)

            # Footer
            self.line(36, 45, 576, 45)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(36, 32, "CONFIDENTIAL — STRICTLY FOR DEVELOPER REFERENCE & ONBOARDING")
            self.drawRightString(576, 32, f"Page {self._pageNumber} of {page_count}")
            self.restoreState()

print("NumberedCanvas initialized successfully.")
