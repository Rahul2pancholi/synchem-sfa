import { Inject, Injectable } from '@nestjs/common';
import type { LegacyMenuItem, MenuTreeItem } from '@synchem-sfa/shared-types';
import {
  apiSuccess,
  filterMenusByTenantFeatures,
  isMenuAllowedByTenantFeatures,
  isNavVisibleMenu,
  pruneEmptyMenuFolders,
} from '@synchem-sfa/shared-types';
import { TenantFeaturesService } from '../tenant/tenant-features.service';
import type { MenuPermissionRecord } from './ports/menu.repository.port';
import { MENU_REPOSITORY, type MenuRepositoryPort } from './ports/menu.repository.port';

@Injectable()
export class MenusService {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepo: MenuRepositoryPort,
    private readonly tenantFeatures: TenantFeaturesService,
  ) {}

  /** All viewable menus for RBAC checks (includes nav-hidden permission codes). */
  private async menusForPermissions(compCode: string, roleId: string): Promise<MenuPermissionRecord[]> {
    const flat = await this.menuRepo.findMenusForRole(compCode, roleId);
    const features = await this.tenantFeatures.getFeatureState(compCode);
    return filterMenusByTenantFeatures(flat, features);
  }

  /** Sidebar navigation only — excludes RBAC-only menus (e.g. APP01). */
  private async menusForNav(compCode: string, roleId: string): Promise<MenuPermissionRecord[]> {
    const flat = await this.menusForPermissions(compCode, roleId);
    return flat.filter((menu) => isNavVisibleMenu(menu.menuCode));
  }

  async getMenuTree(compCode: string, roleId: string) {
    const flat = await this.menusForNav(compCode, roleId);
    const tree = pruneEmptyMenuFolders(this.buildTree(flat));
    return apiSuccess(tree);
  }

  async getLegacyMenuListJson(compCode: string, roleId: string): Promise<string> {
    const flat = await this.menusForNav(compCode, roleId);
    const tree = pruneEmptyMenuFolders(this.buildTree(flat));
    const legacy = tree.map((node, index) => this.toLegacyMenu(node, index + 1));
    return JSON.stringify(legacy);
  }

  /** Flat list for client RBAC — includes nav-hidden codes (APP01, TRN02, …). */
  async getPermissionMenuListJson(compCode: string, roleId: string): Promise<string> {
    const flat = await this.menusForPermissions(compCode, roleId);
    const legacy = flat.map((item, index) => this.toLegacyMenuFromRecord(item, index + 1));
    return JSON.stringify(legacy);
  }

  async getMyMenus(compCode: string, roleId: string) {
    const navFlat = await this.menusForNav(compCode, roleId);
    const tree = pruneEmptyMenuFolders(this.buildTree(navFlat));
    const menuList = JSON.stringify(tree.map((node, index) => this.toLegacyMenu(node, index + 1)));
    const permissionMenuList = await this.getPermissionMenuListJson(compCode, roleId);
    return apiSuccess({ menuList, permissionMenuList, tree });
  }

  async hasPermission(
    compCode: string,
    roleId: string,
    menuCode: string,
    action: 'view' | 'add' | 'edit' | 'delete',
  ): Promise<boolean> {
    const features = await this.tenantFeatures.getFeatureState(compCode);
    if (!isMenuAllowedByTenantFeatures(menuCode, features)) {
      return false;
    }

    const flat = await this.menuRepo.findAllPermissionsForRole(compCode, roleId);
    const menu = flat.find((item) => item.menuCode === menuCode);
    if (!menu) {
      return false;
    }

    switch (action) {
      case 'view':
        return menu.canView;
      case 'add':
        return menu.canAdd;
      case 'edit':
        return menu.canEdit;
      case 'delete':
        return menu.canDelete;
      default:
        return false;
    }
  }

  private buildTree(flat: MenuPermissionRecord[]): MenuTreeItem[] {
    const nodes = new Map<string, MenuTreeItem>();

    for (const item of flat) {
      nodes.set(item.menuId, {
        menuId: item.menuId,
        menuCode: item.menuCode,
        menuName: item.menuName,
        menuUrl: item.menuUrl,
        menuType: item.menuType,
        canView: item.canView,
        canAdd: item.canAdd,
        canEdit: item.canEdit,
        canDelete: item.canDelete,
        canPreview: item.canPreview,
        canPrint: item.canPrint,
        childMenus: [],
      });
    }

    const roots: MenuTreeItem[] = [];

    for (const item of flat) {
      const node = nodes.get(item.menuId)!;
      if (item.parentMenuId && nodes.has(item.parentMenuId)) {
        nodes.get(item.parentMenuId)!.childMenus!.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortNodes = (items: MenuTreeItem[]) => {
      items.sort((a, b) => a.menuCode.localeCompare(b.menuCode));
      for (const item of items) {
        if (item.childMenus?.length) {
          sortNodes(item.childMenus);
        } else {
          item.childMenus = null;
        }
      }
    };

    sortNodes(roots);
    return roots;
  }

  private toLegacyMenuFromRecord(item: MenuPermissionRecord, menuLevel: number): LegacyMenuItem {
    return {
      MenuId: item.menuId,
      MenuCode: item.menuCode,
      MenuName: item.menuName,
      MenuType: item.menuType,
      MenuLevel: menuLevel,
      MenuBehaviour: item.menuUrl ? 'FILE' : 'FOLDER',
      MenuUrl: item.menuUrl,
      CanView: item.canView,
      CanAdd: item.canAdd,
      CanEdit: item.canEdit,
      CanDelete: item.canDelete,
      CanPreview: item.canPreview,
      CanPrint: item.canPrint,
      ChildMenus: null,
    };
  }

  private toLegacyMenu(node: MenuTreeItem, menuLevel: number): LegacyMenuItem {
    const childMenus = node.childMenus?.length
      ? node.childMenus.map((child, index) => this.toLegacyMenu(child, index + 1))
      : null;

    return {
      MenuId: node.menuId,
      MenuCode: node.menuCode,
      MenuName: node.menuName,
      MenuType: node.menuType,
      MenuLevel: menuLevel,
      MenuBehaviour: node.menuUrl ? 'FILE' : 'FOLDER',
      MenuUrl: node.menuUrl,
      CanView: node.canView,
      CanAdd: node.canAdd,
      CanEdit: node.canEdit,
      CanDelete: node.canDelete,
      CanPreview: node.canPreview,
      CanPrint: node.canPrint,
      ChildMenus: childMenus,
    };
  }
}
