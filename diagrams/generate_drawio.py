#!/usr/bin/env python3
"""Generate synchem-all-flows.drawio — per-component explanations, numbered flow."""
import html
import uuid
from pathlib import Path

OUT = Path(__file__).parent / 'synchem-all-flows.drawio'

# ── Styles ──────────────────────────────────────────────────────────────────
START = 'ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;fontStyle=1;'
END = 'ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;'
PROC = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;'
DEC = 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=10;fontStyle=1;'
DOC = 'shape=document;whiteSpace=wrap;html=1;boundedLbl=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=10;'
TITLE = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize=18;fontStyle=1;'
INTRO = 'text;html=1;strokeColor=none;fillColor=#f0f4ff;align=left;verticalAlign=top;spacingLeft=10;spacingTop=6;fontSize=10;fontColor=#333333;rounded=1;'
NOTE = 'shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;fillColor=#fff9e6;strokeColor=#d6b656;align=left;verticalAlign=top;spacingLeft=8;spacingTop=5;fontSize=9;'
LEGEND = 'text;html=1;strokeColor=#999999;fillColor=#f5f5f5;align=left;verticalAlign=middle;spacingLeft=8;fontSize=9;'
ARROW = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=blockThin;endFill=1;fontSize=10;fontStyle=1;fontColor=#333333;'
CLASS = 'swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=28;fillColor=#f5f5f5;strokeColor=#666666;fontSize=12;'
ATTR = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;fontSize=10;'

SMAP = {'start': START, 'proc': PROC, 'dec': DEC, 'end': END, 'doc': DOC}
LEGEND_STD = (
    'FLOW: Steps 1 → 2 → 3 … top to bottom  |  Arrow = transition number  |  '
    '◆ = Yes/No  |  Yellow note = explanation for that step only'
)

FLOW_X, FLOW_W = 40, 230
NOTE_X, NOTE_W = 290, 330
FLOW_Y0, FLOW_GAP = 88, 58


def esc(t):
    return html.escape(str(t), quote=True)


def cell(cid, parent, value, x, y, w, h, style, vertex=1, edge=0, source=None, target=None):
    c = f'<mxCell id="{cid}"'
    if edge:
        c += f' style="{style}" edge="1" parent="{parent}" source="{source}" target="{target}"'
        if value:
            c += f' value="{esc(value)}"'
    else:
        c += f' value="{esc(value)}" style="{style}" vertex="{vertex}" parent="{parent}"'
    c += '>'
    if not edge:
        c += f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/>'
    else:
        c += '<mxGeometry relative="1" as="geometry"/>'
    c += '</mxCell>'
    return c


def fmt_note(what='', who='', api='', data='', example=''):
    """Crisp formatted explanation block for one component."""
    lines = []
    if what:
        lines.append(f'▸ What\n  {what}')
    if who:
        lines.append(f'▸ Who\n  {who}')
    if api:
        lines.append(f'▸ API / Screen\n  {api}')
    if data:
        lines.append(f'▸ Data\n  {data}')
    if example:
        lines.append(f'▸ Example\n  {example}')
    return '\n\n'.join(lines) if lines else '▸ Info\n  See flow step.'


def note_height(text):
    lines = text.count('\n') + 1
    return max(54, min(110, 20 + lines * 11))


def S(label, typ='proc', **kw):
    """Shorthand step: label, type, explanation fields."""
    return {'label': label, 'type': typ, 'note': fmt_note(**kw)}


def layout_flow(steps, start_y=FLOW_Y0):
    """Return list of (sid, display_label, x, y, w, h, type, note_text)."""
    out, y = [], start_y
    for i, s in enumerate(steps, 1):
        sid = f's{i}'
        typ = s['type']
        hh = 70 if typ == 'dec' else 46
        num = s.get('num', f'{i}.')
        label = s['label']
        if not label.startswith(('①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬')):
            display = f'{num} {label}' if not label[0].isdigit() else label
        else:
            display = label
        out.append((sid, display, FLOW_X, y, FLOW_W, hh, typ, s['note']))
        y += FLOW_GAP + (14 if typ == 'dec' else 0)
    return out


def build_page(name, title, intro, steps, extra_nodes=None, extra_edges=None):
    nodes = layout_flow(steps)
    if extra_nodes:
        for en in extra_nodes:
            nodes.append(en)
    page_h = max(900, nodes[-1][3] + nodes[-1][5] + 80)
    page_w = NOTE_X + NOTE_W + 40

    cells = [
        cell('3', '1', title, 40, 10, 560, 28, TITLE),
        cell('4', '1', intro, 40, 42, NOTE_X + NOTE_W - FLOW_X, 36, INTRO),
        cell('5', '1', LEGEND_STD, 40, 78, page_w - 80, 24, LEGEND),
    ]
    nid, idmap = 20, {}
    for n in nodes:
        nid += 1
        sid, label, x, y, w, h, typ, note = n
        cid = str(nid)
        idmap[sid] = cid
        cells.append(cell(cid, '1', label, x, y, w, h, SMAP.get(typ, PROC)))
        nid += 1
        nh = note_height(note)
        cells.append(cell(str(nid), '1', note, NOTE_X, y - 2, NOTE_W, nh, NOTE))

    edges = []
    flow_ids = [n[0] for n in layout_flow(steps)]
    for i in range(len(flow_ids) - 1):
        edges.append((flow_ids[i], flow_ids[i + 1], f'→{i + 1}'))
    edges.extend(extra_edges or [])

    for e in edges:
        nid += 1
        lbl = e[2] if len(e) > 2 else ''
        cells.append(cell(str(nid), '1', lbl, 0, 0, 0, 0, ARROW, edge=1,
                          source=idmap[e[0]], target=idmap[e[1]]))

    body = '\n        '.join(cells)
    return f'''  <diagram id="{uuid.uuid4()}" name="{esc(name)}">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_w}" pageHeight="{page_h}">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        {body}
      </root>
    </mxGraphModel>
  </diagram>'''


