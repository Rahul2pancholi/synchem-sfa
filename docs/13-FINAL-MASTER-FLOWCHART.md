# FINAL MASTER FLOWCHART — 100% Clone Blueprint

> Complete visual map of Synchem Salestrip SFA. Use with [12-MASTER-CLONE-BIBLE.md](./12-MASTER-CLONE-BIBLE.md).

---

## 1. System at a Glance

```mermaid
flowchart TB
    subgraph users [Users]
        AD[Admin - HO Indore]
        MAN[Manager - ASM/RSM/ZSM]
        FS[Field Staff - MR]
        MOB[Android Mobile App v1.2.54]
    end

    subgraph web [Web App - synchem.salestrip.in]
        UI[AngularJS + DevExtreme + AdminLTE]
        ROUTER[317 UI-Router States]
    end

    subgraph api [Backend - ASP.NET on IIS]
        TOKEN[POST /token OAuth2]
        REST[327 API endpoints /api/*]
    end

    subgraph data [Live Database - SYN Tenant]
        DB[(533 employees\n33730 doctors\n40260 retailers\n266 products\n155 HQs\n2973 routes)]
    end

    AD --> UI
    MAN --> UI
    FS --> UI
    FS --> MOB
    MOB --> REST
    UI --> TOKEN
    UI --> REST
    TOKEN --> REST
    REST --> DB
```

---

