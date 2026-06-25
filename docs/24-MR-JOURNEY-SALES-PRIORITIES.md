# MR Journey & Sales — Current Build Priorities

> **Product focus (June 2026):** Complete the **Medical Representative (MR) field journey** and **sales improvement** features first.  
> **Leave / HR monthly cycle** = basic API exists → **low priority (P3)** until MR + sales MVP is solid.

**Related:** [08-clone-roadmap.md](./08-clone-roadmap.md) · [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) · [11-end-to-end-workflows.md](./11-end-to-end-workflows.md)

---

## Priority legend

| Level | Meaning |
|-------|---------|
| **P0** | Must ship next — blocks MR daily work or sales visibility |
| **P1** | Important soon — manager / HO needs |
| **P2** | Nice for go-live — can slip to Month 7 |
| **P3 (Low)** | Deferred — basic scaffold OK, no more investment now |

---

## P0 — MR journey (field rep daily work)

End-to-end: **Plan → Visit → Report → Order → Sync → Manager approve**

| # | Feature | Status | Next work |
|---|---------|--------|-----------|
| 1 | **Mobile offline DCR** | Done (MVP) | Polish: doctor picker, visit notes, conflict handling |
| 2 | **Mobile sync** (push/pull) | Done | Load test 100 concurrent; retry UX |
| 3 | **GPS check-in / check-out** | Done | Tie to DCR day record |
| 4 | **Mobile doctor / beat list** | Partial | Cached masters bootstrap; improve search & filters |
| 5 | **Web DCR** (create, submit) | Done | UI → `PageLayout`; link doctors visited |
| 6 | **Tour Programme (RTP)** | Done (web) | Mobile calendar polish; submit → approve loop UAT |
| 7 | **Weekly Plan** | Done (web) | Same as RTP |
| 8 | **Personal Order Booking (POB)** | **Done** | Mobile POB later |
| 9 | **Field Staff Dashboard** | **Done** | Quick actions (DCR, POB, RTP) |
| 10 | **Approvals: DCR, RTP, Weekly** | Done | **Push on submit/decision** — FCM when `FIREBASE_SERVER_KEY` set |

**Critical E2E path to keep green:**

```
MR login (mobile) → RTP view → offline DCR + GPS → sync → Manager approve DCR → POB on web
```

Run: `pnpm go-live:check` · mobile manual UAT

---

## P0 — Sales improvement (visibility & action)

| # | Feature | Status | Next work |
|---|---------|--------|-----------|
| 1 | **Employee POB report** (`REP12`) | Done | Filters, date range, Excel export |
| 2 | **Sales Summary report** (`REP41712`) | Done | Excel export |
| 3 | **Monthly Target vs Achievement** (`REP20`) | Done | Excel export |
| 4 | **DCR Summary** (`REP01`) | Done | — |
| 5 | **Visit Summary** (`REP02`) | Done | Excel export |
| 6 | **Missed Calls** (`REP22`) | Done | Excel export |
| 7 | **Monthly Covered Doctor** (`REP23`) | **Done** | — |
| 8 | **Doctor master** + DCR linkage | Done (masters) | **P0:** ensure every DCR visit ties to doctor; reporting |
| 9 | **Product master** + POB lines | Done | Rate, division filters on POB |
| 10 | **Manager dashboard** | Done | Sales KPI tiles (POB, coverage, missed) + approvals |

---

## P1 — Manager & HO (after P0 MR + sales)

| Feature | Status | Notes |
|---------|--------|-------|
| Doctor Approval (`MAS11`) + Creation Request (`MAS10`) | **Done** | `/app/doctor-creation-request` → `/app/doctor-approval` |
| Expense statement + approval polish | **Done** | `PageLayout`, detail drawer, manager approval drill-down |
| Remaining MVP reports (attendance, RTP summary, doctor report) | **Done** | REP13, REP10, REP18, REP04 |
| Excel export on all reports | **Done** | CSV export via `ReportExportButton` |
| Firebase push on approval | **Done (MVP)** | `PushNotificationService` + FCM adapter; mobile FCM SDK still pending |

