import { defineEventHandler, readBody } from 'h3';
import { menuTree, removeMenuNode } from '../../../utils/system-data.mjs';
import { useResponseSuccess } from '../../../utils/response.mjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const ids = Array.isArray(body.ids) ? body.ids : [];

  removeMenuNode(menuTree, ids);

  return useResponseSuccess(true);
});
