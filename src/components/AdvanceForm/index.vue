<template>
  <el-form
    ref="formRef"
    v-bind="formBind"
    :model="localModel"
    :rules="mergedRules"
  >
    <el-row v-if="useGrid" v-bind="rowProps">
      <template v-for="item in visibleSchemas" :key="item.prop || item.label">
        <el-col v-bind="getColProps(item)">
          <el-form-item v-bind="getFormItemProps(item)">
            <template v-if="item.labelSlot" #label>
              <slot :name="item.labelSlot" :item="item" :model="localModel" />
            </template>

            <slot
              v-if="item.slot"
              :name="item.slot"
              :item="item"
              :model="localModel"
            />

            <el-input
              v-else-if="isInput(item)"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :type="item.type === 'textarea' ? 'textarea' : item.inputType"
              :placeholder="getPlaceholder(item)"
              clearable
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-input-number
              v-else-if="normalizeType(item.type) === 'number'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :placeholder="getPlaceholder(item)"
              style="width: 100%"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-select
              v-else-if="normalizeType(item.type) === 'select'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :placeholder="getPlaceholder(item)"
              clearable
              @update:model-value="setFieldValue(item.prop, $event)"
            >
              <el-option
                v-for="opt in getOptions(item)"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.disabled"
              />
            </el-select>

            <el-switch
              v-else-if="normalizeType(item.type) === 'switch'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-checkbox-group
              v-else-if="isCheckboxGroup(item)"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            >
              <el-checkbox
                v-for="opt in getOptions(item)"
                :key="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>

            <el-radio-group
              v-else-if="isRadioGroup(item)"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            >
              <el-radio
                v-for="opt in getOptions(item)"
                :key="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>

            <el-date-picker
              v-else-if="isDateType(item)"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :type="normalizeType(item.type)"
              :placeholder="getPlaceholder(item)"
              clearable
              style="width: 100%"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-time-picker
              v-else-if="isTimeType(item)"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :is-range="normalizeType(item.type) === 'timerange'"
              :placeholder="getPlaceholder(item)"
              clearable
              style="width: 100%"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-cascader
              v-else-if="normalizeType(item.type) === 'cascader'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :options="getOptions(item)"
              :placeholder="getPlaceholder(item)"
              clearable
              style="width: 100%"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-tree-select
              v-else-if="normalizeType(item.type) === 'tree-select'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :data="getOptions(item)"
              :placeholder="getPlaceholder(item)"
              clearable
              style="width: 100%"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-slider
              v-else-if="normalizeType(item.type) === 'slider'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-rate
              v-else-if="normalizeType(item.type) === 'rate'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-color-picker
              v-else-if="normalizeType(item.type) === 'color'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-transfer
              v-else-if="normalizeType(item.type) === 'transfer'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :data="getOptions(item)"
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-autocomplete
              v-else-if="normalizeType(item.type) === 'autocomplete'"
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :placeholder="getPlaceholder(item)"
              clearable
              @update:model-value="setFieldValue(item.prop, $event)"
            />

            <el-input
              v-else
              :model-value="getFieldValue(item.prop)"
              v-bind="getComponentProps(item)"
              :placeholder="getPlaceholder(item)"
              clearable
              @update:model-value="setFieldValue(item.prop, $event)"
            />
          </el-form-item>
        </el-col>
      </template>
    </el-row>

    <template v-else>
      <el-form-item
        v-for="item in visibleSchemas"
        :key="item.prop || item.label"
        v-bind="getFormItemProps(item)"
      >
        <slot
          v-if="item.slot"
          :name="item.slot"
          :item="item"
          :model="localModel"
        />
        <el-input
          v-else
          :model-value="getFieldValue(item.prop)"
          v-bind="getComponentProps(item)"
          :placeholder="getPlaceholder(item)"
          clearable
          @update:model-value="setFieldValue(item.prop, $event)"
        />
      </el-form-item>
    </template>

    <slot name="actions" :model="localModel" :validate="validate" />
  </el-form>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  schemas: {
    type: Array,
    default: () => []
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  formProps: {
    type: Object,
    default: () => ({})
  },
  formItemProps: {
    type: Object,
    default: () => ({})
  },
  rowProps: {
    type: Object,
    default: () => ({ gutter: 16 })
  },
  colProps: {
    type: Object,
    default: () => ({ span: 8 })
  },
  useGrid: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'change'])

