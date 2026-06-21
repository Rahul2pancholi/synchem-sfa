export interface SeedMenuDefinition {
  menuCode: string;
  menuName: string;
  menuType: string;
  menuUrl: string | null;
  parentCode: string | null;
  sortOrder: number;
}

/** Phase 0 + Phase 1 MVP master menus. */
export const SEED_MENUS: SeedMenuDefinition[] = [
  { menuCode: 'DSH', menuName: 'Dashboard', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 10 },
  { menuCode: 'DSH03', menuName: 'Management Dashboard', menuType: 'T', menuUrl: '#/app/management/dashboard', parentCode: 'DSH', sortOrder: 11 },
  { menuCode: 'DSH02', menuName: 'Manager Dashboard', menuType: 'T', menuUrl: '#/app/manager/dashboard', parentCode: 'DSH', sortOrder: 12 },
  { menuCode: 'DSH01', menuName: 'Field Staff Dashboard', menuType: 'T', menuUrl: '#/app/fieldStaff/dashboard', parentCode: 'DSH', sortOrder: 13 },
  { menuCode: 'MAS', menuName: 'Master Setup', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 20 },
  { menuCode: 'MAS06', menuName: 'Hierarchy Master', menuType: 'T', menuUrl: '#/app/hierachy', parentCode: 'MAS', sortOrder: 21 },
  { menuCode: 'MAS07', menuName: 'Employee Master', menuType: 'T', menuUrl: '#/app/employees', parentCode: 'MAS', sortOrder: 22 },
  { menuCode: 'MAS20102', menuName: 'City Master', menuType: 'T', menuUrl: '#/app/city', parentCode: 'MAS', sortOrder: 23 },
  { menuCode: 'MAS20103', menuName: 'HeadQuarter Master', menuType: 'T', menuUrl: '#/app/headQuarter', parentCode: 'MAS', sortOrder: 24 },
  { menuCode: 'MAS20104', menuName: 'Route Master', menuType: 'T', menuUrl: '#/app/route', parentCode: 'MAS', sortOrder: 25 },
  { menuCode: 'MAS09', menuName: 'Doctor Master', menuType: 'T', menuUrl: '#/app/doctor', parentCode: 'MAS', sortOrder: 26 },
  { menuCode: 'MAS03', menuName: 'Retailer Master', menuType: 'T', menuUrl: '#/app/retailer', parentCode: 'MAS', sortOrder: 27 },
  { menuCode: 'MAS04', menuName: 'Stockist Master', menuType: 'T', menuUrl: '#/app/stockist', parentCode: 'MAS', sortOrder: 28 },
  { menuCode: 'MAS05', menuName: 'Product Master', menuType: 'T', menuUrl: '#/app/product', parentCode: 'MAS', sortOrder: 29 },
  { menuCode: 'MAS19', menuName: 'Brand Master', menuType: 'T', menuUrl: '#/app/brand', parentCode: 'MAS', sortOrder: 30 },
  { menuCode: 'MAS20201', menuName: 'Designation', menuType: 'T', menuUrl: '#/app/designation', parentCode: 'MAS', sortOrder: 31 },
  { menuCode: 'MAS20202', menuName: 'Dosage Master', menuType: 'T', menuUrl: '#/app/dosage', parentCode: 'MAS', sortOrder: 32 },
  { menuCode: 'MAS20206', menuName: 'Product Division', menuType: 'T', menuUrl: '#/app/division', parentCode: 'MAS', sortOrder: 33 },
  { menuCode: 'MAS20209', menuName: 'Specialist Master', menuType: 'T', menuUrl: '#/app/specialist', parentCode: 'MAS', sortOrder: 34 },
  { menuCode: 'MAS20208', menuName: 'Qualification Master', menuType: 'T', menuUrl: '#/app/qualification', parentCode: 'MAS', sortOrder: 35 },
  { menuCode: 'MAS20204', menuName: 'Holiday Master', menuType: 'T', menuUrl: '#/app/holiday', parentCode: 'MAS', sortOrder: 36 },
  { menuCode: 'MAS20203', menuName: 'Expense Head', menuType: 'T', menuUrl: '#/app/expenseHead', parentCode: 'MAS', sortOrder: 37 },
  { menuCode: 'MAS08', menuName: 'Expense Template', menuType: 'T', menuUrl: '#/app/expenseTemplate', parentCode: 'MAS', sortOrder: 38 },
  { menuCode: 'MASBLK', menuName: 'Bulk Upload', menuType: 'T', menuUrl: null, parentCode: 'MAS', sortOrder: 50 },
  { menuCode: 'MASBLK01', menuName: 'Bulk City Upload', menuType: 'T', menuUrl: '#/app/bulkCityUpload', parentCode: 'MASBLK', sortOrder: 51 },
  { menuCode: 'MASBLK02', menuName: 'Bulk HQ Upload', menuType: 'T', menuUrl: '#/app/bulkHQUpload', parentCode: 'MASBLK', sortOrder: 52 },
  { menuCode: 'MASBLK03', menuName: 'Bulk Route Upload', menuType: 'T', menuUrl: '#/app/bulkRouteUpload', parentCode: 'MASBLK', sortOrder: 53 },
  { menuCode: 'MASBLK04', menuName: 'Bulk Doctor Upload', menuType: 'T', menuUrl: '#/app/bulkDoctorUpload', parentCode: 'MASBLK', sortOrder: 54 },
  { menuCode: 'MASBLK05', menuName: 'Bulk Retailer Upload', menuType: 'T', menuUrl: '#/app/bulkRetailerUpload', parentCode: 'MASBLK', sortOrder: 55 },
  { menuCode: 'MASBLK06', menuName: 'Bulk Stockist Upload', menuType: 'T', menuUrl: '#/app/bulkStockistUpload', parentCode: 'MASBLK', sortOrder: 56 },
  { menuCode: 'MASBLK07', menuName: 'Bulk Product Upload', menuType: 'T', menuUrl: '#/app/bulkProductUpload', parentCode: 'MASBLK', sortOrder: 57 },
  { menuCode: 'TRN', menuName: 'Transaction', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 30 },
  { menuCode: 'REP', menuName: 'Reports', menuType: 'R', menuUrl: null, parentCode: null, sortOrder: 40 },
  { menuCode: 'ADM', menuName: 'Admin', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 50 },
  { menuCode: 'SET', menuName: 'Setting', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 60 },
];
