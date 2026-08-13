import { defineEventHandler, readBody } from 'h3';
import {
  createNextId,
  findMenuNode,
  flattenMenus,
  menuTree,
} from '../../../utils/system-data.mjs';
import { useResponseError, useResponseSuccess } from '../../../utils/response.mjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const flat = flattenMenus(menuTree);
  const id = createNextId(flat);
  const menu = {
    id,
    parentId: Number(body.parentId || 0),
    menuType: body.menuType,
    menuName: body.menuName,
    icon: body.icon || '',
    routeName: body.routeName || '',
    path: body.path || '',
    component: body.component || '',
    permission: body.permission || '',
    status: body.status,
    visible: body.visible,
    sort: Number(body.sort || 1),
    remark: body.remark || '',
  };

  if (!menu.parentId) {
    menuTree.push(menu);
  } else {
    const parent = findMenuNode(menuTree, menu.parentId);
    if (!parent) {
      return useResponseError('父级菜单不存在');
    }
    if (!parent.children) parent.children = [];
    parent.children.push(menu);
  }

  return useResponseSuccess({ id });
});
