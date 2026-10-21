import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

REPORTS_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "..",
        "data",
        "reports"
    )
)
os.makedirs(REPORTS_DIR, exist_ok=True)


import re

def _format_val(val):
    if val is None or val == "":
        return "—"
    if isinstance(val, (int, float)):
        return f"{val:,}" if isinstance(val, int) else f"{val:.1f}"
    return str(val)


def _clean_metric_title(key: str) -> str:
    """Format CamelCase and snake_case into human-readable labels."""
    s = str(key).replace('_', ' ')
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', s)
    return s.title()


def _build_header_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=0,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#DC2626'),
        spaceAfter=12
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    cell_text = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )

    cell_bold = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )
    
    footer_style = ParagraphStyle(
        'DocFooter',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748B'),
        alignment=1
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "section": section_heading,
        "cell": cell_text,
        "cell_bold": cell_bold,
        "footer": footer_style
    }


def generate_master_disaster_pdf(disaster_data: dict) -> str:
    """
    Generate the Master Incident Action Plan (IAP) PDF for Central Command.
    Returns the absolute path to the generated PDF.
    """
    disaster_id = disaster_data.get("id", "NA")
    pdf_filename = f"disaster_{disaster_id}_master_iap.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    st = _build_header_styles()
    story = []

    # Title Banner
    story.append(Paragraph("DISASTER RESPONSE SYSTEM // EMERGENCY COMMAND", st["title"]))
    story.append(Paragraph(
        f"INCIDENT ACTION PLAN (IAP) - MASTER COORDINATION BRIEFING [INCIDENT #{disaster_id}]",
        st["subtitle"]
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#DC2626'), spaceAfter=10))

    # Basic Incident Details Table
    disaster_type = str(disaster_data.get("disaster_type", "Unknown")).upper()
    severity = str(disaster_data.get("severity", "Unknown")).upper()
    ai_severity = str(disaster_data.get("ai_severity", severity)).upper()
    people = _format_val(disaster_data.get("affected_people", 0))
    location = f"{disaster_data.get('city', '')}, {disaster_data.get('state', '')}, {disaster_data.get('country', '')}".strip(', ')
    coords = f"{disaster_data.get('latitude', '—')} N, {disaster_data.get('longitude', '—')} E"
    
    prediction = disaster_data.get("Prediction") or disaster_data.get("prediction") or {}
    priority = prediction.get("Priority", "HIGH")
    evacuation = prediction.get("Evacuation", "Active Evacuation in Progress")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")

    overview_data = [
        [Paragraph("Incident ID:", st["cell_bold"]), Paragraph(f"#{disaster_id}", st["cell"]),
         Paragraph("Generated At:", st["cell_bold"]), Paragraph(now_str, st["cell"])],
        [Paragraph("Disaster Type:", st["cell_bold"]), Paragraph(disaster_type, st["cell"]),
         Paragraph("Reported Severity:", st["cell_bold"]), Paragraph(severity, st["cell"])],
        [Paragraph("AI Analyzed Severity:", st["cell_bold"]), Paragraph(ai_severity, st["cell"]),
         Paragraph("Response Priority:", st["cell_bold"]), Paragraph(str(priority), st["cell"])],
        [Paragraph("Affected Population:", st["cell_bold"]), Paragraph(f"{people} individuals", st["cell"]),
         Paragraph("Location:", st["cell_bold"]), Paragraph(location or "Coordinate Point", st["cell"])],
        [Paragraph("Coordinates:", st["cell_bold"]), Paragraph(coords, st["cell"]),
         Paragraph("Evacuation Directive:", st["cell_bold"]), Paragraph(str(evacuation), st["cell"])],
    ]

    overview_table = Table(overview_data, colWidths=[110, 160, 110, 160])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 12))

    # Seven Department Resource Allocations
    resources = disaster_data.get("Resources") or disaster_data.get("resources") or {}

    dept_definitions = [
        ("Food & Civil Supplies", "Food", "#EA580C"),
        ("Water & Sanitation Board", "Water", "#0284C7"),
        ("Shelter & Relief Camp Management", "Shelter", "#0D9488"),
        ("Emergency Medical & Health Services", "Medical", "#E11D48"),
        ("Search & Rescue Authority (NDRF/SDRF)", "Rescue", "#B45309"),
        ("Police & Law Enforcement", "Police", "#4338CA"),
        ("Logistics & Transport Fleet", "Transport", "#475569")
    ]

    story.append(Paragraph("MULTI-AGENCY RESOURCE DEPLOYMENT ORDERS (7 DIVISIONS)", st["section"]))

    for dept_title, dept_key, badge_color in dept_definitions:
        dept_res = resources.get(dept_key) or {}
        if not dept_res:
            continue

        dept_rows = [[
            Paragraph(f"<b>{dept_title.upper()}</b>", ParagraphStyle('DeptTitle', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor(badge_color))),
            Paragraph("<b>Target Metric / Allocation</b>", st["cell_bold"])
        ]]

        for k, v in dept_res.items():
            formatted_key = _clean_metric_title(k)
            formatted_val = _format_val(v)
            dept_rows.append([
                Paragraph(formatted_key, st["cell"]),
                Paragraph(f"<b>{formatted_val}</b>", st["cell_bold"])
            ])

        dept_table = Table(dept_rows, colWidths=[240, 300])
        dept_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))

        story.append(KeepTogether([dept_table, Spacer(1, 8)]))

    # Footer Notice
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=6))
    story.append(Paragraph(
        "OFFICIAL COMMUNICATION • AI-DRIVEN MULTI-AGENT DISASTER COORDINATION PLATFORM • TRANSMITTED TO CENTRAL COMMAND",
        st["footer"]
    ))

    doc.build(story)
    return pdf_path