def extra(sid, label, y, note, typ='end'):
    return (sid, label, 40, y, FLOW_W, 46, typ, note)


diagrams = []

# ── 01 System Overview ───────────────────────────────────────────────────────
diagrams.append(build_page(
    '01-System-Overview', '01 — System Overview',
    'End-to-end path: browser → login → JWT → role dashboard → daily SFA work.',
    [
        S('User opens https://synchem.salestrip.in/', 'start',
          what='Load Synchem tenant URL in browser.',
          who='Admin, Manager, MR',
          example='https://synchem.salestrip.in/'),
        S('Browser loads AngularJS app + DevExtreme + AdminLTE', 'proc',
          what='SPA bootstraps UI shell and route config.',
          who='Browser (client)',
          data='317 UI routes · 146 menu screens'),
        S('Enter Username + Password + Company Code SYN', 'proc',
          what='Collect login credentials on login form.',
          who='End user',
          api='#/app/login',
          data='compCode = SYN (Synchem)'),
        S('POST /token (OAuth2 password grant)', 'proc',
          what='Exchange credentials for JWT access token.',
          who='Angular authService',
          api='POST /token',
          data='username={user},SYN'),
        S('Server validates credentials?', 'dec',
          what='Check employee exists, active, password match.',
          who='ASP.NET auth server',
          api='Employee Master lookup'),
        S('Return JWT + menuList + employeeObj + SET config', 'proc',
          what='Send session payload to client.',
          who='Server',
          data='146 menus · SET001–SET131 flags · empId · roleType'),
        S('Store session in localStorage', 'proc',
          what='Persist token and user context client-side.',
          who='Browser',
          data='authorizationData, menusData, employeeData'),
        S('Redirect to role dashboard', 'proc',
          what='Route user by roleType after login.',
          who='UI-Router',
          api='AD→management · MAN→manager · FS→fieldStaff'),
        S('Work in Master / Transaction / Reports / Approval', 'end',
          what='User operates SFA modules per permissions.',
          who='Logged-in user',
          example='Admin sees 1512 pending DCR approvals'),
    ],
    extra_nodes=[extra('s5b', '5b. ✗ Invalid — show error, stay on login', 520,
                       fmt_note(what='Login failed.', who='User', example='Wrong password → invalid_grant'))],
    extra_edges=[('s5', 's5b', '✗ No')],
))

# ── 02 Login ─────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '02-Login-Authentication', '02 — Login & Authentication',
    'OAuth2 password grant → JWT stored → sidebar built → dashboard redirect.',
    [
        S('Navigate to #/app/login', 'start', what='Open login route.', who='User', api='#/app/login'),
        S('Enter User Name + Password + Company Code SYN', 'proc', what='Fill three required fields.', who='User'),
        S('Click Sign In — loading spinner', 'proc', what='Disable form; show progress.', who='UI'),
        S('POST /token with username=user,SYN', 'proc', what='Send grant_type=password body.', who='authService', api='POST /token'),
        S('Server: credentials valid?', 'dec', what='Validate user,SYN,password.', who='Server'),
        S('Parse JWT claims (empId, roleType, compCode)', 'proc', what='Decode token payload.', who='Client', data='roleType AD/MAN/FS'),
        S('Store authorizationData + menusData + employeeData', 'proc', what='Write localStorage keys.', who='Browser'),
        S('Build sidebar from menuList permissions', 'proc', what='Render allowed menus only.', who='Angular', data='146 menus for admin'),
        S('Redirect to role dashboard URL', 'proc', what='Navigate by roleType.', who='UI-Router'),
        S('Session active — API calls enabled', 'end', what='Bearer token on all /api/* calls.', who='HTTP interceptor'),
    ],
    extra_nodes=[extra('s5b', '5b. ✗ Show error — restore Sign In', 520,
                       fmt_note(what='Display error_description via toastr.', who='User'))],
    extra_edges=[('s5', 's5b', '✗ No')],
))

# ── 03 Hierarchy ─────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '03-Organization-Hierarchy', '03 — Organization Hierarchy',
    'Reporting chain controls data visibility and approval routing.',
    [
        S('Admin opens Hierarchy Master', 'start', what='Configure org levels.', who='Admin', api='#/app/hierachy'),
        S('Define levels: ADMIN, MSD, ZSM, RSM, ASM, MR', 'proc', what='Set hierarchy types.', who='Admin'),
        S('Set hierachyLevel and hierachyType per level', 'proc', what='Numeric level ordering.', who='Admin', data='L0 ADMIN → L3 MR'),
        S('Assign hierachyId to each Employee', 'proc', what='Link employee to level.', who='Admin', api='users/employee-list'),
        S('Set reportingManager (FK to Employee)', 'proc', what='Direct manager for approvals.', who='Admin'),
        S('MR submits DCR → routes to reporting manager', 'proc', what='Approval queue assignment.', who='System', example='MR → ASM Santosh Kumar'),
        S('Manager dashboard shows team pending counts', 'proc', what='Scoped pending badges.', who='Manager'),
        S('Admin has company-wide visibility', 'end', what='No team filter for AD role.', who='Admin'),
    ],
))

