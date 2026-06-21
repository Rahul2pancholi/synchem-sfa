# Synchem Salestrip — Draw.io Diagrams

## Main file (all flows in one file)

**[synchem-all-flows.drawio](./synchem-all-flows.drawio)**

Open with:
- [draw.io](https://app.diagrams.net/) (free)
- VS Code + Draw.io Integration extension
- diagrams.net desktop app

## 25 pages inside one file

| # | Tab name | Type |
|---|----------|------|
| 01 | System Overview | Flowchart |
| 02 | Login Authentication | Flowchart |
| 03 | Organization Hierarchy | Flowchart |
| 04 | Geography Territory | Flowchart |
| 05 | Master Setup Order | Flowchart |
| 06 | Monthly Field Cycle | Flowchart |
| 07 | DCR Daily Call Report | Flowchart |
| 08 | Tour Programme RTP | Flowchart |
| 09 | Weekly Plan | Flowchart |
| 10 | POB Order Booking | Flowchart |
| 11 | Gift Sample Flow | Flowchart |
| 12 | Leave Application | Flowchart |
| 13 | Expense Statement | Flowchart |
| 14 | Stock Statement | Flowchart |
| 15 | Doctor Onboarding | Flowchart |
| 16 | Retailer Onboarding | Flowchart |
| 17 | Approval Pattern | Flowchart |
| 18 | All Approval Queues | Flowchart |
| 19 | Report Generation | Flowchart |
| 20 | Target Achievement | Flowchart |
| 21 | Notifications | Flowchart |
| 22 | Login As Employee | Flowchart |
| 23 | Class Diagram Entities | **Class diagram** |
| 24 | Planning Modules | Flowchart |
| 25 | Bulk Upload | Flowchart |

Use the **tabs at the bottom** of draw.io to switch between flows.

## Each page includes

| Box | Color | Content |
|-----|-------|---------|
| **📋 EXPLANATION** | Yellow note | Detailed technical + business description, APIs, live data counts |
| **🎯 USE CASE** | Green note | Actors, goal, preconditions, numbered success path, alternates, real Synchem example |
| **Legend bar** | Grey | Flow direction rules |
| **Numbered steps** | Blue/green shapes | **1. 2. 3. ...** on every shape — follow top to bottom |
| **Arrow labels** | On connectors | **→1 →2 →3** showing transition between steps |
| **◆ Diamonds** | Yellow | Decision points (Yes ✓ / No ✗ branches) |

Layout per page:
```
┌──────────────────────────────────────────────────────────┐
│  Title                                                    │
├─────────────────────────┬────────────────────────────────┤
│  📋 EXPLANATION (detail) │  🎯 USE CASE (actors, example)  │
├─────────────────────────┴────────────────────────────────┤
│  ➡ Legend: Follow 1 → 2 → 3 ... | ◆ = decision           │
├──────────────────────────────────────────────────────────┤
│  1. Start                                                 │
│       ↓ →2                                                │
│  2. Process step                                          │
│       ↓ →3                                                │
│  3. ◆ Decision? ──✗ No──→ 3b. Error                     │
│       ↓ ✓ Yes →4                                          │
│  4. End                                                   │
└──────────────────────────────────────────────────────────┘
```

**Regenerate:** `python3 diagrams/generate_drawio.py`
