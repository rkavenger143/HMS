"""
ALN Cure HMS — Professional PDF Documentation Generator
Generates a publication-grade, comprehensive PDF document for the entire Hospital Management System.
"""

import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# ==========================================
# COLOR PALETTE — Hospital Emerald & Slate
# ==========================================
C_PRIMARY = colors.HexColor('#065F46')       # Deep Forest Emerald
C_PRIMARY_MED = colors.HexColor('#059669')   # Hospital Jade Green
C_PRIMARY_LIGHT = colors.HexColor('#ECFDF5') # Soft Mint Background
C_PRIMARY_BORDER = colors.HexColor('#A7F3D0')# Light Green Border

C_ACCENT_BLUE = colors.HexColor('#0284C7')   # Ocean Clinical Blue
C_ACCENT_BLUE_LIGHT = colors.HexColor('#F0F9FF')
C_ACCENT_PURPLE = colors.HexColor('#7C3AED') # Clinical Intelligence Purple
C_ACCENT_PURPLE_LIGHT = colors.HexColor('#F5F3FF')

C_TEXT_DARK = colors.HexColor('#0F172A')     # Charcoal Title
C_TEXT_BODY = colors.HexColor('#334155')     # Slate Body
C_TEXT_MUTED = colors.HexColor('#64748B')    # Slate Muted
C_TEXT_LIGHT = colors.HexColor('#94A3B8')

C_BG_LIGHT = colors.HexColor('#F8FAFC')      # Card Surface Light
C_BG_CARD = colors.HexColor('#FFFFFF')
C_BORDER_LIGHT = colors.HexColor('#E2E8F0')  # Subtle Border
C_BORDER_MED = colors.HexColor('#CBD5E1')

C_DANGER = colors.HexColor('#E11D48')        # Critical / Emergency Red
C_DANGER_LIGHT = colors.HexColor('#FFF1F2')
C_WARNING = colors.HexColor('#D97706')       # Amber Alert
C_WARNING_LIGHT = colors.HexColor('#FFFBEB')
C_SUCCESS = colors.HexColor('#10B981')       # Success Green
C_SUCCESS_LIGHT = colors.HexColor('#ECFDF5')

# ==========================================
# NUMBERED CANVAS (Running Header/Footer)
# ==========================================
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
        if self._pageNumber == 1:
            # Skip header/footer on cover page
            return

        self.saveState()
        page_width, page_height = A4

        # ---- HEADER ----
        self.setStrokeColor(C_BORDER_LIGHT)
        self.setLineWidth(0.75)
        self.line(36, page_height - 38, page_width - 36, page_height - 38)

        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(C_PRIMARY)
        self.drawString(36, page_height - 30, "ALN CURE HOSPITAL MANAGEMENT SYSTEM")

        self.setFont('Helvetica', 8)
        self.setFillColor(C_TEXT_MUTED)
        self.drawRightString(page_width - 36, page_height - 30, "Complete Application & Website Documentation")

        # Small decorative green bar in top left
        self.setFillColor(C_PRIMARY_MED)
        self.rect(36, page_height - 33, 16, 2, fill=True, stroke=False)

        # ---- FOOTER ----
        self.setStrokeColor(C_BORDER_LIGHT)
        self.setLineWidth(0.75)
        self.line(36, 42, page_width - 36, 42)

        self.setFont('Helvetica', 8)
        self.setFillColor(C_TEXT_MUTED)
        self.drawString(36, 28, "Confidential — Hospital Administration, Clinical Leadership & Project Operations")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(C_PRIMARY)
        self.drawRightString(page_width - 36, 28, page_str)

        self.restoreState()

print("NumberedCanvas initialized successfully.")
