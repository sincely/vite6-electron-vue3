/**
 * 状态转换（业务层）
 *
 * 供各业务模块复用的状态位转换。
 *
 * 注意：字典模块（sys_dict）使用数字 0/1 与前端 '1'/'2' 语义，
 * 与这里的字符 '0'/'1' 语义不同，因此字典模块保留自己的转换函数，不使用本文件。
 */

/**
 * 前端状态 → DB 状态（'0'/'1'）
 * '0' / '2' / 0 / false → '0'（禁用），其余 → '1'（启用）
 * @param {string|number|boolean|undefined|null} status
 * @returns {'0'|'1'}
 */
export const toDbStatus = (status) => {
  if (status === '0' || status === '2' || Number(status) === 0 || status === false) {
    return '0'
  }
  return '1'
}

/**
 * DB 状态 → 前端状态（'0'/'1'）
 * @param {unknown} status
 * @returns {'0'|'1'}
 */
export const toFrontendStatus = (status) => {
  return String(status) === '1' ? '1' : '0'
}
