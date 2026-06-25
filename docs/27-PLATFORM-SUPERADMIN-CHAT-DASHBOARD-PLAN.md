# Platform Super-Admin, Chat-First & Smart Dashboards

> **Vision (June 2026):** You own the SFA product. As **platform super-admin** you onboard pharma companies, turn features on/off per tenant, and users do most work via **AI assistant**. Dashboards show **what to fix** at a glance — not legacy menu codes.

**Related:** [25-AI-ANALYTICS-CHATBOT-PLAN.md](./25-AI-ANALYTICS-CHATBOT-PLAN.md) · [10-simple-guide-with-examples.md](./10-simple-guide-with-examples.md) · Platform login `/platform/login`

---

## 1. Three personas

| Persona | Login | Sees | Primary job |
|---------|-------|------|-------------|
| **Platform super-admin** (you) | `/platform/login` | All tenants, feature matrix, suspend company | Sell & configure SFA for each client |
| **Tenant admin** | `admin,SYN` | Masters, roles, AI settings | Setup doctors, products, users |
| **MR / Manager** | `mr1,SYN` / `rm1,SYN` | Role dashboard + chat | Daily field work + approvals |

---

## 2. Naming — modern labels (not legacy codes)

Users never need to see `TRN03` or `MAS11`. Menus and buttons use **plain language** (en / hi / hinglish via i18n).

| Legacy | Modern label (EN) |
|--------|-------------------|
| DCR / TRN03 | **Daily Visit Report** |
| RTP / TRN01 | **Monthly Field Plan** |
| POB / TRN04 | **Doctor Orders** |
| Weekly Plan | **Weekly Doctor Plan** |
| Doctor Creation Request | **Add New Doctor** |
| Doctor Approval | **Approve New Doctors** |
| Expense Statement | **Monthly Expense Claim** |

Menu `menuName` in seed + `menu.*` i18n keys for sidebar display.

---

## 3. Platform super-admin — phased delivery

### Phase A — Done in repo (this sprint)

- [x] Create / list tenants (`/platform/tenants`)
- [x] **Tenant feature flags** — `tenant_features` table + platform API
- [x] **Tenant detail page** — edit active + toggle feature packs
- [x] Default features seeded on new company create
- [x] Modern menu display names in seed

### Phase B — Next (2–3 weeks)

- [x] Create **first tenant admin employee** on onboarding (default `admin` user + password modal)
- [x] Enforce `Company.active` at tenant login
- [x] **Menu visibility** filtered by `tenant_features` (not just role)
- [ ] Industry templates: `pharma_starter` vs `pharma_full` preset
- [ ] Platform audit log UI

### Phase C — Later

- [ ] Billing / plan tiers per tenant
- [ ] White-label logo + theme per company
- [ ] Self-service tenant signup (optional)

---

## 4. Tenant feature catalog

Features are toggled per `compCode` by platform super-admin.

| Feature key | User-facing name | Modules unlocked |
|-------------|------------------|------------------|
| `field_visits` | Daily visits (DCR) | TRN03, APP01, REP01/02 |
| `doctor_orders` | Doctor orders (POB) | TRN04, REP12 |
| `field_plans` | Field plans (RTP + Weekly) | TRN01, TRN24, TRN02, APP04 |
| `doctor_onboarding` | New doctor requests | MAS10, MAS11 |
| `expense_claims` | Expense claims | TRN20, TRN21, REP05 |
| `sales_reports` | Sales & coverage reports | REP20, REP22, REP23, REP41712, … |
| `ai_assistant` | AI chat assistant | ADM05, insights-service, chat drawer |
| `leave_hr` | Leave (optional) | TRN09, TRN10, SET03 |

---

## 5. Chat-first — max work via bot

Goal: **Ask → Act** (not only Ask → Read).

| Phase | Capability | Status |
|-------|------------|--------|
| **10A** | Admin LLM config | **Done** |
| **10B** | Semantic metrics (POB, coverage, missed) | **Done** |
| **10C** | Knowledge graph (team, routes) | Pending |
| **10D** | Chat UI + read-only answers | **Done** — drawer + intent NL + insights fallback |
| **10E** | **Actions**: "show pending approvals", "my POB", navigate to screens | **Done (Week 2)** — intent router + action buttons |
| **10F** | MR mobile voice + field AI | Planned |

**Chat action examples (10E):**

- MR: *"Aaj ka DCR draft dikhao"* → lists + link to submit
- Manager: *"Kitne pending approval hain?"* → count + open queue
- Admin: *"Is mahine POB achievement?"* → chart + narrative

Architecture: `insights-service` returns `{ answer, actions: [{ type, path, payload }] }` — web executes safe navigation/actions only.

---

## 6. Smart dashboards — "dekhte hi samajh aa jaye"

### Design principles

1. **Traffic-light KPIs** — green / amber / red vs target (not raw numbers only)
2. **"Fix this first"** banner — top 1–3 actions sorted by urgency
3. **Role-specific** — MR sees today; manager sees team gaps
4. **No jargon** — subtitles explain each section

### MR dashboard sections

1. **Aaj kya karna hai** — plan + pending submit count
2. **Sales health** — POB %, coverage %, missed doctors (color coded)
3. **Improvement tips** — rule-based alerts (same engine as manager, scoped to self)
4. **Quick actions** — large buttons with modern names
5. **Ask AI** — floating chat button

### Manager dashboard sections

1. **Team sales health** — KPI cards with status colors
2. **Sales insights** — "3 MR coverage < 70%" (existing `SalesInsightsSection`)
3. **Pending approvals** — count tiles with drill-down
4. **Ask AI** — team analytics questions

### Admin dashboard (future)

- Tenant setup checklist (% masters filled, users active)
- Cross-MR heatmap (coverage by HQ)

---

## 7. Implementation order (recommended sprints)

| Sprint | Deliverable |
|--------|-------------|
| **S1** (now) | Plan doc, tenant features API + platform detail UI, modern menu names, dashboard health colors, chat drawer shell |
| **S2** (Week 2) | Intent chat (`messageKey` + actions), Help page `/app/help`, role welcome copy |
| **S3** (Week 3) | Chat draft lists (DCR/POB), today filter via “aaj” | **Done** |
| **S4** | Chat submit from bot, knowledge graph, Phase 6 UAT |

**Screen simplify (S1):** See [28-CLIENT-PRODUCT-SIMPLIFY-PLAN.md](./28-CLIENT-PRODUCT-SIMPLIFY-PLAN.md) — `/app/home`, `/app/approvals`, `/app/import`, MR slim menu.

---

## 8. Success metrics

| Metric | Target |
|--------|--------|
| New MR completes first DCR without training doc | < 15 min |
| Platform admin onboards new company | < 5 min |
| Manager identifies weak MR from dashboard | < 30 sec |
| Questions answered via chat (no menu hunt) | 50%+ by Month 3 |

---

*Version 1.0 — June 2026*
