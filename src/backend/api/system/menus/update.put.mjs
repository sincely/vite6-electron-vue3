import { defineEventHandler, readBody } from 'h3';
import {
  findMenuNode,
  flattenMenus,
  menuTree,
  removeMenuNode,
  updateMenuNode,
} from '../../../utils/system-data.mjs';
import { useResponseError, useResponseSuccess } from '../../../utils/response.mjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const flat = flattenMenus(menuTree);
  const current = flat.find((item) => item.id === body.id);
  if (!current) {
    return useResponseError('菜单不存在');
  }

  const nextParentId = Number(body.parentId || 0);
  if (current.parentId !== nextParentId) {
    removeMenuNode(menuTree, [body.id]);
    const nextNode = {
      ...current,
      ...body,
      parentId: nextParentId,
    };
    if (!nextParentId) {
      menuTree.push(nextNode);
    } else {
      const parent = findMenuNode(menuTree, nextParentId);
      if (!parent) {
        return useResponseError('父级菜单不存在');
      }
      if (!parent.children) parent.children = [];
      parent.children.push(nextNode);
    }
  } else {
    updateMenuNode(menuTree, body.id, (item) => ({
      ...item,
      ...body,
      parentId: nextParentId,
    }));
  }

  return useResponseSuccess(true);
});
