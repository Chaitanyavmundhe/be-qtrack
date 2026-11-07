# BE-QTrack: Bush Electromech Digital Quality & Production Traceability System

> **Problem Statement Sr. No. 6:** Automation & Digitalization  
> **Host Organization Reference:** Bush Electromech & Engineering Pvt. Ltd. (K-89 / K-256, MIDC Waluj, Chhatrapati Sambhajinagar, Maharashtra, India)  
> **Exhibition Date Target:** 16 November  
> **Reference Product:** 12 kV Indoor Air-Insulated Draw-out VCB Panel with ABB VD4 Circuit Breaker  

---

## ⚠️ Academic Prototype Disclaimer
**BE-QTrack** is a student-developed prototype designed to demonstrate automation and digitalization opportunities in medium-voltage switchgear manufacturing. Company product references (ratings, dimensions, clearances) are based strictly on publicly available documentation for the 12 kV Indoor VCB Panel from `bushelectromech.com`. Internal factory workflows, sample BOMs, test limits, and demonstration records are illustrative engineering models and require formal validation before any commercial deployment.

---

## 1. System Architecture & Overview

BE-QTrack is an integrated, industrial-grade software platform replacing five disconnected manual processes with a single central database and a unified **Panel Serial Number Traceability Model** (`BEE-12K-2026-XXX`):

```
                                  ┌───────────────────────────────┐
                                  │      BE-QTrack Central DB     │
                                  │   (PostgreSQL 16 on Socket)   │
                                  └──────────────┬────────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  │                              │                              │
        ┌─────────▼──────────┐         ┌─────────▼──────────┐         ┌─────────▼──────────┐
        │  1. Panel Registry │         │ 2. BOM Verifier    │         │ 3. Digital NCR     │
        │  & QR Code 360°    │         │ & Discrepancies    │         │ & 5-Whys CAPA      │
        └─────────┬──────────┘         └─────────┬──────────┘         └─────────┬──────────┘
                  │                              │                              │
                  └──────────────────────────────┼──────────────────────────────┘
                                                 │
                                       ┌─────────▼──────────┐
                                       │ 4. Pre-Dispatch    │
                                       │    Inspection (PDI)│
                                       └─────────┬──────────┘
                                                 │
                                       ┌─────────▼──────────┐
                                       │ 5. Real-Time KPI   │
                                       │    Live Dashboard  │
                                       └────────────────────┘
```

### Form-Factor Design Division
1. **🖥️ Executive Web KPI Suite (Desktop/Web Mode):**
   - High-density quality command center for management and evaluators.
   - Live First-Pass Yield (FPY), PDI First-Pass Rate, BOM Match Rate, and MTTR.
   - Interactive Pareto Defect Category distributions and Panel WIP stage breakdowns.
   - Real-time Server-Sent Events (SSE) data stream.

2. **📱 Shopfloor Field App (Mobile / Tablet Mode):**
   - Touch-optimized for shopfloor tablets and handheld devices.
   - Step-by-step touch Pre-Dispatch Inspection (PDI) checklist with numeric measured values.
   - Visual BOM component verifier flagging mismatches in high-contrast warnings.
   - Rapid field NCR logging with 5-Whys root cause questionnaire.
   - Camera QR scanner and Panel 360° digital passport lookup.

---

## 2. Technology Stack

- **Database:** PostgreSQL 16 (configured in user space with 64MB shared buffers for Intel Celeron / 8GB RAM resource protection).
- **ORM:** Prisma 5.22 with schema-level foreign keys, enums, and timestamps.
- **Backend API:** Node.js, Express, TypeScript, JWT Authentication, PDFKit, QRCode, Multer.
- **Frontend UI:** React 18, Vite 5, TypeScript, Tailwind CSS, Recharts, Lucide Icons, HTML5-QRCode.
- **Theme Palette:** Light Industrial Architecture (Warm stone surfaces `#f8f7f4`, dark graphite headings `#181b20`, safety amber/orange `#d97706` accents, emerald `#059669` verification tags, and crimson `#dc2626` defect flags — avoiding the generic bootstrap blue & white).

---

## 3. Quick Start & Execution

### Prerequisites
- Node.js v18+ (verified on Node v22.22)
- PostgreSQL 16 (cluster pre-initialized in `.pgdata`)

### Startup Commands

To start the database, backend, and frontend:

```bash
# 1. Start local PostgreSQL daemon (port 5433 / socket /tmp)
/usr/lib/postgresql/16/bin/postgres -D /home/chaitanya/Desktop/massia/.pgdata -k /tmp -p 5433 -c shared_buffers=64MB -c max_connections=40 &

# 2. Seed database with full demonstration dataset (if needed)
cd backend && npx tsx prisma/seed.ts && cd ..

# 3. Start Backend Server (runs on http://localhost:3001)
cd backend && npx tsx src/index.ts &

# 4. Start Frontend Web & Tablet Application (runs on http://localhost:5173)
cd frontend && npx vite --host 0.0.0.0 --port 5173
```

Now open: **`http://localhost:5173`** in your browser.

---

## 4. Role Accounts & Instant Demo Switcher

The application includes an **Exhibition Evaluator Switcher** in the top navigation bar. Click on your active role badge to instantly switch permissions:

