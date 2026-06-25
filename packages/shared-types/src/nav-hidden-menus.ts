/** Menu codes kept for RBAC but not shown in sidebar navigation. */
export const NAV_HIDDEN_MENU_CODES = new Set<string>([
  'APP01',
  'APP04',
  'MAS11',
  'TRN02',
  'TRN10',
  'TRN21',
  'MASBLK',
  'MASBLK01',
  'MASBLK02',
  'MASBLK03',
  'MASBLK04',
  'MASBLK05',
  'MASBLK06',
  'MASBLK07',
]);

export function isNavVisibleMenu(menuCode: string): boolean {
  return !NAV_HIDDEN_MENU_CODES.has(menuCode);
}