def generate_department_disaster_pdf(disaster_data: dict, department_key: str) -> str:
    """
    Generate a Department-Specific Emergency Action Order PDF.
    department_key in: ['food', 'water', 'shelter', 'medical', 'rescue', 'police', 'transport']
    """
    disaster_id = disaster_data.get("id", "NA")
    dept_key_clean = department_key.lower().capitalize()
    pdf_filename = f"disaster_{disaster_id}_{dept_key_clean.lower()}_order.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    st = _build_header_styles()
    story = []

    # Map colors and formal titles
    metadata_map = {
        "Food": ("DEPARTMENT OF FOOD & CIVIL SUPPLIES", "EMERGENCY RATION & MEAL ALLOCATION ORDER", "#EA580C"),
        "Water": ("WATER RESOURCES & SANITATION BOARD", "DRINKING WATER SUPPLY & PURIFICATION DIRECTIVE", "#0284C7"),
        "Shelter": ("SHELTER & RELIEF CAMP MANAGEMENT", "DISASTER RELIEF SHELTER & TENT PROVISION ORDER", "#0D9488"),
        "Medical": ("EMERGENCY MEDICAL RESPONSE CORPS", "TRIAGE, AMBULANCE & PHARMACEUTICAL MOBILIZATION", "#E11D48"),
        "Rescue": ("SEARCH & RESCUE COMMAND (NDRF/SDRF)", "OPERATIONAL SEARCH, RESCUE & EVACUATION DEPLOYMENT", "#B45309"),
        "Police": ("POLICE & PERIMETER SECURITY DIVISION", "LAW ENFORCEMENT, CORDON & GREEN CORRIDOR DIRECTIVE", "#4338CA"),
        "Transport": ("LOGISTICS & TRANSPORT FLEET COMMAND", "EMERGENCY EVACUATION & CARGO TRANSPORT FLEET ORDER", "#475569")
    }

    agency_name, directive_title, color_hex = metadata_map.get(
        dept_key_clean,
        (f"{dept_key_clean.upper()} DIVISION", "EMERGENCY RESOURCE ALLOCATION", "#0F172A")
    )

    # Title Banner
    story.append(Paragraph(agency_name, ParagraphStyle('AgencyTitle', parent=st["title"], textColor=colors.HexColor(color_hex))))
    story.append(Paragraph(f"{directive_title} — INCIDENT #{disaster_id}", st["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor(color_hex), spaceAfter=10))

    # Incident Context
    disaster_type = str(disaster_data.get("disaster_type", "Unknown")).upper()
    severity = str(disaster_data.get("severity", "Unknown")).upper()
    people = _format_val(disaster_data.get("affected_people", 0))
    location = f"{disaster_data.get('city', '')}, {disaster_data.get('state', '')}, {disaster_data.get('country', '')}".strip(', ')
    coords = f"{disaster_data.get('latitude', '—')} N, {disaster_data.get('longitude', '—')} E"

    context_data = [
        [Paragraph("Target Incident:", st["cell_bold"]), Paragraph(f"#{disaster_id} ({disaster_type})", st["cell"]),
         Paragraph("Severity Level:", st["cell_bold"]), Paragraph(severity, st["cell"])],
        [Paragraph("Target Location:", st["cell_bold"]), Paragraph(location, st["cell"]),
         Paragraph("Affected Persons:", st["cell_bold"]), Paragraph(f"{people} individuals", st["cell"])],
        [Paragraph("Coordinates:", st["cell_bold"]), Paragraph(coords, st["cell"]),
         Paragraph("Authorization:", st["cell_bold"]), Paragraph("AI Multi-Agent Coordinator", st["cell"])],
    ]

    context_table = Table(context_data, colWidths=[110, 160, 110, 160])
    context_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(context_table)
    story.append(Spacer(1, 14))

    # Specific Resource Table
    story.append(Paragraph("SPECIFIC RESOURCE MANDATE & ACTION ITEMS", st["section"]))

    resources = disaster_data.get("Resources") or disaster_data.get("resources") or {}
    dept_res = resources.get(dept_key_clean) or {}

    if dept_res:
        action_rows = [[
            Paragraph("<b>Resource Metric / Operational Requirement</b>", st["cell_bold"]),
            Paragraph("<b>Assigned Quantity / Specification</b>", st["cell_bold"]),
            Paragraph("<b>Status / Directive</b>", st["cell_bold"])
        ]]

        for k, v in dept_res.items():
            formatted_key = _clean_metric_title(k)
            formatted_val = _format_val(v)
            action_rows.append([
                Paragraph(formatted_key, st["cell"]),
                Paragraph(f"<b>{formatted_val}</b>", st["cell_bold"]),
                Paragraph("IMMEDIATE DEPLOYMENT", ParagraphStyle('Stat', parent=st["cell"], textColor=colors.HexColor('#059669'), fontName='Helvetica-Bold'))
            ])

        action_table = Table(action_rows, colWidths=[220, 180, 140])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94A3B8')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(action_table)
    else:
        story.append(Paragraph("Standard emergency protocol applies for this incident.", st["cell"]))

    # Priority Action Instructions
    story.append(Spacer(1, 14))
    story.append(Paragraph("FIELD EXECUTION GUIDELINES", st["section"]))
    instructions = [
        "1. Mobilize first-line emergency supplies within 45 minutes of order timestamp.",
        "2. Establish communication with the Central Command Field Officer upon arrival.",
        "3. Keep GPS telemetry and dispatch log updated through the Multi-Agent Incident Portal.",
        "4. In case of route obstruction or hazardous changes, notify Logistics & Police immediately."
    ]
    for instr in instructions:
        story.append(Paragraph(instr, st["cell"]))
        story.append(Spacer(1, 3))

    # Sign-off & verification
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=8))
    story.append(Paragraph(
        f"DISASTER EMERGENCY SERVICE DIRECTIVE • {agency_name} • VERIFIED BY AI COORDINATOR AGENT",
        st["footer"]
    ))

    doc.build(story)
    return pdf_path
