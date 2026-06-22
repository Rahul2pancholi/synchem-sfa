/**
 * Salestrip live API endpoints — FE bundle + HAR corrected (Jun 2026).
 * @see data/live-pull/README.md
 */

import {
  MR_EMPLOYEE_BODY,
  STOCKIST_SALES_SUMMARY_BODY,
  STOCKIST_TEAM_BODY,
} from './har-bodies.mjs';

const now = new Date();
const DEFAULT_MONTH = Number(process.env.SALESTRIP_PULL_MONTH ?? now.getMonth() + 1);
const DEFAULT_YEAR = Number(process.env.SALESTRIP_PULL_YEAR ?? now.getFullYear());

export const DEFAULT_ADMIN_EMP_ID = Number(process.env.SALESTRIP_ADMIN_EMP_ID ?? 2);
export const DEFAULT_MR_EMP_ID = Number(process.env.SALESTRIP_MR_EMP_ID ?? 536);
export const DEFAULT_HQ_ID = Number(process.env.SALESTRIP_HQ_ID ?? 0);
export const DEFAULT_STATE_ID = Number(process.env.SALESTRIP_STATE_ID ?? 19);
export const STATE_IDS =
  process.env.SALESTRIP_STATE_IDS ?? '0,7,19,20,27,31,34,32';

/**
 * @typedef {Object} LiveEndpoint
 * @property {string} group
 * @property {string} path
 * @property {string} file
 * @property {'GET'|'POST'} [method]
 * @property {Record<string, unknown>} [body]
 * @property {Record<string, string|number>} [pathParams]
 * @property {Record<string, string|number>} [query]
 * @property {'admin'|'mr'|'any'} [token]
 * @property {string} [note]
 * @property {boolean} [skip]
 */

