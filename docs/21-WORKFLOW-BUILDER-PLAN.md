# Admin Workflow & Business Rules Builder (Future)

> **Status:** Planned — not started. Implement **after Phase 4** (generic `ApprovalService` + core transactions).  
> **Related:** [18-DEVELOPMENT-STANDARDS.md §15](./18-DEVELOPMENT-STANDARDS.md) · [08-clone-roadmap.md](./08-clone-roadmap.md) Phase 11 · [set01-dcr-setting.md](./modules/setting/set01-dcr-setting.md)

---

## Goal

Give each tenant admin a **drag-and-drop workflow designer** to configure approval chains and business validation rules **without code changes** — scoped per `compCode`.

**Not a full BPM engine.** Target Level 1–2 (approvals + validation). Level 3+ automation is optional later.

---

## Why This Fits the Product

| Today (code / settings) | With workflow builder |
|---------------------------|------------------------|
| Hardcoded approval queues (15 types) | Per-tenant approval chains on canvas |
| DCR settings (SET01 keys: lock days, min calls) | Visual rules: “if doctor count < 6 → block” |
| Same rules for all tenants | Platform template + tenant override |
| Rule changes = deploy | Publish workflow version + effective date |

Builds on existing primitives:

- `ApprovalQueueItem` + generic `ApprovalService` (§15 in dev standards)
- Entity lifecycle: `DRAFT → SUBMITTED → PENDING → APPROVED | REJECTED`
- Tenant settings (`company_settings`) and audit log

---

## Depth Levels (what we will / won't build)

| Level | Name | Scope | When |
|-------|------|-------|------|
| **L1** | Approval Flow Builder | Multi-step approvers, conditions, notify | **MVP of this feature** |
| **L2** | Validation Rule Builder | Pre-submit checks (DCR, RTP, POB) | Phase 11B |
| **L3** | Cross-module automation | Leave↔RTP, webhooks, scheduled jobs | Optional (Month 10+) |
| **L4** | Full BPMN / low-code | Parallel gateways, subprocess, SLA engine | **Out of scope** — use external tool if ever needed |

---

## Phase 11A — Approval Flow Designer (first deliverable)

### Admin UI (web)

Three-panel layout (library-first: **React Flow** or similar — no custom graph engine):

1. **Palette** — Triggers, Conditions, Approvers, Actions, Notifications  
2. **Canvas** — drag-and-drop nodes + edges  
3. **Properties** — selected node config (role, SLA, message keys)

### Block types (MVP)

| Block | Purpose |
|-------|---------|
| **Trigger** | Entity event: `DCR_SUBMITTED`, `RTP_SUBMITTED`, `LEAVE_SUBMITTED`, … |
| **Condition** | Field compare: amount, doctor count, role, HQ, division, date age |
| **Approver** | Resolver: `reporting_manager`, `role:AD`, `hierarchy:RM`, specific user |
| **Action** | `APPROVE_PATH`, `REJECT`, `SEND_BACK`, `AUTO_APPROVE`, `REQUIRE_GPS` |
| **Notify** | Push / in-app bell / email template (i18n keys) |
| **End** | Terminal state |

### Example — SYN DCR Policy

```
[DCR Submitted]
    → [IF doctor_visits >= 6]
        → YES → [RM Approve] → [AD Approve] → [Approved + Lock]
        → NO  → [Reject + message: mobile.dcr.minDoctors]
    → [IF work_date older than 3 days] → [Block submit]
    → [IF no GPS check-in] → [Require manager approval path]
```

### Runtime (backend)

- Workflow stored as **versioned JSON** per tenant (`workflow_definitions` table — TBD in implementation)
- **Runtime engine** evaluates graph on entity events; calls existing `ApprovalService` — does not duplicate queue logic
- Every decision logged: `workflow_run_id`, rule node id, input snapshot, outcome (audit + support)

### Entities (priority order)

1. DCR  
2. RTP  
3. Weekly Plan  
4. Leave  
5. Expense  
6. Doctor / Retailer master create  

