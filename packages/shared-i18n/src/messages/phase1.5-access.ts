import type { AppLanguage } from '../locales';

export const PHASE15_MESSAGE_KEYS = [
  'access.role.title',
  'access.role.createTitle',
  'access.role.roleName',
  'access.role.roleType',
  'access.role.active',
  'access.role.employeeCount',
  'access.role.createFailed',
  'access.role.updateFailed',
  'access.role.deactivateFailed',
  'access.permission.title',
  'access.permission.selectRole',
  'access.permission.save',
  'access.permission.saveSuccess',
  'access.permission.saveFailed',
  'access.permission.menuName',
  'access.permission.menuCode',
  'access.permission.canView',
  'access.permission.canAdd',
  'access.permission.canEdit',
  'access.permission.canDelete',
  'access.permission.canPreview',
  'access.permission.canPrint',
  'access.denied.title',
  'access.denied.message',
  'access.denied.back',
] as const;

export type Phase15MessageKey = (typeof PHASE15_MESSAGE_KEYS)[number];

type Phase15Catalog = Record<Phase15MessageKey, string>;

const en: Phase15Catalog = {
  'access.role.title': 'Role Master',
  'access.role.createTitle': 'Create Role',
  'access.role.roleName': 'Role Name',
  'access.role.roleType': 'Role Type',
  'access.role.active': 'Active',
  'access.role.employeeCount': 'Employees',
  'access.role.createFailed': 'Unable to create role',
  'access.role.updateFailed': 'Unable to update role',
  'access.role.deactivateFailed': 'Unable to deactivate role',
  'access.permission.title': 'Role Setting',
  'access.permission.selectRole': 'Select role',
  'access.permission.save': 'Save Permissions',
  'access.permission.saveSuccess': 'Permissions saved',
  'access.permission.saveFailed': 'Unable to save permissions',
  'access.permission.menuName': 'Menu',
  'access.permission.menuCode': 'Code',
  'access.permission.canView': 'View',
  'access.permission.canAdd': 'Add',
  'access.permission.canEdit': 'Edit',
  'access.permission.canDelete': 'Delete',
  'access.permission.canPreview': 'Preview',
  'access.permission.canPrint': 'Print',
  'access.denied.title': 'Access Denied',
  'access.denied.message': 'You do not have permission to view this page.',
  'access.denied.back': 'Go to Dashboard',
};

const hi: Partial<Phase15Catalog> = {
  'access.role.title': 'रोल मास्टर',
  'access.permission.title': 'रोल सेटिंग',
  'access.denied.title': 'पहुंच अस्वीकृत',
};

const hinglish: Partial<Phase15Catalog> = {
  'access.role.title': 'Role Master',
  'access.permission.title': 'Role Setting',
  'access.permission.save': 'Permissions save karo',
  'access.denied.message': 'Is page ko dekhne ki permission nahi hai.',
};

export const PHASE15_MESSAGES = {
  en,
  hi: { ...en, ...hi },
  hinglish: { ...en, ...hinglish },
};
