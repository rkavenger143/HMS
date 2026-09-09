// ============================================================
// ALN Cure HMS — Help & Support Desk Seed Data
// ============================================================

import type { SupportTicket, KnowledgeBaseArticle } from '../types';

export const DEMO_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-0081',
    title: 'Biomedical Monitor Telemetry Connection Drop in ICU Bay 3',
    category: 'hardware_biomedical',
    priority: 'critical',
    status: 'in_progress',
    description: 'Multiparameter monitor at ICU Bed 03 disconnected from central nursing telemetry station. Vitals displaying locally on monitor but not syncing to nursing dashboard.',
    location: 'Floor 3, MICU Bay 3',
    department: 'Intensive Care Unit',
    createdBy: 'Sister Kavitha Nair',
    createdRole: 'Nurse',
    createdAt: '2026-09-09T08:15:00Z',
    assignedStaffId: 'it-002',
    assignedStaffName: 'Vikram Joshi (Biomedical IT)',
    slaDueDate: '2026-09-09T10:15:00Z',
    comments: [
      {
        id: 'cm-1',
        authorName: 'Sister Kavitha Nair',
        authorRole: 'Nurse',
        content: 'Patient vitals are stable, but telemetry alert needed for continuous monitoring.',
        isInternalNote: false,
        createdAt: '2026-09-09T08:15:00Z',
      },
      {
        id: 'cm-2',
        authorName: 'Vikram Joshi',
        authorRole: 'Biomedical IT',
        content: 'Investigating RJ45 wall jack switch port vlan mapping.',
        isInternalNote: true,
        createdAt: '2026-09-09T08:35:00Z',
      },
    ],
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TKT-2026-0082',
    title: 'TPA Pre-Authorization Portal Token Expiry Error',
    category: 'billing_claim_issue',
    priority: 'high',
    status: 'open',
    description: 'Star Health automated API bridge is returning 401 Unauthorized during instant eligibility check.',
    location: 'Billing & TPA Desk',
    department: 'Finance & Billing',
    createdBy: 'Anita Verma',
    createdRole: 'Billing Staff',
    createdAt: '2026-09-09T09:00:00Z',
    assignedStaffId: 'it-001',
    assignedStaffName: 'Sanjay Kumar (HIS Integration Lead)',
    slaDueDate: '2026-09-09T12:00:00Z',
    comments: [
      {
        id: 'cm-3',
        authorName: 'Anita Verma',
        authorRole: 'Billing Staff',
        content: 'Manual insurance portal upload is working as fallback, but API auto-fetch is stuck.',
        isInternalNote: false,
        createdAt: '2026-09-09T09:00:00Z',
      },
    ],
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TKT-2026-0083',
    title: 'Barcode Label Thermal Printer Ribbon Alignment in Pharmacy',
    category: 'pharmacy_system',
    priority: 'medium',
    status: 'assigned',
    description: 'Prescription dispenser barcode printer prints skewed labels with partial barcode cut off on right margin.',
    location: 'Ground Floor Pharmacy Counter 1',
    department: 'Pharmacy',
    createdBy: 'Meena Joshi',
    createdRole: 'Pharmacist',
    createdAt: '2026-09-09T07:45:00Z',
    assignedStaffId: 'it-003',
    assignedStaffName: 'Ganesh Babu (Hardware Tech)',
    slaDueDate: '2026-09-09T15:00:00Z',
    comments: [],
  },
  {
    id: 'tkt-004',
    ticketNumber: 'TKT-2026-0084',
    title: 'Radiology PACS Viewer Plugin Updated & Verified',
    category: 'his_software',
    priority: 'medium',
    status: 'resolved',
    description: 'DICOM web viewer 3D rendering plugin was failing on Chrome 128.',
    location: 'Radiology Reporting Room 2',
    department: 'Radiology',
    createdBy: 'Dr. Suresh Reddy',
    createdRole: 'Radiologist',
    createdAt: '2026-09-08T14:30:00Z',
    assignedStaffId: 'it-001',
    assignedStaffName: 'Sanjay Kumar',
    slaDueDate: '2026-09-08T18:30:00Z',
    resolvedAt: '2026-09-08T16:15:00Z',
    resolutionNotes: 'Updated WebGL shader renderer and cleared browser cache across all Radiology workstations. Verified 3D MPR working smoothly.',
    comments: [
      {
        id: 'cm-4',
        authorName: 'Sanjay Kumar',
        authorRole: 'HIS Integration Lead',
        content: 'Patched GPU acceleration flag in group policy.',
        isInternalNote: true,
        createdAt: '2026-09-08T15:45:00Z',
      },
    ],
  },
];

export const DEMO_KB_ARTICLES: KnowledgeBaseArticle[] = [
  {
    id: 'kb-001',
    title: 'How to Expedite Cashless TPA Claim Pre-Authorization',
    category: 'Billing & Insurance',
    snippet: 'Step-by-step guideline for uploading clinical summary, doctor notes, and estimated cost breakdown for fast-track cashless pre-auth.',
    content: `### Cashless TPA Pre-Authorization SOP
1. Open **Insurance Management** -> **Pre-Auth Requests**.
2. Click **New Pre-Auth** and select the admitted patient.
3. Attach:
   - OPD consultation prescription / Emergency initial assessment.
   - Admission advice with provisional ICD-10 diagnosis.
   - Diagnostic investigation reports (ECG, Troponin, CT, etc.).
   - Itemized package cost estimation.
4. Verify policy number, member ID, and valid photo ID.
5. Click **Submit to Insurance Portal / TPA**.
6. Normal turnaround is 30 to 45 minutes for emergency cases.`,
    views: 342,
    updatedAt: '2026-09-01',
    tags: ['insurance', 'tpa', 'preauth', 'cashless', 'billing'],
  },
  {
    id: 'kb-002',
    title: 'Connecting & Calibrating ICU Bedside Multiparameter Monitors',
    category: 'Biomedical & Equipment',
    snippet: 'Troubleshooting guide for Dräger / Philips telemetry monitors losing central nurse station IP sync.',
    content: `### Telemetry Connection Quick Fix
1. Check LAN link LED on the back of the patient monitor (Green = Active link, Amber = 100Mbps data).
2. If link is dead, check wall data port and re-seat the RJ45 cable.
3. Access Monitor Menu -> **System Setup** -> **Network Configuration**.
4. Ensure DHCP is enabled or static IP matches Subnet \`192.168.40.xxx\` for ICU VLAN.
5. If still unlinked, notify IT Helpdesk immediately at Ext. 4040.`,
    views: 215,
    updatedAt: '2026-08-28',
    tags: ['icu', 'telemetry', 'monitors', 'biomedical', 'vitals'],
  },
  {
    id: 'kb-003',
    title: 'Emergency Red Alert & Trauma Code Activation Protocol',
    category: 'Clinical Emergency',
    snippet: 'Hospital emergency codes and rapid response team dispatch escalation matrix.',
    content: `### Emergency Codes
- **Code Red**: Fire Emergency / Smoke Detection.
- **Code Blue**: Cardiac / Respiratory Arrest (Call 2222).
- **Code Pink**: Infant / Pediatric Abduction or Missing Child.
- **Code Trauma**: Multi-trauma / Mass casualty ER arrival.
- **Code Yellow**: Internal or external disaster / Hazardous spill.`,
    views: 580,
    updatedAt: '2026-09-05',
    tags: ['emergency', 'code-blue', 'triage', 'trauma', 'safety'],
  },
];
