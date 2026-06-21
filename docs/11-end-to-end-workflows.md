# End-to-End Workflows (Clone Blueprint)

Every major business process in one place. Use this when building the clone.

---

## 1. New Doctor Onboarding

```
MR finds new doctor → Doctor Creation Request → Doctor Approval → Doctor Master
                                                          ↓
                                              Doctor MR Linking (optional)
                                                          ↓
                                              Appears in Weekly Plan & DCR
```

| Step | Actor | Screen | Data created |
|------|-------|--------|--------------|
| 1 | MR | Doctor Creation Request | RequestId, name, specialty, address |
| 2 | Manager | Doctor Approval | Status = Approved |
| 3 | System | Doctor Master | DoctorId, RouteId, HQId |
| 4 | Admin | Doctor MR Linking | DoctorId ↔ EmpId |
| 5 | MR | Weekly Plan | Doctor in call list |

---

## 2. Monthly Tour Planning (RTP)

```
Month end → MR creates RTP → Submits → Manager approves → Guides daily DCR
```

| Step | Actor | Screen | Data |
|------|-------|--------|------|
| 1 | MR | Tour Programme | Calendar: day → route mapping |
| 2 | MR | Submit | Status = Pending |
| 3 | Manager | Tour Programme Approval | Approve/Reject |
| 4 | System | — | Status = Approved, locked |
| 5 | MR | DCR (daily) | Uses RTP to know today's route |

---

## 3. Daily Field Work (Core Loop)

```
Login → Dashboard → Field visits → DCR → Submit → Manager approves
```

| Step | Actor | Screen | Data |
|------|-------|--------|------|
| 1 | MR | Field Staff Dashboard | See pending tasks |
| 2 | MR | — (field) | Visit doctors/chemists |
| 3 | MR | DCR Add | DoctorVisits, Samples, Expenses |
| 4 | MR | POB (optional) | Order lines linked to visit |
| 5 | MR | DCR Submit | Status = Submitted |
| 6 | Manager | DCR Approval | Status = Approved |
| 7 | System | Reports | DCR data available |

---

## 4. Sample / Gift Flow

```
MR requisitions → Approval → Warehouse dispatches → MR receives → Gives in DCR
```

| Step | Screen | Data |
|------|--------|------|
| 1 | Gift/Sample Requisition | ProductId, Qty |
| 2 | Gift/Sample Requisition Approval | Approved qty |
| 3 | Gift/Sample Receive | ReceiveId, stock to MR |
| 4 | Allocate Gift/Sample (admin alt.) | Direct allocation |
| 5 | DCR | Sample given per doctor |

---

## 5. Leave Flow

```
MR applies → Manager approves → Balance deducted → Shows on calendar
```

| Step | Screen | Data |
|------|--------|------|
| 1 | Leave Application | Dates, type, reason |
| 2 | System | Check balance from Leave Policy |
| 3 | Leave Approval | Approve/reject |
| 4 | Leave Accrual (monthly) | Credit new balance |

---

## 6. Monthly Expense Flow

```
Daily DCR expenses + Expense Template → Expense Statement → Manager approves
```

| Step | Screen | Data |
|------|--------|------|
| 1 | DCR (daily) | Travel, food expenses |
| 2 | Expense Template | Fixed monthly allowance |
| 3 | Expense Statement | Auto-generated total |
| 4 | Expense Approval | Manager sign-off |
| 5 | Reports | Monthly Expense Summary |

---

## 7. Stock & Sales Flow

```
MR collects chemist stock → Stock Statement → Reports show sales
```

| Step | Screen | Data |
|------|--------|------|
| 1 | Stock Statement | Opening, purchase, sales, closing per product |
| 2 | Reports | Monthly Sales Summary, Sales Trend |
| 3 | Unlock (if error) | Unlock Stock Statement → fix → resubmit |

---

## 8. Weekly Planning Flow

```
MR plans doctors per day → Submits → Manager approves → Compared with DCR
```

| Step | Screen | Data |
|------|--------|------|
| 1 | Weekly Plan | Doctor per day for the week |
| 2 | Weekly Plan Approval | Manager approves |
| 3 | DCR (daily) | Actual visits logged |
| 4 | Weekly Achievement Report | Plan vs actual % |

---

## 9. Target & Achievement Flow

```
Admin sets targets → MR works all month → Reports show achievement %
```

| Step | Screen | Data |
|------|--------|------|
| 1 | Monthly Target | Product/call/POB targets per MR |
| 2 | DCR + POB (daily) | Actual calls and orders |
| 3 | Target Achievement Report | % achieved |

---

## 10. Admin Setup Flow (One-Time)

```
Company Info → Roles → Hierarchy → HQ/Route → Products → Doctors → Employees
```

| Order | Screen | Why first |
|-------|--------|-----------|
| 1 | Company Info | Tenant setup |
| 2 | Role Master + Role Setting | Who can access what |
| 3 | Hierarchy Master | Org structure |
| 4 | City, HQ, Route | Geography |
| 5 | Product, Brand, Division | What is sold |
| 6 | Doctor, Retailer, Stockist | Who is visited |
| 7 | Employee Master | Who logs in |
| 8 | DCR Setting, Leave Policy | Business rules |

---

## 11. Notification Triggers (Build All of These)

| Event | Who gets notified | Link opens |
|-------|-------------------|------------|
| RTP submitted | Manager | Tour Programme Approval |
| DCR submitted | Manager | DCR Approval |
| Leave applied | Manager | Leave Approval |
| Doctor request | Admin/Manager | Doctor Approval |
| Expense submitted | Manager | Expense Approval |
| Weekly plan submitted | Manager | Weekly Plan Approval |
| Unlock requested | Admin | Unlock approval screen |

---

## 12. Report Generation Flow (All 60 Reports)

```
User opens report → Selects filters → API fetches data → Grid/chart → Export
```

Every report follows the same clone pattern:
1. Filter form (date, employee, HQ, product, status)
2. `GET api/report/...` with filter params
3. DevExtreme grid or chart
4. Export button (Excel/PDF)

No data is modified in reports — read only.

---

## Clone Order (Recommended)

Build workflows in this sequence:

1. Auth + Employee + Roles
2. Masters (Doctor, Retailer, Product, HQ, Route)
3. RTP → DCR → POB (core loop)
4. Approvals for RTP and DCR
5. Weekly Plan + Leave
6. Expense + Stock Statement
7. Gift/Sample flow
8. Dashboards
9. All reports
10. Mail, notifications, mobile

See [08-clone-roadmap.md](./08-clone-roadmap.md) for timeline.
