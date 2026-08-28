// EditTable 自实现校验引擎的规则原语（纯函数，不依赖组件状态）
// 引擎状态（cellErrors、行标识等）仍留在组件内，这里只提供无副作用的判定逻辑

// 判断值是否为空（false / 0 不算空）
export const isEmpty = (v) =>
  v === undefined ||
  v === null ||
  v === '' ||
  (Array.isArray(v) && v.length === 0)

// 解析 required 规则：既支持列级 required，也支持 rules 内的 required
export const resolveRules = (column) => {
  const list = Array.isArray(column.rules) ? [...column.rules] : []
  if (column.required && !list.some((r) => r.required)) {
    list.unshift({
      required: true,
      message: `请完善${column.label}`,
      trigger: 'change'
    })
  }
  return list
}

// 执行单条规则，返回错误信息（通过则返回 ''）
export const runRule = (rule, value) => {
  if (rule.required) {
    if (isEmpty(value)) return rule.message || '该项为必填'
    // 必填通过；若规则只有 required 则不再跑后续逻辑规则
    if (
      rule.min === undefined &&
      rule.max === undefined &&
      rule.pattern === undefined &&
      typeof rule.validator !== 'function'
    )
      return ''
  } else if (isEmpty(value)) {
    // 非必填且为空 -> 跳过（与 element-plus 行为一致）
    return ''
  }

  if (typeof rule.validator === 'function') {
    let msg = ''
    const done = (e) => {
      if (e)
        msg =
          typeof e === 'string' ? e : e.message || rule.message || '校验不通过'
    }
    // 兼容 callback 风格与直接返回 false / 错误字符串两种写法
    const ret = rule.validator(rule, value, done)
    if (ret === false && !msg) msg = rule.message || '校验不通过'
    if (typeof ret === 'string' && ret) msg = ret
    return msg
  }
  if (rule.min !== undefined) {
    if (rule.type === 'number') {
      if (Number(value) < rule.min)
        return rule.message || `不能小于 ${rule.min}`
    } else if (String(value).length < rule.min) {
      return rule.message || `长度不能少于 ${rule.min}`
    }
  }
  if (rule.max !== undefined) {
    if (rule.type === 'number') {
      if (Number(value) > rule.max)
        return rule.message || `不能大于 ${rule.max}`
    } else if (String(value).length > rule.max) {
      return rule.message || `长度不能超过 ${rule.max}`
    }
  }
  if (rule.pattern && !new RegExp(rule.pattern).test(String(value))) {
    return rule.message || '格式不正确'
  }
  if (rule.type === 'array' && !Array.isArray(value)) {
    return rule.message || '格式不正确'
  }
  return ''
}