# ── 04 Geography ─────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '04-Geography-Territory', '04 — Geography & Territory',
    'Territory model links every customer to HQ and route for field ops.',
    [
        S('Create State', 'start', what='Top-level geography.', who='Admin', example='MADHYA PRADESH'),
        S('Add Cities under each state', 'proc', what='City master under state.', who='Admin'),
        S('Create HQ / Territory — 155 total', 'proc', what='Sales territory unit.', who='Admin', example='Satna, Neemuch'),
        S('Create Routes / Beats within HQ — 2973', 'proc', what='Daily beat for MR visits.', who='Admin', api='route/routeListAll'),
        S('Register Doctors on routes — 33730', 'proc', what='HCP linked to route.', who='Admin/MR'),
        S('Register Retailers on routes — 40260', 'proc', what='Chemist linked to route.', who='Admin/MR'),
        S('Link Stockists to HQ — 386', 'proc', what='Distributor per HQ.', who='Admin'),
        S('MR uses territory in RTP, DCR, POB, Reports', 'end', what='All field work filtered by route.', who='MR',
          example='Dr. Tripathi · Route SATNA-Bharhut Nagar(S5)'),
    ],
))

# ── 05 Master Setup ──────────────────────────────────────────────────────────
diagrams.append(build_page(
    '05-Master-Setup-Order', '05 — Master Setup Order (Build Sequence)',
    'Clone Phase 1 order — each step depends on previous FK constraints.',
    [
        S('① Register Company SYN', 'start', what='Tenant root record.', who='Admin', data='Synchem Pharmaceuticals Pvt. Ltd.'),
        S('② Create Roles: ADMIN, MR, Manager', 'proc', what='RBAC roles first.', who='Admin', data='roleId 1,2,3'),
        S('③ Setup Hierarchy ADMIN→ZSM→RSM→ASM→MR', 'proc', what='Org structure.', who='Admin'),
        S('④ Import States and Cities', 'proc', what='Geography base.', who='Admin', data='7 states'),
        S('⑤ Create 155 Headquarters', 'proc', what='Territory units.', who='Admin'),
        S('⑥ Create 2973 Routes', 'proc', what='Beats under HQ.', who='Admin'),
        S('⑦ Setup LOVs (Designation, Dosage, Holiday...)', 'proc', what='Dropdown masters.', who='Admin', data='8+ LOV types'),
        S('⑧ Import 266 Products + 90 Brands', 'proc', what='Product catalog.', who='Admin', data='Division: Ethical'),
        S('⑨ Import Doctors (bulk upload)', 'proc', what='HCP master.', who='Admin', api='doctor/bulkUpload'),
        S('⑩ Import Retailers + ⑪ Stockists', 'proc', what='Trade master data.', who='Admin'),
        S('⑫ Create 533 Employee accounts', 'proc', what='Users with role+HQ+manager.', who='Admin'),
        S('⑬ Configure DCR + Leave Policy → GO LIVE', 'end', what='Transaction rules enabled.', who='Admin'),
    ],
))

# ── 06 Monthly Cycle ─────────────────────────────────────────────────────────
diagrams.append(build_page(
    '06-Monthly-Field-Cycle', '06 — Monthly Field Force Cycle',
    'Main business loop: plan → execute → close → review. Repeats monthly.',
    [
        S('① MONTH START — prior reports reviewed', 'start', what='Month opens.', who='MR + Manager'),
        S('② MR creates Tour Programme (RTP)', 'proc', what='Monthly route calendar.', who='MR', api='#/app/monthlyRTP'),
        S('③ Manager approves RTP', 'proc', what='Lock monthly plan.', who='Manager'),
        S('④ MR creates Weekly Plan', 'proc', what='Doctor-level week schedule.', who='MR'),
        S('⑤ Manager approves Weekly Plan', 'proc', what='Approve call plan.', who='Manager'),
        S('⑥ EACH DAY: MR travels assigned route', 'proc', what='Field execution.', who='MR'),
        S('⑦ EACH DAY: MR visits doctors and chemists', 'proc', what='Physical calls.', who='MR'),
        S('⑧ EACH DAY: MR submits DCR', 'proc', what='Daily call report.', who='MR', data='1512 pending live'),
        S('⑨ Manager approves DCR', 'proc', what='Review and lock DCR.', who='Manager'),
        S('⑩ MONTH END: Stock Statement', 'proc', what='Chemist stock survey.', who='MR'),
        S('⑪ MR submits Expense Statement', 'proc', what='Monthly reimbursement.', who='MR'),
        S('⑫ Manager approves Expense', 'proc', what='Sign-off expenses.', who='Manager'),
        S('⑬ Reports: Target vs Achievement → MONTH CLOSE', 'end', what='Performance review.', who='Manager/Admin'),
    ],
))

