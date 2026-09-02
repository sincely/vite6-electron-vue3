// EditTable 列配置解析与展示格式化工具（纯函数，不依赖组件状态）

// 解析列级 componentProps：支持对象或按行求值的函数（联动场景按 row 计算 disabled 等）
export const resolveComponentProps = (column, row) => {
  if (typeof column.componentProps === 'function') {
    return column.componentProps(row) || {}
  }
  return column.componentProps || {}
}

// 获取编辑组件的 props（排除 options，避免与手动渲染的选项冲突）
export const getEditProps = (column, row) => {
  const { options, ...rest } = resolveComponentProps(column, row)
  return rest
}

// 获取列选项：支持静态数组，或按行返回数组的函数（省市区等联动）
export const getColumnOptions = (column, row) => {
  if (typeof column.options === 'function') return column.options(row) || []
  return column.options || resolveComponentProps(column, row).options || []
}

// 占位符：componentProps 为函数时按行求值
export const getPlaceholder = (column, row, action = '输入') => {
  return (
    resolveComponentProps(column, row).placeholder || `${action}${column.label}`
  )
}

// 金额格式化：千分位 + 固定小数位，prefix/decimals/thousand 可通过 componentProps 定制
export const formatMoney = (value, opts = {}) => {
  const { prefix = '￥', decimals = 2, thousand = true } = opts
  const num = Number(value)
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number.isNaN(num)
  ) {
    return value ?? ''
  }
  const fixed = Math.abs(num).toFixed(decimals)
  const [int, dec] = fixed.split('.')
  const intStr = thousand ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : int
  return `${num < 0 ? '-' : ''}${prefix}${intStr}${dec ? `.${dec}` : ''}`
}

// 格式化非编辑状态下的显示值
export const formatDisplayValue = (row, column) => {
  const value = row[column.prop]
  if (value === null || value === undefined || value === '') return '-'

  // 金额列：千分位展示
  if (column.type === 'money') {
    return formatMoney(value, resolveComponentProps(column, row))
  }

  // 处理 Select / Radio (从 options 中找 label)
  if (
    column.type === 'select' ||
    column.type === 'radio' ||
    column.type === 'radio-group'
  ) {
    const options = getColumnOptions(column, row)
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  // 处理 Checkbox / CheckboxGroup (数组转 label 拼接)
  if (
    column.type === 'checkbox' ||
    ['checkbox-group', 'check-box-group', 'check-bo-groub'].includes(
      column.type
    )
  ) {
    if (Array.isArray(value)) {
      const options = getColumnOptions(column, row)
      const labels = value.map((val) => {
        const option = options.find((opt) => opt.value === val)
        return option ? option.label : val
      })
      return labels.join(', ')
    }
    return value ? '是' : '否'
  }

  if (column.type === 'switch') {
    return value ? '是' : '否'
  }

  // 处理日期范围 (数组转字符串拼接)
  if (
    column.type === 'daterange' ||
    column.type === 'datetimerange' ||
    column.type === 'monthrange'
  ) {
    if (Array.isArray(value) && value.length === 2) {
      const separator =
        resolveComponentProps(column, row).rangeSeparator || ' 至 '
      return `${value[0]}${separator}${value[1]}`
    }
  }

  return value
}
