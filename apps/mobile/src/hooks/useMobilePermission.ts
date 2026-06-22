import { useCallback, useEffect, useState } from 'react';
import { hasMenuPermission, type PermissionAction } from '../lib/menu-permissions';

export function useMobilePermission(menuCode: string, action: PermissionAction) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    void hasMenuPermission(menuCode, action).then(setAllowed);
  }, [menuCode, action]);

  const refresh = useCallback(async () => {
    setAllowed(await hasMenuPermission(menuCode, action));
  }, [menuCode, action]);

  return { allowed, refresh };
}