# ── 07 DCR ───────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '07-DCR-Daily-Call-Report', '07 — DCR Daily Call Report',
    'Most critical transaction — documents every field day. Manager must approve.',
    [
        S('MR opens DCR Add', 'start', what='Start new daily report.', who='MR', api='#/app/dcrRecord/add'),
        S('Set date, work type, transport mode', 'proc', what='DCR header fields.', who='MR', data='Bike/Bus/Car/Train'),
        S('DOCTOR TAB: Add visit — select doctor', 'proc', what='Log doctor call.', who='MR', api='dcr/doctor'),
        S('Log product detailing — name + duration', 'proc', what='Which products discussed.', who='MR', example='ACENOVA 10 min'),
        S('Record samples/gifts — product + qty', 'proc', what='Promotional items given.', who='MR'),
        S('RETAILER TAB: Add chemist visit', 'proc', what='Chemist call details.', who='MR', api='dcr/retailer-stockist'),
        S('EXPENSE TAB: Enter travel/food expenses', 'proc', what='Daily expense lines.', who='MR'),
        S('Optional: Link POB orders from visit', 'proc', what='Attach order booking.', who='MR', api='pob/'),
        S('Review totals — doctors, retailers, expense', 'proc', what='Pre-submit validation.', who='MR'),
        S('SUBMIT — status = Pending', 'proc', what='Send for approval.', who='MR'),
        S('Manager opens DCR Approval queue', 'proc', what='Review pending DCRs.', who='Manager', api='dcr/dcr-approval'),
        S('Manager approves or rejects?', 'dec', what='Approve or send back.', who='Manager'),
        S('Approved → DCR LOCKED → reports + expense', 'end', what='Immutable approved record.', who='System'),
    ],
))

# ── 08 RTP ───────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '08-Tour-Programme-RTP', '08 — Tour Programme (RTP)',
    'Monthly route calendar — planned vs actual tracked in deviation reports.',
    [
        S('MR opens Tour Programme', 'start', what='Plan next month routes.', who='MR', api='#/app/monthlyRTP'),
        S('Select target month and year', 'proc', what='Calendar period.', who='MR'),
        S('Calendar view — click each day', 'proc', what='Day-by-day assignment.', who='MR', api='monthly-rtp/weekCalendar/'),
        S('Assign route/beat to each working day', 'proc', what='Where MR will work.', who='MR'),
        S('Set work type per day', 'proc', what='Field / meeting / leave.', who='MR'),
        S('Holidays auto-marked from Holiday Master', 'proc', what='Non-working days.', who='System'),
        S('Review full month route coverage', 'proc', what='Check gaps before submit.', who='MR'),
        S('SUBMIT — status = Pending', 'proc', what='Await manager approval.', who='MR'),
        S('Manager reviews Tour Programme Approval', 'proc', what='Approval queue.', who='Manager'),
        S('Manager APPROVES — locked', 'proc', what='Status = Approved.', who='Manager'),
        S('MR follows RTP daily — actual in DCR', 'end', what='Plan vs actual comparison.', who='MR'),
    ],
))

# ── 09 Weekly Plan ───────────────────────────────────────────────────────────
diagrams.append(build_page(
    '09-Weekly-Plan', '09 — Weekly Plan',
    'Doctor-level weekly schedule — compared to DCR actuals in achievement report.',
    [
        S('MR opens Weekly Plan', 'start', what='Plan week calls.', who='MR', api='#/app/weeklyPlan'),
        S('System loads doctors from MR routes', 'proc', what='Auto-populate doctor list.', who='System'),
        S('Assign doctors to each day Mon–Sat', 'proc', what='Day-wise call plan.', who='MR'),
        S('Consider doctor preferred visit days', 'proc', what='Scheduling hint.', who='MR'),
        S('SUBMIT — status Pending', 'proc', what='Send for approval.', who='MR'),
        S('Manager approves Weekly Plan', 'proc', what='Approval queue.', who='Manager', api='weeklyPlan/pending'),
        S('MR executes visits during week', 'proc', what='Field work.', who='MR'),
        S('Each visit recorded in daily DCR', 'proc', what='Actual call log.', who='MR'),
        S('Weekly Achievement Report: plan vs actual %', 'end', what='REP36 metric.', who='Manager', example='87% achievement'),
    ],
))

# ── 10 POB ───────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '10-POB-Order-Booking', '10 — POB (Personal Order Booking)',
    'Record product orders during field visits — feeds target achievement.',
    [
        S('MR identifies order during visit', 'start', what='Order opportunity.', who='MR'),
        S('Open POB screen', 'proc', what='New order form.', who='MR', api='#/app/pob/add'),
        S('Select party type: Doctor or Retailer', 'proc', what='Order party category.', who='MR'),
        S('Select party from route/HQ list', 'proc', what='Filtered customer list.', who='MR', api='pob/partyData/'),
        S('Add product lines — product + quantity', 'proc', what='Line items.', who='MR', example='ACENOVA × 50 strips'),
        S('System calculates amount (qty × rate)', 'proc', what='Auto total.', who='System', data='MRP ₹110 · PTS ₹75.43'),
        S('Save POB — pobId generated', 'proc', what='Persist order.', who='MR', api='pob/number'),
        S('Optional: link POB to today\'s DCR', 'proc', what='Cross-reference visit.', who='MR'),
        S('POB counted in monthly target achievement', 'end', what='Sales KPI update.', who='System'),
    ],
))