---

## P3 (Low) — Leave & HR monthly cycle

> **Decision:** Leave has a **minimal viable API + web** (apply, approve, policy, balance).  
> **Do not expand** until MR journey + sales P0 items are complete.

| Item | Status | Why low priority |
|------|--------|------------------|
| Leave Application web (`TRN09`) | MVP done | Not on MR daily sales path |
| Leave Approval (`TRN10`) | MVP done | Manager can use later |
| Leave Policy (`SET03`) | MVP done | Admin-only, rare changes |
| Leave balance / encashment rules | Basic | No complex policy engine |
| **Mobile leave** | Not started | **P3 — defer** (explicitly out of scope) |
| Leave UI (`PageLayout` migration) | Not done | **P3 — defer** |
| Leave + attendance reports | Not started | **P3 — defer** |
| Leave on manager dashboard stat | Shown | OK to keep; no new leave features |

**Expense** stays **P1** (month-end) — still higher than leave for pharma SFA.

---

## P2 — AI Analytics Chatbot (Phase 10)

> **All chatbot work = [Phase 10](./08-clone-roadmap.md#phase-10--ai-analytics-chatbot-month-710-track-b)** · Spec: [25-AI-ANALYTICS-CHATBOT-PLAN.md](./25-AI-ANALYTICS-CHATBOT-PLAN.md)

| Sub-phase | What | Status | When |
|-----------|------|--------|------|
| **10A** | Admin config (`ADM05`), `insights-service` scaffold | **Done** | Now |
| **10B** | Semantic layer (metrics from sales reports) | **Done** | 8 metrics + SQL validator in `insights-service` |
| **10C** | Knowledge graph views | Pending | Month 8–9 |
| **10D** | Chat UI (Admin + Manager) + real answers | Pending | Month 9–10 |
| **10E–10F** | MR chat, field AI (voice, OCR) | Pending | Month 10+ |

Sales P0 report APIs + **10B** semantic layer are **Done**. Next: **10C** knowledge graph → **10D** chat UI.

### Sales suggestions (rule engine) — Phase 9.5

Between classic reports and LLM chat — **no AI required**:

| When | What |
|------|------|
| After REP02 + REP22 + REP20 live | `sales-insights` rules service (NestJS) | **Done** |
| Manager dashboard | Action cards: “3 MR coverage &lt; 70%”, “12 missed doctors” | **Done** |
| MR mobile (later) | Weekly digest from same rules |

Rules are **config YAML per tenant** (IF coverage low → suggest missed doctor list). LLM (10D) only **narrates** rule output — does not invent numbers.

**Start suggestions:** after Missed Calls + Manager KPI tiles — **not before**.

---

## Explicitly out of scope (now)

- Stock statement, Gift/Sample
- Infiltration, focused activity, input/sales plan
- Full 60-report parity
- Workflow builder (Phase 11)
- **Chatbot 10C–10D** (10A + 10B **Done** — see P2 above)

---

## Suggested sprint order (next 4–6 weeks)

| Sprint | Focus | Status |
|--------|--------|--------|
| 1 | POB web polish + Field Staff dashboard quick actions | **Done** |
| 2 | Sales Summary + Target vs Achievement reports (API + web) | **Done** |
| 3 | Visit Summary + Missed Calls reports | **Done** |
| 4 | Manager sales KPIs + Excel export | **Done** |
| 5 | Phase 9.5 rule-based sales suggestions | **Done** — `GET /api/v1/sales-insights/manager` + dashboard cards |
| 6 | P1 batch — MAS10/MAS11, expense polish, push MVP, 10B | **Done** |
| 7 | Phase 6 UAT + pilot 40 MRs | **Next** |
| 8+ | **Phase 10C** knowledge graph → **10D** chat UI | Pending |

---

## Doc maintenance

When completing a P0 item, update this file and [DEVELOPMENT.md](../DEVELOPMENT.md) checklist.  
Do **not** pull leave work into sprint unless client explicitly reprioritizes.

*Version 1.1 — June 2026 (P1 batch + 10B marked done)*