const attrs = useAttrs()
const formRef = ref(null)
const localModel = ref({})

const formBind = computed(() => ({
  ...props.formProps,
  ...attrs
}))

const visibleSchemas = computed(() => {
  return props.schemas.filter((item) => {
    if (typeof item.hidden === 'function') {
      return !item.hidden(localModel.value, item)
    }
    return !item.hidden
  })
})

const deepClone = (value) => {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    return value
  }
}

const stringify = (value) => {
  try {
    return JSON.stringify(value)
  } catch (error) {
    return ''
  }
}

const getFieldValue = (prop) => {
  return localModel.value?.[prop]
}

const setFieldValue = (prop, value) => {
  if (!localModel.value || typeof localModel.value !== 'object') {
    localModel.value = {}
  }
  localModel.value[prop] = value
}

const mergedRules = computed(() => {
  const baseRules = { ...props.rules }
  props.schemas.forEach((item) => {
    if (item.prop && item.rules) {
      baseRules[item.prop] = item.rules
    }
  })
  return baseRules
})

const normalizeType = (type) => (type || 'input').toLowerCase()

const isInput = (item) => {
  const type = normalizeType(item.type)
  return ['input', 'textarea', 'password'].includes(type)
}

const isCheckboxGroup = (item) => {
  const type = normalizeType(item.type)
  return ['checkbox-group', 'check-box-group', 'check-bo-groub'].includes(type)
}

const isRadioGroup = (item) => {
  const type = normalizeType(item.type)
  return ['radio-group', 'radio'].includes(type)
}

const isDateType = (item) => {
  return [
    'date',
    'dates',
    'datetime',
    'week',
    'month',
    'year',
    'daterange',
    'monthrange',
    'datetimerange'
  ].includes(normalizeType(item.type))
}

const isTimeType = (item) => {
  return ['time', 'timerange'].includes(normalizeType(item.type))
}

const getOptions = (item) => {
  return item.options || item.componentProps?.options || []
}

const getComponentProps = (item) => {
  if (!item.componentProps) return {}
  const { options, ...rest } = item.componentProps
  return rest
}

const getColProps = (item) => {
  return {
    ...props.colProps,
    ...(item.colProps || {})
  }
}

const getFormItemProps = (item) => {
  return {
    label: item.label,
    prop: item.prop,
    rules: item.rules,
    required: item.required,
    ...props.formItemProps,
    ...(item.formItemProps || {})
  }
}

const getPlaceholder = (item) => {
  const componentProps = getComponentProps(item)
  if (componentProps.placeholder) return componentProps.placeholder

  const type = normalizeType(item.type)
  if (
    [
      'select',
      'switch',
      'checkbox-group',
      'check-box-group',
      'check-bo-groub',
      'radio-group',
      'radio',
      'date',
      'dates',
      'datetime',
      'week',
      'month',
      'year',
      'daterange',
      'monthrange',
      'datetimerange',
      'time',
      'timerange',
      'cascader',
      'tree-select'
    ].includes(type)
  ) {
    return `请选择${item.label || ''}`
  }
  return `请输入${item.label || ''}`
}

const validate = async (callback) => {
  if (!formRef.value) return false
  const result = await formRef.value.validate(callback)
  return result
}

const validateField = async (props) => {
  if (!formRef.value) return false
  const result = await formRef.value.validateField(props)
  return result
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const clearValidate = (props) => {
  formRef.value?.clearValidate(props)
}

const scrollToField = (prop) => {
  formRef.value?.scrollToField(prop)
}

watch(
  () => props.modelValue,
  (val) => {
    const nextVal = deepClone(val || {})
    if (stringify(nextVal) !== stringify(localModel.value)) {
      localModel.value = nextVal
    }
  },
  { immediate: true, deep: true }
)

watch(
  localModel,
  (val) => {
    const nextVal = deepClone(val || {})
    if (stringify(nextVal) !== stringify(props.modelValue || {})) {
      emit('update:modelValue', nextVal)
    }
    emit('change', nextVal)
  },
  { deep: true }
)

defineExpose({
  formRef,
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
  submit: validate
})
</script>

<style scoped lang="scss">
.el-form {
  width: 100%;
}
</style>