# ── 11 Gift Sample ───────────────────────────────────────────────────────────
diagrams.append(build_page(
    '11-Gift-Sample-Flow', '11 — Gift & Sample Flow',
    'Track promotional inventory from requisition to doctor distribution.',
    [
        S('MR creates Gift/Sample Requisition', 'start', what='Request samples.', who='MR', api='#/app/requisition'),
        S('Select products + quantities', 'proc', what='Requisition lines.', who='MR'),
        S('SUBMIT requisition — Pending', 'proc', what='Await approval.', who='MR'),
        S('Manager approves Requisition', 'proc', what='Approval gate.', who='Manager', api='requisition/pending'),
        S('Warehouse dispatches samples', 'proc', what='Physical dispatch.', who='Warehouse'),
        S('MR records Gift/Sample Receive', 'proc', what='Confirm receipt.', who='MR', api='gs-receive/requisition'),
        S('Samples added to MR inventory', 'proc', what='Personal stock pool.', who='System'),
        S('During DCR — record samples to doctor', 'proc', what='Distribution log.', who='MR'),
        S('Inventory reduced — Sample reports updated', 'end', what='Audit trail complete.', who='System'),
    ],
))

# ── 12 Leave ─────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '12-Leave-Application', '12 — Leave Application',
    'Time-off with balance check — affects attendance and tour calendar.',
    [
        S('MR opens Leave Application', 'start', what='Apply for leave.', who='MR', api='#/app/leaveApplication'),
        S('Select leave type: CL / SL / PL', 'proc', what='Leave category.', who='MR', api='leave/leaveType'),
        S('Enter from-date and to-date', 'proc', what='Leave period.', who='MR'),
        S('Enter reason for leave', 'proc', what='Mandatory reason.', who='MR'),
        S('System checks leave balance', 'proc', what='Balance API call.', who='System', api='leave/employee-leave-balance/'),
        S('Sufficient balance?', 'dec', what='Enough days remaining.', who='System'),
        S('SUBMIT — status Pending', 'proc', what='Send to manager.', who='MR', data='113 pending live'),
        S('Manager approves Leave', 'proc', what='Approval queue.', who='Manager'),
        S('Balance deducted — calendar updated', 'end', what='Attendance reflects leave.', who='System'),
    ],
    extra_nodes=[extra('s6b', '6b. ✗ Insufficient balance — error', 480,
                       fmt_note(what='Block submit.', who='MR', example='0 CL days left'))],
    extra_edges=[('s6', 's6b', '✗ No')],
))

# ── 13 Expense ───────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '13-Expense-Statement', '13 — Expense Statement',
    'Monthly reimbursement from DCR expenses + fixed allowance template.',
    [
        S('Month end — auto-generate expense statement', 'start', what='System creates draft.', who='System'),
        S('Pull approved DCR expenses for month', 'proc', what='Aggregate daily lines.', who='System', api='miscellaneous-expense/'),
        S('Add fixed allowance from Expense Template', 'proc', what='Template-based heads.', who='System'),
        S('MR reviews line items + total', 'proc', what='Verify before submit.', who='MR'),
        S('MR SUBMITS — Pending', 'proc', what='Send for approval.', who='MR'),
        S('Manager reviews Expense Approval', 'proc', what='Approval queue.', who='Manager', api='miscellaneous-expense/pending/'),
        S('Manager APPROVES', 'proc', what='Sign-off.', who='Manager'),
        S('Forwarded to accounts for payment', 'proc', what='Finance handoff.', who='Accounts'),
        S('Visible in Expense Summary reports', 'end', what='Read-only reports.', who='Admin', example='₹13,500 total'),
    ],
))

# ── 14 Stock ─────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '14-Stock-Statement', '14 — Stock Statement',
    'Monthly chemist stock survey — drives secondary sales analysis.',
    [
        S('Month end — MR visits chemists', 'start', what='Collect stock data.', who='MR'),
        S('Collect stock count per product', 'proc', what='SKU-level figures.', who='MR'),
        S('Enter opening, purchase, sales, closing', 'proc', what='Four quantity fields.', who='MR', api='stockStatement/detail/'),
        S('SUBMIT Stock Statement per retailer', 'proc', what='Lock statement.', who='MR'),
        S('Statement LOCKED after submission', 'proc', what='No edit until unlock.', who='System'),
        S('Data → Monthly Sales Summary + Trend', 'proc', what='Report aggregation.', who='System'),
        S('If error: MR requests Unlock', 'proc', what='Correction workflow.', who='MR', api='stockStatement/unlock-request'),
        S('Admin approves unlock', 'proc', what='Unlock gate.', who='Admin'),
        S('MR corrects — revised sales analysis', 'end', what='Updated figures.', who='MR'),
    ],
))

# ── 15 Doctor Onboarding ─────────────────────────────────────────────────────
diagrams.append(build_page(
    '15-Doctor-Onboarding', '15 — Doctor Onboarding',
    'New HCP registration: request → approval → master → available in DCR.',
    [
        S('MR meets new doctor not in system', 'start', what='Discovery in field.', who='MR'),
        S('Open Doctor Creation Request', 'proc', what='New doctor form.', who='MR', api='#/app/doctor-creation-request'),
        S('Enter name, specialty, route, mobile...', 'proc', what='Required HCP fields.', who='MR'),
        S('SUBMIT — status Pending', 'proc', what='Await approval.', who='MR'),
        S('Manager/Admin opens Doctor Approval', 'proc', what='Review queue.', who='Manager', api='doctor/doctor-approval'),
        S('Review submitted details', 'proc', what='Verify data quality.', who='Approver'),
        S('Approve or Reject?', 'dec', what='Decision gate.', who='Approver'),
        S('Create Doctor Master — doctorId assigned', 'proc', what='Permanent record.', who='System', data='33730 doctors total'),
        S('Optional: Doctor MR Linking', 'proc', what='Assign to MR.', who='Admin', api='doctor/mrLinking'),
        S('Doctor in Weekly Plan and DCR lists', 'end', what='Available for calls.', who='MR'),
    ],
))

