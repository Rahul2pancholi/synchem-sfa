export interface SeedMenuDefinition {
  menuCode: string;
  menuName: string;
  menuType: string;
  menuUrl: string | null;
  parentCode: string | null;
  sortOrder: number;
}

/** Phase 0 shell menus — expanded in later phases. */
export const SEED_MENUS: SeedMenuDefinition[] = [
  { menuCode: 'DSH', menuName: 'Dashboard', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 10 },
  {
    menuCode: 'DSH03',
    menuName: 'Management Dashboard',
    menuType: 'T',
    menuUrl: '#/app/management/dashboard',
    parentCode: 'DSH',
    sortOrder: 11,
  },
  {
    menuCode: 'DSH02',
    menuName: 'Manager Dashboard',
    menuType: 'T',
    menuUrl: '#/app/manager/dashboard',
    parentCode: 'DSH',
    sortOrder: 12,
  },
  {
    menuCode: 'DSH01',
    menuName: 'Field Staff Dashboard',
    menuType: 'T',
    menuUrl: '#/app/fieldStaff/dashboard',
    parentCode: 'DSH',
    sortOrder: 13,
  },
  { menuCode: 'MAS', menuName: 'Master Setup', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 20 },
  { menuCode: 'TRN', menuName: 'Transaction', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 30 },
  { menuCode: 'REP', menuName: 'Reports', menuType: 'R', menuUrl: null, parentCode: null, sortOrder: 40 },
  { menuCode: 'ADM', menuName: 'Admin', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 50 },
  { menuCode: 'SET', menuName: 'Setting', menuType: 'T', menuUrl: null, parentCode: null, sortOrder: 60 },
];
