/**
 * 状态归一化（校验层）
 *
 * 统一各模块重复的 zod 归一化逻辑：
 *   - statusCoerce —— 前端 '1'/'2' 与新表结构 '0'/'1' 的兼容转换
 *   - menuTypeEnum —— 菜单类型 'DIR'/'MENU'/'BUTTON' 与旧 1/2/3 的兼容转换
 *
 * 归一化后交给业务层的只有 '0'/'1' 与 'DIR'/'MENU'/'BUTTON' 两种形态。
 */
import { z } from 'zod'

/**
 * 状态归一化：'2'/'2'/'0'/0 → '0'（禁用），'1'/1 → '1'（启用）
 */
export const statusCoerce = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') {
      return undefined
    }
    if (v === '1' || v === 1 || v === '0' || v === 0) {
      return String(v)
    }
    if (v === '2' || v === 2) {
      return '0'
    } // '2'=禁用 映射到新 schema 的 '0'
    return undefined
  })

/**
 * 菜单类型归一化：兼容 'DIR'/'MENU'/'BUTTON'（新）与 1/2/3（旧）
 */
export const menuTypeEnum = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') {
      return undefined
    }
    const s = String(v).toUpperCase()
    if (['DIR', 'MENU', 'BUTTON'].includes(s)) {
      return s
    }
    if (v === 1 || v === '1') {
      return 'DIR'
    }
    if (v === 2 || v === '2') {
      return 'MENU'
    }
    if (v === 3 || v === '3') {
      return 'BUTTON'
    }
    return undefined
  })