# ── 16 Retailer Onboarding ───────────────────────────────────────────────────
diagrams.append(build_page(
    '16-Retailer-Onboarding', '16 — Retailer Onboarding',
    'New chemist registration — same approval pattern as doctor.',
    [
        S('MR discovers new chemist', 'start', what='Field discovery.', who='MR'),
        S('Submit Retailer Creation Request', 'proc', what='New retailer form.', who='MR', api='#/app/retailer-creation-request'),
        S('Enter shop name, route, contact, GST', 'proc', what='Trade details.', who='MR'),
        S('SUBMIT — Pending', 'proc', what='Await approval.', who='MR'),
        S('Admin reviews Retailer Approval', 'proc', what='Approval queue.', who='Admin', api='retailer/pending'),
        S('Admin APPROVES', 'proc', what='Create master.', who='Admin'),
        S('Retailer Master — retailerId + code', 'proc', what='Permanent record.', who='System', example='NeZU1823'),
        S('Available for DCR, POB, Stock Statement', 'end', what='Usable in transactions.', who='MR', data='40260 retailers'),
    ],
))

# ── 17 Approval Pattern ──────────────────────────────────────────────────────
diagrams.append(build_page(
    '17-Approval-Pattern', '17 — Universal Approval Pattern',
    'Same state machine for all 15 approval queues in the system.',
    [
        S('Employee creates record — DRAFT', 'start', what='Initial editable state.', who='Employee'),
        S('Complete all required fields', 'proc', what='Validation pass.', who='Employee'),
        S('Click SUBMIT — SUBMITTED', 'proc', what='User commits record.', who='Employee'),
        S('System sets status PENDING', 'proc', what='Await approver.', who='System'),
        S('Notification sent to approver', 'proc', what='Bell + push alert.', who='System'),
        S('Approver opens approval queue', 'proc', what='Correct queue screen.', who='Manager/Admin'),
        S('Approver reviews record details', 'proc', what='Full record view.', who='Approver'),
        S('Approve or Reject?', 'dec', what='Decision.', who='Approver'),
        S('APPROVED → LOCKED', 'proc', what='Record immutable.', who='System'),
        S('REJECTED → notify employee', 'proc', what='Revise and resubmit.', who='System'),
        S('Unlock Request if edit needed', 'proc', what='Post-lock correction.', who='Employee'),
        S('Unlock approved → edit → resubmit', 'end', what='Loop back to submit.', who='Employee'),
    ],
))

# ── 18 Approval Queues ───────────────────────────────────────────────────────
diagrams.append(build_page(
    '18-All-Approval-Queues', '18 — All 15 Approval Queues',
    'Each transaction type has dedicated approval screen with pending badge.',
    [
        S('Employee submits transaction', 'start', what='DCR, Leave, RTP, etc.', who='Employee'),
        S('System routes to correct queue', 'proc', what='Type-based routing.', who='System'),
        S('Pending record + count badge', 'proc', what='Sidebar badge update.', who='UI', data='DCR=1512 · Leave=113'),
        S('Approver opens Approval module', 'proc', what='Left sidebar section.', who='Manager'),
        S('Select queue (e.g. DCR Approval)', 'proc', what='Pick pending type.', who='Approver'),
        S('Apply filters: date, employee, HQ', 'proc', what='Narrow list.', who='Approver'),
        S('Open individual pending record', 'proc', what='Detail view.', who='Approver'),
        S('Click APPROVE ✓ or REJECT ✗', 'proc', what='Decision + optional comment.', who='Approver'),
        S('Status updated — notify submitter', 'proc', what='Notification sent.', who='System'),
        S('Record removed from queue', 'end', what='Count decreases.', who='System'),
    ],
))

# ── 19 Reports ───────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '19-Report-Generation', '19 — Report Generation',
    '60 read-only reports — filter → API → grid → optional Excel/PDF export.',
    [
        S('Open Report from sidebar', 'start', what='Pick report type.', who='User', example='DCR Summary'),
        S('Set filters: date, employee, HQ...', 'proc', what='Report parameters.', who='User'),
        S('Click Generate / Search', 'proc', what='Trigger query.', who='User'),
        S('GET api/report/{name} with filters', 'proc', what='Server aggregation.', who='Client', api='GET api/report/*'),
        S('Server runs aggregation query', 'proc', what='SQL over transactions.', who='Server'),
        S('Results as JSON array', 'proc', what='Data payload.', who='Server'),
        S('DevExtreme grid/chart renders', 'proc', what='UI display.', who='Browser'),
        S('User sorts and filters columns', 'proc', what='Interactive analysis.', who='User'),
        S('Optional: Export Excel or PDF', 'proc', what='Download.', who='User', data='CanPrint permission'),
        S('Read-only — no data modified', 'end', what='Reports never write.', who='System'),
    ],
))