### Screens (planned)

| Menu | Route | Description |
|------|-------|-------------|
| Workflow List | `/app/admin/workflows` | All definitions, draft/published |
| Flow Designer | `/app/admin/workflows/:id/designer` | Drag-and-drop canvas |
| Simulation | `/app/admin/workflows/:id/simulate` | “What if MR1 submits today?” |
| Publish history | `/app/admin/workflows/:id/versions` | Rollback |

Trilingual labels via `@synchem-sfa/shared-i18n` — admin-facing + user-facing reject messages.

---

## Phase 11B — Business Rules Designer (second deliverable)

Extends L1 with **pre-submit validation** (replaces / supplements SET01-style toggles).

| Trigger timing | Examples |
|----------------|----------|
| `BEFORE_SUBMIT` | Min doctor calls, lock after N days, geo-fence radius |
| `ON_SAVE` | Warn if RTP exceeds working days |
| `ON_SYNC` (mobile) | Block sync if mandatory fields missing |

| Action | Effect |
|--------|--------|
| `BLOCK` | Hard stop + localized message |
| `WARN` | Allow with acknowledgment |
| `REQUIRE_APPROVAL` | Route to L1 approval subgraph |
| `AUTO_FILL` | Default field from master/context |

**Depth limit:** Form fields + simple operators — no SQL, no user-written scripts.

---

## Phase 11C — Automation (optional, later)

- Scheduled reminders (pending DCR at 6 PM)
- Cross-entity: Leave approved → block RTP day
- Webhook to external ERP
- Requires: test mode, dry-run, strong observability

---

## Multi-tenant rules

| Rule | Decision |
|------|----------|
| Scope | Always `compCode`; optional future `headQuarterId` override |
| Platform template | Super admin seeds default workflows for new tenant |
| Versioning | Draft → Publish; effective `fromDate`; keep last N versions |
| Simulation | Run against sample employee without persisting |
| Security | Workflow edit = admin permission only; never on mobile |
| i18n | Reject/notify text = message keys (en / hi / hinglish) |

---

## What stays in code (not drag-and-drop)

- Auth, JWT, tenant isolation, RBAC menu structure  
- Mobile sync idempotency, conflict resolution  
- Core entity CRUD and DB schema  
- Report SQL (separate report builder if ever)  
- Payment / commission formulas (unless L3 with sandbox — deferred)

---

## Dependencies (must exist first)

| Prerequisite | Roadmap phase |
|--------------|---------------|
| Generic `ApprovalService` | Phase 4 |
| DCR / RTP / Weekly Plan submit APIs | Phase 2 |
| `company_settings` or config store | Phase 0 ✅ |
| Audit log on status changes | Phase 0 ✅ |
| Trilingual error messages | Phase 0 ✅ |

**Recommended start:** Month 7–8 (after MVP go-live + hardcoded approvals prove the engine).

---

## Success criteria

- [ ] Admin publishes DCR approval flow without developer deploy  
- [ ] Tenant A workflow ≠ Tenant B workflow  
- [ ] Simulation shows approver chain before publish  
- [ ] Rejected DCR shows rule name + trilingual message in audit  
- [ ] Rollback to previous workflow version in one click  
- [ ] Integration test: graph evaluation + `ApprovalService` called once per submit  

---

## Risks

| Risk | Mitigation |
|------|------------|
| Admin builds invalid graph (dead end, no approver) | Validate on publish; JSON schema + lint |
| Debugging “why rejected?” | `workflow_run` audit row per evaluation |
| Performance | Compile graph to decision table at publish time |
| Scope creep (BPMN) | Lock L1–L2 only in Phase 11 |

---

## Open questions (decide before implementation)

1. One global workflow per entity type, or multiple (e.g. DCR by division)?  
2. HQ-level override vs company-level only?  
3. Migrate existing SET01 keys into L2 rules or keep both?  
4. React Flow vs alternative (antd Pro Flow, xyflow)?  

---

*Document version: 1.0 — June 2026 — Planned for Phase 11 (post-MVP).*
