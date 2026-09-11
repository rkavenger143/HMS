#!/usr/bin/env python3
"""
ALN Cure HMS — Master Professional PDF Documentation Builder
Generates a publication-grade, comprehensive PDF document for the entire HMS website.
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
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

        # ---- RUNNING HEADER ----
        self.setStrokeColor(C_BORDER_LIGHT)
        self.setLineWidth(0.75)
        self.line(36, page_height - 34, page_width - 36, page_height - 34)

        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(C_PRIMARY)
        self.drawString(36, page_height - 26, "ALN CURE HOSPITAL MANAGEMENT SYSTEM (HMS)")

        self.setFont('Helvetica', 7.5)
        self.setFillColor(C_TEXT_MUTED)
        self.drawRightString(page_width - 36, page_height - 26, "Complete Application & Website Documentation")

        # Small decorative green bar in top left
        self.setFillColor(C_PRIMARY_MED)
        self.rect(36, page_height - 29, 20, 2, fill=True, stroke=False)

        # ---- RUNNING FOOTER ----
        self.setStrokeColor(C_BORDER_LIGHT)
        self.setLineWidth(0.75)
        self.line(36, 38, page_width - 36, 38)

        self.setFont('Helvetica', 7.5)
        self.setFillColor(C_TEXT_MUTED)
        self.drawString(36, 24, "Confidential — Hospital Administration, Clinical Leadership & Project Operations")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(C_PRIMARY)
        self.drawRightString(page_width - 36, 24, page_str)

        self.restoreState()


# ==========================================
# STYLES BUILDER
# ==========================================
def get_hms_styles():
    base = getSampleStyleSheet()
    styles = {}

    styles['CoverPreTitle'] = ParagraphStyle(
        'CoverPreTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=C_PRIMARY_MED,
        spaceAfter=8,
    )

    styles['CoverTitle'] = ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=C_PRIMARY,
        spaceAfter=10,
    )

    styles['CoverSubTitle'] = ParagraphStyle(
        'CoverSubTitle',
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=C_TEXT_BODY,
        spaceAfter=18,
    )

    styles['CoverMetaLabel'] = ParagraphStyle(
        'CoverMetaLabel',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=C_PRIMARY,
    )

    styles['CoverMetaVal'] = ParagraphStyle(
        'CoverMetaVal',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT_DARK,
    )

    styles['H1'] = ParagraphStyle(
        'HMS_H1',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True,
    )

    styles['H2'] = ParagraphStyle(
        'HMS_H2',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_TEXT_DARK,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True,
    )

    styles['H3'] = ParagraphStyle(
        'HMS_H3',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=C_PRIMARY_MED,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True,
    )

    styles['Body'] = ParagraphStyle(
        'HMS_Body',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.8,
        textColor=C_TEXT_BODY,
        spaceAfter=5,
    )

    styles['BodyBold'] = ParagraphStyle(
        'HMS_BodyBold',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11.8,
        textColor=C_TEXT_DARK,
        spaceAfter=4,
    )

    styles['Bullet'] = ParagraphStyle(
        'HMS_Bullet',
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=C_TEXT_BODY,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5,
    )

    styles['CalloutText'] = ParagraphStyle(
        'HMS_CalloutText',
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=C_PRIMARY,
    )

    styles['CalloutTitle'] = ParagraphStyle(
        'HMS_CalloutTitle',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=C_PRIMARY,
        spaceAfter=2,
    )

    styles['TableHead'] = ParagraphStyle(
        'HMS_TableHead',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
    )

    styles['TableCell'] = ParagraphStyle(
        'HMS_TableCell',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=C_TEXT_BODY,
    )

    styles['TableCellBold'] = ParagraphStyle(
        'HMS_TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=C_TEXT_DARK,
    )

    styles['BadgeText'] = ParagraphStyle(
        'HMS_BadgeText',
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=C_PRIMARY,
    )

    styles['TOC_Item'] = ParagraphStyle(
        'HMS_TOC_Item',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=C_TEXT_DARK,
    )

    styles['TOC_SubItem'] = ParagraphStyle(
        'HMS_TOC_SubItem',
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=C_TEXT_BODY,
        leftIndent=12,
    )

    styles['TOC_Page'] = ParagraphStyle(
        'HMS_TOC_Page',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_PRIMARY,
        alignment=2,
    )

    return styles


# ==========================================
# FLOWABLE GENERATORS
# ==========================================
def make_callout(title, text, styles, bg_color=C_PRIMARY_LIGHT, border_color=C_PRIMARY_MED):
    content = []
    if title:
        content.append(Paragraph(f"<b>{title}</b>", styles['CalloutTitle']))
    content.append(Paragraph(text, styles['CalloutText']))
    t = Table([[content]], colWidths=[523])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    return t

def make_section_banner(number_str, title_str, styles):
    p = Paragraph(f"<b>{number_str}. {title_str.upper()}</b>", styles['H1'])
    hr = HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY_MED, spaceBefore=2, spaceAfter=6)
    return [p, hr]

def make_module_card(mod_num, mod_name, dept_str, purpose_str, key_features_list, roles_list, workflow_str, screens_list, actions_list, inputs_list, outputs_list, integrations_str, ai_features_str, user_flow_str, styles):
    elements = []
    
    header_p = Paragraph(f"<b>{mod_num}. {mod_name}</b> <font size='7.5' color='{C_TEXT_MUTED.hexval()}'>&nbsp;|&nbsp; Department: {dept_str}</font>", styles['H2'])
    elements.append(header_p)
    elements.append(HRFlowable(width="100%", thickness=0.75, color=C_PRIMARY_BORDER, spaceBefore=1, spaceAfter=4))
    
    table_data = [
        [
            Paragraph("<b>Purpose & Scope:</b>", styles['TableCellBold']),
            Paragraph(purpose_str, styles['TableCell'])
        ],
        [
            Paragraph("<b>User Roles & Access:</b>", styles['TableCellBold']),
            Paragraph(roles_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Key Functional Features:</b>", styles['TableCellBold']),
            Paragraph(key_features_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Core Workflow Sequence:</b>", styles['TableCellBold']),
            Paragraph(f"<font color='{C_PRIMARY.hexval()}'><b>{workflow_str}</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Primary Screens & Tabs:</b>", styles['TableCellBold']),
            Paragraph(screens_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Important User Actions:</b>", styles['TableCellBold']),
            Paragraph(actions_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Inputs & Forms:</b>", styles['TableCellBold']),
            Paragraph(inputs_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Outputs & Reports:</b>", styles['TableCellBold']),
            Paragraph(outputs_list, styles['TableCell'])
        ],
        [
            Paragraph("<b>Cross Integrations:</b>", styles['TableCellBold']),
            Paragraph(integrations_str, styles['TableCell'])
        ],
        [
            Paragraph("<b>AI & Voice Capabilities:</b>", styles['TableCellBold']),
            Paragraph(f"<font color='{C_ACCENT_PURPLE.hexval()}'><b>{ai_features_str}</b></font>", styles['TableCell'])
        ],
        [
            Paragraph("<b>Operational User Flow:</b>", styles['TableCellBold']),
            Paragraph(user_flow_str, styles['TableCell'])
        ],
    ]

    t = Table(table_data, colWidths=[110, 413])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), C_BG_LIGHT),
        ('BACKGROUND', (1,0), (1,-1), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 8))
    return elements


# ==========================================
# MAIN DOCUMENT COMPILER
# ==========================================
def build_pdf(filename="ALN_Cure_HMS_Complete_Professional_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=46,
    )

    styles = get_hms_styles()
    story = []

    # ==========================================
    # COVER PAGE
    # ==========================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("HOSPITAL ENTERPRISE SUITE &bull; OFFICIAL SYSTEM DOCUMENTATION", styles['CoverPreTitle']))
    story.append(Paragraph("Hospital Management System<br/>(ALN Cure HMS)", styles['CoverTitle']))
    story.append(Paragraph("Complete Professional Application, Modules, Clinical Workflows, RBAC Security, Multilingual AI Voice Engine & Systems Architecture Documentation", styles['CoverSubTitle']))

    story.append(HRFlowable(width="100%", thickness=3, color=C_PRIMARY, spaceBefore=4, spaceAfter=16))

    # Metadata Grid
    meta_data = [
        [
            Paragraph("<b>Document Title:</b>", styles['CoverMetaLabel']),
            Paragraph("ALN Cure HMS — Master Website & Platform Reference", styles['CoverMetaVal']),
            Paragraph("<b>Target Audience:</b>", styles['CoverMetaLabel']),
            Paragraph("CEO, Hospital Board, MDs, Superintendents, IT Leads", styles['CoverMetaVal']),
        ],
        [
            Paragraph("<b>Software Version:</b>", styles['CoverMetaLabel']),
            Paragraph("Version 2.6 Enterprise Edition", styles['CoverMetaVal']),
            Paragraph("<b>Clinical Coverage:</b>", styles['CoverMetaLabel']),
            Paragraph("OPD, IPD, ER, ICU, LIS, RIS, MAR, Pharmacy, TPA", styles['CoverMetaVal']),
        ],
        [
            Paragraph("<b>Document Release:</b>", styles['CoverMetaLabel']),
            Paragraph("September 2026 (Official Build)", styles['CoverMetaVal']),
            Paragraph("<b>Security Standard:</b>", styles['CoverMetaLabel']),
            Paragraph("Role-Based RBAC, Session Isolation, Audit Trails", styles['CoverMetaVal']),
        ],
        [
            Paragraph("<b>Intelligence Engine:</b>", styles['CoverMetaLabel']),
            Paragraph("Multilingual AI (English, Telugu, Tanglish Voice)", styles['CoverMetaVal']),
            Paragraph("<b>Classification:</b>", styles['CoverMetaLabel']),
            Paragraph("Confidential — Enterprise Hospital Documentation", styles['CoverMetaVal']),
        ],
    ]

    meta_table = Table(meta_data, colWidths=[95, 166, 95, 167])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_PRIMARY_LIGHT),
        ('GRID', (0,0), (-1,-1), 0.5, C_PRIMARY_BORDER),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 16))

    # Executive Presentation Callout
    story.append(make_callout(
        "EXECUTIVE PRESENTATION BRIEF",
        "This official document provides a 360-degree blueprint of the ALN Cure Hospital Management System (HMS). "
        "Engineered for multi-specialty hospitals, healthcare networks, and medical centers, ALN Cure HMS unifies clinical patient care, "
        "diagnostic laboratories (LIS), diagnostic imaging (RIS/PACS), emergency trauma triage, inpatient census, medication administration (MAR), "
        "pharmacy inventory with FEFO batch control, cashless insurance/TPA claims processing, central revenue cycle cashiering, and an advanced "
        "real-time context-aware Multilingual AI Voice Assistant supporting English, Telugu, and Tanglish. "
        "This document is strictly focused on application-level workflows, screens, roles, and functional architecture.",
        styles,
        bg_color=C_PRIMARY_LIGHT,
        border_color=C_PRIMARY_MED
    ))

    story.append(Spacer(1, 16))

    # Key Pillar Badges Table
    pillars = [
        [
            Paragraph("<b>24 Integrated Modules</b><br/><font size='7' color='#475569'>Full hospital operations in single unified portal</font>", styles['TableCellBold']),
            Paragraph("<b>Dedicated LIS & RIS</b><br/><font size='7' color='#475569'>Strictly separated sample & imaging lifecycles</font>", styles['TableCellBold']),
            Paragraph("<b>Multilingual AI Voice</b><br/><font size='7' color='#475569'>English, Telugu & Tanglish voice actions</font>", styles['TableCellBold']),
        ],
        [
            Paragraph("<b>15+ Granular User Roles</b><br/><font size='7' color='#475569'>Zero credential leaks & role-fenced access</font>", styles['TableCellBold']),
            Paragraph("<b>Cashless Insurance / TPA</b><br/><font size='7' color='#475569'>Empanelled pre-auth & claims lifecycle</font>", styles['TableCellBold']),
            Paragraph("<b>Enterprise Reporting Suite</b><br/><font size='7' color='#475569'>18+ operational, financial & clinical reports</font>", styles['TableCellBold']),
        ]
    ]
    t_pillars = Table(pillars, colWidths=[174, 174, 175])
    t_pillars.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER_LIGHT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_pillars)

    story.append(PageBreak())

    # ==========================================
    # TABLE OF CONTENTS
    # ==========================================
    story.extend(make_section_banner("TABLE OF CONTENTS", "Master Document Outline", styles))
    story.append(Paragraph("This documentation is structured into 16 logical sections covering every functional dimension of the ALN Cure HMS platform:", styles['Body']))
    story.append(Spacer(1, 4))

    toc_data = [
        [Paragraph("<b>1. EXECUTIVE SUMMARY</b>", styles['TOC_Item']), Paragraph("Section 1.0", styles['TOC_Page'])],
        [Paragraph("1.1 Purpose, Vision & System Mission &bull; 1.2 Core Clinical & Administrative Objectives &bull; 1.3 Key Stakeholders & Operational Benefits", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],
        
        [Paragraph("<b>2. SYSTEM OVERVIEW & PLATFORM ARCHITECTURE</b>", styles['TOC_Item']), Paragraph("Section 2.0", styles['TOC_Page'])],
        [Paragraph("2.1 Omni-Navigation Paradigm &bull; 2.2 Global Header & Universal Quick Action Bar &bull; 2.3 Persistent Collapsible Sidebar &bull; 2.4 Alert Dispatcher", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>3. USER ROLES & ACCESS CONTROL MATRIX (RBAC)</b>", styles['TOC_Item']), Paragraph("Section 3.0", styles['TOC_Page'])],
        [Paragraph("3.1 Role Hierarchy & Segregation of Duties &bull; 3.2 Granular Permissions Matrix across 15+ System Roles &bull; 3.3 Data Privacy & Boundaries", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>4. COMPLETE HMS MODULE DOCUMENTATION (24 Modules)</b>", styles['TOC_Item']), Paragraph("Section 4.0", styles['TOC_Page'])],
        [Paragraph("4.1 Executive Dashboard &bull; 4.2 Patients (MPI) &bull; 4.3 Appointments &bull; 4.4 OPD Consultations &bull; 4.5 Emergency & Trauma &bull; 4.6 IPD & Beds &bull; 4.7 Doctors &bull; 4.8 Nursing & MAR &bull; 4.9 Laboratory LIS &bull; 4.10 Radiology RIS &bull; 4.11 Pharmacy POS &bull; 4.12 Diet & Nutrition &bull; 4.13 Billing & Finance &bull; 4.14 Insurance & TPA &bull; 4.15 Ambulance Fleet &bull; 4.16 Blood Bank &bull; 4.17 Housekeeping & Facilities &bull; 4.18 HR & Roster &bull; 4.19 Support Desk &bull; 4.20 Reports &bull; 4.21 Notifications &bull; 4.22 Administration & Settings &bull; 4.23 Context-Aware AI &bull; 4.24 AI Multilingual Voice Command", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>5. LABORATORY (LIS) VS DIAGNOSTICS & RADIOLOGY (RIS/PACS) WORKFLOWS</b>", styles['TOC_Item']), Paragraph("Section 5.0", styles['TOC_Page'])],
        [Paragraph("5.1 Dedicated LIS Specimen Lifecycle vs 5.2 Dedicated RIS DICOM Imaging Lifecycle (Side-by-Side Comparison)", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>6. CENTRAL AI ASSISTANT & CLINICAL INTELLIGENCE</b>", styles['TOC_Item']), Paragraph("Section 6.0", styles['TOC_Page'])],
        [Paragraph("6.1 Context-Aware Active Module Injection &bull; 6.2 Multilingual Tokenization &bull; 6.3 Proactive Critical Panic Alarms &bull; 6.4 Safety Guardrails", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>7. AI VOICE COMMAND ENGINE & CONVERSATIONAL EXAMPLES</b>", styles['TOC_Item']), Paragraph("Section 7.0", styles['TOC_Page'])],
        [Paragraph("7.1 Speech-to-Intent Pipeline &bull; 7.2 Native English, Telugu & Tanglish Command Matrix with Audio Synthesis Workflows", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>8. COMPLETE END-TO-END HOSPITAL WORKFLOWS</b>", styles['TOC_Item']), Paragraph("Section 8.0", styles['TOC_Page'])],
        [Paragraph("8.1 Outpatient Clinical Journey &bull; 8.2 Inpatient Lifecycle &bull; 8.3 Cashless Insurance Claim &bull; 8.4 Emergency Resuscitation & Trauma Protocol", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>9. SCREEN & PAGE DOCUMENTATION</b>", styles['TOC_Item']), Paragraph("Section 9.0", styles['TOC_Page'])],
        [Paragraph("9.1 Standard UI Anatomy & Layout Blueprint &bull; 9.2 Data Tables & Filters &bull; 9.3 Action Modals & Fast Shortcuts", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>10. ENTERPRISE REPORTING & ANALYTICS CATALOG</b>", styles['TOC_Item']), Paragraph("Section 10.0", styles['TOC_Page'])],
        [Paragraph("10.1 Clinical, Operational & Financial Reports Catalog &bull; 10.2 Filter Criteria, Date Aggregations & Export Configurations (PDF / Excel)", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>11. APPLICATION SECURITY, PRIVACY & DATA PROTECTION</b>", styles['TOC_Item']), Paragraph("Section 11.0", styles['TOC_Page'])],
        [Paragraph("11.1 Authentication & Session Security &bull; 11.2 PHI Privacy Controls &bull; 11.3 Financial Audit Logging & Zero Credential Exposure", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>12. SYSTEM INTEGRATION MATRIX & INTER-MODULE DATA SYNC</b>", styles['TOC_Item']), Paragraph("Section 12.0", styles['TOC_Page'])],
        [Paragraph("12.1 Cross-Cutting Departmental Communication & Auto-Charge Capture Handshakes", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>13. CONCEPTUAL HOSPITAL DATA FLOW OVERVIEW</b>", styles['TOC_Item']), Paragraph("Section 13.0", styles['TOC_Page'])],
        [Paragraph("13.1 High-Level Patient & Financial Lifecycle Architecture & Bull; 13.2 Clinical Aggregation Model", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>14. UI/UX DESIGN SYSTEM & ERGONOMIC STANDARDS</b>", styles['TOC_Item']), Paragraph("Section 14.0", styles['TOC_Page'])],
        [Paragraph("14.1 Emerald Hospital Theme & Color System &bull; 14.2 Responsive Screen Breakpoints &bull; 14.3 Voice Ergonomics & Accessibility", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],

        [Paragraph("<b>15. FUTURE ENHANCEMENTS ROADMAP</b>", styles['TOC_Item']), Paragraph("Section 15.0", styles['TOC_Page'])],
        [Paragraph("15.1 Telemedicine Video Integration &bull; 15.2 HL7/FHIR EHR Gateway &bull; 15.3 IoT Wearable Bedside Telemetry (Demarcated)", styles['TOC_SubItem']), Paragraph("", styles['TOC_Page'])],
    ]

    t_toc = Table(toc_data, colWidths=[450, 73])
    t_toc.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_toc)

    story.append(PageBreak())

    # ==========================================
    # SECTION 1: EXECUTIVE SUMMARY
    # ==========================================
    story.extend(make_section_banner("1", "Executive Summary", styles))
    
    story.append(Paragraph("<b>1.1 System Identity & Overview</b>", styles['H2']))
    story.append(Paragraph(
        "<b>ALN Cure Hospital Management System (HMS)</b> is an enterprise-grade digital health ecosystem that unifies clinical, "
        "diagnostic, inpatient, emergency, surgical, administrative, supply-chain, and financial operations into a single cohesive, "
        "cloud-responsive application. The platform is designed to replace legacy departmental silos with a unified clinical record, "
        "real-time data interchange, and embedded multilingual artificial intelligence.",
        styles['Body']
    ))

    story.append(Paragraph("<b>1.2 Purpose of the System</b>", styles['H2']))
    story.append(Paragraph(
        "The core purpose of ALN Cure HMS is to optimize the delivery of healthcare services across the entire patient lifecycle — from "
        "first outpatient registration or emergency trauma triage to in-depth diagnostic investigations, inpatient ward care, electronic medication "
        "administration (MAR), dietary management, and central revenue cashiering. By orchestrating communication between clinical specialists, "
        "nurses, pharmacists, laboratory technicians, radiologists, billing officers, and hospital executives, the system minimizes clinical errors, "
        "eliminates billing leakage, accelerates insurance pre-authorizations, and elevates the patient experience.",
        styles['Body']
    ))

    story.append(Paragraph("<b>1.3 Main Objectives</b>", styles['H2']))
    story.append(Paragraph("&bull; <b>Unified Longitudinal Patient Record:</b> Maintain a centralized Master Patient Index (MPI) with cumulative clinical history, lab reports, imaging studies, and past billing.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Zero-Friction Clinical Workflows:</b> Provide doctors and nurses with rapid computerized physician order entry (CPOE), structured prescription templates, and e-vitals tracking.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Strict Diagnostic Segregation:</b> Offer dedicated, specialized workflows for Laboratory (LIS - specimens) and Diagnostics/Radiology (RIS/PACS - DICOM imaging).", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Cashless Insurance Acceleration:</b> Automate TPA pre-authorization submission, document collation, and claim adjudication tracking.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Multilingual Voice-Driven Productivity:</b> Empower staff to query data and navigate modules via hands-free voice commands in English, Telugu, and Tanglish.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Real-Time Financial Integrity:</b> Ensure automatic departmental charge capture with zero unbilled services across pharmacy, laboratory, radiology, and nursing procedures.", styles['Bullet']))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>1.4 Target Users & Stakeholders</b>", styles['H2']))
    
    stakeholders = [
        [Paragraph("<b>Stakeholder Group</b>", styles['TableHead']), Paragraph("<b>Primary Role & Interaction with ALN Cure HMS</b>", styles['TableHead'])],
        [Paragraph("<b>Hospital Board & CEO</b>", styles['TableCellBold']), Paragraph("Executive dashboards, financial health metrics, bed occupancy analytics, revenue reports, and regulatory compliance audit logs.", styles['TableCell'])],
        [Paragraph("<b>Medical Superintendents & HODs</b>", styles['TableCellBold']), Paragraph("Doctor productivity rosters, departmental clinical TAT monitoring, critical panic value oversight, and ward bed allocation.", styles['TableCell'])],
        [Paragraph("<b>Physicians & Specialists</b>", styles['TableCellBold']), Paragraph("OPD consultation desk, clinical diagnosis (ICD-10), e-prescriptions, CPOE lab/radiology ordering, inpatient rounds notes, and AI clinical summaries.", styles['TableCell'])],
        [Paragraph("<b>Nursing Staff</b>", styles['TableCellBold']), Paragraph("Inpatient census, bed transfers, electronic Medication Administration Record (MAR), vitals charting, nursing handover, and emergency shift reports.", styles['TableCell'])],
        [Paragraph("<b>Lab Technicians & Pathologists</b>", styles['TableCellBold']), Paragraph("Specimen barcode receiving, test worklists, analyzer result entry, critical panic flag triggers, and multi-tier pathologist verification.", styles['TableCell'])],
        [Paragraph("<b>Radiologists & RIS Techs</b>", styles['TableCellBold']), Paragraph("Modality scheduling (CT/MRI/X-Ray/USG), patient prep checklists, DICOM study link reviews, radiologist report transcription, and verification.", styles['TableCell'])],
        [Paragraph("<b>Pharmacists</b>", styles['TableCellBold']), Paragraph("Prescription queue dispensing, drug interaction verification, counter POS cashiering, FEFO batch control, low stock reorders, and supplier GRNs.", styles['TableCell'])],
        [Paragraph("<b>Billing & TPA Coordinators</b>", styles['TableCellBold']), Paragraph("Consolidated central invoice generation, split billing (patient vs insurance co-pay), receipt issuance, pre-authorization, and claims tracking.", styles['TableCell'])],
        [Paragraph("<b>Operations & Facilities Staff</b>", styles['TableCellBold']), Paragraph("Ambulance dispatch GPS tracking, blood bank component inventory, bed turnover sanitation, and biomedical engineering maintenance tickets.", styles['TableCell'])],
    ]
    t_stakeholders = Table(stakeholders, colWidths=[140, 383])
    t_stakeholders.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_stakeholders)

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>1.5 Quantifiable Operational & Financial Benefits</b>", styles['H2']))
    story.append(Paragraph("&bull; <b>90% Reduction in Clinical Transcription Delays:</b> Instant digital orders from consultation directly to Pharmacy, LIS, and RIS.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Zero Unbilled Services:</b> Real-time charge capture automatically pushes lab tests, radiology scans, and medicines to the patient central invoice.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>65% Faster Bed Turnover:</b> Automated housekeeping notifications upon patient discharge speed up room sanitization for incoming admissions.", styles['Bullet']))
    story.append(Paragraph("&bull; <b>Hands-Free Multilingual AI Operation:</b> Clinicians and staff can trigger workflows and check bed vacancies verbally in Telugu or English.", styles['Bullet']))

    story.append(PageBreak())

    # ==========================================
    # SECTION 2: SYSTEM OVERVIEW
    # ==========================================
    story.extend(make_section_banner("2", "System Overview & Platform Architecture", styles))
    
    story.append(Paragraph("<b>2.1 Platform Architectural Paradigm</b>", styles['H2']))
    story.append(Paragraph(
        "ALN Cure HMS is architected around a unified single-page responsive layout that ensures sub-second screen transitions, "
        "persistent global state synchronization, and continuous background event monitoring. The user interface comprises three persistent "
        "structural layers: the <b>Global Top Header</b>, the <b>Collapsible Master Sidebar</b>, and the <b>Contextual Main Work Area</b>.",
        styles['Body']
    ))

    overview_layers = [
        [Paragraph("<b>Architectural Component</b>", styles['TableHead']), Paragraph("<b>Technical & Operational Functionality</b>", styles['TableHead'])],
        [
            Paragraph("<b>Global Top Header</b>", styles['TableCellBold']),
            Paragraph("Always visible across all modules. Houses the Hospital Brand identity, Universal Global Search (<kbd>Ctrl+K</kbd>), Instant AI Voice trigger microphone, Quick Action '+ Add' dropdown (Patient, Appointment, Bill, Lab Order), Real-time Notification Bell badge with audio chime, and Active User Profile with role switcher.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Master Collapsible Sidebar</b>", styles['TableCellBold']),
            Paragraph("Grouped into 6 logical operational sections: <i>Core Management, Clinical Care, Medical Staff, Diagnostics & Pharmacy, Finance & Insurance, Support Services, and Administration</i>. Displays dynamic live counter badges (e.g., waiting patients, low stock alerts, pending claims, emergency triage count). Supports full collapse for maximum clinical data width.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Omnipresent AI Floating Widget</b>", styles['TableCellBold']),
            Paragraph("Universal circular trigger located at the bottom-right of every screen. Injects the active route URL and current department into the AI context engine, enabling zero-typing natural language prompts, instant page navigation, and spoken voice readouts in Telugu and English.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Notification & Alert Command</b>", styles['TableCellBold']),
            Paragraph("Centralized real-time event listener that broadcasts panic lab values (<100mg/dL or >400mg/dL glucose, critical troponin), red resuscitation trauma triage arrivals, low blood bank units, and pending insurance query letters.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Administration & Governance Hub</b>", styles['TableCellBold']),
            Paragraph("Comprehensive administrative cockpit featuring Role-Based Access Control (RBAC) permission matrices, hospital department definitions, doctor tariffs, ward/bed matrix setup, print layout templates, and immutable security audit logs.", styles['TableCell'])
        ],
    ]
    t_ov = Table(overview_layers, colWidths=[140, 383])
    t_ov.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ov)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>2.2 Platform Navigation Map & Organization</b>", styles['H2']))
    story.append(Paragraph(
        "All 24 modules in ALN Cure HMS are structured logically to match real-world hospital operational flow:",
        styles['Body']
    ))

    nav_groups = [
        [Paragraph("<b>Section</b>", styles['TableHead']), Paragraph("<b>Included HMS Modules</b>", styles['TableHead']), Paragraph("<b>Primary Operational Scope</b>", styles['TableHead'])],
        [Paragraph("<b>1. Core Management</b>", styles['TableCellBold']), Paragraph("1. Executive Dashboard<br/>2. AI Command Center", styles['TableCell']), Paragraph("Executive KPIs, revenue trends, live occupancy, AI natural language console.", styles['TableCell'])],
        [Paragraph("<b>2. Clinical Care</b>", styles['TableCellBold']), Paragraph("3. Patients Directory (MPI)<br/>4. Appointments & Scheduling<br/>5. OPD & Consultations<br/>6. Emergency & Trauma<br/>7. IPD & Bed Management", styles['TableCell']), Paragraph("Full clinical lifecycle from patient intake and consultation to emergency resuscitation and inpatient stay.", styles['TableCell'])],
        [Paragraph("<b>3. Medical Staff</b>", styles['TableCellBold']), Paragraph("8. Doctors & Specialists<br/>9. Nursing Station & MAR", styles['TableCell']), Paragraph("Clinical duty rosters, doctor consultation rooms, bedside nursing tasks, vitals charting, and medication records.", styles['TableCell'])],
        [Paragraph("<b>4. Diagnostics & Pharmacy</b>", styles['TableCellBold']), Paragraph("10. Clinical Laboratory (LIS)<br/>11. Diagnostics & Radiology (RIS)<br/>12. Pharmacy & POS<br/>13. Clinical Diet & Nutrition", styles['TableCell']), Paragraph("Diagnostic investigations, imaging DICOM archives, prescription retail POS dispensing, and therapeutic meal plans.", styles['TableCell'])],
        [Paragraph("<b>5. Finance & Insurance</b>", styles['TableCellBold']), Paragraph("14. Central Billing & Accounts<br/>15. Insurance & TPA Claims", styles['TableCell']), Paragraph("Integrated charge capture, patient invoices, split payment cashiering, pre-auth approvals, and claims settlement.", styles['TableCell'])],
        [Paragraph("<b>6. Support Services</b>", styles['TableCellBold']), Paragraph("16. Ambulance Fleet<br/>17. Blood Bank & Transfusion<br/>18. Housekeeping & Facilities", styles['TableCell']), Paragraph("GPS dispatch, blood donor screening & component fractionation, room turnover sanitation, and biomedical engineering.", styles['TableCell'])],
        [Paragraph("<b>7. Administration</b>", styles['TableCellBold']), Paragraph("19. HR & Employees<br/>20. Help & Support Desk<br/>21. Reports & Analytics<br/>22. Notifications & Alerts<br/>23. Admin Panel<br/>24. System Settings", styles['TableCell']), Paragraph("Staff payroll & attendance, IT tickets & KB, 18+ business intelligence reports, RBAC permissions, and system configurations.", styles['TableCell'])],
    ]
    t_nav = Table(nav_groups, colWidths=[100, 160, 263])
    t_nav.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_nav)

    story.append(PageBreak())

    # ==========================================
    # SECTION 3: USER ROLES & ACCESS
    # ==========================================
    story.extend(make_section_banner("3", "User Roles & Role-Based Access Control (RBAC)", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS implements a strict, multi-tier Role-Based Access Control (RBAC) security model. "
        "User roles enforce the Principle of Least Privilege (PoLP) — clinical personnel have access only to relevant patient charts, "
        "diagnostic staff operate exclusively within their specimen/imaging queues, billing officers handle revenue collection, and "
        "only authorized leadership view payroll and executive analytics. No credentials, tokens, or private secrets are exposed.",
        styles['Body']
    ))

    roles_data = [
        [Paragraph("<b>Role Name</b>", styles['TableHead']), Paragraph("<b>Department / Category</b>", styles['TableHead']), Paragraph("<b>Permissions & Module Access Scope</b>", styles['TableHead']), Paragraph("<b>Restricted Boundaries</b>", styles['TableHead'])],
        [
            Paragraph("<b>Super Admin</b>", styles['TableCellBold']),
            Paragraph("Executive Leadership", styles['TableCell']),
            Paragraph("Full unrestricted read/write access across all 24 modules, RBAC role assignment, system configuration, master tariffs, and immutable audit logs.", styles['TableCell']),
            Paragraph("None (Root administrator).", styles['TableCell'])
        ],
        [
            Paragraph("<b>Hospital Admin</b>", styles['TableCellBold']),
            Paragraph("Hospital Operations", styles['TableCell']),
            Paragraph("Operational management: patient records, staff schedules, doctor tariffs, bed setups, billing approvals, and operational reports.", styles['TableCell']),
            Paragraph("Cannot delete system audit logs or override core database configurations.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Doctor / Specialist</b>", styles['TableCellBold']),
            Paragraph("Clinical Services", styles['TableCell']),
            Paragraph("OPD consultation desk, clinical notes, ICD-10 diagnosis, e-prescriptions, lab/radiology CPOE ordering, IPD clinical rounds, discharge summaries, and AI diagnostic drafts.", styles['TableCell']),
            Paragraph("Restricted from financial cash collection, insurance claims settlement, and staff payroll data.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Nurse</b>", styles['TableCellBold']),
            Paragraph("Nursing Care", styles['TableCell']),
            Paragraph("Assigned patient lists, vitals monitoring, Medication Administration Record (MAR), nursing care notes, shift handover, emergency vitals recording, and bed status updates.", styles['TableCell']),
            Paragraph("Cannot edit doctor prescription formulations, authorize final discharge, or modify hospital tariffs.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Lab Technician</b>", styles['TableCellBold']),
            Paragraph("Pathology & Diagnostics", styles['TableCell']),
            Paragraph("LIS order queue, sample barcode accessioning, sample intake, instrument test result entry, reference range verification, and panic value alert dispatch.", styles['TableCell']),
            Paragraph("Restricted from radiology DICOM archives, patient billing collection, and pharmacy retail sales.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Radiologist / Rad Tech</b>", styles['TableCellBold']),
            Paragraph("Diagnostic Imaging (RIS)", styles['TableCell']),
            Paragraph("Modality worklist (CT/MRI/X-Ray/USG), patient exam preparation, DICOM study link association, radiologist diagnostic finding entry, and signed report verification.", styles['TableCell']),
            Paragraph("Cannot modify laboratory specimen tubes, dispense medications, or alter hospital financial ledgers.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Pharmacist</b>", styles['TableCellBold']),
            Paragraph("Pharmacy Services", styles['TableCell']),
            Paragraph("Prescription queue fulfillment, drug dispensing desk, OTC retail POS cashiering, batch stock management, FEFO expiration alerts, and purchase orders.", styles['TableCell']),
            Paragraph("Cannot alter clinical consultation diagnoses or access patient financial insurance claims directly.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Billing Staff</b>", styles['TableCellBold']),
            Paragraph("Finance & Cashiering", styles['TableCell']),
            Paragraph("Central invoice generation, patient ledger accounts, cash/card/UPI receipt printing, shift cashier closures, advance deposits, and refund requests.", styles['TableCell']),
            Paragraph("Read-only access to clinical notes; cannot modify clinical diagnoses, lab orders, or prescribe drugs.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Insurance Coordinator</b>", styles['TableCellBold']),
            Paragraph("Insurance & TPA Desk", styles['TableCell']),
            Paragraph("TPA provider empanelment, patient policy verification, cashless pre-authorization submission, claim document packaging, query resolution, and settlement logging.", styles['TableCell']),
            Paragraph("Cannot execute clinical orders or perform physical medicine dispensing.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Dietitian</b>", styles['TableCellBold']),
            Paragraph("Dietetics & Nutrition", styles['TableCell']),
            Paragraph("Diet plan creation, therapeutic diet charts (Diabetic, Renal, Salt-Restricted), daily kitchen meal schedules, tray distribution tracking, and nutritional monitoring.", styles['TableCell']),
            Paragraph("Restricted to dietary and inpatient clinical views; no access to billing or pharmacy POS.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Receptionist / Front Desk</b>", styles['TableCellBold']),
            Paragraph("Patient Registration", styles['TableCell']),
            Paragraph("Patient Master Index (MPI) registration, appointment booking, doctor token issuance, OPD consultation fee collection, and basic patient inquiries.", styles['TableCell']),
            Paragraph("No access to clinical consultation notes, lab test results, or hospital payroll records.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Blood Bank Staff</b>", styles['TableCellBold']),
            Paragraph("Transfusion Medicine", styles['TableCell']),
            Paragraph("Blood donor registration, screening & serology testing, component separation (PRBC, FFP, Platelets), inventory storage temps, cross-matching, and issue logs.", styles['TableCell']),
            Paragraph("Restricted to blood bank domain; cannot dispense pharmacy drugs or edit patient insurance claims.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Ambulance Staff</b>", styles['TableCellBold']),
            Paragraph("Emergency Dispatch", styles['TableCell']),
            Paragraph("Fleet status dashboard, emergency call intake, GPS driver dispatch, paramedic transit vitals logging, and emergency hospital intake notifications.", styles['TableCell']),
            Paragraph("No access to hospital general ledger, inpatient MAR, or doctor prescription authoring.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Housekeeping & Facilities</b>", styles['TableCellBold']),
            Paragraph("Facilities Management", styles['TableCell']),
            Paragraph("Discharge bed turnover queue, deep-cleaning checklists, bio-hazard sanitation logging, and biomedical maintenance work order tracking.", styles['TableCell']),
            Paragraph("Zero access to patient medical records, financial data, or clinical orders.", styles['TableCell'])
        ],
        [
            Paragraph("<b>HR Staff</b>", styles['TableCellBold']),
            Paragraph("Human Resources", styles['TableCell']),
            Paragraph("Employee personnel directory, biometric attendance records, duty shift rostering, leave approval workflows, payroll processing, and statutory compliance.", styles['TableCell']),
            Paragraph("Zero access to patient medical histories or clinical consultation records.", styles['TableCell'])
        ],
        [
            Paragraph("<b>IT Support Staff</b>", styles['TableCellBold']),
            Paragraph("Operations Support", styles['TableCell']),
            Paragraph("Internal help desk ticket resolution, knowledge base article authoring, workstation hardware tracking, and system uptime monitoring.", styles['TableCell']),
            Paragraph("Cannot view confidential patient health information (PHI) or hospital financial ledgers.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Management / Executive</b>", styles['TableCellBold']),
            Paragraph("Executive Leadership", styles['TableCell']),
            Paragraph("Read-only access to all hospital dashboards, revenue analytics, clinical turnaround times, bed occupancy trends, and doctor productivity reports.", styles['TableCell']),
            Paragraph("Cannot edit transactional medical records or alter patient prescriptions.", styles['TableCell'])
        ],
    ]

    t_roles = Table(roles_data, colWidths=[80, 85, 238, 120])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_roles)

    story.append(PageBreak())

    # ==========================================
    # SECTION 4: COMPLETE 24-MODULE DOCUMENTATION
    # ==========================================
    story.extend(make_section_banner("4", "Complete HMS Module Documentation (All 24 Modules)", styles))
    story.append(Paragraph(
        "Each of the 24 modules implemented in the ALN Cure HMS is documented in detail below following a standardized operational format:",
        styles['Body']
    ))
    story.append(Spacer(1, 4))

    # MODULE 1: Dashboard
    story.extend(make_module_card(
        "4.1", "Executive & Clinical Dashboard", "Executive Administration",
        "Provides real-time operational visibility, high-level hospital KPIs, bed occupancy rates, revenue metrics, emergency triage counts, and instant clinical shortcut links.",
        "&bull; Live KPI Stat Cards (Total Patients, Today's OPD, Inpatient Count, Bed Occupancy %, Active Doctors, Revenue Today)<br/>"
        "&bull; Bed Occupancy Visual Heatmap & ICU availability status<br/>"
        "&bull; Critical Alarms Callout Center for panic lab values and trauma arrivals<br/>"
        "&bull; Quick Action Command Hub for one-click patient intake, appointment booking, and bill creation<br/>"
        "&bull; Financial Revenue Trends with Departmental breakdown",
        "Super Admin, Hospital Admin, Management, Doctor, Nurse, Billing Staff",
        "Real-Time Data Streams &rarr; KPI Aggregation &rarr; Visual Widget Rendering &rarr; Interactive Drill-Down Navigation",
        "Overview Dashboard, Bed Occupancy Grid, Live Activity Feed, Critical Alerts Hub, Revenue Analytics Widget",
        "Filter by Date Range, Refresh Data Streams, Quick Add Modal Trigger, Drill down to specific module",
        "Date filters, Department selectors, Quick registration inputs",
        "Executive KPI summary, Visual occupancy graphs, Shift financial summaries, Critical alert lists",
        "Aggregates data from Patients, Appointments, OPD, IPD, LIS, RIS, Pharmacy, Billing, and Emergency",
        "Proactive hospital alert aggregation, instant voice command queries ('Show today's stats', 'Available beds')",
        "Executive logs in &rarr; Reviews live hospital census &rarr; Checks critical alarms &rarr; Navigates directly to overloaded departments",
        styles
    ))

    # MODULE 2: Patients (MPI)
    story.extend(make_module_card(
        "4.2", "Patients Directory & Master Patient Index (MPI)", "Medical Records",
        "Centralized repository for patient demographic, longitudinal clinical, historical diagnostic, and insurance policy records across all hospital encounters.",
        "&bull; Unique Patient ID Generation (e.g., ALN-2026-00001)<br/>"
        "&bull; Comprehensive demographic and emergency contact capture<br/>"
        "&bull; Blood group color-coded avatars and allergy warning flags<br/>"
        "&bull; Aadhaar / National ID and insurance policy linking<br/>"
        "&bull; Full longitudinal medical timeline (OPD, IPD, Lab, Rad, Rx, Bills)<br/>"
        "&bull; Fast multi-field search (Name, Phone, ID, Aadhaar, Blood Group)",
        "Super Admin, Hospital Admin, Receptionist, Doctor, Nurse, Billing Staff",
        "Patient Arrival &rarr; Search MPI / Register New Patient &rarr; Demographic Entry &rarr; Policy Association &rarr; Profile Generated",
        "Patient Directory Grid, Patient Card View, Comprehensive Patient Dossier, Registration Modal, Edit Profile Drawer",
        "Add New Patient, Edit Demographics, View Medical History Dossier, Export Patient Directory, Print Patient ID Card",
        "First/Last Name, DOB, Gender, Phone, Email, Address, Blood Group, Allergies, Emergency Contact, Insurance Provider & Policy #",
        "Patient ID Card, Full Medical History Dossier, Patient Directory Excel/PDF Export",
        "Feeds into OPD, Appointments, Emergency, IPD, LIS, RIS, Pharmacy, Billing, and Insurance",
        "Patient longitudinal summarization, voice patient search ('Find patient John Doe', 'పేషెంట్ వివరాలు చూపించు')",
        "Receptionist searches existing MPI &rarr; If not found, enters demographic form &rarr; Generates unique ALN ID &rarr; Passes patient to OPD queue",
        styles
    ))

    # MODULE 3: Appointments
    story.extend(make_module_card(
        "4.3", "Appointments & Scheduling", "Front Desk & Reception",
        "Manages multi-specialty physician scheduling, patient appointment booking, token generation, slot allocation, and queue arrival status.",
        "&bull; Multi-Doctor Calendar and Slot Booking Grid<br/>"
        "&bull; Token Number Generation & Queue Status Tracking (Scheduled, Confirmed, Waiting, In Consultation, Completed, Cancelled, No Show)<br/>"
        "&bull; Integrated Front-Desk Consultation Fee Billing with receipt printing<br/>"
        "&bull; Doctor availability schedule synchronization<br/>"
        "&bull; Patient arrival check-in and waiting room token broadcast",
        "Super Admin, Hospital Admin, Receptionist, Doctor, Nurse",
        "Doctor Selection &rarr; Date & Slot Pick &rarr; Patient Linking &rarr; Consultation Fee Payment &rarr; Token Generation &rarr; Queue Queue Broadcast",
        "Appointments Calendar View, Daily Queue List, Booking Modal, Appointment Billing Modal, Print Token Receipt Window",
        "Book New Appointment, Check-in Patient, Mark Waiting/Completed, Collect Consultation Fee, Print Receipt, Cancel/Reschedule Slot",
        "Patient ID, Doctor ID, Department, Appointment Date, Time Slot, Consultation Type, Chief Complaint, Fee Amount, Payment Mode",
        "Appointment Token Slip, Consultation Fee Receipt, Daily Doctor Appointment Schedule Sheet",
        "Integrates with Patients, Doctors Directory, OPD Queue, and Central Billing",
        "Voice slot booking ('Book appointment for Dr. Rajesh', 'అపాయింట్మెంట్ బుక్ చేయి'), intelligent conflict detection",
        "Patient requests slot &rarr; Receptionist checks doctor calendar &rarr; Selects time &rarr; Issues token slip &rarr; Collects fee &rarr; Pushes to OPD waiting queue",
        styles
    ))

    # MODULE 4: OPD & Consultations
    story.extend(make_module_card(
        "4.4", "Outpatient Department (OPD) & Consultations", "Outpatient Clinic",
        "Comprehensive clinical consultation desk for physicians to record patient vitals, clinical examination, ICD-10 diagnosis, e-prescriptions, and CPOE diagnostic orders.",
        "&bull; Live OPD Token Queue Management with real-time calling<br/>"
        "&bull; Vitals Triage Station (BP, Pulse, SpO2, Temp, Resp Rate, Height, Weight, BMI)<br/>"
        "&bull; Structured Clinical Notes: Chief Complaint, History of Illness, Physical Examination<br/>"
        "&bull; ICD-10 Diagnostic Codification and chronic disease tagging<br/>"
        "&bull; Electronic Prescription (Rx) Writer with dosage, frequency, route, and duration<br/>"
        "&bull; One-Click CPOE ordering for Laboratory tests and Radiology imaging<br/>"
        "&bull; Follow-up scheduling and AI Clinical Note draft generation",
        "Doctor, Super Admin, Hospital Admin, Nurse, Receptionist",
        "Patient Token Call &rarr; Vitals Capture &rarr; Clinical Examination &rarr; Diagnosis & ICD &rarr; Rx & CPOE Orders &rarr; Follow-up &rarr; Complete",
        "OPD Dashboard, Queue Desk, Consultation Workspace, Vitals Station, Prescription Manager, Follow-up Tracker, OPD History",
        "Call Next Token, Record Vitals, Generate AI Clinical Note, Prescribe Medicines, Order Lab/Rad Tests, Print Prescription, Schedule Follow-up",
        "Vitals measurements, Chief complaint, Clinical findings, Diagnosis codes, Medicine items (Dosage, Frequency, Duration), Lab/Rad test selections",
        "Official Printable Prescription (Rx), Clinical Summary Report, Vitals Chart, Diagnostic Order Requisition Slips",
        "Feeds diagnostic orders to LIS and RIS, transmits prescriptions to Pharmacy, pushes consultation charges to Central Billing",
        "Context-aware AI clinical summarization, automated drug dosage suggestions, Telugu voice commands ('OPD ఓపెన్ చేయి')",
        "Doctor clicks 'Call Next' &rarr; Patient enters consultation room &rarr; Doctor reviews vitals & history &rarr; Enters examination & diagnosis &rarr; Adds Rx & Lab orders &rarr; Prints prescription &rarr; Marks completed",
        styles
    ))

    story.append(PageBreak())

    # MODULE 5: Emergency & Trauma
    story.extend(make_module_card(
        "4.5", "Emergency & Trauma Care Unit", "Casualty & Emergency",
        "High-acuity emergency department module managing patient intake, 4-tier triage color coding, Glasgow Coma Scale (GCS), Medico-Legal Case (MLC) logs, and ER bed allocations.",
        "&bull; 4-Tier Emergency Triage Classification: Red (Resuscitation), Yellow (Emergent), Green (Non-urgent), Black (Deceased)<br/>"
        "&bull; Real-time Glasgow Coma Scale (GCS 3-15) calculation and neurological tracking<br/>"
        "&bull; Medico-Legal Case (MLC) registration with police station notification logs<br/>"
        "&bull; Emergency Trauma Bed allocation (ER-Bay-01 to 08, Resuscitation Room)<br/>"
        "&bull; Rapid emergency doctor and trauma surgeon assignment<br/>"
        "&bull; Instant STAT diagnostic ordering for CT Trauma and Emergency Blood Transfusion",
        "Emergency Doctor, Trauma Nurse, Ambulance Staff, Hospital Admin, Super Admin",
        "Emergency Arrival (108/Walk-in) &rarr; Rapid Triage & GCS &rarr; Bay Allocation &rarr; STAT Orders & Stabilization &rarr; IPD Transfer / MLC Dispatch",
        "Emergency Triage Board, Trauma Bays View, MLC Registry, Intake Modal, Emergency Vitals Station, Discharge/Transfer Console",
        "Intake Emergency Patient, Update Triage Level, Calculate GCS, Trigger STAT Alarm, Assign ER Bed, Initiate Emergency IPD Admission",
        "Patient/Unidentified info, Brought by (Ambulance/Police), Triage color, Vitals (BP, Pulse, SpO2, GCS), MLC checkbox, Police station info",
        "Emergency Admission Ticket, MLC Police Report, STAT Diagnostic Requisition, Trauma Resuscitation Sheet",
        "Direct emergency admission to IPD/ICU, STAT requests to Blood Bank and LIS, Ambulance handover sync",
        "Automated critical vitals anomaly detection, instant red-alert broadcast across hospital header, Telugu voice trauma intake",
        "Paramedic brings patient &rarr; ER Nurse assesses GCS & vitals &rarr; Tags 'Red Resuscitation' &rarr; System sounds header panic alert &rarr; ER Doctor performs immediate stabilization &rarr; Orders STAT blood/CT",
        styles
    ))

    # MODULE 6: IPD & Beds
    story.extend(make_module_card(
        "4.6", "Inpatient Department (IPD) & Bed Management", "Inpatient Wards & ICU",
        "Manages inpatient admissions, ward and room configurations, interactive visual bed board matrices, inter-bed transfers, clinical rounds notes, and discharge workflows.",
        "&bull; Visual Ward Bed Board Matrix with real-time color status (Occupied, Available, Cleaning, Maintenance)<br/>"
        "&bull; Multi-Ward Support (General Ward, Semi-Private, Deluxe Private, ICU, HDU, NICU, PICU, Isolation)<br/>"
        "&bull; Inpatient Admission with admitting doctor, attending specialist, and provisional diagnosis<br/>"
        "&bull; Inter-Bed and Inter-Ward Patient Transfer with history logging<br/>"
        "&bull; Daily Clinical Inpatient Rounds notes and physician orders<br/>"
        "&bull; Multi-stage Discharge Station (Clinical clearance, Pharmacy return, Final billing reconciliation)",
        "Super Admin, Hospital Admin, Doctor, Nurse, Management",
        "Admission Requisition &rarr; Bed Allocation &rarr; Ward Check-in &rarr; Daily Rounds & Care &rarr; Discharge Order &rarr; Billing Settlement &rarr; Bed Cleaning",
        "IPD Dashboard, Patient Admission Desk, Inpatient Census, Bed Board Matrix, Patient Transfer, Discharge Station, Stay History",
        "Admit Inpatient, Allocate Bed, Transfer Bed/Ward, Record Daily Rounds, Initiate Discharge, Mark Bed Cleaning Complete, Print Discharge Summary",
        "Patient ID, Admission Type, Admitting Doctor, Ward & Bed selection, Advance deposit amount, Primary diagnosis, Discharge condition",
        "Inpatient Admission Record, Bed Occupancy Sheet, Daily Census Report, Official Discharge Summary, Bed Turnover Log",
        "Coordinates with Nursing Station, Dietetics, Central Billing (auto room rent charges), Housekeeping, and Pharmacy",
        "Bed occupancy predictions, delayed discharge detection, spoken bed availability query ('Available beds chupinchu', 'బెడ్స్ ఎంత ఉన్నాయి?')",
        "Doctor orders admission &rarr; IPD desk allocates ICU-02 &rarr; Patient placed in bed &rarr; Auto daily tariff activated &rarr; Daily care & MAR &rarr; Doctor signs discharge &rarr; Billing cleared &rarr; Bed tagged 'Cleaning'",
        styles
    ))

    # MODULE 7: Doctors
    story.extend(make_module_card(
        "4.7", "Doctors & Clinical Specialists", "Medical Staff Administration",
        "Maintains the hospital clinical specialist registry, professional qualifications, department assignments, OPD consultation schedules, and fee tariffs.",
        "&bull; Comprehensive Specialist Profiles (MD, MS, DM, MCh, Fellowship)<br/>"
        "&bull; Department-wise Doctor Directory with direct contact information<br/>"
        "&bull; Weekly OPD Consultation Schedules with start/end times and max patient caps<br/>"
        "&bull; Consultation Tariff and Follow-up fee configuration<br/>"
        "&bull; Real-time Doctor Availability status toggle (Available, On Duty, In Surgery, On Leave)<br/>"
        "&bull; Performance metrics: daily consultations, patient satisfaction, and admitted cases",
        "Super Admin, Hospital Admin, Doctor, Management",
        "Doctor Registration &rarr; Specialization & Tariff Setup &rarr; OPD Schedule Definition &rarr; Active Duty & Consultation Booking",
        "Doctors Directory Grid, Specialist Profile View, Schedule Config Modal, Tariff Management Drawer, Performance Metrics Tab",
        "Add New Doctor, Edit Profile, Update OPD Timing Schedule, Toggle On-Duty Status, Adjust Consultation Tariff",
        "Doctor Name, Specialization, Medical Council Reg #, Department, Phone, Email, Consultation Fee, OPD Days & Shift Timings, Bio",
        "Hospital Specialist Roster, Doctor Duty Schedule Sheet, Doctor Performance & Productivity Report",
        "Feeds Doctor lists to Appointments, OPD Consultations, IPD Admissions, and Doctor Admin Tariff Settings",
        "Voice doctor lookup ('Show doctors on duty', 'డాక్టర్ల వివరాలు చూపించు'), automated scheduling clash detection",
        "Admin adds cardiologist &rarr; Sets OPD hours (Mon-Fri 9am-1pm) & tariff ($800) &rarr; Doctor appears on appointment booking calendar",
        styles
    ))

    # MODULE 8: Nursing
    story.extend(make_module_card(
        "4.8", "Nursing Station & Care Management", "Nursing Services",
        "Comprehensive inpatient nursing station managing nurse duty rosters, assigned patient care plans, electronic Medication Administration Record (MAR), vitals charting, and shift handovers.",
        "&bull; Nurse Duty Shift Management (Morning, Evening, Night Shifts)<br/>"
        "&bull; Inpatient Nurse-to-Patient Assignment Matrix<br/>"
        "&bull; Electronic Medication Administration Record (e-MAR) with dosage timers and due alerts<br/>"
        "&bull; Graphic Vital Signs Monitoring (BP, Pulse, SpO2, Temperature, Pain Scale)<br/>"
        "&bull; Structured Clinical Nursing Care Notes (SOAP format)<br/>"
        "&bull; Shift Handover Log with patient acuity notes and pending tasks<br/>"
        "&bull; Bedside Emergency Reporting Modal with instant doctor alert callout",
        "Nurse, Doctor, Hospital Admin, Super Admin",
        "Shift Login &rarr; Inpatient Review &rarr; Vitals Measurement &rarr; e-MAR Medication Administration &rarr; Nursing Care Notes &rarr; Shift Handover",
        "Nursing Dashboard, Assigned Inpatients, Nursing Tasks List, e-MAR Station, Vital Signs Chart, Nursing Notes Desk, Shift Handover Console",
        "Record Vitals, Administer Scheduled Medication, Check-off Nursing Task, Log Shift Handover, Trigger Bedside Emergency Alarm",
        "Vitals parameters, Medication dosage confirmed, Administration time, Nurse digital signature, Shift handover notes, Task status",
        "e-MAR Administration Sheet, 24-Hour Vitals Flowsheet, Shift Handover Summary Report, Nursing Care Plan Document",
        "Directly executes Pharmacy prescriptions in e-MAR, alerts IPD doctors of abnormal vitals, syncs with Housekeeping for linen/cleaning",
        "Proactive missed medication alerts, critical vital sign anomaly alarms, hands-free voice nursing task queries",
        "Nurse Kavitha logs in for Morning Shift &rarr; Reviews assigned 6 patients &rarr; Checks e-MAR for 09:00 AM IV Antibiotic &rarr; Administers drug & signs MAR &rarr; Takes vitals &rarr; Logs handover at 02:00 PM",
        styles
    ))

    story.append(PageBreak())

    # MODULE 9: Laboratory (LIS)
    story.extend(make_module_card(
        "4.9", "Clinical Laboratory Information System (LIS)", "Pathology & Diagnostics",
        "Full-featured Laboratory Information System (LIS) handling the complete analytical diagnostic specimen lifecycle from physician test requisition and barcode accessioning to automated result entry, panic value alerts, pathologist verification, and official report release.",
        "&bull; Dedicated Specimen Lifecycle: Order &rarr; Phlebotomy & Sample Collection &rarr; Barcode Labeling &rarr; Lab Sample Intake &rarr; Analyzer Processing &rarr; Result Entry & Reference Ranges &rarr; Pathologist Verification &rarr; Report Release<br/>"
        "&bull; Comprehensive Pathology Test Master (CBC, LFT, KFT, Lipid Profile, HbA1c, Thyroid Panel, Urine Routine, Blood Cultures, Coagulation)<br/>"
        "&bull; Master Test Packages (Comprehensive Health Check, Cardiac Risk Panel, Executive Wellness)<br/>"
        "&bull; Automated Panic / Critical Alert Thresholds with visual red flashing warnings<br/>"
        "&bull; Sample Tracking Timeline with specimen tube types (EDTA, Serum, Sodium Fluoride, Heparin)<br/>"
        "&bull; Multi-tier Pathologist digital signoff and verification queue<br/>"
        "&bull; Integrated Diagnostic Billing Tab with test-wise pricing and official receipt printing",
        "Lab Technician, Pathologist, Doctor, Super Admin, Hospital Admin, Billing Staff",
        "Requisition &rarr; Sample Collection & Barcoding &rarr; Laboratory Intake &rarr; Instrument Processing &rarr; Result Entry &rarr; Panic Review &rarr; Pathologist Signoff &rarr; Report Print",
        "LIS Dashboard, Lab Orders Queue, Sample Collection Desk, Sample Intake, Sample Tracking Timeline, Test Processing, Result Verification, Critical Results Center, Completed Reports Archive, Lab Test Master, Lab Packages, Lab Billing",
        "Accession Sample, Print Barcode Tube Label, Enter Test Results, Flag Panic Value, Verify & Signoff Report, Print Verified Lab Report, Settle Lab Bill",
        "Patient ID, Test ID, Sample Tube Barcode, Collection Date/Time, Numeric/Text Result values, Reference range units, Pathologist remarks",
        "Official NABL/ISO Format Lab Diagnostic Report with Reference Ranges & Pathologist Signature, Barcode Specimen Labels, Lab Turnaround Time (TAT) Analytics Report, Lab Revenue Summary",
        "Receives CPOE orders from OPD, IPD, and Emergency; pushes completed verified results directly to Patient History; automatically posts test charges to Central Billing",
        "Critical panic value auto-broadcast to Doctor header, automated normal/abnormal result color highlighting, Telugu voice lab status ('Lab reports చూపించు')",
        "Dr. Sneha orders CBC in OPD &rarr; Patient goes to Phlebotomy &rarr; Tech collects EDTA tube & scans barcode &rarr; Analyzer runs sample &rarr; Tech enters Hemoglobin (8.2 g/dL) &rarr; System flags low anemia &rarr; Pathologist verifies & signs &rarr; PDF released to patient & doctor",
        styles
    ))

    # MODULE 10: Diagnostics & Radiology (RIS/PACS)
    story.extend(make_module_card(
        "4.10", "Diagnostics & Radiology (RIS / PACS)", "Diagnostic Imaging",
        "Enterprise Radiology Information System (RIS) and Picture Archiving and Communication System (PACS) interface managing imaging orders, modality scheduling, patient radiation safety preparation, DICOM study association, and radiologist diagnostic reporting.",
        "&bull; Dedicated Imaging Lifecycle: Study Order &rarr; Modality Scheduling & Slot Pick &rarr; Patient Check-In & Safety Prep &rarr; Modality Worklist &rarr; DICOM Image Acquisition & PACS Association &rarr; Radiologist Diagnostic Findings &rarr; Signoff Verification &rarr; Report Release<br/>"
        "&bull; Modality Management (X-Ray, Multi-Slice CT Scanner, 3T MRI, Ultrasound / Doppler, Mammography, PET-CT)<br/>"
        "&bull; Patient Preparation Protocols (Fasting, Contrast Allergy Screen, Serum Creatinine Check, Metal Implant Clearance)<br/>"
        "&bull; DICOM Study Viewer integration with secure study access links<br/>"
        "&bull; Structured Radiologist Reporting Templates with Clinical History, Technique, Findings, and Impression<br/>"
        "&bull; Critical Imaging Findings Callout Center (e.g., Acute Intracranial Hemorrhage, Tension Pneumothorax)<br/>"
        "&bull; Modality Equipment Maintenance, Calibration logs, and Radiation Safety Badges",
        "Radiologist, Radiology Technician, Doctor, Super Admin, Hospital Admin, Billing Staff",
        "Imaging Requisition &rarr; Modality Appointment Booking &rarr; Safety Screening &rarr; Scan Acquisition &rarr; DICOM Archive &rarr; Radiologist Transcription &rarr; Verification &rarr; Release",
        "RIS Dashboard, Study Orders Queue, Modality Scheduling Grid, Patient Preparation Station, Modality Worklist, DICOM & Studies View, Radiology Reporting Desk, Report Verification Queue, Critical Findings Hub, Completed Reports Archive, Modality Master, Radiology Billing",
        "Schedule Modality Slot, Verify Safety Checklist, Acquire Scan, Link DICOM Study, Transcribe Radiologist Findings, Flag Critical Emergency Finding, Signoff Report, Print Radiology Report",
        "Patient ID, Modality Type (CT/MRI/X-Ray), Body Part / Protocol, Clinical Indication, Contrast Used (Yes/No), Creatinine Value, Radiologist Findings & Impression",
        "Official Formal Radiology Report with Modality Protocol, Findings, Impression, Radiologist Signature & DICOM Access Link; Modality Utilization Report; Radiation Safety Log",
        "Receives imaging requisitions from OPD, IPD, and Emergency; links image findings to Patient Dossier; automatically pushes imaging fees to Central Billing",
        "AI critical finding alert broadcast, automated report template pre-filling, voice radiology queries ('Show pending MRI reports', 'రేడియాలజీ ఓపెన్ చేయి')",
        "ER Doctor orders CT Brain STAT &rarr; Rad Tech prepares patient (metal screen clear) &rarr; Patient scanned on CT-01 &rarr; DICOM linked &rarr; Radiologist reads acute subdural hematoma &rarr; Flags Critical Alert &rarr; Report released to trauma team in under 15 minutes",
        styles
    ))

    # MODULE 11: Pharmacy
    story.extend(make_module_card(
        "4.11", "Pharmacy Management & Drug POS", "Pharmacy Services",
        "Comprehensive hospital retail and inpatient pharmacy system handling prescription fulfillment, point-of-sale (POS) cashiering, multi-warehouse stock inventory, First-Expiry First-Out (FEFO) batch tracking, and purchase orders.",
        "&bull; Digital Prescription Queue with one-click dispensing for OPD and IPD orders<br/>"
        "&bull; Fast Point of Sale (POS) Counter with barcode barcode scanning and instant bill calculation<br/>"
        "&bull; Master Medicine Database with generic names, drug categories, strengths, manufacturers, and reorder levels<br/>"
        "&bull; Multi-Batch Stock Ledger with Batch Number, Expiry Date, MRP, Purchase Rate, and Unit Quantities<br/>"
        "&bull; First-Expiry First-Out (FEFO) automated batch prioritization to prevent drug wastage<br/>"
        "&bull; Proactive Expiration and Low Stock Warnings (Near Expiry <90 days, Expired, Below Reorder Level)<br/>"
        "&bull; Goods Received Note (GRN) Stock-In, Supplier Management, and Purchase Order (PO) workflows<br/>"
        "&bull; Patient Pharmacy History and Medicine Return/Credit Note management",
        "Pharmacist, Hospital Admin, Super Admin, Doctor, Billing Staff",
        "Rx Inflow &rarr; Batch Selection (FEFO) &rarr; Interaction Check &rarr; POS Bill & Tax &rarr; Cash/Card Collection &rarr; Drug Labeling & Dispensing",
        "Pharmacy Dashboard, Prescription Queue, Dispensing Desk, Counter POS, Medicine Master, Inventory Stock, Stock In (GRN), Stock Movement Ledger, Low Stock Center, Expiry Management, Supplier Master, Purchase Orders, Returns",
        "Dispense Prescription, Barcode Scan POS Sale, Create Stock In GRN, Issue Purchase Order, Process Medicine Return, Print Pharmacy Receipt, Trigger Low Stock Reorder",
        "Prescription ID, Medicine ID, Batch Number, Quantity, Dispensing Instructions, Unit Price, GST %, Payment Method, Supplier Invoice #",
        "Itemized Pharmacy Tax Invoice & Cash Receipt, Drug Label Instructions Slip, Stock Valuation & Expiry Audit Report, Purchase Order Slip",
        "Receives e-Prescriptions from OPD and IPD; updates patient longitudinal medication history; syncs directly with Central Billing and Finance ledgers",
        "Automated stock depletion predictions, proactive near-expiry alerts, spoken low stock queries ('Show low stock medicines', 'మందుల నిల్వ చూపించు')",
        "Patient brings Rx slip &rarr; Pharmacist selects prescription &rarr; System picks nearest expiry batch (FEFO) &rarr; Calculates bill ($450) &rarr; Patient pays via UPI &rarr; Pharmacist dispenses labeled medicines with dosage instructions",
        styles
    ))

    # MODULE 12: Diet & Nutrition
    story.extend(make_module_card(
        "4.12", "Clinical Diet & Nutrition Management", "Dietetics & Nutrition",
        "Manages clinical inpatient diet planning, therapeutic dietary formulations, daily kitchen meal preparation schedules, meal delivery tracking, and nutritional intake monitoring.",
        "&bull; Inpatient Diet Profile linked to primary clinical diagnosis and comorbidities (e.g., Diabetes, Hypertension, Renal Failure)<br/>"
        "&bull; Master Therapeutic Diet Plans (Regular Normal, Diabetic 1500 kcal, Low Sodium Renal, High Protein, Liquid Clear, NPO/Fasting, Soft Bland)<br/>"
        "&bull; Daily Diet Chart Generation for Breakfast, Mid-Morning, Lunch, Evening Snack, and Dinner<br/>"
        "&bull; Hospital Food & Nutrient Database with Calorie, Protein, Carbohydrate, Fat, and Fiber values<br/>"
        "&bull; Kitchen Meal Preparation and Tray Delivery tracking (Scheduled, Prepared, Dispatched, Delivered, Consumed, Missed)<br/>"
        "&bull; Special Diet Allergy and Dietary Restriction Safeguards (e.g., Gluten-Free, Lactose-Free, Pure Vegetarian, Halal)",
        "Dietitian, Nurse, Doctor, Super Admin, Hospital Admin",
        "Inpatient Admission Assessment &rarr; Diet Formulation &rarr; Kitchen Schedule Generation &rarr; Meal Tray Prep & Dispatch &rarr; Bedside Delivery & Monitoring",
        "Diet Dashboard, Diet Plans Directory, Daily Diet Chart, Meal Schedule & Status, Diet Monitoring Desk, Food Database, Special Diets, Review History, Diet Reports",
        "Create Diet Chart, Assign Therapeutic Plan, Update Meal Dispatch Status, Log Bedside Intake %, Record Dietary Consultation Notes, Print Kitchen Tray Slips",
        "Patient ID, Ward & Bed #, Diet Type, Calorie Target, Meal Times, Food Items, Food Allergies, Special Instructions (e.g., Low Salt)",
        "Patient Daily Diet Schedule Chart, Hospital Kitchen Bulk Food Requisition, Ward Meal Distribution Sheet, Nutritional Compliance Audit",
        "Receives admitted patients from IPD; alerts Nursing station of NPO fasting status prior to surgeries; syncs with Doctor orders",
        "Calorie intake calculations, missed meal alerts, voice diet queries ('Show today's diet plans', 'డైట్ ప్లాన్స్ చూపించు')",
        "Dietitian assesses post-op cardiac patient &rarr; Prescribes 'Low Sodium Diabetic 1600 kcal' &rarr; Kitchen prepares meal tray with barcode label &rarr; Staff delivers to Room 304 &rarr; Nurse verifies consumption",
        styles
    ))

    story.append(PageBreak())

    # MODULE 13: Billing & Finance
    story.extend(make_module_card(
        "4.13", "Central Billing, Invoicing & Cashiering", "Accounts & Finance",
        "Enterprise revenue cycle management (RCM) platform providing consolidated patient billing, automated departmental charge capture, advance management, payment cashiering, official receipts, and financial reconciliation.",
        "&bull; Departmental Charge Capture: Automatically pulls billable charges from OPD, IPD, Bed Rent, LIS Labs, RIS Scans, Pharmacy, and Surgery<br/>"
        "&bull; Central Billing Workspace for manual and automated invoice itemization<br/>"
        "&bull; Multi-Mode Payment Processing (Cash, Credit/Debit Card, UPI / QR, Net Banking, Cheque, Insurance TPA Credit)<br/>"
        "&bull; Inpatient Advance Deposit tracking and Final Discharge Bill reconciliation<br/>"
        "&bull; Official Printable Tax Invoices and Stamp-Signed Cash Receipts with GST breakdowns<br/>"
        "&bull; Cash Counter Shift Management with Day-End drawer balancing and cashier handovers<br/>"
        "&bull; Authorized Discounts, Concessions, and Refund voucher workflows<br/>"
        "&bull; Hospital Service Master & Tariff configuration across all medical departments",
        "Billing Staff, Hospital Admin, Super Admin, Management",
        "Service Delivery & Charge Capture &rarr; Central Invoice Generation &rarr; Payment Mode Split & Cashiering &rarr; Official Receipt Printing &rarr; Shift Closure",
        "Billing Dashboard, Patient Account Ledger, Central Billing Workspace, Invoices Ledger, Payments & Receipts, Department Charge Capture, Cash Counter & Shifts, IPD Advances, Insurance TPA Desk, Refunds, Discounts, Service Master, Reconciliation, Reports",
        "Create Central Bill, Collect Payment, Print Official Receipt, Collect IPD Advance, Process Approved Refund, Apply Discount, Close Cashier Shift",
        "Patient ID, Encounter Type, Service Items & Tariffs, Advance Deductions, Discount Amount & Approval Code, Payment Mode, Cash Received",
        "Consolidated Final Hospital Bill (Detailed & Summary), Official Cashier Payment Receipt, IPD Advance Deposit Receipt, Daily Shift Settlement Report, Departmental Revenue Audit",
        "Consolidates charges from all hospital clinical modules (OPD, IPD, LIS, RIS, Pharmacy, Blood Bank, Diet); interfaces with Insurance claims",
        "Automated billing discrepancy detection, real-time unbilled services alerts, spoken financial queries ('Show today's revenue', 'బిల్లింగ్ కలెక్షన్ ఎంత?')",
        "Inpatient is ready for discharge &rarr; Billing officer opens patient ledger &rarr; System aggregates bed rent ($3000), surgery ($15000), lab ($1200), pharmacy ($800) &rarr; Deducts $5000 advance &rarr; Patient pays balance &rarr; Officer prints final receipt & clears discharge",
        styles
    ))

    # MODULE 14: Insurance & TPA
    story.extend(make_module_card(
        "4.14", "Insurance & TPA Claims Lifecycle", "Insurance & TPA Desk",
        "Comprehensive health insurance and Third-Party Administrator (TPA) claims management platform handling cashless policy verifications, pre-authorizations, claim document collation, query handling, and financial settlements.",
        "&bull; Empanelled Insurance Providers & TPA Master (Star Health, HDFC ERGO, ICICI Lombard, Medi Assist, Paramount TPA)<br/>"
        "&bull; Master Insurance Plans with co-pay rules, room rent capping, and deductible definitions<br/>"
        "&bull; Patient Insurance Policy Registration and live eligibility verification<br/>"
        "&bull; Pre-Authorization Request lifecycle with initial approved amounts, query letters, and enhanced approvals<br/>"
        "&bull; Digital Claim Dossier Packaging with automatic attachment of Discharge Summary, Itemized Bills, Lab/Rad Reports, and Pharmacy Invoices<br/>"
        "&bull; Claim Adjudication & Settlement tracking (Submitted, Under Review, Approved, Query Raised, Settled, Rejected)<br/>"
        "&bull; Disallowed amount tracking and patient co-payment settlement workflows",
        "Insurance Coordinator, Billing Staff, Hospital Admin, Super Admin, Management",
        "Patient Policy Registration &rarr; Verification &rarr; Pre-Auth Submission &rarr; Initial Approval &rarr; Treatment & Discharge &rarr; Final Claim Submission &rarr; Settlement Reconciliation",
        "Insurance Dashboard, Insurance Providers, Insurance Plans, Patient Insurance Registration, Policy Verification, Pre-Authorization, Insurance Claims, Claim Documents, Claim Processing & Settlement, Insurance Reports",
        "Register Patient Policy, Submit Pre-Auth Request, Attach Clinical Documents, Log TPA Approval, Submit Final Claim, Reconcile Settlement Remittance",
        "Patient ID, Insurance Provider, Policy #, TPA Member ID, Sum Insured, Pre-Auth Request Amount, Clinical Diagnosis, Estimated Length of Stay, Discharge Summary attachment",
        "Pre-Authorization Application Form, Cashless Claim Submission Package, TPA Settlement Remittance Sheet, Insurance Outstanding & Aging Report",
        "Directly integrates with IPD Admissions, Central Billing (split payment logic), and Medical Records (Discharge Summary & Diagnostic Reports)",
        "Automatic pending claim aging warnings, pre-auth query alerts, spoken insurance status queries ('Show pending claims', 'ఇన్సూరెన్స్ క్లెయిమ్స్ చూపించు')",
        "Insured patient arrives &rarr; Insurance desk registers policy &rarr; Submits pre-auth for $50,000 &rarr; TPA approves initial $35,000 cashless &rarr; Patient undergoes treatment &rarr; At discharge, final bill ($48,000) submitted &rarr; TPA settles $45,000, patient pays $3,000 co-pay",
        styles
    ))

    # MODULE 15: Ambulance
    story.extend(make_module_card(
        "4.15", "Ambulance Fleet & Emergency Dispatch", "Support & Transport Services",
        "Manages the hospital emergency vehicle fleet, 108/emergency call intake, GPS driver dispatch, paramedic transit care, and emergency trauma arrival coordination.",
        "&bull; Real-time Ambulance Fleet Status Tracking (Available, Dispatched, On Duty, Maintenance)<br/>"
        "&bull; Emergency Call Intake Form with caller details, pickup location, and emergency nature tagging<br/>"
        "&bull; One-Click Emergency Vehicle Dispatch with driver and paramedic team assignment<br/>"
        "&bull; Vehicle Equipment Categorization (Advanced Life Support - ALS, Basic Life Support - BLS, Patient Transport)<br/>"
        "&bull; Live GPS transit status and estimated arrival time (ETA) monitoring<br/>"
        "&bull; Paramedic in-transit clinical vitals logging and advance trauma bay alert broadcast",
        "Ambulance Staff, Emergency Doctor, Receptionist, Hospital Admin, Super Admin",
        "Emergency Call &rarr; Location & Triage Capture &rarr; Nearest Vehicle Dispatch &rarr; Paramedic Transit Care &rarr; Hospital Bay Alert &rarr; Patient Intake",
        "Ambulance Fleet Dashboard, Active Dispatch Map, Emergency Call Intake Drawer, Vehicle Maintenance Ledger, Transit Log",
        "Dispatch Ambulance, Update Vehicle Status, Log Caller Emergency, Transmit Advance ER Notification, Mark Trip Completed",
        "Caller Name, Phone, Pickup Address, Emergency Type (Cardiac, Trauma, Stroke, Respiratory), Assigned Ambulance, Driver Name, Fuel/Mileage",
        "Ambulance Trip Log Sheet, Emergency Transit Clinical Flowsheet, Fleet Fuel & Maintenance Report",
        "Directly triggers Emergency & Trauma module alarms and reserves ER resuscitation bays prior to vehicle arrival",
        "Emergency route optimization suggestions, voice vehicle status queries ('Show available ambulances', 'అంబులెన్స్ వివరాలు')",
        "Emergency caller reports cardiac arrest &rarr; Dispatcher selects ALS Ambulance-01 &rarr; Paramedic reaches location & starts CPR &rarr; Transmits advance alert to ER &rarr; Trauma team waits at bay",
        styles
    ))

    # MODULE 16: Blood Bank
    story.extend(make_module_card(
        "4.16", "Blood Bank & Transfusion Medicine", "Transfusion Medicine",
        "Comprehensive blood transfusion center module covering donor registration, phlebotomy, serology quarantine screening, component fractionation, inventory management, cross-matching, and safe bedside release.",
        "&bull; Complete Transfusion Lifecycle: Donor Registry &rarr; Phlebotomy &rarr; Serology Testing (HIV, Hep B/C, Syphilis, Malaria) & Quarantine &rarr; Component Fractionation (Whole Blood, PRBC, FFP, Platelets, Cryoprecipitate) &rarr; First-Expiry First-Out (FEFO) Inventory &rarr; Patient Blood Requisition &rarr; Serological Cross-Matching &rarr; Safety Issue &rarr; Bedside Transfusion<br/>"
        "&bull; Real-time Blood Stock Inventory by Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-) and Component Type<br/>"
        "&bull; Automated Blood Storage Temperature Logging (2-6°C for PRBC, -30°C for FFP, 20-24°C Agitator for Platelets)<br/>"
        "&bull; Emergency Cross-Match and Compatibility testing desk<br/>"
        "&bull; Blood Bag Barcoding, Expiration Tracking, and Safe Disposal logging<br/>"
        "&bull; Integrated Transfusion Billing with blood processing fee capture",
        "Blood Bank Staff, Pathologist, Doctor, Nurse, Super Admin, Hospital Admin, Billing Staff",
        "Donor Intake &rarr; Blood Donation &rarr; Serology Testing &rarr; Component Separation &rarr; Stock Storage &rarr; Requisition & Cross-Match &rarr; Issue &rarr; Transfusion",
        "Blood Bank Dashboard, Donor Management, Donation Registration, Screening & Quarantine, Component Processing, Blood Inventory, Blood Requests, Cross-Match Desk, Blood Issue Desk, Transfusion Management, Storage Logs, Blood Bank Billing, Reports",
        "Register Donor, Record Blood Collection, Enter Serology Screening Results, Separate Components, Cross-Match Patient Sample, Issue Blood Bag, Log Adverse Transfusion Reaction",
        "Donor Demographics, Blood Group, Hemoglobin %, Vitals, Unit Bag Barcode, Serology Test Status (Negative/Reactive), Patient Requisition #, Cross-Match Result",
        "Blood Bank Stock Status Report, Safe Transfusion Release Slip with Bag Barcode & Compatibility Matrix, Donor Certificate, Adverse Reaction Audit Report",
        "Fulfills blood requisitions for Emergency, Surgery (OT), and IPD wards; posts blood unit processing charges to Central Billing",
        "Proactive low blood unit alerts, expiration countdown warnings, spoken blood stock queries ('Show O+ blood stock', 'బ్లడ్ బ్యాంక్ స్టాక్ ఎంత?')",
        "Surgeon orders 2 units PRBC O+ for OT &rarr; Blood bank verifies requisition &rarr; Performs Coombs cross-match with patient serum &rarr; Verified compatible &rarr; Releases bag at 4°C with dual-signoff slip &rarr; Nurse transfuses at bedside",
        styles
    ))

    story.append(PageBreak())

    # MODULE 17: Housekeeping
    story.extend(make_module_card(
        "4.17", "Housekeeping & Facilities Management", "Facilities & Operations",
        "Manages hospital sanitization, patient discharge bed turnover, biomedical deep-cleaning, environmental safety checklists, and facility maintenance work orders.",
        "&bull; Automated Discharge Bed Turnover Queue: Triggers instant cleaning tasks upon patient discharge in IPD<br/>"
        "&bull; Daily Environmental Cleaning Checklists for Wards, ICUs, Operation Theatres, and Public Lounges<br/>"
        "&bull; Bio-hazard, Isolation, and Terminal Infection Control cleaning protocols<br/>"
        "&bull; Facility Asset Maintenance Work Orders (HVAC, Medical Oxygen Pipelines, Electrical Gensets, Plumbing, Elevators)<br/>"
        "&bull; Staff assignment, task priority levels (Critical, High, Medium, Low), and completion timestamps<br/>"
        "&bull; Asset Maintenance Schedules and Biomedical Engineering calibration tracking",
        "Housekeeping Staff, Nurse, Hospital Admin, Super Admin",
        "Discharge Trigger / Work Order &rarr; Cleaning Task Assignment &rarr; Sanitation Execution & Checklist &rarr; Nurse Inspection &rarr; Bed Released to Available",
        "Housekeeping Dashboard, Bed Turnover Queue, Maintenance Requests, Facility Assets, Cleaning Schedules, Work Orders View",
        "Create Cleaning Task, Assign Janitor, Complete Sanitation Checklist, Log Maintenance Breakdown, Verify Bed Ready, Print Work Order",
        "Location / Ward & Bed #, Cleaning Type (Routine, Terminal, Biohazard), Priority, Assigned Staff, Asset ID, Breakdown Description",
        "Bed Turnover TAT Report, Hospital Sanitization Compliance Log, Asset Maintenance History Report",
        "Directly unblocks IPD Bed Management once cleaning is verified; handles nurse-reported facility tickets",
        "Delayed cleaning alerts for high-demand ICU beds, spoken housekeeping status queries ('Show pending cleaning tasks', 'హౌస్‌కీపింగ్ స్టేటస్')",
        "Patient discharged from Room 204 &rarr; System creates high-priority cleaning task &rarr; Housekeeping completes 12-point sanitization &rarr; Clicks 'Complete' &rarr; Bed automatically turns Green 'Available' on IPD Bed Board",
        styles
    ))

    # MODULE 18: HR & Employees
    story.extend(make_module_card(
        "4.18", "Human Resources (HR) & Staff Rostering", "Human Resources",
        "Manages hospital employee directories, biometric attendance logs, departmental shift rostering, staff leave requests, payroll processing, and statutory compliance.",
        "&bull; Comprehensive Hospital Employee Directory across Clinical, Nursing, Paramedical, and Admin staff<br/>"
        "&bull; Departmental Shift Scheduling (Morning, Evening, Night, General Shifts)<br/>"
        "&bull; Biometric Attendance Tracking with Present, Late, Half-Day, and Absent calculations<br/>"
        "&bull; Multi-tier Leave Management (Casual, Sick, Earned, Maternity) with approval workflows<br/>"
        "&bull; Role-fenced Monthly Payroll Processing with Basic Pay, HRA, Allowances, PF, ESI, and Tax deductions<br/>"
        "&bull; Statutory Regulatory Compliance and Medical License renewal tracking",
        "Super Admin, Hospital Admin, Management, HR Staff",
        "Employee Onboarding &rarr; Shift Assignment &rarr; Biometric Daily Attendance &rarr; Leave Requests & Approvals &rarr; Monthly Payroll Generation & Pay Slips",
        "Employees Directory, Attendance Roster, Leave Management, Payroll Processing, Compliance & Licenses",
        "Add Employee, Record Shift Roster, Approve/Reject Leave Request, Run Monthly Payroll, Download Pay Slips, Update Medical License Info",
        "Employee Name, Designation, Department, Date of Joining, Shift Type, Basic Salary, Allowances, Bank Account Info, Medical Council Reg #",
        "Monthly Staff Payroll Summary Sheet, Employee Pay Slip, Departmental Attendance Flowsheet, Expiring Medical License Audit",
        "Provides active medical staff lists to Doctors and Nursing modules; enforces RBAC role assignments across HMS",
        "Automated shift shortage warnings, license expiration reminders, voice staff queries ('Show staff on duty', 'సిబ్బంది హాజరు వివరాలు')",
        "HR Manager opens monthly payroll &rarr; System aggregates 30-day attendance & approved leaves &rarr; Calculates gross and deductions &rarr; Generates encrypted pay slips for all 150 employees",
        styles
    ))

    # MODULE 19: Support Desk
    story.extend(make_module_card(
        "4.19", "Help & IT Support Desk", "Operations & IT Support",
        "Hospital internal ticketing system and knowledge base for reporting IT hardware, software, biomedical equipment, and operational issues with SLA tracking.",
        "&bull; Multi-category Internal Ticket Logging (HIS Software, Hardware/PC, Network/WiFi, Biomedical Equipment, Facility Services)<br/>"
        "&bull; 4-Tier Ticket Priority Classification: Critical, High, Medium, Low with SLA timers<br/>"
        "&bull; Interactive Ticket Resolution Thread with public staff replies and private internal IT notes<br/>"
        "&bull; Searchable Hospital Knowledge Base (KB) Articles for SOPs, printer setups, and HIS troubleshooting<br/>"
        "&bull; IT Support Analytics: Average Resolution Time, SLA Breaches, and Departmental Issue Heatmap",
        "All Hospital Staff, IT Support, Super Admin, Hospital Admin",
        "Issue Encounter &rarr; Ticket Creation &rarr; IT Assignment &rarr; Troubleshooting & Conversation &rarr; Resolution & User Confirmation",
        "Support Tickets List, Knowledge Base (KB), Support Analytics, Create Ticket Modal, Ticket Detail Thread",
        "Create Support Ticket, Assign IT Engineer, Post Reply / Internal Note, Update Ticket Status, Publish KB Article",
        "Ticket Title, Category, Priority, Department, Workstation Location, Detailed Issue Description, File Attachments",
        "Support Ticket Resolution Slip, IT SLA Compliance Report, Departmental IT Issue Summary",
        "Enables staff across all 24 modules to instantly raise issues without leaving their clinical workspace",
        "Intelligent KB article suggestions based on ticket text, spoken IT ticket creation ('Open support ticket for printer', 'సపోర్ట్ టికెట్ ఓపెన్ చేయి')",
        "Nurse cannot print prescription &rarr; Opens Support Desk &rarr; Logs 'Pharmacy Printer Offline' (High) &rarr; IT Engineer gets notified &rarr; Resolves network spooler &rarr; Closes ticket in 10 minutes",
        styles
    ))

    # MODULE 20: Reports
    story.extend(make_module_card(
        "4.20", "Reports & Executive Analytics Suite", "Executive Intelligence",
        "Enterprise business intelligence and clinical analytics engine featuring 18+ specialized reporting tabs with dynamic date filtering, visual graphs, and Excel/PDF exports.",
        "&bull; 18+ Dedicated Report Domains: Executive Dashboard, AI Report Assistant, Patient Master, OPD Consultations, Appointments, IPD Census, Bed Occupancy, Nursing Care, Diagnostic Lab, Radiology Studies, Pharmacy Retail, Blood Bank, Central Billing, Payment Collections, Financial Analytics, Doctor Productivity, Emergency & Discharge, Operational Analytics, and Audit Logs<br/>"
        "&bull; Interactive AI Report Assistant for natural language querying ('What was our cardiology revenue last month?')<br/>"
        "&bull; Multi-parameter filtering: Date ranges (Today, 7D, 30D, Custom), Departments, Doctors, Payment Modes<br/>"
        "&bull; High-fidelity vector charts and export capabilities to formatted CSV, Excel, and printable PDF",
        "Super Admin, Hospital Admin, Management, Billing Staff",
        "Domain Selection &rarr; Filter Parameter Setup &rarr; Data Engine Query &rarr; Visual Graph & Table Rendering &rarr; Export / Print",
        "18+ Dedicated Report Views (Executive Overview, Clinical Reports, Operational Reports, Financial Analytics, Audit Trails)",
        "Filter Data by Date/Dept, Query AI Report Assistant, Export to Excel/CSV, Print Official PDF Report, Drill-down to Source Encounter",
        "Start Date, End Date, Department ID, Doctor ID, Payment Status, Patient Category filters",
        "Executive Monthly Business Review (MBR) Dossier, NABH Clinical Quality Indicator Reports, Financial Collection Sheets, Turnaround Time (TAT) Analytics",
        "Aggregates data directly from all clinical, diagnostic, pharmacy, operational, and financial modules",
        "AI natural language statistical synthesis, automated outlier detection, voice report queries ('Show financial reports', 'రిపోర్ట్స్ చూపించు')",
        "CEO accesses Reports Suite &rarr; Selects 'Financial Analytics' for Q3 &rarr; Reviews $1.2M revenue vs $850k expenses &rarr; Clicks 'Export PDF' for board meeting presentation",
        styles
    ))

    story.append(PageBreak())

    # MODULE 21: Notifications
    story.extend(make_module_card(
        "4.21", "System Notifications & Alert Command", "Hospital-wide Alerts",
        "Centralized real-time notification gateway broadcasting panic clinical values, emergency trauma arrivals, vitals abnormalities, insurance pre-auth updates, and system activities.",
        "&bull; Real-time Multi-Category Alert Streams (Panic Lab Values, Emergency Trauma, Insurance Pre-Auth, Vitals Alarms, Operational Dispatches)<br/>"
        "&bull; Severity-based visual and audible alarms (Critical Red, High Warning, Medium Info)<br/>"
        "&bull; One-Click Alert Acknowledgment and audit logging<br/>"
        "&bull; Direct Deep-Link Navigation: Clicking an alert routes immediately to the offending patient chart or order<br/>"
        "&bull; Filterable by Alert Type (Critical Only, Emergency Only, Insurance Only, All Notifications)",
        "All Staff Roles (Filtered according to user role permissions)",
        "System Trigger Event &rarr; Alert Rule Evaluation &rarr; Real-time Broadcast & Chime &rarr; Staff Acknowledgment &rarr; Direct Action",
        "Notifications Command Center, Live Activity Stream, Header Alert Badge Dropdown, Sound Setting Drawer",
        "Acknowledge Alert, Clear Notification, Navigate to Source Chart, Filter Notifications by Severity, Configure Chime Sound",
        "Alert Category, Severity Level, Target User Role, Patient Reference ID, Event Payload",
        "Hospital Critical Incidents Log, Panic Value Notification Audit Trail, Alert Response Time Report",
        "Receives events from LIS (panic results), RIS (critical findings), Emergency (trauma intake), Nursing (abnormal vitals), and Insurance (TPA queries)",
        "Proactive clinical risk prioritization, text-to-speech spoken alerts, voice alert queries ('Show critical alerts', 'నోటిఫికేషన్లు చూపించు')",
        "Lab enters Potassium 6.8 mmol/L (Severe Hyperkalemia) &rarr; Notification engine triggers red flashing alarm on Doctor's screen &rarr; Doctor clicks alert &rarr; Immediately opens patient prescription desk to order calcium gluconate",
        styles
    ))

    # MODULE 22: Administration & Settings
    story.extend(make_module_card(
        "4.22", "Hospital Administration & Governance Hub", "Executive Leadership",
        "Master governance center for configuring hospital profiles, departments, user credentials, RBAC security roles, doctor consultation tariffs, ward bed topologies, tax rules, and immutable audit logs.",
        "&bull; Hospital Identity Configuration (Name, Address, Registration #, NABH Accreditation, Logo, Contact Email/Phone)<br/>"
        "&bull; User Directory and RBAC Permission Matrix configuration across all 15+ roles<br/>"
        "&bull; Clinical Department & Head of Department (HOD) directory<br/>"
        "&bull; Ward & Bed Setup (General, Semi-Private, Deluxe, ICU, HDU, Isolation) with standard daily rates<br/>"
        "&bull; Master Tariffs for Consultations, Lab Tests, Radiology Scans, Surgery Packages, and Pharmacy Tax Rules<br/>"
        "&bull; Immutable Security Audit Logs tracking every login, chart view, prescription edit, bill creation, and refund",
        "Super Admin, Hospital Admin",
        "System Policy Setup &rarr; Organization Hierarchy Definition &rarr; Tariff & Ward Mapping &rarr; User RBAC Provisioning &rarr; Continuous Audit Monitoring",
        "Admin Cockpit, Hospital Profile, User Directory, Roles & RBAC Matrix, Departments & HODs, Staff & Rosters, Doctor Tariffs, Wards & Beds Setup, Clinical Settings, Billing & Tax Config, Notification Gateways, Master Data, Immutable Audit Logs, System Settings Hub",
        "Create New User Account, Modify RBAC Permissions, Define Ward & Room Tariffs, Update Tax (GST) Slabs, Export System Audit Log, Backup Configuration",
        "Hospital Profile Info, User Credentials, Role Matrix checkboxes, Department Codes, Ward Names & Bed Counts, Service Code & Tariff Pricing, Audit Log Filters",
        "Hospital Master Tariff Book, User Security Access Matrix Report, Immutable Security Audit Log Export (CSV/PDF), System Configuration Backup",
        "Governs permissions, tariffs, workflows, and numbering sequences across all other 23 modules",
        "Automated security anomaly alerts, role conflict warnings, voice admin queries ('Open Admin Settings', 'అడ్మిన్ సెట్టింగ్స్ ఓపెన్ చేయి')",
        "Super Admin provisions a new Radiologist &rarr; Assigns 'radiology_technician' role &rarr; Restricts access to billing and HR &rarr; Radiologist logs in with exact scoped permissions",
        styles
    ))

    # MODULE 23: AI Assistant
    story.extend(make_module_card(
        "4.23", "Context-Aware AI Assistant", "Clinical Intelligence",
        "Embedded central artificial intelligence engine that injects active screen context, understands natural language, synthesizes clinical dossiers, searches global hospital records, and detects critical medical risks.",
        "&bull; Context-Aware Route Intelligence: Automatically knows whether the user is in Laboratory, IPD, OPD, Billing, or Emergency and provides relevant suggestions<br/>"
        "&bull; Global Semantic Search across Patients, Appointments, Doctors, Beds, Lab Tests, Medicines, Bills, and Reports<br/>"
        "&bull; Multilingual Natural Language Understanding (Native English, Telugu Script, and Tanglish Mixed)<br/>"
        "&bull; Automatic Phase Navigation: Instantly navigates the user to the requested hospital screen upon voice or text intent<br/>"
        "&bull; Proactive Clinical Risk Alarms: Scans patient vitals and lab results for critical anomalies and displays high-priority action cards<br/>"
        "&bull; AI Action Confirmation Gateways for destructive or sensitive operations (e.g., bed transfers, cancellations)<br/>"
        "&bull; Role-Based AI Safety: Enforces strict permission boundaries so billing staff cannot query clinical summaries and nurses cannot access financial ledgers",
        "All Authorized Hospital Staff (Scoped by Role)",
        "Prompt Input (Text/Voice) &rarr; Context Injection &rarr; Language & Intent Parse &rarr; Route Navigation / Data Query &rarr; AI Response & Vocal Output",
        "Central AI Console, Omnipresent Floating Widget, Conversational Chat Workspace, Proactive Alerts Center, AI Audit Logs",
        "Submit Natural Language Query, Execute Suggested Quick Prompts, Trigger Automatic Navigation, Approve Pending Clinical Action, Copy AI Synthesis",
        "Text query, Voice acoustic stream, Active route path, User role permissions, Confirmation click for sensitive actions",
        "Formatted AI Clinical Summaries, Instant KPI Stat Cards, Global Search Result Badges, Proactive Risk Callout Cards",
        "Integrated universally across all 24 modules via the global floating widget and central AI command console",
        "Zero-lag local token parsing, automatic language classification, sub-50ms query routing, proactive alert generation",
        "Physician on IPD screen clicks AI Widget &rarr; Types 'Which patients need urgent attention?' &rarr; AI detects 2 patients with SpO2 <90% &rarr; Displays direct link to Room 102 &rarr; Doctor clicks and immediately reviews chart",
        styles
    ))

    # MODULE 24: AI Voice Command
    story.extend(make_module_card(
        "4.24", "AI Multilingual Voice Command System", "Voice & Ergonomic Services",
        "Hands-free voice recognition and speech synthesis engine engineered specifically for Indian healthcare acoustic environments with seamless support for English, Telugu, and Tanglish spoken queries.",
        "&bull; Session-Isolated Speech Recognition: Uses unique session IDs to prevent stale closures and obsolete audio executions<br/>"
        "&bull; Real-time Interim Streaming: Displays spoken words live in the UI while calculating final speech intent<br/>"
        "&bull; Single-Execution Lock: Guarantees commands execute strictly once upon speech completion<br/>"
        "&bull; Indian Acoustic Model (`en-IN` / `te-IN`): Flawlessly captures medical English, native Telugu phonetic phrases, and blended Tanglish<br/>"
        "&bull; High-Performance Multilingual Text-to-Speech (TTS): Speaks responses back in natural Telugu or Indian English<br/>"
        "&bull; Speech-to-Navigation Action Engine: Directly routes the website to requested modules upon spoken intent<br/>"
        "&bull; Micro-interactions & Visual Audio Waveform indicators during listening and processing states",
        "All Authorized Hospital Staff (Hands-free operation for Surgeons, Nurses, and Lab Techs)",
        "Mic Trigger &rarr; Acoustic Capture &rarr; Interim Stream &rarr; Final Transcript &rarr; Language ID &rarr; Intent Extraction &rarr; Screen Route / Data Fetch &rarr; Spoken Voice Synthesis",
        "Floating Voice Mic Button, Global Header Voice Trigger, Live Voice Waveform Bar, Real-Time Transcript HUD, Voice State Badge",
        "Click to Speak, Pause / Resume Voice, Cancel Recognition, Toggle Audio Feedback, Replay Spoken Response",
        "Audio voice stream from browser microphone, Voice language toggle (Auto-detect English / Telugu / Tanglish)",
        "Spoken Voice Audio Output, Visual Transcript Overlay, Automatic Page Navigation, Executed Command Audit Record",
        "Operates as an omni-present overlay accessible on every single page and module across the entire HMS website",
        "Native multilingual routing, zero-lag voice playback, automatic noise suppression, role-fenced voice query execution",
        "Surgeon with sterile gloves speaks 'Lab reports చూపించు' &rarr; System detects Telugu intent &rarr; Automatically switches screen to Laboratory Reports &rarr; Speaks confirmation 'ల్యాబొరేటరీ రిపోర్టులు ఓపెన్ చేయబడ్డాయి'",
        styles
    ))

    story.append(PageBreak())

    # ==========================================
    # SECTION 5: LIS VS RIS WORKFLOWS
    # ==========================================
    story.extend(make_section_banner("5", "Laboratory (LIS) vs Diagnostics & Radiology (RIS/PACS)", styles))
    
    story.append(Paragraph(
        "A critical architectural strength of ALN Cure HMS is the <b>strict operational and clinical separation</b> between "
        "the <b>Clinical Laboratory Information System (LIS)</b> and the <b>Diagnostics & Radiology Information System (RIS/PACS)</b>. "
        "While both are diagnostic investigations, their physical workflows, specimen/patient preparation, instrument interfaces, "
        "and legal documentation lifecycles are fundamentally different.",
        styles['Body']
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>5.1 Side-by-Side Clinical Lifecycle Comparison</b>", styles['H2']))

    diag_comp = [
        [Paragraph("<b>Dimension / Stage</b>", styles['TableHead']), Paragraph("<b>Clinical Laboratory (LIS) Workflow</b>", styles['TableHead']), Paragraph("<b>Diagnostics & Radiology (RIS/PACS) Workflow</b>", styles['TableHead'])],
        [
            Paragraph("<b>Primary Entity</b>", styles['TableCellBold']),
            Paragraph("<b>Biological Specimen / Tube</b> (Blood, Urine, Sputum, CSF, Tissue Biopsy)", styles['TableCell']),
            Paragraph("<b>Human Patient & Imaging Modality</b> (X-Ray, CT, MRI, USG, PET-CT)", styles['TableCell'])
        ],
        [
            Paragraph("<b>1. Request Stage</b>", styles['TableCellBold']),
            Paragraph("Physician orders lab test (e.g., Lipid Profile, CBC, Troponin) via OPD/IPD/ER CPOE.", styles['TableCell']),
            Paragraph("Physician orders radiology study (e.g., CT Chest with Contrast, MRI Brain) via CPOE.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Pre-Analytical Phase</b>", styles['TableCellBold']),
            Paragraph("<b>Phlebotomy & Sample Collection:</b> Phlebotomist collects specimen into color-coded tube (EDTA, Serum, Sodium Fluoride). Barcode printed and affixed.", styles['TableCell']),
            Paragraph("<b>Modality Scheduling & Patient Prep:</b> Patient scheduled for slot; screened for metal implants (MRI), contrast allergy, and serum creatinine levels.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Intake & Receiving</b>", styles['TableCellBold']),
            Paragraph("<b>Sample Intake:</b> Specimen received at central lab; barcode scanned; tube checked for hemolysis or clotting; accession logged.", styles['TableCell']),
            Paragraph("<b>Patient Check-In & Gowning:</b> Patient arrives at Radiology department; radiation safety verification; IV cannula placed if contrast needed.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Analytical / Exam Stage</b>", styles['TableCellBold']),
            Paragraph("<b>Instrument Run:</b> Tube placed in automated analyzer (Biochemistry, Hematology, Immunoassay) or plated for microbiology culture.", styles['TableCell']),
            Paragraph("<b>Modality Scan Acquisition:</b> Radiologic technologist positions patient, sets protocol parameters, and acquires DICOM image slices.", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Result Entry & Panic Flag</b>", styles['TableCellBold']),
            Paragraph("<b>Result Entry & Reference Ranges:</b> Numeric values entered/transferred; flagged against biological reference ranges (Normal, High, Low, Panic).", styles['TableCell']),
            Paragraph("<b>DICOM PACS Association:</b> Acquired image series pushed to PACS server; linked with patient study record for radiologist review.", styles['TableCell'])
        ],
        [
            Paragraph("<b>6. Clinical Verification</b>", styles['TableCellBold']),
            Paragraph("<b>Pathologist Signoff:</b> Pathologist reviews delta checks, correlates with clinical history, and applies digital stamp signature.", styles['TableCell']),
            Paragraph("<b>Radiologist Diagnostic Report:</b> Radiologist inspects DICOM images; transcribes Clinical History, Technique, Findings, and Impression.", styles['TableCell'])
        ],
        [
            Paragraph("<b>7. Release & Revenue</b>", styles['TableCellBold']),
            Paragraph("<b>Report Release & Auto-Billing:</b> Verified report released to patient portal and doctor chart; test charges confirmed on central bill.", styles['TableCell']),
            Paragraph("<b>Signed Release & Auto-Billing:</b> Radiologist-signed report and PACS link published; scan fees posted to central invoice.", styles['TableCell'])
        ],
    ]

    t_diag = Table(diag_comp, colWidths=[90, 216, 217])
    t_diag.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_diag)

    story.append(PageBreak())

    # ==========================================
    # SECTION 6: AI ASSISTANT ARCHITECTURE
    # ==========================================
    story.extend(make_section_banner("6", "AI Assistant & Clinical Intelligence Architecture", styles))
    
    story.append(Paragraph(
        "The ALN Cure HMS AI Assistant is engineered as a zero-latency, context-aware intelligence layer deeply integrated "
        "into the core hospital workflow. Rather than acting as a disconnected generic chatbot, the AI continuously monitors the "
        "active screen route, active department, and logged-in user permissions to provide immediate clinical decision support, "
        "instant semantic search, and hands-free voice navigation.",
        styles['Body']
    ))

    story.append(Paragraph("<b>6.1 Core Architectural Pillars of the AI Assistant</b>", styles['H2']))

    ai_pillars = [
        [Paragraph("<b>Architectural Dimension</b>", styles['TableHead']), Paragraph("<b>Implemented Technical & Functional Mechanism</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Context-Aware Route Injection</b>", styles['TableCellBold']),
            Paragraph("Whenever the AI is triggered (via floating widget or header), it automatically inspects the current URL path (e.g. `/laboratory`, `/ipd`, `/billing`) and pre-loads department metadata and smart action suggestions tailored specifically to that screen.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Multilingual Natural Language Parsing</b>", styles['TableCellBold']),
            Paragraph("Built-in support for three linguistic formats: <b>English</b>, <b>తెలుగు (Telugu)</b> script, and <b>Tanglish (Telugu-English transliteration)</b>. The engine classifies intent into Search, Navigate, Stat Query, Action Confirmation, or Information.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Global Semantic Hospital Search</b>", styles['TableCellBold']),
            Paragraph("Instantly queries live indexed hospital records across Patients, Appointments, Doctors, Beds, Medicines, Lab Tests, Radiology Studies, and Invoices with highlighted result badges.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Automatic Phase Navigation</b>", styles['TableCellBold']),
            Paragraph("When a navigation command is detected (e.g. 'Open Laboratory', 'OPD ఓపెన్ చేయి'), the AI executes sub-second routing to the target screen while vocalizing a confirmation message.", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Proactive Critical Alarms</b>", styles['TableCellBold']),
            Paragraph("Continuously evaluates patient vitals and diagnostic results. If an inpatient's SpO2 drops below 90% or a panic lab value is recorded, the AI surfaces a red high-priority action card directly in the assistant console.", styles['TableCell'])
        ],
        [
            Paragraph("<b>6. Action Confirmation Gateways</b>", styles['TableCellBold']),
            Paragraph("To prevent accidental modifications during conversational interactions, sensitive actions (e.g., bed transfers, cancellations, emergency dispatches) require an explicit confirmation modal before execution.", styles['TableCell'])
        ],
        [
            Paragraph("<b>7. Role-Based Permission Fencing</b>", styles['TableCellBold']),
            Paragraph("The AI strictly respects the logged-in user's RBAC role. A billing clerk cannot query patient clinical notes, and a nurse cannot view hospital financial ledgers through the AI.", styles['TableCell'])
        ],
    ]

    t_aip = Table(ai_pillars, colWidths=[140, 383])
    t_aip.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_aip)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>6.2 Multilingual Natural Language Understanding (NLU)</b>", styles['H2']))
    story.append(Paragraph(
        "ALN Cure HMS features custom tokenizer dictionaries mapping regional Telugu phrases and Tanglish expressions to core hospital phases:",
        styles['Body']
    ))

    telugu_tokens = [
        [Paragraph("<b>Target Hospital Module</b>", styles['TableHead']), Paragraph("<b>Standard English Query</b>", styles['TableHead']), Paragraph("<b>Native Telugu Script Query</b>", styles['TableHead']), Paragraph("<b>Tanglish (Telugu-English) Query</b>", styles['TableHead'])],
        [Paragraph("<b>Outpatient Department (OPD)</b>", styles['TableCellBold']), Paragraph("Open OPD consultations", styles['TableCell']), Paragraph("OPD కన్సల్టేషన్స్ ఓపెన్ చేయి", styles['TableCell']), Paragraph("OPD open cheyi / queue chupinchu", styles['TableCell'])],
        [Paragraph("<b>Appointments & Token Queue</b>", styles['TableCellBold']), Paragraph("Show today's appointments", styles['TableCell']), Paragraph("ఈరోజు అపాయింట్మెంట్స్ చూపించు", styles['TableCell']), Paragraph("Eeroju appointments chupinchu", styles['TableCell'])],
        [Paragraph("<b>IPD & Bed Vacancy</b>", styles['TableCellBold']), Paragraph("How many beds are available?", styles['TableCell']), Paragraph("అందుబాటులో ఉన్న బెడ్స్ ఎంత ఉన్నాయి?", styles['TableCell']), Paragraph("Available beds entha unnayi?", styles['TableCell'])],
        [Paragraph("<b>Clinical Laboratory (LIS)</b>", styles['TableCellBold']), Paragraph("Show pending lab reports", styles['TableCell']), Paragraph("ల్యాబ్ రిపోర్టులు చూపించు", styles['TableCell']), Paragraph("Lab reports chupinchu / open cheyi", styles['TableCell'])],
        [Paragraph("<b>Diagnostics & Radiology</b>", styles['TableCellBold']), Paragraph("Open Radiology & Imaging", styles['TableCell']), Paragraph("రేడియాలజీ విభాగం ఓపెన్ చేయి", styles['TableCell']), Paragraph("Radiology open cheyi / CT scan", styles['TableCell'])],
        [Paragraph("<b>Pharmacy & Medicines</b>", styles['TableCellBold']), Paragraph("Show low stock medicines", styles['TableCell']), Paragraph("తక్కువ స్టాక్ ఉన్న మందులు చూపించు", styles['TableCell']), Paragraph("Low stock medicines chupinchu", styles['TableCell'])],
        [Paragraph("<b>Central Billing & Revenue</b>", styles['TableCellBold']), Paragraph("What is today's billing revenue?", styles['TableCell']), Paragraph("ఈరోజు బిల్లింగ్ కలెక్షన్ ఎంత?", styles['TableCell']), Paragraph("Eeroju billing collection entha?", styles['TableCell'])],
        [Paragraph("<b>Insurance & TPA Claims</b>", styles['TableCellBold']), Paragraph("Which insurance claims are pending?", styles['TableCell']), Paragraph("పెండింగ్ ఇన్సూరెన్స్ క్లెయిమ్స్ చూపించు", styles['TableCell']), Paragraph("Pending insurance claims chupinchu", styles['TableCell'])],
        [Paragraph("<b>Blood Bank Stock</b>", styles['TableCellBold']), Paragraph("Check O+ blood inventory", styles['TableCell']), Paragraph("బ్లడ్ బ్యాంక్ లో O+ రక్తం ఎంత ఉంది?", styles['TableCell']), Paragraph("Blood bank O+ stock entha undi?", styles['TableCell'])],
    ]

    t_tel = Table(telugu_tokens, colWidths=[110, 130, 140, 143])
    t_tel.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_tel)

    story.append(PageBreak())

    # ==========================================
    # SECTION 7: AI VOICE COMMAND WORKFLOW
    # ==========================================
    story.extend(make_section_banner("7", "AI Voice Command Engine & Workflow", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS features a state-of-the-art voice interaction pipeline engineered for busy hospital environments. "
        "The system allows doctors, nurses, surgeons, and receptionists to execute commands, query hospital data, and navigate "
        "screens hands-free with real-time audio responses.",
        styles['Body']
    ))

    story.append(Paragraph("<b>7.1 End-to-End Voice Command Sequence</b>", styles['H2']))

    story.append(make_callout(
        "VOICE RECOGNITION & ACTION PIPELINE",
        "<b>Step 1: User Voice Input</b> &rarr; User clicks Mic button or activates voice HUD.<br/>"
        "<b>Step 2: Acoustic Speech Recognition</b> &rarr; Browser Web Speech API captures audio using Indian English (`en-IN`) acoustic model.<br/>"
        "<b>Step 3: Real-Time Interim Streaming</b> &rarr; Live transcript streams into the UI for visual feedback without premature execution.<br/>"
        "<b>Step 4: Language & Intent Detection</b> &rarr; AI Command Engine identifies language (English, Telugu, Tanglish) and classifies intent.<br/>"
        "<b>Step 5: HMS Phase & Action Routing</b> &rarr; Target module path resolved (e.g. `/laboratory`, `/ipd`, `/billing`) or live database queried.<br/>"
        "<b>Step 6: UI Execution & State Sync</b> &rarr; System routes to screen, applies filters, or displays statistical summary card.<br/>"
        "<b>Step 7: Multilingual Voice Synthesis (TTS)</b> &rarr; Text-to-Speech engine speaks confirmation in natural Telugu (`te-IN`) or Indian English.",
        styles,
        bg_color=C_PRIMARY_LIGHT,
        border_color=C_PRIMARY_MED
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>7.2 Real-World Voice Interaction Catalog</b>", styles['H2']))

    voice_examples = [
        [Paragraph("<b>Spoken Voice Input</b>", styles['TableHead']), Paragraph("<b>Detected Language & Intent</b>", styles['TableHead']), Paragraph("<b>System Action & Screen Navigation</b>", styles['TableHead']), Paragraph("<b>Synthesized Audio Voice Response</b>", styles['TableHead'])],
        [
            Paragraph("<i>'Open Laboratory'</i>", styles['TableCellBold']),
            Paragraph("English &bull; NAVIGATE", styles['TableCell']),
            Paragraph("Switches active view to `/laboratory` LIS dashboard.", styles['TableCell']),
            Paragraph("<i>'Opening Clinical Laboratory management.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'Show today\\'s OPD queue'</i>", styles['TableCellBold']),
            Paragraph("English &bull; STAT_QUERY", styles['TableCell']),
            Paragraph("Routes to `/opd` and highlights waiting queue count.", styles['TableCell']),
            Paragraph("<i>'Displaying OPD consultation queue. 8 patients currently waiting.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'ఈరోజు OPD patients ఎంత మంది ఉన్నారు?'</i>", styles['TableCellBold']),
            Paragraph("Telugu &bull; STAT_QUERY", styles['TableCell']),
            Paragraph("Queries live OPD database; displays OPD stat summary card.", styles['TableCell']),
            Paragraph("<i>'ఈరోజు OPD లో మొత్తం 24 మంది పేషెంట్లు ఉన్నారు. 8 మంది వేచి ఉన్నారు.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'Lab reports చూపించు'</i>", styles['TableCellBold']),
            Paragraph("Telugu / Tanglish &bull; NAVIGATE", styles['TableCell']),
            Paragraph("Navigates directly to `/laboratory` completed reports archive tab.", styles['TableCell']),
            Paragraph("<i>'ల్యాబొరేటరీ రిపోర్టులు ఓపెన్ చేయబడ్డాయి.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'Available beds chupinchu'</i>", styles['TableCellBold']),
            Paragraph("Tanglish &bull; STAT_QUERY", styles['TableCell']),
            Paragraph("Routes to `/ipd` bed board and highlights available beds.", styles['TableCell']),
            Paragraph("<i>'Currently 14 beds are available across all wards.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'క్రిటికల్ పేషెంట్స్ చూపించు'</i>", styles['TableCellBold']),
            Paragraph("Telugu &bull; SEARCH", styles['TableCell']),
            Paragraph("Opens Central AI Console filtered to high-risk patients.", styles['TableCell']),
            Paragraph("<i>'క్రిటికల్ పేషెంట్ల వివరాలు స్క్రీన్ పై చూపించబడ్డాయి.'</i>", styles['TableCell'])
        ],
        [
            Paragraph("<i>'Show low stock medicines'</i>", styles['TableCellBold']),
            Paragraph("English &bull; STAT_QUERY", styles['TableCell']),
            Paragraph("Navigates to `/pharmacy` low stock reorder management tab.", styles['TableCell']),
            Paragraph("<i>'Showing 5 medicines below reorder threshold in Pharmacy.'</i>", styles['TableCell'])
        ],
    ]

    t_vox = Table(voice_examples, colWidths=[120, 95, 150, 158])
    t_vox.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_vox)

    story.append(PageBreak())

    # ==========================================
    # SECTION 8: COMPLETE END-TO-END WORKFLOWS
    # ==========================================
    story.extend(make_section_banner("8", "Complete End-to-End Hospital Workflows", styles))
    
    story.append(Paragraph("<b>8.1 Outpatient (OPD) Clinical Journey</b>", styles['H2']))
    story.append(Paragraph(
        "<b>Step 1: Patient Registration / Verification:</b> Front desk checks Master Patient Index (MPI). If new, registers demographic and insurance details. Unique ALN Patient ID generated.<br/>"
        "<b>Step 2: Appointment & Token Generation:</b> Receptionist selects doctor and time slot, collects consultation fee, prints token slip, and queues patient.<br/>"
        "<b>Step 3: Nursing Vitals Triage:</b> OPD triage nurse captures Blood Pressure, Pulse, SpO2, Temperature, Weight, and BMI into the system.<br/>"
        "<b>Step 4: Doctor Consultation:</b> Doctor calls token into room, reviews past medical history, documents Chief Complaint and Physical Examination, selects ICD-10 diagnosis, prescribes medicines, and orders diagnostic tests.<br/>"
        "<b>Step 5: Diagnostic Investigations (LIS / RIS):</b> Patient visits Lab for blood draw (barcode labeled) and Radiology for X-ray/CT scan.<br/>"
        "<b>Step 6: Pharmacy Dispensing:</b> Pharmacist dispenses prescribed medicines using FEFO batch control and issues POS receipt.<br/>"
        "<b>Step 7: Follow-up & Discharge:</b> Doctor reviews verified diagnostic reports, confirms treatment plan, and schedules next follow-up date.",
        styles['Body']
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>8.2 Inpatient (IPD) Full Admission & Discharge Lifecycle</b>", styles['H2']))
    story.append(Paragraph(
        "<b>Step 1: Inpatient Admission Requisition:</b> OPD or Emergency physician issues admission order with provisional diagnosis and target ward type (e.g. ICU, Semi-Private).<br/>"
        "<b>Step 2: Bed Allocation & Check-In:</b> IPD desk assigns specific bed (e.g. Bed ICU-02) on the visual Bed Board, collects advance deposit, and admits patient.<br/>"
        "<b>Step 3: Bedside Nursing & MAR Execution:</b> Ward nurse receives patient, initiates care plan, records scheduled medication administrations in e-MAR, and charts regular vitals.<br/>"
        "<b>Step 4: Clinical Rounds & Multidisciplinary Orders:</b> Attending physician logs daily progress notes; Dietitian sets therapeutic diet plan (e.g. Diabetic 1600 kcal); LIS and RIS process daily monitoring orders.<br/>"
        "<b>Step 5: Automatic Charge Capture:</b> System automatically accumulates daily bed rent, nursing fees, medicines dispensed, lab tests, and doctor visit charges on the patient ledger.<br/>"
        "<b>Step 6: Discharge Order & Clinical Summary:</b> Physician certifies clinical stability, completes electronic Discharge Summary with medication instructions.<br/>"
        "<b>Step 7: Billing Settlement & Clearance:</b> Billing desk reconciles charges against advances and insurance pre-auth, collects final balance, prints receipt, and issues clearance.<br/>"
        "<b>Step 8: Housekeeping Bed Turnover:</b> System tags bed as 'Cleaning', notifies housekeeping janitors, sanitizes room, and turns bed to 'Available'.",
        styles['Body']
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>8.3 Cashless Insurance & TPA Claims Lifecycle</b>", styles['H2']))
    story.append(Paragraph(
        "<b>Step 1: Provider Empanelment:</b> Hospital maintains agreements with Star Health, HDFC ERGO, ICICI Lombard, Medi Assist, etc.<br/>"
        "<b>Step 2: Policy Verification:</b> TPA coordinator registers patient health card and verifies active policy coverage and sum insured.<br/>"
        "<b>Step 3: Pre-Authorization Request:</b> Coordinator submits pre-auth application with provisional clinical diagnosis and estimated hospital stay costs.<br/>"
        "<b>Step 4: TPA Initial Approval:</b> TPA issues initial cashless authorization letter (e.g., $40,000 sanctioned).<br/>"
        "<b>Step 5: Treatment & Interim Enhancement:</b> Patient receives clinical care; if surgical costs exceed initial approval, coordinator submits enhancement request.<br/>"
        "<b>Step 6: Final Claim Dossier Packaging:</b> Upon discharge, system automatically bundles Discharge Summary, Final Itemized Bill, Diagnostic Reports, and Pharmacy Bills.<br/>"
        "<b>Step 7: Claim Adjudication & Settlement:</b> TPA audits claim, issues final approval, remits funds to hospital bank account, and logs co-payment settlement.",
        styles['Body']
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>8.4 Emergency Resuscitation & Trauma Protocol</b>", styles['H2']))
    story.append(Paragraph(
        "<b>Step 1: Emergency Intake (Ambulance / Walk-in):</b> Patient arrives at ER; triage nurse performs immediate 30-second assessment.<br/>"
        "<b>Step 2: Triage Color Tagging & GCS Calculation:</b> Patient tagged Red (Resuscitation), Yellow (Emergent), or Green (Non-urgent); Glasgow Coma Scale (3-15) scored.<br/>"
        "<b>Step 3: Medico-Legal Case (MLC) Tagging:</b> If accident, assault, or poisoning, MLC record opened and police notification generated.<br/>"
        "<b>Step 4: STAT Diagnostic & Blood Orders:</b> Immediate STAT orders dispatched to CT Radiology and Blood Bank for emergency cross-matching.<br/>"
        "<b>Step 5: Stabilization & Direct IPD/OT Transfer:</b> Trauma team stabilizes patient; if surgery needed, patient moved directly to Operation Theatre or ICU.",
        styles['Body']
    ))

    story.append(PageBreak())

    # ==========================================
    # SECTION 9: SCREEN & PAGE DOCUMENTATION
    # ==========================================
    story.extend(make_section_banner("9", "Screen & User Interface Layout Documentation", styles))
    
    story.append(Paragraph(
        "The ALN Cure HMS user interface is built on modern ergonomic principles to maximize clinical productivity, "
        "minimize data entry fatigue, and provide rapid information retrieval during high-pressure medical encounters.",
        styles['Body']
    ))

    screen_anatomy = [
        [Paragraph("<b>UI Region</b>", styles['TableHead']), Paragraph("<b>Component Blueprint & Available Actions</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Page Breadcrumb & Header Bar</b>", styles['TableCellBold']),
            Paragraph("Displays hierarchical navigation path (e.g., Home &rsaquo; Inpatient Department &rsaquo; Bed Board), bold page title, and clinical subtitle explaining the active workflow. Contains primary action CTAs (e.g. '+ Order Lab Tests', '+ Admit Patient') and universal search shortcut (<kbd>Ctrl+K</kbd>).", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Sub-Navigation Tabs Bar</b>", styles['TableCellBold']),
            Paragraph("Horizontal scrollable tab bar organizing module functions into logical workflows (e.g., Dashboard, Orders, Scheduling, Preparation, Worklist, Reporting, Verification, Archive). Features real-time numeric badges indicating pending task counts and critical alert warnings.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Summary KPI Cards Strip</b>", styles['TableCellBold']),
            Paragraph("Visual metrics strip displaying high-level counts with color-coded trend indicators (e.g. Total Inpatients: 42, Available Beds: 14, Pending Discharge: 3, ICU Occupancy: 88%).", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Filter & Search Toolbar</b>", styles['TableCellBold']),
            Paragraph("Standardized filter bar with multi-field search inputs, dropdown filters (Status, Department, Doctor, Triage level, Date range), and data export triggers (Export Excel, Print PDF, Refresh).", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Data Table / Card Grid</b>", styles['TableCellBold']),
            Paragraph("High-density responsive data table with sticky column headers, status badges (e.g. Active, Completed, Pending, Critical), row action buttons (View, Edit, Print, Discharge), and pagination controls.", styles['TableCell'])
        ],
        [
            Paragraph("<b>6. Interactive Modals & Drawers</b>", styles['TableCellBold']),
            Paragraph("Slide-over drawers and modal windows for focused transactional workflows (e.g., Create Central Bill, Patient Registration, e-MAR Vitals Entry, Barcode Label Print) with validation error states.", styles['TableCell'])
        ],
    ]

    t_sa = Table(screen_anatomy, colWidths=[140, 383])
    t_sa.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sa)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>9.2 Screen Interaction Matrix across Core Pages</b>", styles['H2']))

    screen_matrix = [
        [Paragraph("<b>Screen Name</b>", styles['TableHead']), Paragraph("<b>Route Path</b>", styles['TableHead']), Paragraph("<b>Primary UI Components Displayed</b>", styles['TableHead']), Paragraph("<b>Key User Actions Available</b>", styles['TableHead'])],
        [Paragraph("<b>Dashboard</b>", styles['TableCellBold']), Paragraph("`/dashboard`", styles['TableCell']), Paragraph("KPI cards, Bed occupancy grid, Revenue trend chart, Critical alerts callout, Activity stream.", styles['TableCell']), Paragraph("Refresh KPIs, filter by date, click drilldown to modules, view panic alarms.", styles['TableCell'])],
        [Paragraph("<b>Patients MPI</b>", styles['TableCellBold']), Paragraph("`/patients`", styles['TableCell']), Paragraph("Patient card grid, demographic search bar, filter by blood group/status, dossier drawer.", styles['TableCell']), Paragraph("Add new patient, edit demographics, print ID card, view complete medical history.", styles['TableCell'])],
        [Paragraph("<b>OPD Desk</b>", styles['TableCellBold']), Paragraph("`/opd`", styles['TableCell']), Paragraph("Live token queue, consultation workspace, vitals station, Rx prescription writer, CPOE orders.", styles['TableCell']), Paragraph("Call next token, record vitals, write prescription, order lab/radiology, schedule follow-up.", styles['TableCell'])],
        [Paragraph("<b>Emergency Trauma</b>", styles['TableCellBold']), Paragraph("`/emergency`", styles['TableCell']), Paragraph("4-Tier triage board, GCS score calculator, trauma bay matrix, MLC registry, STAT orders.", styles['TableCell']), Paragraph("Intake trauma patient, update triage color, score GCS, trigger STAT alarms, transfer to ICU.", styles['TableCell'])],
        [Paragraph("<b>IPD Bed Board</b>", styles['TableCellBold']), Paragraph("`/ipd`", styles['TableCell']), Paragraph("Ward-wise visual bed matrix, inpatient census list, transfer station, discharge queue.", styles['TableCell']), Paragraph("Admit patient, allocate bed, execute inter-ward transfer, log daily rounds, initiate discharge.", styles['TableCell'])],
        [Paragraph("<b>Laboratory LIS</b>", styles['TableCellBold']), Paragraph("`/laboratory`", styles['TableCell']), Paragraph("Specimen queue, barcode scanner, test result entry table, reference ranges, panic flags.", styles['TableCell']), Paragraph("Accession sample, print tube label, enter results, pathologist verify, release official PDF.", styles['TableCell'])],
        [Paragraph("<b>Radiology RIS</b>", styles['TableCellBold']), Paragraph("`/radiology`", styles['TableCell']), Paragraph("Modality scheduling grid, safety prep checklist, DICOM viewer link, radiologist reporting.", styles['TableCell']), Paragraph("Schedule modality slot, screen patient prep, view DICOM, transcribe findings, signoff report.", styles['TableCell'])],
        [Paragraph("<b>Pharmacy POS</b>", styles['TableCellBold']), Paragraph("`/pharmacy`", styles['TableCell']), Paragraph("Digital Rx queue, barcode POS counter, FEFO batch stock ledger, low stock alerts, GRN.", styles['TableCell']), Paragraph("Dispense prescription, scan OTC sale, receive stock GRN, issue PO, manage expiry batches.", styles['TableCell'])],
        [Paragraph("<b>Central Billing</b>", styles['TableCellBold']), Paragraph("`/billing`", styles['TableCell']), Paragraph("Consolidated invoice builder, patient ledger, payment mode cashiering, receipts, shift closure.", styles['TableCell']), Paragraph("Generate central bill, collect cash/UPI, print tax invoice, apply discount, close shift drawer.", styles['TableCell'])],
        [Paragraph("<b>Insurance TPA</b>", styles['TableCellBold']), Paragraph("`/insurance`", styles['TableCell']), Paragraph("TPA provider master, policy verification desk, pre-auth tracker, claims document packaging.", styles['TableCell']), Paragraph("Register policy, submit pre-auth, upload claim documents, log settlement remittance.", styles['TableCell'])],
    ]

    t_sm = Table(screen_matrix, colWidths=[85, 65, 186, 187])
    t_sm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_sm)

    story.append(PageBreak())

    # ==========================================
    # SECTION 10: REPORTS CATALOG
    # ==========================================
    story.extend(make_section_banner("10", "Enterprise Reports & Analytics Catalog", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS provides an integrated reporting suite containing 18+ specialized reporting engines. "
        "Every report supports customizable date ranges, multi-variable filters, high-resolution vector charts, and instant exports to Excel, CSV, and printable PDF.",
        styles['Body']
    ))

    reports_catalog = [
        [Paragraph("<b>Report Name & Domain</b>", styles['TableHead']), Paragraph("<b>Purpose & Analytical Scope</b>", styles['TableHead']), Paragraph("<b>Included Data Metrics</b>", styles['TableHead']), Paragraph("<b>Filters & Export Formats</b>", styles['TableHead']), Paragraph("<b>Authorized Roles</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Executive Overview</b><br/>(Clinical / Operations)", styles['TableCellBold']),
            Paragraph("High-level executive dashboard summarizing total footfalls, bed occupancy, clinical TATs, and daily gross revenue.", styles['TableCell']),
            Paragraph("OPD counts, IPD admissions, discharges, surgeries, lab orders, pharmacy sales, gross billing revenue.", styles['TableCell']),
            Paragraph("Date Range (Today, 7D, 30D, Custom), Department.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Super Admin, Hospital Admin, Management", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Patient Master Report</b><br/>(Medical Records)", styles['TableCellBold']),
            Paragraph("Comprehensive audit of all registered patients in the Master Patient Index (MPI).", styles['TableCell']),
            Paragraph("Patient ID, Name, Age, Gender, Phone, Blood Group, Aadhaar, Registration Date, Total Encounters.", styles['TableCell']),
            Paragraph("Date Range, Gender, Blood Group, Status.<br/><b>Excel, CSV, PDF</b>", styles['TableCell']),
            Paragraph("Super Admin, Hospital Admin, Receptionist", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. OPD Consultations</b><br/>(Clinical Care)", styles['TableCellBold']),
            Paragraph("Detailed breakdown of outpatient consultations, waiting times, and diagnoses.", styles['TableCell']),
            Paragraph("Token #, Doctor Name, Department, Chief Complaint, ICD-10 Diagnosis, Prescribed Rx, Consultation Fee.", styles['TableCell']),
            Paragraph("Date Range, Department, Doctor, Status.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Doctor, Super Admin, Hospital Admin", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. IPD Inpatients & Census</b><br/>(Inpatient Care)", styles['TableCellBold']),
            Paragraph("Tracks inpatient admissions, average length of stay (ALOS), and bed utilization rates.", styles['TableCell']),
            Paragraph("Admission #, Patient Name, Ward, Bed #, Admitting Doctor, Admission Date, Stay Days, Discharge Status.", styles['TableCell']),
            Paragraph("Date Range, Ward Type, Doctor, Status.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Super Admin, Hospital Admin, Doctor, Nurse", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Bed Occupancy Matrix</b><br/>(Operations)", styles['TableCellBold']),
            Paragraph("Analyzes bed turnover times, occupancy percentages, and maintenance downtimes.", styles['TableCell']),
            Paragraph("Ward Name, Total Beds, Occupied Beds, Available Beds, Cleaning Beds, Occupancy % Rate.", styles['TableCell']),
            Paragraph("Date Range, Ward, Floor.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Hospital Admin, Super Admin, Management", styles['TableCell'])
        ],
        [
            Paragraph("<b>6. Diagnostic Laboratory</b><br/>(Pathology)", styles['TableCellBold']),
            Paragraph("Audit of clinical laboratory test volumes, critical panic value frequency, and turnaround times.", styles['TableCell']),
            Paragraph("Order ID, Patient Name, Test Name, Sample Barcode, Result Value, Panic Flag, Turnaround Time (TAT).", styles['TableCell']),
            Paragraph("Date Range, Test Category, Panic Only.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Lab Tech, Pathologist, Hospital Admin", styles['TableCell'])
        ],
        [
            Paragraph("<b>7. Radiology Studies</b><br/>(Diagnostic Imaging)", styles['TableCellBold']),
            Paragraph("Modality utilization metrics, radiologist reporting TATs, and study volumes.", styles['TableCell']),
            Paragraph("Study ID, Patient Name, Modality (CT/MRI/X-Ray), Body Part, Radiologist Name, Report Verification Status.", styles['TableCell']),
            Paragraph("Date Range, Modality Type, Radiologist.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Radiologist, Hospital Admin, Super Admin", styles['TableCell'])
        ],
        [
            Paragraph("<b>8. Pharmacy Sales & Stock</b><br/>(Pharmacy)", styles['TableCellBold']),
            Paragraph("Itemized drug dispensing ledger, sales revenue, expiring batch audit, and low stock items.", styles['TableCell']),
            Paragraph("Medicine Name, Batch #, Expiry Date, Qty Dispensed, Total Revenue, Reorder Level, Stock Remaining.", styles['TableCell']),
            Paragraph("Date Range, Category, Near-Expiry.<br/><b>PDF, Excel, CSV</b>", styles['TableCell']),
            Paragraph("Pharmacist, Billing Staff, Hospital Admin", styles['TableCell'])
        ],
        [
            Paragraph("<b>9. Blood Bank Inventory</b><br/>(Transfusion)", styles['TableCellBold']),
            Paragraph("Tracks blood donations, component inventory levels, cross-match requests, and discard logs.", styles['TableCell']),
            Paragraph("Donor ID, Blood Group, Component Type (PRBC/FFP/Platelets), Expiry Date, Units Available, Discard Reason.", styles['TableCell']),
            Paragraph("Date Range, Blood Group, Component.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Blood Bank Staff, Hospital Admin", styles['TableCell'])
        ],
        [
            Paragraph("<b>10. Central Billing & Collections</b><br/>(Finance & Accounts)", styles['TableCellBold']),
            Paragraph("Comprehensive revenue ledger detailing invoice generation, payment receipts, discounts, and refunds.", styles['TableCell']),
            Paragraph("Invoice #, Patient Name, Gross Amount, Discount, Advance Deducted, Net Paid, Balance Due, Payment Mode.", styles['TableCell']),
            Paragraph("Date Range, Payment Mode, Cashier Shift.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Billing Staff, Hospital Admin, Management", styles['TableCell'])
        ],
        [
            Paragraph("<b>11. Doctor Productivity</b><br/>(Medical Administration)", styles['TableCellBold']),
            Paragraph("Evaluates specialist consultation volumes, surgical cases, and patient feedback ratings.", styles['TableCell']),
            Paragraph("Doctor Name, Specialization, Total Consultations, Total Admissions, Total Revenue Generated, Patient Rating.", styles['TableCell']),
            Paragraph("Date Range, Department, Doctor.<br/><b>PDF, Excel</b>", styles['TableCell']),
            Paragraph("Super Admin, Hospital Admin, Management", styles['TableCell'])
        ],
        [
            Paragraph("<b>12. Security & Audit Trail</b><br/>(System Governance)", styles['TableCellBold']),
            Paragraph("Immutable security audit log tracking all logins, chart access, bill adjustments, and data exports.", styles['TableCell']),
            Paragraph("Timestamp, User ID, User Name, Role, IP Address, Action Performed, Target Module, Record ID Modified.", styles['TableCell']),
            Paragraph("Date Range, User Role, Action Type.<br/><b>PDF, Excel, CSV</b>", styles['TableCell']),
            Paragraph("Super Admin (Strictly Restricted)", styles['TableCell'])
        ],
    ]

    t_rep = Table(reports_catalog, colWidths=[95, 115, 125, 100, 88])
    t_rep.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_rep)

    story.append(PageBreak())

    # ==========================================
    # SECTION 11: SECURITY & DATA PROTECTION
    # ==========================================
    story.extend(make_section_banner("11", "Application Security, Privacy & Data Protection", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS is designed from the ground up to comply with global healthcare information security standards, "
        "including HIPAA, NABH, and ISO 27001 principles. The system enforces zero-trust architecture, multi-tier role-based access "
        "control, session isolation, and strict separation between clinical, diagnostic, and financial records. "
        "<b>No credentials, passwords, tokens, API keys, or private secrets are ever embedded or exposed in this document.</b>",
        styles['Body']
    ))

    sec_layers = [
        [Paragraph("<b>Security Domain</b>", styles['TableHead']), Paragraph("<b>Implemented Application Safeguards & Protocols</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Authentication & Session Isolation</b>", styles['TableCellBold']),
            Paragraph("Secure multi-factor ready authentication with encrypted session tokens. Automatic session expiration upon inactivity. Real-time session invalidation on password change or administrative revocation. Isolated speech recognition sessions prevent cross-talk or stale command callbacks.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. Role-Based Access Control (RBAC)</b>", styles['TableCellBold']),
            Paragraph("Granular permissions matrix enforced at the route, component, and data-query levels. Front desk staff cannot view clinical examination notes; nurses cannot alter doctor prescriptions; pharmacists cannot access hospital financial ledgers.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. Patient Health Information (PHI) Privacy</b>", styles['TableCellBold']),
            Paragraph("All patient health records (diagnoses, lab results, imaging DICOMs, psychiatric notes) are fenced strictly to authorized attending clinical personnel. Confidential VIP and Medico-Legal (MLC) files have restricted access flags.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. Financial & Insurance Fraud Protection</b>", styles['TableCellBold']),
            Paragraph("Split-billing logic separates patient cash from TPA insurance credit. Discounts and refunds require secondary supervisor approval codes. All cashier drawers require end-of-shift reconciliation with zero unexplained variance.", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Immutable Security Audit Logging</b>", styles['TableCellBold']),
            Paragraph("Every critical transaction — patient record creation, clinical note edit, prescription deletion, lab verification, billing adjustment, and data export — is written to an immutable append-only audit trail capturing User ID, Role, IP Address, Timestamp, and Delta change.", styles['TableCell'])
        ],
        [
            Paragraph("<b>6. AI Safety & Action Confirmation Gateways</b>", styles['TableCellBold']),
            Paragraph("The AI engine cannot execute destructive operations (such as bed discharge, appointment cancellation, or emergency dispatch) without an explicit user confirmation modal. All AI queries and responses are logged to a dedicated AI audit stream.", styles['TableCell'])
        ],
    ]

    t_sec = Table(sec_layers, colWidths=[140, 383])
    t_sec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sec)

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 12: SYSTEM INTEGRATION MATRIX
    # ==========================================
    story.extend(make_section_banner("12", "System Integration Matrix & Inter-Module Cohesion", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS eliminates departmental friction through a unified real-time event bus. "
        "The matrix below illustrates the automated data handshakes connecting all primary hospital departments:",
        styles['Body']
    ))

    integ_data = [
        [Paragraph("<b>Source Module</b>", styles['TableHead']), Paragraph("<b>Target Module</b>", styles['TableHead']), Paragraph("<b>Automated Data Interchange / Clinical Handshake</b>", styles['TableHead'])],
        [Paragraph("<b>OPD Consultations</b>", styles['TableCellBold']), Paragraph("Laboratory (LIS) & Radiology (RIS)", styles['TableCell']), Paragraph("Instant CPOE diagnostic requisitions with clinical indication and priority flags.", styles['TableCell'])],
        [Paragraph("<b>OPD Consultations</b>", styles['TableCellBold']), Paragraph("Pharmacy POS", styles['TableCell']), Paragraph("Digital e-Prescription (Rx) pushed to dispensing queue with dosage and duration.", styles['TableCell'])],
        [Paragraph("<b>IPD Admissions</b>", styles['TableCellBold']), Paragraph("Central Billing", styles['TableCell']), Paragraph("Automatic daily room rent and bed tariff accumulation on patient ledger.", styles['TableCell'])],
        [Paragraph("<b>IPD Admissions</b>", styles['TableCellBold']), Paragraph("Diet & Nutrition", styles['TableCell']), Paragraph("Inpatient dietary profile generated; pushes therapeutic meal orders to kitchen schedule.", styles['TableCell'])],
        [Paragraph("<b>IPD Admissions</b>", styles['TableCellBold']), Paragraph("Nursing Station", styles['TableCell']), Paragraph("Patient bed check-in; populates nurse assigned patient list and e-MAR medication chart.", styles['TableCell'])],
        [Paragraph("<b>Laboratory (LIS)</b>", styles['TableCellBold']), Paragraph("Notifications & Doctor Chart", styles['TableCell']), Paragraph("Panic/Critical test values trigger immediate audible and visual red alerts on doctor's screen.", styles['TableCell'])],
        [Paragraph("<b>Radiology (RIS)</b>", styles['TableCellBold']), Paragraph("Central Billing", styles['TableCell']), Paragraph("Completed scan modalities post standardized imaging tariffs directly to invoice.", styles['TableCell'])],
        [Paragraph("<b>Blood Bank</b>", styles['TableCellBold']), Paragraph("Emergency / Operation Theatre", styles['TableCell']), Paragraph("Cross-matched blood units released with dual-signoff safety verification slip.", styles['TableCell'])],
        [Paragraph("<b>IPD Discharge</b>", styles['TableCellBold']), Paragraph("Housekeeping", styles['TableCell']), Paragraph("Bed discharge triggers instant high-priority sanitization task on janitor turnover queue.", styles['TableCell'])],
        [Paragraph("<b>All Clinical Modules</b>", styles['TableCellBold']), Paragraph("Insurance & TPA", styles['TableCell']), Paragraph("Discharge Summary, itemized bills, lab/rad reports packaged into cashless claim dossier.", styles['TableCell'])],
    ]

    t_int = Table(integ_data, colWidths=[120, 130, 273])
    t_int.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_int)

    story.append(PageBreak())

    # ==========================================
    # SECTION 13: CONCEPTUAL DATA FLOW
    # ==========================================
    story.extend(make_section_banner("13", "Conceptual Hospital Data Flow Overview", styles))
    
    story.append(Paragraph(
        "The lifecycle of medical, operational, and financial data in ALN Cure HMS follows a structured, unidirectional "
        "flow from patient intake to clinical care, diagnostic investigation, supply chain fulfillment, and financial closure:",
        styles['Body']
    ))

    story.append(make_callout(
        "ENTERPRISE HOSPITAL DATA FLOW ARCHITECTURE",
        "<b>1. Patient Identification & Intake (MPI):</b><br/>"
        "&nbsp;&nbsp;&bull; Demographic record created &rarr; Unique Patient ID assigned &rarr; Insurance policy linked.<br/><br/>"
        "<b>2. Clinical Encounter & Orders (OPD / IPD / ER):</b><br/>"
        "&nbsp;&nbsp;&bull; Vitals charted &rarr; Examination & ICD-10 diagnosis recorded &rarr; CPOE orders and e-Prescriptions generated.<br/><br/>"
        "<b>3. Diagnostic & Therapeutic Services (LIS / RIS / Diet / Blood Bank):</b><br/>"
        "&nbsp;&nbsp;&bull; Specimens accessioned & analyzed &rarr; DICOM scans acquired & transcribed &rarr; Blood cross-matched &rarr; Diets scheduled.<br/><br/>"
        "<b>4. Supply Chain & Medication Fulfillment (Pharmacy):</b><br/>"
        "&nbsp;&nbsp;&bull; Prescriptions verified &rarr; FEFO batches dispensed &rarr; Inventory stock automatically decremented.<br/><br/>"
        "<b>5. Central Revenue Cycle & Financial Settlement (Billing & Insurance):</b><br/>"
        "&nbsp;&nbsp;&bull; Department charges captured &rarr; Split invoice calculated (Patient Cash vs Insurance Credit) &rarr; Receipt issued &rarr; Shift reconciled.<br/><br/>"
        "<b>6. Executive Intelligence & Regulatory Compliance (Reports & AI):</b><br/>"
        "&nbsp;&nbsp;&bull; Transactions aggregated into 18+ BI reports &rarr; AI audit trail archived &rarr; NABH quality indicators compiled.",
        styles,
        bg_color=C_PRIMARY_LIGHT,
        border_color=C_PRIMARY_MED
    ))

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 14: UI/UX DESIGN SYSTEM
    # ==========================================
    story.extend(make_section_banner("14", "UI/UX Design System & Ergonomic Standards", styles))
    
    story.append(Paragraph(
        "ALN Cure HMS is designed specifically for healthcare environments, prioritizing visual clarity, high contrast ratios, "
        "intuitive typography, and minimal cognitive load during critical clinical operations.",
        styles['Body']
    ))

    ui_principles = [
        [Paragraph("<b>Design Principle</b>", styles['TableHead']), Paragraph("<b>Implemented Visual & Ergonomic Standard</b>", styles['TableHead'])],
        [
            Paragraph("<b>Professional Hospital Emerald Theme</b>", styles['TableCellBold']),
            Paragraph("Uses deep forest emerald (`#065F46`), hospital jade green (`#059669`), and soothing mint backgrounds (`#ECFDF5`) to establish a calming, clinical aesthetic that inspires confidence and trust.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Modern Typography & Hierarchy</b>", styles['TableCellBold']),
            Paragraph("Clean sans-serif typography (Inter / Segoe UI) with standardized font scaling from 7.5pt micro-labels to 28pt page headers. Clear bolding for vital numbers, panic values, and financial totals.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Responsive Collapsible Navigation</b>", styles['TableCellBold']),
            Paragraph("Master sidebar supports instant one-click collapse, expanding clinical data tables and bed board matrices to maximum screen width on tablets and desktop monitors.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Color-Coded Clinical Semantics</b>", styles['TableCellBold']),
            Paragraph("Consistent color indicators across all 24 modules: <b>Red</b> for Resuscitation / Panic values / Emergency; <b>Amber</b> for Pending / Waiting / Near Expiry; <b>Green</b> for Completed / Available / Normal; <b>Blue</b> for In-Progress / Scheduled; <b>Purple</b> for AI Intelligence.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Voice Ergonomics & Waveforms</b>", styles['TableCellBold']),
            Paragraph("Visual animated sound waves during speech listening; distinct chime sound on notification arrival; unobtrusive floating widget accessible on every screen.", styles['TableCell'])
        ],
    ]

    t_ui = Table(ui_principles, colWidths=[140, 383])
    t_ui.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_ui)

    story.append(PageBreak())

    # ==========================================
    # SECTION 15: FUTURE ENHANCEMENTS ROADMAP
    # ==========================================
    story.extend(make_section_banner("15", "Future Enhancements Roadmap (Clearly Demarcated)", styles))
    
    story.append(Paragraph(
        "<i>Note: The features below represent strategic product roadmap enhancements planned for future versions. "
        "They are clearly demarcated as <b>Future Enhancements</b> and are distinct from currently implemented version 2.6 capabilities.</i>",
        styles['Body']
    ))

    roadmap_items = [
        [Paragraph("<b>Roadmap Domain</b>", styles['TableHead']), Paragraph("<b>Planned Future Capability (Future Enhancement)</b>", styles['TableHead']), Paragraph("<b>Target Objective & Strategic Impact</b>", styles['TableHead'])],
        [
            Paragraph("<b>1. Tele-Medicine Video Consultation Gateway</b>", styles['TableCellBold']),
            Paragraph("<i>Future Enhancement:</i> Embedded WebRTC encrypted multi-party video consultation portal with digital waiting rooms, screen sharing for diagnostic scans, and patient e-prescription delivery.", styles['TableCell']),
            Paragraph("Enables remote specialist consults for rural clinics and follow-up tele-health encounters.", styles['TableCell'])
        ],
        [
            Paragraph("<b>2. HL7 / FHIR EHR Standard Gateway</b>", styles['TableCellBold']),
            Paragraph("<i>Future Enhancement:</i> Full bidirectional HL7 v2.x and FHIR R4 interoperability layer connecting hospital records with National Health Authority (ABDM) and external health registries.", styles['TableCell']),
            Paragraph("Enables seamless nationwide electronic health record exchange across hospital networks.", styles['TableCell'])
        ],
        [
            Paragraph("<b>3. IoT ICU Bedside Device Telemetry</b>", styles['TableCellBold']),
            Paragraph("<i>Future Enhancement:</i> Direct serial/MQTT driver integration with ICU multipara patient monitors, mechanical ventilators, and syringe pumps for automated second-by-second vitals charting.", styles['TableCell']),
            Paragraph("Eliminates manual nursing vitals transcription and enables predictive hemodynamic shock alerts.", styles['TableCell'])
        ],
        [
            Paragraph("<b>4. AI Prescription Drug-Drug Interaction Warning</b>", styles['TableCellBold']),
            Paragraph("<i>Future Enhancement:</i> Advanced pharmacology AI engine that cross-references new prescriptions against patient allergies, renal clearance, and active medication regimens for adverse interaction warnings.", styles['TableCell']),
            Paragraph("Prevents medication errors and elevates clinical pharmacovigilance safety.", styles['TableCell'])
        ],
        [
            Paragraph("<b>5. Patient Mobile Portal & Self Check-In Kiosk</b>", styles['TableCellBold']),
            Paragraph("<i>Future Enhancement:</i> Native iOS/Android patient mobile application and lobby kiosk for QR-code queue check-in, doctor appointment booking, lab report downloads, and online bill payments.", styles['TableCell']),
            Paragraph("Eliminates front-desk reception bottlenecks and empowers patient self-service.", styles['TableCell'])
        ],
    ]

    t_road = Table(roadmap_items, colWidths=[130, 243, 150])
    t_road.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_road)

    story.append(Spacer(1, 14))

    # ==========================================
    # SECTION 16: DOCUMENT VERIFICATION & SIGNOFF
    # ==========================================
    story.extend(make_section_banner("16", "Document Verification & Formal Signoff", styles))
    
    signoff_data = [
        [
            Paragraph("<b>Document Author:</b>", styles['TableCellBold']),
            Paragraph("Hospital Systems Engineering & Clinical Documentation Team", styles['TableCell']),
            Paragraph("<b>Document Version:</b>", styles['TableCellBold']),
            Paragraph("v2.6 Enterprise Edition", styles['TableCell']),
        ],
        [
            Paragraph("<b>Review Status:</b>", styles['TableCellBold']),
            Paragraph("Verified & Approved for Executive Presentation", styles['TableCell']),
            Paragraph("<b>Effective Date:</b>", styles['TableCellBold']),
            Paragraph("September 10, 2026", styles['TableCell']),
        ],
        [
            Paragraph("<b>Security Classification:</b>", styles['TableCellBold']),
            Paragraph("Hospital Enterprise Confidential (Zero Code / Secrets)", styles['TableCell']),
            Paragraph("<b>Total Implemented Modules:</b>", styles['TableCellBold']),
            Paragraph("24 Complete Operational Modules", styles['TableCell']),
        ],
    ]
    t_sign = Table(signoff_data, colWidths=[120, 160, 110, 133])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_PRIMARY_LIGHT),
        ('GRID', (0,0), (-1,-1), 0.5, C_PRIMARY_BORDER),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sign)

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Confidentiality Notice:</b> This document contains proprietary operational, clinical, and architectural documentation "
        "for the ALN Cure Hospital Management System (HMS). It is intended solely for the use of hospital executive leadership, "
        "medical superintendents, authorized clinical staff, administrative directors, and project implementation teams. "
        "Unauthorized copying, distribution, or external disclosure is strictly prohibited.",
        styles['Body']
    ))

    # Build Document
    print(f"Compiling professional PDF documentation to '{filename}'...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF build completed successfully.")


if __name__ == '__main__':
    output_filename = "ALN_Cure_HMS_Complete_Professional_Documentation.pdf"
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
    build_pdf(output_filename)