# ── 20 Target ────────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '20-Target-Achievement', '20 — Target vs Achievement',
    'Admin sets targets — actuals from DCR calls and POB orders.',
    [
        S('Admin opens Monthly Target', 'start', what='Target entry screen.', who='Admin', api='#/app/monthlyTarget'),
        S('Select month, year, employee/HQ', 'proc', what='Target scope.', who='Admin'),
        S('Set call targets per MR', 'proc', what='Visit goals.', who='Admin'),
        S('Set POB value targets per MR', 'proc', what='Sales goals.', who='Admin'),
        S('Set product-wise quantity targets', 'proc', what='SKU goals.', who='Admin'),
        S('Save targets to database', 'proc', what='Persist.', who='Admin', api='monthly-target/employee-target/'),
        S('MR works month — DCR + POB daily', 'proc', what='Actual accumulation.', who='MR'),
        S('Month end: calculate actuals', 'proc', what='System aggregation.', who='System'),
        S('Target Achievement Report shows %', 'proc', what='Performance report.', who='Manager'),
        S('Dashboard targetVsAchievement widget', 'end', what='Live KPI widget.', who='All', api='dashboard/targetVsAchievement/'),
    ],
))

# ── 21 Notifications ─────────────────────────────────────────────────────────
diagrams.append(build_page(
    '21-Notifications', '21 — Notifications',
    'Alerts on every submit, approve, reject — web bell + mobile Firebase push.',
    [
        S('Business event occurs', 'start', what='Submit / approve / reject.', who='System'),
        S('Create notification record', 'proc', what='DB insert.', who='Server'),
        S('Set title, message, target URL', 'proc', what='Notification content.', who='Server'),
        S('Link to relevant screen', 'proc', what='Deep link.', who='Server', example='#/app/dcrRecord/approval/admin'),
        S('Increment unread bell count', 'proc', what='UI badge.', who='Client'),
        S('Firebase push to mobile', 'proc', what='FCM delivery.', who='Server', data='employee.PushToken'),
        S('User clicks bell icon', 'proc', what='Open list.', who='User'),
        S('Click item — navigate to screen', 'proc', what='Follow deep link.', who='User'),
        S('Mark read via notification/read', 'end', what='Clear unread.', who='User', api='notification/read'),
    ],
))

# ── 22 Login As ──────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '22-Login-As-Employee', '22 — Admin Login-As-Employee',
    'Admin impersonation for support — audit required in clone.',
    [
        S('Admin logged in (roleType AD)', 'start', what='Admin session active.', who='Admin', data='empId 2'),
        S('Open Employee Master / impersonation', 'proc', what='Pick target user.', who='Admin'),
        S('Search and select target employee', 'proc', what='Find MR/Manager.', who='Admin'),
        S('Call loginAsDifferentUser API', 'proc', what='Impersonation request.', who='Admin'),
        S('New JWT for target employee', 'proc', what='Switched identity.', who='Server'),
        S('Store parent in LoginASDifferentUser', 'proc', what='Restore pointer.', who='Browser', data='localStorage'),
        S('Page reload — target menus + data scope', 'proc', what='See as employee.', who='Admin'),
        S('Admin investigates as that employee', 'proc', what='Debug / verify.', who='Admin'),
        S('Back to Admin Login — restore JWT', 'end', what='Return to admin.', who='Admin'),
    ],
))

# ── 24 Planning ──────────────────────────────────────────────────────────────
diagrams.append(build_page(
    '24-Planning-Modules', '24 — Planning Modules',
    'Advanced planning: Infiltration, Pool, Focused Activity, Input Sales Plan.',
    [
        S('Identify planning requirement', 'start', what='Strategic need.', who='MR/Manager'),
        S('Open planning module', 'proc', what='Pick module.', who='User', data='4 module types'),
        S('Enter plan: products, targets, dates', 'proc', what='Plan details.', who='User'),
        S('SUBMIT — Pending', 'proc', what='Await approval.', who='User'),
        S('Manager/HO reviews Approval screen', 'proc', what='Module-specific queue.', who='Manager'),
        S('APPROVED — plan active', 'proc', what='Execution period starts.', who='System'),
        S('MR executes — logged in DCR', 'proc', what='Field execution.', who='MR'),
        S('Tracked in Focused Activity reports', 'end', what='Performance tracking.', who='Manager'),
    ],
))

# ── 25 Bulk Upload ───────────────────────────────────────────────────────────
diagrams.append(build_page(
    '25-Bulk-Upload', '25 — Bulk Upload',
    'Mass import via Excel — 7 entity types with row validation.',
    [
        S('Admin opens Bulk Upload screen', 'start', what='Pick upload type.', who='Admin', example='#/app/bulkDoctorUpload'),
        S('Download Excel template', 'proc', what='Required columns.', who='Admin'),
        S('Fill Excel offline', 'proc', what='Data entry.', who='Admin'),
        S('Click Upload File', 'proc', what='Select file.', who='Admin'),
        S('Server validates each row', 'proc', what='FK + required + duplicate.', who='Server', api='*/bulkUpload'),
        S('Valid rows inserted/updated', 'proc', what='DB write.', who='Server'),
        S('Invalid rows in error report', 'proc', what='Row-level errors.', who='Server'),
        S('Review success/error counts', 'proc', what='Summary message.', who='Admin', example='195 ok · 5 errors'),
        S('Fix errors and re-upload', 'end', what='Iterate until clean.', who='Admin'),
    ],
))


