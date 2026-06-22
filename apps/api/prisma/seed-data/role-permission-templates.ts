export interface PermissionFlags {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPreview: boolean;
  canPrint: boolean;
}

const FULL: PermissionFlags = {
  canView: true,
  canAdd: true,
  canEdit: true,
  canDelete: true,
  canPreview: true,
  canPrint: true,
};

const NONE: PermissionFlags = {
  canView: false,
  canAdd: false,
  canEdit: false,
  canDelete: false,
  canPreview: false,
  canPrint: false,
};

/** Field staff — dashboard + transactions only. */
const FS_VIEW_CODES = new Set([
  'DSH',
  'DSH01',
  'TRN',
  'TRN01',
  'TRN03',
  'TRN24',
  'TRN04',
  'TRN09',
  'TRN20',
  'MAS10',
]);

const FS_WRITE_CODES = new Set(['TRN01', 'TRN03', 'TRN24', 'TRN04', 'TRN09', 'TRN20', 'MAS10']);

/** Manager — dashboards, masters (no delete), transactions, reports folder. */
const MAN_VIEW_PREFIXES = ['DSH', 'MAS', 'TRN', 'REP', 'ADM', 'SET', 'APP'];

function viewOnly(): PermissionFlags {
  return { ...NONE, canView: true, canPreview: true };
}

function readWriteNoDelete(): PermissionFlags {
  return {
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canPreview: true,
    canPrint: true,
  };
}

export function templatePermission(
  roleType: 'AD' | 'MAN' | 'FS',
  menuCode: string,
): PermissionFlags {
  if (roleType === 'AD') {
    return FULL;
  }

  if (roleType === 'FS') {
    if (!FS_VIEW_CODES.has(menuCode)) {
      return NONE;
    }
    if (FS_WRITE_CODES.has(menuCode)) {
      return readWriteNoDelete();
    }
    return viewOnly();
  }

  // MAN
  if (menuCode === 'ADM01' || menuCode === 'ADM04' || menuCode === 'ADM05' || menuCode === 'ADM06') {
    return NONE;
  }

  if (MAN_VIEW_PREFIXES.some((prefix) => menuCode === prefix || menuCode.startsWith(prefix))) {
    if (menuCode.startsWith('MAS') && menuCode !== 'MAS') {
      return readWriteNoDelete();
    }
    if (menuCode.startsWith('TRN') && menuCode !== 'TRN') {
      return readWriteNoDelete();
    }
    if (menuCode.startsWith('APP')) {
      return readWriteNoDelete();
    }
    if (menuCode.startsWith('REP')) {
      return { ...viewOnly(), canPrint: true };
    }
    return viewOnly();
  }

  return NONE;
}

export { FULL as ADMIN_FULL_PERMISSIONS, NONE as NO_PERMISSIONS };
