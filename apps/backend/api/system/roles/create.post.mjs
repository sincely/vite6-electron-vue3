import { defineEventHandler, readBody } from 'h3';
import { createNextId, roleList } from '../../../utils/system-data.mjs';
import { useResponseSuccess } from '../../../utils/response.mjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = createNextId(roleList);

  roleList.unshift({
    id,
    roleName: body.roleName,
    roleCode: body.roleCode,
    sort: body.sort ?? id,
    status: body.status,
    userCount: body.userCount ?? 0,
    permissions: body.permissions || [],
    remark: body.remark || '',
    createTime: '2026-04-16 10:00:00',
  });

  return useResponseSuccess({ id });
});