# ── 23 Class Diagram ─────────────────────────────────────────────────────────
def build_class():
    entities = [
        ('① Company', 40, 88, 175, ['compCode: SYN', 'compName', 'compAddress'],
         fmt_note(what='Tenant root.', who='Admin', data='1 company · compCode SYN')),
        ('② Employee', 40, 200, 200, ['empId, userName', 'roleType AD/MAN/FS', 'headQuaterId', 'reportingManager'],
         fmt_note(what='System user.', who='All roles', data='533 employees', example='Vibhav Gupta · FS')),
        ('③ HeadQuarter', 40, 340, 185, ['headQuaterId', 'headQuaterName', 'stateId, cityId'],
         fmt_note(what='Territory unit.', who='Admin', data='155 HQs', example='Satna')),
        ('④ Route', 40, 470, 185, ['routeId', 'routeName', 'headQuaterId', 'routeType'],
         fmt_note(what='Daily beat.', who='Admin', data='2973 routes')),
        ('⑤ Doctor', 40, 600, 185, ['doctorId', 'fullName', 'routeId', 'speciality', 'grade'],
         fmt_note(what='HCP master.', who='MR', data='33730 doctors', example='Dr. Tripathi')),
        ('⑥ Retailer', 40, 730, 185, ['retailerId', 'shopName', 'routeId', 'code'],
         fmt_note(what='Chemist master.', who='MR', data='40260 retailers', example='ZULFI MEDICAL2')),
        ('⑦ Product', 40, 860, 185, ['productId', 'productName', 'mrp', 'brandId', 'allowSample'],
         fmt_note(what='SKU catalog.', who='Admin', data='266 products', example='ACENOVA SR PLUS')),
        ('⑧ DCR', 40, 990, 185, ['dcrId', 'empId', 'date', 'workType', 'status'],
         fmt_note(what='Daily call report.', who='MR', api='dcr/*', data='1512 pending')),
        ('⑨ DCRDoctorVisit', 40, 1120, 200, ['visitId', 'dcrId', 'doctorId', 'detailing[]', 'samples[]'],
         fmt_note(what='Doctor visit lines.', who='MR', data='Child of DCR')),
        ('⑩ POB', 40, 1260, 175, ['pobId', 'empId', 'partyId', 'amount'],
         fmt_note(what='Order booking.', who='MR', api='pob/*')),
        ('⑪ TourProgramme', 40, 1380, 195, ['rtpId', 'empId', 'month', 'dailyRoutes[]', 'status'],
         fmt_note(what='Monthly tour plan.', who='MR', api='monthly-rtp/*')),
    ]
    rels = [
        ('① Company', '② Employee', '1:N'),
        ('③ HeadQuarter', '④ Route', '1:N'),
        ('④ Route', '⑤ Doctor', '1:N'),
        ('④ Route', '⑥ Retailer', '1:N'),
        ('② Employee', '⑧ DCR', '1:N'),
        ('⑧ DCR', '⑨ DCRDoctorVisit', '1:N'),
        ('⑤ Doctor', '⑨ DCRDoctorVisit', '1:N'),
        ('⑦ Product', '⑨ DCRDoctorVisit', 'detailing'),
        ('② Employee', '⑩ POB', '1:N'),
        ('② Employee', '⑪ TourProgramme', '1:N'),
    ]
    page_h = 1520
    page_w = NOTE_X + NOTE_W + 40
    cells = [
        cell('3', '1', '23 — Class Diagram (Entities + Per-Entity Notes)', 40, 10, 560, 28, TITLE),
        cell('4', '1', 'Each entity has its own explanation. Arrows show FK relationships.', 40, 42, 560, 28, INTRO),
        cell('5', '1', LEGEND_STD + ' | Arrows = relationship direction', 40, 72, page_w - 80, 24, LEGEND),
    ]
    nid, idmap = 20, {}
    for cls in entities:
        nid += 1
        cid = str(nid)
        idmap[cls[0]] = cid
        cells.append(cell(cid, '1', cls[0], cls[1], cls[2], cls[3], 28, CLASS))
        y = 28
        for a in cls[4]:
            nid += 1
            cells.append(cell(str(nid), cid, '+ ' + a, 0, y, cls[3], 22, ATTR))
            y += 22
        nid += 1
        note = cls[5]
        nh = note_height(note)
        cells.append(cell(str(nid), '1', note, NOTE_X, cls[2] - 2, NOTE_W, nh, NOTE))
    for r in rels:
        nid += 1
        cells.append(cell(str(nid), '1', r[2], 0, 0, 0, 0, f'{ARROW};endArrow=block;', edge=1,
                          source=idmap[r[0]], target=idmap[r[1]]))
    body = '\n        '.join(cells)
    return f'''  <diagram id="{uuid.uuid4()}" name="23-Class-Diagram-Entities">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_w}" pageHeight="{page_h}">
      <root><mxCell id="0"/><mxCell id="1" parent="0"/>{body}</root>
    </mxGraphModel>
  </diagram>'''

diagrams.append(build_class())

content = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<mxfile host="app.diagrams.net" modified="2026-06-12T00:00:00.000Z" '
    'agent="synchem-clone-docs" version="22.1.0" type="device">\n'
    + '\n'.join(diagrams) + '\n</mxfile>\n'
)
OUT.write_text(content)

import xml.etree.ElementTree as ET
pages = ET.parse(OUT).getroot().findall('diagram')
text = OUT.read_text()
notes = text.count('▸ What')
print(f'OK: {OUT}')
print(f'Pages: {len(pages)}')
print(f'Size: {OUT.stat().st_size:,} bytes')
print(f'Per-component notes: {notes}')
print(f'Arrow transitions: {text.count("→")}')