## 2. Login & Session Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as Web App
    participant API as POST /token
    participant LS as localStorage

    User->>Web: Open synchem.salestrip.in
    Web->>User: Login form (user + pass + compCode SYN)
    User->>API: grant_type=password username=admin,SYN
    API->>Web: JWT + menuList + employeeObj + config
    Web->>LS: authorizationData, menusData, employeeData
    alt roleType FS
        Web->>User: #/app/fieldStaff/dashboard
    else roleType MAN
        Web->>User: #/app/manager/dashboard
    else roleType AD
        Web->>User: #/app/management/dashboard
    end
    User->>API: GET api/* Authorization Bearer JWT
```

---

## 3. Organization Hierarchy (Live Data)

```mermaid
flowchart TB
    ADMIN[ADMIN - Level 0 - MGT]
    MSD[MSD - Manager Sales Dev - Level 5]
    ZSM[ZSM - Zonal Sales Manager - Level 6]
    RSM[RSM - Regional Sales Manager - Level 1]
    ASM[ASM - Area Sales Manager - Level 2]
    MR[MR - Sales Representative - Level 3 - FS]

    ADMIN --> MSD
    MSD --> ZSM
    ZSM --> RSM
    RSM --> ASM
    ASM --> MR
```

**Real example:** MR `MRJPR2` (Vacant Jabalpur3) → reports to Manager `Santosh Kumar` (empId 379) → HQ `Jabalpur 3`

---

## 4. Geography & Territory Model

```mermaid
flowchart LR
    STATE[State e.g. MADHYA PRADESH]
    CITY[City e.g. SATNA, INDORE]
    HQ[HeadQuarter e.g. Satna, Neemuch]
    ROUTE[Route/Beat e.g. SATNA-Bharhut Nagar-V-1]
    DOC[Doctor]
    RET[Retailer/Chemist]
    STO[Stockist]

    STATE --> CITY
    CITY --> HQ
    HQ --> ROUTE
    ROUTE --> DOC
    ROUTE --> RET
    HQ --> STO
```

**Real example from live data:**
- Doctor: `(major) RAMCHANDRA TRIPATHI` → Route `SATNA-Bharhut Nagar(V)-1(S5)` → HQ `Satna` → City `SATNA`
- Retailer: `ZULFI MEDICAL2` → Route `FOCUS NEEMUCH-SUP-CORE-(S3)` → HQ `Neemuch`

---

## 5. Master Data Setup Order (Clone Build Sequence)

```mermaid
flowchart TD
    A[1. Company SYN] --> B[2. Roles ADMIN/MR/Manager]
    B --> C[3. Hierarchy ADMIN→ZSM→RSM→ASM→MR]
    C --> D[4. States & Cities]
    D --> E[5. HQ - 155 territories]
    E --> F[6. Routes - 2973 beats]
    F --> G[7. LOVs: Designation, Dosage, Specialist, etc.]
    G --> H[8. Products - 266 SKUs + 90 Brands]
    H --> I[9. Doctors - 33730]
    I --> J[10. Retailers - 40260]
    J --> K[11. Stockists - 386]
    K --> L[12. Employees - 533]
    L --> M[13. DCR Settings + Leave Policy]
```

---

## 6. Monthly Field Force Cycle (THE MAIN LOOP)

```mermaid
flowchart TD
    START([Month Start]) --> RTP[MR creates Tour Programme RTP]
    RTP --> RTPA{Manager approves RTP?}
    RTPA -->|No| RTP
    RTPA -->|Yes| WEEK[MR creates Weekly Plan]
    WEEK --> WPA{Manager approves Weekly Plan?}
    WPA -->|Yes| DAILY

    subgraph DAILY [Every Working Day]
        DAILY[MR goes to field] --> VISIT[Visit doctors & chemists]
        VISIT --> DCR[Submit Daily Call Report DCR]
        VISIT --> POB[Personal Order Booking optional]
        DCR --> DCRA{Manager approves DCR?}
        DCRA -->|Yes| NEXT[Next day]
        NEXT --> DAILY
    end

    DAILY --> MONTHEND([Month End])
    MONTHEND --> STOCK[Stock Statement from chemists]
    MONTHEND --> EXP[Expense Statement]
    STOCK --> REPORTS[60 Reports + Dashboards]
    EXP --> EXPA{Manager approves expense?}
    EXPA --> REPORTS
    REPORTS --> TARGET[Target vs Achievement]
    TARGET --> START
```

---

## 7. Daily Call Report (DCR) — Internal Flow

```mermaid
flowchart TD
    OPEN[Open DCR Add] --> HDR[Header: Date, Work Type, Transport]
    HDR --> DOC[Doctor Visits Tab]
    DOC --> DET[Product Detailing per doctor]
    DET --> SMP[Samples / Gifts given]
    SMP --> RET[Retailer Visits Tab]
    RET --> EXP[Daily Expenses Tab]
    EXP --> CRM[CRM Activities optional]
    CRM --> SUBMIT[Submit DCR]
    SUBMIT --> NOTIF[Notify Manager]
    NOTIF --> APR{Approval}
    APR -->|Approved| LOCK[Locked - feeds reports]
    APR -->|Rejected| EDIT[MR edits & resubmits]
    LOCK --> UNLOCK{Need edit?}
    UNLOCK -->|Yes| UNREQ[Unlock DCR Request]
    UNREQ --> UNAPR[Admin approves unlock]
    UNAPR --> EDIT
```

**DCR Work Types (live):** GENERAL MEET, GIFT DISTRIBUTION, Order Submission, RETAILER SURVEY, Sample Distribution, Stock Statement Collection, Work With ASM/RSM/ZSM

**Transport modes (live):** By Bike, By Bus, By Car, By Train

---

## 8. Gift / Sample Flow

```mermaid
flowchart LR
    REQ[MR: Gift/Sample Requisition] --> APR[Manager/Admin Approval]
    APR --> REC[MR: Gift/Sample Receive]
    ALT[Admin: Allocate Gift/Sample] --> REC
    REC --> INV[MR Sample Inventory]
    INV --> DCR[Give in DCR visit]
    POOL[Pool Master] --> DIST[Pool Distribution]
    DIST --> INV
```

---

## 9. Approval Hub (15 Queues — Live Pending Counts)

```mermaid
flowchart TB
    subgraph pending [Pending Items - Live System]
        DCRP[1512 DCR pending]
        LEAVEP[113 Leave pending]
        RTPP[0 RTP pending]
        OTHER[0 Doctor/Retailer/Expense/etc.]
    end

    subgraph queues [Approval Screens]
        Q1[Doctor Approval]
        Q2[Retailer Approval]
        Q3[Tour Programme Approval]
        Q4[Gift Sample Approval]
        Q5[Leave Approval]
        Q6[DCR Approval]
        Q7[Expense Approval]
        Q8[Weekly Plan Approval]
        Q9[Unlock DCR]
        Q10[Doctor Delete]
        Q11[Retailer Delete]
        Q12[Infiltration]
        Q13[Input Sales Plan]
        Q14[Focused Activity]
        Q15[Manager Day Allocation]
    end

    DCRP --> Q6
    LEAVEP --> Q5
```

---

## 10. Product → Sale → Report Data Flow

```mermaid
flowchart LR
    PROD[Product Master\nFRUTOLYTE-Z LIQUID\nMRP 37 PTS 25.37]
    DCR[Detailing in DCR]
    POB[Order in POB]
    STOCK[Stock Statement]
    RPT1[Sales Reports]
    RPT2[Target Achievement]
    RPT3[Sample Distribution]

    PROD --> DCR
    PROD --> POB
    PROD --> STOCK
    DCR --> RPT3
    POB --> RPT2
    STOCK --> RPT1
```

---

## 11. All 7 Top Modules Map

```mermaid
mindmap
  root((Synchem SFA))
    Dashboard
      Field Staff
      Manager
      Management
    Master Setup
      35 screens
      Doctors Retailers Products
    Transaction
      DCR RTP POB
      Leave Expense Stock
    Reports
      60 read-only screens
    Admin
      Roles Permissions
    Setting
      DCR Rules Company
    Approval
      15 workflow queues
```

---

## 12. Clone Implementation Flow

```mermaid
flowchart TD
    P0[Phase 0: Auth + DB Schema] --> P1[Phase 1: Masters]
    P1 --> P2[Phase 2: RTP + DCR + POB]
    P2 --> P3[Phase 3: 15 Approvals]
    P3 --> P4[Phase 4: Expense Stock Leave]
    P4 --> P5[Phase 5: 3 Dashboards]
    P5 --> P6[Phase 6: 60 Reports]
    P6 --> P7[Phase 7: Mail E-Detailing]
    P7 --> P8[Phase 8: Android Mobile]
    P8 --> DONE[100% Clone Complete]

    P0 -.->|Seed data| SEED[data/live-sample-data.json]
    P1 -.->|Reference| DOCS[146 feature docs]
```

---

*This flowchart references live data fetched read-only from synchem.salestrip.in on 2026-06-12.*