| Role | Demo Email | Password | Primary Permissions |
|---|---|---|---|
| **Quality Manager** | `quality.head@beqtrack.com` | `password123` | Formally approve PDI, close NCRs, authorize dispatch release |
| **Quality Inspector** | `inspector@beqtrack.com` | `password123` | Execute PDI checklists, verify BOM items, log field NCRs |
| **Production Supervisor** | `production@beqtrack.com` | `password123` | Log manufacturing route stages, record corrective actions |
| **Design & Engineering** | `engineering@beqtrack.com` | `password123` | Review product specs, approve BOM revisions, raise ECR/ECN |
| **Procurement / Stores** | `stores@beqtrack.com` | `password123` | Inward goods inspection, vendor ratings, batch tracking |
| **Executive Management** | `director@beqtrack.com` | `password123` | Executive KPI dashboard, yield trends, audit compliance |
| **System Admin** | `admin@beqtrack.com` | `password123` | Full administrative control |

---

## 5. 5–8 Minute Exhibition Demonstration Guide

Follow this golden path sequence during evaluation or faculty review (use the **5-Min Exhibition Guided Story Pill** at the top of the app):

### Step 1: Panel Registration & Serial Tagging
- Navigate to **Panel 360°** (`/panel/BEE-12K-2026-001`).
- Show the unique serial number format `BEE-12K-2026-001` and its generated QR code.
- Highlight the ABB VD4 breaker configuration, ratings (12 kV, 1250 A, 31.5 kA), and customer order link (`WO-2026-081` for Wockhardt Pharma).

### Step 2: Shopfloor BOM Verification & Discrepancy Detection
- Switch to **BOM Verification** (`/bom-touch`).
- Show the 12 approved engineering components.
- **The Core Discrepancy:** The system highlights Item #3 in high-contrast red: **Auxiliary Contactor Relay**.
  - Required BOM Spec: `Schneider CAD32-BD (3NO+2NC)`
  - Physically Installed: `Schneider CAD33-BD (3NO+3NC)`
- Demonstrate that the BOM match rate drops to **91.7%**.

### Step 3: Raising & Investigating the NCR
- Click **"Raise NCR for Relay Mismatch"** to open the Fast NCR Logger (`/ncr-fast`).
- Review the generated **NCR-2026-001**.
- Show the **5-Whys Root Cause Analysis**:
  - *Why 1:* Wrong auxiliary relay mounted on rail.
  - *Why 2:* Operator picked CAD33 bin item.
  - *Why 3:* Stores bin label for CAD32 had mixed stock.
  - *Why 4:* Visual inspection on inward receipt did not verify contact configuration.
  - *Why 5:* Lack of barcode verification check at stores issue staging.
- Show the corrective replacement with CAD32 and closure verification.

### Step 4: Digital Pre-Dispatch Inspection (PDI)
- Navigate to **PDI Checklist** (`/pdi-touch`).
- Demonstrate touch inspection across 14 checkpoints:
  - Paint finish: RAL 7032 Siemens Grey, thickness 72 μm.
  - Mechanical: VCB racking torque 18 N-m, automatic metallic shutter operation.
  - High Voltage Dielectric: Withstood 28 kV for 60 seconds without flashover.
  - Contact Resistance: Ductor test 32.4 μΩ (spec ≤ 45 μΩ).
  - Siemens 7SJ82 trip test: 42 ms.

### Step 5: Pre-Dispatch PDF & Quality Gate Release
- Click **"Download PDI PDF"**.
- View the generated formal Pre-Dispatch Inspection Certificate complete with project details, checklist observations, linked NCR references, digital signatures, and academic disclaimer.
- Demonstrate **Quality Gate Enforcement**: The system will block dispatch release if there are unresolved high-severity NCRs or missing mandatory test checks.

### Step 6: Executive Quality KPI Dashboard
- Switch to **Web KPI Suite** (`/`).
- Show how the live metrics immediately reflect operations:
  - First-Pass Yield (FPY): **75.0%**
  - PDI First-Pass Rate: **100.0%**
  - BOM Match Rate: **91.7%**
  - Pareto chart showing BOM mismatch and shutter operating force as primary defects.
  - Live WIP breakdown across the 12 registered panels.

---

## 6. Published Company Facts vs Prototype Assumptions

| Domain | Company-Published Fact (`bushelectromech.com`) | Prototype Illustrative Assumption |
|---|---|---|
| **Product** | 12 kV Indoor VCB Switchboard | Fitted with illustrative ABB VD4 1250A draw-out breaker |
| **Ratings** | 12 kV, 28 kV PF withstand, 75 kV impulse, 31.5 kA 3s | Selected for default demonstration work order WO-2026-081 |
| **Partnership** | Certified ABB Gold Category MV Panel Builder | ABB VD4 breaker specified in BOM and PDI templates |
| **Paint** | Standard RAL 7032 Siemens Grey powder coating | Used as default acceptance criterion in PDI checklist |
| **QA Stages** | Brochure lists: Supplier Control, Engineering, Inspection, ECR/ECN, Performance/PSI | Formalized into digital gate progression: Draft → Engineering → BOM Approved → Material Ready → Manufacturing → In-Process QC → Final Testing → PDI → Dispatch Ready → Dispatched |
| **BOM / Inspection** | Specific internal checklist & BOM not published | Standardized 12-item switchgear BOM and 14-item PDI test plan modeled per IEC 62271-200 |

---

## 7. Known Limitations & Future Roadmap

1. **Hardware Testing Boundary:** BE-QTrack manages digital manufacturing records, BOMs, and inspection test results. It does not issue physical electrical switching or breaker tripping commands.
2. **Camera Permissions:** The QR scanner supports webcams and smartphone cameras; fallback manual serial lookup is provided for environments without active camera hardware.
3. **Multi-plant Scale:** Prototype configured for Unit-I (Plot K-89) and Unit-II (Plot K-256); future versions can support multi-facility load balancing.

---

*BE-QTrack © 2026 — Developed for Academic Demonstration & Engineering Exhibition.*
