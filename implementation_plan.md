# ALN Cure HMS — Implementation Plan

## Overview

Build **ALN Cure HMS** — a complete, AI-enabled Hospital Management System — as a modern, production-grade web application using **Vite + React + TypeScript** for the frontend with a full client-side demo architecture (mock API layer simulating a real backend) and **vanilla CSS** for styling.

The system will be fully functional for demonstration, navigation, and workflow purposes using in-memory/localStorage-based data, with all API interfaces designed for real backend integration.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript via Vite |
| Styling | Vanilla CSS (custom design system) |
| State Management | React Context + useReducer |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Date Handling | date-fns |
| Notifications | Custom toast system |
| Data | Mock service layer (localStorage + in-memory) |
| Build | Vite |

---

## Architecture

```
src/
├── assets/            # Logos, icons
├── components/        # Shared UI components
│   ├── common/        # Button, Card, Modal, Table, Form, Badge, etc.
│   ├── layout/        # Sidebar, Header, Footer, PageLayout
│   ├── charts/        # Chart wrappers
│   └── ai/            # AI panel, AI response card
├── contexts/          # AuthContext, NotificationContext, GlobalSearchContext
├── hooks/             # useAuth, usePatient, useAI, etc.
├── modules/           # Feature modules (one per HMS module)
│   ├── dashboard/
│   ├── patients/
│   ├── opd/
│   ├── ipd/
│   ├── laboratory/
│   ├── radiology/
│   ├── pharmacy/
│   ├── billing/
│   ├── doctors/
│   ├── nursing/
│   ├── diet/
│   ├── ambulance/
│   ├── bloodbank/
│   ├── admin/
│   ├── reports/
│   └── patient-portal/
├── services/          # Mock API services (ready to replace with real API)
├── data/              # Demo seed data
├── types/             # TypeScript interfaces for all entities
├── utils/             # Helpers, formatters, validators
└── styles/            # Global CSS, design tokens, typography
```

---

## Implementation Phases

### Phase 1 — Foundation & Design System
- Project scaffolding (Vite + React + TS)
- Design system (CSS variables, tokens, typography, colors)
- Core layout (sidebar, header, notifications, global search)
- Auth system (login, role-based routing, session)
- Demo seed data for all modules

### Phase 2 — Core Patient & OPD
- Patient registration & search
- Unique Patient ID system
- OPD appointment booking
- Queue/token management
- Doctor consultation interface
- Digital prescription

### Phase 3 — IPD & Bed Management
- Admission workflow
- Real-time bed map (visual)
- Ward/ICU management
- Nursing charts
- Diet chart
- Discharge summary

### Phase 4 — Diagnostics (Lab + Radiology)
- Lab test catalog & booking
- Sample tracking
- Report management
- Radiology scan booking
- Report & image upload simulation

### Phase 5 — Pharmacy & Billing
- Medicine inventory
- Prescription-linked dispensing
- Stock alerts
- Consolidated billing
- Invoice generation
- Insurance/TPA management

### Phase 6 — AI Layer
- ALN Cure AI assistant panel
- Patient summary AI
- Lab insight AI
- Draft note generation
- Hospital operations analytics AI
- Natural language search

### Phase 7 — Patient Portal, Admin, Reports, Emergency
- Patient portal (phone OTP login simulation)
- Admin control panel
- Full report generation
- Ambulance/emergency module
- Blood bank module
- Notification center

---

## Module Coverage

| # | Module | Status |
|---|---|---|
| 1 | Authentication & RBAC | ✅ Planned |
| 2 | Main Dashboard (Admin) | ✅ Planned |
| 3 | Patient Registration | ✅ Planned |
| 4 | OPD | ✅ Planned |
| 5 | IPD / Bed Management | ✅ Planned |
| 6 | Diet Chart | ✅ Planned |
| 7 | Laboratory | ✅ Planned |
| 8 | Radiology | ✅ Planned |
| 9 | Pharmacy | ✅ Planned |
| 10 | Billing & Accounts | ✅ Planned |
| 11 | Doctor Management | ✅ Planned |
| 12 | Nursing | ✅ Planned |
| 13 | Ambulance & Emergency | ✅ Planned |
| 14 | Blood Bank | ✅ Planned |
| 15 | Patient Portal | ✅ Planned |
| 16 | Admin Panel | ✅ Planned |
| 17 | Notifications | ✅ Planned |
| 18 | AI Assistant (ALN Cure AI) | ✅ Planned |
| 19 | Reports & Analytics | ✅ Planned |
| 20 | Global Search | ✅ Planned |

---

## Design System

**Color Palette:**
- Primary: `#0A84FF` (Medical Blue)
- Secondary: `#30D158` (Health Green)
- Accent: `#FF6B35` (Emergency Orange)
- Dark BG: `#0D1117`
- Card BG: `#161B22`
- Surface: `#21262D`
- Text Primary: `#E6EDF3`
- Text Secondary: `#8B949E`
- Border: `#30363D`
- Danger: `#FF453A`
- Warning: `#FFD60A`
- Success: `#30D158`
- AI Purple: `#BF5AF2`

**Typography:** Inter (Google Fonts)

**Theme:** Dark professional healthcare theme with glassmorphism cards, subtle gradients, and micro-animations.

---

## User Role Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@alnhms.com | Admin@123 |
| Hospital Admin | hadmin@alnhms.com | Admin@123 |
| Doctor | dr.smith@alnhms.com | Doctor@123 |
| Nurse | nurse@alnhms.com | Nurse@123 |
| Receptionist | receptionist@alnhms.com | Staff@123 |
| Pharmacist | pharma@alnhms.com | Staff@123 |
| Lab Technician | lab@alnhms.com | Staff@123 |
| Billing Staff | billing@alnhms.com | Staff@123 |
| Patient | 9876543210 (OTP: 1234) | — |

---

## Key Design Decisions

> [!IMPORTANT]
> **Single Patient ID**: Every module references `patientId` — lab, pharmacy, billing, IPD, OPD are all linked through this ID. No duplicate patient records.

> [!IMPORTANT]
> **AI is Assistive Only**: Every AI panel shows a clear disclaimer. All AI suggestions require user review/approval. AI never makes clinical decisions autonomously.

> [!NOTE]
> **Mock Backend**: All services are built against a clean interface layer. Replacing mock with real API calls requires only changing the service implementation, not the UI code.

> [!NOTE]
> **Offline-ready demo**: Uses localStorage for persistence so demo data survives page refreshes.

---

## Verification Plan

### Automated
- TypeScript type checking (`tsc --noEmit`)
- Vite build (`npm run build`)

### Manual
- Navigate all modules for each role
- Test patient journey end-to-end
- Verify AI assistant panels
- Verify emergency button visibility
- Test responsive layout on mobile/tablet/desktop
- Verify role-based sidebar and access restrictions