/** @type {LiveEndpoint[]} */
export const LIVE_PULL_ENDPOINTS = [
  // —— Dashboard (FE-correct paths) ——
  {
    group: 'dashboard',
    path: 'dashboard/upComing-crm/{empId}',
    file: 'upComing-crm-admin',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
  {
    group: 'dashboard',
    path: 'dashboard/upComing-crm/{empId}',
    file: 'upComing-crm-mr',
    pathParams: { empId: DEFAULT_MR_EMP_ID },
    token: 'mr',
  },
  { group: 'dashboard', path: 'dashboard/pending-submittion', file: 'pending-submittion' },
  {
    group: 'dashboard',
    path: 'dashboard/dailyCalls/{empId}/{month}/{year}',
    file: 'dailyCalls-admin',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID, month: DEFAULT_MONTH, year: DEFAULT_YEAR },
  },
  {
    group: 'dashboard',
    path: 'dashboard/dailyCalls/{empId}/{month}/{year}',
    file: 'dailyCalls-mr',
    pathParams: { empId: DEFAULT_MR_EMP_ID, month: DEFAULT_MONTH, year: DEFAULT_YEAR },
    token: 'mr',
  },
  {
    group: 'har',
    path: 'dashboard/fieldstaff/{hqId}/{month}/{year}/{stateId}',
    file: 'fieldstaff-dashboard-full',
    pathParams: {
      hqId: DEFAULT_HQ_ID,
      month: DEFAULT_MONTH,
      year: DEFAULT_YEAR,
      stateId: DEFAULT_STATE_ID,
    },
    note: 'HAR — full MR dashboard bundle (~68KB)',
  },
  {
    group: 'har',
    path: 'dashboard/tourProgram-calendar/{month}/{year}',
    file: 'tourProgram-calendar',
    pathParams: { month: DEFAULT_MONTH, year: DEFAULT_YEAR },
  },
  {
    group: 'har',
    path: 'dashboard/targetVsAchievement/MONTH',
    file: 'targetVsAchievement-MONTH',
  },
  {
    group: 'har',
    path: 'dashboard/targetVsAchievement/QUARTER',
    file: 'targetVsAchievement-QUARTER',
  },
  {
    group: 'har',
    path: 'dashboard/targetVsAchievement/YEAR',
    file: 'targetVsAchievement-YEAR',
  },
  { group: 'dashboard', path: 'dashboard/sampleVsPOB', file: 'sampleVsPOB' },
  {
    group: 'har',
    path: 'dashboard/pendingDoctorFollowUp/0',
    file: 'pendingDoctorFollowUp',
    note: 'FE uses offset 0, not empId',
  },
  { group: 'dashboard', path: 'dashboard/visited-doctor-retailer', file: 'visited-doctor-retailer' },
  {
    group: 'dashboard',
    path: 'dashboard/holiday-calender/{empId}',
    file: 'holiday-calender',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
  {
    group: 'dashboard',
    path: 'dashboard/unreadMessageCount/{empId}',
    file: 'unreadMessageCount',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
  {
    group: 'dashboard',
    path: 'dashboard/birth-anniversary/{empId}',
    file: 'birth-anniversary',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
  {
    group: 'har',
    path: 'dashboard/conversation-message/{empId}/{month}/B',
    file: 'conversation-message-broadcast',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID, month: DEFAULT_MONTH },
  },
  {
    group: 'har',
    path: 'dashboard/conversation-message/{empId}/{month}/C',
    file: 'conversation-message-chat',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID, month: DEFAULT_MONTH },
  },
  {
    group: 'dashboard',
    path: 'dashboard/doctorFollowUpDone',
    file: 'doctorFollowUpDone',
    skip: true,
    note: 'POST mutation — not pulled',
  },
  {
    group: 'dashboard',
    path: 'dashboard/wish-birth-anniversary',
    file: 'wish-birth-anniversary',
    skip: true,
    note: 'POST sends email — not pulled',
  },

  // —— Manager / Management ——
  { group: 'manager-dashboard', path: 'manager-dashboard/pending-count', file: 'pending-count' },
  { group: 'manager-dashboard', path: 'manager-dashboard/employeeWisePOBAmount', file: 'employeeWisePOBAmount' },
  {
    group: 'har',
    path: 'manager-dashboard/{stateId}',
    file: 'manager-dashboard-full',
    pathParams: { stateId: DEFAULT_STATE_ID },
    query: { hqId: DEFAULT_HQ_ID },
    note: 'HAR — full manager widget data',
  },
  {
    group: 'management-dashboard',
    path: 'management-dashboard/top-five-doctorRetailer/{empId}',
    file: 'top-five-doctorRetailer',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
  {
    group: 'har',
    path: 'management-dashboard/top-five-product/{month}/{year}',
    file: 'top-five-product',
    pathParams: { month: DEFAULT_MONTH, year: DEFAULT_YEAR },
  },

  // —— Reports ——
  {
    group: 'reports',
    path: 'report/sales/managerSalesSummary',
    file: 'managerSalesSummary',
    method: 'POST',
    body: { month: DEFAULT_MONTH, year: DEFAULT_YEAR },
  },
  {
    group: 'har',
    path: 'report/stockist/salesSummary/monthly',
    file: 'stockist-salesSummary-monthly',
    method: 'POST',
    body: STOCKIST_SALES_SUMMARY_BODY,
  },

  // —— Users & org ——
  { group: 'users', path: 'users/employee-list', file: 'employee-list' },
  { group: 'users', path: 'users/myTeam/', file: 'myTeam' },
  { group: 'users', path: 'users/headQuater-role/', file: 'headQuater-role' },
  { group: 'hierarchy', path: 'hierachy/reporting/', file: 'hierarchy-reporting' },
  { group: 'roles', path: 'roles', file: 'roles-list' },
  {
    group: 'har',
    path: 'users/mr-employee/',
    file: 'mr-employee',
    method: 'POST',
    body: MR_EMPLOYEE_BODY,
  },
  {
    group: 'har',
    path: 'users/hierarchyTypeWise/MAN,ASM,FS',
    file: 'hierarchyTypeWise-MAN-ASM-FS',
  },
  {
    group: 'har',
    path: 'users/hierarchyTypeWise/MAN,ASM',
    file: 'hierarchyTypeWise-MAN-ASM',
  },
  {
    group: 'har',
    path: 'users/hierarchyTypeWise/FS',
    file: 'hierarchyTypeWise-FS',
  },
  {
    group: 'har',
    path: 'users/hierarchyTypeWise/FS,ASM',
    file: 'hierarchyTypeWise-FS-ASM',
  },
  {
    group: 'har',
    path: 'users/hierarchyTypeWise/FS,MAN,ASM',
    file: 'hierarchyTypeWise-FS-MAN-ASM',
  },

  // —— Doctor ——
  { group: 'doctor', path: 'doctor/fieldStaffWise/', file: 'fieldStaffWise-doctors', token: 'mr' },

  // —— Masters ——
  { group: 'masters', path: 'doctor/doctor-list', file: 'doctor-list' },
  { group: 'masters', path: 'retailer/retailer-list/', file: 'retailer-list' },
  { group: 'masters', path: 'product', file: 'product-list' },
  { group: 'masters', path: 'brand', file: 'brand-list' },
  { group: 'masters', path: 'headquater/active', file: 'headquarter-active' },
  { group: 'masters', path: 'route/routeListAll', file: 'route-list-all' },
  { group: 'masters', path: 'stockist/stockist-list/', file: 'stockist-list' },
  { group: 'masters', path: 'city/state', file: 'city-state' },
  { group: 'masters', path: 'designation', file: 'designation-list' },
  { group: 'masters', path: 'division', file: 'division-list' },
  { group: 'masters', path: 'specialist', file: 'specialist-list' },
  { group: 'masters', path: 'qualification', file: 'qualification-list' },
  { group: 'masters', path: 'packingType', file: 'packingType-list' },
  { group: 'masters', path: 'holiday', file: 'holiday-list' },
  { group: 'masters', path: 'visitPurpose', file: 'visitPurpose-list' },
  {
    group: 'har',
    path: 'headquater/state/{stateIds}/false',
    file: 'headquarter-by-states',
    pathParams: { stateIds: STATE_IDS },
  },
  {
    group: 'har',
    path: 'product/type/1/0/0',
    file: 'product-type-1',
  },
  {
    group: 'har',
    path: 'stockist/team',
    file: 'stockist-team',
    method: 'POST',
    body: STOCKIST_TEAM_BODY,
  },

  // —— Transactions ——
  { group: 'transactions', path: 'dcr/common-lov', file: 'dcr-common-lov' },
  { group: 'transactions', path: 'leave/leaveType', file: 'leave-type' },
  {
    group: 'transactions',
    path: 'notification/viewmore/{empId}/{pageNo}/{pageSize}',
    file: 'notifications-page1',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID, pageNo: 1, pageSize: 20 },
  },
  {
    group: 'har',
    path: 'notification/{empId}/{pageSize}',
    file: 'notifications-header',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID, pageSize: 10 },
  },
  {
    group: 'transactions',
    path: 'managerDailyReport/managerEmpCommonData',
    file: 'managerEmpCommonData',
    method: 'POST',
    body: { empId: DEFAULT_MR_EMP_ID },
  },
  {
    group: 'transactions',
    path: 'monthly-rtp/manager',
    file: 'monthly-rtp-manager',
    method: 'POST',
    body: { month: DEFAULT_MONTH, year: DEFAULT_YEAR, approveStatus: 'APPROVED' },
  },
  {
    group: 'har',
    path: 'monthly-rtp/emp//0/0',
    file: 'monthly-rtp-emp-list',
    note: 'HAR exact path (double slash)',
  },

  // —— HAR: approval / pending queues ——
  { group: 'har', path: 'doctor/pending', file: 'doctor-pending' },
  { group: 'har', path: 'doctor/pending/deactivateRequest', file: 'doctor-pending-deactivate' },
  { group: 'har', path: 'retailer/pending', file: 'retailer-pending' },
  { group: 'har', path: 'weeklyPlan/pending', file: 'weeklyPlan-pending' },
  { group: 'har', path: 'unlockDCR/pending', file: 'unlockDCR-pending' },
  { group: 'har', path: 'input-salesPlan/pending/U', file: 'input-salesPlan-pending' },
  { group: 'har', path: 'managerDayAllocation/pending', file: 'managerDayAllocation-pending' },
  {
    group: 'har',
    path: 'leave/status/U/{empId}',
    file: 'leave-status-unapproved',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
    query: { fromDate: '5/24/2026', toDate: '6/22/2026' },
    note: 'HAR date range — adjust via env if needed',
  },

  // —— HAR: comms ——
  { group: 'har', path: 'mailBox/count-mail', file: 'mailbox-count' },
  {
    group: 'har',
    path: 'message/count/{empId}',
    file: 'message-count',
    pathParams: { empId: DEFAULT_ADMIN_EMP_ID },
  },
];

export const LIVE_PULL_QUICK_GROUPS = new Set([
  'dashboard',
  'manager-dashboard',
  'management-dashboard',
  'reports',
  'users',
  'hierarchy',
  'roles',
  'doctor',
  'har',
]);

export function resolvePath(template, pathParams = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = pathParams[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path param {${key}} for ${template}`);
    }
    return String(value);
  });
}
